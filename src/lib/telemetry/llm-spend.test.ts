import { describe, expect, it } from "vitest";
import {
  aggregateSpend,
  dayKey,
  estimateMonthlyBurn,
  formatMicroUsd,
  type LlmCallEntry,
} from "./llm-spend";

const baseEntry = (overrides: Partial<LlmCallEntry> = {}): LlmCallEntry => ({
  id: "e-1",
  surface: "voice-conversation",
  calledAt: "2026-05-03T10:00:00Z",
  tokensBilled: 100,
  costMicroUsd: 1_000,
  outcome: "ok",
  ...overrides,
});

describe("dayKey", () => {
  it("returns YYYY-MM-DD local-time format", () => {
    const d = new Date(2026, 4, 3, 10, 0, 0); // May 3, 2026
    expect(dayKey(d)).toBe("2026-05-03");
  });

  it("zero-pads single-digit month and day", () => {
    const d = new Date(2026, 0, 5, 10, 0, 0); // Jan 5, 2026
    expect(dayKey(d)).toBe("2026-01-05");
  });

  it("returns empty string for invalid date", () => {
    expect(dayKey(new Date("not a date"))).toBe("");
  });
});

describe("aggregateSpend", () => {
  it("returns zeroed aggregate for empty entries", () => {
    const result = aggregateSpend({
      entries: [],
      now: new Date("2026-05-03T12:00:00Z"),
      lookbackDays: 7,
    });
    expect(result.totalCalls).toBe(0);
    expect(result.totalTokens).toBe(0);
    expect(result.totalCostMicroUsd).toBe(0);
    expect(result.bySurface).toEqual([]);
    // Daily buckets pre-populated even when empty.
    expect(result.daily.length).toBe(8); // lookback + 1 (today)
    expect(result.daily.every((d) => d.callCount === 0)).toBe(true);
  });

  it("aggregates single-day entries correctly", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregateSpend({
      entries: [
        baseEntry({
          id: "1",
          calledAt: now.toISOString(),
          costMicroUsd: 1_500,
        }),
        baseEntry({
          id: "2",
          calledAt: now.toISOString(),
          costMicroUsd: 2_500,
        }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(result.totalCalls).toBe(2);
    expect(result.totalTokens).toBe(200);
    expect(result.totalCostMicroUsd).toBe(4_000);
  });

  it("excludes entries outside the lookback window", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const longAgo = "2025-01-01T12:00:00Z";
    const result = aggregateSpend({
      entries: [
        baseEntry({ id: "old", calledAt: longAgo }),
        baseEntry({ id: "new", calledAt: now.toISOString() }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(result.totalCalls).toBe(1);
  });

  it("excludes entries with malformed timestamps", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregateSpend({
      entries: [
        baseEntry({ id: "bad", calledAt: "not-a-date" }),
        baseEntry({ id: "good", calledAt: now.toISOString() }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(result.totalCalls).toBe(1);
  });

  it("pre-populates daily buckets so empty days don't gap", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregateSpend({
      entries: [],
      now,
      lookbackDays: 3,
    });
    // 4 buckets: today + 3 lookback days.
    expect(result.daily.length).toBe(4);
    // Sorted ascending.
    for (let i = 1; i < result.daily.length; i++) {
      expect(
        result.daily[i].dayKey.localeCompare(result.daily[i - 1].dayKey),
      ).toBeGreaterThan(0);
    }
  });

  it("rolls up by surface and sorts highest cost first", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregateSpend({
      entries: [
        baseEntry({
          id: "1",
          surface: "voice-conversation",
          costMicroUsd: 1_000,
          calledAt: now.toISOString(),
        }),
        baseEntry({
          id: "2",
          surface: "pantry-vision",
          costMicroUsd: 5_000,
          calledAt: now.toISOString(),
        }),
        baseEntry({
          id: "3",
          surface: "viral-search",
          costMicroUsd: 2_500,
          calledAt: now.toISOString(),
        }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(result.bySurface.length).toBe(3);
    expect(result.bySurface[0].surface).toBe("pantry-vision");
    expect(result.bySurface[1].surface).toBe("viral-search");
    expect(result.bySurface[2].surface).toBe("voice-conversation");
  });

  it("rolls up by outcome covering all three buckets", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregateSpend({
      entries: [
        baseEntry({ id: "1", outcome: "ok", calledAt: now.toISOString() }),
        baseEntry({ id: "2", outcome: "ok", calledAt: now.toISOString() }),
        baseEntry({ id: "3", outcome: "error", calledAt: now.toISOString() }),
      ],
      now,
      lookbackDays: 7,
    });
    const okBucket = result.byOutcome.find((b) => b.outcome === "ok");
    const errorBucket = result.byOutcome.find((b) => b.outcome === "error");
    const rejectedBucket = result.byOutcome.find(
      (b) => b.outcome === "rejected",
    );
    expect(okBucket?.callCount).toBe(2);
    expect(errorBucket?.callCount).toBe(1);
    expect(rejectedBucket?.callCount).toBe(0);
  });
});

describe("estimateMonthlyBurn", () => {
  it("returns 0 when fewer than 3 days have data (too noisy)", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const burn = estimateMonthlyBurn({
      entries: [
        baseEntry({
          id: "1",
          calledAt: now.toISOString(),
          costMicroUsd: 10_000,
        }),
        baseEntry({
          id: "2",
          calledAt: now.toISOString(),
          costMicroUsd: 10_000,
        }),
      ],
      now,
    });
    expect(burn).toBe(0);
  });

  it("projects 30-day burn from 7-day window when data is sufficient", () => {
    const now = new Date("2026-05-07T12:00:00Z");
    // 4 days of data — enough to project.
    const entries: LlmCallEntry[] = [
      baseEntry({
        id: "1",
        calledAt: "2026-05-04T10:00:00Z",
        costMicroUsd: 7_000,
      }),
      baseEntry({
        id: "2",
        calledAt: "2026-05-05T10:00:00Z",
        costMicroUsd: 7_000,
      }),
      baseEntry({
        id: "3",
        calledAt: "2026-05-06T10:00:00Z",
        costMicroUsd: 7_000,
      }),
      baseEntry({
        id: "4",
        calledAt: "2026-05-07T10:00:00Z",
        costMicroUsd: 7_000,
      }),
    ];
    const burn = estimateMonthlyBurn({ entries, now });
    // 7-day total = 28_000 micro-USD; (28_000 * 30) / 7 = 120_000.
    expect(burn).toBe(120_000);
  });

  it("returns 0 for empty entries", () => {
    const burn = estimateMonthlyBurn({
      entries: [],
      now: new Date("2026-05-03T12:00:00Z"),
    });
    expect(burn).toBe(0);
  });
});

describe("formatMicroUsd", () => {
  it("returns $0 for zero", () => {
    expect(formatMicroUsd(0)).toBe("$0");
  });

  it("returns $0 for non-finite input", () => {
    expect(formatMicroUsd(Number.NaN)).toBe("$0");
    expect(formatMicroUsd(Number.POSITIVE_INFINITY)).toBe("$0");
  });

  it("uses 4 decimals for very small amounts (<$0.01)", () => {
    expect(formatMicroUsd(4_500)).toBe("$0.0045");
    expect(formatMicroUsd(1_000)).toBe("$0.0010");
  });

  it("uses 3 decimals for sub-dollar amounts (<$1)", () => {
    expect(formatMicroUsd(120_000)).toBe("$0.120");
    expect(formatMicroUsd(999_000)).toBe("$0.999");
  });

  it("uses 2 decimals for dollar amounts ($1+)", () => {
    expect(formatMicroUsd(4_500_000)).toBe("$4.50");
    expect(formatMicroUsd(12_000_000)).toBe("$12.00");
  });
});
