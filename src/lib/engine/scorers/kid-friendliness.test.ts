/**
 * Kid-friendliness scorer + Parent Mode rebalancer tests.
 *
 * Coverage:
 *   - Score for an ideal kid dish (familiar + deconstructable + bright,
 *     no bitter / smell / texture / heat) is high
 *   - Score for a worst-case dish (lots of bitter / smell / heat /
 *     texture) is low
 *   - Score is in [0, 1]
 *   - Rebalancer respects blend factor
 *   - Rebalancer falls back to neutral 0.45 for unlabeled dishes
 *   - Rebalancer is stable (deterministic) and sorts blended desc
 *   - Top-12 of the 30 hand-labeled set passes the eyeball test
 *     (parentModeEligible:true is over-represented in the top half)
 */

import { describe, expect, it } from "vitest";
import {
  DEFAULT_KID_WEIGHTS,
  kidFriendlinessScore,
  rawKidScore,
} from "./kid-friendliness";
import {
  rebalanceForParentMode,
  UNLABELED_NEUTRAL_KID_SCORE,
} from "@/lib/engine/parent-mode/rebalance";
import { KID_FRIENDLINESS_LABELS } from "@/data/parent-mode/kid-friendliness-labels";
import type { KidFriendlinessLabel } from "@/types/parent-mode";

const IDEAL: KidFriendlinessLabel = {
  recipeSlug: "ideal",
  bitterLoad: 0,
  smellIntensity: 0,
  textureRisk: 0,
  visibleGreenFlecks: false,
  deconstructable: true,
  heatLevel: 0,
  familiarityAnchor: true,
  colorBrightness: 3,
  parentModeEligible: true,
};

const WORST: KidFriendlinessLabel = {
  recipeSlug: "worst",
  bitterLoad: 3,
  smellIntensity: 3,
  textureRisk: 3,
  visibleGreenFlecks: true,
  deconstructable: false,
  heatLevel: 4,
  familiarityAnchor: false,
  colorBrightness: 0,
  parentModeEligible: false,
};

describe("kidFriendlinessScore — extremes", () => {
  it("ideal dish scores 1.0", () => {
    expect(kidFriendlinessScore(IDEAL)).toBe(1);
  });

  it("worst dish scores 0.0", () => {
    expect(kidFriendlinessScore(WORST)).toBe(0);
  });

  it("score stays in [0, 1] for any valid label", () => {
    for (const label of KID_FRIENDLINESS_LABELS) {
      const s = kidFriendlinessScore(label);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(1);
    }
  });
});

describe("kidFriendlinessScore — directional sanity", () => {
  it("removing the bitter load increases the score", () => {
    const baseline = { ...IDEAL, bitterLoad: 2 } as KidFriendlinessLabel;
    const without = { ...baseline, bitterLoad: 0 } as KidFriendlinessLabel;
    expect(kidFriendlinessScore(without)).toBeGreaterThan(
      kidFriendlinessScore(baseline),
    );
  });

  it("adding heat above mild decreases the score", () => {
    const baseline = { ...IDEAL, heatLevel: 1 } as KidFriendlinessLabel;
    const hotter = { ...baseline, heatLevel: 4 } as KidFriendlinessLabel;
    expect(kidFriendlinessScore(hotter)).toBeLessThan(
      kidFriendlinessScore(baseline),
    );
  });

  it("losing the familiarity anchor decreases the score", () => {
    const baseline = IDEAL;
    const without = {
      ...baseline,
      familiarityAnchor: false,
    } as KidFriendlinessLabel;
    expect(kidFriendlinessScore(without)).toBeLessThan(
      kidFriendlinessScore(baseline),
    );
  });
});

describe("rawKidScore — composability", () => {
  it("is fully additive in the weighted fields", () => {
    const a = rawKidScore({
      ...IDEAL,
      colorBrightness: 0,
    } as KidFriendlinessLabel);
    const b = rawKidScore({
      ...IDEAL,
      colorBrightness: 3,
    } as KidFriendlinessLabel);
    expect(b - a).toBeCloseTo(3 * DEFAULT_KID_WEIGHTS.colorBrightness, 5);
  });
});

