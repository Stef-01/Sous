import { describe, expect, it } from "vitest";
import bigBatchTagsRaw from "./big-batch-tags.json";
import type { BigBatchTag } from "@/lib/recipe/big-batch";

const tags = bigBatchTagsRaw as BigBatchTag[];

describe("big-batch-tags.json — seed data integrity", () => {
  it("parses as an array", () => {
    expect(Array.isArray(tags)).toBe(true);
  });

  it("has at least 6 starter tags", () => {
    expect(tags.length).toBeGreaterThanOrEqual(6);
  });

  it("every tag has a non-empty recipeSlug", () => {
    for (const t of tags) {
      expect(typeof t.recipeSlug).toBe("string");
      expect(t.recipeSlug.length).toBeGreaterThan(0);
    }
  });

  it("every tag has a non-empty leftoverLabel", () => {
    for (const t of tags) {
      expect(typeof t.leftoverLabel).toBe("string");
      expect(t.leftoverLabel.length).toBeGreaterThan(0);
    }
  });

  it("every tag has at least one expectedLeftoverItem", () => {
    for (const t of tags) {
      expect(Array.isArray(t.expectedLeftoverItems)).toBe(true);
      expect(t.expectedLeftoverItems.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("every tag has 2-4 successor recipe slugs", () => {
    for (const t of tags) {
      expect(Array.isArray(t.successorRecipeSlugs)).toBe(true);
      expect(t.successorRecipeSlugs.length).toBeGreaterThanOrEqual(2);
      expect(t.successorRecipeSlugs.length).toBeLessThanOrEqual(4);
    }
  });

  it("no duplicate recipeSlug across the catalog", () => {
    const slugs = new Set<string>();
    for (const t of tags) {
      expect(slugs.has(t.recipeSlug)).toBe(false);
      slugs.add(t.recipeSlug);
    }
  });

  it("no duplicate successor within a single tag", () => {
    for (const t of tags) {
      expect(new Set(t.successorRecipeSlugs).size).toBe(
        t.successorRecipeSlugs.length,
      );
    }
  });

  it("successor slugs don't reference the parent (no self-loop)", () => {
    for (const t of tags) {
      expect(t.successorRecipeSlugs).not.toContain(t.recipeSlug);
    }
  });

  it("slugs use kebab-case (lowercase letters + hyphens only)", () => {
    const re = /^[a-z][a-z0-9-]*$/;
    for (const t of tags) {
      expect(t.recipeSlug).toMatch(re);
      for (const s of t.successorRecipeSlugs) {
        expect(s).toMatch(re);
      }
    }
  });
});
