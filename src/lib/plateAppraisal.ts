import type { SideDish, PairingScore } from "@/types";

interface AppraisalInput {
  sides: SideDish[];
  mealName: string;
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
export function getPlateAppraisal({ sides, mealName }: AppraisalInput): PlateAppraisal {
  // Determine what's present
  const cats = new Set(sides.map((s) => s.nutritionCategory));
  const hasVeg = cats.has("vegetable");
  const hasProtein = true; // Main dish always counts as protein on the plate
  const hasCarb = cats.has("carb");
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

  if (filledCount === 1) {
    return {
      sentence: `Needs ${missing.join(" and ")} for balance.`,
      tone: "needs-work",
    };
  }

  // Edge case: no categories
  return {
    sentence: "Swap sides to build a balanced plate.",
    tone: "needs-work",
  };
}
