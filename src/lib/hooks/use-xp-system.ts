"use client";

import { useState, useCallback, useEffect, useMemo } from "react";

/**
 * XP System  -  tracks experience points, levels, and milestones.
 *
 * XP sources:
 * - Complete any cook: +25 XP
 * - Complete a skill-tree cook: +10-60 XP (tier-based, handled separately in use-skill-progress)
 * - Rate a dish: +5 XP
 * - Add a note: +5 XP
 * - Add a photo: +10 XP
 * - Complete a weekly challenge: +50 XP
 * - Win a game: +15 XP
 * - 7-day streak bonus: 2x multiplier
 * - 14-day streak bonus: 3x multiplier
 */

export interface XPEvent {
  source: string;
  amount: number;
  timestamp: string;
}

interface XPState {
  totalXP: number;
  events: XPEvent[];
  lastLevelSeen: number;
}

const STORAGE_KEY = "sous-xp-system";

const LEVEL_TITLES: Record<number, string> = {
  1: "Kitchen Newcomer",
  2: "Curious Cook",
  3: "Ingredient Explorer",
  4: "Flavor Apprentice",
  5: "Home Cook",
  6: "Side Dish Specialist",
  7: "Cuisine Adventurer",
  8: "Confident Cook",
  9: "Kitchen Veteran",
  10: "Plate Master",
  12: "Seasoned Chef",
  15: "Culinary Artist",
  20: "Kitchen Legend",
  25: "Sous Master",
};

export const XP_AWARDS = {
  COOK_COMPLETE: 25,
  RATE_DISH: 5,
  ADD_NOTE: 5,
  ADD_PHOTO: 10,
  WEEKLY_CHALLENGE: 50,
  GAME_WIN: 15,
} as const;

function computeLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

function getLevelTitle(level: number): string {
  const keys = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);
  for (const threshold of keys) {
    if (level >= threshold) return LEVEL_TITLES[threshold];
  }
  return "Kitchen Newcomer";
}

function xpForNextLevel(xp: number): { current: number; needed: number } {
  const level = computeLevel(xp);
  const currentLevelStart = (level - 1) * 100;
  const nextLevelStart = level * 100;
  return {
    current: xp - currentLevelStart,
    needed: nextLevelStart - currentLevelStart,
  };
}

function getStreakMultiplier(streak: number): number {
  if (streak >= 14) return 3;
  if (streak >= 7) return 2;
  return 1;
}

function loadState(): XPState {
  if (typeof window === "undefined")
    return { totalXP: 0, events: [], lastLevelSeen: 1 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { totalXP: 0, events: [], lastLevelSeen: 1 };
  } catch {
    return { totalXP: 0, events: [], lastLevelSeen: 1 };
  }
}

function saveState(state: XPState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

export function useXPSystem() {
  const [state, setState] = useState<XPState>({
    totalXP: 0,
    events: [],
    lastLevelSeen: 1,
  });
  const [mounted, setMounted] = useState(false);
  const [levelUpPending, setLevelUpPending] = useState<number | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const awardXP = useCallback(
    (source: string, baseAmount: number, streak = 0) => {
      const multiplier = getStreakMultiplier(streak);
      const amount = baseAmount * multiplier;

      setState((prev) => {
        const oldLevel = computeLevel(prev.totalXP);
        const newTotal = prev.totalXP + amount;
        const newLevel = computeLevel(newTotal);
        const event: XPEvent = {
          source,
          amount,
          timestamp: new Date().toISOString(),
        };

        const updated: XPState = {
          totalXP: newTotal,
          events: [...prev.events.slice(-99), event],
          lastLevelSeen: newLevel,
        };

        saveState(updated);

        if (newLevel > oldLevel) {
          setLevelUpPending(newLevel);
        }

        return updated;
      });
    },
    [],
  );

  const dismissLevelUp = useCallback(() => {
    setLevelUpPending(null);
  }, []);

  const level = useMemo(() => computeLevel(state.totalXP), [state.totalXP]);
  const title = useMemo(() => getLevelTitle(level), [level]);
  const progressToNext = useMemo(
    () => xpForNextLevel(state.totalXP),
    [state.totalXP],
  );

  const recentEvents = useMemo(() => state.events.slice(-10), [state.events]);

  return {
    mounted,
    totalXP: state.totalXP,
    level,
    title,
    progressToNext,
    levelUpPending,
    awardXP,
    dismissLevelUp,
    recentEvents,
  };
}
