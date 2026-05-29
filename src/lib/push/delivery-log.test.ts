import { describe, expect, it } from "vitest";
import {
  aggregatePushDeliveries,
  deliverySuccessRate,
  pushDayKey,
  type PushDeliveryEntry,
} from "./delivery-log";

const baseEntry = (
  overrides: Partial<PushDeliveryEntry> = {},
): PushDeliveryEntry => ({
  id: "p-1",
  channel: "ios-apns",
  attemptedAt: "2026-05-03T10:00:00Z",
  outcome: "delivered",
  intent: "rhythm-nudge",
  ...overrides,
});

describe("pushDayKey", () => {
  it("returns YYYY-MM-DD", () => {
    expect(pushDayKey(new Date(2026, 4, 3, 10))).toBe("2026-05-03");
  });

  it("empty for invalid date", () => {
    expect(pushDayKey(new Date("nope"))).toBe("");
  });
});

describe("aggregatePushDeliveries", () => {
  it("returns zero aggregate for empty input", () => {
    const result = aggregatePushDeliveries({
      entries: [],
      now: new Date("2026-05-03T12:00:00Z"),
      lookbackDays: 7,
    });
    expect(result.totalAttempts).toBe(0);
    expect(result.daily.length).toBe(8);
  });

  it("rolls up totals correctly", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregatePushDeliveries({
      entries: [
        baseEntry({ id: "1", outcome: "delivered" }),
        baseEntry({ id: "2", outcome: "delivered" }),
        baseEntry({ id: "3", outcome: "failed" }),
        baseEntry({ id: "4", outcome: "skipped-quiet-hours" }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(result.totalAttempts).toBe(4);
    expect(result.totalDelivered).toBe(2);
    expect(result.totalFailed).toBe(1);
    expect(result.totalSkipped).toBe(1);
  });

  it("rolls up by channel sorted by attempts desc", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregatePushDeliveries({
      entries: [
        baseEntry({ id: "1", channel: "web-vapid" }),
        baseEntry({ id: "2", channel: "ios-apns" }),
        baseEntry({ id: "3", channel: "ios-apns" }),
        baseEntry({ id: "4", channel: "ios-apns" }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(result.byChannel[0].channel).toBe("ios-apns");
    expect(result.byChannel[0].attempts).toBe(3);
    expect(result.byChannel[1].channel).toBe("web-vapid");
  });

  it("rolls up by intent", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregatePushDeliveries({
      entries: [
        baseEntry({ id: "1", intent: "rhythm-nudge" }),
        baseEntry({ id: "2", intent: "pod-reveal" }),
        baseEntry({ id: "3", intent: "pod-reveal" }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(result.byIntent[0].intent).toBe("pod-reveal");
    expect(result.byIntent[0].attempts).toBe(2);
  });

  it("provides all 5 outcome buckets even when empty", () => {
    const result = aggregatePushDeliveries({
      entries: [baseEntry({ outcome: "delivered" })],
      now: new Date("2026-05-03T12:00:00Z"),
      lookbackDays: 7,
    });
    expect(result.byOutcome).toHaveLength(5);
    expect(
      result.byOutcome.find((b) => b.outcome === "rate-limited")?.attempts,
    ).toBe(0);
  });

  it("excludes entries outside the lookback window", () => {
    const now = new Date("2026-05-03T12:00:00Z");
    const result = aggregatePushDeliveries({
      entries: [
        baseEntry({ id: "old", attemptedAt: "2025-01-01T00:00:00Z" }),
        baseEntry({ id: "new", attemptedAt: now.toISOString() }),
      ],
      now,
      lookbackDays: 7,
    });
    expect(result.totalAttempts).toBe(1);
  });
});

describe("deliverySuccessRate", () => {
  it("returns null for zero attempts", () => {
    const result = aggregatePushDeliveries({
      entries: [],
      now: new Date(),
      lookbackDays: 7,
    });
    expect(deliverySuccessRate(result)).toBeNull();
  });

  it("returns delivered/attempts ratio", () => {
    const result = aggregatePushDeliveries({
      entries: [
        baseEntry({ id: "1", outcome: "delivered" }),
        baseEntry({ id: "2", outcome: "delivered" }),
        baseEntry({ id: "3", outcome: "failed" }),
        baseEntry({ id: "4", outcome: "skipped-opt-out" }),
      ],
      now: new Date("2026-05-03T12:00:00Z"),
      lookbackDays: 7,
    });
    expect(deliverySuccessRate(result)).toBe(0.5);
  });
});
