/**
 * Cuisine cook stats (Y3 polish-week backfill — Sprint K recon target).
 *
 * Pure helpers for the /path/cuisines surface. Aggregates cook
 * sessions by cuisine family + maps to the Path-tab cuisine
 * cards' made-it-ring count.
 *
 * Pure / dependency-free / deterministic.
 */

import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

/** Default target cooks for a cuisine to render as "fluent"
 *  on the Path tab. 5 is the same threshold the W30 V2 trainer
 *  uses for "enough signal" — keeps the metaphor consistent
 *  across surfaces. */
export const CUISINE_FLUENCY_TARGET = 5;

/** Pure: count completed cooks per cuisine family. Sessions
 *  without a cuisine or completedAt are skipped. Output is a
 *  Map for O(1) lookups by the cuisine card surface. */
export function countCooksByCuisine(
  sessions: ReadonlyArray<CookSessionRecord>,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const s of sessions) {
    if (typeof s.completedAt !== "string") continue;
    const cuisine = s.cuisineFamily?.toLowerCase().trim();
    if (!cuisine || cuisine.length === 0) continue;
    out.set(cuisine, (out.get(cuisine) ?? 0) + 1);
  }
  return out;
}

/** Visual glyph for a cuisine family — a single emoji that
 *  reads as the cuisine without needing localised flag
 *  semantics. Pure mapping; falls back to a neutral utensil
 *  emoji for cuisines not in the table. */
const CUISINE_GLYPHS: Record<string, string> = {
  italian: "🍝",
  french: "🥖",
  japanese: "🍣",
  chinese: "🥡",
  indian: "🍛",
  thai: "🌶️",
  mexican: "🌮",
  spanish: "🥘",
  korean: "🍲",
  vietnamese: "🍜",
  greek: "🫒",
  "middle-eastern": "🥙",
  "north african": "🌶️",
  american: "🍔",
  peruvian: "🍤",
};

export function glyphForCuisine(cuisine: string): string {
  return CUISINE_GLYPHS[cuisine.toLowerCase()] ?? "🍴";
}

/** Pure: combine the W44 vocabulary catalog's cuisine list with
 *  the user's cook counts. Returns a card-shaped row for each
 *  distinct cuisine in the catalog OR in the user's history,
 *  sorted by cook count descending then alphabetically.
 *
 *  Cuisines with no entry in either source are dropped. */
export interface CuisineCardRow {
  cuisine: string;
  count: number;
  target: number;
  glyph: string;
}

export function buildCuisineCardRows(opts: {
  catalogCuisines: ReadonlyArray<string>;
  cookCounts: ReadonlyMap<string, number>;
  target?: number;
}): CuisineCardRow[] {
  const target = opts.target ?? CUISINE_FLUENCY_TARGET;
  const all = new Set<string>();
  for (const c of opts.catalogCuisines) all.add(c.toLowerCase());
  for (const c of opts.cookCounts.keys()) all.add(c.toLowerCase());

  const rows: CuisineCardRow[] = [];
  for (const cuisine of all) {
    rows.push({
      cuisine,
      count: opts.cookCounts.get(cuisine) ?? 0,
      target,
      glyph: glyphForCuisine(cuisine),
    });
  }

  rows.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.cuisine.localeCompare(b.cuisine);
  });
  return rows;
}
