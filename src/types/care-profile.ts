/**
 * CareProfile — a user's self-reported health focus for culinary therapeutics.
 *
 * Sibling to ParentProfile (keeps Parent Mode's concern clean), same
 * device-scoped, localStorage-first persistence pattern. Captured only in the
 * owl Profile & Settings sheet (CLAUDE.md rule 3). Conditions are validated
 * entities only — "leaky gut" is never a `ConditionId` (see
 * `src/types/therapeutics.ts`).
 *
 * Low-FODMAP is a PHASE, not a permanent diet (research report §IBS): the app
 * must never present it as lifelong restriction.
 */

import type { ConditionId } from "./therapeutics";
import type { DietaryFlag } from "@/lib/engine/dietary-inferer";

export type FodmapPhase = "elimination" | "reintroduction" | "personalized";

export interface CareProfile {
  v: 1;
  /** Validated conditions the user opted into. */
  conditions: ConditionId[];
  /** Allergen / intolerance avoidances → hard exclusions in the engine. */
  avoid: DietaryFlag[];
  /** Only meaningful when `conditions` includes "ibs". null = not started. */
  fodmapPhase: FodmapPhase | null;
  updatedAt: string;
  /** Founder gate G3 — reserved, dormant. Escalation runs on self-report only
   *  until a real, consented lab/EHR source is wired. */
  labSignals?: never;
}
