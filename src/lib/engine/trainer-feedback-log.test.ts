import { describe, expect, it } from "vitest";
import {
  aggregateTrainerFeedback,
  trainerCookRate,
  trainerDayKey,
  type TrainerFeedbackEntry,
} from "./trainer-feedback-log";

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
    flavorContrast: 0.7,
    nutritionBalance: 0.6,
    prepBurden: 0.8,
    temperatureComplement: 0.5,
    userPreference: 0.7,
  },
  ...overrides,
});

describe("trainerDayKey", () => {
  it("returns YYYY-MM-DD", () => {
    expect(trainerDayKey(new Date(2026, 4, 3, 10))).toBe("2026-05-03");
  });

  it("empty for invalid date", () => {
    expect(trainerDayKey(new Date("nope"))).toBe("");
  });
});

describe("aggregateTrainerFeedback", () => {
  it("returns zero aggregate for empty input", () => {
    const result = aggregateTrainerFeedback({
      entries: [],
      now: new Date("2026-05-03T12:00:00Z"),
      lookbackDays: 14,
    });
    expect(result.totalShown).toBe(0);
    expect(result.daily.length).toBe(15);
    expect(result.dimensionDeltas.cuisineFit).toBe(0);
  });

  it("rolls up totals per outcome", () => {
    const result = aggregateTrainerFeedback({
      entries: [
        baseEntry({ id: "1", outcome: "cooked" }),
        baseEntry({ id: "2", outcome: "cooked" }),
        baseEntry({ id: "3", outcome: "rerolled" }),
        baseEntry({ id: "4", outcome: "scheduled" }),
        baseEntry({ id: "5", outcome: "dismissed" }),
        baseEntry({ id: "6", outcome: "no-action" }),
      ],
      now: new Date("2026-05-03T12:00:00Z"),
      lookbackDays: 14,
    });
    expect(result.totalShown).toBe(6);
    expect(result.totalCooked).toBe(2);
    expect(result.totalRerolled).toBe(1);
    expect(result.totalScheduled).toBe(1);
    expect(result.totalDismissed).toBe(1);
  });

  it("computes per-rank cook rate", () => {
    const result = aggregateTrainerFeedback({
      entries: [
        baseEntry({ id: "1", rank: 0, outcome: "cooked" }),
        baseEntry({ id: "2", rank: 0, outcome: "rerolled" }),
        baseEntry({ id: "3", rank: 1, outcome: "rerolled" }),
        baseEntry({ id: "4", rank: 1, outcome: "rerolled" }),
      ],
      now: new Date("2026-05-03T12:00:00Z"),
      lookbackDays: 14,
    });
    expect(result.byRank.find((r) => r.rank === 0)?.cookRate).toBe(0.5);
    expect(result.byRank.find((r) => r.rank === 1)?.cookRate).toBe(0);
  });

  it("computes dimension deltas (cooked mean minus rerolled mean)", () => {
    const result = aggregateTrainerFeedback({
      entries: [
        baseEntry({
          id: "c-1",
          outcome: "cooked",
          dimensions: {
            cuisineFit: 0.9,
            flavorContrast: 0.5,
            nutritionBalance: 0.5,
            prepBurden: 0.5,
            temperatureComplement: 0.5,
            userPreference: 0.5,
          },
        }),
        baseEntry({
          id: "r-1",
          outcome: "rerolled",
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
      now: new Date("2026-05-03T12:00:00Z"),
      lookbackDays: 14,
    });
    // Cooked mean cuisineFit=0.9, rerolled=0.4 → delta=0.5.
    expect(result.dimensionDeltas.cuisineFit).toBeCloseTo(0.5, 3);
    // Other dims identical → delta 0.
    expect(result.dimensionDeltas.flavorContrast).toBeCloseTo(0, 3);
  });

  it("returns zero deltas when one outcome bucket is empty", () => {
    const result = aggregateTrainerFeedback({
      entries: [baseEntry({ outcome: "cooked" })],
      now: new Date("2026-05-03T12:00:00Z"),
      lookbackDays: 14,
    });
    expect(result.dimensionDeltas.cuisineFit).toBe(0);
  });

  it("includes all five outcome buckets in byOutcome", () => {
    const result = aggregateTrainerFeedback({
      entries: [baseEntry({ outcome: "cooked" })],
      now: new Date("2026-05-03T12:00:00Z"),
      lookbackDays: 14,
    });
    expect(result.byOutcome).toHaveLength(5);
    expect(result.byOutcome.find((b) => b.outcome === "no-action")?.count).toBe(
      0,
    );
  });

  it("excludes entries outside the lookback window", () => {
    const result = aggregateTrainerFeedback({
      entries: [
        baseEntry({ id: "old", capturedAt: "2025-01-01T00:00:00Z" }),
        baseEntry({ id: "new" }),
      ],
      now: new Date("2026-05-03T12:00:00Z"),
      lookbackDays: 14,
    });
    expect(result.totalShown).toBe(1);
  });
});

describe("trainerCookRate", () => {
  it("returns null for zero shown", () => {
    const result = aggregateTrainerFeedback({
      entries: [],
      now: new Date(),
      lookbackDays: 14,
    });
    expect(trainerCookRate(result)).toBeNull();
  });

  it("returns cooked/shown ratio", () => {
    const result = aggregateTrainerFeedback({
      entries: [
        baseEntry({ id: "1", outcome: "cooked" }),
        baseEntry({ id: "2", outcome: "rerolled" }),
        baseEntry({ id: "3", outcome: "rerolled" }),
        baseEntry({ id: "4", outcome: "rerolled" }),
      ],
      now: new Date("2026-05-03T12:00:00Z"),
      lookbackDays: 14,
    });
    expect(trainerCookRate(result)).toBe(0.25);
  });
});
