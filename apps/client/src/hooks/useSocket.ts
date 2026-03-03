import { useCallback } from "react";
import { socket } from "@/utils/socket";
import { SOCKET_EVENTS } from "@gamion/shared";

export function useSocket() {
  const sendPing = useCallback(() => {
    socket.emit(SOCKET_EVENTS.PING, { timestamp: Date.now() });
  }, []);

  return { sendPing };
}
