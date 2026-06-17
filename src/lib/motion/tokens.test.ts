import { describe, expect, it } from "vitest";
import {
  DURATION,
  EASE,
  SPRING,
  TAP_SCALE,
  TAP_SCALE_SM,
  motionTransition,
  staggerChildren,
  premiumEntrance,
} from "./tokens";

describe("motion tokens (W1)", () => {
  it("exposes the duration + ease + spring scale", () => {
    expect(DURATION.fast).toBeLessThan(DURATION.base);
    expect(DURATION.base).toBeLessThan(DURATION.slow);
    expect(EASE.out).toHaveLength(4);
    expect(SPRING.snappy.type).toBe("spring");
  });

  it("ships the full house easing set (E1), mirroring the CSS tokens", () => {
    for (const key of ["out", "in", "inOut", "spring"] as const) {
      expect(EASE[key]).toHaveLength(4);
    }
    // the overshoot ease must actually overshoot (a control point > 1)…
    expect(Math.max(...EASE.spring)).toBeGreaterThan(1);
    // …and the others must NOT (overshoot as a default reads juvenile).
    for (const key of ["out", "in", "inOut"] as const) {
      expect(Math.max(...EASE[key])).toBeLessThanOrEqual(1);
    }
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

  it("premiumEntrance blurs in for focal surfaces (E3)", () => {
    const full = premiumEntrance(false);
    expect(full.initial).toMatchObject({ opacity: 0, filter: "blur(2px)" });
    expect(full.animate).toMatchObject({ opacity: 1, filter: "blur(0px)" });
    expect(full.transition).toEqual({
      duration: DURATION.slow,
      ease: EASE.out,
    });
  });

  it("premiumEntrance collapses to a plain fade under reduced motion", () => {
    const reduced = premiumEntrance(true);
    expect(reduced.initial).toBe(false); // no blur, no movement
    expect(reduced.transition).toEqual({ duration: 0 });
  });

  it("exposes the tactile press-scale standard (E4)", () => {
    expect(TAP_SCALE).toBe(0.98);
    expect(TAP_SCALE).toBeGreaterThan(0.9); // a press, never a pop
    expect(TAP_SCALE_SM).toBeLessThan(TAP_SCALE); // chips/icons go tighter
  });
});
