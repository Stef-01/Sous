"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { achievements, type Achievement } from "@/data/achievements";

interface AchievementState {
  unlocked: string[];
  lastCheckedStats: UserStats;
}

export interface UserStats {
  cooksCompleted: number;
  cuisinesExplored: number;
  streakDays: number;
  skillsCompleted: number;
  dishesRated: number;
  photosAdded: number;
  xpEarned: number;
  level: number;
}

const STORAGE_KEY = "sous-achievements";

function loadState(): AchievementState {
  if (typeof window === "undefined")
    return {
      unlocked: [],
      lastCheckedStats: {
        cooksCompleted: 0,
        cuisinesExplored: 0,
        streakDays: 0,
        skillsCompleted: 0,
        dishesRated: 0,
        photosAdded: 0,
        xpEarned: 0,
        level: 1,
      },
    };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          unlocked: [],
          lastCheckedStats: {
            cooksCompleted: 0,
            cuisinesExplored: 0,
            streakDays: 0,
            skillsCompleted: 0,
            dishesRated: 0,
            photosAdded: 0,
            xpEarned: 0,
            level: 1,
          },
        };
  } catch {
    return {
      unlocked: [],
      lastCheckedStats: {
        cooksCompleted: 0,
        cuisinesExplored: 0,
        streakDays: 0,
        skillsCompleted: 0,
        dishesRated: 0,
        photosAdded: 0,
        xpEarned: 0,
        level: 1,
      },
    };
  }
}

function saveState(state: AchievementState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

function isConditionMet(achievement: Achievement, stats: UserStats): boolean {
  const c = achievement.condition;
  switch (c.type) {
    case "cooks_completed":
      return stats.cooksCompleted >= c.count;
    case "cuisines_explored":
      return stats.cuisinesExplored >= c.count;
    case "streak_days":
      return stats.streakDays >= c.count;
    case "skills_completed":
      return stats.skillsCompleted >= c.count;
    case "dishes_rated":
      return stats.dishesRated >= c.count;
    case "photos_added":
      return stats.photosAdded >= c.count;
    case "xp_earned":
      return stats.xpEarned >= c.amount;
    case "level_reached":
      return stats.level >= c.level;
  }
}

export function useAchievements() {
  const [state, setState] = useState<AchievementState>({
    unlocked: [],
    lastCheckedStats: {
      cooksCompleted: 0,
      cuisinesExplored: 0,
      streakDays: 0,
      skillsCompleted: 0,
      dishesRated: 0,
      photosAdded: 0,
      xpEarned: 0,
      level: 1,
    },
  });
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const checkAchievements = useCallback((stats: UserStats): Achievement[] => {
    const newUnlocks: Achievement[] = [];

    setState((prev) => {
      const unlockedSet = new Set(prev.unlocked);
      for (const achievement of achievements) {
        if (unlockedSet.has(achievement.id)) continue;
        if (isConditionMet(achievement, stats)) {
          unlockedSet.add(achievement.id);
          newUnlocks.push(achievement);
        }
      }

      if (newUnlocks.length === 0) return prev;

      const updated: AchievementState = {
        unlocked: Array.from(unlockedSet),
        lastCheckedStats: stats,
      };
      saveState(updated);
      return updated;
    });

    if (newUnlocks.length > 0) {
      setNewlyUnlocked(newUnlocks);
    }

    return newUnlocks;
  }, []);

  const dismissNewUnlocks = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  const unlockedSet = useMemo(() => new Set(state.unlocked), [state.unlocked]);

  const unlockedAchievements = useMemo(
    () => achievements.filter((a) => unlockedSet.has(a.id)),
    [unlockedSet],
  );

  const lockedAchievements = useMemo(
    () => achievements.filter((a) => !unlockedSet.has(a.id)),
    [unlockedSet],
  );

  return {
    mounted,
    unlockedAchievements,
    lockedAchievements,
    newlyUnlocked,
    checkAchievements,
    dismissNewUnlocks,
    totalUnlocked: state.unlocked.length,
    totalAchievements: achievements.length,
  };
}
