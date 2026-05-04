/**
 * Server-side recipe autogen provider.
 *
 * Two modes:
 *   - **Stub mode** (no `ANTHROPIC_API_KEY` configured) — returns
 *     the deterministic `STUB_AUTOGEN_RESPONSE` from
 *     `src/lib/recipe-authoring/autogen-parser.ts`. The page
 *     surface still works for the demo / vibecode V1 path.
 *   - **Real mode** (key set) — calls Anthropic via Vercel AI SDK's
 *     `generateObject` with the W50 system prompt + structured-
 *     output schema. Validates upstream + downstream.
 *
 * Module is server-only (imports `process.env`, lazy-imports
 * `ai` SDK), called from the recipeAutogen tRPC procedure.
 */

import {
  buildAutogenPrompt,
  autogenResponseSchema,
  type AutogenResponse,
} from "@/lib/recipe-authoring/autogen-prompt";
import { STUB_AUTOGEN_RESPONSE } from "@/lib/recipe-authoring/autogen-parser";

export interface AutogenInput {
  description: string;
}

export type AutogenResult =
  | { ok: true; response: AutogenResponse; mode: "stub" | "real" }
  | { ok: false; error: string };

/** Server-side autogen call. Pure stub when no key is configured;
 *  Vercel AI SDK call when one is. Caller supplies the user's
 *  free-text description. */
export async function draftRecipeFromText(
  input: AutogenInput,
): Promise<AutogenResult> {
  const description = input.description.trim();
  if (description.length === 0) {
    return { ok: false, error: "Recipe description must not be empty." };
  }
  if (description.length > 4000) {
    return { ok: false, error: "Description is too long (max 4000 chars)." };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: true, response: STUB_AUTOGEN_RESPONSE, mode: "stub" };
  }

  // Real mode — gated on the API key being present at runtime.
  // Lazy-imported so the AI SDK isn't loaded in stub-only deploys.
  try {
    const { generateObject } = await import("ai");
    const { anthropic } = await import("@ai-sdk/anthropic");
    const bundle = buildAutogenPrompt(description);
    const result = await generateObject({
      model: anthropic("claude-sonnet-4-5"),
      schema: bundle.schema,
      system: bundle.system,
      prompt: bundle.user,
    });
    // Defence-in-depth — the Vercel AI SDK already validates against
    // the schema, but a second pass guards against any
    // configuration drift between SDK versions.
    const parsed = autogenResponseSchema.safeParse(result.object);
    if (!parsed.success) {
      return {
        ok: false,
        error: `LLM response failed schema: ${parsed.error.issues[0]?.message ?? "unknown"}`,
      };
    }
    return { ok: true, response: parsed.data, mode: "real" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return { ok: false, error: `Autogen failed: ${message}` };
  }
}
