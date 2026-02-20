import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  BowlingThrow,
} from "@gameion/shared";
import { BOWLING } from "@gameion/shared";
import { roomStore } from "../state/roomStore.js";
import { bowlingStore } from "../state/bowlingStore.js";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

function simulatePinsKnocked(speed: number, angle: number, spin: number, standingPins: boolean[]): {
  pinsKnocked: number;
  newPinStates: boolean[];
} {
  const pinsUp = standingPins.filter(Boolean).length;
  if (pinsUp === 0) return { pinsKnocked: 0, newPinStates: [...standingPins] };

  // Normalize speed to 0-1 range
  const normalizedSpeed = Math.min(speed / BOWLING.MAX_BALL_SPEED, 1);

  // Base accuracy from speed (sweet spot around 0.6-0.8)
  const speedFactor = normalizedSpeed > 0.3 ? 1 - Math.abs(normalizedSpeed - 0.7) * 0.5 : 0.3;

  // Angle penalty (0 = center, larger = more off-center)
  const anglePenalty = Math.abs(angle) * 0.3;

  // Spin can help or hurt: small spin helps, big spin hurts
  const spinFactor = 1 - Math.abs(spin) * 0.15 + Math.min(Math.abs(spin), 0.3) * 0.1;

  // Calculate hit probability
  const hitProb = Math.max(0.1, Math.min(0.95, speedFactor * spinFactor - anglePenalty));

  // Determine how many pins knocked
  const newPinStates = [...standingPins];
  let knocked = 0;

  // Pin indices from center outward for realistic physics
  const hitOrder = [0, 4, 1, 2, 7, 8, 3, 5, 6, 9];

  for (const pinIdx of hitOrder) {
    if (!newPinStates[pinIdx]) continue; // already down
    // Each pin has decreasing chance of being hit
    const pinProb = hitProb * (1 - knocked * 0.06);
    if (Math.random() < pinProb) {
      newPinStates[pinIdx] = false;
      knocked++;
    }
  }

  return { pinsKnocked: knocked, newPinStates };
}

export function registerBowlingHandlers(io: GameServer, socket: GameSocket) {
  socket.on("bowling_throw", (data: BowlingThrow) => {
    const { roomId, playerId, speed, angle, spin } = data;

    const room = roomStore.get(roomId);
    if (!room || room.status !== "playing" || room.selectedGameId !== "bowling") return;

    const game = bowlingStore.get(roomId);
    if (!game || game.phase !== "waiting") return;

    // Verify it's this player's turn
    const currentPlayerId = bowlingStore.getCurrentPlayerId(roomId);
    if (currentPlayerId !== playerId) return;

    // Set phase to rolling
    bowlingStore.setPhase(roomId, "rolling");
    io.to(roomId).emit("bowling_state", game);

    // Simulate pin physics after a delay (ball travel time)
    setTimeout(() => {
      const currentGame = bowlingStore.get(roomId);
      if (!currentGame) return;

      bowlingStore.setPhase(roomId, "settling");

      const { pinsKnocked, newPinStates } = simulatePinsKnocked(
        speed,
        angle,
        spin,
        currentGame.standingPins
      );

      // Broadcast the throw result (hosts use this for visual pin knockdown)
      io.to(roomId).emit("bowling_throw_result", {
        playerId,
        pinsKnocked,
        pinStates: newPinStates,
      });

      // After settling, record the score and advance
      setTimeout(() => {
        const result = bowlingStore.recordThrow(roomId, pinsKnocked);
        if (!result) return;

        bowlingStore.setPhase(roomId, result.isGameOver ? "finished" : "scoring");
        io.to(roomId).emit("bowling_state", result.state);

        if (!result.isGameOver) {
          // Brief pause then announce next turn
          setTimeout(() => {
            const latest = bowlingStore.get(roomId);
            if (!latest) return;

            latest.phase = "waiting";
            const nextPlayerId = latest.turnOrder[latest.currentPlayerIndex];
            const nextPlayer = room.players.find((p) => p.id === nextPlayerId);

            io.to(roomId).emit("bowling_state", latest);
            io.to(roomId).emit("bowling_your_turn", {
              playerId: nextPlayerId,
              playerName: nextPlayer?.name ?? "Player",
            });
          }, 1500);
        }
      }, BOWLING.SETTLE_TIME_MS);
    }, 800); // Ball travel time
  });
}

export function initBowlingGame(
  io: GameServer,
  roomId: string,
  playerIds: string[],
  playerNames: string[]
): void {
  const state = bowlingStore.create(roomId, playerIds, playerNames);

  io.to(roomId).emit("bowling_state", state);

  // Announce first player's turn
  const firstPlayerId = state.turnOrder[0];
  io.to(roomId).emit("bowling_your_turn", {
    playerId: firstPlayerId,
    playerName: playerNames[0],
  });
}
