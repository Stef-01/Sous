import { z } from "zod";
import { router, protectedProcedure } from "@/lib/trpc/server";

export const coachRouter = router({
  quiz: protectedProcedure
    .input(
      z.object({
        questionKey: z.string(),
        answer: z.string(),
      }),
    )
    .mutation(async () => {
      // TODO: Store response, update preference vector, return result card
      return { resultText: "", resultEmoji: "" };
    }),

  vibePrompt: protectedProcedure.query(async () => {
    // TODO: Return today's vibe question
    return {
      questionKey: "",
      question: "",
      optionA: "",
      optionB: "",
    };
  }),
});
