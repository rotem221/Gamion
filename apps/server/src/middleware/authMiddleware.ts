import type { Socket } from "socket.io";
import { verifyToken } from "../services/authService.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "@gamion/shared";

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function authMiddleware(
  socket: TypedSocket,
  next: (err?: Error) => void
) {
  const token = socket.handshake.auth.token as string | undefined;

  if (!token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    socket.data.userId = payload.userId;
    socket.data.email = payload.email;
    socket.data.nickname = payload.nickname;
    next();
  } catch {
    next(new Error("Authentication failed: invalid token"));
  }
}
