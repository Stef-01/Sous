import { describe, it, expect } from "vitest";
import { normalizeInput } from "./normalize";

describe("normalizeInput", () => {
  it("trims and lowercases", () => {
    expect(normalizeInput("  Butter Chicken  ")).toBe("butter chicken");
  });

  it("returns empty for empty string", () => {
    expect(normalizeInput("")).toBe("");
  });

  it("returns empty for whitespace-only input", () => {
    expect(normalizeInput("   \t  \n  ")).toBe("");
  });

  it("strips special characters and emoji", () => {
    expect(normalizeInput("🍕 Pizza!!! 🔥")).toBe(" pizza ");
  });

  it("collapses multiple spaces", () => {
    expect(normalizeInput("butter    chicken   masala")).toBe(
      "butter chicken masala",
    );
  });

  it("handles accented characters by stripping non-word chars", () => {
    expect(normalizeInput("crème brûlée")).toBe("crme brle");
  });

  it("handles SQL injection-like input safely", () => {
    const result = normalizeInput("'; DROP TABLE meals; --");
    expect(result).toBe(" drop table meals ");
  });

  it("handles very long input (1000+ chars)", () => {
    const longInput = "a".repeat(2000);
    const result = normalizeInput(longInput);
    expect(result).toBe(longInput);
  });
});
