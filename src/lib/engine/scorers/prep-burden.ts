import type { Scorer, MainDishIntent, SideDishCandidate } from "../types";

/**
 * Prep Burden Scorer
 *
 * Scores inversely with total prep + cook time of the side.
 * Accounts for user's effort tolerance  -  a "minimal" effort user
 * wants quick sides, while "willing" users are okay with longer prep.
 */

// Target max prep+cook minutes per effort level
const EFFORT_THRESHOLDS: Record<string, number> = {
  minimal: 10,
  moderate: 25,
  willing: 45,
};

export const prepBurdenScorer: Scorer = {
  name: "prepBurden",

  score(main: MainDishIntent, side: SideDishCandidate): number {
    const totalMinutes = side.prepTimeMinutes + side.cookTimeMinutes;
    const threshold = EFFORT_THRESHOLDS[main.effortTolerance] ?? 25;

    if (totalMinutes <= 0) return 0.8; // No-cook sides are great

    // Score based on how well prep fits within effort tolerance
    if (totalMinutes <= threshold * 0.5) return 1.0; // Well within budget
    if (totalMinutes <= threshold) return 0.8; // Within budget
    if (totalMinutes <= threshold * 1.5) return 0.5; // Slightly over
    if (totalMinutes <= threshold * 2) return 0.3; // Over budget

    return 0.1; // Way over budget
  },
};
