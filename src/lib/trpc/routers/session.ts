import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";

/**
 * Cook-session write path (Supabase-backed).
 *
 * The "I cooked it" win is the heart of the product. This router
 * persists a completed cook to Postgres so the journey log becomes a
 * server-of-record, not just localStorage. It is the canonical write
 * counterpart to `cook.getSteps` (read).
 *
 * Every procedure degrades gracefully: when DATABASE_URL is unset
 * (no `ctx.db`) the mutation returns `{ persisted: false }` and the
 * client keeps localStorage as the source of truth — matching the
 * write-through design in `db/source-selector.ts`. No 500s offline.
 */
export const cookSessionRouter = router({
  complete: publicProcedure
    .input(
      z.object({
        sideDishSlug: z.string().min(1),
        mainDishInput: z.string().nullish(),
        inputMode: z.enum(["text", "photo"]).default("text"),
        rating: z.number().int().min(1).max(5).nullish(),
        personalNote: z.string().nullish(),
        completionPhotoUrl: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) {
        return { persisted: false as const };
      }
      try {
        const { eq, sql } = await import("drizzle-orm");
        const { sideDishes, cookSessions, users } =
          await import("@/lib/db/schema");
        const db = ctx.db as import("@/lib/db").Database;
        const userId = ctx.userId;

        // Ensure the user row exists (mock-user dev path + first cook).
        await db.insert(users).values({ id: userId }).onConflictDoNothing();

        const dish = await db.query.sideDishes.findFirst({
          where: eq(sideDishes.slug, input.sideDishSlug),
          columns: { id: true },
        });
        if (!dish) return { persisted: false as const };

        const [session] = await db
          .insert(cookSessions)
          .values({
            userId,
            sideDishId: dish.id,
            mainDishInput: input.mainDishInput ?? null,
            inputMode: input.inputMode,
            status: "completed",
            completedAt: new Date(),
            rating: input.rating ?? null,
            personalNote: input.personalNote ?? null,
            completionPhotoUrl: input.completionPhotoUrl ?? null,
          })
          .returning({ id: cookSessions.id });

        // Bump the lifetime cook count — the streak/preference trainer
        // reads this. Best-effort; never blocks the win.
        await db
          .update(users)
          .set({
            completedCooks: sql`coalesce(${users.completedCooks}, 0) + 1`,
          })
          .where(eq(users.id, userId));

        return { persisted: true as const, sessionId: session.id };
      } catch (err) {
        console.warn("cook-session persist failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  /** Recent completed cooks for the current user (journey log). */
  history: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { sessions: [] };
      try {
        const { eq, desc } = await import("drizzle-orm");
        const { sideDishes, cookSessions } = await import("@/lib/db/schema");
        const db = ctx.db as import("@/lib/db").Database;

        const rows = await db
          .select({
            id: cookSessions.id,
            status: cookSessions.status,
            rating: cookSessions.rating,
            personalNote: cookSessions.personalNote,
            startedAt: cookSessions.startedAt,
            completedAt: cookSessions.completedAt,
            mainDishInput: cookSessions.mainDishInput,
            sideName: sideDishes.name,
            sideSlug: sideDishes.slug,
            heroImageUrl: sideDishes.heroImageUrl,
          })
          .from(cookSessions)
          .innerJoin(sideDishes, eq(cookSessions.sideDishId, sideDishes.id))
          .where(eq(cookSessions.userId, ctx.userId))
          .orderBy(desc(cookSessions.completedAt))
          .limit(input.limit);

        return { sessions: rows };
      } catch (err) {
        console.warn("cook-session history failed:", err);
        return { sessions: [] };
      }
    }),
});
