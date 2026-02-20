export interface PingPayload {
  timestamp: number;
}

export interface PongPayload {
  timestamp: number;
  serverTime: number;
}

export interface ClientToServerEvents {
  "game:ping": (data: PingPayload) => void;
}

export interface ServerToClientEvents {
  "game:pong": (data: PongPayload) => void;
}

export interface InterServerEvents {}

export interface SocketData {}
