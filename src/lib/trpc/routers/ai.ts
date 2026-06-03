/**
 * AI Router  -  bounded AI surfaces with graceful fallback.
 *
 * Every endpoint works with or without AI API keys.
 * Schema-validated inputs and outputs.
 *
 * The real (Claude) provider already catches per-method and falls back to mock,
 * but throws OUTSIDE that — `getAIProvider()` failing to import/construct, or an
 * unexpected error — would 500 the request. `safeAI` wraps every resolver so any
 * such throw degrades to the deterministic mock response instead, making the
 * "works with or without keys" contract true at the boundary, not just inside
 * the Claude provider.
 */

import { router, publicProcedure } from "@/lib/trpc/server";
import { getAIProvider } from "@/lib/ai/provider";
import { MockAIProvider } from "@/lib/ai/providers/mock";
import {
  explainPairingInputSchema,
  cookQuestionInputSchema,
  substitutionInputSchema,
  winMessageInputSchema,
  appraisalRewriteInputSchema,
  postCookReflectionInputSchema,
  kidSwapsInputSchema,
} from "@/lib/ai/contracts";

/** Stateless deterministic fallback, reused across requests. */
const mock = new MockAIProvider();

async function safeAI<T>(
  primary: () => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<T> {
  try {
    return await primary();
  } catch {
    return await fallback();
  }
}

export const aiRouter = router({
  /** 1. Explain Pairing  -  warmer "why this works" sentence */
  explainPairing: publicProcedure
    .input(explainPairingInputSchema)
    .query(({ input }) =>
      safeAI(
        async () => (await getAIProvider()).explainPairing(input),
        () => mock.explainPairing(input),
      ),
    ),

  /** 2. Cook Q&A  -  answer a bounded question about the current step */
  askCookQuestion: publicProcedure
    .input(cookQuestionInputSchema)
    .mutation(({ input }) =>
      safeAI(
        async () => (await getAIProvider()).answerCookQuestion(input),
        () => mock.answerCookQuestion(input),
      ),
    ),

  /** 3. Substitution  -  "I don't have X, what can I use?" */
  suggestSubstitution: publicProcedure
    .input(substitutionInputSchema)
    .query(({ input }) =>
      safeAI(
        async () => (await getAIProvider()).suggestSubstitution(input),
        () => mock.suggestSubstitution(input),
      ),
    ),

  /** 4. Win Message  -  personalized celebration */
  generateWinMessage: publicProcedure
    .input(winMessageInputSchema)
    .query(({ input }) =>
      safeAI(
        async () => (await getAIProvider()).generateWinMessage(input),
        () => mock.generateWinMessage(input),
      ),
    ),

  /** 5. Appraisal Rewrite  -  natural language plate evaluation */
  rewriteAppraisal: publicProcedure
    .input(appraisalRewriteInputSchema)
    .query(({ input }) =>
      safeAI(
        async () => (await getAIProvider()).rewriteAppraisal(input),
        () => mock.rewriteAppraisal(input),
      ),
    ),

  /** 6. Post-Cook Reflection  -  strengths + gentle suggestions */
  generateReflection: publicProcedure
    .input(postCookReflectionInputSchema)
    .query(({ input }) =>
      safeAI(
        async () => (await getAIProvider()).generateReflection(input),
        () => mock.generateReflection(input),
      ),
    ),

  /**
   * 7. Kid Swaps  -  Parent Mode "make it kid-friendly" suggestions.
   * Mock provider mirrors the deterministic lookup so dev parity holds
   * when no Anthropic key is set.
   */
  suggestKidSwaps: publicProcedure
    .input(kidSwapsInputSchema)
    .query(({ input }) =>
      safeAI(
        async () => (await getAIProvider()).suggestKidSwaps(input),
        () => mock.suggestKidSwaps(input),
      ),
    ),
});
