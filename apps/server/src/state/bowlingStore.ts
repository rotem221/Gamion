import type { BowlingGameState, BowlingPlayerScore, BowlingFrame } from "@gameion/shared";
import { BOWLING } from "@gameion/shared";
import type { RedisClient } from "../lib/redis.js";

const BOWLING_TTL = 3600; // 1 hour
const key = (roomId: string) => `bowling:${roomId}`;

let redis: RedisClient;

export function initBowlingStore(client: RedisClient) {
  redis = client;
}

function createEmptyFrames(): BowlingFrame[] {
  return Array.from({ length: BOWLING.TOTAL_FRAMES }, () => ({
    throws: [],
    score: null,
  }));
}

function createInitialState(playerIds: string[], playerNames: string[]): BowlingGameState {
  return {
    currentPlayerIndex: 0,
    currentFrame: 0,
    currentThrowInFrame: 0,
    scores: playerIds.map((id, i) => ({
      playerId: id,
      playerName: playerNames[i],
      frames: createEmptyFrames(),
      totalScore: 0,
    })),
    turnOrder: [...playerIds],
    phase: "waiting",
    standingPins: Array(BOWLING.TOTAL_PINS).fill(true),
  };
}

function isStrike(frame: BowlingFrame): boolean {
  return frame.throws[0] === BOWLING.TOTAL_PINS;
}

function isSpare(frame: BowlingFrame): boolean {
  return frame.throws.length >= 2 && frame.throws[0] + frame.throws[1] === BOWLING.TOTAL_PINS;
}

function calculateScores(scores: BowlingPlayerScore[]): void {
  for (const player of scores) {
    let total = 0;
    for (let f = 0; f < BOWLING.TOTAL_FRAMES; f++) {
      const frame = player.frames[f];
      if (frame.throws.length === 0) {
        frame.score = null;
        continue;
      }

      if (f < 9) {
        if (isStrike(frame)) {
          const next = getNextThrows(player.frames, f, 2);
          if (next.length >= 2) {
            frame.score = total + 10 + next[0] + next[1];
            total = frame.score;
          } else {
            frame.score = null;
          }
        } else if (isSpare(frame)) {
          const next = getNextThrows(player.frames, f, 1);
          if (next.length >= 1) {
            frame.score = total + 10 + next[0];
            total = frame.score;
          } else {
            frame.score = null;
          }
        } else if (frame.throws.length >= 2) {
          frame.score = total + frame.throws[0] + frame.throws[1];
          total = frame.score;
        } else {
          frame.score = null;
        }
      } else {
        const sum = frame.throws.reduce((a, b) => a + b, 0);
        if (isTenthFrameComplete(frame)) {
          frame.score = total + sum;
          total = frame.score;
        } else {
          frame.score = null;
        }
      }
    }
    player.totalScore = total;
  }
}

function getNextThrows(frames: BowlingFrame[], afterFrame: number, count: number): number[] {
  const throws: number[] = [];
  for (let f = afterFrame + 1; f < frames.length && throws.length < count; f++) {
    for (const t of frames[f].throws) {
      throws.push(t);
      if (throws.length >= count) break;
    }
  }
  return throws;
}

function isTenthFrameComplete(frame: BowlingFrame): boolean {
  if (frame.throws.length === 0) return false;
  if (frame.throws.length >= 3) return true;
  if (frame.throws.length === 2) {
    if (frame.throws[0] === BOWLING.TOTAL_PINS) return false;
    if (frame.throws[0] + frame.throws[1] >= BOWLING.TOTAL_PINS) return false;
    return true;
  }
  if (frame.throws.length === 1 && frame.throws[0] === BOWLING.TOTAL_PINS) {
    return false;
  }
  return false;
}

function isFrameComplete(frame: BowlingFrame, frameIndex: number): boolean {
  if (frameIndex < 9) {
    return isStrike(frame) || frame.throws.length >= 2;
  }
  return isTenthFrameComplete(frame);
}

async function getGame(roomId: string): Promise<BowlingGameState | null> {
  const raw = await redis.get(key(roomId));
  return raw ? (JSON.parse(raw) as BowlingGameState) : null;
}

async function saveGame(roomId: string, state: BowlingGameState): Promise<void> {
  await redis.set(key(roomId), JSON.stringify(state), { EX: BOWLING_TTL });
}

export const bowlingStore = {
  async create(roomId: string, playerIds: string[], playerNames: string[]): Promise<BowlingGameState> {
    const state = createInitialState(playerIds, playerNames);
    await saveGame(roomId, state);
    return state;
  },

  async get(roomId: string): Promise<BowlingGameState | null> {
    return getGame(roomId);
  },

  async delete(roomId: string): Promise<void> {
    await redis.del(key(roomId));
  },

  async getCurrentPlayerId(roomId: string): Promise<string | null> {
    const state = await getGame(roomId);
    if (!state) return null;
    return state.turnOrder[state.currentPlayerIndex];
  },

  async setPhase(roomId: string, phase: BowlingGameState["phase"]): Promise<void> {
    const state = await getGame(roomId);
    if (!state) return;
    state.phase = phase;
    await saveGame(roomId, state);
  },

  async recordThrow(roomId: string, pinsKnocked: number): Promise<{ state: BowlingGameState; isGameOver: boolean } | null> {
    const game = await getGame(roomId);
    if (!game) return null;

    const playerScore = game.scores[game.currentPlayerIndex];
    const frame = playerScore.frames[game.currentFrame];

    frame.throws.push(pinsKnocked);

    const pinsStillUp = game.standingPins.filter(Boolean).length - pinsKnocked;
    let knocked = 0;
    for (let i = 0; i < BOWLING.TOTAL_PINS && knocked < pinsKnocked; i++) {
      if (game.standingPins[i]) {
        game.standingPins[i] = false;
        knocked++;
      }
    }

    calculateScores(game.scores);

    if (isFrameComplete(frame, game.currentFrame)) {
      game.currentPlayerIndex++;

      if (game.currentPlayerIndex >= game.turnOrder.length) {
        game.currentPlayerIndex = 0;
        game.currentFrame++;

        if (game.currentFrame >= BOWLING.TOTAL_FRAMES) {
          game.phase = "finished";
          calculateScores(game.scores);
          await saveGame(roomId, game);
          return { state: game, isGameOver: true };
        }
      }

      game.standingPins = Array(BOWLING.TOTAL_PINS).fill(true);
      game.currentThrowInFrame = 0;
    } else {
      game.currentThrowInFrame++;

      if (game.currentFrame === 9 && pinsStillUp === 0) {
        game.standingPins = Array(BOWLING.TOTAL_PINS).fill(true);
      }
    }

    game.phase = "waiting";
    await saveGame(roomId, game);
    return { state: game, isGameOver: false };
  },

  async resetPins(roomId: string): Promise<void> {
    const state = await getGame(roomId);
    if (!state) return;
    state.standingPins = Array(BOWLING.TOTAL_PINS).fill(true);
    await saveGame(roomId, state);
  },
};
