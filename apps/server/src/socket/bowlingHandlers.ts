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

  const normalizedSpeed = Math.min(speed / BOWLING.MAX_BALL_SPEED, 1);
  const speedFactor = normalizedSpeed > 0.3 ? 1 - Math.abs(normalizedSpeed - 0.7) * 0.5 : 0.3;
  const anglePenalty = Math.abs(angle) * 0.3;
  const spinFactor = 1 - Math.abs(spin) * 0.15 + Math.min(Math.abs(spin), 0.3) * 0.1;
  const hitProb = Math.max(0.1, Math.min(0.95, speedFactor * spinFactor - anglePenalty));

  const newPinStates = [...standingPins];
  let knocked = 0;

  const hitOrder = [0, 4, 1, 2, 7, 8, 3, 5, 6, 9];

  for (const pinIdx of hitOrder) {
    if (!newPinStates[pinIdx]) continue;
    const pinProb = hitProb * (1 - knocked * 0.06);
    if (Math.random() < pinProb) {
      newPinStates[pinIdx] = false;
      knocked++;
    }
  }

  return { pinsKnocked: knocked, newPinStates };
}

export function registerBowlingHandlers(io: GameServer, socket: GameSocket) {
  socket.on("bowling_throw", async (data: BowlingThrow) => {
    const { roomId, playerId, speed, angle, spin } = data;

    const room = await roomStore.get(roomId);
    if (!room || room.status !== "playing" || room.selectedGameId !== "bowling") return;

    const game = await bowlingStore.get(roomId);
    if (!game || game.phase !== "waiting") return;

    const currentPlayerId = game.turnOrder[game.currentPlayerIndex];
    if (currentPlayerId !== playerId) return;

    // Set phase to rolling
    await bowlingStore.setPhase(roomId, "rolling");
    const rollingGame = await bowlingStore.get(roomId);
    if (rollingGame) io.to(roomId).emit("bowling_state", rollingGame);

    // Simulate pin physics after a delay (ball travel time)
    setTimeout(async () => {
      const currentGame = await bowlingStore.get(roomId);
      if (!currentGame) return;

      await bowlingStore.setPhase(roomId, "settling");

      const { pinsKnocked, newPinStates } = simulatePinsKnocked(
        speed,
        angle,
        spin,
        currentGame.standingPins
      );

      io.to(roomId).emit("bowling_throw_result", {
        playerId,
        pinsKnocked,
        pinStates: newPinStates,
      });

      // After settling, record the score and advance
      setTimeout(async () => {
        const result = await bowlingStore.recordThrow(roomId, pinsKnocked);
        if (!result) return;

        await bowlingStore.setPhase(roomId, result.isGameOver ? "finished" : "scoring");
        const updatedGame = await bowlingStore.get(roomId);
        if (updatedGame) io.to(roomId).emit("bowling_state", updatedGame);

        if (!result.isGameOver) {
          setTimeout(async () => {
            const latest = await bowlingStore.get(roomId);
            if (!latest) return;

            await bowlingStore.setPhase(roomId, "waiting");

            const nextPlayerId = latest.turnOrder[latest.currentPlayerIndex];
            const currentRoom = await roomStore.get(roomId);
            const nextPlayer = currentRoom?.players.find((p) => p.id === nextPlayerId);

            const finalState = await bowlingStore.get(roomId);
            if (finalState) io.to(roomId).emit("bowling_state", finalState);
            io.to(roomId).emit("bowling_your_turn", {
              playerId: nextPlayerId,
              playerName: nextPlayer?.name ?? "Player",
            });
          }, 1500);
        }
      }, BOWLING.SETTLE_TIME_MS);
    }, 800);
  });
}

export async function initBowlingGame(
  io: GameServer,
  roomId: string,
  playerIds: string[],
  playerNames: string[]
): Promise<void> {
  const state = await bowlingStore.create(roomId, playerIds, playerNames);

  io.to(roomId).emit("bowling_state", state);

  const firstPlayerId = state.turnOrder[0];
  io.to(roomId).emit("bowling_your_turn", {
    playerId: firstPlayerId,
    playerName: playerNames[0],
  });
}
