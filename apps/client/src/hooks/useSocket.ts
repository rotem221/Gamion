import { useEffect, useCallback } from "react";
import { socket } from "@/utils/socket";
import { useConnectionStore } from "@/stores/useConnectionStore";
import { SOCKET_EVENTS } from "@gamion/shared";

export function useSocket() {
  const { setConnected, setLatency } = useConnectionStore();

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on(SOCKET_EVENTS.PONG, (data) => {
      const latency = Date.now() - data.timestamp;
      setLatency(latency);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off(SOCKET_EVENTS.PONG);
      socket.disconnect();
    };
  }, [setConnected, setLatency]);

  const sendPing = useCallback(() => {
    socket.emit(SOCKET_EVENTS.PING, { timestamp: Date.now() });
  }, []);

  return { sendPing };
}
