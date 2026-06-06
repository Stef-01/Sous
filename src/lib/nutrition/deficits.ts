/**
 * Day-level nutrient deficits — the shared signal behind the diary's deficit
 * insight AND the deficiency-aware side reranking (W29-W31). Given the day's
 * aggregated nutrition, returns each flaggable micronutrient still below target,
 * weighted by how far below (0..1). Empty when nothing's logged → the reblend is
 * a no-op and rankings stay byte-identical.
 */

import type { PerServingNutrition } from "@/types/nutrition";
import { NUTRIENT_DISPLAY } from "@/data/nutrition/nutrient-display";

/** Micros worth chasing a shortfall on (skip macros + over-consumed sodium). */
export const FLAGGABLE_DEFICIT_KEYS: ReadonlySet<string> = new Set([
  "fiber_g",
  "iron_mg",
  "calcium_mg",
  "potassium_mg",
  "magnesium_mg",
  "vitaminC_mg",
  "vitaminD_mcg",
  "vitaminA_mcg_rae",
  "folate_mcg",
  "vitaminB12_mcg",
  "zinc_mg",
  "omega3_g",
]);

const TARGET: Record<string, number> = {};
for (const m of NUTRIENT_DISPLAY) {
  if (m.dv && FLAGGABLE_DEFICIT_KEYS.has(String(m.key))) {
    TARGET[String(m.key)] = m.dv;
  }
}

export interface DeficitItem {
  key: string;
  label: string;
  pct: number;
  /** Deficit severity 0..1 (= 1 − coverage, clamped). */
  weight: number;
}

/** All flaggable nutrients below target today, most-deficient first. */
export function computeDeficits(n: PerServingNutrition | null): DeficitItem[] {
  if (!n) return [];
  const out: DeficitItem[] = [];
  for (const m of NUTRIENT_DISPLAY) {
    const key = String(m.key);
    const target = TARGET[key];
    if (!target) continue;
    const val = (n[m.key] as number | undefined) ?? 0;
    const coverage = val / target;
    const weight = Math.max(0, Math.min(1, 1 - coverage));
    if (weight <= 0) continue;
    out.push({ key, label: m.label, pct: Math.round(coverage * 100), weight });
  }
  return out.sort((a, b) => b.weight - a.weight);
}

/** The deficits as a key → weight map (the reranking signal). */
export function deficitWeightMap(
  n: PerServingNutrition | null,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const d of computeDeficits(n)) map.set(d.key, d.weight);
  return map;
}

/** The single most-deficient nutrient (for the diary insight line). */
export function topDeficit(n: PerServingNutrition | null): DeficitItem | null {
  return computeDeficits(n)[0] ?? null;
}

export const DEFICIT_TARGET = TARGET;
