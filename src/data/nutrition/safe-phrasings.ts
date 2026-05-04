/**
 * Safe phrasings — FDA-defensible UI copy for Parent Mode nutrient spotlights.
 *
 * Every string in this file passes the SAFE/UNSAFE cheatsheet in
 * PARENT-MODE-RESEARCH §4.4. Templates avoid disease references and
 * pediatric-specific dosing language; structure-function claims are
 * permitted for conventional foods without disclaimer.
 *
 * Verbatim FDA-authorized health claims (the 12 SSA-approved claims —
 * e.g. calcium + vitamin D → osteoporosis, sodium → hypertension) live
 * in ./verbatim-health-claims.ts and are opt-in only, never the default
 * spotlight copy.
 *
 * THIS FILE IS LOCKED: post Week 23 legal review, a build-time linter
 * (Phase D acceptance) will fail the build if a string outside this
 * lock list ships. New copy = new commit, new review.
 */

import type { ClaimTier, NutrientKey } from "@/types/nutrition";

interface SafePhrasing {
  /** Lead line — appears as the spotlight headline. */
  lead: string;
  /** Optional structure-function follow-up (one sentence). Already SAFE. */
  whyItMatters: string;
}

/**
 * Tier-aware copy templates. Lookup is (nutrient, tier).
 * `below-threshold` returns null at the call site; the spotlight engine
 * never renders a line for a nutrient that fails the FDA threshold.
 */
const PHRASINGS: Record<
  NutrientKey,
  Record<Exclude<ClaimTier, "below-threshold">, SafePhrasing>
> = {
  calcium: {
    "high-in": {
      lead: "High in calcium.",
      whyItMatters: "Calcium and vitamin D help build strong bones.",
    },
    "good-source": {
      lead: "Good source of calcium.",
      whyItMatters: "Calcium and vitamin D help build strong bones.",
    },
  },
  iron: {
    "high-in": {
      lead: "High in iron.",
      whyItMatters: "Iron supports healthy growth and development.",
    },
    "good-source": {
      lead: "Good source of iron.",
      whyItMatters: "Iron supports healthy growth and development.",
    },
  },
  vitaminD: {
    "high-in": {
      lead: "High in vitamin D.",
      whyItMatters: "Vitamin D helps the body absorb calcium for bones.",
    },
    "good-source": {
      lead: "Good source of vitamin D.",
      whyItMatters: "Vitamin D helps the body absorb calcium for bones.",
    },
  },
  vitaminA: {
    "high-in": {
      lead: "High in vitamin A.",
      whyItMatters: "Vitamin A supports normal vision and healthy skin.",
    },
    "good-source": {
      lead: "Good source of vitamin A.",
      whyItMatters: "Vitamin A supports normal vision and healthy skin.",
    },
  },
  fiber: {
    "high-in": {
      lead: "High in fiber.",
      whyItMatters: "Fiber supports healthy digestion.",
    },
    "good-source": {
      lead: "Good source of fiber.",
      whyItMatters: "Fiber supports healthy digestion.",
    },
  },
  potassium: {
    "high-in": {
      lead: "High in potassium.",
      whyItMatters:
        "Potassium helps muscles and the nervous system work normally.",
    },
    "good-source": {
      lead: "Good source of potassium.",
      whyItMatters:
        "Potassium helps muscles and the nervous system work normally.",
    },
  },
  omega3: {
    "high-in": {
      lead: "High in omega-3.",
      whyItMatters: "Omega-3 supports normal brain and eye development.",
    },
    "good-source": {
      lead: "Good source of omega-3.",
      whyItMatters: "Omega-3 supports normal brain and eye development.",
    },
  },
  zinc: {
    "high-in": {
      lead: "High in zinc.",
      whyItMatters: "Zinc supports normal growth and immune function.",
    },
    "good-source": {
      lead: "Good source of zinc.",
      whyItMatters: "Zinc supports normal growth and immune function.",
    },
  },
  magnesium: {
    "high-in": {
      lead: "High in magnesium.",
      whyItMatters: "Magnesium supports normal muscle and nerve function.",
    },
    "good-source": {
      lead: "Good source of magnesium.",
      whyItMatters: "Magnesium supports normal muscle and nerve function.",
    },
  },
  vitaminB12: {
    "high-in": {
      lead: "High in vitamin B12.",
      whyItMatters: "Vitamin B12 helps make red blood cells.",
    },
    "good-source": {
      lead: "Good source of vitamin B12.",
      whyItMatters: "Vitamin B12 helps make red blood cells.",
    },
  },
  choline: {
    "high-in": {
      lead: "High in choline.",
      whyItMatters: "Choline supports normal brain development.",
    },
    "good-source": {
      lead: "Good source of choline.",
      whyItMatters: "Choline supports normal brain development.",
    },
  },
};

/**
 * Returns the SAFE phrasing for a (nutrient, tier) pair, or null when
 * the tier is below-threshold (no claim is allowed).
 */
export function getSafePhrasing(
  nutrient: NutrientKey,
  tier: ClaimTier,
): SafePhrasing | null {
  if (tier === "below-threshold") return null;
  return PHRASINGS[nutrient][tier];
}

/**
 * The standard disclaimer. Mirrors MyFitnessPal / Lose It / Mealime /
 * Yummly patterns per PARENT-MODE-RESEARCH §4.5. Belt-and-suspenders;
 * does NOT cure a misleading claim on its own.
 */
export const STANDARD_DISCLAIMER =
  "Nutrition information is estimated and provided for educational purposes only. It is not medical or nutritional advice. Daily Values are based on a 2,000-calorie diet for adults and children 4 years and older; your child's needs may differ. Consult your pediatrician or a registered dietitian about your child's specific dietary needs, allergies, and any medical conditions.";
