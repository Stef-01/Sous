import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";

/**
 * Weekly meal-plan write path (Supabase-backed) — Stage F of
 * docs/MVP-FEATURE-PLAN.md. Mirrors `use-meal-plan-week` onto
 * `meal_plan_slots` (id = `${ownerId}-${weekKey}-${slot}`, one row per
 * scheduled slot). Graceful no-db fallback like the other routers.
 */
const slotId = (userId: string, weekKey: string, slot: string) =>
  `${userId}-${weekKey}-${slot}`;

export const planRouter = router({
  scheduleSlot: publicProcedure
    .input(
      z.object({
        weekKey: z.string().min(1),
        slot: z.string().min(1),
        recipeSlug: z.string().min(1),
        source: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { mealPlanSlots } = await import("@/lib/db/y4-tables");
        const db = ctx.db as import("@/lib/db").Database;
        const id = slotId(ctx.userId, input.weekKey, input.slot);
        const set = {
          recipeSlug: input.recipeSlug,
          source: input.source,
          scheduledAt: new Date(),
        };
        await db
          .insert(mealPlanSlots)
          .values({
            id,
            ownerId: ctx.userId,
            weekKey: input.weekKey,
            slot: input.slot,
            ...set,
          })
          .onConflictDoUpdate({ target: mealPlanSlots.id, set });
        return { persisted: true as const };
      } catch (err) {
        console.warn("meal-plan schedule failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  clearSlot: publicProcedure
    .input(z.object({ weekKey: z.string().min(1), slot: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { eq } = await import("drizzle-orm");
        const { mealPlanSlots } = await import("@/lib/db/y4-tables");
        const db = ctx.db as import("@/lib/db").Database;
        await db
          .delete(mealPlanSlots)
          .where(
            eq(mealPlanSlots.id, slotId(ctx.userId, input.weekKey, input.slot)),
          );
        return { persisted: true as const };
      } catch (err) {
        console.warn("meal-plan clear-slot failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  clearWeek: publicProcedure
    .input(z.object({ weekKey: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { eq, and } = await import("drizzle-orm");
        const { mealPlanSlots } = await import("@/lib/db/y4-tables");
        const db = ctx.db as import("@/lib/db").Database;
        await db
          .delete(mealPlanSlots)
          .where(
            and(
              eq(mealPlanSlots.ownerId, ctx.userId),
              eq(mealPlanSlots.weekKey, input.weekKey),
            ),
          );
        return { persisted: true as const };
      } catch (err) {
        console.warn("meal-plan clear-week failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  listWeek: publicProcedure
    .input(z.object({ weekKey: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { slots: [] };
      try {
        const { eq, and } = await import("drizzle-orm");
        const { mealPlanSlots } = await import("@/lib/db/y4-tables");
        const db = ctx.db as import("@/lib/db").Database;
        const rows = await db
          .select({
            slot: mealPlanSlots.slot,
            recipeSlug: mealPlanSlots.recipeSlug,
            source: mealPlanSlots.source,
          })
          .from(mealPlanSlots)
          .where(
            and(
              eq(mealPlanSlots.ownerId, ctx.userId),
              eq(mealPlanSlots.weekKey, input.weekKey),
            ),
          );
        return { slots: rows };
      } catch (err) {
        console.warn("meal-plan list failed:", err);
        return { slots: [] };
      }
    }),
});
