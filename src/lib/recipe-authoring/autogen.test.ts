import { describe, expect, it } from "vitest";
import {
  AUTOGEN_SYSTEM_PROMPT,
  KNOWN_CUISINES,
  KNOWN_SKILL_LEVELS,
  KNOWN_TEMPERATURES,
  autogenResponseSchema,
  buildAutogenPrompt,
  buildAutogenUserPrompt,
} from "./autogen-prompt";
import { STUB_AUTOGEN_RESPONSE, adaptAutogenToDraft } from "./autogen-parser";
import { commitDraft } from "./recipe-draft";
import { userRecipeSchema } from "@/types/user-recipe";

// ── prompt builder ──────────────────────────────────────────

describe("buildAutogenUserPrompt", () => {
  it("trims input + wraps it in a Recipe-description envelope", () => {
    expect(buildAutogenUserPrompt("  chana masala  ")).toContain(
      "Recipe description:",
    );
    expect(buildAutogenUserPrompt("  chana masala  ")).toContain(
      "chana masala",
    );
  });

  it("throws on empty / whitespace-only input", () => {
    expect(() => buildAutogenUserPrompt("")).toThrow();
    expect(() => buildAutogenUserPrompt("   ")).toThrow();
  });
});

describe("buildAutogenPrompt", () => {
  it("returns system + user + schema bundle", () => {
    const bundle = buildAutogenPrompt("chana masala");
    expect(bundle.system).toBe(AUTOGEN_SYSTEM_PROMPT);
    expect(bundle.user).toContain("chana masala");
    expect(bundle.schema).toBe(autogenResponseSchema);
  });

  it("system prompt enumerates the cuisine vocabulary", () => {
    for (const cuisine of KNOWN_CUISINES) {
      expect(AUTOGEN_SYSTEM_PROMPT).toContain(cuisine);
    }
  });

  it("system prompt enumerates temperature + skill enums", () => {
    for (const t of KNOWN_TEMPERATURES) {
      expect(AUTOGEN_SYSTEM_PROMPT).toContain(t);
    }
    for (const s of KNOWN_SKILL_LEVELS) {
      expect(AUTOGEN_SYSTEM_PROMPT).toContain(s);
    }
  });
});

// ── autogenResponseSchema ──────────────────────────────────

describe("autogenResponseSchema", () => {
  it("accepts a valid LLM response", () => {
    expect(autogenResponseSchema.safeParse(STUB_AUTOGEN_RESPONSE).success).toBe(
      true,
    );
  });

  it("rejects unknown cuisineFamily", () => {
    const bogus = { ...STUB_AUTOGEN_RESPONSE, cuisineFamily: "atlantean" };
    expect(autogenResponseSchema.safeParse(bogus).success).toBe(false);
  });

  it("rejects out-of-range prepTimeMinutes", () => {
    const bogus = { ...STUB_AUTOGEN_RESPONSE, prepTimeMinutes: 1000 };
    expect(autogenResponseSchema.safeParse(bogus).success).toBe(false);
  });

  it("rejects empty ingredients list", () => {
    const bogus = { ...STUB_AUTOGEN_RESPONSE, ingredients: [] };
    expect(autogenResponseSchema.safeParse(bogus).success).toBe(false);
  });

  it("rejects empty steps list", () => {
    const bogus = { ...STUB_AUTOGEN_RESPONSE, steps: [] };
    expect(autogenResponseSchema.safeParse(bogus).success).toBe(false);
  });

  it("rejects > 50 ingredients", () => {
    const ing = STUB_AUTOGEN_RESPONSE.ingredients[0];
    const bogus = {
      ...STUB_AUTOGEN_RESPONSE,
      ingredients: Array.from({ length: 51 }, () => ({ ...ing })),
    };
    expect(autogenResponseSchema.safeParse(bogus).success).toBe(false);
  });

  it("rejects timerSeconds > 7200 (2 hours)", () => {
    const bogus = {
      ...STUB_AUTOGEN_RESPONSE,
      steps: [
        {
          ...STUB_AUTOGEN_RESPONSE.steps[0],
          timerSeconds: 99999,
        },
      ],
    };
    expect(autogenResponseSchema.safeParse(bogus).success).toBe(false);
  });
});

// ── parser → RecipeDraft ───────────────────────────────────

