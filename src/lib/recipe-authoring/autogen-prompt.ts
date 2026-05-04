/**
 * Pure prompt builder for the W50 agentic recipe autogen.
 *
 * The user types a free-text recipe description; the LLM returns
 * structured JSON the parser stitches into a RecipeDraft. The
 * prompt is hand-tuned to keep the model on-rails (cuisine
 * vocabulary, time conservatism, ingredient parsing).
 *
 * Pure / dependency-free. The actual Anthropic call lives in
 * the recipeAutogen tRPC procedure; this module owns the
 * contract.
 */

import { z } from "zod";

/** Cuisine vocabulary the LLM must pick from. Mirrors the
 *  existing seed catalog so cross-engine wiring (W30 V2 trainer,
 *  W37 dietary inferer) stays consistent. */
export const KNOWN_CUISINES = [
  "indian",
  "italian",
  "mexican",
  "japanese",
  "thai",
  "chinese",
  "french",
  "mediterranean",
  "american",
  "korean",
  "vietnamese",
  "comfort-classic",
] as const;

export const KNOWN_TEMPERATURES = ["hot", "cold", "room-temp"] as const;
export const KNOWN_SKILL_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

/** The schema the LLM must produce. Mirrors the W17 UserRecipe
 *  shape but drops the auto-managed fields (id/slug/timestamps/
 *  schemaVersion) — those get filled by commitDraft. */
export const autogenResponseSchema = z.object({
  title: z.string().min(1).max(120),
  dishName: z.string().min(1).max(120),
  cuisineFamily: z.enum(KNOWN_CUISINES),
  temperature: z.enum(KNOWN_TEMPERATURES),
  skillLevel: z.enum(KNOWN_SKILL_LEVELS),
  description: z.string().min(1).max(800),
  prepTimeMinutes: z.number().int().min(0).max(480),
  cookTimeMinutes: z.number().int().min(0).max(480),
  serves: z.number().int().min(1).max(20),
  flavorProfile: z.array(z.string().min(1).max(40)).max(10),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        quantity: z.string().min(1).max(120),
        isOptional: z.boolean(),
      }),
    )
    .min(1)
    .max(50),
  steps: z
    .array(
      z.object({
        instruction: z.string().min(1).max(3000),
        timerSeconds: z.number().int().min(1).max(7200).nullable(),
        donenessCue: z.string().max(400).nullable(),
        mistakeWarning: z.string().max(400).nullable(),
      }),
    )
    .min(1)
    .max(50),
});

export type AutogenResponse = z.infer<typeof autogenResponseSchema>;

/** Hand-tuned system prompt. Keep terse — Anthropic's structured
 *  output already enforces the schema; this prompt sets the
 *  *quality* expectations on top. */
export const AUTOGEN_SYSTEM_PROMPT = `\
You are a recipe-authoring assistant for Sous, a cooking app. \
The user gives you a plain-text description of a recipe. Your \
job is to return a structured first-draft they can edit.

Hard rules:
- Always pick a cuisineFamily from this list (and ONLY this list): \
${KNOWN_CUISINES.join(", ")}.
- Always pick temperature from: ${KNOWN_TEMPERATURES.join(", ")}.
- Always pick skillLevel from: ${KNOWN_SKILL_LEVELS.join(", ")}.
- Estimate prepTimeMinutes + cookTimeMinutes conservatively. \
A weeknight cook should not see > 60 total minutes for an \
"intermediate" recipe.
- Default serves to 4 unless the user's text implies otherwise.
- Number steps in cooking order. Each step gets a clear, \
single-action instruction.
- Set timerSeconds when a step has a definite duration; null \
otherwise. Never invent a timer.
- Set donenessCue when the step has a sensory finish-line \
("until golden", "when fragrant"); null otherwise.
- Set mistakeWarning sparingly — only when the user explicitly \
flagged a pitfall, or when the step has a high-stakes failure \
mode (burning garlic, breaking an emulsion).
- Parse ingredient quantities ("2 cans", "1 tbsp" — not \
"two cans" or "a tablespoon"). Use isOptional=true ONLY when \
the user's text marks the ingredient optional.

Soft rules:
- Title: short, evocative, 2-5 words.
- dishName: the canonical dish name, often == title or a \
substring of it.
- description: a 1-2 sentence Mission-screen blurb.
- flavorProfile: 1-4 short tags (e.g. "spicy", "bright", \
"creamy", "fresh").

Never invent ingredients the user didn't mention.`;

/** Compose the full user message from the caller's input. The
 *  prompt is intentionally simple — the system prompt does the
 *  heavy lifting. */
export function buildAutogenUserPrompt(userInput: string): string {
  const trimmed = userInput.trim();
  if (trimmed.length === 0) {
    throw new Error("autogen: user input must not be empty");
  }
  return `Recipe description:\n\n${trimmed}\n\nReturn the structured recipe.`;
}

/** Bundle the system + user prompt + the structured-output
 *  schema for the caller. */
export interface AutogenPromptBundle {
  system: string;
  user: string;
  schema: typeof autogenResponseSchema;
}

export function buildAutogenPrompt(userInput: string): AutogenPromptBundle {
  return {
    system: AUTOGEN_SYSTEM_PROMPT,
    user: buildAutogenUserPrompt(userInput),
    schema: autogenResponseSchema,
  };
}
