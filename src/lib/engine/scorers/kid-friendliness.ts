/**
 * Kid-friendliness scorer.
 *
 * Pure function over a KidFriendlinessLabel — no main/side dish coupling.
 * Standalone (NOT a 7th member of the existing 6-scorer pipeline) so we
 * don't break the existing pairing-engine tests. The Parent-Mode
 * rebalancer (./parent-mode/rebalance.ts at the engine root) calls this
 * and re-weights the existing pairing output post-hoc per
 * PARENT-MODE-PLAN §3.
 *
 * Formula (research §2.4):
 *   score = familiarityAnchor * w1
 *         + deconstructable   * w2
 *         + colorBrightness   * w3
 *         - bitterLoad        * w4
 *         - smellIntensity    * w5
 *         - textureRisk       * w6
 *         - visibleGreenFlecks* w7
 *         - max(0, heatLevel - 1) * w8
 *
 * Then normalised to [0, 1] via min/max bounds derived from the
 * theoretical extremes of the 8-field schema.
 *
 * Default weights are provisional — to be tuned in W20 against the
 * full label set per timeline acceptance.
 */

import type { KidFriendlinessLabel } from "@/types/parent-mode";

export interface KidFriendlinessWeights {
  familiarityAnchor: number;
  deconstructable: number;
  colorBrightness: number;
  bitterLoad: number;
  smellIntensity: number;
  textureRisk: number;
  visibleGreenFlecks: number;
  heatLevelOverMild: number;
}

export const DEFAULT_KID_WEIGHTS: KidFriendlinessWeights = {
  familiarityAnchor: 1.5,
  deconstructable: 1.2,
  colorBrightness: 0.4, // 0-3 -> contributes up to 1.2
  bitterLoad: 0.6, // 0-3 -> penalty up to 1.8
  smellIntensity: 0.7, // 0-3 -> penalty up to 2.1
  textureRisk: 0.8, // 0-3 -> penalty up to 2.4
  visibleGreenFlecks: 0.4,
  heatLevelOverMild: 0.5, // 0-3 (heatLevel-1 floored at 0) -> penalty up to 1.5
};

/** Theoretical [min, max] under DEFAULT_KID_WEIGHTS, used for normalisation. */
function rawScoreBounds(w: KidFriendlinessWeights): {
  min: number;
  max: number;
} {
  // Maximum positive: all bonuses on, all penalties off.
  const max = w.familiarityAnchor + w.deconstructable + w.colorBrightness * 3;
  // Maximum negative: no bonuses, all penalties at max.
  const min = -(
    w.bitterLoad * 3 +
    w.smellIntensity * 3 +
    w.textureRisk * 3 +
    w.visibleGreenFlecks +
    w.heatLevelOverMild * 3
  );
  return { min, max };
}

/**
 * Returns the raw (unnormalised) score for a label under the given
 * weights. Pure; deterministic.
 */
export function rawKidScore(
  label: KidFriendlinessLabel,
  weights: KidFriendlinessWeights = DEFAULT_KID_WEIGHTS,
): number {
  return (
    (label.familiarityAnchor ? weights.familiarityAnchor : 0) +
    (label.deconstructable ? weights.deconstructable : 0) +
    label.colorBrightness * weights.colorBrightness -
    label.bitterLoad * weights.bitterLoad -
    label.smellIntensity * weights.smellIntensity -
    label.textureRisk * weights.textureRisk -
    (label.visibleGreenFlecks ? weights.visibleGreenFlecks : 0) -
    Math.max(0, label.heatLevel - 1) * weights.heatLevelOverMild
  );
}

/**
 * Normalised [0, 1] score for a label. Use this for ranking +
 * threshold checks (the QuestCard hint surfaces at >= 0.65 per
 * PARENT-MODE-PLAN §8).
 */
export function kidFriendlinessScore(
  label: KidFriendlinessLabel,
  weights: KidFriendlinessWeights = DEFAULT_KID_WEIGHTS,
): number {
  const raw = rawKidScore(label, weights);
  const { min, max } = rawScoreBounds(weights);
  if (max <= min) return 0.5; // degenerate weights — return neutral
  const normalised = (raw - min) / (max - min);
  return Math.max(0, Math.min(1, normalised));
}
