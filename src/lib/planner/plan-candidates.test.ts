import { describe, expect, it } from "vitest";
import { catalogCandidates } from "./plan-candidates";
import {
  getAvailableCookSlugs,
  getAvailableMealCookSlugs,
} from "@/data/guided-cook-summary";

// Every slug that `/cook/[slug]` can actually resolve to a guided cook — the
// union the page's `hasGuidedCook` filter is derived from.
const RESOLVABLE = new Set([
  ...getAvailableCookSlugs(),
  ...getAvailableMealCookSlugs(),
]);

describe("catalogCandidates", () => {
  it("returns a non-empty pool even with an empty pantry (discovery surface, not pantry-gated)", () => {
    // The planner is a weekly-discovery surface; an empty pantry must NOT empty
    // it (the old 'empty on first run' bug).
    expect(catalogCandidates([]).length).toBeGreaterThan(0);
  });

  it("returns a non-empty pool for a stocked pantry", () => {
    const pantry = ["tofu", "rice", "garlic", "egg", "chicken", "tomato"];
    expect(catalogCandidates(pantry).length).toBeGreaterThan(0);
  });

  it("every candidate slug resolves to a real guided-cook recipe (the 0/16 regression guard)", () => {
    // The original bug slugified pattern NAMES → 0/16 ever resolved → every
    // planned meal dead-ended on 'Cook now'. This asserts the inverse: 100% of
    // candidate slugs resolve to a cookable recipe.
    const dead = catalogCandidates([])
      .map((c) => c.recipeSlug)
      .filter((slug) => !RESOLVABLE.has(slug));
    expect(dead).toEqual([]);
  });

  it("emits clean, unique catalog ids (no spaces, lowercase, no dupes)", () => {
    const slugs = catalogCandidates([]).map((c) => c.recipeSlug);
    for (const s of slugs) {
      expect(s.length).toBeGreaterThan(0);
      expect(s).toBe(s.toLowerCase());
      expect(s).not.toMatch(/\s/);
    }
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("carries the display fields the swipe card needs", () => {
    const [first] = catalogCandidates([]);
    expect(first).toBeDefined();
    expect(first.title.length).toBeGreaterThan(0);
    expect(first.cuisineFamily.length).toBeGreaterThan(0);
    expect(Array.isArray(first.ingredients)).toBe(true);
  });
});
