"use client";

/**
 * useDogeHealth — the nutrition system, attached to the Doge game. Gathers the
 * SAME sources the Nutrition page reads (diary aggregate, personal targets,
 * hydration) and returns the 6 health bars + mood the dashboard shows, so the
 * dog's health on the game screen IS your real eating.
 *
 * This is the pet HEALTH (mood/stats), which is meant to reflect nutrition — it
 * is NOT the gold economy (that stays walled off in gold-*.ts).
 */
import { useMemo } from "react";
import {
  useNutritionDiary,
  aggregateDay,
} from "@/lib/hooks/use-nutrition-diary";
import { usePersonalTargets } from "@/lib/hooks/use-personal-targets";
import {
  useHydration,
  HYDRATION_GOAL_GLASSES,
} from "@/lib/hooks/use-hydration";
import { computeDeficits } from "@/lib/nutrition/deficits";
import { computePetState, type PetMood } from "@/lib/nutrition/pet-state";
import {
  buildPetHealthStats,
  fiberCoverage,
  vitaminCoverage,
  type PetHealthStat,
} from "@/lib/nutrition/pet-screen-data";

export interface DogeHealth {
  stats: PetHealthStat[];
  mood: PetMood;
  hearts: number;
  loggedCount: number;
}

export function useDogeHealth(streak = 0): DogeHealth {
  const today = useMemo(() => new Date(), []);
  const { entries } = useNutritionDiary(today);
  const { targets } = usePersonalTargets();
  const { glasses } = useHydration();

  return useMemo(() => {
    const agg = aggregateDay(entries);
    const kcal = typeof agg?.calories === "number" ? agg.calories : null;
    const protein = typeof agg?.protein_g === "number" ? agg.protein_g : null;
    const ps = computePetState({
      loggedCount: entries.length,
      kcal,
      targetKcal: targets?.kcal ?? 2000,
      protein,
      targetProtein: targets?.protein_g ?? 50,
      deficits: entries.length > 0 ? computeDeficits(agg) : [],
      streak,
    });
    const stats = buildPetHealthStats({
      fullness: ps.fullness,
      hearts: ps.hearts,
      hydration: glasses / HYDRATION_GOAL_GLASSES,
      strength: ps.strength,
      fiber: fiberCoverage(agg),
      vitamins: vitaminCoverage(agg),
    });
    return {
      stats,
      mood: ps.mood,
      hearts: ps.hearts,
      loggedCount: entries.length,
    };
  }, [entries, targets, glasses, streak]);
}
