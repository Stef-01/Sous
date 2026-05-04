import { describe, expect, it } from "vitest";
import { computeWeeklyRhythm, type RhythmCookRecord } from "./weekly-rhythm";

const NOW = new Date("2026-05-02T12:00:00Z");

function record(overrides: Partial<RhythmCookRecord> = {}): RhythmCookRecord {
  return {
    completedAt: "2026-05-01T18:00:00Z",
    cuisineFamily: "indian",
    ...overrides,
  };
}

describe("computeWeeklyRhythm — empty / cold start", () => {
  it("empty history returns zeros", () => {
    const result = computeWeeklyRhythm([], NOW);
    expect(result).toEqual({
      cooksThisWeek: 0,
      cuisinesThisWeek: 0,
      daysSinceLastCook: null,
      cookedToday: false,
      topCuisines: [],
    });
  });

  it("ignores incomplete cooks", () => {
    const result = computeWeeklyRhythm(
      [record({ completedAt: undefined })],
      NOW,
    );
    expect(result.cooksThisWeek).toBe(0);
    expect(result.daysSinceLastCook).toBe(null);
  });
});

describe("computeWeeklyRhythm — in-window counting", () => {
  it("counts cooks within the last 7 days", () => {
    const history: RhythmCookRecord[] = [
      record({ completedAt: "2026-04-30T12:00:00Z" }),
      record({ completedAt: "2026-04-28T12:00:00Z" }),
      record({ completedAt: "2026-04-26T12:00:00Z" }),
    ];
    const result = computeWeeklyRhythm(history, NOW);
    expect(result.cooksThisWeek).toBe(3);
  });

  it("excludes cooks older than 7 days", () => {
    const history: RhythmCookRecord[] = [
      record({ completedAt: "2026-04-30T12:00:00Z" }),
      record({ completedAt: "2026-04-20T12:00:00Z" }),
    ];
    const result = computeWeeklyRhythm(history, NOW);
    expect(result.cooksThisWeek).toBe(1);
  });

  it("excludes cooks with completedAt in the future", () => {
    const history: RhythmCookRecord[] = [
      record({ completedAt: "2026-05-10T12:00:00Z" }),
    ];
    expect(computeWeeklyRhythm(history, NOW).cooksThisWeek).toBe(0);
  });

  it("ignores entries with malformed completedAt", () => {
    const history: RhythmCookRecord[] = [
      record({ completedAt: "garbage" }),
      record({ completedAt: "2026-05-01T18:00:00Z" }),
    ];
    expect(computeWeeklyRhythm(history, NOW).cooksThisWeek).toBe(1);
  });
});

describe("computeWeeklyRhythm — cuisinesThisWeek", () => {
  it("counts distinct cuisines in window", () => {
    const history: RhythmCookRecord[] = [
      record({ cuisineFamily: "indian" }),
      record({ cuisineFamily: "italian" }),
      record({ cuisineFamily: "indian" }),
      record({ cuisineFamily: "mexican" }),
    ];
    const result = computeWeeklyRhythm(history, NOW);
    expect(result.cuisinesThisWeek).toBe(3);
  });

  it("only counts cuisines in window", () => {
    const history: RhythmCookRecord[] = [
      record({ cuisineFamily: "indian" }),
      record({
        completedAt: "2026-04-15T12:00:00Z",
        cuisineFamily: "thai",
      }),
    ];
    expect(computeWeeklyRhythm(history, NOW).cuisinesThisWeek).toBe(1);
  });
});

describe("computeWeeklyRhythm — daysSinceLastCook + cookedToday", () => {
  it("returns 0 + cookedToday=true when most recent cook is today", () => {
    const history = [record({ completedAt: "2026-05-02T08:00:00Z" })];
    const result = computeWeeklyRhythm(history, NOW);
    expect(result.daysSinceLastCook).toBe(0);
    expect(result.cookedToday).toBe(true);
  });

  it("returns 1 + cookedToday=false when last cook was yesterday", () => {
    const history = [record({ completedAt: "2026-05-01T08:00:00Z" })];
    const result = computeWeeklyRhythm(history, NOW);
    expect(result.daysSinceLastCook).toBe(1);
    expect(result.cookedToday).toBe(false);
  });

  it("uses the most recent cook even when older cooks exist", () => {
    const history = [
      record({ completedAt: "2026-04-25T12:00:00Z" }),
      record({ completedAt: "2026-05-01T12:00:00Z" }),
      record({ completedAt: "2026-04-30T12:00:00Z" }),
    ];
    expect(computeWeeklyRhythm(history, NOW).daysSinceLastCook).toBe(1);
  });
});

describe("computeWeeklyRhythm — topCuisines", () => {
  it("orders by count descending, ties broken alphabetically", () => {
    const history: RhythmCookRecord[] = [
      record({ cuisineFamily: "italian" }),
      record({ cuisineFamily: "indian" }),
      record({ cuisineFamily: "indian" }),
      record({ cuisineFamily: "italian" }),
      record({ cuisineFamily: "italian" }),
    ];
    const result = computeWeeklyRhythm(history, NOW);
    expect(result.topCuisines).toEqual(["italian", "indian"]);
  });

  it("caps at 3 entries", () => {
    const history: RhythmCookRecord[] = [
      "indian",
      "italian",
      "mexican",
      "japanese",
      "thai",
    ].map((c) => record({ cuisineFamily: c }));
    expect(computeWeeklyRhythm(history, NOW).topCuisines).toHaveLength(3);
  });

  it("only counts in-window cooks", () => {
    const history: RhythmCookRecord[] = [
      record({ cuisineFamily: "indian" }),
      record({
        completedAt: "2026-04-15T12:00:00Z",
        cuisineFamily: "thai",
      }),
    ];
    expect(computeWeeklyRhythm(history, NOW).topCuisines).toEqual(["indian"]);
  });

  it("deterministic alphabetical tie-break", () => {
    const history: RhythmCookRecord[] = [
      record({ cuisineFamily: "thai" }),
      record({ cuisineFamily: "indian" }),
    ];
    const result = computeWeeklyRhythm(history, NOW);
    expect(result.topCuisines).toEqual(["indian", "thai"]);
  });
});
