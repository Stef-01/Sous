/**
 * Therapeutic re-weighting (Culinary Therapeutics CT-3).
 *
 * When a care profile is active, the therapeutic-fit dimension takes weight
 * `THERAPEUTIC_WEIGHT` and the existing 8 dimensions scale by (1 −
 * THERAPEUTIC_WEIGHT), so the vector still sums to 1.0. The therapeutic weight
 * sits deliberately BELOW cuisineFit/flavorContrast (0.22 each) so taste and
 * coherence still lead — adherence is what makes a therapeutic diet work
 * (report §umbrella synthesis).
 *
 * `suggestSides` applies the equivalent of this vector as a post-rank blend
 * (mathematically identical: scaled_total = (1−wT)·base + wT·therapeuticFit),
 * which keeps the default ranker untouched. This module is the canonical
 * derivation + is unit-tested to sum to 1.0.
 */

import type { EngineWeights, ScoreBreakdown } from "./types";
import { DEFAULT_WEIGHTS } from "./types";

/** Tunable starting point. Below cuisineFit/flavorContrast so taste leads. */
export const THERAPEUTIC_WEIGHT = 0.18;

/**
 * The full weight vector. When `active` is false, returns DEFAULT_WEIGHTS
 * unchanged (zero-condition users are byte-identical). When true, scales the 8
 * base dimensions and adds therapeuticFit so the sum stays 1.0.
 */
export function weightsForProfile(active: boolean): EngineWeights {
  if (!active) return { ...DEFAULT_WEIGHTS };
  const scale = 1 - THERAPEUTIC_WEIGHT;
  const out: Partial<Record<keyof ScoreBreakdown, number>> = {};
  for (const [key, value] of Object.entries(DEFAULT_WEIGHTS)) {
    out[key as keyof ScoreBreakdown] = value * scale;
  }
  out.therapeuticFit = THERAPEUTIC_WEIGHT;
  return out as EngineWeights;
}
