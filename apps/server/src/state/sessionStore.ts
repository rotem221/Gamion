import { randomBytes } from "crypto";

interface SessionEntry {
  roomId: string;
  playerId: string;
  token: string;
  socketId: string;
}

// Map token -> session entry
const sessions = new Map<string, SessionEntry>();
// Map playerId -> token (for lookup when reconnecting)
const playerTokens = new Map<string, string>();

export const sessionStore = {
  createToken(roomId: string, playerId: string, socketId: string): string {
    // Remove old token if exists
    const oldToken = playerTokens.get(playerId);
    if (oldToken) sessions.delete(oldToken);

    const token = randomBytes(16).toString("hex");
    sessions.set(token, { roomId, playerId, token, socketId });
    playerTokens.set(playerId, token);
    return token;
  },

  verify(roomId: string, playerId: string, token: string): boolean {
    const entry = sessions.get(token);
    if (!entry) return false;
    return entry.roomId === roomId && entry.playerId === playerId;
  },

  updateSocketId(playerId: string, newSocketId: string): void {
    const token = playerTokens.get(playerId);
    if (!token) return;
    const entry = sessions.get(token);
    if (entry) entry.socketId = newSocketId;
  },

  removePlayer(playerId: string): void {
    const token = playerTokens.get(playerId);
    if (token) {
      sessions.delete(token);
      playerTokens.delete(playerId);
    }
  },

  removeRoom(roomId: string): void {
    for (const [token, entry] of sessions) {
      if (entry.roomId === roomId) {
        sessions.delete(token);
        playerTokens.delete(entry.playerId);
      }
    }
  },
};
