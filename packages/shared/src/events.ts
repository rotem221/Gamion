import type {
  Player,
  RoomState,
  GameInput,
  ApplyInput,
  WebRTCSignal,
  PlayerSlot,
  BowlingThrow,
  BowlingGameState,
  BowlingThrowResult,
  SessionToken,
} from "./types.js";

export interface ClientToServerEvents {
  create_room: (
    callback: (response: { ok: true; roomId: string } | { ok: false; error: string }) => void
  ) => void;

  join_room: (
    data: { roomId: string; name: string; avatar: string },
    callback: (response: { ok: true; player: Player; token: string } | { ok: false; error: string }) => void
  ) => void;

  rejoin_room: (
    data: { roomId: string; playerId: string; token: string },
    callback: (response: { ok: true; player: Player } | { ok: false; error: string }) => void
  ) => void;

  navigate_menu: (data: { roomId: string; direction: MenuDirection }) => void;

  select_game: (data: { roomId: string; gameId: string }) => void;

  leave_room: (data: { roomId: string }) => void;

  check_room: (
    data: { roomId: string },
    callback: (response: { ok: true } | { ok: false; error: string }) => void
  ) => void;

  host_rejoin: (
    data: { roomId: string },
    callback: (response: { ok: true; room: RoomState } | { ok: false; error: string }) => void
  ) => void;

  // Phase 2: Game lifecycle
  start_game: (
    data: { roomId: string },
    callback: (response: { ok: true } | { ok: false; error: string }) => void
  ) => void;

  // Phase 2: Game input (phone -> server -> all hosts)
  game_input: (data: GameInput) => void;

  // Phase 2: WebRTC signaling
  webrtc_offer: (data: WebRTCSignal) => void;
  webrtc_answer: (data: WebRTCSignal) => void;
  webrtc_ice_candidate: (data: WebRTCSignal) => void;

  // Phase 3: Bowling
  bowling_throw: (data: BowlingThrow) => void;

  // Exit game back to lobby
  exit_game: (
    data: { roomId: string },
    callback: (response: { ok: true } | { ok: false; error: string }) => void
  ) => void;
}

export interface ServerToClientEvents {
  room_state: (state: RoomState) => void;
  player_joined: (player: Player) => void;
  player_left: (playerId: string) => void;
  menu_navigate: (direction: MenuDirection) => void;
  game_selected: (gameId: string) => void;
  error: (message: string) => void;

  // Phase 2: Game lifecycle
  game_started: (data: {
    gameId: string;
    slotAssignments: Record<string, PlayerSlot>;
  }) => void;

  // Phase 2: Input broadcast to hosts
  apply_input: (data: ApplyInput) => void;

  // Phase 2: WebRTC signaling relay
  webrtc_offer: (data: WebRTCSignal) => void;
  webrtc_answer: (data: WebRTCSignal) => void;
  webrtc_ice_candidate: (data: WebRTCSignal) => void;

  // Phase 2: Tells phones which hosts exist for WebRTC
  host_list: (hostSocketIds: string[]) => void;

  // Phase 3: Bowling
  bowling_state: (state: BowlingGameState) => void;
  bowling_throw_result: (data: BowlingThrowResult) => void;
  bowling_your_turn: (data: { playerId: string; playerName: string }) => void;

  // Exit game — returns everyone to lobby
  game_ended: () => void;
}

export interface InterServerEvents {}

export interface SocketData {
  roomId: string;
  playerId: string;
  sessionToken: string;
}

export type MenuDirection = "up" | "down" | "left" | "right" | "select";
