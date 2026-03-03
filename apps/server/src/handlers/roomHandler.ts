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

export function registerRoomHandlers(io: TypedServer, socket: TypedSocket) {
  socket.on(SOCKET_EVENTS.ROOM_CREATE, () => {
    try {
      if (!socket.data.userId) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
          message: "Must be authenticated to create a room",
        });
        return;
      }

      const room = roomService.createRoom(
        socket.id,
        socket.data.userId,
        socket.data.nickname!,
        "desktop"
      );

      const roomName = roomService.getRoomSocketName(room.id);
      socket.join(roomName);

      socket.emit(SOCKET_EVENTS.ROOM_CREATED, { room });
    } catch (err) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
        message: err instanceof Error ? err.message : "Failed to create room",
      });
    }
  });

  socket.on(SOCKET_EVENTS.ROOM_JOIN, (data) => {
    try {
      const room = roomService.joinRoom(
        data.code,
        socket.id,
        socket.data.userId ?? null,
        data.nickname,
        data.deviceType
      );

      const roomName = roomService.getRoomSocketName(room.id);
      socket.join(roomName);

      io.to(roomName).emit(SOCKET_EVENTS.ROOM_UPDATED, { room });
    } catch (err) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
        message: err instanceof Error ? err.message : "Failed to join room",
      });
    }
  });

  socket.on(SOCKET_EVENTS.ROOM_LEAVE, () => {
    handleLeave(io, socket);
  });

  socket.on("disconnect", () => {
    handleLeave(io, socket);
  });
}

function handleLeave(io: TypedServer, socket: TypedSocket) {
  const currentRoom = roomService.getRoomBySocketId(socket.id);
  if (!currentRoom) return;

  const roomName = roomService.getRoomSocketName(currentRoom.id);
  const updatedRoom = roomService.leaveRoom(socket.id);

  socket.leave(roomName);

  if (updatedRoom) {
    io.to(roomName).emit(SOCKET_EVENTS.ROOM_UPDATED, { room: updatedRoom });
  }
}
