import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";
import { computePreferencesFromAnswers } from "@/data/coach-quiz";

export const coachRouter = router({
  /**
   * Save quiz answers and return the computed preference vector.
   * When a DB + userId are available the responses are persisted to
   * quiz_responses; otherwise the caller is responsible for persisting
   * locally (localStorage).
   */
  quiz: publicProcedure
    .input(
      z.object({
        /** Sparse array — null means the question was skipped. */
        answers: z.array(z.number().nullable()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = computePreferencesFromAnswers(input.answers);

      // Persist to DB when we have both a db connection and a userId
      if (ctx.db && ctx.userId) {
        try {
          const { quizResponses } = await import("@/lib/db/schema");
          const { coachQuizQuestions } = await import("@/data/coach-quiz");
          const db = ctx.db as import("drizzle-orm/neon-http").NeonHttpDatabase;

          const rows = input.answers
            .map((answer, i) => {
              if (answer === null) return null;
              const question = coachQuizQuestions[i];
              if (!question) return null;
              return {
                userId: ctx.userId!,
                questionKey: question.key,
                answer: String(answer),
              };
            })
            .filter(Boolean) as {
            userId: string;
            questionKey: string;
            answer: string;
          }[];

          if (rows.length > 0) {
            const { db: drizzleDb } = db as unknown as {
              db: import("drizzle-orm/neon-http").NeonHttpDatabase;
            };
            void drizzleDb; // used below only when real db is injected
            // Use ctx.db directly (it is the drizzle instance)
            await (
              ctx.db as {
                insert: (
                  t: unknown,
                ) => { values: (rows: unknown[]) => Promise<void> };
              }
            )
              .insert(quizResponses)
              .values(rows);
          }
        } catch {
          // DB unavailable — non-fatal, preferences are returned to client
        }
      }

      return result;
    }),

  vibePrompt: publicProcedure.query(async () => {
    // Today's vibe question — static rotation for now
    const prompts = [
      {
        questionKey: "vibe-spicy",
        question: "Feeling adventurous tonight?",
        optionA: "Give me something bold",
        optionB: "Keep it familiar",
      },
      {
        questionKey: "vibe-quick",
        question: "How much time have you got?",
        optionA: "Under 20 minutes",
        optionB: "I'm happy to take my time",
      },
      {
        questionKey: "vibe-health",
        question: "What are you in the mood for?",
        optionA: "Something light and fresh",
        optionB: "Hearty and comforting",
      },
    ];

    const idx = new Date().getDate() % prompts.length;
    return prompts[idx]!;
  }),
});
