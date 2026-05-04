/**
 * Parent Mode pairing rebalancer.
 *
 * Stage 3 pairing engine returns a sorted list of dishes by combined
 * scorer score. When Parent Mode is on, this rebalancer re-ranks the
 * list by blending in the kid-friendliness score. Designed as a
 * post-hoc layer so the existing 6-scorer pipeline + 35 pairing-engine
 * tests stay unchanged (Karpathy surgical-changes principle).
 *
 * Blend weight is 0.25 by default (PARENT-MODE-PLAN §4.2):
 *
 *   blendedScore = (1 - blend) * pairingScore + blend * kidScore
 *
 * Dishes without a kid-friendliness label use a conservative neutral
 * 0.45 (slightly below the QuestCard hint threshold of 0.65 so we
 * never surface a kid-hint on an unlabeled dish, but also don't
 * over-penalise — recipes like grilled-salmon with no label still rank
 * by their pairing strength).
 */

import {
  DEFAULT_KID_WEIGHTS,
  kidFriendlinessScore,
  type KidFriendlinessWeights,
} from "@/lib/engine/scorers/kid-friendliness";
import { getKidFriendlinessLabel } from "@/data/parent-mode/kid-friendliness-labels";

/** Score returned for dishes with no hand-curated label. */
export const UNLABELED_NEUTRAL_KID_SCORE = 0.45;

/** Default blend factor for kid-friendliness vs. existing pairing score. */
export const DEFAULT_KID_BLEND = 0.25;

export interface RebalanceInput<T> {
  recipeSlug: string;
  pairingScore: number;
  item: T;
}

export interface RebalanceOutput<T> {
  recipeSlug: string;
  pairingScore: number;
  kidScore: number;
  blendedScore: number;
  item: T;
}

/**
 * Pure function. Returns the same items, annotated with kidScore +
 * blendedScore, sorted blendedScore desc.
 */
export function rebalanceForParentMode<T>(
  inputs: RebalanceInput<T>[],
  options?: {
    blend?: number;
    weights?: KidFriendlinessWeights;
  },
): RebalanceOutput<T>[] {
  const blend = clamp01(options?.blend ?? DEFAULT_KID_BLEND);
  const weights = options?.weights ?? DEFAULT_KID_WEIGHTS;

  const annotated = inputs.map<RebalanceOutput<T>>((input) => {
    const label = getKidFriendlinessLabel(input.recipeSlug);
    const kidScore = label
      ? kidFriendlinessScore(label, weights)
      : UNLABELED_NEUTRAL_KID_SCORE;
    const blendedScore = (1 - blend) * input.pairingScore + blend * kidScore;
    return {
      recipeSlug: input.recipeSlug,
      pairingScore: input.pairingScore,
      kidScore,
      blendedScore,
      item: input.item,
    };
  });

  annotated.sort((a, b) => b.blendedScore - a.blendedScore);
  return annotated;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
