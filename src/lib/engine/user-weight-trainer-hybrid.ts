/**
 * V2 ↔ V3 hybrid trainer composer (Y2 Sprint B W8, gated W10).
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
 * rich data AND the V3 flag is enabled; falls back to V2
 * otherwise. Falls back to DEFAULT_WEIGHTS when neither
 * trainer has signal.
 *
 * V3 GATE (W10): the synthetic eval at W9 (seed=42, 100-user,
 * 12-cook, 60-held-out cohort) showed V3 underperforms V2 by
 * 4.5pp (v2AvgAgreement=0.6230, v3AvgAgreement=0.5785,
 * delta=-0.0445). Until V4 hyperparameter retune lands V3 is
 * opt-in via SOUS_V3_TRAINER_ENABLED="true". The substrate
 * stays in place + recipe_score_breakdowns continues to
 * populate so V4 has the data when it ships. See
 * docs/y2/sprints/B/IDEO-REVIEW.md for the full close-out.
 *
 * Telemetry: returns the chosen mode + flag state alongside the
 * weights so the IDEO retro can compare V2 vs V3 acceptance-rate
 * deltas across real cohorts once the flag flips.
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

export interface HybridEnv {
  /** Server-side opt-in for the V3 trainer. "true" enables V3
   *  when its breakdown threshold is met. */
  SOUS_V3_TRAINER_ENABLED?: string | undefined;
  /** Client-readable opt-in for the V3 trainer. Same semantics
   *  as the server flag (NEXT_PUBLIC_ prefix lets it survive
   *  the Next build into the browser bundle). Either flag being
   *  the literal string "true" enables V3. */
  NEXT_PUBLIC_SOUS_V3_TRAINER_ENABLED?: string | undefined;
}

export interface HybridResult {
  weights: UserWeights;
  mode: TrainerMode;
  /** How many breakdown-rich cooks exist. Telemetry-only. */
  breakdownCookCount: number;
  /** How many V2-eligible cooks exist (completedAt set).
   *  Telemetry-only. */
  v2EligibleCookCount: number;
  /** Whether V3 was eligible to fire from the env flag.
   *  False here means "V2 path active even with breakdown
   *  data present — flag is off". Telemetry-only. */
  v3Enabled: boolean;
}

/** Pure helper: is V3 enabled in this environment?
 *  Either flag being the literal string "true" flips the gate.
 *  Strict-equality on "true" (no truthy coercion, no case-fold)
 *  so that accidental shapes like "True" / "1" / "yes" stay off
 *  — opt-in must be deliberate. Exported for testing + for
 *  callers that want to observe the flag state independently
 *  of trainer selection. */
export function isV3TrainerEnabled(env: HybridEnv): boolean {
  if (env.SOUS_V3_TRAINER_ENABLED === "true") return true;
  if (env.NEXT_PUBLIC_SOUS_V3_TRAINER_ENABLED === "true") return true;
  return false;
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
 *  V3 wins when there's enough breakdown-rich data AND the V3
 *  flag is enabled; V2 wins when there's enough V2-eligible
 *  data; default otherwise.
 *
 *  v3Enabled defaults to false so that callers that pre-date
 *  the W10 gate stay on the production-safe V2 path. Exported
 *  for testing. */
export function pickTrainerMode(
  breakdownCount: number,
  v2EligibleCount: number,
  v3Enabled: boolean = false,
): TrainerMode {
  if (v3Enabled && breakdownCount >= V3_COLD_START_THRESHOLD) return "v3";
  if (v2EligibleCount >= 5) return "v2";
  return "default";
}

/** Read the env at runtime if we're in a Node-like context.
 *  Returns an empty record otherwise so callers in test / SSR
 *  contexts get a stable shape. */
function readEnv(): HybridEnv {
  if (typeof process === "undefined" || process.env == null) return {};
  return {
    SOUS_V3_TRAINER_ENABLED: process.env.SOUS_V3_TRAINER_ENABLED,
    NEXT_PUBLIC_SOUS_V3_TRAINER_ENABLED:
      process.env.NEXT_PUBLIC_SOUS_V3_TRAINER_ENABLED,
  };
}

export interface ComposeUserWeightsOptions {
  /** Override the env flag lookup. Useful for tests + for
   *  call sites that already know the trainer-mode policy
   *  (e.g. a server-side experiment harness). */
  env?: HybridEnv;
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
  options: ComposeUserWeightsOptions = {},
): HybridResult {
  const env = options.env ?? readEnv();
  const v3Enabled = isV3TrainerEnabled(env);
  const breakdownCooks = toBreakdownCooks(sessions);
  const v2Records = toV2TrainerRecords(sessions);
  const mode = pickTrainerMode(
    breakdownCooks.length,
    v2Records.length,
    v3Enabled,
  );

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
    v3Enabled,
  };
}
