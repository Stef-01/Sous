import type { Scorer, MainDishIntent, SideDishCandidate } from "../types";
import { getCuisineCompatibility } from "../data/cuisine-matrix";

/**
 * Cuisine Fit Scorer
 *
 * Evaluates how well the side dish's cuisine aligns with the main's cuisine.
 * Uses the compatibility matrix + checks bestPairedWith tags.
 */
export const cuisineFitScorer: Scorer = {
  name: "cuisineFit",

  score(main: MainDishIntent, side: SideDishCandidate): number {
    // 1. Matrix compatibility between cuisines
    const primaryCuisine = main.cuisineSignals[0] ?? "";
    const matrixScore = getCuisineCompatibility(
      side.cuisineFamily,
      primaryCuisine,
    );

    // 2. Bonus if the side's bestPairedWith tags match the main dish
    const mainLower = main.dishName.toLowerCase();
    const bestPairedBonus = side.bestPairedWith.some((tag) =>
      mainLower.includes(tag.toLowerCase()),
    )
      ? 0.15
      : 0;

    // 3. Bonus for matching any secondary cuisine signals
    const secondaryCuisineBonus = main.cuisineSignals
      .slice(1)
      .some(
        (signal) =>
          side.cuisineFamily.toLowerCase() === signal.toLowerCase() ||
          side.tags.some((t) => t.toLowerCase() === signal.toLowerCase()),
      )
      ? 0.1
      : 0;

    return Math.min(1, matrixScore + bestPairedBonus + secondaryCuisineBonus);
  },
};
