import type {
  MainDishIntent,
  SideDishCandidate,
  ScoredCandidate,
  ScoreBreakdown,
  Scorer,
} from "./types";
import { DEFAULT_WEIGHTS } from "./types";
import { cuisineFitScorer } from "./scorers/cuisine-fit";
import { flavorContrastScorer } from "./scorers/flavor-contrast";
import { nutritionBalanceScorer } from "./scorers/nutrition-balance";
import { prepBurdenScorer } from "./scorers/prep-burden";
import { temperatureScorer } from "./scorers/temperature";
import { preferenceScorer } from "./scorers/preference";
import { seasonalScorer } from "./scorers/seasonal";
import { antiMonotonyScorer } from "./scorers/anti-monotony";
import { rankCandidates, topK } from "./ranker";
import { addExplanations } from "./explainer";

/**
 * All scorers used by the engine.
 */
const ALL_SCORERS: Scorer[] = [
  cuisineFitScorer,
  flavorContrastScorer,
  nutritionBalanceScorer,
  prepBurdenScorer,
  temperatureScorer,
  preferenceScorer,
  seasonalScorer,
  antiMonotonyScorer,
];

export type SuggestSidesResult =
  | {
      success: true;
      data: {
        sides: ScoredCandidate[];
        totalCandidates: number;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * Main entry point: suggest the top 3 side dishes for a main dish.
 *
 * @param main - Parsed main dish intent (from craving parser or photo recognition)
 * @param candidates - All available side dish candidates (from DB or static data)
 * @param userPreferences - User's implicit preference vector (optional)
 * @param weights - Custom scoring weights (optional, uses defaults)
 * @param count - Number of sides to return (default 3)
 */
export function suggestSides(
  main: MainDishIntent,
  candidates: SideDishCandidate[],
  userPreferences?: Record<string, number>,
  weights?: Partial<Record<keyof ScoreBreakdown, number>>,
  count: number = 3,
): SuggestSidesResult {
  if (candidates.length === 0) {
    return { success: false, error: "No side dish candidates available" };
  }

  const mergedWeights = { ...DEFAULT_WEIGHTS, ...weights };

  // Score and rank all candidates
  const ranked = rankCandidates(
    main,
    candidates,
    ALL_SCORERS,
    mergedWeights,
    userPreferences,
  );

  // Select top K
  const top = topK(ranked, count);

  // Generate explanations
  const explained = addExplanations(top);

  return {
    success: true,
    data: {
      sides: explained,
      totalCandidates: candidates.length,
    },
  };
}
