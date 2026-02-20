import { useBowlingStore } from "../../stores/bowlingStore";
import type { BowlingPlayerScore } from "@gameion/shared";

function formatThrow(value: number | undefined, index: number, frame: BowlingPlayerScore["frames"][0], frameIdx: number, isLastFrame: boolean): string {
  if (value === undefined) return "";
  if (isLastFrame) {
    // 10th frame: show X for strikes, / for spares
    if (value === 10) return "X";
    if (index > 0 && frame.throws[index - 1] !== undefined) {
      if (frame.throws[index - 1] + value === 10) return "/";
    }
    return String(value);
  }
  if (index === 0) {
    return value === 10 ? "X" : String(value);
  }
  // Second throw
  if ((frame.throws[0] ?? 0) + value === 10) return "/";
  return String(value);
}

function PlayerRow({ score, isActive, rank }: { score: BowlingPlayerScore; isActive: boolean; rank: number }) {
  return (
    <div className={`flex items-stretch border-b border-white/10 ${isActive ? "bg-neon-accent/10" : ""}`}>
      {/* Player name */}
      <div className="w-28 shrink-0 flex items-center gap-1.5 px-2 py-1.5 border-r border-white/10">
        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-neon-accent animate-pulse" />}
        <span className="text-white text-xs font-medium truncate">{score.playerName}</span>
      </div>

      {/* Frames */}
      <div className="flex-1 flex">
        {score.frames.map((frame, frameIdx) => {
          const isLastFrame = frameIdx === 9;
          return (
            <div
              key={frameIdx}
              className={`flex-1 border-r border-white/5 flex flex-col items-center min-w-0 ${
                isLastFrame ? "flex-[1.5]" : ""
              }`}
            >
              {/* Throws row */}
              <div className="flex w-full justify-end border-b border-white/5">
                {isLastFrame ? (
                  // 10th frame has up to 3 throws
                  [0, 1, 2].map((throwIdx) => (
                    <span key={throwIdx} className="w-4 text-center text-[10px] text-white/70 border-l border-white/5 first:border-l-0">
                      {formatThrow(frame.throws[throwIdx], throwIdx, frame, frameIdx, true)}
                    </span>
                  ))
                ) : (
                  [0, 1].map((throwIdx) => (
                    <span key={throwIdx} className="w-4 text-center text-[10px] text-white/70 border-l border-white/5 first:border-l-0">
                      {frame.throws[0] === 10 && throwIdx === 0
                        ? ""
                        : formatThrow(frame.throws[throwIdx], throwIdx, frame, frameIdx, false)}
                    </span>
                  ))
                )}
              </div>
              {/* Score row */}
              <span className="text-xs text-neon-300 font-mono py-0.5">
                {frame.score !== null ? frame.score : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="w-14 shrink-0 flex items-center justify-center border-l border-white/10">
        <span className="text-sm font-bold text-neon-300 font-mono">{score.totalScore}</span>
      </div>
    </div>
  );
}

export default function BowlingScoreboard() {
  const gameState = useBowlingStore((s) => s.gameState);

  if (!gameState) return null;

  const currentPlayerId = gameState.turnOrder[gameState.currentPlayerIndex];

  // Sort by total score for ranking
  const ranked = [...gameState.scores].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="bg-black/60 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
      {/* Header row */}
      <div className="flex items-stretch border-b border-white/20">
        <div className="w-28 shrink-0 px-2 py-1 border-r border-white/10">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Player</span>
        </div>
        <div className="flex-1 flex">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className={`flex-1 text-center py-1 border-r border-white/5 ${i === 9 ? "flex-[1.5]" : ""}`}>
              <span className="text-[10px] text-white/40">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="w-14 shrink-0 text-center py-1 border-l border-white/10">
          <span className="text-[10px] text-white/40 uppercase">Total</span>
        </div>
      </div>

      {/* Player rows */}
      {gameState.scores.map((score, i) => (
        <PlayerRow
          key={score.playerId}
          score={score}
          isActive={score.playerId === currentPlayerId}
          rank={ranked.findIndex((r) => r.playerId === score.playerId) + 1}
        />
      ))}

      {/* Phase indicator */}
      {gameState.phase === "finished" && (
        <div className="px-3 py-2 bg-neon-accent/10 border-t border-neon-accent/20 text-center">
          <span className="text-neon-300 text-sm font-bold">
            {ranked[0]?.playerName} wins with {ranked[0]?.totalScore} points!
          </span>
        </div>
      )}
    </div>
  );
}
