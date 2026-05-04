import { describe, expect, it } from "vitest";
import {
  parseUserRecipeJson,
  SCHEMA_VERSION,
  serialiseUserRecipe,
  slugifyTitle,
  userRecipeSchema,
  type UserRecipe,
} from "./user-recipe";

const validRecipe = (overrides: Partial<UserRecipe> = {}): UserRecipe =>
  userRecipeSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    id: "rec-test",
    slug: "test-recipe",
    title: "Test Recipe",
    dishName: "Test Recipe",
    cuisineFamily: "indian",
    flavorProfile: [],
    dietaryFlags: [],
    temperature: "hot",
    skillLevel: "beginner",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    serves: 2,
    description: "A test recipe.",
    ingredients: [
      { id: "i-1", name: "salt", quantity: "1 tsp", isOptional: false },
    ],
    steps: [{ stepNumber: 1, instruction: "do thing" }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

describe("userRecipeSchema — base validation", () => {
  it("accepts a minimal valid recipe", () => {
    expect(() => validRecipe()).not.toThrow();
  });

  it("rejects an empty title", () => {
    expect(() => validRecipe({ title: "" })).toThrow();
  });

  it("rejects an out-of-range stepNumber", () => {
    expect(() =>
      validRecipe({
        steps: [{ stepNumber: 0, instruction: "x" }],
      }),
    ).toThrow();
  });

  it("rejects non-sequential stepNumbers", () => {
    expect(() =>
      validRecipe({
        steps: [
          { stepNumber: 1, instruction: "a" },
          { stepNumber: 3, instruction: "c" },
        ],
      }),
    ).toThrow();
  });

  it("accepts sequential stepNumbers 1..N", () => {
    expect(() =>
      validRecipe({
        steps: [
          { stepNumber: 1, instruction: "a" },
          { stepNumber: 2, instruction: "b" },
          { stepNumber: 3, instruction: "c" },
        ],
      }),
    ).not.toThrow();
  });

  it("rejects malformed slug (uppercase)", () => {
    expect(() => validRecipe({ slug: "Test-Recipe" })).toThrow();
  });

  it("rejects too many ingredients (> 50)", () => {
    const ingredients = Array.from({ length: 51 }, (_, i) => ({
      id: `i-${i}`,
      name: "x",
      quantity: "1",
      isOptional: false,
    }));
    expect(() => validRecipe({ ingredients })).toThrow();
  });

  it("rejects timer > 7200 seconds (2h cap)", () => {
    expect(() =>
      validRecipe({
        steps: [{ stepNumber: 1, instruction: "x", timerSeconds: 7201 }],
      }),
    ).toThrow();
  });
});

describe("parseUserRecipeJson", () => {
  it("returns ok:false for empty input", () => {
    expect(parseUserRecipeJson(null)).toEqual({ ok: false, reason: "empty" });
    expect(parseUserRecipeJson("")).toEqual({ ok: false, reason: "empty" });
  });

  it("returns ok:false for invalid JSON", () => {
    expect(parseUserRecipeJson("{not json")).toEqual({
      ok: false,
      reason: "invalid-json",
    });
  });

  it("returns ok:false for non-object root (null)", () => {
    expect(parseUserRecipeJson("null")).toEqual({
      ok: false,
      reason: "non-object-root",
    });
  });

  it("returns ok:false for non-object root (array)", () => {
    expect(parseUserRecipeJson("[1,2,3]")).toEqual({
      ok: false,
      reason: "non-object-root",
    });
  });

  it("returns ok:false for missing schemaVersion", () => {
    const result = parseUserRecipeJson(JSON.stringify({}));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/unsupported-schema-version/);
    }
  });

  it("returns ok:false for unsupported schemaVersion", () => {
    const result = parseUserRecipeJson(JSON.stringify({ schemaVersion: 999 }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/unsupported-schema-version/);
    }
  });

  it("round-trips a valid recipe through serialise → parse", () => {
    const original = validRecipe();
    const json = serialiseUserRecipe(original);
    const result = parseUserRecipeJson(json);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.recipe).toEqual(original);
    }
  });
});

