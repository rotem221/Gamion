import { create } from "zustand";
import type { Room, RoomRole } from "@gamion/shared";

interface RoomState {
  room: Room | null;
  isLeader: boolean;
  myRole: RoomRole | null;
  error: string | null;

  setRoom: (room: Room, mySocketId: string) => void;
  setError: (error: string) => void;
  clearRoom: () => void;
  clearError: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  isLeader: false,
  myRole: null,
  error: null,

  setRoom: (room, mySocketId) => {
    const me = room.members.find((m) => m.socketId === mySocketId);
    set({
      room,
      isLeader: me?.isLeader ?? false,
      myRole: me?.role ?? null,
      error: null,
    });
  },
  setError: (error) => set({ error }),
  clearRoom: () =>
    set({ room: null, isLeader: false, myRole: null, error: null }),
  clearError: () => set({ error: null }),
}));
