import type { Scorer, MainDishIntent, SideDishCandidate } from "../types";

/**
 * Nutrition Balance Scorer
 *
 * Evaluates whether the side adds nutritional value the main likely lacks.
 * A rich protein main benefits from a high-fiber vegetable side.
 * A carb-heavy main benefits from a protein or vegetable side.
 */

function inferMainNutritionCategory(main: MainDishIntent): string {
  const name = main.dishName.toLowerCase();

  // Protein mains
  if (
    name.includes("chicken") ||
    name.includes("fish") ||
    name.includes("salmon") ||
    name.includes("beef") ||
    name.includes("steak") ||
    name.includes("lamb") ||
    name.includes("pork") ||
    name.includes("ribs") ||
    name.includes("shrimp")
  ) {
    return "protein";
  }

  // Carb mains
  if (
    name.includes("rice") ||
    name.includes("biryani") ||
    name.includes("pasta") ||
    name.includes("noodle") ||
    name.includes("ramen") ||
    name.includes("pizza") ||
    name.includes("burger") ||
    name.includes("taco") ||
    name.includes("wrap") ||
    name.includes("sandwich")
  ) {
    return "carb";
  }

  // Vegetable mains
  if (
    name.includes("salad") ||
    name.includes("vegetable") ||
    name.includes("bhindi") ||
    name.includes("baingan") ||
    name.includes("sabzi")
  ) {
    return "vegetable";
  }

  // Default  -  most mains are protein-based
  return "protein";
}

export const nutritionBalanceScorer: Scorer = {
  name: "nutritionBalance",

  score(main: MainDishIntent, side: SideDishCandidate): number {
    const mainCategory = inferMainNutritionCategory(main);
    const sideCategory = side.nutritionCategory ?? "vegetable";

    let baseScore = 0.5;

    // Different category = complementary = good
    if (mainCategory !== sideCategory) {
      baseScore = 0.75;
    }

    // Same category = redundant = less good
    if (mainCategory === sideCategory) {
      baseScore = 0.35;
    }

    // Protein main + vegetable side = excellent
    if (mainCategory === "protein" && sideCategory === "vegetable") {
      baseScore = 0.9;
    }

    // Carb main + vegetable side = good (adds fiber)
    if (mainCategory === "carb" && sideCategory === "vegetable") {
      baseScore = 0.85;
    }

    // Carb main + carb side = poor for balance
    if (mainCategory === "carb" && sideCategory === "carb") {
      baseScore = 0.2;
    }

    // Health-forward orientation boosts vegetable sides
    if (
      main.healthOrientation === "health-forward" &&
      sideCategory === "vegetable"
    ) {
      baseScore = Math.min(1, baseScore + 0.1);
    }

    // Fiber bonus
    if (side.fiberGrams && side.fiberGrams >= 4) {
      baseScore = Math.min(1, baseScore + 0.05);
    }

    // Low calorie bonus for health-forward
    if (
      main.healthOrientation === "health-forward" &&
      side.caloriesPerServing &&
      side.caloriesPerServing <= 150
    ) {
      baseScore = Math.min(1, baseScore + 0.05);
    }

    return baseScore;
  },
};
