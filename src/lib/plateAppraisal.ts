import type { SideDish, Meal } from "@/types";
import { evaluatePlate } from "./engine/plate-evaluation";

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
 * Delegates to the new PlateEvaluation engine (Phase 4) and returns
 * the backward-compatible sentence + tone format for existing UI consumers.
 */
export function getPlateAppraisal({ sides, meal }: AppraisalInput): PlateAppraisal {
  const evaluation = evaluatePlate({ meal, sides });

  return {
    sentence: evaluation.appraisal,
    tone: evaluation.appraisalTone,
  };
}

/**
 * Full plate evaluation — returns the complete structured evaluation
 * for the upgraded Evaluate A UI (Phase 4+).
 */
export function getFullPlateEvaluation({ sides, meal }: AppraisalInput) {
  return evaluatePlate({ meal, sides });
}
