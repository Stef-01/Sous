import { describe, it, expect } from "vitest";
import { computePantryFit, decideSwipe, exitDistanceFor } from "./quest-card";
import { normalizePantryName } from "@/lib/hooks/use-pantry";

describe("computePantryFit", () => {
  it("returns 0 when ingredient list is empty", () => {
    expect(computePantryFit([], new Set(["salt"]))).toBe(0);
  });

  it("returns 0 when pantry is empty", () => {
    expect(computePantryFit(["salt", "pepper"], new Set())).toBe(0);
  });

  it("computes fraction of ingredients present in pantry", () => {
    const ingredients = ["salt", "pepper", "olive oil", "garlic"].map(
      normalizePantryName,
    );
    const pantry = new Set(["salt", "pepper"].map(normalizePantryName));
    expect(computePantryFit(ingredients, pantry)).toBe(0.5);
  });

  it("hits 100% when every ingredient is in the pantry", () => {
    const ingredients = ["rice", "scallion"].map(normalizePantryName);
    const pantry = new Set(["rice", "scallion"].map(normalizePantryName));
    expect(computePantryFit(ingredients, pantry)).toBe(1);
  });

  it("is case- and whitespace-insensitive via normalized input", () => {
    const ingredients = ["Olive Oil", "  Garlic  "].map(normalizePantryName);
    const pantry = new Set(["olive oil", "garlic"].map(normalizePantryName));
    expect(computePantryFit(ingredients, pantry)).toBe(1);
  });
});

describe("decideSwipe — Tinder-grade commit logic", () => {
  it("returns null when both offset and velocity are below threshold", () => {
    expect(decideSwipe(50, 100)).toBe(null);
    expect(decideSwipe(-79, -499)).toBe(null);
  });

  it("commits right via offset alone (slow drag past threshold)", () => {
    expect(decideSwipe(120, 50)).toBe("right");
  });

  it("commits left via offset alone", () => {
    expect(decideSwipe(-150, -100)).toBe("left");
  });

  it("commits right via velocity flick even when offset is small", () => {
    // The whole point: a fast right-flick across only 30px commits.
    expect(decideSwipe(30, 800)).toBe("right");
  });

  it("commits left via velocity flick", () => {
    expect(decideSwipe(-20, -750)).toBe("left");
  });

  it("trusts velocity direction when velocity dominates", () => {
    // User flicked right but their finger ended slightly to the
    // left of center — Tinder honours the flick, not the resting
    // position.
    expect(decideSwipe(-10, 900)).toBe("right");
    expect(decideSwipe(15, -700)).toBe("left");
  });

  it("falls back to offset direction when only offset triggers", () => {
    expect(decideSwipe(100, 0)).toBe("right");
    expect(decideSwipe(-100, 0)).toBe("left");
  });

  it("treats zero motion as a no-op", () => {
    expect(decideSwipe(0, 0)).toBe(null);
  });
});

describe("exitDistanceFor — velocity-preserving exit", () => {
  it("returns 0 when no direction is committed", () => {
    expect(exitDistanceFor(null, 800)).toBe(0);
  });

  it("returns the base ±320 distance when no flick velocity", () => {
    expect(exitDistanceFor("right", 0)).toBe(320);
    expect(exitDistanceFor("left", 0)).toBe(-320);
  });

  it("adds a velocity boost in the swipe direction", () => {
    // 800 px/s flick → 800 * 0.18 = 144 px boost
    expect(exitDistanceFor("right", 800)).toBe(320 + 144);
    expect(exitDistanceFor("left", -800)).toBe(-320 - 144);
  });

  it("clamps the velocity boost so a wild flick can't fly off-screen", () => {
    // 5000 px/s would naively project to 900 px boost; clamped to 200.
    expect(exitDistanceFor("right", 5000)).toBe(320 + 200);
    expect(exitDistanceFor("left", -5000)).toBe(-320 - 200);
  });

  it("uses absolute velocity for the boost (sign comes from direction)", () => {
    // The "user flicked right but velocityX is negative" edge case:
    // direction is the source of truth for sign.
    expect(exitDistanceFor("right", -400)).toBe(320 + 72);
    expect(exitDistanceFor("left", 400)).toBe(-320 - 72);
  });
});
