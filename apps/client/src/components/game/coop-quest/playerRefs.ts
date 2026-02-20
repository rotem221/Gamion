import type { RapierRigidBody } from "@react-three/rapier";
import type { RefObject } from "react";
import type { PlayerSlot } from "@gameion/shared";

// Module-level map: allows useFrame in CoopQuestScene to access RigidBody refs
// without triggering React re-renders
export const playerRefs = new Map<PlayerSlot, RefObject<RapierRigidBody | null>>();
