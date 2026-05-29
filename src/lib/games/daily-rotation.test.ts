import { describe, expect, it } from "vitest";
import { msUntilNextPuzzle, resolveDailyPuzzle } from "./daily-rotation";

describe("resolveDailyPuzzle", () => {
  it("anchor date (2026-05-04 UTC) is Day 1", () => {
    const out = resolveDailyPuzzle({
      now: new Date("2026-05-04T00:00:00Z"),
      datasetSize: 50,
    });
    expect(out.dayNumber).toBe(1);
    expect(out.dishIndex).toBe(0);
    expect(out.isoDate).toBe("2026-05-04");
  });

  it("Day 2 starts at 2026-05-05 UTC", () => {
    const out = resolveDailyPuzzle({
      now: new Date("2026-05-05T00:00:00Z"),
      datasetSize: 50,
    });
    expect(out.dayNumber).toBe(2);
    expect(out.dishIndex).toBe(1);
  });

  it("rotates through dataset modulo size (Day 51 wraps to dish 0)", () => {
    const out = resolveDailyPuzzle({
      now: new Date("2026-06-23T00:00:00Z"), // Day 51
      datasetSize: 50,
    });
    expect(out.dayNumber).toBe(51);
    expect(out.dishIndex).toBe(0);
  });

  it("a dish stays the same across the entire UTC day", () => {
    const am = resolveDailyPuzzle({
      now: new Date("2026-05-10T01:30:00Z"),
      datasetSize: 50,
    });
    const pm = resolveDailyPuzzle({
      now: new Date("2026-05-10T23:45:00Z"),
      datasetSize: 50,
    });
    expect(am.dayNumber).toBe(pm.dayNumber);
    expect(am.dishIndex).toBe(pm.dishIndex);
  });

  it("returns Day 1 fallback for non-finite now", () => {
    const out = resolveDailyPuzzle({
      now: new Date("garble"),
      datasetSize: 50,
    });
    expect(out.dayNumber).toBe(1);
    expect(out.dishIndex).toBe(0);
  });

  it("clamps day-number floor at 1 for pre-anchor dates", () => {
    const out = resolveDailyPuzzle({
      now: new Date("2025-01-01T00:00:00Z"),
      datasetSize: 50,
    });
    expect(out.dayNumber).toBe(1);
  });

  it("ignores invalid datasetSize (clamps to 1)", () => {
    const out = resolveDailyPuzzle({
      now: new Date("2026-05-04T00:00:00Z"),
      datasetSize: 0,
    });
    expect(out.dishIndex).toBe(0);
  });

  it("isoDate format is always YYYY-MM-DD UTC", () => {
    const out = resolveDailyPuzzle({
      now: new Date("2026-12-31T23:59:00Z"),
      datasetSize: 50,
    });
    expect(out.isoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("msUntilNextPuzzle", () => {
  it("returns ~24h when called just after midnight UTC", () => {
    const ms = msUntilNextPuzzle(new Date("2026-05-10T00:01:00Z"));
    expect(ms).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(ms).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });

  it("returns near-zero when called just before midnight UTC", () => {
    const ms = msUntilNextPuzzle(new Date("2026-05-10T23:59:50Z"));
    expect(ms).toBeLessThan(15 * 1000); // less than 15 seconds
  });

  it("returns 0 for invalid now (defensive)", () => {
    expect(msUntilNextPuzzle(new Date("garble"))).toBe(0);
  });

  it("returns exactly 24h at the moment of midnight UTC", () => {
    const ms = msUntilNextPuzzle(new Date("2026-05-10T00:00:00Z"));
    expect(ms).toBe(24 * 60 * 60 * 1000);
  });
});
