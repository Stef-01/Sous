import type { Scorer, MainDishIntent, SideDishCandidate } from "../types";

/**
 * Seasonal Relevance Scorer
 *
 * Boosts dishes that match the current season:
 * - Summer (Jun–Aug): salads, cold sides, fresh/light dishes
 * - Winter (Dec–Feb): soups, stews, warm/hearty dishes
 * - Spring/Fall: neutral — no strong boost or penalty
 *
 * Uses tags and temperature field to infer seasonal fit.
 */

type Season = "spring" | "summer" | "fall" | "winter";

function getCurrentSeason(now?: Date): Season {
  const month = (now ?? new Date()).getMonth(); // 0-indexed
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

/** Tags/keywords that suggest a summer-friendly dish. */
const SUMMER_SIGNALS = new Set([
  "salad",
  "cold",
  "fresh",
  "raw",
  "chilled",
  "light",
  "refreshing",
  "no-cook",
  "pickled",
  "citrus",
]);

/** Tags/keywords that suggest a winter-friendly dish. */
const WINTER_SIGNALS = new Set([
  "soup",
  "stew",
  "warm",
  "hot",
  "roasted",
  "baked",
  "hearty",
  "braised",
  "comfort",
  "gratin",
  "casserole",
]);

function countSignalHits(tags: string[], signals: Set<string>): number {
  let count = 0;
  for (const tag of tags) {
    if (signals.has(tag.toLowerCase())) count++;
  }
  return count;
}

export const seasonalScorer: Scorer = {
  name: "seasonal",

  score(_main: MainDishIntent, side: SideDishCandidate): number {
    const season = getCurrentSeason();
    const tags = side.tags.map((t) => t.toLowerCase());
    const temp = (side.temperature ?? "").toLowerCase();

    // Combine tags + temperature for signal detection
    const allSignals = [...tags, temp];

    const summerHits = countSignalHits(allSignals, SUMMER_SIGNALS);
    const winterHits = countSignalHits(allSignals, WINTER_SIGNALS);

    // Base score is neutral
    let score = 0.5;

    if (season === "summer") {
      // Boost summer-friendly, penalize winter-heavy
      if (summerHits > 0) score = 0.7 + Math.min(summerHits * 0.1, 0.2);
      if (winterHits > 0 && summerHits === 0) score = 0.3;
    } else if (season === "winter") {
      // Boost winter-friendly, penalize cold-only
      if (winterHits > 0) score = 0.7 + Math.min(winterHits * 0.1, 0.2);
      if (summerHits > 0 && winterHits === 0) score = 0.35;
    } else {
      // Spring/fall: mild boost for either direction, no penalty
      if (season === "spring" && summerHits > 0) score = 0.6;
      if (season === "fall" && winterHits > 0) score = 0.6;
    }

    return score;
  },
};
