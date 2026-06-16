import { describe, expect, it } from "vitest";
import {
  countActiveFilters,
  coerceQuestFilterState,
  cookTimeCapMinutes,
  toggleInArray,
  toggleSourceFacet,
  type QuestFilterState,
} from "./use-quest-filters";

const DEFAULT: QuestFilterState = {
  cookTime: "any",
  cuisines: [],
  mealTypes: [],
  roles: ["main"],
  source: [],
};

describe("countActiveFilters (Today Filter)", () => {
  it("default state (mains-only) has zero active filters", () => {
    expect(countActiveFilters(DEFAULT)).toBe(0);
  });

  it("counts each non-default facet (multi-select counts once when non-empty)", () => {
    expect(countActiveFilters({ ...DEFAULT, cuisines: ["italian"] })).toBe(1);
    expect(countActiveFilters({ ...DEFAULT, mealTypes: ["breakfast"] })).toBe(
      1,
    );
    expect(countActiveFilters({ ...DEFAULT, roles: ["side"] })).toBe(1);
    expect(countActiveFilters({ ...DEFAULT, roles: ["main", "side"] })).toBe(1);
    expect(countActiveFilters({ ...DEFAULT, roles: [] })).toBe(1); // empty ≠ default
    expect(countActiveFilters({ ...DEFAULT, cookTime: "30" })).toBe(1);
    expect(countActiveFilters({ ...DEFAULT, source: ["chef-tu"] })).toBe(1);
    expect(
      countActiveFilters({ ...DEFAULT, cuisines: ["thai", "italian"] }),
    ).toBe(1);
    expect(
      countActiveFilters({
        cookTime: "30",
        cuisines: ["thai"],
        mealTypes: ["dinner"],
        roles: ["drink"],
        source: ["nourish-verified", "stefan"],
      }),
    ).toBe(5);
  });
});

describe("toggleInArray / toggleSourceFacet", () => {
  it("adds, removes, and is order-preserving", () => {
    expect(toggleInArray<string>([], "a")).toEqual(["a"]);
    expect(toggleInArray(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleInArray(["a", "b"], "a")).toEqual(["b"]);
    // source uses the same generic toggle.
    expect(toggleSourceFacet(["stefan"], "chef-tu")).toEqual([
      "stefan",
      "chef-tu",
    ]);
  });
});

describe("coerceQuestFilterState — back-compat / corruption guard", () => {
  it("empty / null → defaults (mains-only)", () => {
    expect(coerceQuestFilterState({})).toEqual(DEFAULT);
    expect(coerceQuestFilterState(null)).toEqual(DEFAULT);
  });

  it("corrupt enum values fall back to defaults", () => {
    // bad mealType → []; bad role → [] → mains-only fallback.
    expect(
      coerceQuestFilterState({ mealType: "brunch", role: "dessert" }),
    ).toEqual(DEFAULT);
  });

  it("migrates legacy single-select role / cuisine / meal type", () => {
    expect(coerceQuestFilterState({ role: "side" }).roles).toEqual(["side"]);
    expect(coerceQuestFilterState({ cuisine: "italian" }).cuisines).toEqual([
      "italian",
    ]);
    expect(coerceQuestFilterState({ cuisine: "any" }).cuisines).toEqual([]);
    expect(coerceQuestFilterState({ mealType: "dinner" }).mealTypes).toEqual([
      "dinner",
    ]);
    expect(coerceQuestFilterState({ mealType: "any" }).mealTypes).toEqual([]);
  });

  it("accepts multi-select arrays and drops junk", () => {
    const s = coerceQuestFilterState({
      roles: ["main", "side", "bogus"],
      cuisines: ["thai", "italian"],
      mealTypes: ["lunch", "brunch"],
      source: ["stefan", "bogus", "chef-tu"],
    });
    expect(s.roles).toEqual(["main", "side"]);
    expect(s.cuisines).toEqual(["thai", "italian"]);
    expect(s.mealTypes).toEqual(["lunch"]);
    expect(s.source).toEqual(["stefan", "chef-tu"]);
  });

  it("still migrates the legacy single-select source string", () => {
    expect(coerceQuestFilterState({ source: "any" }).source).toEqual([]);
    expect(coerceQuestFilterState({ source: "chef-tu" }).source).toEqual([
      "chef-tu",
    ]);
  });
});

describe("cookTimeCapMinutes (unchanged)", () => {
  it("maps to a numeric cap", () => {
    expect(cookTimeCapMinutes("any")).toBe(Number.POSITIVE_INFINITY);
    expect(cookTimeCapMinutes("30")).toBe(30);
  });
});
