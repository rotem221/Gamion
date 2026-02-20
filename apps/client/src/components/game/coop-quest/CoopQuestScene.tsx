import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LEVEL_1, GAME_PHYSICS } from "@gameion/shared";
import { useGameStore } from "../../../stores/gameStore";
import Level from "./Level";
import PlayerEntity from "./PlayerEntity";
import CameraController from "./CameraController";
import { playerRefs } from "./playerRefs";

const PLAYER_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"];

function StarField({ positions }: { positions: Float32Array }) {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  return (
    <points geometry={geom}>
      <pointsMaterial size={0.15} color="#c4b5fd" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

interface CoopQuestSceneProps {
  roomId: string;
}

export default function CoopQuestScene({ roomId }: CoopQuestSceneProps) {
  const slotAssignments = useGameStore((s) => s.slotAssignments);

  // Find spawn positions from level data
  const spawns = LEVEL_1.tiles.filter((t) => t.type === "spawn");

  // Apply inputs every frame
  useFrame(() => {
    const store = useGameStore.getState();
    const { currentActions } = store;

    // Apply continuous movement
    for (const [slot, action] of currentActions) {
      const ref = playerRefs.get(slot)?.current;
      if (!ref) continue;

      const vel = ref.linvel();

      if (action === "move_left") {
        ref.setLinvel({ x: -GAME_PHYSICS.MOVE_SPEED, y: vel.y, z: 0 }, true);
      } else if (action === "move_right") {
        ref.setLinvel({ x: GAME_PHYSICS.MOVE_SPEED, y: vel.y, z: 0 }, true);
      } else if (action === "idle") {
        ref.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
      }

      // Respawn if fallen off
      const pos = ref.translation();
      if (pos.y < -5) {
        const spawn = spawns.find((s) => s.slot === slot);
        const sx = spawn ? spawn.x : 2 + slot * 2;
        const sy = spawn ? spawn.y : 2;
        ref.setTranslation({ x: sx, y: sy, z: 0 }, true);
        ref.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }

      // Constrain to Z=0 (prevent drift)
      const curPos = ref.translation();
      if (Math.abs(curPos.z) > 0.01) {
        ref.setTranslation({ x: curPos.x, y: curPos.y, z: 0 }, true);
      }
    }

    // Apply jump impulses (one-shot)
    const jumps = store.drainJumps();
    for (const slot of jumps) {
      const ref = playerRefs.get(slot)?.current;
      if (!ref) continue;

      const vel = ref.linvel();
      // Only jump if approximately grounded (low vertical velocity)
      if (Math.abs(vel.y) < 1.0) {
        ref.setLinvel({ x: vel.x, y: GAME_PHYSICS.JUMP_FORCE, z: 0 }, true);
      }
    }
  });

  // Determine how many player entities to spawn
  const playerSlots = slotAssignments ? Object.values(slotAssignments) : [0, 1];

  // Starfield background
  const starsPositions = useMemo(() => {
    const positions = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 50 + 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 20;
    }
    return positions;
  }, []);

  return (
    <>
      {/* Scene lighting */}
      <ambientLight intensity={0.25} color="#b8a9e8" />
      <directionalLight
        position={[20, 15, 10]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color="#e8d8ff"
      />

      {/* Background atmosphere */}
      <fog attach="fog" args={["#0c0626", 30, 80]} />
      <color attach="background" args={["#0c0626"]} />

      {/* Starfield */}
      <StarField positions={starsPositions} />

      {/* Ground plane below the level */}
      <mesh position={[20, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 10]} />
        <meshStandardMaterial color="#0c0626" emissive="#1e1b4b" emissiveIntensity={0.15} />
      </mesh>

      {/* Ambient glow lights along the level */}
      <pointLight position={[5, 3, 2]} intensity={0.6} color="#7c3aed" distance={12} />
      <pointLight position={[20, 3, 2]} intensity={0.6} color="#a855f7" distance={12} />
      <pointLight position={[35, 3, 2]} intensity={0.6} color="#7c3aed" distance={12} />
      <pointLight position={[48, 5, 2]} intensity={0.8} color="#22c55e" distance={10} />

      <Level levelData={LEVEL_1} />

      {playerSlots.map((slot) => {
        const spawn = spawns.find((s) => s.slot === slot);
        const pos: [number, number, number] = spawn
          ? [spawn.x, spawn.y, 0]
          : [2 + slot * 2, 2, 0];

        return (
          <PlayerEntity
            key={slot}
            slot={slot}
            color={PLAYER_COLORS[slot] ?? "#ffffff"}
            spawnPosition={pos}
          />
        );
      })}

      <CameraController />
    </>
  );
}
