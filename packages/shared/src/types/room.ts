export type DeviceType = "desktop" | "mobile";
export type RoomRole = "host" | "remote" | "controller";

export interface RoomMember {
  socketId: string;
  userId: string | null;
  nickname: string;
  deviceType: DeviceType;
  role: RoomRole;
  isLeader: boolean;
  joinedAt: number;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  members: RoomMember[];
  createdAt: number;
  gameStatus: "lobby" | "playing";
}

export interface RoomCreatePayload {}

export interface RoomJoinPayload {
  code: string;
  nickname: string;
  deviceType: DeviceType;
}

export interface RoomCreatedPayload {
  room: Room;
}

export interface RoomUpdatedPayload {
  room: Room;
}

export interface RoomErrorPayload {
  message: string;
}

export interface RoomLeavePayload {}
