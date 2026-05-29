import { describe, expect, it } from "vitest";
import { ELAPSED_TICK_MS, advanceElapsed } from "./use-elapsed-seconds";

// ── advanceElapsed pure helper ────────────────────────────

describe("advanceElapsed", () => {
  it("250ms tick → +0.25 seconds", () => {
    expect(advanceElapsed(0, 250)).toBe(0.25);
  });

  it("1000ms tick → +1 second", () => {
    expect(advanceElapsed(5, 1000)).toBe(6);
  });

  it("0 delta → no change", () => {
    expect(advanceElapsed(3.5, 0)).toBe(3.5);
  });

  it("negative delta → no change (clock skew defensive)", () => {
    expect(advanceElapsed(3.5, -100)).toBe(3.5);
  });

  it("NaN delta → no change", () => {
    expect(advanceElapsed(2, Number.NaN)).toBe(2);
  });

  it("Infinity delta → no change", () => {
    expect(advanceElapsed(2, Number.POSITIVE_INFINITY)).toBe(2);
  });

  it("NaN previous → resets to 0", () => {
    expect(advanceElapsed(Number.NaN, 250)).toBe(0);
  });

  it("ELAPSED_TICK_MS is 250 (sub-second granularity)", () => {
    expect(ELAPSED_TICK_MS).toBe(250);
  });
});
