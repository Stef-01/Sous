/**
 * Pet-screen data — pure selectors for the full-screen Tamagotchi view. Like
 * pet-state.ts, nothing here is a separate game economy: every number reads
 * the SAME sources the rest of the nutrition surface uses — the shared FDA DV
 * table (NUTRIENT_DISPLAY), the coverage-gated dish registry, and the Path
 * tab's XP curve.
 */

import type { PerServingNutrition } from "@/types/nutrition";
import type { DiaryEntry } from "@/lib/hooks/use-nutrition-diary";
import { NUTRIENT_DISPLAY } from "@/data/nutrition/nutrient-display";
import {
  getDishNutrition,
  NUTRITION_COVERAGE_FLOOR,
} from "@/lib/engine/dish-nutrition";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// FDA DVs (21 CFR 101.9) come from the shared display table — every entry in
// its Vitamins group carries one. Derived once so the pet screen can never
// drift from the nutrition panel.
const VITAMIN_DVS: ReadonlyArray<{
  key: keyof PerServingNutrition;
  dv: number;
}> = NUTRIENT_DISPLAY.flatMap((m) =>
  m.group === "Vitamins" && m.dv !== null ? [{ key: m.key, dv: m.dv }] : [],
);

/**
 * Average vitamin DV coverage for a day aggregate, 0..1. Each vitamin caps at
 * its DV (megadosing C can't paper over missing D); absent values count as 0
 * so the average stays honest about gaps.
 */
export function vitaminCoverage(agg: PerServingNutrition | null): number {
  if (!agg || VITAMIN_DVS.length === 0) return 0;
  let sum = 0;
  for (const m of VITAMIN_DVS) {
    const v = (agg[m.key] as number | undefined) ?? 0;
    sum += clamp01(v / m.dv);
  }
  return sum / VITAMIN_DVS.length;
}

// Fiber's DV from the same shared table (28 g). The Infinity fallback only
// fires if the table row is ever removed — coverage degrades to 0 rather
// than inventing a number here.
const FIBER_DV =
  NUTRIENT_DISPLAY.find((m) => m.key === "fiber_g")?.dv ??
  Number.POSITIVE_INFINITY;

/** Fiber DV coverage for a day aggregate, 0..1. */
export function fiberCoverage(agg: PerServingNutrition | null): number {
  if (!agg) return 0;
  return clamp01((agg.fiber_g ?? 0) / FIBER_DV);
}

export interface ActivityRow {
  icon: "meal" | "water";
  label: string;
  detail: string;
}

const FEED_CAP = 4;

/** Per-entry kcal, scaled by servings — the same resolution rule as
 *  aggregateDay (embedded nutrition first, then the registry, coverage-gated
 *  so an under-massed dish never shows a dishonest number). */
function entryDetail(e: DiaryEntry): string {
  let per: PerServingNutrition | null = e.nutrition ?? null;
  if (!per) {
    const { perServing, massedCoverage } = getDishNutrition(e.slug);
    if (perServing && massedCoverage >= NUTRITION_COVERAGE_FLOOR) {
      per = perServing;
    }
  }
  if (!per || !Number.isFinite(per.calories)) return "logged";
  return `${Math.round(per.calories * e.servings)} kcal`;
}

/**
 * Today's feed for the pet screen: diary entries newest-first plus one water
 * row, capped at FEED_CAP total. Water occupies one of the slots when present
 * so a heavy logging day can't push hydration out of the feed.
 */
export function activityFeed(
  entries: ReadonlyArray<DiaryEntry>,
  waterCups: number,
): ActivityRow[] {
  const hasWater = waterCups > 0;
  const rows: ActivityRow[] = [...entries]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, hasWater ? FEED_CAP - 1 : FEED_CAP)
    .map((e) => ({ icon: "meal", label: e.name, detail: entryDetail(e) }));
  if (hasWater) {
    rows.push({
      icon: "water",
      label: "Water",
      detail: `${waterCups} cup${waterCups === 1 ? "" : "s"}`,
    });
  }
  return rows;
}

// The Path XP curve — flat 100 XP per level. Same math as the module-local
// computeLevel/xpForNextLevel in use-xp-system.ts (extracted, not imported:
// that file is "use client"); keep in lockstep with the Path header's
// "Level N · x/100 XP".
export const XP_PER_LEVEL = 100;

/** Level + progress within it for a lifetime XP total. */
export function xpToLevel(xp: number): {
  level: number;
  into: number;
  needed: number;
} {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return {
    level,
    into: xp - (level - 1) * XP_PER_LEVEL,
    needed: XP_PER_LEVEL,
  };
}
