import { describe, expect, it } from "vitest";
import { mergeRecipeLists } from "./use-server-recipes";
import {
  SCHEMA_VERSION,
  userRecipeSchema,
  type UserRecipe,
} from "@/types/user-recipe";

const recipe = (over: Partial<UserRecipe> = {}): UserRecipe =>
  userRecipeSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    id: "r-1",
    slug: "r-1",
    title: "R1",
    dishName: "R1",
    cuisineFamily: "indian",
    flavorProfile: [],
    dietaryFlags: [],
    temperature: "hot",
    skillLevel: "beginner",
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    serves: 2,
    description: "x",
    ingredients: [
      { id: "i-1", name: "salt", quantity: "1 tsp", isOptional: false },
    ],
    steps: [{ stepNumber: 1, instruction: "do" }],
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...over,
  });

describe("mergeRecipeLists", () => {
  it("keeps local-only and server-only recipes", () => {
    const local = [recipe({ id: "local", slug: "local" })];
    const server = [recipe({ id: "server", slug: "server" })];
    const ids = mergeRecipeLists(local, server)
      .map((r) => r.id)
      .sort();
    expect(ids).toEqual(["local", "server"]);
  });

  it("server row wins on an id collision (server is canonical once published)", () => {
    const local = [recipe({ id: "x", title: "Local copy", source: "user" })];
    const server = [
      recipe({ id: "x", title: "Published copy", source: "community" }),
    ];
    const merged = mergeRecipeLists(local, server);
    expect(merged).toHaveLength(1);
    expect(merged[0].title).toBe("Published copy");
    expect(merged[0].source).toBe("community");
  });

  it("sorts by updatedAt descending", () => {
    const a = recipe({
      id: "a",
      slug: "a",
      updatedAt: "2026-06-01T00:00:00.000Z",
    });
    const b = recipe({
      id: "b",
      slug: "b",
      updatedAt: "2026-06-10T00:00:00.000Z",
    });
    expect(mergeRecipeLists([a], [b]).map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("empty server list (dormant, no DB) → just the local drafts", () => {
    const local = [recipe({ id: "only", slug: "only" })];
    expect(mergeRecipeLists(local, []).map((r) => r.id)).toEqual(["only"]);
  });
});
