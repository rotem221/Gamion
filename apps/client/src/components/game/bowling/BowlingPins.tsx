import { useRef, useImperativeHandle, forwardRef, useMemo } from "react";
import { RigidBody, CylinderCollider, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { BOWLING } from "@gameion/shared";

export interface PinRefs {
  getPinStates: () => boolean[];
  resetPins: () => void;
  resetSelectedPins: (standing: boolean[]) => void;
}

const PIN_Y = BOWLING.PIN_HEIGHT / 2;
const PIN_Z_OFFSET = -BOWLING.LANE_LENGTH + 1.5;

/** A single bowling pin with realistic tapered shape */
function PinMesh() {
  const r = BOWLING.PIN_RADIUS;
  const h = BOWLING.PIN_HEIGHT;

  // Build a lathe geometry for pin shape using a profile curve
  const points = useMemo(() => [
    new THREE.Vector2(r * 0.3, 0),         // Bottom tip
    new THREE.Vector2(r * 1.0, h * 0.05),  // Base
    new THREE.Vector2(r * 1.1, h * 0.12),  // Wide belly bottom
    new THREE.Vector2(r * 1.0, h * 0.3),   // Belly
    new THREE.Vector2(r * 0.55, h * 0.55), // Neck
    new THREE.Vector2(r * 0.4, h * 0.65),  // Narrowest
    new THREE.Vector2(r * 0.55, h * 0.75), // Head start
    new THREE.Vector2(r * 0.6, h * 0.85),  // Head
    new THREE.Vector2(r * 0.45, h * 0.95), // Top taper
    new THREE.Vector2(r * 0.1, h * 1.0),   // Top
  ], [r, h]);

  return (
    <group>
      {/* Main pin body */}
      <mesh castShadow>
        <latheGeometry args={[points, 12]} />
        <meshStandardMaterial
          color="#f5f0e8"
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      {/* Red neck stripe */}
      <mesh position={[0, h * 0.55, 0]}>
        <cylinderGeometry args={[r * 0.5, r * 0.45, h * 0.06, 12]} />
        <meshStandardMaterial
          color="#dc2626"
          emissive="#dc2626"
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Second red stripe slightly above */}
      <mesh position={[0, h * 0.62, 0]}>
        <cylinderGeometry args={[r * 0.48, r * 0.52, h * 0.04, 12]} />
        <meshStandardMaterial
          color="#dc2626"
          emissive="#dc2626"
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Top cap highlight */}
      <mesh position={[0, h * 0.98, 0]}>
        <sphereGeometry args={[r * 0.12, 8, 8]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.2} />
      </mesh>
    </group>
  );
}

const BowlingPins = forwardRef<PinRefs>(function BowlingPins(_, ref) {
  const pinRefs = useRef<(RapierRigidBody | null)[]>([]);

  useImperativeHandle(ref, () => ({
    getPinStates() {
      return pinRefs.current.map((pinRef) => {
        if (!pinRef) return false;
        const pos = pinRef.translation();
        return pos.y > 0.05 && pos.y < 0.5;
      });
    },

    resetPins() {
      BOWLING.PIN_POSITIONS.forEach(([x, z], i) => {
        const pinRef = pinRefs.current[i];
        if (!pinRef) return;
        pinRef.setTranslation({ x, y: PIN_Y, z: PIN_Z_OFFSET + z }, true);
        pinRef.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
        pinRef.setLinvel({ x: 0, y: 0, z: 0 }, true);
        pinRef.setAngvel({ x: 0, y: 0, z: 0 }, true);
      });
    },

    resetSelectedPins(standing: boolean[]) {
      BOWLING.PIN_POSITIONS.forEach(([x, z], i) => {
        const pinRef = pinRefs.current[i];
        if (!pinRef) return;
        if (standing[i]) {
          pinRef.setTranslation({ x, y: PIN_Y, z: PIN_Z_OFFSET + z }, true);
          pinRef.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
          pinRef.setLinvel({ x: 0, y: 0, z: 0 }, true);
          pinRef.setAngvel({ x: 0, y: 0, z: 0 }, true);
        } else {
          pinRef.setTranslation({ x: 10 + i, y: -5, z: 0 }, true);
          pinRef.setLinvel({ x: 0, y: 0, z: 0 }, true);
          pinRef.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
      });
    },
  }));

  return (
    <>
      {BOWLING.PIN_POSITIONS.map(([x, z], i) => (
        <RigidBody
          key={i}
          ref={(el) => { pinRefs.current[i] = el; }}
          position={[x, PIN_Y, PIN_Z_OFFSET + z]}
          mass={BOWLING.PIN_MASS}
          restitution={BOWLING.PIN_RESTITUTION}
          linearDamping={0.3}
          angularDamping={0.3}
        >
          <CylinderCollider
            args={[BOWLING.PIN_HEIGHT / 2 - 0.02, BOWLING.PIN_RADIUS - 0.01]}
          />
          <PinMesh />
        </RigidBody>
      ))}

      {/* Pin deck spot lights — illuminate each pin */}
      <spotLight
        position={[0, 3, PIN_Z_OFFSET - 0.4]}
        angle={0.5}
        penumbra={0.8}
        intensity={3}
        color="#fff8e7"
        castShadow
        target-position={[0, 0, PIN_Z_OFFSET - 0.4]}
      />
    </>
  );
});

export default BowlingPins;
