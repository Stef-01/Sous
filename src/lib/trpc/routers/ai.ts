/**
 * AI Router  -  bounded AI surfaces with graceful fallback.
 *
 * Every endpoint works with or without AI API keys.
 * Schema-validated inputs and outputs.
 */

import { router, publicProcedure } from "@/lib/trpc/server";
import { getAIProvider } from "@/lib/ai/provider";
import {
  explainPairingInputSchema,
  cookQuestionInputSchema,
  substitutionInputSchema,
  winMessageInputSchema,
  appraisalRewriteInputSchema,
  postCookReflectionInputSchema,
  kidSwapsInputSchema,
} from "@/lib/ai/contracts";

export const aiRouter = router({
  /**
   * 1. Explain Pairing  -  warmer "why this works" sentence
   */
  explainPairing: publicProcedure
    .input(explainPairingInputSchema)
    .query(async ({ input }) => {
      const provider = await getAIProvider();
      return provider.explainPairing(input);
    }),

  /**
   * 2. Cook Q&A  -  answer a bounded question about the current step
   */
  askCookQuestion: publicProcedure
    .input(cookQuestionInputSchema)
    .mutation(async ({ input }) => {
      const provider = await getAIProvider();
      return provider.answerCookQuestion(input);
    }),

  /**
   * 3. Substitution  -  "I don't have X, what can I use?"
   */
  suggestSubstitution: publicProcedure
    .input(substitutionInputSchema)
    .query(async ({ input }) => {
      const provider = await getAIProvider();
      return provider.suggestSubstitution(input);
    }),

  /**
   * 4. Win Message  -  personalized celebration
   */
  generateWinMessage: publicProcedure
    .input(winMessageInputSchema)
    .query(async ({ input }) => {
      const provider = await getAIProvider();
      return provider.generateWinMessage(input);
    }),

  /**
   * 5. Appraisal Rewrite  -  natural language plate evaluation
   */
  rewriteAppraisal: publicProcedure
    .input(appraisalRewriteInputSchema)
    .query(async ({ input }) => {
      const provider = await getAIProvider();
      return provider.rewriteAppraisal(input);
    }),

  /**
   * 6. Post-Cook Reflection  -  strengths + gentle suggestions
   */
  generateReflection: publicProcedure
    .input(postCookReflectionInputSchema)
    .query(async ({ input }) => {
      const provider = await getAIProvider();
      return provider.generateReflection(input);
    }),

  /**
   * 7. Kid Swaps  -  Parent Mode "make it kid-friendly" suggestions.
   * Mock provider mirrors the deterministic lookup so dev parity holds
   * when no Anthropic key is set.
   */
  suggestKidSwaps: publicProcedure
    .input(kidSwapsInputSchema)
    .query(async ({ input }) => {
      const provider = await getAIProvider();
      return provider.suggestKidSwaps(input);
    }),
});
