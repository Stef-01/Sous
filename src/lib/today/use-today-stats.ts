"use client";

import { useMemo } from "react";
import { useNutritionDiary } from "@/lib/hooks/use-nutrition-diary";
import { useToday } from "@/lib/hooks/use-today";
import { usePersonalTargets } from "@/lib/hooks/use-personal-targets";
import { deficitFillFor } from "@/lib/nutrition/deficit-fill-dishes";
import { buildTodayStats, type TodayStats } from "./today-stats";

/**
 * The Today nutrition glance, fed from the SAME stores the Nutrition page reads
 * (so the two are always in sync). Today = day offset 0.
 */
export function useTodayStats(): TodayStats {
  // Offset 0 (today) — refreshes at local midnight so the glance never goes
  // stale if the page is left open across the day boundary.
  const today = useToday();
  const { entries, dayNutrition, cookedDayNutrition } =
    useNutritionDiary(today);
  const { targets } = usePersonalTargets();
  const deficitFill = useMemo(
    () => deficitFillFor(cookedDayNutrition),
    [cookedDayNutrition],
  );
  const mealNames = useMemo(() => entries.map((e) => e.name), [entries]);
  return useMemo(
    // One gap dish keeps the glance a clean single line; the full list lives on
    // /nutrition (disclosure on demand, rule 13).
    () =>
      buildTodayStats(
        dayNutrition ?? null,
        targets ?? null,
        deficitFill,
        1,
        mealNames,
      ),
    [dayNutrition, targets, deficitFill, mealNames],
  );
}
