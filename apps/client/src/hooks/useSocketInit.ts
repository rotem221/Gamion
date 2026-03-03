import { useEffect } from "react";
import { socket, setSocketAuth } from "@/utils/socket";
import { useConnectionStore } from "@/stores/useConnectionStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { SOCKET_EVENTS } from "@gamion/shared";

export function useSocketInit() {
  const { setConnected, setLatency } = useConnectionStore();
  const { clearAuth } = useAuthStore();

  useEffect(() => {
    const savedToken = localStorage.getItem("gamion_token");
    if (savedToken) {
      setSocketAuth(savedToken);
    }

    socket.connect();

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
      if (err.message.includes("Authentication failed")) {
        clearAuth();
        setSocketAuth(null);
        socket.connect();
      }
    });

    socket.on(SOCKET_EVENTS.PONG, (data) => {
      const latency = Date.now() - data.timestamp;
      setLatency(latency);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off(SOCKET_EVENTS.PONG);
      socket.disconnect();
    };
  }, [setConnected, setLatency, clearAuth]);
}
