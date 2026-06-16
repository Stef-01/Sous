import { describe, expect, it } from "vitest";
import {
  buildSourceFacetOptions,
  coerceSourceFacets,
  getRecipeSource,
  isSourceFacet,
  matchesSourceFilters,
  type SourceFacet,
} from "./dish-source";

describe("getRecipeSource", () => {
  it("maps Stefan-curated slugs", () => {
    expect(getRecipeSource("cheesy-beef-enchiladas-verde")).toBe("stefan");
    expect(getRecipeSource("air-fryer-edamame")).toBe("stefan");
    expect(getRecipeSource("black-bean-brownies")).toBe("stefan");
  });

  it("maps the tu- slug convention to Chef Tu", () => {
    expect(getRecipeSource("tu-garlic-noodles")).toBe("chef-tu");
  });

  it("maps the custom- convention to user creations", () => {
    expect(getRecipeSource("custom-my-pasta")).toBe("custom");
  });

  it("treats everything else as a first-party Sous original", () => {
    expect(getRecipeSource("butter-chicken")).toBe("original");
    expect(getRecipeSource("caesar-salad")).toBe("original");
    // prefix-only — a name merely containing 'tu' is NOT Chef Tu
    expect(getRecipeSource("tofu-bhurji")).toBe("original");
    expect(getRecipeSource("accustom")).toBe("original");
  });
});

describe("matchesSourceFilters (multi-select, OR semantics)", () => {
  const stefanMain = {
    slug: "honey-glazed-salmon-mango-salsa",
    isVerified: false,
  };
  const chefTu = { slug: "tu-goi-ga", isVerified: false };
  const verifiedOriginal = { slug: "butter-chicken", isVerified: true };
  const plainOriginal = { slug: "caesar-salad", isVerified: false };

  it("empty selection passes every dish", () => {
    for (const d of [stefanMain, chefTu, verifiedOriginal, plainOriginal]) {
      expect(matchesSourceFilters(d, [])).toBe(true);
    }
  });

  it("matches a dish satisfying ANY ticked facet", () => {
    expect(matchesSourceFilters(stefanMain, ["stefan", "chef-tu"])).toBe(true);
    expect(matchesSourceFilters(chefTu, ["stefan", "chef-tu"])).toBe(true);
    expect(matchesSourceFilters(plainOriginal, ["stefan", "chef-tu"])).toBe(
      false,
    );
  });

  it("nourish-verified keys off the badge, not provenance", () => {
    expect(matchesSourceFilters(verifiedOriginal, ["nourish-verified"])).toBe(
      true,
    );
    expect(matchesSourceFilters(plainOriginal, ["nourish-verified"])).toBe(
      false,
    );
    // verified OR stefan — a verified original matches via the badge
    expect(
      matchesSourceFilters(verifiedOriginal, ["stefan", "nourish-verified"]),
    ).toBe(true);
  });
});

describe("explicit source (injected user creations)", () => {
  const custom = {
    slug: "my-weeknight-pasta",
    isVerified: false,
    source: "custom" as const,
  };

  it("an explicit source wins over slug derivation", () => {
    // slug alone would derive "original"; the explicit source makes it custom.
    expect(matchesSourceFilters(custom, ["custom"])).toBe(true);
    expect(matchesSourceFilters(custom, ["original"])).toBe(false);
  });

  it("surfaces the custom facet in honest options", () => {
    const values = buildSourceFacetOptions([
      custom,
      { slug: "caesar-salad", isVerified: false },
    ]).map((o) => o.value);
    expect(values).toEqual(["custom", "original"]);
  });
});

describe("buildSourceFacetOptions — honest, role-aware (no 'any')", () => {
  it("offers verified + stefan + original for a mixed mains feed", () => {
    const mains = [
      { slug: "honey-glazed-salmon-mango-salsa", isVerified: false }, // stefan
      { slug: "butter-chicken", isVerified: true }, // verified original
      { slug: "caesar-salad", isVerified: false }, // original
    ];
    const values = buildSourceFacetOptions(mains).map((o) => o.value);
    expect(values).toEqual(["nourish-verified", "stefan", "original"]);
  });

  it("never offers a facet with zero results", () => {
    const onlyOriginals = [{ slug: "caesar-salad", isVerified: false }];
    const values = buildSourceFacetOptions(onlyOriginals).map((o) => o.value);
    expect(values).toEqual(["original"]);
  });
});

describe("coerceSourceFacets — legacy + corruption guard", () => {
  it("accepts a valid facet array", () => {
    expect(coerceSourceFacets(["stefan", "chef-tu"])).toEqual([
      "stefan",
      "chef-tu",
    ]);
  });

  it("drops junk from an array", () => {
    expect(coerceSourceFacets(["stefan", "bogus", 3])).toEqual(["stefan"]);
  });

  it("migrates the legacy single-select shape", () => {
    expect(coerceSourceFacets("any")).toEqual([]);
    expect(coerceSourceFacets("chef-tu")).toEqual(["chef-tu"]);
    expect(coerceSourceFacets("bogus")).toEqual([]);
    expect(coerceSourceFacets(undefined)).toEqual([]);
  });
});

describe("isSourceFacet", () => {
  it("accepts every facet and rejects junk", () => {
    const all: SourceFacet[] = [
      "nourish-verified",
      "stefan",
      "chef-tu",
      "clean-program",
      "custom",
      "original",
    ];
    for (const v of all) expect(isSourceFacet(v)).toBe(true);
    expect(isSourceFacet("any")).toBe(false);
    expect(isSourceFacet(null)).toBe(false);
  });
});
