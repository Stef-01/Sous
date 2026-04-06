import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";

const sessionSchema = z.object({
  sessionId: z.string(),
  recipeSlug: z.string(),
  dishName: z.string(),
  cuisineFamily: z.string(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  note: z.string().optional(),
  favorite: z.boolean(),
  scrapbookSaved: z.boolean().optional(),
});

export const journeyRouter = router({
  /**
   * Return the last 20 completed cook sessions.
   * Accepts sessions from the client (localStorage) since there's no DB auth in dev.
   * When a real DB and auth are available, this will query the DB instead.
   */
  recent: publicProcedure
    .input(
      z.object({
        sessions: z.array(sessionSchema).default([]),
      }),
    )
    .query(async ({ input }) => {
      const completed = input.sessions
        .filter((s) => !!s.completedAt)
        .sort(
          (a, b) =>
            new Date(b.completedAt!).getTime() -
            new Date(a.completedAt!).getTime(),
        )
        .slice(0, 20);
      return { sessions: completed };
    }),

  /**
   * Return aggregated cooking stats.
   * Accepts stats from the client since there's no DB auth in dev.
   */
  stats: publicProcedure
    .input(
      z.object({
        sessions: z.array(sessionSchema).default([]),
        currentStreak: z.number().default(0),
        cuisinesCovered: z.array(z.string()).default([]),
      }),
    )
    .query(async ({ input }) => {
      const completed = input.sessions.filter((s) => !!s.completedAt);

      // Weekly frequency — count completions per day for the last 7 days
      const now = Date.now();
      const weeklyFrequency = Array.from({ length: 7 }, (_, i) => {
        const dayStart = new Date(now - (6 - i) * 86400000);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart.getTime() + 86400000);
        const count = completed.filter((s) => {
          const d = new Date(s.completedAt!);
          return d >= dayStart && d < dayEnd;
        }).length;
        return { date: dayStart.toISOString().split("T")[0], count };
      });

      return {
        totalCooks: completed.length,
        currentStreak: input.currentStreak,
        cuisineDiversity: input.cuisinesCovered.length,
        weeklyFrequency,
      };
    }),
});
