import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { playerRefs } from "./playerRefs";

export default function CameraController() {
  useFrame(({ camera }) => {
    const p0 = playerRefs.get(0)?.current?.translation();
    const p1 = playerRefs.get(1)?.current?.translation();

    if (!p0 && !p1) return;

    let targetX: number;
    let targetY: number;
    let distance = 0;

    if (p0 && p1) {
      targetX = (p0.x + p1.x) / 2;
      targetY = (p0.y + p1.y) / 2;
      distance = Math.abs(p0.x - p1.x);
    } else {
      const p = p0 ?? p1!;
      targetX = p.x;
      targetY = p.y;
    }

    // Zoom out when players are far apart
    const baseZ = 15;
    const targetZ = baseZ + Math.max(0, distance - 8) * 0.5;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + 4, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.03);
    camera.lookAt(targetX, targetY + 1, 0);
  });

  return null;
}
