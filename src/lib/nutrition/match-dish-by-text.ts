/**
 * W29 — match a free-text (or voice-dictated) phrase to catalogue dishes for
 * quick-logging. Deliberately a simple, dependency-free fuzzy match so it works
 * offline with no AI key; the Claude craving-parser can refine it later for
 * multi-item phrases.
 *
 * Stage 6 upgrade (logging-speed pass): token PREFIX matching ("brocc" finds
 * broccoli), one-typo tolerance on tokens ≥4 chars ("brocoli" still matches),
 * and a per-serving kcal preview on each result so the user can pick the right
 * dish confidently without opening it. Scoring stays exact > substring >
 * token-prefix > typo so precise queries never lose to fuzzy ones.
 */

import { meals, sides } from "@/data";
import {
  getDishNutrition,
  NUTRITION_COVERAGE_FLOOR,
} from "@/lib/engine/dish-nutrition";

export interface DishMatch {
  id: string;
  name: string;
  /** Per-serving calories, when coverage is display-grade; null otherwise. */
  kcal: number | null;
}

const ALL: { id: string; name: string }[] = [
  ...meals.map((m) => ({ id: m.id, name: m.name })),
  ...sides.map((s) => ({ id: s.id, name: s.name })),
];

/** Levenshtein distance capped at 2 — enough to test "≤1 edit" cheaply. */
function editDistanceAtMost1(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  // One substitution (equal length) or one insertion/deletion (off by one).
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (la === lb) {
      i++;
      j++;
    } else if (la > lb) {
      i++;
    } else {
      j++;
    }
  }
  return edits + (la - i) + (lb - j) <= 1;
}

function kcalFor(id: string): number | null {
  const { perServing, massedCoverage } = getDishNutrition(id);
  if (!perServing || massedCoverage < NUTRITION_COVERAGE_FLOOR) return null;
  const kcal = perServing.calories;
  return typeof kcal === "number" && Number.isFinite(kcal)
    ? Math.round(kcal)
    : null;
}

/** Connectors never name a food — scoring them lets "dal AND rice" reward
 *  "m-and-u". The multi-match splitter consumes them as separators instead. */
const STOPWORDS = new Set([
  "and",
  "with",
  "plus",
  "the",
  "of",
  "a",
  "an",
  "or",
]);

export function matchDishesByText(query: string, limit = 5): DishMatch[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const tokens = q
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
  const scored = ALL.map((d) => {
    const name = d.name.toLowerCase();
    const nameTokens = name.split(/[^a-z0-9]+/).filter(Boolean);
    let score = 0;
    if (name === q) score += 100;
    else if (name.includes(q)) score += 50;
    for (const t of tokens) {
      if (nameTokens.includes(t)) {
        // whole word: "dal" → "dal tadka" (mid-word hits like "and" in
        // "mandu" no longer outrank real word matches)
        score += 10;
      } else if (nameTokens.some((nt) => nt.startsWith(t))) {
        // prefix: "brocc" → broccoli
        score += 8;
      } else if (name.includes(t)) {
        // mid-word substring — weak signal, kept below prefix
        score += 3;
      } else if (
        t.length >= 4 &&
        nameTokens.some((nt) => editDistanceAtMost1(t, nt))
      ) {
        // one typo: "brocoli" → broccoli
        score += 5;
      }
    }
    return { d, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.d.name.length - b.d.name.length);
  // kcal computed only for the returned page (≤ limit dishes), not the catalogue.
  return scored.slice(0, limit).map((x) => ({ ...x.d, kcal: kcalFor(x.d.id) }));
}

/**
 * #2 — multi-item logging: "dal and rice with a lassi" → the best match per
 * segment. Local + offline (separator split → existing scorer); the Claude
 * craving parser can upgrade ambiguous phrases later. Segments that match the
 * same dish are de-duplicated; single-segment queries return [] so the caller
 * keeps the richer single-match chip flow.
 */
export function matchMultipleByText(query: string): DishMatch[] {
  const segments = query
    .split(/\s*(?:,|;|\band\b|\bwith\b|\bplus\b|\+|&)\s*/i)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
  if (segments.length < 2) return [];
  const out: DishMatch[] = [];
  const seen = new Set<string>();
  for (const seg of segments) {
    const best = matchDishesByText(seg, 1)[0];
    if (best && !seen.has(best.id)) {
      seen.add(best.id);
      out.push(best);
    }
  }
  return out.length >= 2 ? out : [];
}
