import { describe, expect, it } from "vitest";
import { ANCHOR_NEAR_WINDOW, pickPeakEndAnchor } from "./peak-end-anchor";

describe("pickPeakEndAnchor — empty history (cold start)", () => {
  it("first cook → new-peak variant", () => {
    const out = pickPeakEndAnchor(82, []);
    expect(out.variant).toBe("new-peak");
  });

  it("first cook → copy includes today's score", () => {
    const out = pickPeakEndAnchor(82, []);
    expect(out.copy).toContain("82");
  });

  it("first cook with score 0 → still new-peak", () => {
    const out = pickPeakEndAnchor(0, []);
    expect(out.variant).toBe("new-peak");
  });
});

describe("pickPeakEndAnchor — new personal best", () => {
  it("today > prior best → new-peak with both numbers", () => {
    const out = pickPeakEndAnchor(95, [70, 80, 88]);
    expect(out.variant).toBe("new-peak");
    expect(out.copy).toContain("95");
    expect(out.copy).toContain("88");
  });

  it("today == prior best → new-peak (tied) variant", () => {
    const out = pickPeakEndAnchor(88, [70, 80, 88]);
    expect(out.variant).toBe("new-peak");
    expect(out.copy.toLowerCase()).toContain("tied");
  });
});

describe("pickPeakEndAnchor — near-peak band", () => {
  it("today within ANCHOR_NEAR_WINDOW of personal best → near-peak", () => {
    const best = 88;
    const out = pickPeakEndAnchor(best - ANCHOR_NEAR_WINDOW, [70, 80, best]);
    expect(out.variant).toBe("near-peak");
  });

  it("near-peak copy references the personal best", () => {
    const out = pickPeakEndAnchor(85, [70, 80, 88]);
    expect(out.variant).toBe("near-peak");
    expect(out.anchorScore).toBe(88);
    expect(out.copy).toContain("85");
  });

  it("near-peak boundary: gap of exactly 5 → near-peak (inclusive)", () => {
    const out = pickPeakEndAnchor(83, [88]);
    expect(out.variant).toBe("near-peak");
  });

  it("near-peak boundary: gap of 6 → regular (exclusive past window)", () => {
    const out = pickPeakEndAnchor(82, [88]);
    expect(out.variant).toBe("regular");
  });
});

describe("pickPeakEndAnchor — regular", () => {
  it("today well below personal best → regular variant", () => {
    const out = pickPeakEndAnchor(60, [70, 80, 88]);
    expect(out.variant).toBe("regular");
    expect(out.anchorScore).toBeUndefined();
  });

  it("regular copy includes today's score", () => {
    const out = pickPeakEndAnchor(60, [88]);
    expect(out.copy).toContain("60");
  });
});

describe("pickPeakEndAnchor — defensive", () => {
  it("NaN today → treated as 0", () => {
    const out = pickPeakEndAnchor(Number.NaN, [80]);
    expect(out.variant).toBe("regular");
  });

  it("non-finite history entries → ignored", () => {
    const out = pickPeakEndAnchor(85, [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      88,
    ]);
    expect(out.variant).toBe("near-peak");
    expect(out.anchorScore).toBe(88);
  });

  it("today rounds to integer for the copy", () => {
    const out = pickPeakEndAnchor(82.4, []);
    expect(out.copy).toContain("82");
    expect(out.copy).not.toContain("82.4");
  });

  it("ANCHOR_NEAR_WINDOW is 5 (per the plan)", () => {
    expect(ANCHOR_NEAR_WINDOW).toBe(5);
  });
});

describe("pickPeakEndAnchor — determinism", () => {
  it("same inputs → same output", () => {
    const a = pickPeakEndAnchor(85, [70, 88]);
    const b = pickPeakEndAnchor(85, [70, 88]);
    expect(a).toEqual(b);
  });
});
