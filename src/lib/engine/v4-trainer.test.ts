import { describe, expect, it } from "vitest";
import type { TrainerFeedbackEntry } from "./trainer-feedback-log";
import { DEFAULT_COHORT_WEIGHTS } from "./trainer-retune";
import {
  buildV4Proposal,
  pickSegmentWeights,
  recencyWeight,
} from "./v4-trainer";

const baseEntry = (
  overrides: Partial<TrainerFeedbackEntry> = {},
): TrainerFeedbackEntry => ({
  id: "f-1",
  recipeSlug: "garlic-rice",
  capturedAt: "2026-05-03T10:00:00Z",
  outcome: "cooked",
  rank: 0,
  totalScore: 0.85,
  dimensions: {
    cuisineFit: 0.9,
    flavorContrast: 0.5,
    nutritionBalance: 0.5,
    prepBurden: 0.5,
    temperatureComplement: 0.5,
    userPreference: 0.5,
  },
  ...overrides,
});

describe("recencyWeight", () => {
  it("returns 1 at zero age", () => {
    expect(recencyWeight({ ageDays: 0, halfLifeDays: 14 })).toBe(1);
  });

  it("returns 0.5 at exactly half-life", () => {
    expect(recencyWeight({ ageDays: 14, halfLifeDays: 14 })).toBeCloseTo(
      0.5,
      5,
    );
  });

  it("returns 0.25 at two half-lives", () => {
    expect(recencyWeight({ ageDays: 28, halfLifeDays: 14 })).toBeCloseTo(
      0.25,
      5,
    );
  });

  it("returns 1 for invalid age (defensive)", () => {
    expect(recencyWeight({ ageDays: -5, halfLifeDays: 14 })).toBe(1);
    expect(recencyWeight({ ageDays: Number.NaN, halfLifeDays: 14 })).toBe(1);
  });

  it("returns 1 when halfLifeDays is non-positive", () => {
    expect(recencyWeight({ ageDays: 5, halfLifeDays: 0 })).toBe(1);
  });
});

