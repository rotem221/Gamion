import type { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "@gameion/shared";
import { registerRoomHandlers } from "./roomHandlers.js";
import { registerLobbyHandlers } from "./lobbyHandlers.js";
import { registerGameHandlers } from "./gameHandlers.js";
import { registerSignalingHandlers } from "./signalingHandlers.js";
import { registerBowlingHandlers } from "./bowlingHandlers.js";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerSocketHandlers(io: GameServer) {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    registerRoomHandlers(io, socket);
    registerLobbyHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerSignalingHandlers(io, socket);
    registerBowlingHandlers(io, socket);
  });
}
