/**
 * Culinary Therapeutics evidence registry — public surface.
 *
 * Static, versioned, claim-safe encoding of the evidence matrix. Consumed by
 * the therapeutic-fit scorer (CT-3), the evidence cards (CT-4), and the
 * coverage-gap report. See `docs/CULINARY-THERAPEUTICS-PLAN.md`.
 */

import type { ConditionId, InterventionRecord } from "@/types/therapeutics";
import { CONDITION_IDS } from "./conditions";
import { INTERVENTIONS } from "./interventions";
import { INTERACTIONS } from "./interactions";
import { REGISTRY_VERSION } from "./registry-version";

export { CONDITIONS, CONDITION_IDS } from "./conditions";
export { INTERVENTIONS } from "./interventions";
export { INTERACTIONS } from "./interactions";
export { REGISTRY_VERSION } from "./registry-version";

/** All intervention records for a condition. */
export function interventionsForCondition(
  conditionId: ConditionId,
): InterventionRecord[] {
  return INTERVENTIONS.filter((r) => r.conditionId === conditionId);
}

/**
 * Records that may move a recipe's therapeutic score: recipe-native always,
 * and fortified-food (the scorer additionally checks the recipe actually uses
 * the fortified ingredient). Extract/supplement records are NEVER returned
 * here — they are education only.
 */
export function scorableInterventions(
  conditionId: ConditionId,
): InterventionRecord[] {
  return interventionsForCondition(conditionId).filter(
    (r) =>
      r.interventionClass === "recipe-native" ||
      r.interventionClass === "fortified-food",
  );
}

/** Education-only records (shown on evidence cards, never scored). */
export function educationOnlyInterventions(
  conditionId: ConditionId,
): InterventionRecord[] {
  return interventionsForCondition(conditionId).filter(
    (r) => r.interventionClass === "extract-or-supplement",
  );
}

/** True once every record has cleared clinician review (founder gate G1). */
export function registryIsClinicianApproved(): boolean {
  return INTERVENTIONS.every((r) => r.reviewStatus === "clinician-approved");
}

export const REGISTRY_STATS = {
  conditions: CONDITION_IDS.length,
  interventions: INTERVENTIONS.length,
  interactions: INTERACTIONS.length,
  version: REGISTRY_VERSION.version,
};
