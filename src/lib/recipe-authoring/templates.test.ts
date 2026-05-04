import { describe, expect, it } from "vitest";
import { RECIPE_TEMPLATES } from "./templates";
import {
  getStaticCookData,
  getStaticMealCookData,
} from "@/data/guided-cook-steps";
import { seedToRecipeDraft } from "./seed-fork";
import { commitDraft } from "./recipe-draft";
import { userRecipeSchema } from "@/types/user-recipe";

describe("RECIPE_TEMPLATES — manifest integrity", () => {
  it("has at least one template", () => {
    expect(RECIPE_TEMPLATES.length).toBeGreaterThan(0);
  });

  it("every slug resolves in the seed catalog (silent-typo defense)", () => {
    for (const t of RECIPE_TEMPLATES) {
      const seed = getStaticCookData(t.slug) ?? getStaticMealCookData(t.slug);
      expect(
        seed,
        `template slug ${t.slug} not found in seed catalog`,
      ).not.toBe(null);
    }
  });

  it("slugs are unique", () => {
    const slugs = new Set(RECIPE_TEMPLATES.map((t) => t.slug));
    expect(slugs.size).toBe(RECIPE_TEMPLATES.length);
  });

  it("name and pitch are non-empty for every template", () => {
    for (const t of RECIPE_TEMPLATES) {
      expect(t.name.length, `${t.slug} has empty name`).toBeGreaterThan(0);
      expect(t.pitch.length, `${t.slug} has empty pitch`).toBeGreaterThan(0);
    }
  });

  it("every template forks into a schema-valid recipe", () => {
    for (const t of RECIPE_TEMPLATES) {
      const seed = getStaticCookData(t.slug) ?? getStaticMealCookData(t.slug);
      if (!seed) throw new Error(`template ${t.slug} not found`);
      const draft = seedToRecipeDraft(seed);
      const committed = commitDraft(draft);
      const result = userRecipeSchema.safeParse(committed);
      expect(
        result.success,
        `${t.slug} fork failed schema: ${
          result.success ? "" : JSON.stringify(result.error.issues[0])
        }`,
      ).toBe(true);
    }
  });
});
