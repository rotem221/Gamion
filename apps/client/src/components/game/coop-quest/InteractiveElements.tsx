import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CuboidCollider, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import type { LevelTile } from "@gameion/shared";

// Shared state for button-door connections
const buttonStates = new Map<string, boolean>();
const buttonListeners = new Map<string, Set<() => void>>();

function notifyListeners(linkedId: string) {
  buttonListeners.get(linkedId)?.forEach((fn) => fn());
}

export function getButtonState(linkedId: string): boolean {
  return buttonStates.get(linkedId) ?? false;
}

function useButtonState(linkedId: string | undefined): boolean {
  const [pressed, setPressed] = useState(() =>
    linkedId ? getButtonState(linkedId) : false
  );

  useEffect(() => {
    if (!linkedId) return;
    const listener = () => setPressed(getButtonState(linkedId));
    let listeners = buttonListeners.get(linkedId);
    if (!listeners) {
      listeners = new Set();
      buttonListeners.set(linkedId, listeners);
    }
    listeners.add(listener);
    return () => {
      listeners!.delete(listener);
    };
  }, [linkedId]);

  return pressed;
}

export function PressureButton({ tile }: { tile: LevelTile }) {
  const [pressed, setPressed] = useState(false);

  const handleEnter = () => {
    setPressed(true);
    if (tile.linkedId) {
      buttonStates.set(tile.linkedId, true);
      notifyListeners(tile.linkedId);
    }
  };

  const handleExit = () => {
    setPressed(false);
    if (tile.linkedId) {
      buttonStates.set(tile.linkedId, false);
      notifyListeners(tile.linkedId);
    }
  };

  return (
    <RigidBody type="fixed" position={[tile.x + tile.width / 2, tile.y, 0]}>
      <CuboidCollider
        args={[tile.width / 2, 0.15, 0.5]}
        sensor
        onIntersectionEnter={handleEnter}
        onIntersectionExit={handleExit}
      />
      {/* Button base */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[tile.width + 0.1, 0.1, 1.1]} />
        <meshStandardMaterial color="#1a1035" />
      </mesh>
      {/* Button top */}
      <mesh position={[0, pressed ? -0.1 : 0, 0]} castShadow>
        <boxGeometry args={[tile.width, pressed ? 0.1 : 0.3, 1]} />
        <meshStandardMaterial
          color={pressed ? "#22c55e" : "#ef4444"}
          emissive={pressed ? "#22c55e" : "#ef4444"}
          emissiveIntensity={pressed ? 0.6 : 0.3}
        />
      </mesh>
      {/* Indicator light */}
      <pointLight
        position={[0, 0.5, 0.6]}
        color={pressed ? "#22c55e" : "#ef4444"}
        intensity={pressed ? 1.5 : 0.5}
        distance={3}
      />
    </RigidBody>
  );
}

export function Door({ tile }: { tile: LevelTile }) {
  const isOpen = useButtonState(tile.linkedId);
  const rigidBodyRef = useRef<RapierRigidBody>(null);

  // Move the door collider when open/closed
  useFrame(() => {
    if (!rigidBodyRef.current) return;
    const targetY = isOpen ? tile.y + tile.height + 2 : tile.y + tile.height / 2;
    const currentPos = rigidBodyRef.current.translation();
    const newY = currentPos.y + (targetY - currentPos.y) * 0.1;
    rigidBodyRef.current.setTranslation(
      { x: tile.x + tile.width / 2, y: newY, z: 0 },
      true
    );
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition"
      position={[
        tile.x + tile.width / 2,
        tile.y + tile.height / 2,
        0,
      ]}
    >
      <CuboidCollider args={[tile.width / 2, tile.height / 2, 0.5]} />
      <mesh castShadow>
        <boxGeometry args={[tile.width, tile.height, 1]} />
        <meshStandardMaterial
          color={isOpen ? "#22c55e" : "#7c3aed"}
          transparent
          opacity={isOpen ? 0.3 : 0.9}
          emissive={isOpen ? "#22c55e" : "#7c3aed"}
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Door frame glow */}
      <mesh position={[0, 0, 0.51]}>
        <boxGeometry args={[tile.width + 0.15, tile.height + 0.15, 0.02]} />
        <meshBasicMaterial
          color={isOpen ? "#22c55e" : "#a855f7"}
          transparent
          opacity={0.3}
        />
      </mesh>
    </RigidBody>
  );
}

export function Goal({ tile }: { tile: LevelTile }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Gentle pulsing animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <RigidBody type="fixed" position={[tile.x + tile.width / 2, tile.y + tile.height / 2, 0]}>
      <CuboidCollider args={[tile.width / 2, tile.height / 2, 0.5]} sensor />
      <mesh ref={meshRef}>
        <boxGeometry args={[tile.width, tile.height, 1]} />
        <meshStandardMaterial
          color="#fbbf24"
          transparent
          opacity={0.4}
          emissive="#fbbf24"
          emissiveIntensity={0.8}
        />
      </mesh>
      {/* Goal glow light */}
      <pointLight color="#fbbf24" intensity={2} distance={5} />
    </RigidBody>
  );
}
