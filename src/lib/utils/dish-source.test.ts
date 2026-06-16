import { describe, expect, it } from "vitest";
import {
  buildSourceOptions,
  getRecipeSource,
  isSourceFilter,
  matchesSourceFilter,
  type SourceFilter,
} from "./dish-source";

describe("getRecipeSource", () => {
  it("maps the tu- slug convention to Chef Tu", () => {
    expect(getRecipeSource("tu-garlic-noodles")).toBe("chef-tu");
    expect(getRecipeSource("tu-goi-ga")).toBe("chef-tu");
  });

  it("maps enumerated Clean Program recipes", () => {
    expect(getRecipeSource("black-bean-brownies")).toBe("clean-program");
  });

  it("treats everything else as a first-party Sous original", () => {
    expect(getRecipeSource("butter-chicken")).toBe("original");
    expect(getRecipeSource("caesar-salad")).toBe("original");
    // a dish whose name merely contains 'tu' is NOT Chef Tu (prefix-only)
    expect(getRecipeSource("tofu-bhurji")).toBe("original");
    expect(getRecipeSource("status-quo")).toBe("original");
  });
});

describe("matchesSourceFilter", () => {
  const chefTu = { slug: "tu-goi-ga", isVerified: false };
  const verifiedMain = { slug: "butter-chicken", isVerified: true };
  const plainOriginal = { slug: "caesar-salad", isVerified: false };
  const cleanProgram = { slug: "black-bean-brownies", isVerified: false };

  it("'any' passes every dish", () => {
    for (const d of [chefTu, verifiedMain, plainOriginal, cleanProgram]) {
      expect(matchesSourceFilter(d, "any")).toBe(true);
    }
  });

  it("'nourish-verified' keys off the badge, not provenance", () => {
    expect(matchesSourceFilter(verifiedMain, "nourish-verified")).toBe(true);
    expect(matchesSourceFilter(plainOriginal, "nourish-verified")).toBe(false);
    // a verified Chef Tu recipe would match the verified filter too
    expect(
      matchesSourceFilter(
        { slug: "tu-goi-ga", isVerified: true },
        "nourish-verified",
      ),
    ).toBe(true);
  });

  it("provenance filters select only their source", () => {
    expect(matchesSourceFilter(chefTu, "chef-tu")).toBe(true);
    expect(matchesSourceFilter(verifiedMain, "chef-tu")).toBe(false);
    expect(matchesSourceFilter(cleanProgram, "clean-program")).toBe(true);
    expect(matchesSourceFilter(chefTu, "clean-program")).toBe(false);
    expect(matchesSourceFilter(plainOriginal, "original")).toBe(true);
    expect(matchesSourceFilter(chefTu, "original")).toBe(false);
  });
});

describe("buildSourceOptions — honest, role-aware options", () => {
  it("a mains feed offers Verified + Original but not Chef Tu / Clean Program", () => {
    const mains = [
      { slug: "butter-chicken", isVerified: true },
      { slug: "caesar-salad", isVerified: false },
    ];
    const values = buildSourceOptions(mains).map((o) => o.value);
    expect(values).toEqual(["any", "nourish-verified", "original"]);
  });

  it("a sides feed with Chef Tu + Clean Program offers them", () => {
    const sides = [
      { slug: "tu-goi-ga", isVerified: false },
      { slug: "black-bean-brownies", isVerified: false },
      { slug: "naan-bread", isVerified: true },
    ];
    const values = buildSourceOptions(sides).map((o) => o.value);
    expect(values).toEqual([
      "any",
      "nourish-verified",
      "chef-tu",
      "clean-program",
      "original",
    ]);
  });

  it("always offers 'any' first, even for an empty feed", () => {
    const opts = buildSourceOptions([]);
    expect(opts).toHaveLength(1);
    expect(opts[0]).toMatchObject({ value: "any", pillLabel: "Source" });
  });

  it("never offers a source with zero results (the no-empty-state guarantee)", () => {
    const onlyOriginals = [{ slug: "caesar-salad", isVerified: false }];
    const values = buildSourceOptions(onlyOriginals).map((o) => o.value);
    expect(values).not.toContain("chef-tu");
    expect(values).not.toContain("nourish-verified");
    expect(values).toEqual(["any", "original"]);
  });
});

describe("isSourceFilter — persistence guard", () => {
  it("accepts every valid filter value", () => {
    const all: SourceFilter[] = [
      "any",
      "nourish-verified",
      "chef-tu",
      "clean-program",
      "original",
    ];
    for (const v of all) expect(isSourceFilter(v)).toBe(true);
  });

  it("rejects junk / legacy values", () => {
    expect(isSourceFilter("community")).toBe(false);
    expect(isSourceFilter("")).toBe(false);
    expect(isSourceFilter(null)).toBe(false);
    expect(isSourceFilter(undefined)).toBe(false);
    expect(isSourceFilter(3)).toBe(false);
  });
});
