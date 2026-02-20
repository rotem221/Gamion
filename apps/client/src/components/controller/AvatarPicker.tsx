import { motion } from "framer-motion";
import { AVATARS } from "@gameion/shared";

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
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

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {AVATARS.map((avatar) => (
        <motion.button
          key={avatar}
          whileTap={{ scale: 0.85 }}
          onClick={() => onSelect(avatar)}
          className={`
            w-16 h-16 rounded-xl flex items-center justify-center text-3xl
            transition-all duration-200
            ${
              selected === avatar
                ? "bg-neon-500/30 border-2 border-neon-400 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                : "bg-white/5 border border-white/10 hover:bg-white/10"
            }
          `}
          aria-label={avatar}
        >
          {AVATAR_EMOJIS[avatar]}
        </motion.button>
      ))}
    </div>
  );
}
