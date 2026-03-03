import type {
  RegisterPayload,
  LoginPayload,
  AuthSuccessPayload,
  AuthErrorPayload,
} from "./auth.js";
import type {
  RoomCreatePayload,
  RoomJoinPayload,
  RoomCreatedPayload,
  RoomUpdatedPayload,
  RoomLeavePayload,
  RoomErrorPayload,
} from "./room.js";
import type {
  ControllerInputPayload,
  ControllerInputSyncPayload,
} from "./controller.js";

export interface PingPayload {
  timestamp: number;
}

export interface PongPayload {
  timestamp: number;
  serverTime: number;
}

export interface ClientToServerEvents {
  "game:ping": (data: PingPayload) => void;

  "auth:register": (data: RegisterPayload) => void;
  "auth:login": (data: LoginPayload) => void;
  "auth:logout": () => void;

  "room:create": (data: RoomCreatePayload) => void;
  "room:join": (data: RoomJoinPayload) => void;
  "room:leave": (data: RoomLeavePayload) => void;

  "controller:input": (data: ControllerInputPayload) => void;
}

export interface ServerToClientEvents {
  "game:pong": (data: PongPayload) => void;

  "auth:success": (data: AuthSuccessPayload) => void;
  "auth:error": (data: AuthErrorPayload) => void;

  "room:created": (data: RoomCreatedPayload) => void;
  "room:updated": (data: RoomUpdatedPayload) => void;
  "room:error": (data: RoomErrorPayload) => void;

  "controller:input-sync": (data: ControllerInputSyncPayload) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId?: string;
  email?: string;
  nickname?: string;
}
