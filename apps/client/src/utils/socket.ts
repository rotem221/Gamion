import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@gamion/shared";

function getServerUrl(): string {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  // In dev, use the same hostname the browser is on (works for LAN/mobile)
  const host = window.location.hostname;
  return `http://${host}:3001`;
}

const SERVER_URL = getServerUrl();

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SERVER_URL,
  {
    autoConnect: false,
    transports: ["websocket", "polling"],
  }
);

export function setSocketAuth(token: string | null) {
  socket.auth = token ? { token } : {};
}
