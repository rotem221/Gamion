import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { GAME_PHYSICS } from "@gameion/shared";
import CoopQuestScene from "./coop-quest/CoopQuestScene";
import BowlingScene from "./bowling/BowlingScene";

interface GameCanvasProps {
  gameId: string;
  roomId: string;
  playerIndex?: number;
}

export default function GameCanvas({ gameId, roomId, playerIndex = 0 }: GameCanvasProps) {
  const isBowling = gameId === "bowling";
  const isCoop = gameId === "coop-quest";

  // Unknown game ID — show error instead of blank canvas
  if (!isBowling && !isCoop) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f0a2e] text-center px-6">
        <div className="text-5xl mb-4">&#10068;</div>
        <h2 className="text-xl font-bold text-white mb-2">Unknown Game</h2>
        <p className="text-white/50 text-sm mb-6">
          Game &quot;{gameId}&quot; is not available.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-xl bg-neon-500/20 border border-neon-400/50 text-neon-200 text-sm font-medium hover:bg-neon-500/30 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <Canvas
      camera={
        isBowling
          ? { position: [0, 2.5, 4], fov: 55 }
          : { position: [0, 5, 15], fov: 50 }
      }
      shadows
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, toneMapping: 3 /* ACESFilmic */ }}
      onCreated={(state) => {
        // Ensure canvas is properly sized
        state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }}
    >
      <Physics gravity={[0, isBowling ? -9.81 : GAME_PHYSICS.GRAVITY, 0]}>
        {isCoop && <CoopQuestScene roomId={roomId} />}
        {isBowling && <BowlingScene playerIndex={playerIndex} />}
      </Physics>
    </Canvas>
  );
}
