/**
 * today-stats — the pure shape the Today nutrition glance renders. It is fed the
 * SAME aggregate the Nutrition page reads (useNutritionDiary → dayNutrition,
 * usePersonalTargets, deficitFillFor), so the glance and the full dashboard are
 * always in sync. No new stores, no new math — just the slice the glance needs.
 *
 * Rule 7: every number derives from real logged entries; the gap suggestions are
 * real catalogue dishes. Pure + deterministic so it's unit-testable.
 */

export interface TodayMacro {
  key: "carbs" | "fat" | "protein";
  label: string;
  grams: number;
  target: number;
  /** 0–100, capped. */
  pct: number;
}

export interface TodayGap {
  label: string;
  suggestions: { slug: string; name: string; closesPct: number }[];
}

export interface TodayStats {
  /** Whether anything has been logged/cooked today (drives the empty state). */
  logged: boolean;
  kcal: { consumed: number; target: number; left: number; pct: number };
  macros: TodayMacro[];
  gap: TodayGap | null;
  /** What was actually eaten today — deduped dish names, in log order. The
   *  concrete "food stats" the glance shows under the macro summary. */
  meals: string[];
}

/** Minimal view of the diary aggregate (a superset is fine). */
export interface DayNutritionLike {
  calories?: number | null;
  totalCarbs_g?: number | null;
  totalFat_g?: number | null;
  protein_g?: number | null;
}

export interface TargetsLike {
  kcal: number;
  carbs_g: number;
  fat_g: number;
  protein_g: number;
}

export interface DeficitFillLike {
  deficit: { label: string };
  suggestions: { slug: string; name: string; closesPct: number }[];
}

/** FDA-ish defaults — mirror the Nutrition page fallbacks so the glance never
 *  shows a blank target before a profile is set. */
export const FALLBACK_TARGETS: TargetsLike = {
  kcal: 2000,
  carbs_g: 275,
  fat_g: 78,
  protein_g: 50,
};

function n(v: number | null | undefined): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function macro(
  key: TodayMacro["key"],
  label: string,
  grams: number,
  target: number,
): TodayMacro {
  const g = Math.round(n(grams));
  const t = Math.round(n(target));
  const pct = t > 0 ? Math.min(100, Math.round((g / t) * 100)) : 0;
  return { key, label, grams: g, target: t, pct };
}

/**
 * Compose the glance shape. `day` is null when nothing is logged today.
 * `deficitFill` is null when there is no meaningful gap (already well-covered).
 */
export function buildTodayStats(
  day: DayNutritionLike | null,
  targets: TargetsLike | null,
  deficitFill: DeficitFillLike | null,
  maxSuggestions = 2,
  mealNames: ReadonlyArray<string> = [],
): TodayStats {
  const t = targets ?? FALLBACK_TARGETS;
  const consumed = Math.round(n(day?.calories));
  const targetKcal = Math.round(n(t.kcal) || FALLBACK_TARGETS.kcal);
  const left = Math.max(0, targetKcal - consumed);
  const pct =
    targetKcal > 0
      ? Math.min(100, Math.round((consumed / targetKcal) * 100))
      : 0;

  return {
    logged: day != null && consumed > 0,
    kcal: { consumed, target: targetKcal, left, pct },
    macros: [
      macro("carbs", "Carbs", n(day?.totalCarbs_g), t.carbs_g),
      macro("fat", "Fat", n(day?.totalFat_g), t.fat_g),
      macro("protein", "Protein", n(day?.protein_g), t.protein_g),
    ],
    gap: deficitFill
      ? {
          label: deficitFill.deficit.label,
          suggestions: deficitFill.suggestions.slice(
            0,
            Math.max(0, maxSuggestions),
          ),
        }
      : null,
    meals: dedupeNames(mealNames),
  };
}

/** Deduped, trimmed, non-empty dish names in first-seen order. */
function dedupeNames(names: ReadonlyArray<string>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of names) {
    const name = (raw ?? "").trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}
