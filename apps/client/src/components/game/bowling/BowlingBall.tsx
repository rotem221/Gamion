import { useRef, useImperativeHandle, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, BallCollider, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { BOWLING } from "@gameion/shared";

export interface BallRef {
  launch: (speed: number, angle: number, spin: number) => void;
  reset: () => void;
  getPosition: () => { x: number; y: number; z: number } | null;
}

const BALL_START_Z = 0.5;
const BALL_START_Y = BOWLING.BALL_RADIUS + 0.05;

const PLAYER_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4", "#f97316"];

interface BowlingBallProps {
  playerIndex: number;
}

const BowlingBall = forwardRef<BallRef, BowlingBallProps>(function BowlingBall({ playerIndex }, ref) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
  const isRollingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    launch(speed: number, angle: number, spin: number) {
      const rb = rigidBodyRef.current;
      if (!rb) return;

      rb.setTranslation({ x: 0, y: BALL_START_Y, z: BALL_START_Z }, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.setAngvel({ x: 0, y: 0, z: 0 }, true);

      const clampedSpeed = Math.min(speed, BOWLING.MAX_BALL_SPEED);
      const xForce = Math.sin(angle) * clampedSpeed * BOWLING.BALL_MASS * 0.5;
      const zForce = -Math.cos(angle) * clampedSpeed * BOWLING.BALL_MASS;

      rb.applyImpulse({ x: xForce, y: 0, z: zForce }, true);
      rb.setAngvel({ x: clampedSpeed * 8, y: spin * 3, z: 0 }, true);
      isRollingRef.current = true;
    },

    reset() {
      const rb = rigidBodyRef.current;
      if (!rb) return;
      rb.setTranslation({ x: 0, y: BALL_START_Y, z: BALL_START_Z }, true);
      rb.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
      isRollingRef.current = false;
    },

    getPosition() {
      const rb = rigidBodyRef.current;
      if (!rb) return null;
      const pos = rb.translation();
      return { x: pos.x, y: pos.y, z: pos.z };
    },
  }));

  // Animate the rolling trail / glow effect
  useFrame(() => {
    if (!rigidBodyRef.current) return;
    const vel = rigidBodyRef.current.linvel();
    const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
    if (speed < 0.1) {
      isRollingRef.current = false;
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[0, BALL_START_Y, BALL_START_Z]}
      mass={BOWLING.BALL_MASS}
      restitution={0.4}
      linearDamping={0.1}
      angularDamping={0.05}
    >
      <BallCollider args={[BOWLING.BALL_RADIUS]} friction={0.4} />

      {/* Main ball */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[BOWLING.BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.1}
          metalness={0.7}
        />
      </mesh>

      {/* Finger holes (3 holes on top) */}
      {[
        [0, BOWLING.BALL_RADIUS * 0.85, -BOWLING.BALL_RADIUS * 0.15],
        [-BOWLING.BALL_RADIUS * 0.18, BOWLING.BALL_RADIUS * 0.75, -BOWLING.BALL_RADIUS * 0.25],
        [BOWLING.BALL_RADIUS * 0.18, BOWLING.BALL_RADIUS * 0.75, -BOWLING.BALL_RADIUS * 0.25],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[BOWLING.BALL_RADIUS * 0.1, 8, 8]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      ))}

      {/* Inner glow (point light that moves with the ball) */}
      <pointLight
        color={color}
        intensity={1.5}
        distance={2}
      />
    </RigidBody>
  );
});

export default BowlingBall;
