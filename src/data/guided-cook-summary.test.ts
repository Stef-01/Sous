import { describe, expect, it } from "vitest";
import { guidedCookData, guidedCookMeals } from "./guided-cook-steps";
import {
  getCookSummary,
  getMealCookSummary,
  getAvailableCookSlugs,
  getAvailableMealCookSlugs,
} from "./guided-cook-summary";

/**
 * Drift guard for the codegen'd cook summary. The summary is what Today-side
 * clients import (so the 599KB guided-cook-steps stays off the Today bundle);
 * if guided-cook-steps changes without re-running `pnpm gen:cook-summary`, the
 * summary goes stale and Today shows wrong times/ingredient counts. This test
 * fails loudly in that case.
 */
describe("guided-cook-summary stays in sync with guided-cook-steps", () => {
  it("covers exactly the same side + meal slugs", () => {
    expect(new Set(getAvailableCookSlugs())).toEqual(
      new Set(Object.keys(guidedCookData)),
    );
    expect(new Set(getAvailableMealCookSlugs())).toEqual(
      new Set(Object.keys(guidedCookMeals)),
    );
  });

  it("each side summary matches the source (times + ingredient names)", () => {
    for (const [slug, d] of Object.entries(guidedCookData)) {
      const s = getCookSummary(slug);
      expect(s, `missing summary for side "${slug}"`).not.toBeNull();
      expect(s!.prepTimeMinutes).toBe(d.prepTimeMinutes);
      expect(s!.cookTimeMinutes).toBe(d.cookTimeMinutes);
      expect(s!.ingredientNames).toEqual(d.ingredients.map((i) => i.name));
    }
  });

  it("each meal summary matches the source", () => {
    for (const [slug, d] of Object.entries(guidedCookMeals)) {
      const s = getMealCookSummary(slug);
      expect(s, `missing summary for meal "${slug}"`).not.toBeNull();
      expect(s!.prepTimeMinutes).toBe(d.prepTimeMinutes);
      expect(s!.cookTimeMinutes).toBe(d.cookTimeMinutes);
      expect(s!.ingredientNames).toEqual(d.ingredients.map((i) => i.name));
    }
  });
});
