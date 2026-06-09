import { describe, expect, it } from "vitest";
import { cuisineAccent } from "./dish-image";

describe("cuisineAccent (W22b — dish-tinted celebrations)", () => {
  it("returns the dominant gradient stop for a mapped cuisine", () => {
    expect(cuisineAccent("Japanese")).toBe("#c0392b");
    expect(cuisineAccent("vietnamese")).toBe("#27ae60");
  });
  it("is case-insensitive", () => {
    expect(cuisineAccent("THAI")).toBe(cuisineAccent("thai"));
  });
  it("returns null for unmapped / missing cuisines (callers fall back)", () => {
    expect(cuisineAccent("martian")).toBeNull();
    expect(cuisineAccent(null)).toBeNull();
    expect(cuisineAccent(undefined)).toBeNull();
    expect(cuisineAccent("")).toBeNull();
  });
  it("always returns a 6-digit hex when non-null", () => {
    for (const c of ["japanese", "korean", "thai", "chinese", "indian"]) {
      expect(cuisineAccent(c)).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
