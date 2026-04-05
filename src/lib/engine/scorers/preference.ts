import type { Scorer, MainDishIntent, SideDishCandidate } from "../types";

/**
 * Preference Scorer
 *
 * Uses the user's implicit preference vector (built from quiz answers
 * and cooking history) to boost sides that match their tastes.
 *
 * The preference vector maps tag/cuisine names to weights (-1 to 1).
 * Positive = user tends to like. Negative = user tends to avoid.
 */
export const preferenceScorer: Scorer = {
  name: "preference",

  score(
    _main: MainDishIntent,
    side: SideDishCandidate,
    userPreferences?: Record<string, number>
  ): number {
    // No preference data → neutral score
    if (!userPreferences || Object.keys(userPreferences).length === 0) {
      return 0.5;
    }

    // Compute dot product of side's features against user preferences
    const features = [
      side.cuisineFamily,
      ...(side.flavorProfile ?? []),
      ...(side.tags ?? []),
      side.nutritionCategory ?? "",
      side.temperature,
    ].filter(Boolean);

    if (features.length === 0) return 0.5;

    let sum = 0;
    let matched = 0;

    for (const feature of features) {
      const pref = userPreferences[feature.toLowerCase()];
      if (pref !== undefined) {
        sum += pref;
        matched++;
      }
    }

    if (matched === 0) return 0.5;

    // Normalize to 0-1 range (preferences are -1 to 1)
    const avgPref = sum / matched;
    return Math.max(0, Math.min(1, (avgPref + 1) / 2));
  },
};
