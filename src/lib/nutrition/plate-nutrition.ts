/**
 * Plate nutrition summary — the per-serving roll-up behind the "Plate check"
 * sheet's combined nutrition view. Given the main + the sides the user picked,
 * it returns one row per dish (a serving each) plus the combined plate total.
 *
 * It reads through `getDishPerServing`, the SAME display-grade getter the diary
 * and planner use (seed-first, composed-fallback) — so the numbers here match
 * what logging a serving of each dish would add. Dishes without resolvable
 * nutrition come back as data-less rows and are excluded from the total (the UI
 * footnotes them) rather than guessed at (rule 7: no invented nutrition).
 */

import { getDishPerServing } from "@/lib/engine/dish-nutrition";

export interface PlateNutritionInput {
  name: string;
  slug: string;
  role: "main" | "side";
}

export interface PlateNutritionRow {
  name: string;
  role: "main" | "side";
  /** null when no display-grade per-serving data resolves for the dish. */
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  hasData: boolean;
}

export interface PlateNutritionSummary {
  rows: PlateNutritionRow[];
  /** Sum across the rows that have data (a serving of each). */
  totals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  /** How many rows contributed real numbers / how many were data-less. */
  withData: number;
  missing: number;
}

function roundOrNull(v: number | undefined): number | null {
  return typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null;
}

/**
 * Compose the per-serving rows + the combined plate total. Pure + deterministic
 * (it only reads static dish data), so it's unit-tested in node.
 */
export function summarizePlate(
  items: readonly PlateNutritionInput[],
): PlateNutritionSummary {
  const rows: PlateNutritionRow[] = items.map((item) => {
    const { perServing } = getDishPerServing(item.slug);
    if (!perServing) {
      return {
        name: item.name,
        role: item.role,
        calories: null,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
        hasData: false,
      };
    }
    return {
      name: item.name,
      role: item.role,
      calories: roundOrNull(perServing.calories),
      protein_g: roundOrNull(perServing.protein_g),
      carbs_g: roundOrNull(perServing.totalCarbs_g),
      fat_g: roundOrNull(perServing.totalFat_g),
      hasData: true,
    };
  });

  const totals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
  let withData = 0;
  for (const r of rows) {
    if (!r.hasData) continue;
    withData += 1;
    totals.calories += r.calories ?? 0;
    totals.protein_g += r.protein_g ?? 0;
    totals.carbs_g += r.carbs_g ?? 0;
    totals.fat_g += r.fat_g ?? 0;
  }

  return {
    rows,
    totals,
    withData,
    missing: rows.length - withData,
  };
}

/**
 * Split the three macros into calorie-share fractions for a stacked bar
 * (protein 4 kcal/g, carbs 4, fat 9). Returns zeros when there's no macro mass
 * so callers can hide the bar instead of dividing by zero.
 */
export function macroCalorieShares(t: {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}): { protein: number; carbs: number; fat: number } {
  const pCal = t.protein_g * 4;
  const cCal = t.carbs_g * 4;
  const fCal = t.fat_g * 9;
  const total = pCal + cCal + fCal;
  if (total <= 0) return { protein: 0, carbs: 0, fat: 0 };
  return { protein: pCal / total, carbs: cCal / total, fat: fCal / total };
}
