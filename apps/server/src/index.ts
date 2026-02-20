import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import rateLimit from "express-rate-limit";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "@gameion/shared";
import { STUN_SERVERS } from "@gameion/shared";
import { registerSocketHandlers } from "./socket/index.js";
import { getRedisClient } from "./lib/redis.js";
import { initRoomStore } from "./state/roomStore.js";
import { initSessionStore } from "./state/sessionStore.js";
import { initBowlingStore } from "./state/bowlingStore.js";

const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const app = express();
const httpServer = createServer(app);

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

app.use(apiLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ICE servers endpoint — clients fetch this on join
app.get("/ice-servers", (_req, res) => {
  const servers = [...STUN_SERVERS];

  // If TURN credentials are configured, include them
  const turnSecret = process.env.TURN_SECRET;
  const turnUrl = process.env.TURN_URL;
  if (turnUrl && turnSecret) {
    servers.push({
      urls: turnUrl,
      username: process.env.TURN_USERNAME || "",
      credential: turnSecret,
    } as any);
  }

  res.json({ iceServers: servers });
});

async function main() {
  // Connect to Redis
  const redisClient = await getRedisClient();

  // Initialize stores with the Redis client
  initRoomStore(redisClient);
  initSessionStore(redisClient);
  initBowlingStore(redisClient);

  // Create a duplicate client for the Redis adapter (subscriber)
  const subClient = redisClient.duplicate();
  await subClient.connect();

  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: CORS_ORIGIN,
      },
      adapter: createAdapter(redisClient, subClient),
    }
  );

  registerSocketHandlers(io);

  const PORT = process.env.PORT || 3001;

  httpServer.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
