import type { RoomState, Player, PlayerSlot } from "@gameion/shared";

const rooms = new Map<string, RoomState>();

export const roomStore = {
  create(roomId: string, hostSocketId: string): RoomState {
    const room: RoomState = {
      id: roomId,
      players: [],
      status: "lobby",
      selectedGameId: null,
      hostSocketIds: [hostSocketId],
    };
    rooms.set(roomId, room);
    return room;
  },

  get(roomId: string): RoomState | undefined {
    return rooms.get(roomId);
  },

  addPlayer(roomId: string, player: Player): RoomState | undefined {
    const room = rooms.get(roomId);
    if (!room) return undefined;
    room.players.push(player);
    return room;
  },

  removePlayer(roomId: string, playerId: string): RoomState | undefined {
    const room = rooms.get(roomId);
    if (!room) return undefined;

    room.players = room.players.filter((p) => p.id !== playerId);

    if (room.players.length > 0 && !room.players.some((p) => p.isLeader)) {
      room.players[0].isLeader = true;
    }

    return room;
  },

  addHost(roomId: string, hostSocketId: string): RoomState | undefined {
    const room = rooms.get(roomId);
    if (!room) return undefined;
    if (!room.hostSocketIds.includes(hostSocketId)) {
      room.hostSocketIds.push(hostSocketId);
    }
    return room;
  },

  removeHost(roomId: string, hostSocketId: string): RoomState | undefined {
    const room = rooms.get(roomId);
    if (!room) return undefined;
    room.hostSocketIds = room.hostSocketIds.filter((id) => id !== hostSocketId);
    return room;
  },

  isHost(roomId: string, socketId: string): boolean {
    const room = rooms.get(roomId);
    if (!room) return false;
    return room.hostSocketIds.includes(socketId);
  },

  findRoomBySocketId(socketId: string): { roomId: string; player: Player | null; isHost: boolean } | undefined {
    for (const [roomId, room] of rooms) {
      const player = room.players.find((p) => p.id === socketId);
      if (player) return { roomId, player, isHost: false };

      if (room.hostSocketIds.includes(socketId)) {
        return { roomId, player: null, isHost: true };
      }
    }
    return undefined;
  },

  isLeader(roomId: string, socketId: string): boolean {
    const room = rooms.get(roomId);
    if (!room) return false;
    const player = room.players.find((p) => p.id === socketId);
    return player?.isLeader ?? false;
  },

  assignSlots(roomId: string): Record<string, PlayerSlot> | undefined {
    const room = rooms.get(roomId);
    if (!room) return undefined;
    const assignments: Record<string, PlayerSlot> = {};
    room.players.forEach((p, i) => {
      assignments[p.id] = i;
    });
    return assignments;
  },

  delete(roomId: string): void {
    rooms.delete(roomId);
  },

  getAllRoomIds(): Set<string> {
    return new Set(rooms.keys());
  },
};
