import type { RoomState, Player, PlayerSlot } from "@gameion/shared";
import type { StoreClient } from "../lib/memoryAdapter.js";

const ROOM_TTL = 3600; // 1 hour
const key = (roomId: string) => `room:${roomId}`;

let redis: StoreClient;

export function initRoomStore(client: StoreClient) {
  redis = client;
}

async function getRoom(roomId: string): Promise<RoomState | null> {
  const raw = await redis.get(key(roomId));
  return raw ? (JSON.parse(raw) as RoomState) : null;
}

async function saveRoom(room: RoomState): Promise<void> {
  await redis.set(key(room.id), JSON.stringify(room), { EX: ROOM_TTL });
}

export const roomStore = {
  async create(roomId: string, hostSocketId: string): Promise<RoomState> {
    const room: RoomState = {
      id: roomId,
      players: [],
      status: "lobby",
      selectedGameId: null,
      hostSocketIds: [hostSocketId],
    };
    await saveRoom(room);
    return room;
  },

  async get(roomId: string): Promise<RoomState | null> {
    return getRoom(roomId);
  },

  async addPlayer(roomId: string, player: Player): Promise<RoomState | null> {
    const room = await getRoom(roomId);
    if (!room) return null;
    room.players.push(player);
    await saveRoom(room);
    return room;
  },

  async removePlayer(roomId: string, playerId: string): Promise<RoomState | null> {
    const room = await getRoom(roomId);
    if (!room) return null;
    room.players = room.players.filter((p) => p.id !== playerId);
    if (room.players.length > 0 && !room.players.some((p) => p.isLeader)) {
      room.players[0].isLeader = true;
    }
    await saveRoom(room);
    return room;
  },

  async addHost(roomId: string, hostSocketId: string): Promise<RoomState | null> {
    const room = await getRoom(roomId);
    if (!room) return null;
    if (!room.hostSocketIds.includes(hostSocketId)) {
      room.hostSocketIds.push(hostSocketId);
    }
    await saveRoom(room);
    return room;
  },

  async removeHost(roomId: string, hostSocketId: string): Promise<RoomState | null> {
    const room = await getRoom(roomId);
    if (!room) return null;
    room.hostSocketIds = room.hostSocketIds.filter((id) => id !== hostSocketId);
    await saveRoom(room);
    return room;
  },

  async isHost(roomId: string, socketId: string): Promise<boolean> {
    const room = await getRoom(roomId);
    if (!room) return false;
    return room.hostSocketIds.includes(socketId);
  },

  async findRoomBySocketId(socketId: string): Promise<{ roomId: string; player: Player | null; isHost: boolean } | null> {
    const keys = await redis.keys("room:*");

    for (const k of keys) {
      const raw = await redis.get(k);
      if (!raw) continue;
      const room = JSON.parse(raw) as RoomState;

      const player = room.players.find((p) => p.id === socketId);
      if (player) return { roomId: room.id, player, isHost: false };

      if (room.hostSocketIds.includes(socketId)) {
        return { roomId: room.id, player: null, isHost: true };
      }
    }
    return null;
  },

  async isLeader(roomId: string, socketId: string): Promise<boolean> {
    const room = await getRoom(roomId);
    if (!room) return false;
    const player = room.players.find((p) => p.id === socketId);
    return player?.isLeader ?? false;
  },

  async assignSlots(roomId: string): Promise<Record<string, PlayerSlot> | null> {
    const room = await getRoom(roomId);
    if (!room) return null;
    const assignments: Record<string, PlayerSlot> = {};
    room.players.forEach((p, i) => {
      assignments[p.id] = i;
    });
    return assignments;
  },

  async setStatus(roomId: string, status: RoomState["status"]): Promise<void> {
    const room = await getRoom(roomId);
    if (!room) return;
    room.status = status;
    await saveRoom(room);
  },

  async setSelectedGame(roomId: string, gameId: string | null): Promise<void> {
    const room = await getRoom(roomId);
    if (!room) return;
    room.selectedGameId = gameId;
    await saveRoom(room);
  },

  async save(room: RoomState): Promise<void> {
    await saveRoom(room);
  },

  async delete(roomId: string): Promise<void> {
    await redis.del(key(roomId));
  },

  async getAllRoomIds(): Promise<Set<string>> {
    const keys = await redis.keys("room:*");
    return new Set(keys.map((k) => k.replace("room:", "")));
  },
};
