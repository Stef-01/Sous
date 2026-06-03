/**
 * Evidence-card builder (Culinary Therapeutics CT-4).
 *
 * Pure shaping of the registry into the rows the Evidence Provenance strip
 * renders. Kept separate from the React component so it is unit-tested in the
 * node environment, matching the codebase convention (thin presentational
 * shells over tested pure logic).
 */

import type {
  ConditionId,
  EffectSize,
  Grade,
  InterventionClass,
} from "@/types/therapeutics";
import {
  CONDITIONS,
  interventionsForCondition,
  registryIsClinicianApproved,
} from "@/data/therapeutics";
import { FOOD_FIRST_HEDGE } from "./claim-contract";

export const GRADE_LABEL: Record<Grade, string> = {
  high: "High",
  moderate: "Moderate",
  low: "Low",
  "very-low": "Very low",
};

export const CLASS_LABEL: Record<InterventionClass, string> = {
  "recipe-native": "Recipe",
  "fortified-food": "Fortified food",
  "extract-or-supplement": "Supplement · education",
};

/** Compact human string for an effect size, e.g. "LDL-C MD −0.73 mmol/L". */
export function formatEffect(effect: EffectSize): string {
  const sign = effect.value > 0 ? "+" : effect.value < 0 ? "−" : "";
  const magnitude = Math.abs(effect.value);
  const unit = effect.unit ? ` ${effect.unit}` : "";
  const base = `${effect.metric} ${sign}${magnitude}${unit}`.trim();
  return effect.note ? `${base} (${effect.note})` : base;
}

export interface EvidenceRow {
  id: string;
  label: string;
  grade: Grade;
  gradeLabel: string;
  classLabel: string;
  isEducation: boolean;
  effectText: string | null;
  note: string;
  doseSignal?: string;
}

export interface EvidenceCard {
  conditionId: ConditionId;
  displayName: string;
  /** True once every record has cleared clinician review (founder gate G1). */
  reviewed: boolean;
  hedge: string;
  rows: EvidenceRow[];
}

export function buildEvidenceCard(conditionId: ConditionId): EvidenceCard {
  const info = CONDITIONS[conditionId];
  const rows: EvidenceRow[] = interventionsForCondition(conditionId).map(
    (r) => ({
      id: r.id,
      label: r.label,
      grade: r.grade,
      gradeLabel: GRADE_LABEL[r.grade],
      classLabel: CLASS_LABEL[r.interventionClass],
      isEducation: r.interventionClass === "extract-or-supplement",
      effectText: r.effect ? formatEffect(r.effect) : null,
      note: r.applicationNote,
      doseSignal: r.doseSignal,
    }),
  );

  return {
    conditionId,
    displayName: info.displayName,
    reviewed: registryIsClinicianApproved(),
    hedge: FOOD_FIRST_HEDGE,
    rows,
  };
}
