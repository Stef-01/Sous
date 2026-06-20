"use client";

import { useMemo } from "react";
import { useNutritionDiary } from "@/lib/hooks/use-nutrition-diary";
import { usePersonalTargets } from "@/lib/hooks/use-personal-targets";
import { deficitFillFor } from "@/lib/nutrition/deficit-fill-dishes";
import { buildTodayStats, type TodayStats } from "./today-stats";

/**
 * The Today nutrition glance, fed from the SAME stores the Nutrition page reads
 * (so the two are always in sync). Today = day offset 0.
 */
export function useTodayStats(): TodayStats {
  // One Date per mount — offset 0 (today). Midnight rollover is an accepted edge.
  const today = useMemo(() => new Date(), []);
  const { dayNutrition, cookedDayNutrition } = useNutritionDiary(today);
  const { targets } = usePersonalTargets();
  const deficitFill = useMemo(
    () => deficitFillFor(cookedDayNutrition),
    [cookedDayNutrition],
  );
  return useMemo(
    // One gap dish keeps the glance a clean single line; the full list lives on
    // /nutrition (disclosure on demand, rule 13).
    () =>
      buildTodayStats(dayNutrition ?? null, targets ?? null, deficitFill, 1),
    [dayNutrition, targets, deficitFill],
  );
}
