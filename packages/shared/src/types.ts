export interface Player {
  id: string;
  name: string;
  avatar: string;
  isLeader: boolean;
}

export type RoomStatus = "lobby" | "playing" | "finished";

export interface RoomState {
  id: string;
  players: Player[];
  status: RoomStatus;
  selectedGameId: string | null;
  hostSocketIds: string[];
}

export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  exactPlayers?: number;
  thumbnail: string;
}

// --- Game Input Types ---

export type PlayerSlot = number;

export type GameInputAction = "move_left" | "move_right" | "jump" | "idle";

export interface GameInput {
  roomId: string;
  playerId: string;
  slot: PlayerSlot;
  action: GameInputAction;
  seq: number;
  timestamp: number;
}

export interface ApplyInput {
  playerId: string;
  slot: PlayerSlot;
  action: GameInputAction;
  seq: number;
  timestamp: number;
}

// --- WebRTC Signaling Types ---

export interface WebRTCSignal {
  roomId: string;
  fromSocketId: string;
  toSocketId: string;
  type: "offer" | "answer" | "ice_candidate";
  payload: unknown;
}

// --- Level Types ---

export type TileType = "platform" | "button" | "door" | "spawn" | "goal";

export interface LevelTile {
  type: TileType;
  x: number;
  y: number;
  width: number;
  height: number;
  linkedId?: string;
  slot?: PlayerSlot;
}

export interface LevelDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: LevelTile[];
}

// --- Bowling Types ---

export interface BowlingThrow {
  roomId: string;
  playerId: string;
  speed: number;
  angle: number;
  spin: number;
}

export interface BowlingThrowResult {
  playerId: string;
  pinsKnocked: number;
  pinStates: boolean[]; // true = standing, false = knocked
}

export interface BowlingFrame {
  throws: number[];
  score: number | null; // null until calculable
}

export interface BowlingPlayerScore {
  playerId: string;
  playerName: string;
  frames: BowlingFrame[];
  totalScore: number;
}

export interface BowlingGameState {
  currentPlayerIndex: number;
  currentFrame: number;
  currentThrowInFrame: number;
  scores: BowlingPlayerScore[];
  turnOrder: string[]; // playerIds in turn order
  phase: "waiting" | "throwing" | "rolling" | "settling" | "scoring" | "finished";
  standingPins: boolean[]; // 10 pins, true = standing
}

// --- Reconnection Types ---

export interface SessionToken {
  roomId: string;
  playerId: string;
  token: string;
}
