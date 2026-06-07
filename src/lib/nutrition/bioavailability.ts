/**
 * Bioavailability tips (W27) — turn a dish's composed nutrition into ONE
 * actionable, well-established absorption tip. These are educational cooking
 * cues (not claims about the dish's numbers): vitamin C boosts non-heme iron
 * absorption; the fat-soluble vitamins (A, D, E, K) need a little dietary fat.
 * Returns at most one tip (highest-signal first) or null.
 *
 * Honesty: this never modifies the displayed values — it's a "cook it this way"
 * nudge grounded in standard nutrition science, surfaced only at dish level.
 */

import type { PerServingNutrition } from "@/types/nutrition";

// FDA DV anchors used for the "is this meaningfully present" thresholds.
const DV = {
  iron_mg: 18,
  vitaminC_mg: 90,
  vitaminA_mcg_rae: 900,
  vitaminD_mcg: 20,
  vitaminE_mg: 15,
  vitaminK_mcg: 120,
};

export interface BioavailabilityTip {
  tip: string;
  /** Short tappable "why" — the mechanism, for progressive disclosure. */
  why: string;
}

export function bioavailabilityTip(
  n: PerServingNutrition,
): BioavailabilityTip | null {
  const frac = (v: number | undefined, dv: number) => (v ?? 0) / dv;

  // 1) Iron-rich but low vitamin C → pair with something acidic/bright.
  const ironPct = frac(n.iron_mg, DV.iron_mg);
  const vitCPct = frac(n.vitaminC_mg, DV.vitaminC_mg);
  if (ironPct >= 0.2 && vitCPct < 0.1) {
    return {
      tip: "A squeeze of citrus or some peppers helps you absorb the iron here.",
      why: "Vitamin C converts plant (non-heme) iron to a form the body absorbs far better.",
    };
  }

  // 2) Fat-soluble vitamins present but the dish is very low fat → add a little fat.
  const fatSolublePresent =
    frac(n.vitaminA_mcg_rae, DV.vitaminA_mcg_rae) >= 0.2 ||
    frac(n.vitaminD_mcg, DV.vitaminD_mcg) >= 0.2 ||
    frac(n.vitaminE_mg, DV.vitaminE_mg) >= 0.2 ||
    frac(n.vitaminK_mcg, DV.vitaminK_mcg) >= 0.2;
  if (fatSolublePresent && (n.totalFat_g ?? 0) < 3) {
    return {
      tip: "A drizzle of oil or some avocado helps absorb the vitamins A, D, E and K here.",
      why: "Those vitamins are fat-soluble — a little dietary fat carries them into the body.",
    };
  }

  return null;
}
