export interface User {
  id: string;
  email: string;
  nickname: string;
  passwordHash: string;
  createdAt: number;
}

export interface PublicUser {
  id: string;
  email: string;
  nickname: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  nickname: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSuccessPayload {
  user: PublicUser;
  token: string;
}

export interface AuthErrorPayload {
  message: string;
}
