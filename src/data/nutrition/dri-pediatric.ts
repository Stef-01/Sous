/**
 * NASEM Dietary Reference Intakes (DRIs) — pediatric bands.
 *
 * These are the per-day quantitative intakes from the National Academies
 * (RDA where available, AI as fallback). The Dietary Guidelines for
 * Americans 2020-2025 names calcium, vitamin D, potassium, fiber as
 * under-consumed nutrients of public-health concern, with iron added
 * for toddlers and adolescent girls (PARENT-MODE-RESEARCH §3.2).
 *
 * Use these for educational framing only ("the National Academies'
 * recommended intake for ages 4-8 is 1,000 mg/day calcium"). Do NOT
 * attribute pediatric DRIs to the FDA — the FDA does not set them
 * (PARENT-MODE-RESEARCH §3.1).
 *
 * Sources:
 * - National Academies DRI tables: https://www.ncbi.nlm.nih.gov/books/NBK208874/
 * - NIH ODS factsheets per nutrient: https://ods.od.nih.gov/factsheets/
 * - Linus Pauling Institute children: https://lpi.oregonstate.edu/mic/life-stages/children
 */

import type { AgeBand, NutrientKey } from "@/types/nutrition";

/**
 * Age-banded DRI per nutrient. Values for the "mix" band fall back to
 * 4-8 (the safest middle default per PARENT-MODE-PLAN §9 open-question
 * resolution).
 *
 * For nutrients where male and female DRIs diverge in 9-13 / 14-18, we
 * conservatively store the lower of the two so educational framing
 * never overstates the recommendation.
 */
const DRI_TABLE: Record<NutrientKey, Record<AgeBand, number>> = {
  calcium: {
    "1-3": 700,
    "4-8": 1000,
    "9-13": 1300,
    "14-18": 1300,
    mix: 1000,
  },
  iron: {
    "1-3": 7,
    "4-8": 10,
    "9-13": 8,
    "14-18": 11,
    mix: 10,
  },
  vitaminD: {
    "1-3": 15,
    "4-8": 15,
    "9-13": 15,
    "14-18": 15,
    mix: 15,
  },
  vitaminA: {
    "1-3": 300,
    "4-8": 400,
    "9-13": 600,
    "14-18": 700,
    mix: 400,
  },
  fiber: {
    "1-3": 19,
    "4-8": 25,
    "9-13": 26,
    "14-18": 26,
    mix: 25,
  },
  potassium: {
    "1-3": 2000,
    "4-8": 2300,
    "9-13": 2300,
    "14-18": 2300,
    mix: 2300,
  },
  omega3: {
    "1-3": 0.7,
    "4-8": 0.9,
    "9-13": 1.0,
    "14-18": 1.1,
    mix: 0.9,
  },
  zinc: {
    "1-3": 3,
    "4-8": 5,
    "9-13": 8,
    "14-18": 9,
    mix: 5,
  },
  magnesium: {
    "1-3": 80,
    "4-8": 130,
    "9-13": 240,
    "14-18": 360,
    mix: 130,
  },
  vitaminB12: {
    "1-3": 0.9,
    "4-8": 1.2,
    "9-13": 1.8,
    "14-18": 2.4,
    mix: 1.2,
  },
  choline: {
    "1-3": 200,
    "4-8": 250,
    "9-13": 375,
    "14-18": 400,
    mix: 250,
  },
};

export function getPediatricDRI(
  nutrient: NutrientKey,
  ageBand: AgeBand,
): number {
  return DRI_TABLE[nutrient][ageBand];
}

/**
 * Returns the lower-bound DRI across all pediatric age bands for a
 * given nutrient. Useful for the "even your kid hits this" floor that
 * the spotlight engine uses to avoid overstating the achievement.
 */
export function getMinPediatricDRI(nutrient: NutrientKey): number {
  const bands = DRI_TABLE[nutrient];
  return Math.min(bands["1-3"], bands["4-8"], bands["9-13"], bands["14-18"]);
}
