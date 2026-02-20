import { AnimatePresence, motion } from "framer-motion";
import type { Player } from "@gameion/shared";

interface GameSidebarProps {
  players: Player[];
  streams: Map<string, MediaStream>;
  roomId: string;
}

function PlayerBubble({
  player,
  stream,
}: {
  player: Player;
  stream?: MediaStream;
}) {
  const videoRef = (el: HTMLVideoElement | null) => {
    if (el && stream) {
      el.srcObject = stream;
      el.play().catch(() => {});
    }
  };

  const avatarColors: Record<string, string> = {
    robot: "#3b82f6",
    alien: "#22c55e",
    cat: "#f59e0b",
    ninja: "#6366f1",
    wizard: "#a855f7",
    pirate: "#ef4444",
    dragon: "#f97316",
    ghost: "#06b6d4",
  };

  const bgColor = avatarColors[player.avatar] ?? "#7c3aed";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col items-center gap-1"
    >
      <div className="relative">
        <div
          className="w-14 h-14 rounded-full overflow-hidden border-2 shadow-lg"
          style={{
            borderColor: bgColor,
            boxShadow: `0 0 12px ${bgColor}40`,
          }}
        >
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-xl"
              style={{ backgroundColor: `${bgColor}30` }}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {player.isLeader && (
          <div className="absolute -top-1 -right-1 text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        )}
      </div>
      <span className="text-[10px] text-white/70 truncate w-14 text-center">
        {player.name}
      </span>
    </motion.div>
  );
}

export default function GameSidebar({ players, streams, roomId }: GameSidebarProps) {
  return (
    <div className="absolute top-3 right-3 z-40 flex flex-col items-center gap-3">
      {/* Room ID */}
      <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
        <span className="text-white/50 text-xs font-mono">{roomId}</span>
      </div>

      {/* Player list */}
      <div className="flex flex-col items-center gap-2 bg-black/30 backdrop-blur-sm rounded-2xl p-2 border border-white/5">
        <AnimatePresence>
          {players.map((player) => (
            <PlayerBubble
              key={player.id}
              player={player}
              stream={streams.get(player.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
