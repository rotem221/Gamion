import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  GameInput,
  ApplyInput,
} from "@gameion/shared";
import { roomStore } from "../state/roomStore.js";
import { initBowlingGame } from "./bowlingHandlers.js";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerGameHandlers(io: GameServer, socket: GameSocket) {
  socket.on("start_game", (data, callback) => {
    const { roomId } = data;
    const room = roomStore.get(roomId);

    if (!room) {
      callback({ ok: false, error: "Room not found" });
      return;
    }

    // Allow both leader (phone) and host (desktop) to start
    if (!roomStore.isLeader(roomId, socket.id) && !roomStore.isHost(roomId, socket.id)) {
      callback({ ok: false, error: "Only the leader or host can start the game" });
      return;
    }

    if (!room.selectedGameId) {
      callback({ ok: false, error: "No game selected" });
      return;
    }

    if (room.status === "playing") {
      callback({ ok: false, error: "Game already in progress" });
      return;
    }

    const slotAssignments = roomStore.assignSlots(roomId);
    if (!slotAssignments) {
      callback({ ok: false, error: "Failed to assign player slots" });
      return;
    }

    room.status = "playing";

    console.log(`Game "${room.selectedGameId}" started in room ${roomId} | Slots: ${JSON.stringify(slotAssignments)}`);

    io.to(roomId).emit("game_started", {
      gameId: room.selectedGameId,
      slotAssignments,
    });

    // Initialize bowling game state if applicable
    if (room.selectedGameId === "bowling") {
      const playerIds = room.players.map((p) => p.id);
      const playerNames = room.players.map((p) => p.name);
      initBowlingGame(io, roomId, playerIds, playerNames);
    }

    callback({ ok: true });
  });

  socket.on("exit_game", (data, callback) => {
    const { roomId } = data;
    const room = roomStore.get(roomId);

    if (!room) {
      callback({ ok: false, error: "Room not found" });
      return;
    }

    // Only leader or host can exit the game
    if (!roomStore.isLeader(roomId, socket.id) && !roomStore.isHost(roomId, socket.id)) {
      callback({ ok: false, error: "Only the leader or host can end the game" });
      return;
    }

    room.status = "lobby";
    room.selectedGameId = null;

    console.log(`Game ended in room ${roomId} — returning to lobby`);

    io.to(roomId).emit("game_ended");
    io.to(roomId).emit("room_state", {
      id: room.id,
      players: room.players,
      status: room.status,
      selectedGameId: room.selectedGameId,
      hostSocketIds: room.hostSocketIds,
    });

    callback({ ok: true });
  });

  socket.on("game_input", (data: GameInput) => {
    const { roomId, ...inputPayload } = data;
    const room = roomStore.get(roomId);
    if (!room || room.status !== "playing") return;

    const applyData: ApplyInput = {
      playerId: inputPayload.playerId,
      slot: inputPayload.slot,
      action: inputPayload.action,
      seq: inputPayload.seq,
      timestamp: inputPayload.timestamp,
    };

    // Send to ALL hosts in the room (not phones — they don't need input broadcasts)
    for (const hostId of room.hostSocketIds) {
      io.to(hostId).emit("apply_input", applyData);
    }
  });
}
