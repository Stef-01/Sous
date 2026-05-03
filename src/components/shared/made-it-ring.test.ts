import { describe, expect, it } from "vitest";
import { ringMetrics } from "./made-it-ring";

describe("ringMetrics — empty state", () => {
  it("count 0 → empty / progress 0", () => {
    expect(ringMetrics(0, 5)).toEqual({ progress: 0, state: "empty" });
  });

  it("negative count → empty (defensive)", () => {
    expect(ringMetrics(-2, 5).state).toBe("empty");
  });

  it("NaN count → empty", () => {
    expect(ringMetrics(Number.NaN, 5).state).toBe("empty");
  });
});

describe("ringMetrics — partial state", () => {
  it("count 1 of 5 → partial / progress 20", () => {
    expect(ringMetrics(1, 5)).toEqual({ progress: 20, state: "partial" });
  });

  it("count 3 of 5 → partial / progress 60", () => {
    expect(ringMetrics(3, 5)).toEqual({ progress: 60, state: "partial" });
  });

  it("partial floor: count 0.5 of 100 → progress >= 1 (visible)", () => {
    expect(ringMetrics(0.5, 100).progress).toBeGreaterThanOrEqual(1);
  });

  it("partial cap: count 99 of 100 → progress 99 (not 100, distinct from full)", () => {
    expect(ringMetrics(99, 100)).toEqual({ progress: 99, state: "partial" });
  });
});

describe("ringMetrics — full state", () => {
  it("count == target → full / progress 100", () => {
    expect(ringMetrics(5, 5)).toEqual({ progress: 100, state: "full" });
  });

  it("count > target → full / progress capped at 100", () => {
    expect(ringMetrics(20, 5)).toEqual({ progress: 100, state: "full" });
  });
});

describe("ringMetrics — bad target defensive", () => {
  it("target 0 + positive count → full (don't NaN-progress)", () => {
    expect(ringMetrics(3, 0).state).toBe("full");
  });

  it("target NaN + positive count → full", () => {
    expect(ringMetrics(3, Number.NaN).state).toBe("full");
  });

  it("target 0 + 0 count → empty (count gate wins)", () => {
    expect(ringMetrics(0, 0).state).toBe("empty");
  });
});
