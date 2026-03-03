import { create } from "zustand";
import type { PublicUser } from "@gamion/shared";

interface AuthState {
  user: PublicUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setAuth: (user: PublicUser, token: string) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem("gamion_token", token);
    set({ user, token, isAuthenticated: true, isLoading: false, error: null });
  },
  setError: (error) => set({ error, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => {
    localStorage.removeItem("gamion_token");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },
  clearError: () => set({ error: null }),
}));
