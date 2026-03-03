import { useCallback } from "react";
import { socket } from "@/utils/socket";
import { useRoomStore } from "@/stores/useRoomStore";
import { SOCKET_EVENTS } from "@gamion/shared";
import type { DeviceType } from "@gamion/shared";
import { detectDevice } from "@/utils/device";

/**
 * Room actions — emitters only.
 * Listeners are registered globally via useRoomListeners() in App.
 */
export function useRoom() {
  const { clearRoom } = useRoomStore();

  const createRoom = useCallback(() => {
    socket.emit(SOCKET_EVENTS.ROOM_CREATE, {});
  }, []);

  const joinRoom = useCallback((code: string, nickname: string) => {
    const deviceType: DeviceType = detectDevice();
    socket.emit(SOCKET_EVENTS.ROOM_JOIN, { code, nickname, deviceType });
  }, []);

  const leaveRoom = useCallback(() => {
    socket.emit(SOCKET_EVENTS.ROOM_LEAVE, {});
    clearRoom();
  }, [clearRoom]);

  return { createRoom, joinRoom, leaveRoom };
}
