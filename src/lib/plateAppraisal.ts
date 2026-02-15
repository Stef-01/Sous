import type { SideDish, PairingScore, Meal } from "@/types";
import { inferMealNutrition } from "./nutrition";

interface AppraisalInput {
  sides: SideDish[];
  meal: Meal;
}

interface PlateAppraisal {
  sentence: string;
  tone: "balanced" | "strong" | "needs-work";
}

/**
 * Generates a single authoritative sentence appraising the plate composition.
 * Considers: plate balance (ADA method), pairing quality (scores), and category gaps.
 *
 * The sentence reads like a nutritionist's clinical one-liner.
 */
export function getPlateAppraisal({ sides, meal }: AppraisalInput): PlateAppraisal {
  // Analyze Main Dish using shared logic
  const mainNutrition = inferMealNutrition(meal);

  // Determine what's present across Main AND Sides
  const sideCats = sides.map((s) => s.nutritionCategory);

  const hasVeg = mainNutrition.category === "vegetable" || sideCats.includes("vegetable");
  const hasProtein = mainNutrition.category === "protein" || sideCats.includes("protein");
  const hasCarb = mainNutrition.category === "carb" || sideCats.includes("carb");

  const filledCount = [hasVeg, hasProtein, hasCarb].filter(Boolean).length;
  const isBalanced = filledCount === 3;

  // Get average pairing score if available
  const scores = sides
    .map((s) => (s as SideDish & { pairingScore?: PairingScore }).pairingScore)
    .filter((s): s is PairingScore => !!s);
  const hasScores = scores.length > 0;
  const avgScore = hasScores
    ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
    : null;

  // Determine missing categories
  const missing: string[] = [];
  if (!hasVeg) missing.push("vegetables");
  if (!hasCarb) missing.push("whole grains");
  if (!hasProtein) missing.push("protein");

  // Diabetes Awareness Check
  // Logic: 
  // 1. If Main is Carb (e.g. Pasta) + >= 1 Carb Side (e.g. Bread) -> Warning
  // 2. If Main is NOT Carb + >= 2 Carb Sides -> Warning
  const sideCarbCount = sides.filter(s => s.nutritionCategory === "carb").length;
  const isMainCarb = mainNutrition.category === "carb";

  const isCarbHeavy = (isMainCarb && sideCarbCount >= 1) || (!isMainCarb && sideCarbCount >= 2);

  if (isCarbHeavy) {
    return {
      sentence: "High carbohydrate content — not good for diabetes.",
      tone: "needs-work",
    };
  }

  // Low Protein Check
  if (!hasProtein) {
    return {
      sentence: "Consider adding a protein source for muscle maintenance.",
      tone: "needs-work",
    };
  }

  // Build the sentence — kept short and clinical for the search bar
  if (isBalanced && avgScore !== null && avgScore >= 60) {
    return {
      sentence: "Balanced plate with strong pairings.",
      tone: "balanced",
    };
  }

  if (isBalanced && avgScore !== null && avgScore < 60) {
    return {
      sentence: "Balanced plate — pairings could be stronger.",
      tone: "strong",
    };
  }

  if (isBalanced) {
    return {
      sentence: "Balanced plate — all three food groups covered.",
      tone: "balanced",
    };
  }

  // Not balanced
  if (filledCount === 2) {
    const missingLabel = missing[0];
    return {
      sentence: `Good start — consider adding ${missingLabel}.`,
      tone: "strong",
    };
  }

  if (filledCount <= 1) {
    // If only one category covered (e.g. just Protein + Protein), list missing
    return {
      sentence: `Needs ${missing.join(" and ")} for balance.`,
      tone: "needs-work",
    };
  }

  // Fallback
  return {
    sentence: "Swap sides to build a balanced plate.",
    tone: "needs-work",
  };
}
