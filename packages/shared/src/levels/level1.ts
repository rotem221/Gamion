import type { LevelDefinition } from "../types.js";

export const LEVEL_1: LevelDefinition = {
  id: "level-1",
  name: "First Steps",
  width: 60,
  height: 12,
  tiles: [
    // Ground floor
    { type: "platform", x: 0, y: 0, width: 15, height: 1 },

    // Player spawns
    { type: "spawn", x: 2, y: 1.5, width: 1, height: 1, slot: 0 },
    { type: "spawn", x: 4, y: 1.5, width: 1, height: 1, slot: 1 },

    // Small stepping platforms — lower so players can reach them
    { type: "platform", x: 8, y: 1.8, width: 3, height: 0.5 },
    { type: "platform", x: 12, y: 3, width: 3, height: 0.5 },

    // First puzzle: Player 0 stands on button to open door for Player 1
    { type: "platform", x: 16, y: 0, width: 10, height: 1 },
    { type: "button", x: 18, y: 1, width: 1.2, height: 0.3, linkedId: "door-a", slot: 0 },
    { type: "door", x: 24, y: 1, width: 0.8, height: 3, linkedId: "door-a" },

    // Bridge section after first door
    { type: "platform", x: 25, y: 0, width: 12, height: 1 },

    // Second puzzle: Player 1 stands on button to open door for Player 0
    // Stepping platform to reach the button platform
    { type: "platform", x: 27, y: 1.8, width: 2, height: 0.5 },
    { type: "platform", x: 28, y: 2.8, width: 4, height: 0.5 },
    { type: "button", x: 29.5, y: 3.3, width: 1.2, height: 0.3, linkedId: "door-b", slot: 1 },
    { type: "door", x: 35, y: 1, width: 0.8, height: 3, linkedId: "door-b" },

    // Final section
    { type: "platform", x: 36, y: 0, width: 15, height: 1 },
    { type: "platform", x: 40, y: 2, width: 3, height: 0.5 },
    { type: "platform", x: 44, y: 3.5, width: 3, height: 0.5 },

    // Goal
    { type: "goal", x: 48, y: 1, width: 2, height: 3 },
  ],
};
