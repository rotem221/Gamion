import { useEffect, useCallback } from "react";
import { socket, setSocketAuth } from "@/utils/socket";
import { useAuthStore } from "@/stores/useAuthStore";
import { SOCKET_EVENTS } from "@gamion/shared";
import type { RegisterPayload, LoginPayload } from "@gamion/shared";

export function useAuth() {
  const { setAuth, setError, setLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    socket.on(SOCKET_EVENTS.AUTH_SUCCESS, (data) => {
      setSocketAuth(data.token);
      setAuth(data.user, data.token);
    });

    socket.on(SOCKET_EVENTS.AUTH_ERROR, (data) => {
      setError(data.message);
    });

    return () => {
      socket.off(SOCKET_EVENTS.AUTH_SUCCESS);
      socket.off(SOCKET_EVENTS.AUTH_ERROR);
    };
  }, [setAuth, setError]);

  const register = useCallback(
    (data: RegisterPayload) => {
      setLoading(true);
      socket.emit(SOCKET_EVENTS.AUTH_REGISTER, data);
    },
    [setLoading]
  );

  const login = useCallback(
    (data: LoginPayload) => {
      setLoading(true);
      socket.emit(SOCKET_EVENTS.AUTH_LOGIN, data);
    },
    [setLoading]
  );

  const logout = useCallback(() => {
    socket.emit(SOCKET_EVENTS.AUTH_LOGOUT);
    setSocketAuth(null);
    clearAuth();
  }, [clearAuth]);

  return { register, login, logout };
}
