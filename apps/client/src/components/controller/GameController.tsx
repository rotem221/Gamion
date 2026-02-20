import { useCallback } from "react";
import { motion } from "framer-motion";
import type { GameInputAction } from "@gameion/shared";

interface GameControllerProps {
  onInput: (action: GameInputAction) => void;
}

function TouchButton({
  onTouchStart,
  onTouchEnd,
  children,
  className = "",
}: {
  onTouchStart: () => void;
  onTouchEnd?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9, opacity: 0.8 }}
      onTouchStart={(e) => {
        e.preventDefault();
        onTouchStart();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onTouchEnd?.();
      }}
      onMouseDown={onTouchStart}
      onMouseUp={onTouchEnd}
      onMouseLeave={onTouchEnd}
      className={`
        select-none touch-none
        flex items-center justify-center
        text-white font-bold
        active:bg-neon-500/30 transition-colors
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}

export default function GameController({ onInput }: GameControllerProps) {
  const handleLeftStart = useCallback(() => onInput("move_left"), [onInput]);
  const handleRightStart = useCallback(() => onInput("move_right"), [onInput]);
  const handleMoveEnd = useCallback(() => onInput("idle"), [onInput]);
  const handleJump = useCallback(() => onInput("jump"), [onInput]);

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Top bar spacer */}
      <div className="h-12" />

      {/* Jump zone — upper half of screen */}
      <TouchButton
        onTouchStart={handleJump}
        className="flex-1 bg-transparent active:bg-neon-500/10 rounded-none"
      >
        <div className="flex flex-col items-center gap-1 opacity-40">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          <span className="text-sm">TAP TO JUMP</span>
        </div>
      </TouchButton>

      {/* Movement — full-width left/right at bottom */}
      <div className="flex h-36">
        <TouchButton
          onTouchStart={handleLeftStart}
          onTouchEnd={handleMoveEnd}
          className="flex-1 bg-white/5 border-t border-r border-white/10 rounded-none text-4xl"
        >
          ◀
        </TouchButton>
        <TouchButton
          onTouchStart={handleRightStart}
          onTouchEnd={handleMoveEnd}
          className="flex-1 bg-white/5 border-t border-white/10 rounded-none text-4xl"
        >
          ▶
        </TouchButton>
      </div>
    </div>
  );
}
