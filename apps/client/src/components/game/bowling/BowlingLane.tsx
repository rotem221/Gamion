import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { BOWLING } from "@gameion/shared";

export default function BowlingLane() {
  const laneLen = BOWLING.LANE_LENGTH;
  const laneW = BOWLING.LANE_WIDTH;
  const wallH = 3;

  return (
    <>
      {/* Main lane surface — wood-style */}
      <RigidBody type="fixed" position={[0, -0.05, -laneLen / 2]}>
        <CuboidCollider args={[laneW / 2, 0.05, laneLen / 2]} friction={0.35} />
        <mesh receiveShadow>
          <boxGeometry args={[laneW, 0.1, laneLen]} />
          <meshStandardMaterial color="#3d2b1f" roughness={0.3} metalness={0.1} />
        </mesh>
      </RigidBody>

      {/* Lane board lines (wood planks effect) */}
      {Array.from({ length: 9 }, (_, i) => {
        const x = -laneW / 2 + (laneW / 9) * (i + 0.5);
        return (
          <mesh key={`line-${i}`} position={[x, 0.011, -laneLen / 2]}>
            <boxGeometry args={[0.005, 0.001, laneLen]} />
            <meshBasicMaterial color="#5a3e2b" transparent opacity={0.4} />
          </mesh>
        );
      })}

      {/* Foul line */}
      <mesh position={[0, 0.012, -0.5]}>
        <boxGeometry args={[laneW, 0.002, 0.03]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Arrow guide marks */}
      {[-0.45, -0.22, 0, 0.22, 0.45].map((x, i) => (
        <mesh key={`arrow-${i}`} position={[x, 0.012, -3.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.04, 0.12, 3]} />
          <meshBasicMaterial color={i === 2 ? "#ef4444" : "#a855f7"} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Dot markers */}
      {[-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => (
        <mesh key={`dot-${i}`} position={[x, 0.012, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.02, 16]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Gutters — deeper channels */}
      {[-1, 1].map((side) => (
        <RigidBody
          key={`gutter-${side}`}
          type="fixed"
          position={[side * (laneW / 2 + 0.15), -0.2, -laneLen / 2]}
        >
          <CuboidCollider args={[0.15, 0.2, laneLen / 2]} />
          <mesh receiveShadow>
            <boxGeometry args={[0.3, 0.4, laneLen]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
        </RigidBody>
      ))}

      {/* Side walls — alley walls */}
      {[-1, 1].map((side) => (
        <mesh key={`wall-${side}`} position={[side * (laneW / 2 + 0.6), wallH / 2, -laneLen / 2]}>
          <boxGeometry args={[0.3, wallH, laneLen + 2]} />
          <meshStandardMaterial color="#1a1035" emissive="#1a1035" emissiveIntensity={0.1} />
        </mesh>
      ))}

      {/* Neon strips along the tops of side walls */}
      {[-1, 1].map((side) => (
        <mesh key={`neon-${side}`} position={[side * (laneW / 2 + 0.6), wallH + 0.02, -laneLen / 2]}>
          <boxGeometry args={[0.15, 0.04, laneLen + 2]} />
          <meshBasicMaterial color="#7c3aed" />
        </mesh>
      ))}

      {/* Ceiling */}
      <mesh position={[0, wallH + 0.3, -laneLen / 2]}>
        <boxGeometry args={[laneW + 1.8, 0.1, laneLen + 2]} />
        <meshStandardMaterial color="#0a0520" />
      </mesh>

      {/* Pin deck area — slightly different surface */}
      <mesh position={[0, 0.011, -laneLen + 1.5]} receiveShadow>
        <boxGeometry args={[laneW, 0.002, 3]} />
        <meshStandardMaterial color="#4a3628" roughness={0.4} />
      </mesh>

      {/* Back wall (behind pins) */}
      <RigidBody type="fixed" position={[0, 0.5, -(laneLen + 0.5)]}>
        <CuboidCollider args={[laneW / 2 + 0.5, 1, 0.25]} />
        <mesh>
          <boxGeometry args={[laneW + 1, 2, 0.5]} />
          <meshStandardMaterial color="#0a0520" />
        </mesh>
      </RigidBody>

      {/* Back curtain (behind back wall) */}
      <mesh position={[0, 1.5, -(laneLen + 1)]}>
        <boxGeometry args={[laneW + 2, wallH, 0.1]} />
        <meshStandardMaterial color="#1a0a3e" />
      </mesh>

      {/* Floor under everything — catch-all */}
      <RigidBody type="fixed" position={[0, -0.5, -laneLen / 2]}>
        <CuboidCollider args={[5, 0.4, laneLen]} />
      </RigidBody>

      {/* Floor visual (approach area behind the lane) */}
      <mesh position={[0, -0.06, 2]} receiveShadow>
        <boxGeometry args={[4, 0.02, 4]} />
        <meshStandardMaterial color="#2a1a0f" roughness={0.5} />
      </mesh>
    </>
  );
}
