/**
 * Therapeutic hard-exclusion screen.
 *
 * The research report is explicit: hard exclusions run FIRST, then the engine
 * optimizes within the feasible set. This is a filter, not a scorer.
 *
 * It reuses the already-wired dietary machinery (`dietary-inferer.ts`):
 *   - celiac          → require the `gluten-free` flag (strict exclusion is the
 *                       established standard of care; it overrides preferences)
 *   - avoid allergens → require the matching dietary flag
 *
 * Note: "certified / cross-contact" celiac safety is a stronger real-world
 * constraint than `gluten-free` alone. The catalog can't yet attest
 * certification, so that nuance surfaces as a UI warning (CT-4), not a silent
 * over-filter. Pure / dependency-free.
 */

import type { CareProfile } from "@/types/care-profile";
import {
  satisfiesDietaryRequirement,
  type DietaryFlag,
} from "./dietary-inferer";

/** The dietary flags a dish MUST satisfy for this care profile. */
export function requiredFlagsForCare(care: CareProfile): DietaryFlag[] {
  const req = new Set<DietaryFlag>(care.avoid);
  if (care.conditions.includes("celiac")) req.add("gluten-free");
  return [...req].sort();
}

/** True when a celiac user needs the extra certified/cross-contact warning. */
export function celiacNeedsCertifiedWarning(care: CareProfile): boolean {
  return care.conditions.includes("celiac");
}

export interface ExcludableCandidate {
  dietaryFlags?: string[];
}

/**
 * Keep only candidates whose dietary flags satisfy every required flag.
 * Trivially returns the input unchanged when the profile imposes no hard
 * exclusions (so zero-config users are never filtered).
 */
export function filterByCareExclusions<T extends ExcludableCandidate>(
  candidates: T[],
  care: CareProfile,
): T[] {
  const required = requiredFlagsForCare(care);
  if (required.length === 0) return candidates;
  return candidates.filter((c) =>
    satisfiesDietaryRequirement(c.dietaryFlags ?? [], required),
  );
}
