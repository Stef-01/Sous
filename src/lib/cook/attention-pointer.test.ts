import { describe, expect, it } from "vitest";
import {
  clampPointerCoord,
  migrateAttentionPointer,
  normaliseRevealAtSecond,
  resolvePointer,
  sortPointersByRevealTime,
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
      revealAtSecond: 0,
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

  it("Y2 W23: revealAtSecond surfaces in resolved output", () => {
    const p: AttentionPointer = {
      shape: "circle",
      x: 0.5,
      y: 0.5,
      revealAtSecond: 7.5,
    };
    expect(resolvePointer(p).revealAtSecond).toBe(7.5);
  });

  it("Y2 W23: legacy pointer (no revealAtSecond) → resolved as 0", () => {
    const p: AttentionPointer = { shape: "arrow", x: 0.5, y: 0.5 };
    expect(resolvePointer(p).revealAtSecond).toBe(0);
  });
});

// ── Y2 W23: revealAtSecond schema delta ───────────────────

describe("normaliseRevealAtSecond", () => {
  it("undefined / null → 0 (legacy default)", () => {
    expect(normaliseRevealAtSecond(undefined)).toBe(0);
    expect(normaliseRevealAtSecond(null)).toBe(0);
  });

  it("0 → 0", () => {
    expect(normaliseRevealAtSecond(0)).toBe(0);
  });

  it("positive in-range → preserved", () => {
    expect(normaliseRevealAtSecond(5)).toBe(5);
    expect(normaliseRevealAtSecond(120.5)).toBe(120.5);
  });

  it("negative → 0 (defensive)", () => {
    expect(normaliseRevealAtSecond(-5)).toBe(0);
  });

  it("NaN / Infinity → 0", () => {
    expect(normaliseRevealAtSecond(Number.NaN)).toBe(0);
    expect(normaliseRevealAtSecond(Number.POSITIVE_INFINITY)).toBe(0);
    expect(normaliseRevealAtSecond(Number.NEGATIVE_INFINITY)).toBe(0);
  });

  it("> 600s cap (10-minute sanity bound)", () => {
    expect(normaliseRevealAtSecond(700)).toBe(600);
    expect(normaliseRevealAtSecond(99999)).toBe(600);
  });
});

describe("sortPointersByRevealTime", () => {
  it("sorts ascending by reveal time", () => {
    const pointers: AttentionPointer[] = [
      { shape: "circle", x: 0, y: 0, revealAtSecond: 10 },
      { shape: "circle", x: 0, y: 0, revealAtSecond: 0 },
      { shape: "circle", x: 0, y: 0, revealAtSecond: 5 },
    ];
    const sorted = sortPointersByRevealTime(pointers);
    expect(sorted.map((p) => p.revealAtSecond)).toEqual([0, 5, 10]);
  });

  it("legacy pointers (no field) bucket as 0 — render first", () => {
    const pointers: AttentionPointer[] = [
      { shape: "circle", x: 0, y: 0, revealAtSecond: 5 },
      { shape: "circle", x: 0, y: 0 }, // legacy
      { shape: "circle", x: 0, y: 0, revealAtSecond: 10 },
    ];
    const sorted = sortPointersByRevealTime(pointers);
    // Legacy (no field) at index 1 of input → reveals at 0 → first in sort
    expect(normaliseRevealAtSecond(sorted[0]?.revealAtSecond)).toBe(0);
    expect(sorted[1]?.revealAtSecond).toBe(5);
    expect(sorted[2]?.revealAtSecond).toBe(10);
  });

  it("ties → input-order tiebreaker (stable)", () => {
    const a: AttentionPointer = {
      shape: "circle",
      x: 0,
      y: 0,
      label: "first",
      revealAtSecond: 5,
    };
    const b: AttentionPointer = {
      shape: "circle",
      x: 0,
      y: 0,
      label: "second",
      revealAtSecond: 5,
    };
    const sorted = sortPointersByRevealTime([a, b]);
    expect(sorted[0]?.label).toBe("first");
    expect(sorted[1]?.label).toBe("second");
  });

  it("returns a new array (no mutation)", () => {
    const pointers: AttentionPointer[] = [
      { shape: "circle", x: 0, y: 0, revealAtSecond: 5 },
      { shape: "circle", x: 0, y: 0, revealAtSecond: 1 },
    ];
    const sorted = sortPointersByRevealTime(pointers);
    expect(sorted).not.toBe(pointers);
    // Input order unchanged
    expect(pointers[0]?.revealAtSecond).toBe(5);
  });

  it("empty input → empty output", () => {
    expect(sortPointersByRevealTime([])).toEqual([]);
  });
});

describe("migrateAttentionPointer", () => {
  it("legacy pointer → revealAtSecond = 0 added", () => {
    const legacy: AttentionPointer = { shape: "circle", x: 0.3, y: 0.7 };
    const migrated = migrateAttentionPointer(legacy);
    expect(migrated.revealAtSecond).toBe(0);
    expect(migrated.shape).toBe("circle");
    expect(migrated.x).toBe(0.3);
    expect(migrated.y).toBe(0.7);
  });

  it("preserves label when present", () => {
    const legacy: AttentionPointer = {
      shape: "arrow",
      x: 0.5,
      y: 0.5,
      label: "look here",
    };
    expect(migrateAttentionPointer(legacy).label).toBe("look here");
  });

  it("does not add label key when absent", () => {
    const legacy: AttentionPointer = { shape: "circle", x: 0, y: 0 };
    const migrated = migrateAttentionPointer(legacy);
    expect("label" in migrated).toBe(false);
  });

  it("idempotent — applying twice yields the same result", () => {
    const legacy: AttentionPointer = { shape: "circle", x: 0.3, y: 0.7 };
    const once = migrateAttentionPointer(legacy);
    const twice = migrateAttentionPointer(once);
    expect(twice).toEqual(once);
  });

  it("normalises invalid revealAtSecond to 0", () => {
    const bad: AttentionPointer = {
      shape: "circle",
      x: 0,
      y: 0,
      revealAtSecond: -42,
    };
    expect(migrateAttentionPointer(bad).revealAtSecond).toBe(0);
  });
});
