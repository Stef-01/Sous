import { describe, expect, it } from "vitest";
import { goesStraightToCook, primaryActionLabel } from "./quest-pool";

// Pins the deck's primary-action LABEL to where the button actually routes
// (quest-card's routeDish), so "Cook" can never again lie about opening the
// side-picker. See APP-FRICTION-AUDIT P1 "Deck 'Cook' opens a side-picker".

describe("goesStraightToCook", () => {
  it("true only for a guided-cook NON-main (side that has cook steps)", () => {
    expect(goesStraightToCook({ hasGuidedCook: true, isMeal: false })).toBe(
      true,
    );
  });
  it("false for a main, even with cook steps (mains build a plate first)", () => {
    expect(goesStraightToCook({ hasGuidedCook: true, isMeal: true })).toBe(
      false,
    );
  });
  it("false for a side with no cook steps (routes to /sides)", () => {
    expect(goesStraightToCook({ hasGuidedCook: false, isMeal: false })).toBe(
      false,
    );
  });
});

describe("primaryActionLabel", () => {
  it("eat-out → 'Log it'", () => {
    expect(
      primaryActionLabel({
        hasGuidedCook: false,
        isMeal: true,
        eatOut: { venueName: "X", distanceKm: 1, price: "$", kcal: 500 },
      }),
    ).toBe("Log it");
  });
  it("guided side → 'Cook' (matches the straight-to-/cook route)", () => {
    expect(primaryActionLabel({ hasGuidedCook: true, isMeal: false })).toBe(
      "Cook",
    );
  });
  it("main → 'Build plate' (matches the /sides route — no verb lie)", () => {
    expect(primaryActionLabel({ hasGuidedCook: true, isMeal: true })).toBe(
      "Build plate",
    );
  });
  it("no-cook side → 'Build plate' (also routes to /sides)", () => {
    expect(primaryActionLabel({ hasGuidedCook: false, isMeal: false })).toBe(
      "Build plate",
    );
  });
});
