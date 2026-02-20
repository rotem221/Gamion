import { RigidBody, CuboidCollider } from "@react-three/rapier";
import type { LevelDefinition, LevelTile } from "@gameion/shared";
import { PressureButton, Door, Goal } from "./InteractiveElements";

function Platform({ tile }: { tile: LevelTile }) {
  const isGround = tile.height >= 1 && tile.width > 10;

  return (
    <RigidBody type="fixed" position={[tile.x + tile.width / 2, tile.y + tile.height / 2, 0]}>
      <CuboidCollider args={[tile.width / 2, tile.height / 2, 1]} />
      {/* Main body */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[tile.width, tile.height, 2]} />
        <meshStandardMaterial
          color={isGround ? "#1a0b3e" : "#2e1065"}
          emissive={isGround ? "#1a0b3e" : "#4c1d95"}
          emissiveIntensity={0.15}
          roughness={0.7}
        />
      </mesh>
      {/* Top surface highlight */}
      <mesh position={[0, tile.height / 2 + 0.01, 0]}>
        <boxGeometry args={[tile.width, 0.03, 2]} />
        <meshBasicMaterial
          color={isGround ? "#6d28d9" : "#a855f7"}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Front face edge glow */}
      <mesh position={[0, 0, 1.01]}>
        <boxGeometry args={[tile.width, tile.height, 0.02]} />
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.15}
        />
      </mesh>
      {/* Side edge glows for small platforms */}
      {!isGround && (
        <>
          <mesh position={[-tile.width / 2 - 0.01, 0, 0]}>
            <boxGeometry args={[0.03, tile.height, 2]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.3} />
          </mesh>
          <mesh position={[tile.width / 2 + 0.01, 0, 0]}>
            <boxGeometry args={[0.03, tile.height, 2]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.3} />
          </mesh>
        </>
      )}
    </RigidBody>
  );
}

interface LevelProps {
  levelData: LevelDefinition;
}

export default function Level({ levelData }: LevelProps) {
  return (
    <>
      {levelData.tiles.map((tile, i) => {
        switch (tile.type) {
          case "platform":
            return <Platform key={i} tile={tile} />;
          case "button":
            return <PressureButton key={i} tile={tile} />;
          case "door":
            return <Door key={i} tile={tile} />;
          case "goal":
            return <Goal key={i} tile={tile} />;
          case "spawn":
            return null;
          default:
            return null;
        }
      })}
    </>
  );
}
