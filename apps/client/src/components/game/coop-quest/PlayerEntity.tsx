import { useRef, useEffect } from "react";
import { RigidBody, CapsuleCollider, type RapierRigidBody } from "@react-three/rapier";
import { GAME_PHYSICS } from "@gameion/shared";
import type { PlayerSlot } from "@gameion/shared";
import { playerRefs } from "./playerRefs";

interface PlayerEntityProps {
  slot: PlayerSlot;
  color: string;
  spawnPosition: [number, number, number];
}

export default function PlayerEntity({ slot, color, spawnPosition }: PlayerEntityProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);

  useEffect(() => {
    playerRefs.set(slot, rigidBodyRef);
    return () => {
      playerRefs.delete(slot);
    };
  }, [slot]);

  const r = GAME_PHYSICS.PLAYER_RADIUS;
  const h = GAME_PHYSICS.PLAYER_HEIGHT;

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={spawnPosition}
      lockRotations
      linearDamping={0.5}
      mass={1}
    >
      <CapsuleCollider args={[h / 2, r]} />

      {/* Body */}
      <mesh castShadow position={[0, -0.1, 0]}>
        <capsuleGeometry args={[r * 0.9, h * 0.7, 8, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, h / 2 + r * 0.3, 0]}>
        <sphereGeometry args={[r * 0.7, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>

      {/* Left eye */}
      <mesh position={[-r * 0.25, h / 2 + r * 0.35, r * 0.55]}>
        <sphereGeometry args={[r * 0.15, 8, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[-r * 0.25, h / 2 + r * 0.35, r * 0.65]}>
        <sphereGeometry args={[r * 0.08, 8, 8]} />
        <meshBasicMaterial color="#111" />
      </mesh>

      {/* Right eye */}
      <mesh position={[r * 0.25, h / 2 + r * 0.35, r * 0.55]}>
        <sphereGeometry args={[r * 0.15, 8, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[r * 0.25, h / 2 + r * 0.35, r * 0.65]}>
        <sphereGeometry args={[r * 0.08, 8, 8]} />
        <meshBasicMaterial color="#111" />
      </mesh>

      {/* Glow ring at feet */}
      <mesh position={[0, -h / 2 - r + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      {/* Slot indicator floating above head */}
      <mesh position={[0, h / 2 + r * 1.2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}
