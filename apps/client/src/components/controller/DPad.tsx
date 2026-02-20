import { motion } from "framer-motion";
import type { MenuDirection } from "@gameion/shared";

interface DPadProps {
  onPress: (direction: MenuDirection) => void;
}

function DPadButton({
  direction,
  onPress,
  children,
  className = "",
}: {
  direction: MenuDirection;
  onPress: (d: MenuDirection) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.85, backgroundColor: "rgba(124, 58, 237, 0.4)" }}
      onTouchStart={(e) => {
        e.preventDefault();
        onPress(direction);
      }}
      onClick={() => onPress(direction)}
      className={`
        w-20 h-20 rounded-xl bg-white/10 border border-white/20
        flex items-center justify-center text-2xl text-white
        active:bg-neon-500/30 transition-colors
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}

export default function DPad({ onPress }: DPadProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <DPadButton direction="up" onPress={onPress}>
        ▲
      </DPadButton>

      <div className="flex items-center gap-2">
        <DPadButton direction="left" onPress={onPress}>
          ◀
        </DPadButton>

        <DPadButton
          direction="select"
          onPress={onPress}
          className="bg-neon-500/20 border-neon-400/50"
        >
          OK
        </DPadButton>

        <DPadButton direction="right" onPress={onPress}>
          ▶
        </DPadButton>
      </div>

      <DPadButton direction="down" onPress={onPress}>
        ▼
      </DPadButton>
    </div>
  );
}
