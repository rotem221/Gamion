import "dotenv/config";
import http from "node:http";
import { app } from "./app.js";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./handlers/socketHandler.js";
import { registerAuthHandlers } from "./handlers/authHandler.js";
import { registerRoomHandlers } from "./handlers/roomHandler.js";
import { registerControllerHandlers } from "./handlers/controllerHandler.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "@gamion/shared";

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.use(authMiddleware);

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  if (socket.data.userId) {
    console.log(`[Socket] Authenticated as: ${socket.data.nickname}`);
  }

  registerSocketHandlers(io, socket);
  registerAuthHandlers(io, socket);
  registerRoomHandlers(io, socket);
  registerControllerHandlers(io, socket);

  socket.on("disconnect", (reason) => {
    console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
  });
});

server.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`[Server] Gamion server running on http://0.0.0.0:${PORT}`);
});
