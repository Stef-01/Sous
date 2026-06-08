/**
 * Bioavailability tips (W27) — turn a dish's composed nutrition (and, where it
 * helps, its ingredients) into ONE actionable, well-established absorption cue.
 * Educational cooking nudges, never claims about the dish's numbers. Returns at
 * most one tip (most specific / highest-signal first) or null.
 *
 * Every tip is grounded in standard nutrition science and framed directionally
 * ("helps you absorb") — never with a magnitude or a medical claim:
 *  - vitamin C → non-heme iron (reduces it to the absorbable form + chelates it)
 *  - piperine (black pepper) → curcumin (turmeric): slows its breakdown so more
 *    reaches the bloodstream
 *  - tea/coffee tannins ↓ non-heme iron when taken WITH the meal (timing cue)
 *  - the fat-soluble vitamins (A, D, E, K) need a little dietary fat to be carried
 *  - vitamin D switches on the gut's calcium transporters
 */

import type { PerServingNutrition } from "@/types/nutrition";

// FDA DV anchors for the "is this meaningfully present" thresholds.
const DV = {
  iron_mg: 18,
  vitaminC_mg: 90,
  vitaminA_mcg_rae: 900,
  vitaminD_mcg: 20,
  vitaminE_mg: 15,
  vitaminK_mcg: 120,
  calcium_mg: 1300,
  zinc_mg: 11,
};

/** Dried-legume ids whose phytates soaking/sprouting/fermenting helps break down
 *  (processed soy like tofu is excluded — the prep no longer applies). */
const LEGUMES: ReadonlySet<string> = new Set([
  "red-lentils",
  "chickpeas",
  "black-beans",
  "pinto-beans",
  "navy-beans",
]);

export interface BioavailabilityTip {
  tip: string;
  /** Short tappable "why" — the mechanism, for progressive disclosure. */
  why: string;
}

export function bioavailabilityTip(
  n: PerServingNutrition,
  ingredientIds?: ReadonlySet<string>,
): BioavailabilityTip | null {
  const frac = (v: number | undefined, dv: number) => (v ?? 0) / dv;
  const ironPct = frac(n.iron_mg, DV.iron_mg);
  const vitCPct = frac(n.vitaminC_mg, DV.vitaminC_mg);

  // 1) Turmeric without black pepper → a crack of pepper lifts curcumin uptake.
  if (ingredientIds?.has("turmeric") && !ingredientIds.has("black-pepper")) {
    return {
      tip: "A crack of black pepper helps your body absorb the turmeric here.",
      why: "Black pepper's piperine slows curcumin's breakdown in the gut and liver, so much more of it reaches your bloodstream.",
    };
  }

  // 2) Iron-rich but low vitamin C → pair with something acidic/bright.
  if (ironPct >= 0.2 && vitCPct < 0.1) {
    return {
      tip: "A squeeze of citrus or some peppers helps you absorb the iron here.",
      why: "Vitamin C reduces plant (non-heme) iron to the form your gut absorbs, and keeps it soluble.",
    };
  }

  // 3) Fat-soluble vitamins present but the dish is very low fat → add a little fat.
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

  // 4) Legume dish carrying iron/zinc → soaking/sprouting frees the minerals.
  const hasLegume =
    !!ingredientIds && [...LEGUMES].some((l) => ingredientIds.has(l));
  if (hasLegume && (ironPct >= 0.15 || frac(n.zinc_mg, DV.zinc_mg) >= 0.15)) {
    return {
      tip: "Soaking or sprouting dried beans before cooking frees up more of their iron and zinc.",
      why: "Phytates in beans and grains bind iron and zinc; soaking, sprouting, or fermenting breaks them down so more is absorbed.",
    };
  }

  // 5) Tomato in the dish → cooked tomatoes give up far more lycopene than raw.
  if (ingredientIds?.has("tomato") || ingredientIds?.has("tomato-paste")) {
    return {
      tip: "Cooked tomatoes give up far more lycopene than raw — a simmered sauce especially.",
      why: "Heat breaks the tomato's cell walls, freeing the antioxidant lycopene; a little oil helps you absorb it.",
    };
  }

  // 6) Calcium + vitamin D together → they work as a pair.
  if (
    frac(n.calcium_mg, DV.calcium_mg) >= 0.2 &&
    frac(n.vitaminD_mcg, DV.vitaminD_mcg) >= 0.2
  ) {
    return {
      tip: "The vitamin D here helps your body make the most of the calcium.",
      why: "Vitamin D switches on the calcium transporters in your gut.",
    };
  }

  // 5) Strongly iron-rich (already with some vitamin C) → mind the tea/coffee timing.
  if (ironPct >= 0.25 && vitCPct >= 0.1) {
    return {
      tip: "Enjoy tea or coffee an hour either side of this meal, not with it.",
      why: "Tannins in tea and coffee bind plant (non-heme) iron at the table and can blunt how much you absorb.",
    };
  }

  return null;
}
