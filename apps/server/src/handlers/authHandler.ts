import { SOCKET_EVENTS } from "@gamion/shared";
import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "@gamion/shared";
import * as authService from "../services/authService.js";

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

export function registerAuthHandlers(_io: TypedServer, socket: TypedSocket) {
  socket.on(SOCKET_EVENTS.AUTH_REGISTER, async (data) => {
    try {
      const result = await authService.register(
        data.email,
        data.password,
        data.nickname
      );
      socket.data.userId = result.user.id;
      socket.data.email = result.user.email;
      socket.data.nickname = result.user.nickname;

      socket.emit(SOCKET_EVENTS.AUTH_SUCCESS, result);
    } catch (err) {
      socket.emit(SOCKET_EVENTS.AUTH_ERROR, {
        message: err instanceof Error ? err.message : "Registration failed",
      });
    }
  });

  socket.on(SOCKET_EVENTS.AUTH_LOGIN, async (data) => {
    try {
      const result = await authService.login(data.email, data.password);
      socket.data.userId = result.user.id;
      socket.data.email = result.user.email;
      socket.data.nickname = result.user.nickname;

      socket.emit(SOCKET_EVENTS.AUTH_SUCCESS, result);
    } catch (err) {
      socket.emit(SOCKET_EVENTS.AUTH_ERROR, {
        message: err instanceof Error ? err.message : "Login failed",
      });
    }
  });

  socket.on(SOCKET_EVENTS.AUTH_LOGOUT, () => {
    socket.data.userId = undefined;
    socket.data.email = undefined;
    socket.data.nickname = undefined;
  });
}
