import { describe, expect, it } from "vitest";
import {
  ALL_MOTION_TOKEN_NAMES,
  DURATION,
  EASING,
  SPRING,
  duration,
  easing,
  spring,
  withReducedMotion,
} from "./motion";

describe("DURATION tokens", () => {
  it("five-tier ramp is monotonic", () => {
    expect(DURATION.instant).toBeLessThan(DURATION.fast);
    expect(DURATION.fast).toBeLessThan(DURATION.normal);
    expect(DURATION.normal).toBeLessThan(DURATION.slow);
    expect(DURATION.slow).toBeLessThan(DURATION.slower);
  });

  it("instant is faster than 60ms ceiling", () => {
    expect(DURATION.instant).toBeLessThanOrEqual(0.06);
  });

  it("slower is below 600ms ceiling", () => {
    expect(DURATION.slower).toBeLessThanOrEqual(0.6);
  });
});

describe("EASING tokens", () => {
  it("each easing is a 4-tuple", () => {
    for (const slug of Object.keys(EASING)) {
      const e = EASING[slug as keyof typeof EASING];
      expect(e.length).toBe(4);
    }
  });

  it("standard easing values stay within 0..1", () => {
    for (const v of EASING.standard) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

describe("SPRING tokens", () => {
  it("each spring has type + stiffness + damping", () => {
    for (const slug of Object.keys(SPRING)) {
      const s = SPRING[slug as keyof typeof SPRING];
      expect(s.type).toBe("spring");
      expect(s.stiffness).toBeGreaterThan(0);
      expect(s.damping).toBeGreaterThan(0);
    }
  });

  it("snappy is stiffer than gentle", () => {
    expect(SPRING.snappy.stiffness).toBeGreaterThan(SPRING.gentle.stiffness);
  });
});

describe("typed accessors", () => {
  it("duration() returns the matching token value", () => {
    expect(duration("normal")).toBe(DURATION.normal);
  });

  it("easing() returns the matching tuple", () => {
    expect(easing("standard")).toEqual(EASING.standard);
  });

  it("spring() returns the matching config", () => {
    expect(spring("snappy")).toEqual(SPRING.snappy);
  });
});

describe("withReducedMotion", () => {
  it("returns 0 when prefers-reduced-motion", () => {
    expect(withReducedMotion(DURATION.normal, true)).toBe(0);
  });

  it("returns the duration when motion allowed", () => {
    expect(withReducedMotion(DURATION.normal, false)).toBe(DURATION.normal);
  });
});

describe("ALL_MOTION_TOKEN_NAMES", () => {
  it("includes one entry per group token", () => {
    expect(ALL_MOTION_TOKEN_NAMES.length).toBe(
      Object.keys(DURATION).length +
        Object.keys(EASING).length +
        Object.keys(SPRING).length,
    );
  });

  it("entries are namespaced 'group:slug' shape", () => {
    for (const name of ALL_MOTION_TOKEN_NAMES) {
      expect(name).toMatch(/^(duration|easing|spring):[a-z]+$/);
    }
  });
});
