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

export function matchDishesByText(query: string, limit = 5): DishMatch[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const tokens = q.split(/\s+/).filter((t) => t.length > 1);
  const scored = ALL.map((d) => {
    const name = d.name.toLowerCase();
    const nameTokens = name.split(/[^a-z0-9]+/).filter(Boolean);
    let score = 0;
    if (name === q) score += 100;
    else if (name.includes(q)) score += 50;
    for (const t of tokens) {
      if (name.includes(t)) {
        score += 10;
      } else if (nameTokens.some((nt) => nt.startsWith(t))) {
        // prefix: "brocc" → broccoli
        score += 8;
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
