/**
 * Pure response parser for the W50 agentic recipe autogen.
 *
 * Accepts the structured LLM response (validated upstream against
 * `autogenResponseSchema`) and stitches it into a `RecipeDraft`
 * the existing /path/recipes/new form pre-populates.
 *
 * Pure / dependency-free — testable without making LLM calls.
 */

import { autogenResponseSchema, type AutogenResponse } from "./autogen-prompt";
import { SCHEMA_VERSION } from "@/types/user-recipe";
import type { RecipeDraft } from "./recipe-draft";

/** Adapt a validated AutogenResponse to a RecipeDraft. The draft
 *  has no id / slug / timestamps — those get filled by
 *  commitDraft when the user saves. The user is the implicit
 *  author so source defaults to "user". */
export function adaptAutogenToDraft(response: AutogenResponse): RecipeDraft {
  return {
    schemaVersion: SCHEMA_VERSION,
    source: "user",
    nourishApprovedAt: null,
    nourishApprovedBy: null,
    authorDisplayName: null,
    title: response.title,
    dishName: response.dishName || response.title,
    cuisineFamily: response.cuisineFamily,
    flavorProfile: [...response.flavorProfile],
    dietaryFlags: [...(response.dietaryFlags ?? [])],
    temperature: response.temperature,
    skillLevel: response.skillLevel,
    prepTimeMinutes: response.prepTimeMinutes,
    cookTimeMinutes: response.cookTimeMinutes,
    serves: response.serves,
    heroImageUrl: null,
    description: response.description,
    ingredients: response.ingredients.map((ing, idx) => ({
      id: `i-${idx + 1}`,
      name: ing.name,
      quantity: ing.quantity,
      isOptional: ing.isOptional,
      substitution: null,
    })),
    steps: response.steps.map((s, idx) => ({
      stepNumber: idx + 1,
      instruction: s.instruction,
      timerSeconds: s.timerSeconds,
      mistakeWarning: s.mistakeWarning,
      quickHack: s.quickHack ?? null,
      cuisineFact: s.cuisineFact ?? null,
      donenessCue: s.donenessCue,
      imageUrl: null,
      attentionPointers: null,
    })),
  };
}

/** Stub-mode response — deterministic chana-masala first-draft
 *  used when no ANTHROPIC_API_KEY is configured. Mirrors what a
 *  real LLM would produce for a "chana masala — bloom spices,
 *  sauté onion, add tomatoes, simmer chickpeas" input. The shape
 *  is the load-bearing part for the demo path. */
export const STUB_AUTOGEN_RESPONSE: AutogenResponse = {
  title: "Chana Masala",
  dishName: "Chana Masala",
  cuisineFamily: "indian",
  temperature: "hot",
  skillLevel: "intermediate",
  description:
    "A weeknight chickpea curry with bloomed whole spices and a slow-simmered tomato base.",
  prepTimeMinutes: 10,
  cookTimeMinutes: 25,
  serves: 4,
  flavorProfile: ["spicy", "savory", "warm"],
  ingredients: [
    {
      name: "chickpeas (cooked or canned)",
      quantity: "2 cans",
      isOptional: false,
    },
    { name: "yellow onion", quantity: "1 large", isOptional: false },
    { name: "tomatoes (chopped)", quantity: "2 cups", isOptional: false },
    { name: "ginger-garlic paste", quantity: "1 tbsp", isOptional: false },
    { name: "cumin seeds", quantity: "1 tsp", isOptional: false },
    { name: "coriander seeds", quantity: "1 tsp", isOptional: false },
    { name: "garam masala", quantity: "1 tsp", isOptional: false },
    { name: "lime", quantity: "1 wedge", isOptional: true },
    { name: "fresh cilantro", quantity: "1/4 cup", isOptional: true },
  ],
  steps: [
    {
      instruction:
        "Heat 2 tbsp neutral oil over medium heat. Add cumin and coriander seeds and bloom for 30 seconds, until fragrant.",
      timerSeconds: 30,
      donenessCue: "Seeds smell nutty, not acrid — pull immediately.",
      mistakeWarning:
        "Don't let the cumin go past golden — it turns bitter fast.",
    },
    {
      instruction:
        "Add finely diced onion. Sauté until deep golden, stirring occasionally.",
      timerSeconds: 480,
      donenessCue: "Edges of the onion are caramel-coloured.",
      mistakeWarning: null,
    },
    {
      instruction:
        "Stir in ginger-garlic paste and cook 1 minute until raw smell is gone.",
      timerSeconds: 60,
      donenessCue: null,
      mistakeWarning: null,
    },
    {
      instruction:
        "Add chopped tomatoes and a pinch of salt. Simmer until they break down into a sauce.",
      timerSeconds: 600,
      donenessCue: "Sauce is jammy and oil starts to separate at the edges.",
      mistakeWarning: null,
    },
    {
      instruction:
        "Add chickpeas and a splash of water. Simmer to marry the flavours.",
      timerSeconds: 900,
      donenessCue: "Liquid has reduced; sauce coats the chickpeas.",
      mistakeWarning: null,
    },
    {
      instruction:
        "Finish with garam masala, a squeeze of lime, and chopped cilantro. Taste and adjust salt.",
      timerSeconds: null,
      donenessCue: null,
      mistakeWarning: null,
    },
  ],
};

