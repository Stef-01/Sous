import { router, protectedProcedure } from "@/lib/trpc/server";

export const journeyRouter = router({
  recent: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Return last 20 completed cook sessions
    return { sessions: [] };
  }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Return cooking frequency, cuisine diversity, streak
    return {
      totalCooks: 0,
      currentStreak: 0,
      cuisineDiversity: 0,
      weeklyFrequency: [],
    };
  }),
});
