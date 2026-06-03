import { describe, expect, it } from "vitest";
import { computeFreshness, DECAY_PER_30_DAYS } from "./preference-decay";

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_700_000_000_000; // fixed clock for determinism

describe("computeFreshness", () => {
  it("returns 0 for a missing timestamp", () => {
    expect(computeFreshness(undefined, NOW)).toBe(0);
  });

  it("returns 0 for a non-finite date", () => {
    expect(computeFreshness("not-a-date", NOW)).toBe(0);
  });

  it("reads 1 for a freshly cooked skill", () => {
    expect(computeFreshness(new Date(NOW).toISOString(), NOW)).toBe(1);
  });

  it("clamps a future timestamp to 1", () => {
    expect(computeFreshness(new Date(NOW + 10 * DAY).toISOString(), NOW)).toBe(
      1,
    );
  });

  it("decays ~10% per 30 days", () => {
    const thirtyDaysAgo = new Date(NOW - 30 * DAY).toISOString();
    expect(computeFreshness(thirtyDaysAgo, NOW)).toBeCloseTo(
      1 - DECAY_PER_30_DAYS,
      5,
    );
  });

  it("floors at 0.15 for a long-stale skill", () => {
    const yearAgo = new Date(NOW - 365 * DAY).toISOString();
    expect(computeFreshness(yearAgo, NOW)).toBe(0.15);
  });
});
