import type { GameDefinition } from "./types.js";

export const ROOM_ID_LENGTH = 4;
export const MAX_PLAYERS_PER_ROOM = 8;

export const AVATARS = [
  "robot",
  "alien",
  "cat",
  "ninja",
  "wizard",
  "pirate",
  "dragon",
  "ghost",
] as const;

export type AvatarId = (typeof AVATARS)[number];

export const GAMES: GameDefinition[] = [
  {
    id: "coop-quest",
    title: "Co-op Quest",
    description: "A cooperative adventure for exactly 2 players",
    minPlayers: 2,
    maxPlayers: 2,
    exactPlayers: 2,
    thumbnail: "coop-quest",
  },
  {
    id: "bowling",
    title: "Cosmic Bowling",
    description: "Classic bowling for 1-8 players",
    minPlayers: 1,
    maxPlayers: 8,
    thumbnail: "bowling",
  },
];

// WebRTC STUN servers for NAT traversal
export const STUN_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

// Co-op Quest physics constants
export const GAME_PHYSICS = {
  MOVE_SPEED: 5,
  JUMP_FORCE: 10,
  GRAVITY: -20,
  PLAYER_RADIUS: 0.4,
  PLAYER_HEIGHT: 0.8,
} as const;

// Bowling constants
export const BOWLING = {
  TOTAL_FRAMES: 10,
  TOTAL_PINS: 10,
  LANE_LENGTH: 18,
  LANE_WIDTH: 1.8,
  PIN_MASS: 1.5,
  PIN_RESTITUTION: 0.3,
  PIN_RADIUS: 0.06,
  PIN_HEIGHT: 0.38,
  BALL_RADIUS: 0.22,
  BALL_MASS: 6,
  MAX_BALL_SPEED: 12,
  SETTLE_TIME_MS: 3000,
  // Pin positions in standard triangle formation (x, z offsets from center)
  PIN_POSITIONS: [
    [0, 0],          // 1 (front)
    [-0.15, -0.26],  // 2
    [0.15, -0.26],   // 3
    [-0.30, -0.52],  // 4
    [0, -0.52],      // 5
    [0.30, -0.52],   // 6
    [-0.45, -0.78],  // 7
    [-0.15, -0.78],  // 8
    [0.15, -0.78],   // 9
    [0.45, -0.78],   // 10 (back row)
  ] as const,
} as const;
