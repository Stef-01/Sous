/**
 * Types for the V1 pairing engine.
 *
 * The engine scores side dish candidates against a parsed main dish intent,
 * aggregates weighted scores, and returns the top 3 with explanations.
 */

export interface MainDishIntent {
  dishName: string;
  cuisineSignals: string[];
  isHomemade: boolean;
  effortTolerance: "minimal" | "moderate" | "willing";
  healthOrientation: "indulgent" | "balanced" | "health-forward";
  moodSignals: string[];
}

export interface SideDishCandidate {
  id: string;
  slug: string;
  name: string;
  cuisineFamily: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  skillLevel: string;
  flavorProfile: string[];
  temperature: string;
  proteinGrams: number | null;
  fiberGrams: number | null;
  caloriesPerServing: number | null;
  bestPairedWith: string[];
  tags: string[];
  pairingReason: string | null;
  nutritionCategory: string | null;
  /** Round 4 addition. Optional so existing fixtures compile. */
  dietaryFlags?: string[];
}

export interface ScoreBreakdown {
  cuisineFit: number; // 0-1
  flavorContrast: number; // 0-1
  nutritionBalance: number; // 0-1
  prepBurden: number; // 0-1
  temperature: number; // 0-1
  preference: number; // 0-1
  /** Round 4 addition. Optional so b4393c7 callers compile. */
  seasonal?: number;
  /** Round 4 addition. Optional so b4393c7 callers compile. */
  antiMonotony?: number;
  /** Culinary Therapeutics (CT-3). Only set when a clinician-approved care
   *  profile is active; absent on the default path. */
  therapeuticFit?: number;
  /** Pantry-reuse (W1). Only set when the caller supplies a non-empty on-hand
   *  ingredient set; absent on the default (no-pantry) path. */
  pantryReuse?: number;
}

export interface ScoredCandidate {
  sideDish: SideDishCandidate;
  scores: ScoreBreakdown;
  totalScore: number;
  explanation: string;
}

export interface Scorer {
  name: keyof ScoreBreakdown;
  score(
    main: MainDishIntent,
    side: SideDishCandidate,
    userPreferences?: Record<string, number>,
  ): number;
}

/** The 8 base weight dimensions, all required. `therapeuticFit` and
 *  `pantryReuse` are excluded — they are post-rank reblend dimensions, not
 *  base ranker weights. */
export type BaseWeights = Record<
  Exclude<keyof ScoreBreakdown, "therapeuticFit" | "pantryReuse">,
  number
>;

/**
 * Ranker weight vector. The 8 base dimensions are required; `therapeuticFit`
 * is optional (off by default, only present when a clinician-approved care
 * profile is active — Culinary Therapeutics CT-3).
 */
export type EngineWeights = BaseWeights & { therapeuticFit?: number };

export const DEFAULT_WEIGHTS: BaseWeights = {
  cuisineFit: 0.22,
  flavorContrast: 0.22,
  nutritionBalance: 0.13,
  prepBurden: 0.13,
  temperature: 0.08,
  preference: 0.08,
  seasonal: 0.07,
  antiMonotony: 0.07,
};
