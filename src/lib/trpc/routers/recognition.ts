import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";
import { recognizeDish } from "@/lib/ai/food-recognition";

export const recognitionRouter = router({
  identify: publicProcedure
    .input(z.object({ imageBase64: z.string() }))
    .mutation(async ({ input }) => {
      const result = await recognizeDish(input.imageBase64);

      if (!result.success) {
        return {
          success: false as const,
          error: result.error,
          dishName: "",
          confidence: 0,
          cuisine: "",
          isHomemade: false,
          alternates: [],
        };
      }

      return {
        success: true as const,
        ...result.data,
      };
    }),
});
