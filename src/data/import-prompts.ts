/**
 * Paste-bridge prompts (the "prompting scheme + instructions").
 *
 * Each prompt is copied by the user into ChatGPT/Claude. It states the task,
 * embeds the EXACT JSON shape the parser expects (kept in lock-step with
 * `src/types/import-bridge.ts`), shows a tiny example, and ends with a fenced
 * block for the user to drop their raw input (a typed list, a pasted receipt,
 * a photo description, yesterday's meals…). The assistant returns one JSON
 * object the user pastes back into Sous.
 *
 * The schema is restated as plain text (not imported) on purpose — the user is
 * pasting it into a DIFFERENT app, so it must be self-contained.
 */

import type { ImportKind } from "@/types/import-bridge";

export interface ImportPromptDef {
  kind: ImportKind;
  /** Tab label. */
  label: string;
  /** One-line description shown under the tab. */
  blurb: string;
  /** What the user types where the prompt says "paste here". */
  inputHint: string;
  /** The full copy-to-clipboard prompt. */
  prompt: string;
}

const SHARED_RULES = `Rules:
- Reply with ONE JSON object and nothing else — no commentary, no explanation.
- Put it in a single \`\`\`json code block.
- Use numbers (not strings) for amounts. Omit a field if you don't know it rather than guessing.`;

const PANTRY_PROMPT = `You are helping me load my kitchen inventory into a cooking app. Convert the list below into JSON.

Shape:
{
  "kind": "pantry",
  "items": [
    { "name": "olive oil", "quantity": 1, "unit": "bottle", "category": "oils" },
    { "name": "brown rice", "quantity": 2, "unit": "kg", "category": "grains" },
    { "name": "eggs", "quantity": 12, "unit": "count" }
  ]
}

Field notes:
- name: the ingredient, lowercase, no brand.
- quantity + unit: how much I have (e.g. 500 g, 2 cans, 1 bunch, 12 count). Optional.
- category: a short group like "produce", "dairy", "grains", "spices". Optional.

${SHARED_RULES}

Here is my pantry:
"""
PASTE OR TYPE YOUR PANTRY HERE
"""`;

const GROCERIES_PROMPT = `You are helping me log a grocery shop into a cooking app so the items land in my kitchen inventory. Convert the receipt/list below into JSON.

Shape:
{
  "kind": "groceries",
  "items": [
    { "name": "chicken thighs", "quantity": 1, "unit": "kg", "category": "meat" },
    { "name": "spinach", "quantity": 2, "unit": "bunch", "category": "produce" },
    { "name": "greek yogurt", "quantity": 4, "unit": "cup", "category": "dairy" }
  ]
}

Field notes:
- Drop store names, prices, taxes, and loyalty lines — keep only food/ingredients.
- name: lowercase, no brand. quantity + unit + category are optional but helpful.

${SHARED_RULES}

Here is my receipt or shopping list:
"""
PASTE YOUR RECEIPT OR GROCERY LIST HERE
"""`;

const NUTRITION_PROMPT = `You are helping me log what I ate into a cooking app's food diary. Estimate the nutrition for each food and convert it into JSON.

Shape:
{
  "kind": "nutrition",
  "date": "today",
  "entries": [
    {
      "name": "grilled chicken salad",
      "servings": 1,
      "calories": 420,
      "protein_g": 38,
      "carbs_g": 18,
      "fat_g": 22,
      "fiber_g": 6,
      "sugar_g": 5,
      "sodium_mg": 540,
      "mealType": "lunch"
    }
  ]
}

Field notes:
- One entry per food or dish. Values are PER the number of servings I ate.
- calories is required; protein_g / carbs_g / fat_g / fiber_g / sugar_g / sodium_mg are optional — include the ones you can reasonably estimate.
- servings defaults to 1. mealType is one of: breakfast, lunch, dinner, snack.
- date: "today", "yesterday", or YYYY-MM-DD. If unsure, use "today".
- These are estimates — that's fine, label them as best-effort.

${SHARED_RULES}

Here is what I ate:
"""
DESCRIBE YOUR MEALS HERE (e.g. "2 eggs and toast for breakfast, a burrito for lunch...")
"""`;

export const IMPORT_PROMPTS: Record<ImportKind, ImportPromptDef> = {
  pantry: {
    kind: "pantry",
    label: "Pantry",
    blurb: "Everything you have on hand, with amounts.",
    inputHint: "what's in your cupboards, fridge and freezer",
    prompt: PANTRY_PROMPT,
  },
  groceries: {
    kind: "groceries",
    label: "Groceries",
    blurb: "A shop you just did — adds to your inventory.",
    inputHint: "a receipt or the list you bought",
    prompt: GROCERIES_PROMPT,
  },
  nutrition: {
    kind: "nutrition",
    label: "Food log",
    blurb: "What you ate, with nutrients, for your diary.",
    inputHint: "the meals and snacks you had",
    prompt: NUTRITION_PROMPT,
  },
};

export const IMPORT_PROMPT_ORDER: ImportKind[] = [
  "pantry",
  "groceries",
  "nutrition",
];