describe("slugifyTitle", () => {
  it("lowercases + spaces-to-hyphens", () => {
    expect(slugifyTitle("My Best Curry")).toBe("my-best-curry");
  });

  it("strips punctuation", () => {
    expect(slugifyTitle("Mom's, Famous! Soup?")).toBe("moms-famous-soup");
  });

  it("collapses repeated hyphens", () => {
    expect(slugifyTitle("a---b")).toBe("a-b");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugifyTitle("-spicy-")).toBe("spicy");
  });

  it("caps at 80 chars", () => {
    const long = "a".repeat(200);
    expect(slugifyTitle(long).length).toBe(80);
  });

  it("strips emoji and unicode glyphs", () => {
    expect(slugifyTitle("🍝 Pasta")).toBe("pasta");
  });
});

// W17 stress loops — long-content + race-condition + poisoned-data
describe("user-recipe — stress: long-content", () => {
  it("accepts a 50-ingredient + 50-step recipe (boundary)", () => {
    const ingredients = Array.from({ length: 50 }, (_, i) => ({
      id: `i-${i}`,
      name: `ing ${i}`,
      quantity: "1",
      isOptional: false,
    }));
    const steps = Array.from({ length: 50 }, (_, i) => ({
      stepNumber: i + 1,
      instruction: `step ${i + 1}`,
    }));
    expect(() => validRecipe({ ingredients, steps })).not.toThrow();
  });

  it("accepts a 3000-char step instruction (cap boundary)", () => {
    const instruction = "x".repeat(3000);
    expect(() =>
      validRecipe({ steps: [{ stepNumber: 1, instruction }] }),
    ).not.toThrow();
  });

  it("rejects a 3001-char step instruction (over cap)", () => {
    const instruction = "x".repeat(3001);
    expect(() =>
      validRecipe({ steps: [{ stepNumber: 1, instruction }] }),
    ).toThrow();
  });

  it("round-trips a 50-ingredient + 3000-char-step recipe via JSON", () => {
    const ingredients = Array.from({ length: 50 }, (_, i) => ({
      id: `i-${i}`,
      name: `ing ${i}`,
      quantity: "1",
      isOptional: false,
    }));
    const steps = Array.from({ length: 50 }, (_, i) => ({
      stepNumber: i + 1,
      instruction: `step ${i + 1} ` + "x".repeat(2000),
    }));
    const original = validRecipe({ ingredients, steps });
    const json = serialiseUserRecipe(original);
    const result = parseUserRecipeJson(json);
    expect(result.ok).toBe(true);
  });
});

describe("user-recipe — stress: race-condition / call-order", () => {
  it("parseUserRecipeJson is deterministic across 1000 calls", () => {
    const json = serialiseUserRecipe(validRecipe());
    let last = parseUserRecipeJson(json);
    for (let i = 0; i < 1000; i += 1) {
      const next = parseUserRecipeJson(json);
      expect(next.ok).toBe(last.ok);
      last = next;
    }
  });

  it("slugifyTitle is deterministic across 1000 calls on same input", () => {
    const title = "Mom's Famous Curry";
    const expected = slugifyTitle(title);
    for (let i = 0; i < 1000; i += 1) {
      expect(slugifyTitle(title)).toBe(expected);
    }
  });
});

describe("user-recipe — stress: poisoned-data", () => {
  it("rejects payload with bytes that look like JSON but aren't", () => {
    expect(parseUserRecipeJson("\x00\x01\x02").ok).toBe(false);
  });

  it("rejects an object with all required fields missing", () => {
    expect(
      parseUserRecipeJson(JSON.stringify({ schemaVersion: SCHEMA_VERSION })).ok,
    ).toBe(false);
  });

  it("handles empty title in slugifyTitle without crash", () => {
    expect(slugifyTitle("")).toBe("");
  });

  it("handles only-emoji title", () => {
    expect(slugifyTitle("🍝🍕🍣")).toBe("");
  });

  it("rejects negative time budget", () => {
    expect(() => validRecipe({ prepTimeMinutes: -1 })).toThrow();
  });
});
