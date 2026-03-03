import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import type { User, PublicUser, JwtPayload } from "@gamion/shared";

const JWT_SECRET = process.env.JWT_SECRET || "gamion-dev-secret";
const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24; // 24 hours
const SALT_ROUNDS = 10;

const users = new Map<string, User>();
const emailIndex = new Map<string, string>();

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, nickname: user.nickname };
}

export async function register(
  email: string,
  password: string,
  nickname: string
): Promise<{ user: PublicUser; token: string }> {
  if (!email || !password || !nickname) {
    throw new Error("All fields are required");
  }
  if (emailIndex.has(email.toLowerCase())) {
    throw new Error("Email already registered");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user: User = {
    id,
    email: email.toLowerCase(),
    nickname,
    passwordHash,
    createdAt: Date.now(),
  };

  users.set(id, user);
  emailIndex.set(user.email, id);

  const token = generateToken(user);
  return { user: toPublicUser(user), token };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: PublicUser; token: string }> {
  const userId = emailIndex.get(email.toLowerCase());
  if (!userId) throw new Error("Invalid email or password");

  const user = users.get(userId)!;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid email or password");

  const token = generateToken(user);
  return { user: toPublicUser(user), token };
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

function generateToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    nickname: user.nickname,
  };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN_SECONDS,
  });
}
