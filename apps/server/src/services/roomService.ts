import crypto from "node:crypto";
import type { Room, RoomMember, DeviceType, RoomRole } from "@gamion/shared";

const rooms = new Map<string, Room>();
const codeIndex = new Map<string, string>();
const socketRoomIndex = new Map<string, string>();

function generateCode(): string {
  let code: string;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (codeIndex.has(code));
  return code;
}

function determineRole(
  deviceType: DeviceType,
  _isCreator: boolean
): RoomRole {
  if (deviceType === "mobile") return "controller";
  return "remote";
}

export function createRoom(
  socketId: string,
  userId: string,
  nickname: string,
  deviceType: DeviceType
): Room {
  if (socketRoomIndex.has(socketId)) {
    throw new Error("You are already in a room");
  }

  const id = crypto.randomUUID();
  const code = generateCode();

  const member: RoomMember = {
    socketId,
    userId,
    nickname,
    deviceType,
    role: "host",
    isLeader: true,
    joinedAt: Date.now(),
  };

  const room: Room = {
    id,
    code,
    hostId: socketId,
    members: [member],
    createdAt: Date.now(),
    gameStatus: "lobby",
  };

  rooms.set(id, room);
  codeIndex.set(code, id);
  socketRoomIndex.set(socketId, id);

  return room;
}

export function joinRoom(
  code: string,
  socketId: string,
  userId: string | null,
  nickname: string,
  deviceType: DeviceType
): Room {
  if (socketRoomIndex.has(socketId)) {
    throw new Error("You are already in a room");
  }

  const roomId = codeIndex.get(code);
  if (!roomId) throw new Error("Room not found");

  const room = rooms.get(roomId)!;

  if (room.members.some((m) => m.nickname === nickname)) {
    throw new Error("Nickname already taken in this room");
  }

  const role = determineRole(deviceType, false);

  const member: RoomMember = {
    socketId,
    userId,
    nickname,
    deviceType,
    role,
    isLeader: false,
    joinedAt: Date.now(),
  };

  room.members.push(member);
  socketRoomIndex.set(socketId, roomId);

  return room;
}

export function leaveRoom(socketId: string): Room | null {
  const roomId = socketRoomIndex.get(socketId);
  if (!roomId) return null;

  const room = rooms.get(roomId)!;
  const leavingMember = room.members.find((m) => m.socketId === socketId);
  room.members = room.members.filter((m) => m.socketId !== socketId);
  socketRoomIndex.delete(socketId);

  if (room.members.length === 0) {
    rooms.delete(roomId);
    codeIndex.delete(room.code);
    return null;
  }

  if (leavingMember?.isLeader && room.members.length > 0) {
    const earliest = room.members.reduce((a, b) =>
      a.joinedAt < b.joinedAt ? a : b
    );
    earliest.isLeader = true;
  }

  return room;
}

export function getRoomBySocketId(socketId: string): Room | undefined {
  const roomId = socketRoomIndex.get(socketId);
  return roomId ? rooms.get(roomId) : undefined;
}

export function getRoomSocketName(roomId: string): string {
  return `room:${roomId}`;
}
