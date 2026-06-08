import { describe, expect, it } from "vitest";
import {
  countActiveFilters,
  coerceQuestFilterState,
  cookTimeCapMinutes,
  type QuestFilterState,
} from "./use-quest-filters";

const DEFAULT: QuestFilterState = {
  cookTime: "any",
  cuisine: "any",
  mealType: "any",
  role: "main",
};

describe("countActiveFilters (Today Filter — Phase B)", () => {
  it("default state has zero active filters", () => {
    expect(countActiveFilters(DEFAULT)).toBe(0);
  });

  it("counts each non-default facet", () => {
    expect(countActiveFilters({ ...DEFAULT, cuisine: "italian" })).toBe(1);
    expect(countActiveFilters({ ...DEFAULT, mealType: "breakfast" })).toBe(1);
    expect(countActiveFilters({ ...DEFAULT, role: "side" })).toBe(1);
    expect(countActiveFilters({ ...DEFAULT, cookTime: "30" })).toBe(1);
    expect(
      countActiveFilters({
        cookTime: "30",
        cuisine: "thai",
        mealType: "dinner",
        role: "drink",
      }),
    ).toBe(4);
  });

  it("treats role 'main' + mealType 'any' as the no-op defaults", () => {
    expect(
      countActiveFilters({ ...DEFAULT, role: "main", mealType: "any" }),
    ).toBe(0);
  });
});

describe("coerceQuestFilterState — back-compat / corruption guard", () => {
  it("empty / null → defaults (older v1 state had no mealType/role)", () => {
    expect(coerceQuestFilterState({})).toEqual(DEFAULT);
    expect(coerceQuestFilterState(null)).toEqual(DEFAULT);
    expect(
      coerceQuestFilterState({ cookTime: "30", cuisine: "italian" }),
    ).toEqual({
      cookTime: "30",
      cuisine: "italian",
      mealType: "any",
      role: "main",
    });
  });

  it("corrupt enum values fall back to defaults", () => {
    expect(
      coerceQuestFilterState({ mealType: "brunch", role: "dessert" }),
    ).toEqual(DEFAULT);
    expect(coerceQuestFilterState({ role: "side", mealType: "lunch" })).toEqual(
      {
        cookTime: "any",
        cuisine: "any",
        mealType: "lunch",
        role: "side",
      },
    );
  });
});

describe("cookTimeCapMinutes (unchanged)", () => {
  it("maps to a numeric cap", () => {
    expect(cookTimeCapMinutes("any")).toBe(Number.POSITIVE_INFINITY);
    expect(cookTimeCapMinutes("30")).toBe(30);
  });
});
