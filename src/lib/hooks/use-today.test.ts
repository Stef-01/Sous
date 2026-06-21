import { describe, it, expect } from "vitest";
import { msUntilNextLocalMidnight } from "./use-today";

describe("msUntilNextLocalMidnight", () => {
  it("counts down to 5s past the next local midnight", () => {
    // 23:00 local → 1h to midnight + 5s cushion
    const ms = msUntilNextLocalMidnight(new Date(2026, 5, 21, 23, 0, 0));
    expect(ms).toBe(60 * 60 * 1000 + 5000);
  });

  it("stays positive right up to the boundary (23:59:59)", () => {
    expect(
      msUntilNextLocalMidnight(new Date(2026, 5, 21, 23, 59, 59)),
    ).toBeGreaterThan(0);
  });

  it("is ~24h away again just after a rollover (no zero/negative loop)", () => {
    // 00:00:06 — one second past the cushion → next fire is nearly a full day out
    const ms = msUntilNextLocalMidnight(new Date(2026, 5, 22, 0, 0, 6));
    expect(ms).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(ms).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });

  it("crosses month boundaries correctly", () => {
    // Jun 30 23:00 → next local midnight is Jul 1 00:00:05
    const ms = msUntilNextLocalMidnight(new Date(2026, 5, 30, 23, 0, 0));
    expect(ms).toBe(60 * 60 * 1000 + 5000);
  });
});
