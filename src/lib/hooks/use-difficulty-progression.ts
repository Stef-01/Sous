"use client";

import { useMemo } from "react";
import type { CookSessionRecord } from "./use-cook-sessions";
import { getStaticCookData, getStaticMealCookData } from "@/data/guided-cook-steps";

const STORAGE_KEY = "sous-difficulty-progression";

export type SkillLevel = "easy" | "medium" | "hard";

export interface DifficultyProgression {
  /** Counts by difficulty level */
  easy: number;
  medium: number;
  hard: number;
  /** The recommended next difficulty tier */
  recommendedLevel: SkillLevel;
  /** A 0..1 score that biases quest card ranking toward harder dishes */
  difficultyBoost: number;
}

/**
 * Classify a dish's difficulty from its cook data.
 * Uses cook time + ingredient count as proxy.
 */
function classifyDifficulty(slug: string): SkillLevel {
  const sideData = getStaticCookData(slug);
  const mealData = getStaticMealCookData(slug);
  const data = sideData ?? mealData;

  if (!data) return "medium"; // default if no cook data

  const totalTime = data.prepTimeMinutes + data.cookTimeMinutes;
  const ingredientCount = data.ingredients.length;

  // Easy: ≤20 min total, ≤6 ingredients
  if (totalTime <= 20 && ingredientCount <= 6) return "easy";
  // Hard: >40 min or >10 ingredients
  if (totalTime > 40 || ingredientCount > 10) return "hard";
  return "medium";
}

/**
 * Derive the user's difficulty progression from completed cook sessions.
 * No localStorage write — purely derived from session history.
 */
export function useDifficultyProgression(
  completedSessions: CookSessionRecord[],
): DifficultyProgression {
  return useMemo(() => {
    const counts = { easy: 0, medium: 0, hard: 0 };

    for (const session of completedSessions) {
      const level = classifyDifficulty(session.recipeSlug);
      counts[level]++;
    }

    const total = counts.easy + counts.medium + counts.hard;

    // Progression logic:
    // - Under 5 cooks total → recommend easy
    // - 5-15 cooks, mostly easy → recommend medium
    // - 15+ cooks, or majority medium → recommend hard
    // - Already doing hard → stay hard
    let recommendedLevel: SkillLevel = "easy";
    let difficultyBoost = 0;

    if (total >= 15 || (total >= 8 && counts.medium >= 4)) {
      recommendedLevel = "hard";
      difficultyBoost = 0.15; // 15% boost toward harder dishes
    } else if (total >= 5 && counts.easy >= 3) {
      recommendedLevel = "medium";
      difficultyBoost = 0.08; // 8% boost toward medium dishes
    }

    return { ...counts, recommendedLevel, difficultyBoost };
  }, [completedSessions]);
}

/**
 * Score a dish's difficulty alignment with the user's progression.
 * Returns a bonus (0..6) to add to quest card scoring.
 * Higher = better match for the user's current level.
 */
export function scoreDifficultyAlignment(
  slug: string,
  progression: DifficultyProgression,
): number {
  const level = classifyDifficulty(slug);
  const { recommendedLevel } = progression;

  // Perfect match
  if (level === recommendedLevel) return 4;
  // One step up (stretch goal)
  if (
    (recommendedLevel === "easy" && level === "medium") ||
    (recommendedLevel === "medium" && level === "hard")
  )
    return 3;
  // One step down (confidence builder)
  if (
    (recommendedLevel === "medium" && level === "easy") ||
    (recommendedLevel === "hard" && level === "medium")
  )
    return 1;
  // Two steps away
  return 0;
}
