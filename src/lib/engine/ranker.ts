import type {
  MainDishIntent,
  SideDishCandidate,
  ScoredCandidate,
  ScoreBreakdown,
  Scorer,
} from "./types";

/**
 * Ranker — aggregates per-dimension scores with weights and selects top K.
 *
 * The engine is deterministic given the same inputs. Novelty is introduced
 * through daily rotation of tie-breaking logic (day-of-year modulo).
 */

/**
 * Score all candidates and return them sorted descending by totalScore.
 */
export function rankCandidates(
  main: MainDishIntent,
  candidates: SideDishCandidate[],
  scorers: Scorer[],
  weights: Record<keyof ScoreBreakdown, number>,
  userPreferences?: Record<string, number>,
): ScoredCandidate[] {
  const scored: ScoredCandidate[] = candidates.map((side) => {
    const scores: Partial<ScoreBreakdown> = {};

    for (const scorer of scorers) {
      scores[scorer.name] = scorer.score(main, side, userPreferences);
    }

    const fullScores: ScoreBreakdown = {
      cuisineFit: scores.cuisineFit ?? 0.5,
      flavorContrast: scores.flavorContrast ?? 0.5,
      nutritionBalance: scores.nutritionBalance ?? 0.5,
      prepBurden: scores.prepBurden ?? 0.5,
      temperature: scores.temperature ?? 0.5,
      preference: scores.preference ?? 0.5,
    };

    const totalScore = Object.entries(weights).reduce(
      (sum, [key, weight]) =>
        sum + fullScores[key as keyof ScoreBreakdown] * weight,
      0,
    );

    return {
      sideDish: side,
      scores: fullScores,
      totalScore,
      explanation: "", // Filled by explainer
    };
  });

  // Sort descending by total score, with daily tie-breaking
  const dayOfYear = getDayOfYear();
  scored.sort((a, b) => {
    const diff = b.totalScore - a.totalScore;
    if (Math.abs(diff) > 0.001) return diff;
    // Tie-breaking: rotate based on day of year
    return (
      hashTieBreaker(a.sideDish.slug, dayOfYear) -
      hashTieBreaker(b.sideDish.slug, dayOfYear)
    );
  });

  return scored;
}

/**
 * Select the top K candidates from a ranked list.
 */
export function topK(ranked: ScoredCandidate[], k: number): ScoredCandidate[] {
  return ranked.slice(0, k);
}

/**
 * Simple deterministic hash for tie-breaking that rotates daily.
 */
function hashTieBreaker(slug: string, dayOfYear: number): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i) + dayOfYear) | 0;
  }
  return hash;
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
