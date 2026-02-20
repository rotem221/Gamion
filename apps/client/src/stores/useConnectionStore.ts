import { create } from "zustand";

interface ConnectionState {
  isConnected: boolean;
  latency: number | null;
  setConnected: (connected: boolean) => void;
  setLatency: (latency: number) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  isConnected: false,
  latency: null,
  setConnected: (connected) => set({ isConnected: connected }),
  setLatency: (latency) => set({ latency }),
}));
