/**
 * Phase 4 — Upgraded Deterministic Plate Evaluation Engine
 *
 * Evaluates the proposed main + sides plate before cooking.
 * Produces a structured evaluation with:
 * - Category coverage (vegetables, protein, carbs)
 * - Signal classification
 * - "Already working" list (strengths)
 * - "One best move" recommendation (swap, add, or keep)
 * - Confidence-first appraisal (5-10 words)
 *
 * No AI required — entirely deterministic.
 */

import type { SideDish, Meal, PairingScore } from "@/types";
import { inferMealNutrition } from "../nutrition";

// ── Output types ─────────────────────────────────────────────

export type PlateStatus = "balanced" | "good_start" | "needs_improvement";

export type MoveType = "swap_side" | "add_category" | "keep_as_is";

export type PlateSignal =
  | "protein_light"
  | "veg_light"
  | "carb_heavy"
  | "freshness_missing"
  | "texture_contrast_missing"
  | "balanced";

export interface OneBestMove {
  type: MoveType;
  message: string;
  targetSideIndex?: number;
  targetSideName?: string;
  replacementHint?: string;
}

export interface PlateEvaluation {
  status: PlateStatus;
  categoryCoverage: {
    vegetables: boolean;
    protein: boolean;
    carbs: boolean;
  };
  signals: PlateSignal[];
  alreadyWorking: string[];
  oneBestMove?: OneBestMove;
  appraisal: string; // 5-10 words max
  appraisalTone: "balanced" | "strong" | "needs-work";
}

// ── Flavor analysis helpers ──────────────────────────────────

const FRESH_FLAVORS = ["bright", "fresh", "acidic", "citrus", "herbaceous", "tangy", "zesty"];
const CRUNCHY_TEXTURES = ["crunchy", "crispy", "crisp"];
const CREAMY_TEXTURES = ["creamy", "smooth", "velvety"];
const RICH_FLAVORS = ["rich", "savory", "umami", "buttery", "hearty"];
const LIGHT_FLAVORS = ["light", "delicate", "clean", "refreshing"];

function hasFlavor(tags: string[], flavors: string[]): boolean {
  return tags.some((t) => flavors.includes(t.toLowerCase()));
}

function getSideTags(side: SideDish): string[] {
  return side.tags.map((t) => t.toLowerCase());
}

// ── Core evaluation logic ────────────────────────────────────

interface EvaluationInput {
  meal: Meal;
  sides: SideDish[];
}

export function evaluatePlate({ meal, sides }: EvaluationInput): PlateEvaluation {
  const mainNutrition = inferMealNutrition(meal);

  // ── Step 1: Category coverage ──
  const sideCats = sides.map((s) => s.nutritionCategory);
  const categoryCoverage = {
    vegetables:
      mainNutrition.category === "vegetable" || sideCats.includes("vegetable"),
    protein:
      mainNutrition.category === "protein" || sideCats.includes("protein"),
    carbs:
      mainNutrition.category === "carb" || sideCats.includes("carb"),
  };

  const filledCount = Object.values(categoryCoverage).filter(Boolean).length;

  // ── Step 2: Signal classification ──
  const signals: PlateSignal[] = [];
  const allTags = sides.flatMap(getSideTags);

  // Carb-heavy detection
  const sideCarbCount = sideCats.filter((c) => c === "carb").length;
  const isMainCarb = mainNutrition.category === "carb";
  if ((isMainCarb && sideCarbCount >= 1) || (!isMainCarb && sideCarbCount >= 2)) {
    signals.push("carb_heavy");
  }

  // Protein light
  if (!categoryCoverage.protein) {
    signals.push("protein_light");
  }

  // Veg light
  if (!categoryCoverage.vegetables) {
    signals.push("veg_light");
  }

  // Freshness missing — no bright/acidic/fresh flavors across the plate
  if (!hasFlavor(allTags, FRESH_FLAVORS)) {
    signals.push("freshness_missing");
  }

  // Texture contrast missing — all similar textures
  const hasCrunchy = hasFlavor(allTags, CRUNCHY_TEXTURES);
  const hasCreamy = hasFlavor(allTags, CREAMY_TEXTURES);
  if (!hasCrunchy && !hasCreamy) {
    signals.push("texture_contrast_missing");
  }

  // Balanced signal
  if (filledCount === 3 && signals.length === 0) {
    signals.push("balanced");
  }

  // ── Step 3: Already working (strengths) ──
  const alreadyWorking: string[] = [];

  if (filledCount === 3) {
    alreadyWorking.push("All three food groups covered");
  } else if (filledCount === 2) {
    const covered: string[] = [];
    if (categoryCoverage.vegetables) covered.push("vegetables");
    if (categoryCoverage.protein) covered.push("protein");
    if (categoryCoverage.carbs) covered.push("grains");
    alreadyWorking.push(`Good ${covered.join(" and ")} coverage`);
  }

  if (hasFlavor(allTags, FRESH_FLAVORS)) {
    alreadyWorking.push("Fresh, bright flavors present");
  }

  if (hasCrunchy && hasCreamy) {
    alreadyWorking.push("Nice texture contrast");
  } else if (hasCrunchy) {
    alreadyWorking.push("Good crunch factor");
  }

  // Check for flavor diversity
  const hasRich = hasFlavor(allTags, RICH_FLAVORS);
  const hasLight = hasFlavor(allTags, LIGHT_FLAVORS);
  if (hasRich && hasLight) {
    alreadyWorking.push("Great balance of rich and light");
  }

  // Check cuisine cohesion from pairing scores
  const scores = sides
    .map((s) => (s as SideDish & { pairingScore?: PairingScore }).pairingScore)
    .filter((s): s is PairingScore => !!s);
  if (scores.length > 0) {
    const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    if (avgScore >= 70) {
      alreadyWorking.push("Strong pairing chemistry");
    } else if (avgScore >= 50) {
      alreadyWorking.push("Solid pairing choices");
    }
  }

  // Ensure at least one strength
  if (alreadyWorking.length === 0) {
    alreadyWorking.push("A creative combination");
  }

  // ── Step 4: One best move ──
  const oneBestMove = computeOneBestMove(
    signals,
    categoryCoverage,
    sides,
    isMainCarb
  );

  // ── Step 5: Status and appraisal ──
  const status = computeStatus(signals, filledCount);
  const { appraisal, appraisalTone } = computeAppraisal(
    status,
    signals
  );

  return {
    status,
    categoryCoverage,
    signals,
    alreadyWorking,
    oneBestMove,
    appraisal,
    appraisalTone,
  };
}

