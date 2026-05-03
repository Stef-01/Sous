import { describe, expect, it } from "vitest";
import {
  parseStoredRecipeDrafts,
  removeRecipeById,
  roundTripRecipe,
  safeSerialiseRecipe,
  upsertRecipe,
} from "./use-recipe-drafts";
import {
  SCHEMA_VERSION,
  serialiseUserRecipe,
  userRecipeSchema,
  type UserRecipe,
} from "@/types/user-recipe";

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

describe("parseStoredRecipeDrafts", () => {
  it("returns empty array for null/undefined/empty", () => {
    expect(parseStoredRecipeDrafts(null)).toEqual([]);
    expect(parseStoredRecipeDrafts(undefined)).toEqual([]);
    expect(parseStoredRecipeDrafts("")).toEqual([]);
  });

  it("returns empty array for corrupt JSON", () => {
    expect(parseStoredRecipeDrafts("{not json")).toEqual([]);
  });

  it("returns empty array for non-array root", () => {
    expect(parseStoredRecipeDrafts("null")).toEqual([]);
    expect(parseStoredRecipeDrafts("{}")).toEqual([]);
    expect(parseStoredRecipeDrafts('"string"')).toEqual([]);
  });

  it("parses a valid array of recipes", () => {
    const r1 = validRecipe({ id: "rec-1", slug: "rec-1" });
    const r2 = validRecipe({ id: "rec-2", slug: "rec-2" });
    const raw = JSON.stringify([r1, r2]);
    const parsed = parseStoredRecipeDrafts(raw);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].id).toBe("rec-1");
  });

  it("drops invalid entries silently (partial recovery)", () => {
    const r1 = validRecipe({ id: "rec-1", slug: "rec-1" });
    const raw = JSON.stringify([r1, { schemaVersion: SCHEMA_VERSION }]);
    const parsed = parseStoredRecipeDrafts(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe("rec-1");
  });
});

describe("upsertRecipe", () => {
  it("inserts a new recipe at the end", () => {
    const r = validRecipe();
    expect(upsertRecipe([], r)).toEqual([r]);
  });

  it("updates an existing recipe in place by id", () => {
    const r1 = validRecipe({ id: "rec-1", slug: "rec-1", title: "First" });
    const r1Edited = validRecipe({
      id: "rec-1",
      slug: "rec-1",
      title: "First (edited)",
    });
    const result = upsertRecipe([r1], r1Edited);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("First (edited)");
  });

  it("does not mutate the input list", () => {
    const r1 = validRecipe({ id: "rec-1", slug: "rec-1" });
    const list = [r1];
    upsertRecipe(list, validRecipe({ id: "rec-2", slug: "rec-2" }));
    expect(list).toHaveLength(1);
  });
});

describe("removeRecipeById", () => {
  it("removes the matching recipe", () => {
    const r1 = validRecipe({ id: "rec-1", slug: "rec-1" });
    const r2 = validRecipe({ id: "rec-2", slug: "rec-2" });
    expect(removeRecipeById([r1, r2], "rec-1")).toEqual([r2]);
  });

  it("returns the list unchanged when id is not present", () => {
    const r = validRecipe();
    expect(removeRecipeById([r], "nonexistent")).toEqual([r]);
  });

  it("does not mutate the input list", () => {
    const r = validRecipe();
    const list = [r];
    removeRecipeById(list, r.id);
    expect(list).toHaveLength(1);
  });
});

describe("safeSerialiseRecipe", () => {
  it("returns serialised JSON when recipe is valid", () => {
    const r = validRecipe();
    const result = safeSerialiseRecipe(r);
    expect(result).toBe(serialiseUserRecipe(r));
  });

  it("returns null when recipe doesn't satisfy schema", () => {
    // Bypass parse() to construct a malformed object that
    // looks-like-but-isn't a UserRecipe.
    const malformed = { ...validRecipe(), prepTimeMinutes: -1 } as UserRecipe;
    expect(safeSerialiseRecipe(malformed)).toBe(null);
  });
});

describe("roundTripRecipe", () => {
  it("returns the recipe when payload is valid", () => {
    const r = validRecipe();
    const json = serialiseUserRecipe(r);
    expect(roundTripRecipe(json)).toEqual(r);
  });

  it("returns null when payload is invalid", () => {
    expect(roundTripRecipe("{")).toBe(null);
    expect(roundTripRecipe("null")).toBe(null);
    expect(roundTripRecipe(JSON.stringify({}))).toBe(null);
  });
});

// W24 stress loops
describe("recipe-drafts — stress: long-content", () => {
  it("parseStoredRecipeDrafts handles 50 recipes", () => {
    const recipes = Array.from({ length: 50 }, (_, i) =>
      validRecipe({ id: `rec-${i}`, slug: `rec-${i}` }),
    );
    const raw = JSON.stringify(recipes);
    expect(parseStoredRecipeDrafts(raw)).toHaveLength(50);
  });

  it("upsert + remove loop converges across 100 ops", () => {
    let list: UserRecipe[] = [];
    for (let i = 0; i < 100; i += 1) {
      list = upsertRecipe(
        list,
        validRecipe({ id: `rec-${i}`, slug: `rec-${i}` }),
      );
    }
    expect(list).toHaveLength(100);
    for (let i = 0; i < 50; i += 1) {
      list = removeRecipeById(list, `rec-${i}`);
    }
    expect(list).toHaveLength(50);
    expect(list[0].id).toBe("rec-50");
  });
});

describe("recipe-drafts — stress: race-condition", () => {
  it("parseStoredRecipeDrafts is deterministic across 1000 calls", () => {
    const r = validRecipe();
    const raw = JSON.stringify([r]);
    let last = parseStoredRecipeDrafts(raw);
    for (let i = 0; i < 1000; i += 1) {
      const next = parseStoredRecipeDrafts(raw);
      expect(next).toEqual(last);
      last = next;
    }
  });
});

describe("recipe-drafts — stress: poisoned-data", () => {
  it("survives an array of mostly-invalid entries by returning the valid ones", () => {
    const r = validRecipe();
    const raw = JSON.stringify([
      null,
      { foo: "bar" },
      r,
      { schemaVersion: 999 },
      "string",
    ]);
    const parsed = parseStoredRecipeDrafts(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe(r.id);
  });

  it("drops an entry with the wrong schemaVersion", () => {
    const wrongVersion = { ...validRecipe(), schemaVersion: 999 };
    const raw = JSON.stringify([wrongVersion]);
    expect(parseStoredRecipeDrafts(raw)).toEqual([]);
  });
});