describe("buildV4Proposal", () => {
  it("always includes the 'all' bucket even with no entries", () => {
    const out = buildV4Proposal({
      entries: [],
      now: new Date("2026-05-03T12:00:00Z"),
    });
    expect(out.perSegment.all).toBeDefined();
    expect(out.perSegment.all).toEqual(DEFAULT_COHORT_WEIGHTS);
  });

  it("excludes entries outside the lookback window", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const out = buildV4Proposal({
      entries: [
        baseEntry({
          id: "old",
          capturedAt: "2025-01-01T00:00:00Z",
          outcome: "cooked",
        }),
      ],
      now,
      lookbackDays: 60,
    });
    expect(out.perSegmentEffectiveN.all).toBe(0);
  });

  it("ignores non-cooked / non-rerolled outcomes", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const out = buildV4Proposal({
      entries: [
        baseEntry({
          id: "1",
          outcome: "scheduled",
          capturedAt: now.toISOString(),
        }),
        baseEntry({
          id: "2",
          outcome: "dismissed",
          capturedAt: now.toISOString(),
        }),
      ],
      now,
    });
    expect(out.perSegmentEffectiveN.all).toBe(0);
  });

  it("recent entries weigh more than older ones", () => {
    const now = new Date("2026-05-15T00:00:00Z");
    const recent = baseEntry({
      id: "recent",
      outcome: "cooked",
      capturedAt: "2026-05-15T00:00:00Z",
    });
    const old = baseEntry({
      id: "old",
      outcome: "rerolled",
      capturedAt: "2026-05-01T00:00:00Z", // 14d earlier → weight 0.5
    });
    const out = buildV4Proposal({
      entries: [recent, old],
      now,
      halfLifeDays: 14,
    });
    // Recent weight 1, old weight ~0.5 → effective N ~= 1.5
    expect(out.perSegmentEffectiveN.all).toBeCloseTo(1.5, 1);
  });

  it("partitions entries into per-segment buckets via resolver", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const out = buildV4Proposal({
      entries: [
        baseEntry({
          id: "a",
          outcome: "cooked",
          capturedAt: now.toISOString(),
        }),
        baseEntry({
          id: "b",
          outcome: "rerolled",
          capturedAt: now.toISOString(),
        }),
      ],
      now,
      segmentResolver: (e) => (e.id === "a" ? "seg-x" : "seg-y"),
    });
    expect(out.perSegment["seg-x"]).toBeDefined();
    expect(out.perSegment["seg-y"]).toBeDefined();
    expect(out.perSegment.all).toBeDefined();
  });

  it("clamps per-dim delta to ±cap when applying", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    // Constructed cooked vs rerolled with extreme delta on
    // cuisineFit (1.0 vs 0.0).
    const out = buildV4Proposal({
      entries: [
        baseEntry({
          id: "c",
          outcome: "cooked",
          capturedAt: now.toISOString(),
          dimensions: {
            cuisineFit: 1,
            flavorContrast: 0.5,
            nutritionBalance: 0.5,
            prepBurden: 0.5,
            temperatureComplement: 0.5,
            userPreference: 0.5,
          },
        }),
        baseEntry({
          id: "r",
          outcome: "rerolled",
          capturedAt: now.toISOString(),
          dimensions: {
            cuisineFit: 0,
            flavorContrast: 0.5,
            nutritionBalance: 0.5,
            prepBurden: 0.5,
            temperatureComplement: 0.5,
            userPreference: 0.5,
          },
        }),
      ],
      now,
    });
    // Raw delta = 1.0 → clamped to 0.10 → cuisineFit raw becomes
    // 0.20 + 0.10 = 0.30 pre-renormalise; after renormalise the
    // ratio is preserved.
    const all = out.perSegment.all;
    expect(all.cuisineFit).toBeGreaterThan(DEFAULT_COHORT_WEIGHTS.cuisineFit);
  });

  it("renormalises proposed weights to sum 1", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const out = buildV4Proposal({
      entries: [
        baseEntry({
          id: "c",
          outcome: "cooked",
          capturedAt: now.toISOString(),
        }),
        baseEntry({
          id: "r",
          outcome: "rerolled",
          capturedAt: now.toISOString(),
          dimensions: {
            cuisineFit: 0.4,
            flavorContrast: 0.5,
            nutritionBalance: 0.5,
            prepBurden: 0.5,
            temperatureComplement: 0.5,
            userPreference: 0.5,
          },
        }),
      ],
      now,
    });
    const sum = Object.values(out.perSegment.all).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(1, 5);
  });
});

describe("pickSegmentWeights", () => {
  it("returns per-segment weights when key matches", () => {
    const proposal = {
      perSegment: {
        all: DEFAULT_COHORT_WEIGHTS,
        "seg-x": { ...DEFAULT_COHORT_WEIGHTS, cuisineFit: 0.4 },
      },
      perSegmentEffectiveN: { all: 0, "seg-x": 5 },
      halfLifeDays: 14,
    };
    const out = pickSegmentWeights({
      proposal,
      segmentKey: "seg-x",
    });
    expect(out.cuisineFit).toBe(0.4);
  });

  it("falls back to 'all' when segment unknown", () => {
    const proposal = {
      perSegment: { all: DEFAULT_COHORT_WEIGHTS },
      perSegmentEffectiveN: { all: 0 },
      halfLifeDays: 14,
    };
    const out = pickSegmentWeights({
      proposal,
      segmentKey: "missing",
    });
    expect(out).toEqual(DEFAULT_COHORT_WEIGHTS);
  });

  it("falls back to 'all' for null segment", () => {
    const proposal = {
      perSegment: { all: DEFAULT_COHORT_WEIGHTS },
      perSegmentEffectiveN: { all: 0 },
      halfLifeDays: 14,
    };
    const out = pickSegmentWeights({ proposal, segmentKey: null });
    expect(out).toEqual(DEFAULT_COHORT_WEIGHTS);
  });
});
