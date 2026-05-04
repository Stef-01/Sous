import { describe, expect, it } from "vitest";
import {
  computePantryCoverage,
  normaliseIngredientName,
  pantryHasIngredient,
} from "./pantry-coverage";

// ── normaliseIngredientName ───────────────────────────────

describe("normaliseIngredientName — basic", () => {
  it("lowercases", () => {
    expect(normaliseIngredientName("BASIL")).toBe("basil");
  });

  it("trims whitespace", () => {
    expect(normaliseIngredientName("  basil  ")).toBe("basil");
  });

  it("collapses internal whitespace", () => {
    expect(normaliseIngredientName("olive    oil")).toBe("olive oil");
  });

  it("strips punctuation", () => {
    expect(normaliseIngredientName("garlic, minced.")).toBe("garlic");
  });
});

describe("normaliseIngredientName — qualifier stripping", () => {
  it("'fresh basil leaves' → 'basil'", () => {
    expect(normaliseIngredientName("fresh basil leaves")).toBe("basil");
  });

  it("'minced garlic' → 'garlic'", () => {
    expect(normaliseIngredientName("minced garlic")).toBe("garlic");
  });

  it("'extra virgin olive oil' → 'olive oil' (extra + virgin both stripped)", () => {
    expect(normaliseIngredientName("extra virgin olive oil")).toBe("olive oil");
  });

  it("'mincemeat' is NOT mangled by the 'minced' rule (whole-word)", () => {
    expect(normaliseIngredientName("mincemeat")).toBe("mincemeat");
  });

  it("'large eggs' → 'eggs'", () => {
    expect(normaliseIngredientName("large eggs")).toBe("eggs");
  });
});

describe("normaliseIngredientName — quantity stripping", () => {
  it("'2 cups flour' → 'flour'", () => {
    expect(normaliseIngredientName("2 cups flour")).toBe("flour");
  });

  it("'1 tbsp olive oil' → 'olive oil'", () => {
    expect(normaliseIngredientName("1 tbsp olive oil")).toBe("olive oil");
  });

  it("'0.5 cup sugar' → 'sugar'", () => {
    expect(normaliseIngredientName("0.5 cup sugar")).toBe("sugar");
  });

  it("'1/2 cup butter' → 'butter'", () => {
    expect(normaliseIngredientName("1/2 cup butter")).toBe("butter");
  });

  it("leaves untouched names without leading quantity", () => {
    expect(normaliseIngredientName("salt")).toBe("salt");
  });
});

describe("normaliseIngredientName — parens", () => {
  it("strips '(extra virgin)' aside", () => {
    expect(normaliseIngredientName("olive oil (extra virgin)")).toBe(
      "olive oil",
    );
  });

  it("strips parens with multi-word content", () => {
    expect(normaliseIngredientName("tomatoes (heirloom, ripe)")).toBe(
      "tomatoes",
    );
  });
});

// ── pantryHasIngredient ───────────────────────────────────

describe("pantryHasIngredient", () => {
  const pantry = new Set(["basil", "olive oil", "garlic", "lemon"]);

  it("exact normalised match → true", () => {
    expect(pantryHasIngredient("basil", pantry)).toBe(true);
  });

  it("normalised match after stripping → true", () => {
    expect(pantryHasIngredient("fresh basil leaves", pantry)).toBe(true);
  });

  it("substring: pantry contains shorter form, recipe asks for longer", () => {
    expect(pantryHasIngredient("lemon zest", pantry)).toBe(true);
  });

  it("substring: pantry contains longer form, recipe asks for shorter", () => {
    const longerPantry = new Set(["fresh basil leaves"]);
    expect(pantryHasIngredient("basil", longerPantry)).toBe(true);
  });

  it("missing ingredient → false", () => {
    expect(pantryHasIngredient("saffron", pantry)).toBe(false);
  });

  it("empty pantry → false", () => {
    expect(pantryHasIngredient("anything", new Set())).toBe(false);
  });

  it("empty ingredient name → false", () => {
    expect(pantryHasIngredient("", pantry)).toBe(false);
  });
});

// ── computePantryCoverage ─────────────────────────────────

describe("computePantryCoverage — counts", () => {
  const pantry = new Set(["basil", "olive oil", "garlic", "tomatoes"]);

  it("all required present → coverage 1.0", () => {
    const recipe = {
      ingredients: [
        { name: "basil" },
        { name: "olive oil" },
        { name: "garlic" },
      ],
    };
    const out = computePantryCoverage(recipe, pantry);
    expect(out.haveCount).toBe(3);
    expect(out.totalCount).toBe(3);
    expect(out.coverage).toBe(1.0);
    expect(out.missingNames).toEqual([]);
  });

  it("partial coverage → fractional", () => {
    const recipe = {
      ingredients: [
        { name: "basil" },
        { name: "saffron" },
        { name: "olive oil" },
        { name: "anchovies" },
      ],
    };
    const out = computePantryCoverage(recipe, pantry);
    expect(out.haveCount).toBe(2);
    expect(out.totalCount).toBe(4);
    expect(out.coverage).toBe(0.5);
    expect(out.missingNames).toContain("saffron");
    expect(out.missingNames).toContain("anchovies");
  });

  it("none present → 0", () => {
    const recipe = {
      ingredients: [{ name: "saffron" }, { name: "truffle" }],
    };
    const out = computePantryCoverage(recipe, pantry);
    expect(out.haveCount).toBe(0);
    expect(out.coverage).toBe(0);
  });
});

describe("computePantryCoverage — optional ingredients", () => {
  const pantry = new Set(["basil", "olive oil"]);

  it("optional excluded from numerator AND denominator", () => {
    const recipe = {
      ingredients: [
        { name: "basil" },
        { name: "olive oil" },
        { name: "parmesan", optional: true },
      ],
    };
    const out = computePantryCoverage(recipe, pantry);
    expect(out.haveCount).toBe(2);
    expect(out.totalCount).toBe(2);
    expect(out.coverage).toBe(1.0);
  });

  it("missing-optional doesn't count as missing", () => {
    const recipe = {
      ingredients: [{ name: "basil" }, { name: "saffron", optional: true }],
    };
    const out = computePantryCoverage(recipe, pantry);
    expect(out.missingNames).toEqual([]);
  });
});

describe("computePantryCoverage — edge cases", () => {
  const pantry = new Set(["basil"]);

  it("empty ingredients list → coverage 0 (no NaN)", () => {
    const out = computePantryCoverage({ ingredients: [] }, pantry);
    expect(out.totalCount).toBe(0);
    expect(out.coverage).toBe(0);
    expect(Number.isFinite(out.coverage)).toBe(true);
  });

  it("only optional ingredients → coverage 0 (no NaN)", () => {
    const out = computePantryCoverage(
      { ingredients: [{ name: "basil", optional: true }] },
      pantry,
    );
    expect(out.totalCount).toBe(0);
    expect(out.coverage).toBe(0);
    expect(Number.isFinite(out.coverage)).toBe(true);
  });

  it("array form of pantry (not Set) — auto-normalised", () => {
    const out = computePantryCoverage({ ingredients: [{ name: "basil" }] }, [
      "BASIL",
      "Garlic",
    ]);
    expect(out.haveCount).toBe(1);
  });

  it("recipe ingredient with full quantity prefix", () => {
    const out = computePantryCoverage(
      { ingredients: [{ name: "2 cups fresh basil leaves" }] },
      pantry,
    );
    expect(out.haveCount).toBe(1);
    expect(out.coverage).toBe(1.0);
  });
});