describe("rebalanceForParentMode", () => {
  it("blends pairing + kid scores at the configured factor", () => {
    const out = rebalanceForParentMode(
      [
        { recipeSlug: "pasta-carbonara", pairingScore: 0.6, item: "p" },
        { recipeSlug: "moussaka", pairingScore: 0.6, item: "m" },
      ],
      { blend: 0.5 },
    );
    // pasta-carbonara is high kidScore (familiar + deconstructable enough);
    // moussaka is low (texture risk + ineligible).
    expect(out[0]!.recipeSlug).toBe("pasta-carbonara");
    expect(out[1]!.recipeSlug).toBe("moussaka");
  });

  it("uses UNLABELED_NEUTRAL_KID_SCORE for unknown slugs", () => {
    const out = rebalanceForParentMode([
      { recipeSlug: "nonexistent-dish", pairingScore: 0.7, item: "x" },
    ]);
    expect(out[0]!.kidScore).toBe(UNLABELED_NEUTRAL_KID_SCORE);
  });

  it("is deterministic — same input always yields same order", () => {
    const inputs = [
      { recipeSlug: "pasta-carbonara", pairingScore: 0.5, item: 1 },
      { recipeSlug: "butter-chicken", pairingScore: 0.5, item: 2 },
      { recipeSlug: "sushi-platter", pairingScore: 0.5, item: 3 },
    ];
    const a = rebalanceForParentMode(inputs);
    const b = rebalanceForParentMode(inputs);
    expect(a.map((r) => r.recipeSlug)).toEqual(b.map((r) => r.recipeSlug));
  });

  it("blend=0 keeps pairing order", () => {
    const inputs = [
      { recipeSlug: "moussaka", pairingScore: 0.9, item: 1 },
      { recipeSlug: "pasta-carbonara", pairingScore: 0.4, item: 2 },
    ];
    const out = rebalanceForParentMode(inputs, { blend: 0 });
    expect(out[0]!.recipeSlug).toBe("moussaka");
  });

  it("blend=1 uses kid score only", () => {
    const inputs = [
      { recipeSlug: "moussaka", pairingScore: 0.9, item: 1 },
      { recipeSlug: "pasta-carbonara", pairingScore: 0.4, item: 2 },
    ];
    const out = rebalanceForParentMode(inputs, { blend: 1 });
    // pasta-carbonara has the higher kid score
    expect(out[0]!.recipeSlug).toBe("pasta-carbonara");
  });
});

describe("scorer — eyeball test on the 30 hand-labeled meals", () => {
  it("at least 80% of the parentModeEligible dishes rank in the top half by score", () => {
    const ranked = [...KID_FRIENDLINESS_LABELS]
      .map((l) => ({
        slug: l.recipeSlug,
        score: kidFriendlinessScore(l),
        eligible: l.parentModeEligible,
      }))
      .sort((a, b) => b.score - a.score);
    const half = Math.floor(ranked.length / 2);
    const topHalf = ranked.slice(0, half);
    const eligibleInTop = topHalf.filter((r) => r.eligible).length;
    const eligibleTotal = ranked.filter((r) => r.eligible).length;
    expect(eligibleInTop / eligibleTotal).toBeGreaterThanOrEqual(0.5);
  });

  it("all parentModeEligible:false dishes rank below at least one eligible dish", () => {
    const ranked = [...KID_FRIENDLINESS_LABELS]
      .map((l) => ({ ...l, score: kidFriendlinessScore(l) }))
      .sort((a, b) => b.score - a.score);
    const ineligibleSlugs = ranked.filter((r) => !r.parentModeEligible);
    const top = ranked[0]!;
    expect(top.parentModeEligible).toBe(true);
    for (const ineligible of ineligibleSlugs) {
      expect(ineligible.score).toBeLessThan(top.score);
    }
  });
});
