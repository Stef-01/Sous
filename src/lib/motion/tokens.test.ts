import { describe, expect, it } from "vitest";
import {
  DURATION,
  EASE,
  SPRING,
  motionTransition,
  staggerChildren,
} from "./tokens";

describe("motion tokens (W1)", () => {
  it("exposes the duration + ease + spring scale", () => {
    expect(DURATION.fast).toBeLessThan(DURATION.base);
    expect(DURATION.base).toBeLessThan(DURATION.slow);
    expect(EASE.out).toHaveLength(4);
    expect(SPRING.snappy.type).toBe("spring");
  });

  it("collapses any transition to instant under reduced motion", () => {
    const t = SPRING.soft;
    expect(motionTransition(t, false)).toBe(t);
    expect(motionTransition(t, true)).toEqual({ duration: 0 });
  });

  it("disables stagger under reduced motion", () => {
    expect(staggerChildren(true).staggerChildren).toBe(0);
    expect(staggerChildren(false).staggerChildren).toBeGreaterThan(0);
  });
});
