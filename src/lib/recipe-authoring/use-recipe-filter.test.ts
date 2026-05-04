import { describe, expect, it } from "vitest";
import {
  matchesRecipeFilter,
  parseStoredRecipeFilter,
} from "./use-recipe-filter";

describe("parseStoredRecipeFilter — short-circuits", () => {
  it("null / undefined / empty → 'all' default", () => {
    expect(parseStoredRecipeFilter(null).filter).toBe("all");
    expect(parseStoredRecipeFilter(undefined).filter).toBe("all");
    expect(parseStoredRecipeFilter("").filter).toBe("all");
  });

  it("non-JSON → default", () => {
    expect(parseStoredRecipeFilter("{not-json").filter).toBe("all");
  });

  it("JSON null / array / primitive → default", () => {
    expect(parseStoredRecipeFilter("null").filter).toBe("all");
    expect(parseStoredRecipeFilter("[]").filter).toBe("all");
    expect(parseStoredRecipeFilter("42").filter).toBe("all");
  });

  it("schemaVersion mismatch → default", () => {
    const raw = JSON.stringify({ schemaVersion: 99, filter: "mine" });
    expect(parseStoredRecipeFilter(raw).filter).toBe("all");
  });

  it("unknown filter value → default", () => {
    const raw = JSON.stringify({ schemaVersion: 1, filter: "garbage" });
    expect(parseStoredRecipeFilter(raw).filter).toBe("all");
  });
});

describe("parseStoredRecipeFilter — round-trip", () => {
  it("preserves valid filter", () => {
    const raw = JSON.stringify({ schemaVersion: 1, filter: "community" });
    expect(parseStoredRecipeFilter(raw).filter).toBe("community");
  });

  it("preserves all four canonical filter values", () => {
    for (const f of ["all", "mine", "community", "nourish-verified"]) {
      const raw = JSON.stringify({ schemaVersion: 1, filter: f });
      expect(parseStoredRecipeFilter(raw).filter).toBe(f);
    }
  });

  it("returns a fresh object each call", () => {
    const a = parseStoredRecipeFilter(null);
    const b = parseStoredRecipeFilter(null);
    expect(a).not.toBe(b);
  });
});

describe("matchesRecipeFilter", () => {
  it("'all' matches every source", () => {
    expect(matchesRecipeFilter("user", "all")).toBe(true);
    expect(matchesRecipeFilter("community", "all")).toBe(true);
    expect(matchesRecipeFilter("nourish-verified", "all")).toBe(true);
  });

  it("'mine' matches user only", () => {
    expect(matchesRecipeFilter("user", "mine")).toBe(true);
    expect(matchesRecipeFilter("community", "mine")).toBe(false);
    expect(matchesRecipeFilter("nourish-verified", "mine")).toBe(false);
  });

  it("'community' matches community only", () => {
    expect(matchesRecipeFilter("user", "community")).toBe(false);
    expect(matchesRecipeFilter("community", "community")).toBe(true);
    expect(matchesRecipeFilter("nourish-verified", "community")).toBe(false);
  });

  it("'nourish-verified' matches nourish-verified only", () => {
    expect(matchesRecipeFilter("user", "nourish-verified")).toBe(false);
    expect(matchesRecipeFilter("community", "nourish-verified")).toBe(false);
    expect(matchesRecipeFilter("nourish-verified", "nourish-verified")).toBe(
      true,
    );
  });
});
