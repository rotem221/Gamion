import { randomBytes } from "crypto";
import type { StoreClient } from "../lib/memoryAdapter.js";

const SESSION_TTL = 3600; // 1 hour
const sessionKey = (token: string) => `session:${token}`;
const playerTokenKey = (playerId: string) => `player_token:${playerId}`;

interface SessionEntry {
  roomId: string;
  playerId: string;
  token: string;
  socketId: string;
}

let redis: StoreClient;

export function initSessionStore(client: StoreClient) {
  redis = client;
}

export const sessionStore = {
  async createToken(roomId: string, playerId: string, socketId: string): Promise<string> {
    // Remove old token if exists
    const oldToken = await redis.get(playerTokenKey(playerId));
    if (oldToken) await redis.del(sessionKey(oldToken));

    const token = randomBytes(16).toString("hex");
    const entry: SessionEntry = { roomId, playerId, token, socketId };
    await redis.set(sessionKey(token), JSON.stringify(entry), { EX: SESSION_TTL });
    await redis.set(playerTokenKey(playerId), token, { EX: SESSION_TTL });
    return token;
  },

  async verify(roomId: string, playerId: string, token: string): Promise<boolean> {
    const raw = await redis.get(sessionKey(token));
    if (!raw) return false;
    const entry = JSON.parse(raw) as SessionEntry;
    return entry.roomId === roomId && entry.playerId === playerId;
  },

  async updateSocketId(playerId: string, newSocketId: string): Promise<void> {
    const token = await redis.get(playerTokenKey(playerId));
    if (!token) return;
    const raw = await redis.get(sessionKey(token));
    if (!raw) return;
    const entry = JSON.parse(raw) as SessionEntry;
    entry.socketId = newSocketId;
    await redis.set(sessionKey(token), JSON.stringify(entry), { EX: SESSION_TTL });
  },

  async removePlayer(playerId: string): Promise<void> {
    const token = await redis.get(playerTokenKey(playerId));
    if (token) {
      await redis.del(sessionKey(token));
      await redis.del(playerTokenKey(playerId));
    }
  },

  async removeRoom(roomId: string): Promise<void> {
    const keys = await redis.keys("session:*");
    for (const k of keys) {
      const raw = await redis.get(k);
      if (!raw) continue;
      const entry = JSON.parse(raw) as SessionEntry;
      if (entry.roomId === roomId) {
        await redis.del(k);
        await redis.del(playerTokenKey(entry.playerId));
      }
    }
  },
};
