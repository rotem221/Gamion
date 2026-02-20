import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useBowlingStore } from "../../../stores/bowlingStore";
import BowlingLane from "./BowlingLane";
import BowlingPins, { type PinRefs } from "./BowlingPins";
import BowlingBall, { type BallRef } from "./BowlingBall";
import BowlingCamera from "./BowlingCamera";

interface BowlingSceneProps {
  playerIndex: number;
}

export default function BowlingScene({ playerIndex }: BowlingSceneProps) {
  const pinsRef = useRef<PinRefs>(null);
  const ballRef = useRef<BallRef>(null);

  const pendingThrow = useBowlingStore((s) => s.pendingThrow);
  const setPendingThrow = useBowlingStore((s) => s.setPendingThrow);
  const setBallInMotion = useBowlingStore((s) => s.setBallInMotion);
  const lastThrowResult = useBowlingStore((s) => s.lastThrowResult);
  const gameState = useBowlingStore((s) => s.gameState);

  const ballMovingRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Launch ball when a pending throw arrives
  useEffect(() => {
    if (!pendingThrow || !ballRef.current) return;

    ballRef.current.launch(pendingThrow.speed, pendingThrow.angle, pendingThrow.spin);
    setBallInMotion(true);
    ballMovingRef.current = true;
    setPendingThrow(null);
  }, [pendingThrow, setPendingThrow, setBallInMotion]);

  // Handle throw result from server
  useEffect(() => {
    if (!lastThrowResult || !pinsRef.current) return;

    settleTimerRef.current = setTimeout(() => {
      pinsRef.current?.resetSelectedPins(lastThrowResult.pinStates);
    }, 2000);

    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [lastThrowResult]);

  // When phase changes to "waiting" (new turn), reset ball and pins
  const prevFrameRef = useRef<number>(-1);
  useEffect(() => {
    if (!gameState) return;

    const { currentFrame, currentThrowInFrame, phase } = gameState;

    if (phase === "waiting") {
      ballRef.current?.reset();
      setBallInMotion(false);
      ballMovingRef.current = false;

      if (currentThrowInFrame === 0 && currentFrame !== prevFrameRef.current) {
        pinsRef.current?.resetPins();
        prevFrameRef.current = currentFrame;
      }
    }
  }, [gameState?.phase, gameState?.currentFrame, gameState?.currentThrowInFrame, setBallInMotion]);

  // Track ball position
  useFrame(() => {
    if (!ballMovingRef.current || !ballRef.current) return;

    const pos = ballRef.current.getPosition();
    if (!pos) return;

    if (pos.y < -2 || pos.z < -20) {
      ballMovingRef.current = false;
      setBallInMotion(false);
    }
  });

  return (
    <>
      <BowlingCamera />

      {/* Ambient fill */}
      <ambientLight intensity={0.15} color="#b8a9e8" />

      {/* Main overhead light */}
      <directionalLight
        position={[2, 12, 2]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={40}
        shadow-camera-near={0.5}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-20}
        color="#fff8f0"
      />

      {/* Spot light on pins — dramatic overhead */}
      <spotLight
        position={[0, 8, -16]}
        angle={0.35}
        penumbra={0.6}
        intensity={3}
        castShadow
        color="#fff0e0"
      />

      {/* Secondary pin light from side */}
      <spotLight
        position={[-2, 6, -15]}
        angle={0.4}
        penumbra={0.8}
        intensity={1}
        color="#d4c4ff"
      />

      {/* Neon glow strips along the lane */}
      <pointLight position={[-1.2, 0.3, -4]} intensity={0.8} color="#7c3aed" distance={6} />
      <pointLight position={[1.2, 0.3, -4]} intensity={0.8} color="#7c3aed" distance={6} />
      <pointLight position={[-1.2, 0.3, -10]} intensity={0.6} color="#a855f7" distance={6} />
      <pointLight position={[1.2, 0.3, -10]} intensity={0.6} color="#a855f7" distance={6} />

      {/* Approach area light */}
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#7c3aed" distance={8} />

      {/* Background atmosphere */}
      <fog attach="fog" args={["#0a0520", 18, 35]} />
      <color attach="background" args={["#0a0520"]} />

      <BowlingLane />
      <BowlingPins ref={pinsRef} />
      <BowlingBall ref={ballRef} playerIndex={playerIndex} />

      {/* Post-processing bloom */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          intensity={0.8}
        />
      </EffectComposer>
    </>
  );
}
