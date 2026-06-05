/**
 * Pantry-Reuse signal (20-week plan, W1 — Data × Engine moat).
 *
 * Sides whose ingredients the user *already has on hand* — from their pantry
 * or from a cook in the last week — score higher, so the recommendation
 * reduces waste and leverages what's in the fridge (STRATEGY §6.5 Ingredient
 * Intelligence, §2.1 Data moat). This is a gentle nudge, NOT a taste driver:
 * it rides at a small weight BELOW the taste dimensions, and it is applied as a
 * post-rank reblend so a side ranked #6 with a strong pantry match can surface
 * into the top 3 — exactly the waste-reduction the thesis describes.
 *
 * Deterministic + byte-identical-safe: the reblend only runs when the caller
 * supplies a non-empty `onHand` set; with no pantry / no recent cooks the
 * ranking is untouched (guarded by a golden test).
 */

import { STAPLE_BLOCKLIST } from "../ingredient-reuse";

/**
 * Weight of the pantry-reuse dimension in the post-rank reblend. Below every
 * taste dimension (cuisineFit/flavorContrast are 0.22 each; preference 0.08):
 * a waste-reduction tie-breaker, never a reason to recommend a dish you don't
 * want. Mirrors the therapeutic reblend's "scale base by (1−w), add signal at
 * w" shape.
 */
export const PANTRY_REUSE_WEIGHT = 0.08;

/** Lowercase + trim a single ingredient name for set membership. */
export function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Fraction (0..1) of a side's *non-staple* ingredients the user already has on
 * hand. Staples (salt, oil, …) are excluded on both sides — everyone has them,
 * so they're noise, not signal (shared blocklist with the reuse hint).
 *
 * - A side with no known / no non-staple ingredients → 0 (neutral; no signal).
 * - `onHand` is expected pre-normalized, but we normalize defensively so the
 *   function is correct in isolation (and trivially unit-testable).
 */
export function scorePantryReuse(
  onHand: ReadonlySet<string>,
  sideIngredients: readonly string[],
): number {
  if (onHand.size === 0 || sideIngredients.length === 0) return 0;

  // Normalize on-hand once (defensive — callers normalize too).
  const have = new Set<string>();
  for (const n of onHand) {
    const norm = normalizeIngredientName(n);
    if (norm && !STAPLE_BLOCKLIST.has(norm)) have.add(norm);
  }
  if (have.size === 0) return 0;

  let counted = 0;
  let matched = 0;
  const seen = new Set<string>();
  for (const raw of sideIngredients) {
    const norm = normalizeIngredientName(raw);
    if (!norm || STAPLE_BLOCKLIST.has(norm)) continue;
    if (seen.has(norm)) continue; // dedupe within the side
    seen.add(norm);
    counted += 1;
    if (have.has(norm)) matched += 1;
  }

  if (counted === 0) return 0;
  return matched / counted;
}

/**
 * Context the pairing engine needs to compute pantry reuse: the normalized set
 * of ingredients the user has on hand, and a slug → ingredient-names lookup so
 * the engine can read each side's ingredients (which the candidate object
 * itself doesn't carry). Built at the request boundary (tRPC router) from
 * client-supplied pantry + recent-cook data.
 */
export interface PantryReuseContext {
  onHand: ReadonlySet<string>;
  ingredientsBySlug: ReadonlyMap<string, readonly string[]>;
}
