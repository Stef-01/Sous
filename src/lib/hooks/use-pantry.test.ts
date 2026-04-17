import { describe, it, expect } from "vitest";
import { normalizePantryName } from "./use-pantry";

describe("normalizePantryName", () => {
  it("lowercases and trims", () => {
    expect(normalizePantryName("  Chicken Thighs  ")).toBe("chicken thighs");
  });

  it("collapses internal whitespace", () => {
    expect(normalizePantryName("soy\t\tsauce")).toBe("soy sauce");
    expect(normalizePantryName("olive  oil   ")).toBe("olive oil");
  });

  it("strips commas and periods", () => {
    expect(normalizePantryName("salt, kosher")).toBe("salt kosher");
    expect(normalizePantryName("st. louis ribs")).toBe("st louis ribs");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(normalizePantryName("   ")).toBe("");
  });

  it("is idempotent", () => {
    const once = normalizePantryName("  Tomato   Paste,  ");
    const twice = normalizePantryName(once);
    expect(once).toBe(twice);
  });
});
