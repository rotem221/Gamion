import type { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "@gamion/shared";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "@gamion/shared";

type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function registerSocketHandlers(_io: TypedServer, socket: TypedSocket) {
  socket.on(SOCKET_EVENTS.PING, (data) => {
    console.log(
      `[Socket] Ping from ${socket.id}, timestamp: ${data.timestamp}`
    );
    socket.emit(SOCKET_EVENTS.PONG, {
      timestamp: data.timestamp,
      serverTime: Date.now(),
    });
  });
}