// ── One best move logic ──────────────────────────────────────

function computeOneBestMove(
  signals: PlateSignal[],
  coverage: PlateEvaluation["categoryCoverage"],
  sides: SideDish[],
  isMainCarb: boolean
): OneBestMove | undefined {
  // If balanced with no issues, keep as-is
  if (signals.includes("balanced") || signals.length === 0) {
    return { type: "keep_as_is", message: "Your plate looks great as-is." };
  }

  // Priority 1: Carb-heavy — swap the weakest carb side for a veg
  if (signals.includes("carb_heavy")) {
    const carbSideIdx = sides.findIndex((s) => s.nutritionCategory === "carb");
    if (carbSideIdx !== -1) {
      return {
        type: "swap_side",
        message: `Swap ${sides[carbSideIdx].name} for a vegetable side to lighten the carb load.`,
        targetSideIndex: carbSideIdx,
        targetSideName: sides[carbSideIdx].name,
        replacementHint: "vegetable",
      };
    }
  }

  // Priority 2: Missing vegetables
  if (signals.includes("veg_light")) {
    // Find a non-veg side to suggest swapping
    const nonVegIdx = sides.findIndex((s) => s.nutritionCategory !== "vegetable");
    if (nonVegIdx !== -1) {
      return {
        type: "swap_side",
        message: `Try swapping ${sides[nonVegIdx].name} for a green side — your body will thank you.`,
        targetSideIndex: nonVegIdx,
        targetSideName: sides[nonVegIdx].name,
        replacementHint: "vegetable",
      };
    }
    return {
      type: "add_category",
      message: "Adding a vegetable side would round this out nicely.",
      replacementHint: "vegetable",
    };
  }

  // Priority 3: Missing protein
  if (signals.includes("protein_light") && !isMainCarb) {
    return {
      type: "add_category",
      message: "A protein-rich side would make this more filling.",
      replacementHint: "protein",
    };
  }

  // Priority 4: Freshness missing
  if (signals.includes("freshness_missing")) {
    return {
      type: "swap_side",
      message: "A bright, fresh side would lift the whole plate.",
      replacementHint: "fresh or acidic",
    };
  }

  // Priority 5: Texture contrast
  if (signals.includes("texture_contrast_missing")) {
    return {
      type: "swap_side",
      message: "Adding some crunch would make each bite more interesting.",
      replacementHint: "crunchy",
    };
  }

  return undefined;
}

// ── Status computation ───────────────────────────────────────

function computeStatus(
  signals: PlateSignal[],
  filledCount: number
): PlateStatus {
  if (signals.includes("balanced")) return "balanced";
  if (filledCount >= 2 && !signals.includes("carb_heavy")) return "good_start";
  return "needs_improvement";
}

// ── Appraisal sentence ───────────────────────────────────────

function computeAppraisal(
  status: PlateStatus,
  signals: PlateSignal[]
): { appraisal: string; appraisalTone: "balanced" | "strong" | "needs-work" } {
  switch (status) {
    case "balanced":
      return {
        appraisal: "Balanced plate — well composed.",
        appraisalTone: "balanced",
      };
    case "good_start":
      if (signals.includes("freshness_missing")) {
        return {
          appraisal: "Good start — could use some freshness.",
          appraisalTone: "strong",
        };
      }
      if (signals.includes("texture_contrast_missing")) {
        return {
          appraisal: "Solid base — add some texture contrast.",
          appraisalTone: "strong",
        };
      }
      return {
        appraisal: "Good foundation — one tweak away.",
        appraisalTone: "strong",
      };
    case "needs_improvement":
      if (signals.includes("carb_heavy")) {
        return {
          appraisal: "Heavy on carbs — swap one for greens.",
          appraisalTone: "needs-work",
        };
      }
      if (signals.includes("veg_light")) {
        return {
          appraisal: "Needs more color on the plate.",
          appraisalTone: "needs-work",
        };
      }
      return {
        appraisal: "Room for a more balanced plate.",
        appraisalTone: "needs-work",
      };
  }
}
