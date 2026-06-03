/**
 * Therapeutic-fit scoring (Culinary Therapeutics CT-3).
 *
 * Pure function mapping an active CareProfile + a dish to a 0–1 fit score,
 * 0.5 = neutral. It reads ONLY scorable interventions (recipe-native +
 * fortified) from the evidence registry — extract/supplement records are
 * education only and never contribute (the anti-overclaiming spine). The
 * report's EvidenceWeight mapping (high 1.0 · moderate 0.75 · low 0.40 ·
 * very-low 0.20) sets each matched intervention's contribution.
 *
 * A dish matching several strong-evidence interventions saturates toward 1.0;
 * a dish matching none stays neutral at 0.5. Deterministic, dependency-free.
 */

import type { CareProfile } from "@/types/care-profile";
import type { Grade } from "@/types/therapeutics";
import { scorableInterventions } from "@/data/therapeutics";

/** Report default mapping (report §"Scope and grading"). */
export const EVIDENCE_WEIGHT: Record<Grade, number> = {
  high: 1.0,
  moderate: 0.75,
  low: 0.4,
  "very-low": 0.2,
};

/** Directions that earn a positive contribution. "no-benefit" / "exclude" do not. */
const POSITIVE_DIRECTIONS = new Set(["lowers", "raises", "improves-symptoms"]);

export interface TherapeuticDish {
  name: string;
  tags: string[];
  flavorProfile?: string[];
}

/**
 * 0–1 therapeutic fit for a dish given the active care profile. 0.5 when no
 * conditions are set or nothing matches; higher as the dish realizes stronger
 * food-first evidence for the user's conditions.
 */
export function scoreTherapeuticFit(
  care: CareProfile,
  dish: TherapeuticDish,
): number {
  if (care.conditions.length === 0) return 0.5;

  const haystack =
    `${dish.name} ${dish.tags.join(" ")} ${(dish.flavorProfile ?? []).join(" ")}`.toLowerCase();

  let matchedWeight = 0;
  for (const condition of care.conditions) {
    for (const rec of scorableInterventions(condition)) {
      if (!POSITIVE_DIRECTIONS.has(rec.direction)) continue;
      const hit = rec.recipeSignals.some((sig) =>
        haystack.includes(sig.toLowerCase()),
      );
      if (hit) matchedWeight += EVIDENCE_WEIGHT[rec.grade];
    }
  }

  if (matchedWeight === 0) return 0.5;
  // Smooth saturation: 0 → 0.5, grows toward 1.0 as evidence stacks.
  return 0.5 + 0.5 * (1 - Math.exp(-matchedWeight));
}
