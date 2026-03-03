import { useEffect, useCallback } from "react";
import { socket } from "@/utils/socket";
import { SOCKET_EVENTS } from "@gamion/shared";
import type {
  ControllerButton,
  InputAction,
  ControllerInputSyncPayload,
} from "@gamion/shared";

export function useControllerInput(
  onInputReceived?: (data: ControllerInputSyncPayload) => void
) {
  useEffect(() => {
    if (!onInputReceived) return;

    socket.on(SOCKET_EVENTS.CONTROLLER_INPUT_SYNC, onInputReceived);

    return () => {
      socket.off(SOCKET_EVENTS.CONTROLLER_INPUT_SYNC);
    };
  }, [onInputReceived]);

  const sendInput = useCallback(
    (button: ControllerButton, action: InputAction) => {
      socket.emit(SOCKET_EVENTS.CONTROLLER_INPUT, {
        button,
        action,
        timestamp: Date.now(),
      });
    },
    []
  );

  return { sendInput };
}
