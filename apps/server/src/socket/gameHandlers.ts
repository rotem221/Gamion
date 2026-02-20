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
  socket.on("start_game", async (data, callback) => {
    const { roomId } = data;
    const room = await roomStore.get(roomId);

    if (!room) {
      callback({ ok: false, error: "Room not found" });
      return;
    }

    const [isLeader, isHost] = await Promise.all([
      roomStore.isLeader(roomId, socket.id),
      roomStore.isHost(roomId, socket.id),
    ]);

    if (!isLeader && !isHost) {
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

    const slotAssignments = await roomStore.assignSlots(roomId);
    if (!slotAssignments) {
      callback({ ok: false, error: "Failed to assign player slots" });
      return;
    }

    await roomStore.setStatus(roomId, "playing");

    console.log(`Game "${room.selectedGameId}" started in room ${roomId} | Slots: ${JSON.stringify(slotAssignments)}`);

    io.to(roomId).emit("game_started", {
      gameId: room.selectedGameId,
      slotAssignments,
    });

    if (room.selectedGameId === "bowling") {
      const playerIds = room.players.map((p) => p.id);
      const playerNames = room.players.map((p) => p.name);
      await initBowlingGame(io, roomId, playerIds, playerNames);
    }

    callback({ ok: true });
  });

  socket.on("exit_game", async (data, callback) => {
    const { roomId } = data;
    const room = await roomStore.get(roomId);

    if (!room) {
      callback({ ok: false, error: "Room not found" });
      return;
    }

    const [isLeader, isHost] = await Promise.all([
      roomStore.isLeader(roomId, socket.id),
      roomStore.isHost(roomId, socket.id),
    ]);

    if (!isLeader && !isHost) {
      callback({ ok: false, error: "Only the leader or host can end the game" });
      return;
    }

    await roomStore.setStatus(roomId, "lobby");
    await roomStore.setSelectedGame(roomId, null);

    console.log(`Game ended in room ${roomId} — returning to lobby`);

    // Re-fetch to get updated state
    const updatedRoom = await roomStore.get(roomId);

    io.to(roomId).emit("game_ended");
    if (updatedRoom) {
      io.to(roomId).emit("room_state", updatedRoom);
    }

    callback({ ok: true });
  });

  socket.on("game_input", async (data: GameInput) => {
    const { roomId, ...inputPayload } = data;
    const room = await roomStore.get(roomId);
    if (!room || room.status !== "playing") return;

    const applyData: ApplyInput = {
      playerId: inputPayload.playerId,
      slot: inputPayload.slot,
      action: inputPayload.action,
      seq: inputPayload.seq,
      timestamp: inputPayload.timestamp,
    };

    for (const hostId of room.hostSocketIds) {
      io.to(hostId).emit("apply_input", applyData);
    }
  });
}
