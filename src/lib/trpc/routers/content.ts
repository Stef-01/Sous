import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "@/lib/trpc/server";

export const contentRouter = router({
  getSideDish: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async () => {
      // TODO: Return full side dish with steps and ingredients
      return null;
    }),

  search: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        cuisine: z.string().optional(),
        maxPrepMinutes: z.number().optional(),
        skillLevel: z.string().optional(),
      }),
    )
    .query(async () => {
      // TODO: Filtered search of internal side dish database
      return { results: [] };
    }),
});
