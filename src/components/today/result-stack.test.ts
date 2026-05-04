import { describe, it, expect } from "vitest";
import { buildSideMetaLine, nutritionScoreToStars } from "./result-stack";

describe("buildSideMetaLine — single-line side metadata", () => {
  it("composes cuisine · effort when no tags", () => {
    expect(
      buildSideMetaLine({
        cuisineFamily: "Italian",
        tags: [],
        effortLabel: "Easy",
      }),
    ).toBe("italian · easy");
  });

  it("emits up to 2 flavor descriptors between cuisine + effort", () => {
    expect(
      buildSideMetaLine({
        cuisineFamily: "Thai",
        tags: ["sour", "fresh"],
        effortLabel: "Easy",
      }),
    ).toBe("thai · sour · fresh · easy");
  });

  it("caps at 2 flavor tags even when more are provided", () => {
    expect(
      buildSideMetaLine({
        cuisineFamily: "Mexican",
        tags: ["spicy", "fresh", "smoky", "bright"],
        effortLabel: "Medium",
      }),
    ).toBe("mexican · spicy · fresh · medium");
  });

  it("dedups tags that echo the cuisine family (case-insensitive)", () => {
    // The catalog tags often include the cuisine name itself
    // ("Italian" appears in tags). Filtering avoids the visible
    // "italian · italian · …" duplicate.
    expect(
      buildSideMetaLine({
        cuisineFamily: "Italian",
        tags: ["italian", "salad"],
        effortLabel: "Easy",
      }),
    ).toBe("italian · salad · easy");
  });

  it("dedups even when the cuisine family casing differs", () => {
    expect(
      buildSideMetaLine({
        cuisineFamily: "ITALIAN",
        tags: ["Italian", "warm"],
        effortLabel: "Easy",
      }),
    ).toBe("italian · warm · easy");
  });

  it("filters out tags that aren't plain lowercase words (icons / unicode)", () => {
    expect(
      buildSideMetaLine({
        cuisineFamily: "Japanese",
        tags: ["🌶️ spicy", "Vegetarian", "umami", "30+ min"],
        effortLabel: "Medium",
      }),
    ).toBe("japanese · vegetarian · umami · medium");
  });

  it("trims whitespace on tags", () => {
    expect(
      buildSideMetaLine({
        cuisineFamily: "Korean",
        tags: ["  spicy  ", "fresh"],
        effortLabel: "Easy",
      }),
    ).toBe("korean · spicy · fresh · easy");
  });

  it("defensive: undefined tags becomes empty list", () => {
    expect(
      buildSideMetaLine({
        cuisineFamily: "French",
        tags: undefined,
        effortLabel: "Worth it",
      }),
    ).toBe("french · worth it");
  });

  it("defensive: non-array tags treated as empty", () => {
    expect(
      buildSideMetaLine({
        cuisineFamily: "Greek",
        tags: "salad" as unknown as string[],
        effortLabel: "Easy",
      }),
    ).toBe("greek · easy");
  });

  it("defensive: non-string entries inside the array are dropped", () => {
    expect(
      buildSideMetaLine({
        cuisineFamily: "Indian",
        tags: [
          "warm",
          null as unknown as string,
          undefined as unknown as string,
          "spicy",
        ],
        effortLabel: "Easy",
      }),
    ).toBe("indian · warm · spicy · easy");
  });

  it("preserves hyphenated descriptors (e.g. 'one-pan')", () => {
    expect(
      buildSideMetaLine({
        cuisineFamily: "American",
        tags: ["one-pan", "comfort"],
        effortLabel: "Easy",
      }),
    ).toBe("american · one-pan · comfort · easy");
  });

  it("entire line is lowercase for visual consistency", () => {
    const out = buildSideMetaLine({
      cuisineFamily: "Italian",
      tags: ["FRESH"],
      effortLabel: "EASY",
    });
    expect(out).toBe(out.toLowerCase());
  });
});

describe("nutritionScoreToStars — 0..1 → 0..5 integer mapping", () => {
  it("maps 0 to 0 stars (no fill)", () => {
    expect(nutritionScoreToStars(0)).toBe(0);
  });

  it("maps 1 to 5 stars (full)", () => {
    expect(nutritionScoreToStars(1)).toBe(5);
  });

  it("rounds 0.5 to 3 (Math.round half-up for positive)", () => {
    expect(nutritionScoreToStars(0.5)).toBe(3);
  });

  it("rounds 0.4 down to 2", () => {
    expect(nutritionScoreToStars(0.4)).toBe(2);
  });

  it("rounds 0.9 up to 5", () => {
    expect(nutritionScoreToStars(0.9)).toBe(5);
  });

  it("clamps scores above 1 to 5", () => {
    expect(nutritionScoreToStars(1.5)).toBe(5);
    expect(nutritionScoreToStars(99)).toBe(5);
  });

  it("clamps negative scores to 0", () => {
    expect(nutritionScoreToStars(-0.3)).toBe(0);
    expect(nutritionScoreToStars(-99)).toBe(0);
  });

  it("returns 0 for NaN / Infinity (defensive — never NaN in aria)", () => {
    expect(nutritionScoreToStars(Number.NaN)).toBe(0);
    expect(nutritionScoreToStars(Number.POSITIVE_INFINITY)).toBe(0);
    expect(nutritionScoreToStars(Number.NEGATIVE_INFINITY)).toBe(0);
  });

  it("returns 0 for undefined input cast through (defensive)", () => {
    expect(nutritionScoreToStars(undefined as unknown as number)).toBe(0);
  });
});
