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
  socket.on("create_room", async (callback) => {
    const existingIds = await roomStore.getAllRoomIds();
    const roomId = generateRoomId(existingIds);
    await roomStore.create(roomId, socket.id);
    socket.join(roomId);
    socket.data.roomId = roomId;
    console.log(`Room ${roomId} created by host ${socket.id}`);
    callback({ ok: true, roomId });
  });

  socket.on("check_room", async (data, callback) => {
    const room = await roomStore.get(data.roomId);
    if (!room) {
      callback({ ok: false, error: "Room not found" });
    } else {
      callback({ ok: true });
    }
  });

  socket.on("host_rejoin", async (data, callback) => {
    const { roomId } = data;
    const room = await roomStore.get(roomId);
    if (!room) {
      callback({ ok: false, error: "Room not found" });
      return;
    }

    const updated = await roomStore.addHost(roomId, socket.id);
    socket.join(roomId);
    socket.data.roomId = roomId;

    console.log(`Host ${socket.id} joined room ${roomId} (${updated?.hostSocketIds.length ?? 0} hosts total)`);
    callback({ ok: true, room: updated ?? room });
  });

  socket.on("join_room", async (data, callback) => {
    const { roomId, name, avatar } = data;

    const room = await roomStore.get(roomId);
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

    // Sanitize inputs
    const safeName = sanitize(name).slice(0, 20);

    const player: Player = {
      id: socket.id,
      name: safeName,
      avatar,
      isLeader: room.players.length === 0,
    };

    const updatedRoom = await roomStore.addPlayer(roomId, player);
    if (!updatedRoom) {
      callback({ ok: false, error: "Failed to join room" });
      return;
    }

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.playerId = socket.id;

    const token = await sessionStore.createToken(roomId, socket.id, socket.id);
    socket.data.sessionToken = token;

    console.log(`Player "${safeName}" (${socket.id}) joined room ${roomId}${player.isLeader ? " [LEADER]" : ""}`);

    io.to(roomId).emit("room_state", updatedRoom);
    socket.emit("host_list", updatedRoom.hostSocketIds);

    callback({ ok: true, player, token });
  });

  socket.on("rejoin_room", async (data, callback) => {
    const { roomId, playerId, token } = data;

    const room = await roomStore.get(roomId);
    if (!room) {
      callback({ ok: false, error: "Room not found" });
      return;
    }

    const valid = await sessionStore.verify(roomId, playerId, token);
    if (!valid) {
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
    await sessionStore.updateSocketId(playerId, socket.id);

    // Save updated room back to Redis
    await roomStore.save(room);

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.playerId = socket.id;

    const newToken = await sessionStore.createToken(roomId, socket.id, socket.id);
    socket.data.sessionToken = newToken;

    console.log(`Player "${player.name}" reconnected to room ${roomId} (old: ${playerId}, new: ${socket.id})`);

    io.to(roomId).emit("room_state", room);
    socket.emit("host_list", room.hostSocketIds);

    callback({ ok: true, player: { ...player, id: socket.id } });
  });

  socket.on("leave_room", async (data) => {
    const { roomId } = data;
    await handleLeave(io, socket, roomId);
  });

  socket.on("disconnect", async () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      await handleLeave(io, socket, roomId);
    }
  });
}

async function handleLeave(io: GameServer, socket: GameSocket, roomId: string) {
  const room = await roomStore.get(roomId);
  if (!room) return;

  if (room.hostSocketIds.includes(socket.id)) {
    const updated = await roomStore.removeHost(roomId, socket.id);
    socket.leave(roomId);
    console.log(`Host ${socket.id} disconnected from room ${roomId} (${updated?.hostSocketIds.length ?? 0} hosts remain)`);

    if (updated && updated.players.length === 0 && updated.hostSocketIds.length === 0) {
      await roomStore.delete(roomId);
      await sessionStore.removeRoom(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    }
    return;
  }

  await sessionStore.removePlayer(socket.id);
  const updatedRoom = await roomStore.removePlayer(roomId, socket.id);
  socket.leave(roomId);

  if (!updatedRoom) return;

  if (updatedRoom.players.length === 0 && updatedRoom.hostSocketIds.length === 0) {
    await roomStore.delete(roomId);
    await sessionStore.removeRoom(roomId);
    console.log(`Room ${roomId} deleted (empty)`);
    return;
  }

  console.log(`Player ${socket.id} left room ${roomId}`);
  io.to(roomId).emit("room_state", updatedRoom);
}

function sanitize(input: string): string {
  return input.replace(/[<>&"'/]/g, "");
}
