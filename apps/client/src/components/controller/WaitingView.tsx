import { motion } from "framer-motion";
import type { Player } from "@gameion/shared";
import GlassCard from "../ui/GlassCard";
import CrownIcon from "../ui/CrownIcon";

interface WaitingViewProps {
  players: Player[];
  myPlayer: Player;
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

export default function WaitingView({ players, myPlayer }: WaitingViewProps) {
  return (
    <div className="flex flex-col items-center gap-6 px-4">
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-neon-300 text-lg text-center"
      >
        Waiting for leader to select a game...
      </motion.p>

      <GlassCard className="p-4 w-full max-w-xs">
        <p className="text-neon-400/60 text-xs uppercase tracking-wider mb-3">
          Players in room
        </p>
        <div className="flex flex-col gap-2">
          {players.map((player) => (
            <div
              key={player.id}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg
                ${player.id === myPlayer.id ? "bg-neon-500/20" : "bg-white/5"}
              `}
            >
              {player.isLeader && <CrownIcon size={14} />}
              <span className="text-lg">{AVATAR_EMOJIS[player.avatar] || "❓"}</span>
              <span className="text-sm text-white">
                {player.name}
                {player.id === myPlayer.id && (
                  <span className="text-neon-400 ml-1">(you)</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
