import { SOCKET_EVENTS } from "@gamion/shared";
import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "@gamion/shared";
import * as roomService from "../services/roomService.js";

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

export function registerControllerHandlers(
  _io: TypedServer,
  socket: TypedSocket
) {
  socket.on(SOCKET_EVENTS.CONTROLLER_INPUT, (data) => {
    const room = roomService.getRoomBySocketId(socket.id);
    if (!room) return;

    const member = room.members.find((m) => m.socketId === socket.id);
    if (!member || member.role !== "controller") return;

    const roomName = roomService.getRoomSocketName(room.id);
    socket.to(roomName).emit(SOCKET_EVENTS.CONTROLLER_INPUT_SYNC, {
      fromSocketId: socket.id,
      fromNickname: member.nickname,
      button: data.button,
      action: data.action,
      timestamp: data.timestamp,
    });
  });
}