/** Result of parsing pasted ChatGPT JSON — discriminated for callers. */
export type ParseRecipeAutogenResult =
  | { ok: true; draft: RecipeDraft }
  | { ok: false; reason: string };

/** Peel a ```json … ``` fence (models often wrap the output) + any prose the
 *  model added before/after the JSON object, returning just the {...} body. */
export function stripJsonFence(raw: string): string {
  const s = raw.trim();
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const body = fenced ? fenced[1].trim() : s;
  // If there's leading/trailing prose, grab the outermost brace span.
  const first = body.indexOf("{");
  const last = body.lastIndexOf("}");
  return first !== -1 && last > first ? body.slice(first, last + 1) : body;
}

/** Repair the two most common copy-from-rendered-HTML artifacts that make
 *  `JSON.parse` choke: curly/smart quotes and trailing commas. Conservative —
 *  only touches quotes + comma-before-close, never restructures. */
export function lenientJson(s: string): string {
  return s
    .replace(/[“”]/g, '"') // “ ” → "
    .replace(/[‘’]/g, "'") // ‘ ’ → '
    .replace(/,(\s*[}\]])/g, "$1"); // trailing comma before } or ]
}

/**
 * Parse a raw JSON string from the ChatGPT paste-bridge into a RecipeDraft —
 * the no-API mirror of the recipeAutogen tRPC procedure. Validates against
 * `autogenResponseSchema` (the contract the paste-prompt asks for), then adapts
 * to a draft ready for `commitDraft`. Tolerant of code fences + surrounding
 * prose. Returns a friendly reason on failure (shown in the import sheet).
 */
export function parseRecipeAutogenJson(
  raw: string | null | undefined,
): ParseRecipeAutogenResult {
  if (!raw || !raw.trim()) {
    return { ok: false, reason: "Paste the JSON the assistant returned." };
  }
  const body = stripJsonFence(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(lenientJson(body));
  } catch {
    // Pasted more than one recipe (an array, or two objects) — the brace span
    // becomes "{…},{…}" / "[…]" and JSON.parse chokes. Give a targeted hint.
    if (body.startsWith("[") || /\}\s*,\s*\{/.test(body)) {
      return {
        ok: false,
        reason: "Looks like more than one recipe — paste just one.",
      };
    }
    return {
      ok: false,
      reason: "That isn't valid JSON — copy the whole reply, braces included.",
    };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ok: false, reason: "Expected a single recipe object." };
  }
  const result = autogenResponseSchema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path.join(".") || "recipe";
    return {
      ok: false,
      reason: `${path}: ${issue?.message ?? "didn't match the recipe shape"}`,
    };
  }
  return { ok: true, draft: adaptAutogenToDraft(result.data) };
}
