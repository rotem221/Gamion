import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Player } from "@gameion/shared";

interface VideoBubblesProps {
  streams: Map<string, MediaStream>;
  players: Player[];
}

function VideoBubble({
  stream,
  playerName,
}: {
  stream: MediaStream;
  playerName: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      // Try to play with audio — browser may block until user interaction
      videoRef.current.play().catch(() => {
        // Autoplay blocked — will be unmuted via user gesture
      });
    }
  }, [stream]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="relative"
    >
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-neon-400 shadow-[0_0_15px_rgba(124,58,237,0.5)]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover scale-x-[-1]"
        />
      </div>
      <p className="text-xs text-white text-center mt-1 truncate w-20">
        {playerName}
      </p>
    </motion.div>
  );
}

export default function VideoBubbles({ streams, players }: VideoBubblesProps) {
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Unlock audio on first user interaction (required by browsers)
  useEffect(() => {
    if (audioUnlocked) return;
    const unlock = () => {
      setAudioUnlocked(true);
      // Try to play all video elements with audio
      document.querySelectorAll<HTMLVideoElement>("video[data-remote]").forEach((v) => {
        v.muted = false;
        v.play().catch(() => {});
      });
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [audioUnlocked]);

  if (streams.size === 0) return null;

  const entries = Array.from(streams.entries());

  return (
    <div className="fixed bottom-4 left-4 flex flex-col-reverse gap-3 z-50">
      <AnimatePresence>
        {entries.map(([socketId, stream]) => {
          const player = players.find((p) => p.id === socketId);
          return (
            <VideoBubble
              key={socketId}
              stream={stream}
              playerName={player?.name ?? "Player"}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
