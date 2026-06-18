import { describe, expect, it } from "vitest";
import {
  buildAcceptRateMap,
  wilsonLower,
  COHORT_MIN_IMPRESSIONS,
} from "./cohort-accept-aggregate";
import {
  scoreCohortAccept,
  type CohortAcceptContext,
} from "./scorers/cohort-accept-rate";
import {
  PAIRING_OUTCOMES_SCHEMA_VERSION,
  type PairingOutcome,
} from "./pairing-outcomes";

function ev(
  slug: string,
  suggestionId: string,
  outcome: PairingOutcome["outcome"],
): PairingOutcome {
  return {
    suggestionId,
    batchId: suggestionId.split(":")[0],
    deviceId: "d",
    recipeSlug: slug,
    mainDishIntentHash: "h",
    cuisineFamily: "x",
    rank: 0,
    shownAt: "2026-06-18T00:00:00.000Z",
    totalScore: 0.5,
    dimensions: {
      cuisineFit: 0,
      flavorContrast: 0,
      nutritionBalance: 0,
      prepBurden: 0,
      temperature: 0,
      preference: 0,
    },
    outcome,
    outcomeAt: null,
    rating: null,
    favorite: false,
    feedback: null,
    schemaVersion: PAIRING_OUTCOMES_SCHEMA_VERSION,
  };
}

describe("wilsonLower", () => {
  it("is 0 for no data", () => {
    expect(wilsonLower(1, 0)).toBe(0);
  });

  it("penalizes small samples — 1/2 reads far below 50/100 at the same rate", () => {
    const small = wilsonLower(0.5, 2);
    const big = wilsonLower(0.5, 100);
    expect(small).toBeLessThan(big);
    expect(big).toBeGreaterThan(0.39);
    expect(small).toBeLessThan(0.2);
  });

  it("stays within [0,1]", () => {
    for (const [r, n] of [
      [1, 5],
      [0, 5],
      [0.7, 50],
    ] as const) {
      const w = wilsonLower(r, n);
      expect(w).toBeGreaterThanOrEqual(0);
      expect(w).toBeLessThanOrEqual(1);
    }
  });
});

describe("buildAcceptRateMap", () => {
  it("rate = distinct accepted / distinct shown per slug", () => {
    const rows: PairingOutcome[] = [
      ev("a", "b1:0", "shown"),
      ev("a", "b2:0", "shown"),
      ev("a", "b1:0", "picked"),
      ev("a", "b1:0", "cooked"), // same suggestionId — counts ONCE
      ev("b", "b3:0", "shown"),
    ];
    const map = buildAcceptRateMap(rows);
    expect(map.get("a")).toEqual({ rate: 0.5, n: 2 }); // 1 of 2 slots accepted
    expect(map.get("b")).toEqual({ rate: 0, n: 1 });
  });

  it("a pick with no surviving shown row still counts in the denominator", () => {
    const map = buildAcceptRateMap([ev("a", "b1:0", "cooked")]);
    expect(map.get("a")).toEqual({ rate: 1, n: 1 });
  });
});

describe("scoreCohortAccept (the gated signal)", () => {
  const ctx: CohortAcceptContext = {
    acceptRateBySlug: new Map([
      ["loved", { rate: 0.9, n: COHORT_MIN_IMPRESSIONS + 50 }],
      ["thin", { rate: 0.9, n: 3 }], // below the impression floor
    ]),
  };

  it("returns the base (zero nudge) for slugs below the impression floor", () => {
    expect(scoreCohortAccept("thin", ctx, 0.42)).toBe(0.42);
    expect(scoreCohortAccept("unseen", ctx, 0.42)).toBe(0.42);
  });

  it("returns the Wilson lower bound for slugs above the floor", () => {
    const s = scoreCohortAccept("loved", ctx, 0.42);
    expect(s).toBeGreaterThan(0.42); // a genuinely-loved side nudges up
    expect(s).toBeLessThan(0.9); // but below the raw rate (small-sample discount)
    expect(s).toBe(wilsonLower(0.9, COHORT_MIN_IMPRESSIONS + 50));
  });
});
