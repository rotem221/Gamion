import type { BowlingGameState, BowlingPlayerScore, BowlingFrame } from "@gameion/shared";
import { BOWLING } from "@gameion/shared";

const bowlingGames = new Map<string, BowlingGameState>();

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
        // Normal frames (0-8)
        if (isStrike(frame)) {
          // Need next 2 throws
          const next = getNextThrows(player.frames, f, 2);
          if (next.length >= 2) {
            frame.score = total + 10 + next[0] + next[1];
            total = frame.score;
          } else {
            frame.score = null; // can't score yet
          }
        } else if (isSpare(frame)) {
          // Need next 1 throw
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
        // 10th frame: sum all throws (up to 3)
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
    // If first was strike or it's a spare, need 3rd throw
    if (frame.throws[0] === BOWLING.TOTAL_PINS) return false;
    if (frame.throws[0] + frame.throws[1] >= BOWLING.TOTAL_PINS) return false;
    return true; // open frame in 10th
  }
  if (frame.throws.length === 1 && frame.throws[0] === BOWLING.TOTAL_PINS) {
    return false; // strike in 10th, need 2 more
  }
  return false;
}

function isFrameComplete(frame: BowlingFrame, frameIndex: number): boolean {
  if (frameIndex < 9) {
    return isStrike(frame) || frame.throws.length >= 2;
  }
  return isTenthFrameComplete(frame);
}

export const bowlingStore = {
  create(roomId: string, playerIds: string[], playerNames: string[]): BowlingGameState {
    const state = createInitialState(playerIds, playerNames);
    bowlingGames.set(roomId, state);
    return state;
  },

  get(roomId: string): BowlingGameState | undefined {
    return bowlingGames.get(roomId);
  },

  delete(roomId: string): void {
    bowlingGames.delete(roomId);
  },

  getCurrentPlayerId(roomId: string): string | undefined {
    const state = bowlingGames.get(roomId);
    if (!state) return undefined;
    return state.turnOrder[state.currentPlayerIndex];
  },

  setPhase(roomId: string, phase: BowlingGameState["phase"]): void {
    const state = bowlingGames.get(roomId);
    if (state) state.phase = phase;
  },

  recordThrow(roomId: string, pinsKnocked: number): { state: BowlingGameState; isGameOver: boolean } | undefined {
    const game = bowlingGames.get(roomId);
    if (!game) return undefined;

    const playerScore = game.scores[game.currentPlayerIndex];
    const frame = playerScore.frames[game.currentFrame];

    // Record the throw
    frame.throws.push(pinsKnocked);

    // Update standing pins
    const pinsStillUp = game.standingPins.filter(Boolean).length - pinsKnocked;
    // Mark pins as knocked (from left to right for simplicity)
    let knocked = 0;
    for (let i = 0; i < BOWLING.TOTAL_PINS && knocked < pinsKnocked; i++) {
      if (game.standingPins[i]) {
        game.standingPins[i] = false;
        knocked++;
      }
    }

    // Recalculate scores
    calculateScores(game.scores);

    // Check if frame is complete
    if (isFrameComplete(frame, game.currentFrame)) {
      // Move to next player
      game.currentPlayerIndex++;

      if (game.currentPlayerIndex >= game.turnOrder.length) {
        // All players done this frame
        game.currentPlayerIndex = 0;
        game.currentFrame++;

        if (game.currentFrame >= BOWLING.TOTAL_FRAMES) {
          game.phase = "finished";
          calculateScores(game.scores);
          return { state: game, isGameOver: true };
        }
      }

      // Reset pins for new frame/player
      game.standingPins = Array(BOWLING.TOTAL_PINS).fill(true);
      game.currentThrowInFrame = 0;
    } else {
      // Same frame, next throw (don't reset pins for spare attempt)
      game.currentThrowInFrame++;

      // In 10th frame, reset pins after strike
      if (game.currentFrame === 9 && pinsStillUp === 0) {
        game.standingPins = Array(BOWLING.TOTAL_PINS).fill(true);
      }
    }

    game.phase = "waiting";
    return { state: game, isGameOver: false };
  },

  resetPins(roomId: string): void {
    const state = bowlingGames.get(roomId);
    if (state) {
      state.standingPins = Array(BOWLING.TOTAL_PINS).fill(true);
    }
  },
};
