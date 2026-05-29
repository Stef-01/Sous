/**
 * Pantry-aware rerank (Y2 Sprint D W16).
 *
 * Soft post-process modifier: candidates whose ingredients are
 * mostly in the user's pantry get a small score boost. Doesn't
 * filter — every side that survives the ranker still survives
 * here. Pure-rules-based per the W10 V3 lesson (learned signals
 * need real cohort data; rule-based ships now).
 *
 * Boost rule (intentionally discontinuous at the 0.7 threshold
 * per the Y2 plan):
 *   - coverage ≥ 0.7 → totalScore += coverage × 0.20
 *   - coverage < 0.7 → totalScore += coverage × 0.10
 *
 * The discontinuity captures "you have most of this" as a
 * meaningfully different signal from "you have some of this".
 * 0.69 coverage scores +0.069; 0.70 jumps to +0.14.
 *
 * No-pantry-user regression guard: when the pantry set is empty
 * (cold-start, privacy mode), every candidate's coverage is 0
 * so the modifier is 0 — output is bit-identical to the input
 * ranking. Tested explicitly.
 *
 * Same shape as `time-rerank.ts`: pure post-processor on
 * `ScoredCandidate[]`, opt-in via context parameter on the
 * pairing engine, no surprises if context is omitted.
 */

import type { ScoredCandidate } from "./types";
import {
  computePantryCoverage,
  type CoverageIngredient,
} from "./pantry-coverage";

export const PANTRY_HIGH_COVERAGE_THRESHOLD = 0.7;
export const PANTRY_HIGH_COVERAGE_FACTOR = 0.2;
export const PANTRY_LOW_COVERAGE_FACTOR = 0.1;

export interface PantryRerankContext {
  /** The user's pantry as a normalised string set OR raw array.
   *  When empty → no-op (regression guard against no-pantry users). */
  pantry: ReadonlySet<string> | ReadonlyArray<string>;
  /** Lookup from candidate.slug → its ingredient list. Sides
   *  without an entry are treated as having no ingredient data;
   *  their score stays unchanged. */
  ingredientsBySlug: ReadonlyMap<string, ReadonlyArray<CoverageIngredient>>;
}

/** Pure helper: compute the score delta for a single coverage
 *  value. Exposed for testing + dev-tools. */
export function pantryBoostFromCoverage(coverage: number): number {
  if (!Number.isFinite(coverage) || coverage <= 0) return 0;
  if (coverage >= PANTRY_HIGH_COVERAGE_THRESHOLD) {
    return coverage * PANTRY_HIGH_COVERAGE_FACTOR;
  }
  return coverage * PANTRY_LOW_COVERAGE_FACTOR;
}

/** Pure post-process: nudge each candidate's totalScore by the
 *  pantry-coverage modifier. Returns a NEW array re-sorted by
 *  adjusted totalScore. Per-dim `scores` are preserved
 *  unchanged.
 *
 *  Pantry empty OR no ingredient data for any candidate → output
 *  is bit-identical to input (regression guard). */
export function applyPantryRerank(
  ranked: ReadonlyArray<ScoredCandidate>,
  context: PantryRerankContext,
): ScoredCandidate[] {
  // Regression guard: empty pantry → no-op.
  const pantrySize =
    context.pantry instanceof Set
      ? context.pantry.size
      : (context.pantry as ReadonlyArray<string>).length;
  if (pantrySize === 0) return [...ranked];

  const adjusted = ranked.map((c) => {
    const ingredients = context.ingredientsBySlug.get(c.sideDish.slug);
    if (!ingredients || ingredients.length === 0) return c;
    const { coverage } = computePantryCoverage({ ingredients }, context.pantry);
    const delta = pantryBoostFromCoverage(coverage);
    if (delta === 0) return c;
    return {
      ...c,
      totalScore: clampUnit(c.totalScore + delta),
    };
  });

  adjusted.sort((a, b) => b.totalScore - a.totalScore);
  return adjusted;
}

function clampUnit(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
