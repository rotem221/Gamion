import { create } from "zustand";
import type { ApplyInput, PlayerSlot, GameInputAction } from "@gameion/shared";

interface GameStore {
  // Game meta
  isPlaying: boolean;
  gameId: string | null;
  mySlot: PlayerSlot | null;
  slotAssignments: Record<string, PlayerSlot> | null;

  // Current per-player action state (set by inputs, read by physics each frame)
  currentActions: Map<PlayerSlot, GameInputAction>;

  // Input queue for one-shot actions (jumps)
  jumpQueue: PlayerSlot[];

  // Actions
  setPlaying: (playing: boolean, gameId?: string) => void;
  setMySlot: (slot: PlayerSlot) => void;
  setSlotAssignments: (assignments: Record<string, PlayerSlot>) => void;
  applyInput: (input: ApplyInput) => void;
  drainJumps: () => PlayerSlot[];
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  isPlaying: false,
  gameId: null,
  mySlot: null,
  slotAssignments: null,
  currentActions: new Map(),
  jumpQueue: [],

  setPlaying: (playing, gameId) =>
    set({ isPlaying: playing, gameId: gameId ?? null }),

  setMySlot: (slot) => set({ mySlot: slot }),

  setSlotAssignments: (assignments) => set({ slotAssignments: assignments }),

  applyInput: (input) => {
    const { currentActions, jumpQueue } = get();

    if (input.action === "jump") {
      // Jump is a one-shot impulse, queue it
      set({ jumpQueue: [...jumpQueue, input.slot] });
    } else {
      // Continuous actions: replace the current action for this slot
      const next = new Map(currentActions);
      next.set(input.slot, input.action);
      set({ currentActions: next });
    }
  },

  drainJumps: () => {
    const jumps = get().jumpQueue;
    set({ jumpQueue: [] });
    return jumps;
  },

  reset: () =>
    set({
      isPlaying: false,
      gameId: null,
      mySlot: null,
      slotAssignments: null,
      currentActions: new Map(),
      jumpQueue: [],
    }),
}));
