import { describe, expect, it } from "vitest";
import {
  countActiveFilters,
  coerceQuestFilterState,
  cookTimeCapMinutes,
  toggleSourceFacet,
  type QuestFilterState,
} from "./use-quest-filters";

const DEFAULT: QuestFilterState = {
  cookTime: "any",
  cuisine: "any",
  mealType: "any",
  role: "main",
  source: [],
};

describe("countActiveFilters (Today Filter)", () => {
  it("default state has zero active filters", () => {
    expect(countActiveFilters(DEFAULT)).toBe(0);
  });

  it("counts each non-default facet (source counts once when non-empty)", () => {
    expect(countActiveFilters({ ...DEFAULT, cuisine: "italian" })).toBe(1);
    expect(countActiveFilters({ ...DEFAULT, mealType: "breakfast" })).toBe(1);
    expect(countActiveFilters({ ...DEFAULT, role: "side" })).toBe(1);
    expect(countActiveFilters({ ...DEFAULT, cookTime: "30" })).toBe(1);
    expect(countActiveFilters({ ...DEFAULT, source: ["chef-tu"] })).toBe(1);
    expect(
      countActiveFilters({ ...DEFAULT, source: ["chef-tu", "stefan"] }),
    ).toBe(1);
    expect(
      countActiveFilters({
        cookTime: "30",
        cuisine: "thai",
        mealType: "dinner",
        role: "drink",
        source: ["nourish-verified", "stefan"],
      }),
    ).toBe(5);
  });
});

describe("toggleSourceFacet", () => {
  it("adds, removes, and is order-preserving", () => {
    expect(toggleSourceFacet([], "stefan")).toEqual(["stefan"]);
    expect(toggleSourceFacet(["stefan"], "chef-tu")).toEqual([
      "stefan",
      "chef-tu",
    ]);
    expect(toggleSourceFacet(["stefan", "chef-tu"], "stefan")).toEqual([
      "chef-tu",
    ]);
  });
});

describe("coerceQuestFilterState — back-compat / corruption guard", () => {
  it("empty / null → defaults", () => {
    expect(coerceQuestFilterState({})).toEqual(DEFAULT);
    expect(coerceQuestFilterState(null)).toEqual(DEFAULT);
  });

  it("corrupt enum values fall back to defaults", () => {
    expect(
      coerceQuestFilterState({ mealType: "brunch", role: "dessert" }),
    ).toEqual(DEFAULT);
  });

  it("migrates the legacy single-select source string", () => {
    // Old persisted state used source: "any" | "chef-tu" | …
    expect(coerceQuestFilterState({ source: "any" }).source).toEqual([]);
    expect(coerceQuestFilterState({ source: "chef-tu" }).source).toEqual([
      "chef-tu",
    ]);
    expect(coerceQuestFilterState({ source: "bogus" }).source).toEqual([]);
  });

  it("accepts a multi-select source array and drops junk", () => {
    expect(
      coerceQuestFilterState({ source: ["stefan", "bogus", "chef-tu"] }).source,
    ).toEqual(["stefan", "chef-tu"]);
  });
});

describe("cookTimeCapMinutes (unchanged)", () => {
  it("maps to a numeric cap", () => {
    expect(cookTimeCapMinutes("any")).toBe(Number.POSITIVE_INFINITY);
    expect(cookTimeCapMinutes("30")).toBe(30);
  });
});
