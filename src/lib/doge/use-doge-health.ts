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
import { useCallback, useMemo } from "react";
import {
  useNutritionDiary,
  aggregateDay,
} from "@/lib/hooks/use-nutrition-diary";
import { useToday } from "@/lib/hooks/use-today";
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
  /** Deduped dish names eaten today — the "recent activity" the HUD shows. */
  meals: string[];
  glasses: number;
  /** Log one glass of water — the Hydration bar updates live (same hook
   *  instance owns the store, so it re-renders immediately). */
  logWater: () => void;
}

export function useDogeHealth(streak = 0): DogeHealth {
  const today = useToday(); // refreshes at local midnight (no stale day if left open)
  const { entries } = useNutritionDiary(today);
  const { targets } = usePersonalTargets();
  const { glasses, setGlasses } = useHydration();
  const logWater = useCallback(
    () => setGlasses(glasses + 1),
    [glasses, setGlasses],
  );

  const data = useMemo(() => {
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
      // raw amounts so the in-game drill-down can show exact numbers vs target
      // ("Protein 30g / 50g") instead of just a percentage.
      raw: {
        kcal,
        targetKcal: targets?.kcal ?? 2000,
        protein_g: protein,
        targetProtein: targets?.protein_g ?? 50,
        glasses,
        glassTarget: HYDRATION_GOAL_GLASSES,
        fiber_g: typeof agg?.fiber_g === "number" ? agg.fiber_g : null,
      },
    });
    // Deduped dish names eaten today, newest first — the HUD's "recent activity".
    const meals: string[] = [];
    for (let i = entries.length - 1; i >= 0; i--) {
      const n = entries[i]?.name;
      if (n && !meals.includes(n)) meals.push(n);
    }
    return {
      stats,
      mood: ps.mood,
      hearts: ps.hearts,
      loggedCount: entries.length,
      meals,
    };
  }, [entries, targets, glasses, streak]);

  return { ...data, glasses, logWater };
}
