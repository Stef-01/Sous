import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";
import { userRecipeSchema } from "@/types/user-recipe";

/**
 * Custom-recipes write path (Supabase-backed) — Stage D of
 * docs/MVP-FEATURE-PLAN.md.
 *
 * Persists user-authored recipes to `user_recipes` so they sync across
 * devices and become a server-of-record. localStorage (the recipe-draft
 * store) stays the optimistic source of truth; this is write-through.
 * The cook flow already resolves user recipes through the quest shell
 * via `user-recipe-adapter.ts`. Degrades gracefully when the DB is
 * unavailable.
 */
const toDate = (s: string | null | undefined): Date | null =>
  s ? new Date(s) : null;

export const recipesRouter = router({
  upsert: publicProcedure
    .input(userRecipeSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { userRecipes } = await import("@/lib/db/y2-tables");
        const db = ctx.db as import("@/lib/db").Database;
        const userId = ctx.userId;
        const { users } = await import("@/lib/db/schema");
        await db.insert(users).values({ id: userId }).onConflictDoNothing();

        // Mutable columns (everything the author can change).
        const fields = {
          schemaVersion: input.schemaVersion,
          slug: input.slug,
          title: input.title,
          dishName: input.dishName,
          cuisineFamily: input.cuisineFamily,
          flavorProfile: input.flavorProfile,
          dietaryFlags: input.dietaryFlags,
          temperature: input.temperature,
          skillLevel: input.skillLevel,
          prepTimeMinutes: input.prepTimeMinutes,
          cookTimeMinutes: input.cookTimeMinutes,
          serves: input.serves,
          heroImageUrl: input.heroImageUrl ?? null,
          description: input.description,
          ingredients: input.ingredients,
          steps: input.steps,
          source: input.source,
          nourishApprovedAt: toDate(input.nourishApprovedAt),
          nourishApprovedBy: input.nourishApprovedBy ?? null,
          authorDisplayName: input.authorDisplayName ?? null,
          updatedAt: new Date(),
        };

        await db
          .insert(userRecipes)
          .values({
            id: input.id,
            ownerId: userId,
            createdAt: toDate(input.createdAt) ?? new Date(),
            ...fields,
          })
          .onConflictDoUpdate({ target: userRecipes.id, set: fields });

        return { persisted: true as const };
      } catch (err) {
        console.warn("recipe upsert failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  remove: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { eq, and } = await import("drizzle-orm");
        const { userRecipes } = await import("@/lib/db/y2-tables");
        const db = ctx.db as import("@/lib/db").Database;
        await db
          .delete(userRecipes)
          .where(
            and(
              eq(userRecipes.id, input.id),
              eq(userRecipes.ownerId, ctx.userId),
            ),
          );
        return { persisted: true as const };
      } catch (err) {
        console.warn("recipe remove failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  listMine: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.db || !ctx.userId) return { recipes: [] };
    try {
      const { eq, desc } = await import("drizzle-orm");
      const { userRecipes } = await import("@/lib/db/y2-tables");
      const db = ctx.db as import("@/lib/db").Database;
      const rows = await db
        .select()
        .from(userRecipes)
        .where(eq(userRecipes.ownerId, ctx.userId))
        .orderBy(desc(userRecipes.updatedAt));
      return { recipes: rows };
    } catch (err) {
      console.warn("recipe list failed:", err);
      return { recipes: [] };
    }
  }),
});
