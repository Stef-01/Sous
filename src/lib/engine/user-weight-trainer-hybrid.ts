/**
 * V2 ↔ V3 hybrid trainer composer (Y2 Sprint B W8).
 *
 * The pairing-engine has two trainer generations:
 *   - V2 (Y1 W30): reads cook-session metadata only
 *     (cuisineFamily / rating / favorite). Cold-start at 5
 *     completed cooks. Ships universally; works for any user
 *     who has cooked anything.
 *   - V3 (Y2 W7): reads the engine's per-pick ScoreBreakdown,
 *     classifies accepted vs rejected pairs, learns per-
 *     dimension preferences. Cold-start at 8 cooks-WITH-
 *     breakdowns. Sharper signal but requires the W6
 *     persistence to be in place.
 *
 * The hybrid composer picks V3 when there's enough breakdown-
 * rich data; falls back to V2 otherwise. Falls back to
 * DEFAULT_WEIGHTS when neither trainer has signal.
 *
 * Telemetry: returns the chosen mode alongside the weights so
 * the IDEO retro at Y2 W9 can compare V2 vs V3 acceptance-rate
 * deltas.
 *
 * Pure / dependency-free.
 */

import { DEFAULT_WEIGHTS } from "./types";
import {
  trainUserWeights as trainUserWeightsV2,
  type TrainerCookRecord,
  type UserWeights,
} from "./user-weight-trainer";
import {
  V3_COLD_START_THRESHOLD,
  asBreakdownCook,
  trainUserWeightsV3,
  type BreakdownCook,
} from "./user-weight-trainer-v3";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

export type TrainerMode = "default" | "v2" | "v3";

export interface HybridResult {
  weights: UserWeights;
  mode: TrainerMode;
  /** How many breakdown-rich cooks exist. Telemetry-only. */
  breakdownCookCount: number;
  /** How many V2-eligible cooks exist (completedAt set).
   *  Telemetry-only. */
  v2EligibleCookCount: number;
}

/** Filter cook sessions into the BreakdownCook shape the V3
 *  trainer wants. Drops sessions without a breakdown attached. */
function toBreakdownCooks(
  sessions: ReadonlyArray<CookSessionRecord>,
): BreakdownCook[] {
  const out: BreakdownCook[] = [];
  for (const s of sessions) {
    const cook = asBreakdownCook(s);
    if (cook !== null) out.push(cook);
  }
  return out;
}

/** Filter cook sessions into the V2 TrainerCookRecord shape.
 *  Drops sessions without completedAt. */
function toV2TrainerRecords(
  sessions: ReadonlyArray<CookSessionRecord>,
): TrainerCookRecord[] {
  const out: TrainerCookRecord[] = [];
  for (const s of sessions) {
    if (typeof s.completedAt !== "string") continue;
    out.push({
      completedAt: s.completedAt,
      cuisineFamily: s.cuisineFamily,
      rating: s.rating,
      favorite: s.favorite,
    });
  }
  return out;
}

/** Pure helper: pick the trainer mode from the cook history.
 *  V3 wins when there's enough breakdown-rich data; V2 wins
 *  when there's enough V2-eligible data; default otherwise.
 *  Exported for testing. */
export function pickTrainerMode(
  breakdownCount: number,
  v2EligibleCount: number,
): TrainerMode {
  if (breakdownCount >= V3_COLD_START_THRESHOLD) return "v3";
  if (v2EligibleCount >= 5) return "v2";
  return "default";
}

/** Compose the user's weight vector by picking the strongest
 *  available trainer + emitting telemetry alongside.
 *
 *  The cook page / today page / sides page all consume this
 *  via `useUserWeights`; the underlying trainer choice is
 *  invisible to the user (recommendations just get sharper as
 *  data accumulates).
 */
export function composeUserWeights(
  sessions: ReadonlyArray<CookSessionRecord>,
): HybridResult {
  const breakdownCooks = toBreakdownCooks(sessions);
  const v2Records = toV2TrainerRecords(sessions);
  const mode = pickTrainerMode(breakdownCooks.length, v2Records.length);

  let weights: UserWeights;
  if (mode === "v3") {
    weights = trainUserWeightsV3(breakdownCooks);
  } else if (mode === "v2") {
    weights = trainUserWeightsV2(v2Records);
  } else {
    weights = { ...DEFAULT_WEIGHTS };
  }

  return {
    weights,
    mode,
    breakdownCookCount: breakdownCooks.length,
    v2EligibleCookCount: v2Records.length,
  };
}
