export type ControllerButton =
  | "dpad-up"
  | "dpad-down"
  | "dpad-left"
  | "dpad-right"
  | "button-a"
  | "button-b"
  | "home"
  | "back";

export type InputAction = "press" | "release";

export interface ControllerInputPayload {
  button: ControllerButton;
  action: InputAction;
  timestamp: number;
}

export interface ControllerInputSyncPayload {
  fromSocketId: string;
  fromNickname: string;
  button: ControllerButton;
  action: InputAction;
  timestamp: number;
}
