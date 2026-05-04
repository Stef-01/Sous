/**
 * Nutrient spotlight engine.
 *
 * Walks a per-recipe nutrition record, applies FDA thresholds, and
 * returns AT MOST ONE nutrient spotlight per recipe — never a wall of
 * call-outs, ever. Quiet by default per PARENT-MODE-PLAN §4.8.
 *
 * Priority order (per PARENT-MODE-RESEARCH §3.2 + DGA 2020-2025
 * "under-consumed nutrients of public health concern"):
 *   1. Calcium, vitamin D, iron — DGA + AAP toddler/teen-girl priorities
 *   2. Fiber, potassium                  — DGA secondary priorities
 *   3. Vitamin A, omega-3, zinc, magnesium, B12, choline — tertiary
 *
 * Within a priority bucket, ties are broken by tier (high-in beats
 * good-source) and then by lexical nutrient key for determinism.
 *
 * Returns null when no nutrient passes the FDA threshold — the
 * spotlight UI must NOT render in that case.
 */

import type {
  AgeBand,
  NutrientFlag,
  NutrientKey,
  PerServingNutrition,
} from "@/types/nutrition";
import { computeNutrientClaim } from "@/data/nutrition/claim-thresholds";

/**
 * Three priority tiers (NOT a flat priority list). Within a tier,
 * nutrients are equal in importance and the FDA claim tier
 * (high-in > good-source) is the dominant tiebreaker.
 */
const PRIORITY_TIER: Record<NutrientKey, 1 | 2 | 3> = {
  // Tier 1 — DGA + AAP public-health priorities for kids
  calcium: 1,
  vitaminD: 1,
  iron: 1,
  // Tier 2 — DGA secondary priorities
  fiber: 2,
  potassium: 2,
  // Tier 3 — credible structure-function nutrients but not DGA priority gaps
  vitaminA: 3,
  omega3: 3,
  zinc: 3,
  magnesium: 3,
  vitaminB12: 3,
  choline: 3,
};

const CLAIM_TIER_RANK: Record<NutrientFlag["tier"], number> = {
  "high-in": 0,
  "good-source": 1,
  "below-threshold": 2,
};

const ALL_NUTRIENTS = Object.keys(PRIORITY_TIER) as NutrientKey[];

/**
 * Pure function. Returns the single best-priority spotlight for the
 * recipe, or null if nothing qualifies.
 *
 * Sort order (lower wins):
 *   1. priorityTier (1 < 2 < 3)        — DGA priority bucket
 *   2. claimTier    (high-in < good-source) — FDA strength of claim
 *   3. nutrient key (lex asc)          — deterministic tiebreaker
 *
 * `ageBand` is threaded through so the UI can reference the
 * age-appropriate DRI in the methodology tooltip; the FDA Daily Value
 * itself is the same for all kids 4+ (PARENT-MODE-RESEARCH §3.1).
 */
export function pickSpotlight(
  perServing: PerServingNutrition | null | undefined,
  ageBand: AgeBand,
): NutrientFlag | null {
  if (!perServing) return null;

  let best: NutrientFlag | null = null;
  let bestKey: [number, number, string] | null = null;

  for (const nutrient of ALL_NUTRIENTS) {
    const claim = computeNutrientClaim(perServing, nutrient);
    if (claim.tier === "below-threshold") continue;

    const sortKey: [number, number, string] = [
      PRIORITY_TIER[nutrient],
      CLAIM_TIER_RANK[claim.tier],
      nutrient,
    ];

    if (
      bestKey === null ||
      sortKey[0] < bestKey[0] ||
      (sortKey[0] === bestKey[0] && sortKey[1] < bestKey[1]) ||
      (sortKey[0] === bestKey[0] &&
        sortKey[1] === bestKey[1] &&
        sortKey[2] < bestKey[2])
    ) {
      bestKey = sortKey;
      best = {
        nutrient,
        perServingAmount: claim.perServingAmount,
        percentDV: claim.percentDV,
        tier: claim.tier,
        ageBand,
      };
    }
  }

  return best;
}

/**
 * Returns ALL qualifying nutrients sorted by the same (priorityTier,
 * claimTier, nutrient) order as pickSpotlight. Used only on the
 * methodology tooltip, never on the recipe card itself.
 */
export function listQualifyingNutrients(
  perServing: PerServingNutrition | null | undefined,
  ageBand: AgeBand,
): NutrientFlag[] {
  if (!perServing) return [];
  const flags: NutrientFlag[] = [];
  for (const nutrient of ALL_NUTRIENTS) {
    const claim = computeNutrientClaim(perServing, nutrient);
    if (claim.tier === "below-threshold") continue;
    flags.push({
      nutrient,
      perServingAmount: claim.perServingAmount,
      percentDV: claim.percentDV,
      tier: claim.tier,
      ageBand,
    });
  }
  flags.sort((a, b) => {
    const t = PRIORITY_TIER[a.nutrient] - PRIORITY_TIER[b.nutrient];
    if (t !== 0) return t;
    const c = CLAIM_TIER_RANK[a.tier] - CLAIM_TIER_RANK[b.tier];
    if (c !== 0) return c;
    return a.nutrient < b.nutrient ? -1 : a.nutrient > b.nutrient ? 1 : 0;
  });
  return flags;
}
