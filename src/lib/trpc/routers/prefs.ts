import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";

/**
 * Preferences / personalization write path (Supabase-backed) — Stage E
 * of docs/MVP-FEATURE-PLAN.md.
 *
 *   - setParentProfile → `parent_profile` (one row per user, upsert)
 *   - logKidsAteIt     → `kids_ate_it_log` (append-only verdict)
 *   - saveStepNote     → `recipe_overlay`  (one note per recipe+step)
 *
 * Same graceful contract as the other routers: localStorage stays the
 * optimistic source of truth; these are best-effort write-throughs.
 */
export const prefsRouter = router({
  setParentProfile: publicProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        ageBand: z.string().min(1),
        spiceTolerance: z.number().int().min(1).max(5),
        flaggedAllergens: z.array(z.string()).optional(),
        enabledAt: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { parentProfile, users } = await import("@/lib/db/schema");
        const db = ctx.db as import("@/lib/db").Database;
        const userId = ctx.userId;
        await db.insert(users).values({ id: userId }).onConflictDoNothing();

        const fields = {
          enabled: input.enabled,
          ageBand: input.ageBand,
          spiceTolerance: input.spiceTolerance,
          flaggedAllergens: input.flaggedAllergens ?? [],
          enabledAt: input.enabledAt ? new Date(input.enabledAt) : null,
          updatedAt: new Date(),
        };
        await db
          .insert(parentProfile)
          .values({ userId, ...fields })
          .onConflictDoUpdate({ target: parentProfile.userId, set: fields });
        return { persisted: true as const };
      } catch (err) {
        console.warn("parent-profile persist failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  logKidsAteIt: publicProcedure
    .input(
      z.object({
        cookSessionId: z.string().min(1),
        recipeSlug: z.string().min(1),
        verdict: z.enum(["yes", "some", "no"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { kidsAteItLog, users } = await import("@/lib/db/schema");
        const db = ctx.db as import("@/lib/db").Database;
        const userId = ctx.userId;
        await db.insert(users).values({ id: userId }).onConflictDoNothing();
        await db.insert(kidsAteItLog).values({
          cookSessionId: input.cookSessionId,
          userId,
          recipeSlug: input.recipeSlug,
          verdict: input.verdict,
        });
        return { persisted: true as const };
      } catch (err) {
        console.warn("kids-ate-it persist failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  saveStepNote: publicProcedure
    .input(
      z.object({
        recipeSlug: z.string().min(1),
        stepIndex: z.number().int().min(0),
        note: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { recipeOverlay, users } = await import("@/lib/db/schema");
        const db = ctx.db as import("@/lib/db").Database;
        const userId = ctx.userId;
        await db.insert(users).values({ id: userId }).onConflictDoNothing();
        await db
          .insert(recipeOverlay)
          .values({
            userId,
            recipeSlug: input.recipeSlug,
            stepIndex: input.stepIndex,
            note: input.note,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [
              recipeOverlay.userId,
              recipeOverlay.recipeSlug,
              recipeOverlay.stepIndex,
            ],
            set: { note: input.note, updatedAt: new Date() },
          });
        return { persisted: true as const };
      } catch (err) {
        console.warn("step-note persist failed, staying local:", err);
        return { persisted: false as const };
      }
    }),
});
