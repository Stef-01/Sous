/**
 * Weekly nutrition trend (W25) — over the last 7 days of the diary, which
 * nutrients consistently fall short and which stay strong. Pure + testable: the
 * hook supplies the per-day aggregated nutrition (newest first, nulls for days
 * with nothing logged); this rolls it into a per-nutrient trend.
 */

import type { PerServingNutrition } from "@/types/nutrition";
import { NUTRIENT_DISPLAY } from "@/data/nutrition/nutrient-display";
import { FLAGGABLE_DEFICIT_KEYS } from "./deficits";

/** A day counts as "short" on a nutrient below this fraction of its target. */
const SHORT_THRESHOLD = 0.7;

export interface WeekNutrientTrend {
  key: string;
  label: string;
  daysLogged: number;
  /** Days (of those logged) below the short threshold. */
  daysShort: number;
  /** Mean % of daily target across logged days. */
  avgPct: number;
}

export interface WeeklyTrend {
  daysWithCooks: number;
  /** Persistent gaps first (most days short, then lowest average). */
  trend: WeekNutrientTrend[];
}

export function computeWeeklyTrend(
  perDay: ReadonlyArray<PerServingNutrition | null>,
): WeeklyTrend {
  const logged = perDay.filter((n): n is PerServingNutrition => n !== null);
  const trend: WeekNutrientTrend[] = [];
  if (logged.length > 0) {
    for (const m of NUTRIENT_DISPLAY) {
      if (!m.dv || !FLAGGABLE_DEFICIT_KEYS.has(String(m.key))) continue;
      let sumPct = 0;
      let daysShort = 0;
      for (const n of logged) {
        const v = (n[m.key] as number | undefined) ?? 0;
        const frac = v / m.dv;
        sumPct += frac;
        if (frac < SHORT_THRESHOLD) daysShort += 1;
      }
      trend.push({
        key: String(m.key),
        label: m.label,
        daysLogged: logged.length,
        daysShort,
        avgPct: Math.round((sumPct / logged.length) * 100),
      });
    }
    trend.sort((a, b) => b.daysShort - a.daysShort || a.avgPct - b.avgPct);
  }
  return { daysWithCooks: logged.length, trend };
}

/** The nutrient kept strongest across the week (highest average % of target). */
export function strongestNutrient(t: WeeklyTrend): WeekNutrientTrend | null {
  if (t.trend.length === 0) return null;
  return [...t.trend].sort((a, b) => b.avgPct - a.avgPct)[0];
}
