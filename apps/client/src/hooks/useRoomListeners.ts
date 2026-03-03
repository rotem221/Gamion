import { useEffect } from "react";
import { socket } from "@/utils/socket";
import { useRoomStore } from "@/stores/useRoomStore";
import { SOCKET_EVENTS } from "@gamion/shared";

/**
 * Global room event listeners — must be called ONCE at the App level.
 * This ensures listeners survive Lobby → Room component transitions.
 */
export function useRoomListeners() {
  const { setRoom, setError, clearRoom } = useRoomStore();

  useEffect(() => {
    const onCreated = (data: { room: import("@gamion/shared").Room }) => {
      setRoom(data.room, socket.id!);
    };

    const onUpdated = (data: { room: import("@gamion/shared").Room }) => {
      setRoom(data.room, socket.id!);
    };

    const onError = (data: { message: string }) => {
      setError(data.message);
    };

    // Clear room state when socket disconnects (server already cleans up)
    const onDisconnect = () => {
      clearRoom();
    };

    socket.on(SOCKET_EVENTS.ROOM_CREATED, onCreated);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, onUpdated);
    socket.on(SOCKET_EVENTS.ROOM_ERROR, onError);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_CREATED, onCreated);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, onUpdated);
      socket.off(SOCKET_EVENTS.ROOM_ERROR, onError);
      socket.off("disconnect", onDisconnect);
    };
  }, [setRoom, setError, clearRoom]);
}
