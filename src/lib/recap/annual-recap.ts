/**
 * Annual recap — pure aggregator over the cook-session log
 * (Y5 F, per `docs/YEAR-5-VIBECODE-PLAN.md` Sprint F).
 *
 * Spotify-Wrapped-style recap: takes a year's worth of completed
 * cook sessions and turns them into a small set of headline
 * stats + a top-cuisines list + a top-dishes list + a per-month
 * cook count. The /path/recap route renders them; a future
 * stand-alone share card consumes the same shape.
 *
 * Pure / dependency-free / deterministic. No DOM, no React, no
 * localStorage — those live in the consuming surface.
 */

import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
type MonthLabel = (typeof MONTH_LABELS)[number];

export interface RecapTopEntry {
  /** Display label (cuisine name, dish name). Lowercased keys
   *  are normalised case-insensitively but rendered with the
   *  original casing of the most-common variant. */
  label: string;
  count: number;
  /** Fraction of total cooks this entry represents, in [0,1]. */
  share: number;
}

export interface RecapMonth {
  monthIndex: number; // 0-11
  monthLabel: MonthLabel;
  cookCount: number;
}

export interface AnnualRecap {
  /** ISO year the recap is for (UTC). */
  year: number;
  /** Window labels — `Jan 2026 → Dec 2026` etc. */
  windowLabel: string;
  /** Total completed cooks in the window. */
  totalCooks: number;
  /** Distinct cuisine families touched in the window. */
  distinctCuisines: number;
  /** Distinct dish slugs — a proxy for "new dishes tried". */
  distinctDishes: number;
  /** Total recorded star ratings in the window. */
  ratingCount: number;
  /** Mean star rating (1–5), rounded to 1 decimal. NaN-safe → 0. */
  avgRating: number;
  /** Top cuisines, capped at 5 entries, sorted by count desc. */
  topCuisines: ReadonlyArray<RecapTopEntry>;
  /** Top dishes, capped at 5 entries. */
  topDishes: ReadonlyArray<RecapTopEntry>;
  /** Per-month cook count (length 12, monthIndex 0-11). */
  byMonth: ReadonlyArray<RecapMonth>;
  /** Slug of the dish with the most cooks (or null if no cooks). */
  signatureDishSlug: string | null;
}

interface RecapInput {
  sessions: ReadonlyArray<CookSessionRecord>;
  /** UTC year to scope the recap to. Defaults to "now"'s year. */
  year?: number;
  now?: Date;
}

/**
 * Pure: aggregate a year of completed cook sessions into the
 * `AnnualRecap` shape. Gracefully handles malformed timestamps
 * by dropping the affected row from the totals.
 */
export function buildAnnualRecap(input: RecapInput): AnnualRecap {
  const now = input.now ?? new Date();
  const year = input.year ?? now.getUTCFullYear();
  const windowLabel = `Jan ${year} → Dec ${year}`;

  // Per-month bucket scaffold so the surface always has 12 rows.
  const monthBuckets: number[] = Array(12).fill(0);
  const cuisineCounts = new Map<string, number>();
  const cuisineDisplay = new Map<string, string>();
  const dishCounts = new Map<string, number>();
  const dishDisplay = new Map<string, string>();
  let totalCooks = 0;
  let ratingSum = 0;
  let ratingCount = 0;

  for (const s of input.sessions) {
    if (!s.completedAt) continue;
    const ts = new Date(s.completedAt);
    if (!Number.isFinite(ts.getTime())) continue;
    if (ts.getUTCFullYear() !== year) continue;
    totalCooks += 1;
    monthBuckets[ts.getUTCMonth()] += 1;

    const cuisineKey = (s.cuisineFamily ?? "").trim().toLowerCase();
    if (cuisineKey) {
      cuisineCounts.set(cuisineKey, (cuisineCounts.get(cuisineKey) ?? 0) + 1);
      if (!cuisineDisplay.has(cuisineKey)) {
        cuisineDisplay.set(cuisineKey, s.cuisineFamily);
      }
    }

    const dishKey = (s.recipeSlug ?? "").trim().toLowerCase();
    if (dishKey) {
      dishCounts.set(dishKey, (dishCounts.get(dishKey) ?? 0) + 1);
      if (!dishDisplay.has(dishKey)) {
        dishDisplay.set(dishKey, s.dishName);
      }
    }

    if (typeof s.rating === "number" && s.rating >= 1 && s.rating <= 5) {
      ratingSum += s.rating;
      ratingCount += 1;
    }
  }

  const avgRating =
    ratingCount === 0 ? 0 : Math.round((ratingSum / ratingCount) * 10) / 10;

  const topCuisines = topEntries(cuisineCounts, cuisineDisplay, totalCooks, 5);
  const topDishes = topEntries(dishCounts, dishDisplay, totalCooks, 5);

  const byMonth: RecapMonth[] = monthBuckets.map((count, idx) => ({
    monthIndex: idx,
    monthLabel: MONTH_LABELS[idx],
    cookCount: count,
  }));

  const signatureDishSlug = topDishes[0]
    ? (findKeyByDisplayLabel(dishDisplay, topDishes[0].label) ?? null)
    : null;

  return {
    year,
    windowLabel,
    totalCooks,
    distinctCuisines: cuisineCounts.size,
    distinctDishes: dishCounts.size,
    ratingCount,
    avgRating,
    topCuisines,
    topDishes,
    byMonth,
    signatureDishSlug,
  };
}

function topEntries(
  counts: Map<string, number>,
  display: Map<string, string>,
  total: number,
  limit: number,
): ReadonlyArray<RecapTopEntry> {
  if (counts.size === 0 || total === 0) return [];
  const arr: RecapTopEntry[] = [];
  for (const [key, count] of counts) {
    arr.push({
      label: display.get(key) ?? key,
      count,
      share: count / total,
    });
  }
  arr.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    // Tie-break alphabetically by label so output is deterministic.
    return a.label.localeCompare(b.label);
  });
  return arr.slice(0, limit);
}

function findKeyByDisplayLabel(
  display: Map<string, string>,
  label: string,
): string | null {
  for (const [key, value] of display) {
    if (value === label) return key;
  }
  return null;
}
