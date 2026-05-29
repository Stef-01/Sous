"use client";

import { useMemo } from "react";
import {
  getCurrentChallenge,
  getWeekStart,
  getDaysRemainingInWeek,
  type WeeklyChallenge,
  type ChallengeGoal,
} from "@/data/weekly-challenges";
import type { CookSessionRecord } from "./use-cook-sessions";

export interface WeeklyChallengeProgress {
  challenge: WeeklyChallenge;
  current: number;
  target: number;
  completed: boolean;
  /** 0..1 progress fraction */
  progress: number;
  daysRemaining: number;
}

/**
 * Compute progress for the current weekly challenge against this week's cook sessions.
 */
function computeProgress(
  goal: ChallengeGoal,
  weekSessions: CookSessionRecord[],
): { current: number; target: number } {
  switch (goal.type) {
    case "cook_count":
      return { current: weekSessions.length, target: goal.target };

    case "cuisine_cook": {
      const matches = weekSessions.filter(
        (s) => s.cuisineFamily.toLowerCase() === goal.cuisine.toLowerCase(),
      );
      return { current: matches.length, target: goal.target };
    }

    case "unique_dishes": {
      const unique = new Set(weekSessions.map((s) => s.recipeSlug));
      return { current: unique.size, target: goal.target };
    }

    case "rate_dishes": {
      const rated = weekSessions.filter(
        (s) => s.rating !== undefined && s.rating > 0,
      );
      return { current: rated.length, target: goal.target };
    }

    case "streak_days": {
      const days = new Set(
        weekSessions.map((s) => {
          const d = new Date(s.completedAt ?? s.startedAt);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }),
      );
      return { current: days.size, target: goal.target };
    }

    default:
      return { current: 0, target: 1 };
  }
}

/**
 * Hook: returns current weekly challenge with live progress derived from cook sessions.
 */
export function useWeeklyChallenge(
  completedSessions: CookSessionRecord[],
): WeeklyChallengeProgress {
  return useMemo(() => {
    const challenge = getCurrentChallenge();
    const weekStart = getWeekStart();
    const daysRemaining = getDaysRemainingInWeek();

    // Filter sessions to this week only (completed sessions)
    const weekSessions = completedSessions.filter((s) => {
      const d = new Date(s.completedAt ?? s.startedAt);
      return d >= weekStart;
    });

    const { current, target } = computeProgress(challenge.goal, weekSessions);
    const completed = current >= target;
    const progress = Math.min(current / target, 1);

    return { challenge, current, target, completed, progress, daysRemaining };
  }, [completedSessions]);
}
