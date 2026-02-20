import "dotenv/config";
import http from "node:http";
import { app } from "./app.js";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./handlers/socketHandler.js";
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
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  registerSocketHandlers(io, socket);

  socket.on("disconnect", (reason) => {
    console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
  });
});

server.listen(PORT, () => {
  console.log(`[Server] Gamion server running on http://localhost:${PORT}`);
});
