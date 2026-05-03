/**
 * recipeAutogenRouter — tRPC procedure for the W50 agentic
 * recipe autogen.
 *
 * One mutation: `draft(description: string)` returns an
 * `AutogenResponse` (validated against `autogenResponseSchema`)
 * + a mode flag indicating stub-vs-real. The caller (the W50
 * /path/recipes/quick-add page) adapts the response to a
 * RecipeDraft via `adaptAutogenToDraft` and pre-populates the
 * existing /path/recipes/new form.
 */

import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";
import { draftRecipeFromText } from "@/lib/ai/autogen-provider";

export const recipeAutogenRouter = router({
  draft: publicProcedure
    .input(
      z.object({
        description: z.string().min(1).max(4000),
      }),
    )
    .mutation(async ({ input }) => {
      return draftRecipeFromText(input);
    }),
});
