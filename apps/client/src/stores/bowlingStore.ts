import { create } from "zustand";
import type { BowlingGameState, BowlingThrowResult } from "@gameion/shared";

interface BowlingStore {
  gameState: BowlingGameState | null;
  isMyTurn: boolean;
  lastThrowResult: BowlingThrowResult | null;
  ballInMotion: boolean;

  // Ball physics data (from controller swipe, applied by host scene)
  pendingThrow: { speed: number; angle: number; spin: number } | null;

  setGameState: (state: BowlingGameState) => void;
  setMyTurn: (isTurn: boolean) => void;
  setThrowResult: (result: BowlingThrowResult) => void;
  setBallInMotion: (inMotion: boolean) => void;
  setPendingThrow: (data: { speed: number; angle: number; spin: number } | null) => void;
  reset: () => void;
}

export const useBowlingStore = create<BowlingStore>((set) => ({
  gameState: null,
  isMyTurn: false,
  lastThrowResult: null,
  ballInMotion: false,
  pendingThrow: null,

  setGameState: (gameState) => set({ gameState }),
  setMyTurn: (isMyTurn) => set({ isMyTurn }),
  setThrowResult: (result) => set({ lastThrowResult: result }),
  setBallInMotion: (ballInMotion) => set({ ballInMotion }),
  setPendingThrow: (data) => set({ pendingThrow: data }),
  reset: () =>
    set({
      gameState: null,
      isMyTurn: false,
      lastThrowResult: null,
      ballInMotion: false,
      pendingThrow: null,
    }),
}));
