import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";
import { sides } from "@/data";
import { guidedCookData } from "@/data/guided-cook-steps";

export const contentRouter = router({
  getSideDish: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      const side = sides.find((s) => s.id === input.slug);
      if (!side) return null;
      const cookData = guidedCookData[input.slug] ?? null;
      return { ...side, cookData };
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        cuisine: z.string().optional(),
        maxPrepMinutes: z.number().optional(),
        skillLevel: z.string().optional(),
      }),
    )
    .query(({ input }) => {
      let results = [...sides];

      if (input.query) {
        const q = input.query.toLowerCase();
        results = results.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q)),
        );
      }

      if (input.cuisine) {
        const c = input.cuisine.toLowerCase();
        results = results.filter((s) =>
          s.tags.some((t) => t.toLowerCase().includes(c)),
        );
      }

      if (input.maxPrepMinutes !== undefined || input.skillLevel) {
        results = results.filter((s) => {
          const cookData = guidedCookData[s.id];
          if (!cookData) return true; // no cook data — don't filter out
          if (
            input.maxPrepMinutes !== undefined &&
            cookData.prepTimeMinutes > input.maxPrepMinutes
          ) {
            return false;
          }
          if (input.skillLevel && cookData.skillLevel !== input.skillLevel) {
            return false;
          }
          return true;
        });
      }

      return { results };
    }),
});
