import { describe, it, expect } from "vitest";
import {
  parseRecipeAutogenJson,
  stripJsonFence,
  lenientJson,
  STUB_AUTOGEN_RESPONSE,
} from "./autogen-parser";
import { commitDraft } from "./recipe-draft";
import { RECIPE_PASTE_PROMPT } from "./autogen-prompt";
import { userRecipeSchema } from "@/types/user-recipe";
import { userRecipeToQuestDish } from "@/lib/cook/user-recipe-quest";

// Simulate what ChatGPT returns for the paste-prompt: the autogen contract,
// stringified (the stub mirrors a real "chana masala" reply).
const SIMULATED_GPT_JSON = JSON.stringify(STUB_AUTOGEN_RESPONSE, null, 2);
const NOW = "2026-06-17T00:00:00.000Z";

describe("recipe paste-bridge — parse", () => {
  it("parses a clean GPT JSON object into a draft", () => {
    const r = parseRecipeAutogenJson(SIMULATED_GPT_JSON);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.draft.title).toBe(STUB_AUTOGEN_RESPONSE.title);
      expect(r.draft.cuisineFamily).toBe(STUB_AUTOGEN_RESPONSE.cuisineFamily);
      expect(r.draft.ingredients.length).toBe(
        STUB_AUTOGEN_RESPONSE.ingredients.length,
      );
      expect(r.draft.steps[0].stepNumber).toBe(1); // 1-indexed sequence
    }
  });

  it("tolerates a ```json fence + surrounding prose (what models actually send)", () => {
    const wrapped = `Sure! Here's your recipe:\n\n\`\`\`json\n${SIMULATED_GPT_JSON}\n\`\`\`\nEnjoy!`;
    expect(parseRecipeAutogenJson(wrapped).ok).toBe(true);
  });

  it("rejects empty / non-JSON / missing-fields with a friendly reason", () => {
    expect(parseRecipeAutogenJson("").ok).toBe(false);
    expect(parseRecipeAutogenJson("hello not json").ok).toBe(false);
    expect(parseRecipeAutogenJson(JSON.stringify({ title: "x" })).ok).toBe(
      false,
    ); // missing required fields
  });

  it("coerces an out-of-vocab cuisine to 'other' instead of failing the import", () => {
    const greek = JSON.stringify({
      ...STUB_AUTOGEN_RESPONSE,
      cuisineFamily: "greek",
    });
    const r = parseRecipeAutogenJson(greek);
    expect(r.ok).toBe(true); // a real Greek recipe must not be unimportable
    if (r.ok) expect(r.draft.cuisineFamily).toBe("other");
  });

  it("repairs smart quotes + trailing commas (copy-from-rendered-HTML)", () => {
    expect(lenientJson("{“title”:“x”,}")).toBe('{"title":"x"}');
    expect(lenientJson('{"a":[1,2,],}')).toBe('{"a":[1,2]}');
    // a full reply with curly quotes + a trailing comma parses end-to-end
    const dirty = JSON.stringify(STUB_AUTOGEN_RESPONSE)
      .replace(/"/g, "“")
      .replace(/\}$/, ",}"); // add a trailing comma
    expect(parseRecipeAutogenJson(dirty).ok).toBe(true);
  });

  it("gives a targeted message when more than one recipe is pasted", () => {
    const two = `[${SIMULATED_GPT_JSON},${SIMULATED_GPT_JSON}]`;
    const r = parseRecipeAutogenJson(two);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/more than one recipe/i);
  });

  it("stripJsonFence peels fences + prose to the brace span", () => {
    expect(stripJsonFence('```json\n{"a":1}\n```')).toBe('{"a":1}');
    expect(stripJsonFence('prose before {"a":1} prose after')).toBe('{"a":1}');
    expect(stripJsonFence('{"a":1}')).toBe('{"a":1}');
  });
});

describe("recipe paste-bridge — commit + main-page surfacing", () => {
  it("round-trips: GPT JSON → draft → commit → a valid UserRecipe", () => {
    const r = parseRecipeAutogenJson(SIMULATED_GPT_JSON);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const recipe = commitDraft({ ...r.draft, sourceTags: ["ChatGPT"] }, NOW);
    const parsed = userRecipeSchema.safeParse(recipe);
    expect(parsed.success).toBe(true); // the cook flow + store accept it
    expect(recipe.sourceTags).toEqual(["ChatGPT"]); // source categorisation persists
    expect(recipe.slug).toMatch(/^[a-z0-9-]+$/);
    expect(recipe.steps.every((s, i) => s.stepNumber === i + 1)).toBe(true);
  });

  it("the committed recipe becomes a cookable deck dish (surfaces on Today)", () => {
    const r = parseRecipeAutogenJson(SIMULATED_GPT_JSON);
    if (!r.ok) throw new Error("parse failed");
    const recipe = commitDraft(r.draft, NOW);
    const dish = userRecipeToQuestDish(recipe);
    // `custom-` slug → the cook route resolves it as a user creation; the deck
    // tags it under the "My creations" Source facet.
    expect(dish.slug).toBe(`custom-${recipe.slug}`);
    expect(dish.hasGuidedCook).toBe(true);
    expect(dish.dishName).toBe(recipe.title);
  });

  it("the paste prompt encodes the contract (cuisine vocab + JSON-only)", () => {
    expect(RECIPE_PASTE_PROMPT).toMatch(/Output ONLY the JSON/i);
    expect(RECIPE_PASTE_PROMPT).toContain("indian");
    expect(RECIPE_PASTE_PROMPT).toContain('"ingredients"');
    expect(RECIPE_PASTE_PROMPT).toContain("[REPLACE THIS LINE");
  });
});
