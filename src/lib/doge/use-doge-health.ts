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

/** Pure: an ISO log timestamp → a compact local clock label ("8:30a"). Empty
 *  string for a missing/invalid time so the game just omits the prefix. */
function formatLogTime(at: string | undefined): string {
  if (!at) return "";
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return "";
  let h = d.getHours();
  const m = d.getMinutes();
  const meridiem = h < 12 ? "a" : "p";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")}${meridiem}`;
}

export interface DogeHealth {
  stats: PetHealthStat[];
  mood: PetMood;
  hearts: number;
  loggedCount: number;
  /** Deduped dish names eaten today — the "recent activity" the HUD shows. */
  meals: string[];
  /** Same, each with a pre-formatted local log time ("8:30a") for the game feed. */
  recentMeals: { name: string; time: string }[];
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
    // recentMeals carries each one's pre-formatted local log time for the game's
    // timestamped feed (newest occurrence wins on dedupe, so its time is kept).
    const meals: string[] = [];
    const recentMeals: { name: string; time: string }[] = [];
    for (let i = entries.length - 1; i >= 0; i--) {
      const e = entries[i];
      const n = e?.name;
      if (n && !meals.includes(n)) {
        meals.push(n);
        recentMeals.push({ name: n, time: formatLogTime(e?.at) });
      }
    }
    return {
      stats,
      mood: ps.mood,
      hearts: ps.hearts,
      loggedCount: entries.length,
      meals,
      recentMeals,
    };
  }, [entries, targets, glasses, streak]);

  return { ...data, glasses, logWater };
}
