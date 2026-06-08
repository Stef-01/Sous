"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * W47 — a light, playful nutrition goal captured by a one-tap coach card (NOT a
 * settings form, rule 3). It only SOFTLY nudges suggestions — never hard-filters
 * the plate. Skippable; defaults to "balanced". Runs once (the card hides after a
 * choice or a skip).
 */
export type NutritionGoal = "balanced" | "protein" | "veg" | "hydration";

export const NUTRITION_GOALS: NutritionGoal[] = [
  "balanced",
  "protein",
  "veg",
  "hydration",
];

const KEY = "sous-nutrition-goal-v1";
const CHOSEN_KEY = "sous-nutrition-goal-chosen-v1";

export interface NutritionGoalSoftWeights {
  proteinAffinity?: number;
  vegAffinity?: number;
  hydrationAffinity?: number;
}

/** Pure mapping: goal → soft additive weights the ranker MAY apply. Deliberately
 *  small (≤0.15) so it nudges, never dominates; "balanced" nudges nothing. */
export function nutritionGoalSoftWeights(
  goal: NutritionGoal,
): NutritionGoalSoftWeights {
  switch (goal) {
    case "protein":
      return { proteinAffinity: 0.15 };
    case "veg":
      return { vegAffinity: 0.15 };
    case "hydration":
      return { hydrationAffinity: 0.15 };
    case "balanced":
    default:
      return {};
  }
}

/** Pure: coerce any stored value to a valid goal (back-compat safe). */
export function coerceNutritionGoal(raw: unknown): NutritionGoal {
  return NUTRITION_GOALS.includes(raw as NutritionGoal)
    ? (raw as NutritionGoal)
    : "balanced";
}

export function useNutritionGoal() {
  const [goal, setGoalState] = useState<NutritionGoal>("balanced");
  const [chosen, setChosen] = useState(true); // assume chosen until hydrated (no flash)
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage on mount */
  useEffect(() => {
    try {
      setGoalState(coerceNutritionGoal(window.localStorage.getItem(KEY)));
      setChosen(window.localStorage.getItem(CHOSEN_KEY) === "1");
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const persistChosen = () => {
    try {
      window.localStorage.setItem(CHOSEN_KEY, "1");
    } catch {
      // ignore
    }
  };

  const setGoal = useCallback((next: NutritionGoal) => {
    setGoalState(next);
    setChosen(true);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // ignore
    }
    persistChosen();
  }, []);

  /** Dismiss without choosing → keeps the "balanced" default, marks done. */
  const skip = useCallback(() => {
    setChosen(true);
    persistChosen();
  }, []);

  return { goal, chosen, mounted, setGoal, skip };
}
