import { useCallback } from "react";
import { getSocket } from "../lib/socket";
import { useRoomContext } from "../context/RoomContext";
import type { Player, MenuDirection } from "@gameion/shared";

export function useRoom() {
  const { state } = useRoomContext();

  const createRoom = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      socket.emit("create_room", (response) => {
        if (response.ok) {
          resolve(response.roomId);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const joinRoom = useCallback(
    (roomId: string, name: string, avatar: string): Promise<{ player: Player; token: string }> => {
      return new Promise((resolve, reject) => {
        const socket = getSocket();
        socket.emit("join_room", { roomId, name, avatar }, (response) => {
          if (response.ok) {
            resolve({ player: response.player, token: response.token });
          } else {
            reject(new Error(response.error));
          }
        });
      });
    },
    []
  );

  const navigateMenu = useCallback(
    (direction: MenuDirection) => {
      if (!state.roomId) return;
      const socket = getSocket();
      socket.emit("navigate_menu", { roomId: state.roomId, direction });
    },
    [state.roomId]
  );

  const selectGame = useCallback(
    (gameId: string) => {
      if (!state.roomId) return;
      const socket = getSocket();
      socket.emit("select_game", { roomId: state.roomId, gameId });
    },
    [state.roomId]
  );

  const startGame = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!state.roomId) {
        reject(new Error("Not in a room"));
        return;
      }
      const socket = getSocket();
      socket.emit("start_game", { roomId: state.roomId }, (response) => {
        if (response.ok) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [state.roomId]);

  return { createRoom, joinRoom, navigateMenu, selectGame, startGame };
}
