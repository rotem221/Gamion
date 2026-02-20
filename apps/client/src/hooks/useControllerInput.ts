import { useCallback, useRef } from "react";
import { getSocket } from "../lib/socket";
import type { GameInputAction, PlayerSlot } from "@gameion/shared";

export function useControllerInput(roomId: string, playerId: string, slot: PlayerSlot) {
  const seqRef = useRef(0);

  const sendInput = useCallback(
    (action: GameInputAction) => {
      const socket = getSocket();
      socket.emit("game_input", {
        roomId,
        playerId,
        slot,
        action,
        seq: seqRef.current++,
        timestamp: Date.now(),
      });
    },
    [roomId, playerId, slot]
  );

  return { sendInput };
}
