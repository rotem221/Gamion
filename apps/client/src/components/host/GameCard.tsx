import { motion } from "framer-motion";
import type { GameDefinition } from "@gameion/shared";
import GlassCard from "../ui/GlassCard";

interface GameCardProps {
  game: GameDefinition;
  isHighlighted: boolean;
  isDisabled: boolean;
  disabledReason?: string;
  onClick?: () => void;
}

const GAME_ICONS: Record<string, string> = {
  "coop-quest": "⚔️",
  bowling: "🎳",
};

export default function GameCard({
  game,
  isHighlighted,
  isDisabled,
  disabledReason,
  onClick,
}: GameCardProps) {
  return (
    <div className="relative group">
      <motion.div
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
      >
        <GlassCard
          onClick={isDisabled ? undefined : onClick}
          className={`
            p-6 cursor-pointer transition-all duration-300
            ${isHighlighted ? "border-neon-400 shadow-[0_0_30px_rgba(124,58,237,0.6)] bg-white/10" : ""}
            ${isDisabled ? "opacity-50 grayscale cursor-not-allowed" : ""}
          `}
        >
          <div className="text-5xl mb-4">
            {GAME_ICONS[game.id] || "🎮"}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
          <p className="text-neon-300/70 text-sm">{game.description}</p>
          <p className="text-neon-400/50 text-xs mt-2">
            {game.exactPlayers
              ? `${game.exactPlayers} players`
              : `${game.minPlayers}-${game.maxPlayers} players`}
          </p>
        </GlassCard>
      </motion.div>

      {isDisabled && disabledReason && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <div className="bg-neon-900 border border-neon-500/50 text-neon-200 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            {disabledReason}
          </div>
        </div>
      )}
    </div>
  );
}
