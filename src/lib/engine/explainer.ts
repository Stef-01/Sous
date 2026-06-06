import type { ScoredCandidate, ScoreBreakdown } from "./types";

/**
 * Explainer  -  generates human-readable "why this won" text from score dimensions.
 *
 * Picks the top 2 scoring dimensions and composes a plain-language explanation.
 */

type DimensionKey = keyof ScoreBreakdown;

const DIMENSION_PHRASES: Record<DimensionKey, Record<string, string>> = {
  cuisineFit: {
    high: "pairs naturally with the cuisine",
    mid: "bridges cuisines nicely",
  },
  flavorContrast: {
    high: "adds bright contrast",
    mid: "adds flavor variety",
  },
  nutritionBalance: {
    high: "boosts nutritional balance",
    mid: "rounds out the meal",
  },
  prepBurden: {
    high: "comes together fast",
    mid: "has manageable prep",
  },
  temperature: {
    high: "brings a refreshing contrast",
    mid: "complements the warmth",
  },
  preference: {
    high: "matches your taste",
    mid: "aligns with your preferences",
  },
  seasonal: {
    high: "perfect for the season",
    mid: "suits the weather",
  },
  antiMonotony: {
    high: "adds variety to your week",
    mid: "something different",
  },
  // Culinary Therapeutics (CT-3). Claim-safe by construction — "supports", not
  // "treats". Only ever reached when a clinician-approved care profile is active.
  therapeuticFit: {
    high: "supports your health focus",
    mid: "fits your health focus",
  },
  // Pantry-reuse (W1). Surfaces the waste-reduction reason when a side leans
  // on ingredients the user already has. Only reached when on-hand context
  // was supplied to the engine.
  pantryReuse: {
    high: "uses what's already in your kitchen",
    mid: "reuses an ingredient you have",
  },
  // Deficiency-fill (W29). Surfaces the gap-closing reason when a side is a
  // strong source of nutrients the user is short on today. Only reached when
  // the day's deficits were supplied to the engine.
  deficiencyFill: {
    high: "fills a nutrient gap from today",
    mid: "helps round out today's nutrition",
  },
};

/**
 * Generate an explanation for a scored candidate.
 */
export function generateExplanation(candidate: ScoredCandidate): string {
  const { scores, sideDish } = candidate;

  // Find top 2 dimensions by score
  const ranked = (Object.entries(scores) as [DimensionKey, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);

  const phrases = ranked.map(([key, value]) => {
    const level = value >= 0.7 ? "high" : "mid";
    return DIMENSION_PHRASES[key][level];
  });

  const sideName = sideDish.name;
  if (phrases.length >= 2) {
    return `${sideName} ${phrases[0]} and ${phrases[1]}.`;
  }
  if (phrases.length === 1) {
    return `${sideName} ${phrases[0]}.`;
  }
  return `${sideName} pairs well with your meal.`;
}

/**
 * Add explanations to all scored candidates in place.
 */
export function addExplanations(
  candidates: ScoredCandidate[],
): ScoredCandidate[] {
  return candidates.map((c) => ({
    ...c,
    explanation: generateExplanation(c),
  }));
}
