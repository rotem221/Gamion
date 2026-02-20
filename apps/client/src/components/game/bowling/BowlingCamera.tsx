import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useBowlingStore } from "../../../stores/bowlingStore";

// Camera positions
const BEHIND_BALL = new THREE.Vector3(0, 2.5, 4);
const BEHIND_BALL_TARGET = new THREE.Vector3(0, 0.5, -8);

const FOLLOW_BALL_OFFSET = new THREE.Vector3(0, 3, 3);
const PIN_VIEW = new THREE.Vector3(0, 3, -14);
const PIN_VIEW_TARGET = new THREE.Vector3(0, 0.2, -16.5);

export default function BowlingCamera() {
  const { camera } = useThree();
  const ballInMotion = useBowlingStore((s) => s.ballInMotion);
  const gameState = useBowlingStore((s) => s.gameState);

  const targetPos = useRef(BEHIND_BALL.clone());
  const targetLook = useRef(BEHIND_BALL_TARGET.clone());

  useFrame((_, delta) => {
    const speed = 2.5 * delta;

    if (ballInMotion) {
      // Follow ball towards pins
      targetPos.current.lerp(PIN_VIEW, speed * 0.8);
      targetLook.current.lerp(PIN_VIEW_TARGET, speed * 0.8);
    } else {
      // Return to behind-ball view
      targetPos.current.lerp(BEHIND_BALL, speed);
      targetLook.current.lerp(BEHIND_BALL_TARGET, speed);
    }

    camera.position.lerp(targetPos.current, speed * 2);
    camera.lookAt(targetLook.current);
  });

  return null;
}
