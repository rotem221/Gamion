export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  PING: "game:ping",
  PONG: "game:pong",

  // Auth
  AUTH_REGISTER: "auth:register",
  AUTH_LOGIN: "auth:login",
  AUTH_SUCCESS: "auth:success",
  AUTH_ERROR: "auth:error",
  AUTH_LOGOUT: "auth:logout",

  // Room
  ROOM_CREATE: "room:create",
  ROOM_CREATED: "room:created",
  ROOM_JOIN: "room:join",
  ROOM_UPDATED: "room:updated",
  ROOM_LEAVE: "room:leave",
  ROOM_ERROR: "room:error",

  // Controller
  CONTROLLER_INPUT: "controller:input",
  CONTROLLER_INPUT_SYNC: "controller:input-sync",
} as const;

export type SocketEventName =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
