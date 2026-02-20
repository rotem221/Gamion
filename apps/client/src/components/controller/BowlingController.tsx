import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { getSocket } from "../../lib/socket";
import { useBowlingStore } from "../../stores/bowlingStore";
import { BOWLING } from "@gameion/shared";

interface BowlingControllerProps {
  roomId: string;
}

export default function BowlingController({ roomId }: BowlingControllerProps) {
  const isMyTurn = useBowlingStore((s) => s.isMyTurn);
  const ballInMotion = useBowlingStore((s) => s.ballInMotion);
  const gameState = useBowlingStore((s) => s.gameState);

  // Aiming: -1 (left) to 1 (right)
  const [aimAngle, setAimAngle] = useState(0);
  // Power: 0 to 1
  const [power, setPower] = useState(0);
  const [powerCharging, setPowerCharging] = useState(false);
  const powerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const powerDirRef = useRef(1);

  // Oscillating power meter
  useEffect(() => {
    if (powerCharging) {
      powerDirRef.current = 1;
      setPower(0);
      powerIntervalRef.current = setInterval(() => {
        setPower((prev) => {
          const next = prev + powerDirRef.current * 0.03;
          if (next >= 1) { powerDirRef.current = -1; return 1; }
          if (next <= 0) { powerDirRef.current = 1; return 0; }
          return next;
        });
      }, 30);
    } else if (powerIntervalRef.current) {
      clearInterval(powerIntervalRef.current);
      powerIntervalRef.current = null;
    }
    return () => {
      if (powerIntervalRef.current) clearInterval(powerIntervalRef.current);
    };
  }, [powerCharging]);

  const handleAimLeft = useCallback(() => {
    setAimAngle((prev) => Math.max(-1, prev - 0.15));
  }, []);

  const handleAimRight = useCallback(() => {
    setAimAngle((prev) => Math.min(1, prev + 0.15));
  }, []);

  const handleThrowStart = useCallback(() => {
    if (!isMyTurn || ballInMotion) return;
    setPowerCharging(true);
  }, [isMyTurn, ballInMotion]);

  const handleThrowRelease = useCallback(() => {
    if (!powerCharging) return;
    setPowerCharging(false);

    const speed = Math.max(0.2, power) * BOWLING.MAX_BALL_SPEED;
    const angle = aimAngle * 0.4;
    const spin = aimAngle * 0.3;

    const socket = getSocket();
    socket.emit("bowling_throw", {
      roomId,
      playerId: socket.id!,
      speed,
      angle,
      spin,
    });

    useBowlingStore.getState().setPendingThrow({ speed, angle, spin });
    setAimAngle(0);
    setPower(0);
  }, [powerCharging, power, aimAngle, roomId]);

  const phase = gameState?.phase ?? "waiting";
  const isFinished = phase === "finished";
  const canThrow = isMyTurn && !ballInMotion && !isFinished;

  return (
    <div className="flex flex-col min-h-dvh select-none pt-12">
      {/* Status area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {isFinished ? (
          <div className="text-center">
            <p className="text-3xl font-bold text-neon-300 mb-2">Game Over!</p>
            <p className="text-white/60 text-sm">Check the scoreboard on the big screen</p>
          </div>
        ) : ballInMotion ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-yellow-500 animate-ping" />
            </div>
            <p className="text-xl font-bold text-yellow-300">Rolling...</p>
          </div>
        ) : isMyTurn ? (
          <div className="text-center w-full">
            <p className="text-2xl font-bold text-white mb-2">Your Turn!</p>
            <p className="text-neon-300/50 text-xs mb-6">
              Frame {(gameState?.currentFrame ?? 0) + 1} / 10
            </p>

            {/* Aim indicator */}
            <div className="relative w-full max-w-xs mx-auto mb-6 h-3">
              <div className="absolute inset-0 rounded-full bg-white/10 border border-white/20" />
              <div
                className="absolute top-[-2px] bottom-[-2px] w-4 rounded-full bg-neon-400 border border-neon-300 transition-all duration-100"
                style={{ left: `calc(${(aimAngle + 1) / 2 * 100}% - 8px)` }}
              />
              <div className="flex justify-between mt-4 text-[10px] text-white/30">
                <span>Left</span>
                <span>Center</span>
                <span>Right</span>
              </div>
            </div>

            {/* Power bar */}
            <div className="w-full max-w-xs mx-auto mb-2 mt-4">
              <div className="h-6 rounded-full bg-white/10 border border-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-[30ms]"
                  style={{
                    width: `${power * 100}%`,
                    background: power < 0.5
                      ? "linear-gradient(90deg, #22c55e, #eab308)"
                      : "linear-gradient(90deg, #22c55e, #eab308, #ef4444)",
                  }}
                />
              </div>
              <p className="text-center text-[10px] text-white/40 mt-1">
                {powerCharging ? "Release to throw!" : "Hold THROW to charge"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center px-6">
            <p className="text-xl text-white/60 mb-2">
              {phase === "scoring" ? "Scoring..." : "Wait for your turn..."}
            </p>
            {gameState && (
              <p className="text-neon-300/50 text-xs">
                Frame {(gameState.currentFrame ?? 0) + 1} / 10
              </p>
            )}
          </div>
        )}
      </div>

      {/* Controls — always at bottom */}
      <div className="px-4 pb-6 pt-2">
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onTouchStart={(e) => { e.preventDefault(); handleAimLeft(); }}
            onMouseDown={handleAimLeft}
            disabled={!canThrow}
            className="w-20 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl text-white disabled:opacity-30 active:bg-neon-500/30 touch-none select-none"
          >
            ◀
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onTouchStart={(e) => { e.preventDefault(); handleThrowStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); handleThrowRelease(); }}
            onMouseDown={handleThrowStart}
            onMouseUp={handleThrowRelease}
            onMouseLeave={handleThrowRelease}
            disabled={!canThrow}
            className={`w-28 h-28 rounded-full flex items-center justify-center text-lg font-bold touch-none select-none transition-all ${
              powerCharging
                ? "bg-neon-500/40 border-2 border-neon-300 text-neon-200 scale-110"
                : canThrow
                  ? "bg-neon-500/20 border-2 border-neon-400/50 text-neon-200"
                  : "bg-white/5 border-2 border-white/10 text-white/30"
            }`}
          >
            {powerCharging ? "Release!" : "THROW"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onTouchStart={(e) => { e.preventDefault(); handleAimRight(); }}
            onMouseDown={handleAimRight}
            disabled={!canThrow}
            className="w-20 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl text-white disabled:opacity-30 active:bg-neon-500/30 touch-none select-none"
          >
            ▶
          </motion.button>
        </div>
      </div>

      {/* Mini score */}
      {gameState && !isFinished && (
        <div className="w-full px-4 py-3 bg-black/40 backdrop-blur-sm border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Score</span>
            <span className="text-neon-300 font-mono font-bold">
              {gameState.scores.find((s) => s.playerId === getSocket().id)?.totalScore ?? 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
