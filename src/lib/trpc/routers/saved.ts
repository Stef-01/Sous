import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";

/**
 * Saved-items write path (Supabase-backed) — Stage C of
 * docs/MVP-FEATURE-PLAN.md.
 *
 *   - saved dishes      → `saved_recipes` (by side-dish slug)
 *   - content bookmarks → `content_bookmarks` (polymorphic kind:itemId)
 *
 * Same contract as the cook-session router: degrades gracefully when the
 * DB is unavailable (returns `{ persisted: false }`), so localStorage
 * stays the source of truth and nothing 500s offline.
 */
export const savedRouter = router({
  // ── Saved dishes ──────────────────────────────────────────
  toggleDish: publicProcedure
    .input(
      z.object({
        sideDishSlug: z.string().min(1),
        saved: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { eq, and } = await import("drizzle-orm");
        const { sideDishes, savedRecipes, users } =
          await import("@/lib/db/schema");
        const db = ctx.db as import("@/lib/db").Database;
        const userId = ctx.userId;

        await db.insert(users).values({ id: userId }).onConflictDoNothing();

        const dish = await db.query.sideDishes.findFirst({
          where: eq(sideDishes.slug, input.sideDishSlug),
          columns: { id: true },
        });
        if (!dish) return { persisted: false as const };

        if (input.saved) {
          await db
            .insert(savedRecipes)
            .values({ userId, sideDishId: dish.id })
            .onConflictDoNothing();
        } else {
          await db
            .delete(savedRecipes)
            .where(
              and(
                eq(savedRecipes.userId, userId),
                eq(savedRecipes.sideDishId, dish.id),
              ),
            );
        }
        return { persisted: true as const };
      } catch (err) {
        console.warn("saved-dish toggle failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  listDishes: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.db || !ctx.userId) return { dishes: [] };
    try {
      const { eq, desc } = await import("drizzle-orm");
      const { sideDishes, savedRecipes } = await import("@/lib/db/schema");
      const db = ctx.db as import("@/lib/db").Database;

      const rows = await db
        .select({
          slug: sideDishes.slug,
          name: sideDishes.name,
          heroImageUrl: sideDishes.heroImageUrl,
          savedAt: savedRecipes.savedAt,
        })
        .from(savedRecipes)
        .innerJoin(sideDishes, eq(savedRecipes.sideDishId, sideDishes.id))
        .where(eq(savedRecipes.userId, ctx.userId))
        .orderBy(desc(savedRecipes.savedAt));
      return { dishes: rows };
    } catch (err) {
      console.warn("saved-dish list failed:", err);
      return { dishes: [] };
    }
  }),

  // ── Content bookmarks ─────────────────────────────────────
  toggleBookmark: publicProcedure
    .input(
      z.object({
        kind: z.string().min(1),
        itemId: z.string().min(1),
        saved: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { eq, and } = await import("drizzle-orm");
        const { contentBookmarks, users } = await import("@/lib/db/schema");
        const db = ctx.db as import("@/lib/db").Database;
        const userId = ctx.userId;

        await db.insert(users).values({ id: userId }).onConflictDoNothing();

        if (input.saved) {
          await db
            .insert(contentBookmarks)
            .values({ userId, kind: input.kind, itemId: input.itemId })
            .onConflictDoNothing();
        } else {
          await db
            .delete(contentBookmarks)
            .where(
              and(
                eq(contentBookmarks.userId, userId),
                eq(contentBookmarks.kind, input.kind),
                eq(contentBookmarks.itemId, input.itemId),
              ),
            );
        }
        return { persisted: true as const };
      } catch (err) {
        console.warn("bookmark toggle failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  listBookmarks: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.db || !ctx.userId) return { bookmarks: [] };
    try {
      const { eq, desc } = await import("drizzle-orm");
      const { contentBookmarks } = await import("@/lib/db/schema");
      const db = ctx.db as import("@/lib/db").Database;

      const rows = await db
        .select({
          kind: contentBookmarks.kind,
          itemId: contentBookmarks.itemId,
          savedAt: contentBookmarks.savedAt,
        })
        .from(contentBookmarks)
        .where(eq(contentBookmarks.userId, ctx.userId))
        .orderBy(desc(contentBookmarks.savedAt));
      return { bookmarks: rows };
    } catch (err) {
      console.warn("bookmark list failed:", err);
      return { bookmarks: [] };
    }
  }),
});
