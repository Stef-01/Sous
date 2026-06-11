/**
 * Pet trends — REAL day-over-day arrows for the Tamagotchi stat bars. Like
 * pet-state.ts, nothing here is a separate game economy: each arrow compares
 * today's coverage fraction against yesterday's, computed from the SAME diary
 * aggregate + DV tables every other nutrition surface reads. Honesty rule: a
 * day with no diary data yields null (no arrow), never a fake "up".
 */

import {
  aggregateDay,
  dayKey,
  type DiaryEntry,
} from "@/lib/hooks/use-nutrition-diary";
import type { PerServingNutrition } from "@/types/nutrition";
import { fiberCoverage, vitaminCoverage } from "./pet-screen-data";

export type TrendDirection = "up" | "down" | "flat";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Direction of change between two coverage fractions. The epsilon dead-band
 * keeps rounding jitter from rendering as movement: only a change strictly
 * greater than epsilon (in either direction) earns an arrow.
 */
export function trendOf(
  today: number,
  yesterday: number,
  epsilon = 0.02,
): TrendDirection {
  const diff = today - yesterday;
  if (diff > epsilon) return "up";
  if (diff < -epsilon) return "down";
  return "flat";
}

export interface StatTrends {
  energy: TrendDirection | null;
  protein: TrendDirection | null;
  fiber: TrendDirection | null;
  vitamins: TrendDirection | null;
}

const NO_TRENDS: StatTrends = {
  energy: null,
  protein: null,
  fiber: null,
  vitamins: null,
};

/**
 * Day-over-day trends for the four pet stat bars. Both days reduce to 0..1
 * coverage fractions via the same rules the bars themselves use — kcal and
 * protein against the personal targets (clamped, matching computePetState's
 * fullness/strength), fiber and vitamins against the shared FDA DV table —
 * then each pair runs through trendOf. When yesterday has no entries there is
 * no baseline, so every trend is null: no data → no arrow.
 */
export function statTrends(
  store: Record<string, DiaryEntry[]>,
  now: Date,
  targets: { kcal: number; protein_g: number },
): StatTrends {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayEntries = store[dayKey(yesterday)] ?? [];
  if (yesterdayEntries.length === 0) return NO_TRENDS;

  const yAgg = aggregateDay(yesterdayEntries);
  const tAgg = aggregateDay(store[dayKey(now)] ?? []);

  const energyCov = (agg: PerServingNutrition | null) =>
    clamp01((agg?.calories ?? 0) / targets.kcal);
  const proteinCov = (agg: PerServingNutrition | null) =>
    clamp01((agg?.protein_g ?? 0) / targets.protein_g);

  return {
    energy: trendOf(energyCov(tAgg), energyCov(yAgg)),
    protein: trendOf(proteinCov(tAgg), proteinCov(yAgg)),
    fiber: trendOf(fiberCoverage(tAgg), fiberCoverage(yAgg)),
    vitamins: trendOf(vitaminCoverage(tAgg), vitaminCoverage(yAgg)),
  };
}
