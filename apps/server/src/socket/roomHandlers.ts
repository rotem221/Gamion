import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  Player,
} from "@gameion/shared";
import { MAX_PLAYERS_PER_ROOM } from "@gameion/shared";
import { roomStore } from "../state/roomStore.js";
import { sessionStore } from "../state/sessionStore.js";
import { generateRoomId } from "../utils/generateRoomId.js";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerRoomHandlers(io: GameServer, socket: GameSocket) {
  socket.on("create_room", (callback) => {
    const roomId = generateRoomId(roomStore.getAllRoomIds());
    roomStore.create(roomId, socket.id);
    socket.join(roomId);
    socket.data.roomId = roomId;
    console.log(`Room ${roomId} created by host ${socket.id}`);
    callback({ ok: true, roomId });
  });

  socket.on("check_room", (data, callback) => {
    const room = roomStore.get(data.roomId);
    if (!room) {
      callback({ ok: false, error: "Room not found" });
    } else {
      callback({ ok: true });
    }
  });

  socket.on("host_rejoin", (data, callback) => {
    const { roomId } = data;
    const room = roomStore.get(roomId);
    if (!room) {
      callback({ ok: false, error: "Room not found" });
      return;
    }

    roomStore.addHost(roomId, socket.id);
    socket.join(roomId);
    socket.data.roomId = roomId;

    console.log(`Host ${socket.id} joined room ${roomId} (${room.hostSocketIds.length} hosts total)`);
    callback({ ok: true, room });
  });

  socket.on("join_room", (data, callback) => {
    const { roomId, name, avatar } = data;

    const room = roomStore.get(roomId);
    if (!room) {
      callback({ ok: false, error: "Room not found" });
      return;
    }

    if (room.players.length >= MAX_PLAYERS_PER_ROOM) {
      callback({ ok: false, error: "Room is full" });
      return;
    }

    if (room.players.some((p) => p.id === socket.id)) {
      callback({ ok: false, error: "Already in room" });
      return;
    }

    const player: Player = {
      id: socket.id,
      name,
      avatar,
      isLeader: room.players.length === 0,
    };

    const updatedRoom = roomStore.addPlayer(roomId, player);
    if (!updatedRoom) {
      callback({ ok: false, error: "Failed to join room" });
      return;
    }

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.playerId = socket.id;

    // Create session token for reconnection
    const token = sessionStore.createToken(roomId, socket.id, socket.id);
    socket.data.sessionToken = token;

    console.log(`Player "${name}" (${socket.id}) joined room ${roomId}${player.isLeader ? " [LEADER]" : ""}`);

    io.to(roomId).emit("room_state", updatedRoom);
    socket.emit("host_list", updatedRoom.hostSocketIds);

    callback({ ok: true, player, token });
  });

  socket.on("rejoin_room", (data, callback) => {
    const { roomId, playerId, token } = data;

    const room = roomStore.get(roomId);
    if (!room) {
      callback({ ok: false, error: "Room not found" });
      return;
    }

    if (!sessionStore.verify(roomId, playerId, token)) {
      callback({ ok: false, error: "Invalid session token" });
      return;
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      callback({ ok: false, error: "Player not found in room" });
      return;
    }

    // Update the player's socket ID to the new connection
    player.id = socket.id;
    sessionStore.updateSocketId(playerId, socket.id);

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.playerId = socket.id;

    const newToken = sessionStore.createToken(roomId, socket.id, socket.id);
    socket.data.sessionToken = newToken;

    console.log(`Player "${player.name}" reconnected to room ${roomId} (old: ${playerId}, new: ${socket.id})`);

    io.to(roomId).emit("room_state", room);
    socket.emit("host_list", room.hostSocketIds);

    callback({ ok: true, player });
  });

  socket.on("leave_room", (data) => {
    const { roomId } = data;
    handleLeave(io, socket, roomId);
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      handleLeave(io, socket, roomId);
    }
  });
}

function handleLeave(io: GameServer, socket: GameSocket, roomId: string) {
  const room = roomStore.get(roomId);
  if (!room) return;

  if (room.hostSocketIds.includes(socket.id)) {
    roomStore.removeHost(roomId, socket.id);
    socket.leave(roomId);
    console.log(`Host ${socket.id} disconnected from room ${roomId} (${room.hostSocketIds.length} hosts remain)`);

    if (room.players.length === 0 && room.hostSocketIds.length === 0) {
      roomStore.delete(roomId);
      sessionStore.removeRoom(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    }
    return;
  }

  sessionStore.removePlayer(socket.id);
  const updatedRoom = roomStore.removePlayer(roomId, socket.id);
  socket.leave(roomId);

  if (!updatedRoom) return;

  if (updatedRoom.players.length === 0 && updatedRoom.hostSocketIds.length === 0) {
    roomStore.delete(roomId);
    sessionStore.removeRoom(roomId);
    console.log(`Room ${roomId} deleted (empty)`);
    return;
  }

  console.log(`Player ${socket.id} left room ${roomId}`);
  io.to(roomId).emit("room_state", updatedRoom);
}
