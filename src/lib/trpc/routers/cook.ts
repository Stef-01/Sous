import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";
import {
  getStaticCookData,
  getStaticMealCookData,
} from "@/data/guided-cook-steps";
import {
  buildSequencerDish,
  sequenceDishes,
} from "@/lib/engine/cook-sequencer";

export const cookRouter = router({
  getSteps: publicProcedure
    .input(z.object({ sideDishSlug: z.string() }))
    .query(async ({ input, ctx }) => {
      // Try database first if available
      if (ctx.db && process.env.DATABASE_URL) {
        try {
          const { eq } = await import("drizzle-orm");
          const { sideDishes, cookSteps, ingredients } =
            await import("@/lib/db/schema");
          const db = ctx.db as import("@/lib/db").Database;

          const dish = await db.query.sideDishes.findFirst({
            where: eq(sideDishes.slug, input.sideDishSlug),
          });

          if (dish) {
            const steps = await db.query.cookSteps.findMany({
              where: eq(cookSteps.sideDishId, dish.id),
              orderBy: [cookSteps.phase, cookSteps.stepNumber],
            });

            const ingredientList = await db.query.ingredients.findMany({
              where: eq(ingredients.sideDishId, dish.id),
            });

            return {
              dish: {
                id: dish.id,
                name: dish.name,
                slug: dish.slug,
                description: dish.description,
                cuisineFamily: dish.cuisineFamily,
                prepTimeMinutes: dish.prepTimeMinutes,
                cookTimeMinutes: dish.cookTimeMinutes,
                skillLevel: dish.skillLevel,
                heroImageUrl: dish.heroImageUrl,
                flavorProfile: dish.flavorProfile,
                temperature: dish.temperature,
              },
              steps: steps.map((s) => ({
                id: s.id,
                phase: s.phase,
                stepNumber: s.stepNumber,
                instruction: s.instruction,
                timerSeconds: s.timerSeconds,
                mistakeWarning: s.mistakeWarning,
                quickHack: s.quickHack,
                cuisineFact: s.cuisineFact,
                donenessCue: s.donenessCue,
                imageUrl: s.imageUrl,
              })),
              ingredients: ingredientList.map((i) => ({
                id: i.id,
                name: i.name,
                quantity: i.quantity,
                isOptional: i.isOptional,
                substitution: i.substitution,
              })),
            };
          }
        } catch (err) {
          console.warn("DB query failed, falling back to static data:", err);
        }
      }

      // Fallback: use static guided cook data (check sides first, then meals)
      const staticData =
        getStaticCookData(input.sideDishSlug) ??
        getStaticMealCookData(input.sideDishSlug);

      if (!staticData) {
        return { dish: null, steps: [], ingredients: [] };
      }

      return {
        dish: {
          id: staticData.slug,
          name: staticData.name,
          slug: staticData.slug,
          description: staticData.description,
          cuisineFamily: staticData.cuisineFamily,
          prepTimeMinutes: staticData.prepTimeMinutes,
          cookTimeMinutes: staticData.cookTimeMinutes,
          skillLevel: staticData.skillLevel,
          heroImageUrl: staticData.heroImageUrl,
          flavorProfile: staticData.flavorProfile,
          temperature: staticData.temperature,
        },
        steps: staticData.steps.map((s, idx) => ({
          id: `${staticData.slug}-step-${idx + 1}`,
          ...s,
        })),
        ingredients: staticData.ingredients,
      };
    }),

  /**
   * Get combined cook data for a main dish + one or more sides.
   * Returns all dishes with their steps and ingredients, plus a suggested cook order.
   */
  getCombinedSteps: publicProcedure
    .input(
      z.object({
        mainDishSlug: z.string(),
        sideSlugs: z.array(z.string()),
      }),
    )
    .query(({ input }) => {
      const formatDish = (
        data: NonNullable<ReturnType<typeof getStaticCookData>>,
      ) => ({
        dish: {
          id: data.slug,
          name: data.name,
          slug: data.slug,
          description: data.description,
          cuisineFamily: data.cuisineFamily,
          prepTimeMinutes: data.prepTimeMinutes,
          cookTimeMinutes: data.cookTimeMinutes,
          skillLevel: data.skillLevel,
          heroImageUrl: data.heroImageUrl,
          flavorProfile: data.flavorProfile,
          temperature: data.temperature,
        },
        steps: data.steps.map((s, idx) => ({
          id: `${data.slug}-step-${idx + 1}`,
          ...s,
        })),
        ingredients: data.ingredients,
      });

      // Fetch main dish cook data
      const mainData = getStaticMealCookData(input.mainDishSlug);
      const main = mainData ? formatDish(mainData) : null;

      // Fetch side dish cook data (skip sides without data)
      const sides = input.sideSlugs
        .map((slug) => {
          const sideData = getStaticCookData(slug);
          return sideData ? formatDish(sideData) : null;
        })
        .filter((s): s is NonNullable<typeof s> => s !== null);

      // Cook order: longest total cook time first (so longest dishes start first)
      const allDishes = [
        ...(main
          ? [
              {
                slug: main.dish.slug,
                totalTime:
                  main.dish.prepTimeMinutes + main.dish.cookTimeMinutes,
              },
            ]
          : []),
        ...sides.map((s) => ({
          slug: s.dish.slug,
          totalTime: s.dish.prepTimeMinutes + s.dish.cookTimeMinutes,
        })),
      ].sort((a, b) => b.totalTime - a.totalTime);

      // Build sequencer hints for parallel cooking
      const sequencerDishes = [
        ...(main
          ? [
              buildSequencerDish({
                slug: main.dish.slug,
                name: main.dish.name,
                prepTimeMinutes: main.dish.prepTimeMinutes,
                cookTimeMinutes: main.dish.cookTimeMinutes,
                temperature: main.dish.temperature,
                steps: main.steps.map((s) => ({
                  instruction: s.instruction,
                  timerSeconds: s.timerSeconds,
                })),
              }),
            ]
          : []),
        ...sides.map((s) =>
          buildSequencerDish({
            slug: s.dish.slug,
            name: s.dish.name,
            prepTimeMinutes: s.dish.prepTimeMinutes,
            cookTimeMinutes: s.dish.cookTimeMinutes,
            temperature: s.dish.temperature,
            steps: s.steps.map((st) => ({
              instruction: st.instruction,
              timerSeconds: st.timerSeconds,
            })),
          }),
        ),
      ];
      const sequence = sequenceDishes(sequencerDishes);

      return {
        main,
        sides,
        cookOrder: allDishes.map((d) => d.slug),
        sequencerHints: sequence.steps
          .filter((s) => s.parallelHint)
          .map((s) => ({
            dishSlug: s.dishSlug,
            stepIndex: s.stepIndex,
            hint: s.parallelHint!,
          })),
        totalEstimatedMinutes: sequence.totalEstimatedMinutes,
      };
    }),

  start: publicProcedure
    .input(
      z.object({
        sideDishId: z.string(),
        mainDishInput: z.string(),
        inputMode: z.enum(["text", "camera"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // If DB + auth available, persist session
      if (ctx.db && ctx.userId && process.env.DATABASE_URL) {
        try {
          const { cookSessions } = await import("@/lib/db/schema");
          const db = ctx.db as import("@/lib/db").Database;

          const [session] = await db
            .insert(cookSessions)
            .values({
              userId: ctx.userId,
              sideDishId: input.sideDishId,
              mainDishInput: input.mainDishInput,
              inputMode: input.inputMode,
              status: "started",
            })
            .returning({ id: cookSessions.id });

          return { sessionId: session.id };
        } catch (err) {
          console.warn("DB session create failed:", err);
        }
      }

      // Fallback: return a local session ID
      return { sessionId: `local-${Date.now()}` };
    }),

  complete: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        rating: z.number().min(1).max(5).optional(),
        personalNote: z.string().optional(),
        completionPhotoUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // If DB + auth available, persist completion
      if (ctx.db && ctx.userId && process.env.DATABASE_URL) {
        try {
          const { eq, and, sql } = await import("drizzle-orm");
          const { cookSessions, users } = await import("@/lib/db/schema");
          const db = ctx.db as import("@/lib/db").Database;

          await db
            .update(cookSessions)
            .set({
              status: "completed",
              completedAt: new Date(),
              rating: input.rating,
              personalNote: input.personalNote,
              completionPhotoUrl: input.completionPhotoUrl,
            })
            .where(
              and(
                eq(cookSessions.id, input.sessionId),
                eq(cookSessions.userId, ctx.userId),
              ),
            );

          await db
            .update(users)
            .set({
              completedCooks: sql`${users.completedCooks} + 1`,
            })
            .where(eq(users.id, ctx.userId));

          const user = await db.query.users.findFirst({
            where: eq(users.id, ctx.userId),
          });

          let pathUnlocked = false;
          if (user && (user.completedCooks ?? 0) >= 3 && !user.pathUnlocked) {
            await db
              .update(users)
              .set({ pathUnlocked: true })
              .where(eq(users.id, ctx.userId));
            pathUnlocked = true;
          }

          return { success: true, pathUnlocked };
        } catch (err) {
          console.warn("DB session complete failed:", err);
        }
      }

      // Fallback: just return success
      return { success: true, pathUnlocked: false };
    }),
});