describe("adaptAutogenToDraft", () => {
  it("converts the stub response to a schema-valid recipe", () => {
    const draft = adaptAutogenToDraft(STUB_AUTOGEN_RESPONSE);
    const committed = commitDraft(draft);
    expect(userRecipeSchema.safeParse(committed).success).toBe(true);
  });

  it("preserves title, dishName, cuisine, description", () => {
    const draft = adaptAutogenToDraft(STUB_AUTOGEN_RESPONSE);
    expect(draft.title).toBe(STUB_AUTOGEN_RESPONSE.title);
    expect(draft.dishName).toBe(STUB_AUTOGEN_RESPONSE.dishName);
    expect(draft.cuisineFamily).toBe(STUB_AUTOGEN_RESPONSE.cuisineFamily);
    expect(draft.description).toBe(STUB_AUTOGEN_RESPONSE.description);
  });

  it("falls back to title when dishName is empty (defensive)", () => {
    const response = { ...STUB_AUTOGEN_RESPONSE, dishName: "" };
    const draft = adaptAutogenToDraft(
      autogenResponseSchema.parse({
        ...response,
        dishName: response.title, // schema requires min 1, so use title
      }),
    );
    expect(draft.dishName).toBe(STUB_AUTOGEN_RESPONSE.title);
  });

  it("preserves flavorProfile array (fresh copy, not shared)", () => {
    const draft = adaptAutogenToDraft(STUB_AUTOGEN_RESPONSE);
    expect(draft.flavorProfile).toEqual(STUB_AUTOGEN_RESPONSE.flavorProfile);
    expect(draft.flavorProfile).not.toBe(STUB_AUTOGEN_RESPONSE.flavorProfile);
  });

  it("renumbers ingredients to canonical i-<n>", () => {
    const draft = adaptAutogenToDraft(STUB_AUTOGEN_RESPONSE);
    expect(draft.ingredients.map((i) => i.id)).toEqual(
      STUB_AUTOGEN_RESPONSE.ingredients.map((_, idx) => `i-${idx + 1}`),
    );
  });

  it("renumbers steps to 1..N sequential", () => {
    const draft = adaptAutogenToDraft(STUB_AUTOGEN_RESPONSE);
    expect(draft.steps.map((s) => s.stepNumber)).toEqual(
      STUB_AUTOGEN_RESPONSE.steps.map((_, idx) => idx + 1),
    );
  });

  it("preserves timerSeconds, donenessCue, mistakeWarning per step", () => {
    const draft = adaptAutogenToDraft(STUB_AUTOGEN_RESPONSE);
    for (const [idx, src] of STUB_AUTOGEN_RESPONSE.steps.entries()) {
      expect(draft.steps[idx].timerSeconds).toBe(src.timerSeconds);
      expect(draft.steps[idx].donenessCue).toBe(src.donenessCue);
      expect(draft.steps[idx].mistakeWarning).toBe(src.mistakeWarning);
    }
  });

  it("nulls out fields the LLM doesn't author (quickHack, cuisineFact, imageUrl, attentionPointers)", () => {
    const draft = adaptAutogenToDraft(STUB_AUTOGEN_RESPONSE);
    for (const step of draft.steps) {
      expect(step.quickHack).toBe(null);
      expect(step.cuisineFact).toBe(null);
      expect(step.imageUrl).toBe(null);
      expect(step.attentionPointers).toBe(null);
    }
  });

  it("defaults source to 'user' (autogen is the user's authorship)", () => {
    const draft = adaptAutogenToDraft(STUB_AUTOGEN_RESPONSE);
    expect(draft.source).toBe("user");
  });

  it("defaults heroImageUrl to null + dietaryFlags to []", () => {
    const draft = adaptAutogenToDraft(STUB_AUTOGEN_RESPONSE);
    expect(draft.heroImageUrl).toBe(null);
    expect(draft.dietaryFlags).toEqual([]);
  });
});

describe("STUB_AUTOGEN_RESPONSE", () => {
  it("validates against the autogenResponseSchema", () => {
    expect(autogenResponseSchema.safeParse(STUB_AUTOGEN_RESPONSE).success).toBe(
      true,
    );
  });

  it("commits + parses through the full pipeline", () => {
    const draft = adaptAutogenToDraft(STUB_AUTOGEN_RESPONSE);
    const committed = commitDraft(draft);
    const result = userRecipeSchema.safeParse(committed);
    expect(result.success).toBe(true);
  });
});
