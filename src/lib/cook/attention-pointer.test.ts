import { describe, expect, it } from "vitest";
import {
  clampPointerCoord,
  resolvePointer,
  type AttentionPointer,
} from "./attention-pointer";

describe("clampPointerCoord", () => {
  it("returns the value when inside [0, 1]", () => {
    expect(clampPointerCoord(0.42)).toBe(0.42);
    expect(clampPointerCoord(0)).toBe(0);
    expect(clampPointerCoord(1)).toBe(1);
  });

  it("clamps negative values to 0", () => {
    expect(clampPointerCoord(-0.5)).toBe(0);
    expect(clampPointerCoord(-1000)).toBe(0);
  });

  it("clamps values > 1 to 1", () => {
    expect(clampPointerCoord(1.0001)).toBe(1);
    expect(clampPointerCoord(99)).toBe(1);
  });

  it("returns 0.5 for null / undefined", () => {
    expect(clampPointerCoord(null)).toBe(0.5);
    expect(clampPointerCoord(undefined)).toBe(0.5);
  });

  it("returns 0.5 for NaN", () => {
    expect(clampPointerCoord(Number.NaN)).toBe(0.5);
  });

  it("returns 0.5 for Infinity / -Infinity", () => {
    expect(clampPointerCoord(Number.POSITIVE_INFINITY)).toBe(0.5);
    expect(clampPointerCoord(Number.NEGATIVE_INFINITY)).toBe(0.5);
  });
});

describe("resolvePointer", () => {
  it("converts normalised coords to percentages", () => {
    const p: AttentionPointer = { shape: "circle", x: 0.3, y: 0.7 };
    const r = resolvePointer(p);
    expect(r).toEqual({
      shape: "circle",
      xPct: 30,
      yPct: 70,
      label: null,
    });
  });

  it("trims and caps label", () => {
    const p: AttentionPointer = {
      shape: "arrow",
      x: 0.5,
      y: 0.5,
      label: "  watch for the sizzle here, it should brown  ",
    };
    const r = resolvePointer(p);
    expect(r.label).toBe("watch for the sizzle her"); // 24 chars after trim
    expect(r.label?.length).toBe(24);
  });

  it("returns null label for empty / whitespace-only", () => {
    expect(
      resolvePointer({ shape: "circle", x: 0, y: 0, label: "" }).label,
    ).toBe(null);
    expect(
      resolvePointer({ shape: "circle", x: 0, y: 0, label: "   " }).label,
    ).toBe(null);
  });

  it("clamps out-of-range coords on resolve", () => {
    const p: AttentionPointer = { shape: "circle", x: -0.1, y: 1.5 };
    const r = resolvePointer(p);
    expect(r.xPct).toBe(0);
    expect(r.yPct).toBe(100);
  });

  it("preserves shape", () => {
    expect(resolvePointer({ shape: "circle", x: 0.5, y: 0.5 }).shape).toBe(
      "circle",
    );
    expect(resolvePointer({ shape: "arrow", x: 0.5, y: 0.5 }).shape).toBe(
      "arrow",
    );
  });

  it("is pure — equivalent input yields equivalent output", () => {
    const p: AttentionPointer = {
      shape: "circle",
      x: 0.25,
      y: 0.75,
      label: "here",
    };
    expect(resolvePointer(p)).toEqual(resolvePointer({ ...p }));
  });
});
