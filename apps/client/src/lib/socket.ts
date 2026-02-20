import { io, type Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@gameion/shared";

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: GameSocket | null = null;

function getServerUrl(): string {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  return `http://${window.location.hostname}:3001`;
}

export function getApiUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return `http://${window.location.hostname}:3001`;
}

export function getSocket(): GameSocket {
  if (!socket) {
    socket = io(getServerUrl(), {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function connectSocket(): GameSocket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
