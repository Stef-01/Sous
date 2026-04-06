import type { ScoredCandidate, ScoreBreakdown } from "./types";

/**
 * Explainer — generates human-readable "why this won" text from score dimensions.
 *
 * Picks the top 2 scoring dimensions and composes a plain-language explanation.
 */

type DimensionKey = keyof ScoreBreakdown;

const DIMENSION_PHRASES: Record<DimensionKey, Record<string, string>> = {
  cuisineFit: {
    high: "a natural culinary companion",
    mid: "a cross-cuisine complement",
  },
  flavorContrast: {
    high: "adds bright contrast",
    mid: "provides flavor variety",
  },
  nutritionBalance: {
    high: "boosts nutritional balance",
    mid: "rounds out the meal",
  },
  prepBurden: {
    high: "ready in no time",
    mid: "manageable prep alongside your main",
  },
  temperature: {
    high: "refreshing temperature contrast",
    mid: "complements the meal's warmth",
  },
  preference: {
    high: "matches your taste",
    mid: "aligns with your preferences",
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

  // Compose sentence
  const sideName = sideDish.name;
  if (phrases.length >= 2) {
    return `${sideName}: ${phrases[0]} that ${phrases[1]}.`;
  }
  if (phrases.length === 1) {
    return `${sideName}: ${phrases[0]}.`;
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
