/**
 * Parent Mode domain types.
 *
 * Schema is informed by PARENT-MODE-RESEARCH §2.4 — the eight fields
 * below are the minimum that predict kid acceptance grounded in the
 * literature (texture, bitterness, smell, visible green flecks,
 * deconstructable, heat, familiarity anchor, color brightness).
 *
 * Labels are hand-curated; the rubric is documented in the labels file
 * itself so future labelers stay consistent.
 */

import type { AgeBand } from "./nutrition";

export interface KidFriendlinessSignals {
  /** Cruciferous, bitter greens, citrus pith, dark chocolate count. */
  bitterLoad: 0 | 1 | 2 | 3;
  /** Fermented / aged / sulfurous / fishy ingredients. */
  smellIntensity: 0 | 1 | 2 | 3;
  /** Slimy / sticky / mixed-chunk / stringy presence. */
  textureRisk: 0 | 1 | 2 | 3;
  /** Herbs, scallion, parsley garnish or chopped leafy greens through dish. */
  visibleGreenFlecks: boolean;
  /** Sauce / spice / topping can be served on the side without breaking dish. */
  deconstructable: boolean;
  /**
   * 0 none · 1 paprika/cumin · 2 mild chili · 3 medium · 4 hot
   * Bucket loosely tracks Scoville exposure per serving.
   */
  heatLevel: 0 | 1 | 2 | 3 | 4;
  /** Contains a kid-default carrier (pasta, rice, bread, tortilla, potato, chicken, cheese, egg). */
  familiarityAnchor: boolean;
  /** Proportion of red/orange/yellow/bright-green vs. brown/dull plate. */
  colorBrightness: 0 | 1 | 2 | 3;
}

export interface KidFriendlinessLabel extends KidFriendlinessSignals {
  recipeSlug: string;
  /** Human-curated note explaining marginal calls (helps future relabelers). */
  rubricNote?: string;
  /** Soft Parent Mode allow-list flag — boosts but doesn't gate. */
  parentModeEligible: boolean;
}

export interface ParentProfile {
  enabled: boolean;
  ageBand: AgeBand;
  /** 1 = no heat, 5 = full adult spice. Per-recipe override is session-only. */
  spiceTolerance: 1 | 2 | 3 | 4 | 5;
  /** Allergens deferred to PM V1.1 per PARENT-MODE-PLAN §10. */
  flaggedAllergens?: string[];
  enabledAt: string;
}
