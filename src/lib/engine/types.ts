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
  /** Dietary flags this dish is COMPATIBLE WITH — vegan,
   *  vegetarian, gluten-free, dairy-free, nut-allergy,
   *  shellfish-allergy. Populated by `inferDietaryFlags` from
   *  the dish's tags + description (W37). The pairing engine
   *  filters candidates whose set isn't a superset of the
   *  household's required flags. */
  dietaryFlags: string[];
}

export interface ScoreBreakdown {
  cuisineFit: number; // 0-1
  flavorContrast: number; // 0-1
  nutritionBalance: number; // 0-1
  prepBurden: number; // 0-1
  temperature: number; // 0-1
  preference: number; // 0-1
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

export const DEFAULT_WEIGHTS: Record<keyof ScoreBreakdown, number> = {
  cuisineFit: 0.25,
  flavorContrast: 0.25,
  nutritionBalance: 0.15,
  prepBurden: 0.15,
  temperature: 0.1,
  preference: 0.1,
};
