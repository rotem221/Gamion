import { AnimatePresence, motion } from "framer-motion";
import type { Player } from "@gameion/shared";
import CrownIcon from "../ui/CrownIcon";

interface PlayersBarProps {
  players: Player[];
}

const AVATAR_EMOJIS: Record<string, string> = {
  robot: "🤖",
  alien: "👽",
  cat: "🐱",
  ninja: "🥷",
  wizard: "🧙",
  pirate: "🏴‍☠️",
  dragon: "🐉",
  ghost: "👻",
};

export default function PlayersBar({ players }: PlayersBarProps) {
  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-sm border-b border-white/10">
      <span className="text-neon-300 text-sm font-medium mr-2">
        Players ({players.length})
      </span>

      <div className="flex items-center gap-3">
        <AnimatePresence mode="popLayout">
          {players.map((player) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5"
            >
              {player.isLeader && <CrownIcon size={16} />}
              <span className="text-xl" role="img" aria-label={player.avatar}>
                {AVATAR_EMOJIS[player.avatar] || "❓"}
              </span>
              <span className="text-sm text-white font-medium">
                {player.name}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {players.length === 0 && (
          <span className="text-white/30 text-sm italic">
            Waiting for players to join...
          </span>
        )}
      </div>
    </div>
  );
}
