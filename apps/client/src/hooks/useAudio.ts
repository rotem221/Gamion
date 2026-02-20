import { useCallback, useEffect, useRef } from "react";
import { Howl, Howler } from "howler";

// Sound effect definitions — keys map to audio files
const SFX_MAP = {
  // Bowling
  bowl_roll: { src: "/sfx/bowl-roll.mp3", volume: 0.6 },
  bowl_strike: { src: "/sfx/bowl-strike.mp3", volume: 0.8 },
  bowl_hit: { src: "/sfx/bowl-hit.mp3", volume: 0.7 },
  bowl_gutter: { src: "/sfx/bowl-gutter.mp3", volume: 0.5 },

  // UI
  ui_click: { src: "/sfx/ui-click.mp3", volume: 0.4 },
  ui_select: { src: "/sfx/ui-select.mp3", volume: 0.5 },
  ui_join: { src: "/sfx/ui-join.mp3", volume: 0.6 },
  ui_turn: { src: "/sfx/ui-turn.mp3", volume: 0.6 },

  // Co-op Quest
  coop_jump: { src: "/sfx/coop-jump.mp3", volume: 0.5 },
  coop_land: { src: "/sfx/coop-land.mp3", volume: 0.4 },
  coop_button: { src: "/sfx/coop-button.mp3", volume: 0.6 },
  coop_door: { src: "/sfx/coop-door.mp3", volume: 0.5 },
  coop_goal: { src: "/sfx/coop-goal.mp3", volume: 0.8 },

  // General
  cheer: { src: "/sfx/cheer.mp3", volume: 0.5 },
  countdown: { src: "/sfx/countdown.mp3", volume: 0.5 },
} as const;

export type SfxName = keyof typeof SFX_MAP;

// BGM tracks
const BGM_MAP = {
  lobby: { src: "/bgm/lobby.mp3", volume: 0.25, loop: true },
  bowling: { src: "/bgm/bowling.mp3", volume: 0.2, loop: true },
  coop: { src: "/bgm/coop.mp3", volume: 0.2, loop: true },
} as const;

export type BgmName = keyof typeof BGM_MAP;

// Cached Howl instances
const sfxCache = new Map<SfxName, Howl>();
const bgmCache = new Map<BgmName, Howl>();

function getSfx(name: SfxName): Howl {
  let howl = sfxCache.get(name);
  if (!howl) {
    const def = SFX_MAP[name];
    howl = new Howl({
      src: [def.src],
      volume: def.volume,
      preload: false, // load on first play
    });
    sfxCache.set(name, howl);
  }
  return howl;
}

function getBgm(name: BgmName): Howl {
  let howl = bgmCache.get(name);
  if (!howl) {
    const def = BGM_MAP[name];
    howl = new Howl({
      src: [def.src],
      volume: def.volume,
      loop: def.loop,
      preload: false,
    });
    bgmCache.set(name, howl);
  }
  return howl;
}

export function useAudio() {
  const currentBgmRef = useRef<BgmName | null>(null);

  const playSfx = useCallback((name: SfxName) => {
    try {
      const howl = getSfx(name);
      howl.play();
    } catch {
      // Audio not available — fail silently
    }
  }, []);

  const playBgm = useCallback((name: BgmName) => {
    // Stop current BGM if different
    if (currentBgmRef.current && currentBgmRef.current !== name) {
      try {
        getBgm(currentBgmRef.current).stop();
      } catch {}
    }
    currentBgmRef.current = name;
    try {
      const howl = getBgm(name);
      if (!howl.playing()) {
        howl.play();
      }
    } catch {}
  }, []);

  const stopBgm = useCallback(() => {
    if (currentBgmRef.current) {
      try {
        getBgm(currentBgmRef.current).stop();
      } catch {}
      currentBgmRef.current = null;
    }
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    Howler.volume(Math.max(0, Math.min(1, volume)));
  }, []);

  // Stop BGM on unmount
  useEffect(() => {
    return () => {
      if (currentBgmRef.current) {
        try {
          getBgm(currentBgmRef.current).stop();
        } catch {}
      }
    };
  }, []);

  return { playSfx, playBgm, stopBgm, setMasterVolume };
}
