import { describe, expect, it } from "vitest";
import { getActivePointers, nextRevealTime } from "./pointer-sequence";
import type { AttentionPointer } from "./attention-pointer";

function ptr(
  revealAtSecond: number | undefined,
  label?: string,
): AttentionPointer {
  return {
    shape: "circle",
    x: 0,
    y: 0,
    ...(label !== undefined ? { label } : {}),
    ...(revealAtSecond !== undefined ? { revealAtSecond } : {}),
  };
}

// ── getActivePointers — empty / edge cases ────────────────

describe("getActivePointers — empty / edge", () => {
  it("empty pointers → empty output", () => {
    expect(getActivePointers([], 10)).toEqual([]);
  });

  it("negative elapsed → treated as 0", () => {
    const pointers = [ptr(0, "a"), ptr(5, "b")];
    const out = getActivePointers(pointers, -3);
    expect(out.map((p) => p.label)).toEqual(["a"]);
  });

  it("NaN elapsed → treated as 0", () => {
    const pointers = [ptr(0, "a"), ptr(5, "b")];
    const out = getActivePointers(pointers, Number.NaN);
    expect(out.map((p) => p.label)).toEqual(["a"]);
  });

  it("Infinity elapsed → treated as 0 (defensive)", () => {
    // Infinity is technically not finite; we collapse to 0
    // rather than show every pointer. Trade-off: surface bugs
    // visibly rather than silently mass-revealing.
    const pointers = [ptr(0, "a"), ptr(60, "b")];
    const out = getActivePointers(pointers, Number.POSITIVE_INFINITY);
    expect(out.map((p) => p.label)).toEqual(["a"]);
  });
});

describe("getActivePointers — all-immediate (legacy)", () => {
  it("legacy pointers (no revealAtSecond) → all visible at t=0", () => {
    const pointers = [ptr(undefined, "a"), ptr(undefined, "b")];
    expect(getActivePointers(pointers, 0).length).toBe(2);
  });

  it("mix of legacy + sequenced — legacy renders at t=0", () => {
    const pointers = [ptr(undefined, "instant"), ptr(5, "delayed")];
    const out = getActivePointers(pointers, 0);
    expect(out.map((p) => p.label)).toEqual(["instant"]);
  });
});

// ── getActivePointers — sequenced reveal matrix ──────────

describe("getActivePointers — sequenced reveal", () => {
  const pointers = [ptr(0, "t0"), ptr(3, "t3"), ptr(7, "t7"), ptr(15, "t15")];

  it("t=0 → only t=0 visible", () => {
    expect(getActivePointers(pointers, 0).map((p) => p.label)).toEqual(["t0"]);
  });

  it("t=2.9 → only t=0", () => {
    expect(getActivePointers(pointers, 2.9).map((p) => p.label)).toEqual([
      "t0",
    ]);
  });

  it("t=3 → t=0 + t=3 (inclusive boundary)", () => {
    expect(getActivePointers(pointers, 3).map((p) => p.label)).toEqual([
      "t0",
      "t3",
    ]);
  });

  it("t=10 → t=0 + t=3 + t=7", () => {
    expect(getActivePointers(pointers, 10).map((p) => p.label)).toEqual([
      "t0",
      "t3",
      "t7",
    ]);
  });

  it("t=20 → all four visible", () => {
    expect(getActivePointers(pointers, 20).length).toBe(4);
  });
});

describe("getActivePointers — output order", () => {
  it("output is sorted by reveal time even when input is not", () => {
    const pointers = [ptr(7, "late"), ptr(0, "first"), ptr(3, "middle")];
    expect(getActivePointers(pointers, 100).map((p) => p.label)).toEqual([
      "first",
      "middle",
      "late",
    ]);
  });

  it("ties keep input order (stable sort)", () => {
    const pointers = [ptr(5, "a"), ptr(5, "b"), ptr(5, "c")];
    expect(getActivePointers(pointers, 5).map((p) => p.label)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});

describe("getActivePointers — persist mode", () => {
  const pointers = [ptr(0, "first"), ptr(5, "second"), ptr(10, "third")];

  it("persist=true (default): once revealed, stays", () => {
    const out = getActivePointers(pointers, 10);
    expect(out.length).toBe(3);
  });

  it("persist=false (carousel): only latest revealed shown", () => {
    const out = getActivePointers(pointers, 10, { persist: false });
    expect(out.map((p) => p.label)).toEqual(["third"]);
  });

  it("persist=false: at t=5, shows only t=5 pointer", () => {
    const out = getActivePointers(pointers, 5, { persist: false });
    expect(out.map((p) => p.label)).toEqual(["second"]);
  });

  it("persist=false: at t=0, shows only t=0 pointer", () => {
    const out = getActivePointers(pointers, 0, { persist: false });
    expect(out.map((p) => p.label)).toEqual(["first"]);
  });

  it("persist=false + ties → all tied pointers shown together", () => {
    const tied = [ptr(0, "a"), ptr(5, "b"), ptr(5, "c")];
    expect(
      getActivePointers(tied, 5, { persist: false }).map((p) => p.label),
    ).toEqual(["b", "c"]);
  });

  it("persist=false + nothing revealed yet → empty", () => {
    const out = getActivePointers([ptr(5, "later")], 0, { persist: false });
    expect(out).toEqual([]);
  });
});

// ── nextRevealTime ────────────────────────────────────────

describe("nextRevealTime", () => {
  const pointers = [ptr(0, "a"), ptr(3, "b"), ptr(7, "c")];

  it("at t=0 → next is 3", () => {
    expect(nextRevealTime(pointers, 0)).toBe(3);
  });

  it("at t=3 → next is 7 (current 3 already revealed)", () => {
    expect(nextRevealTime(pointers, 3)).toBe(7);
  });

  it("at t=10 (all revealed) → null", () => {
    expect(nextRevealTime(pointers, 10)).toBe(null);
  });

  it("empty pointers → null", () => {
    expect(nextRevealTime([], 0)).toBe(null);
  });

  it("legacy pointers (revealAtSecond unset) → null when at t=0+", () => {
    // Legacy bucket as 0; if all are 0, none are "future".
    expect(nextRevealTime([ptr(undefined, "a")], 0)).toBe(null);
  });

  it("returns the SMALLEST future reveal time, not just first found", () => {
    const out = nextRevealTime([ptr(15, "late"), ptr(5, "early")], 0);
    expect(out).toBe(5);
  });
});

// ── immutability ──────────────────────────────────────────

describe("getActivePointers — immutability", () => {
  it("returns a new array, does not mutate input", () => {
    const pointers = [ptr(0, "a"), ptr(5, "b")];
    const before = JSON.stringify(pointers);
    const out = getActivePointers(pointers, 100);
    expect(out).not.toBe(pointers);
    expect(JSON.stringify(pointers)).toBe(before);
  });
});
