import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";

/**
 * Nutrition-diary sync (#1 depth work) — the server-of-record counterpart to
 * the localStorage diary store. Device-as-user rows (ctx.userId = device id,
 * same model as cook_sessions). Pushes are IDEMPOTENT: (user_id, at) is unique
 * and upserts win, so the client outbox can retry safely. Removals are
 * tombstones (deleted=true) so other devices converge instead of resurrecting.
 *
 * Degrades gracefully: without DATABASE_URL, push/pull return
 * { persisted/available: false } and localStorage stays the source of truth.
 */

const entrySchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  at: z.string().min(8).max(64),
  slug: z.string().min(1).max(200),
  name: z.string().min(1).max(300),
  servings: z.number().positive().max(99),
  brand: z.string().max(200).nullish(),
  nutrition: z.record(z.string(), z.unknown()).nullish(),
  auto: z.boolean().optional(),
  deleted: z.boolean().optional(),
});

const kvSchema = z.object({
  key: z.enum(["personal-profile", "streak-freezes", "nutrient-goals"]),
  value: z.record(z.string(), z.unknown()),
});

export const diaryRouter = router({
  push: publicProcedure
    .input(
      z.object({
        entries: z.array(entrySchema).max(200).default([]),
        kv: z.array(kvSchema).max(10).default([]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      if (input.entries.length === 0 && input.kv.length === 0)
        return { persisted: true as const };
      try {
        const { sql } = await import("drizzle-orm");
        const { diaryEntries, deviceKv, users } =
          await import("@/lib/db/schema");
        const db = ctx.db as import("@/lib/db").Database;
        const userId = ctx.userId;

        await db.insert(users).values({ id: userId }).onConflictDoNothing();

        for (const e of input.entries) {
          await db
            .insert(diaryEntries)
            .values({
              userId,
              day: e.day,
              at: e.at,
              slug: e.slug,
              name: e.name,
              servings: e.servings,
              brand: e.brand ?? null,
              nutrition:
                (e.nutrition as Record<string, unknown> | null) ?? null,
              auto: e.auto ?? false,
              deleted: e.deleted ?? false,
            })
            .onConflictDoUpdate({
              target: [diaryEntries.userId, diaryEntries.at],
              set: {
                servings: e.servings,
                deleted: e.deleted ?? false,
                updatedAt: sql`now()`,
              },
            });
        }
        for (const row of input.kv) {
          await db
            .insert(deviceKv)
            .values({ userId, key: row.key, value: row.value })
            .onConflictDoUpdate({
              target: [deviceKv.userId, deviceKv.key],
              set: { value: row.value, updatedAt: sql`now()` },
            });
        }
        return { persisted: true as const };
      } catch {
        return { persisted: false as const };
      }
    }),

  pull: publicProcedure
    .input(z.object({ daysBack: z.number().int().min(1).max(90).default(90) }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) {
        return { available: false as const, entries: [], kv: [] };
      }
      try {
        const { and, eq, gte } = await import("drizzle-orm");
        const { diaryEntries, deviceKv } = await import("@/lib/db/schema");
        const db = ctx.db as import("@/lib/db").Database;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - input.daysBack);
        const cutoffDay = `${cutoff.getFullYear()}-${String(
          cutoff.getMonth() + 1,
        ).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;

        const entries = await db
          .select()
          .from(diaryEntries)
          .where(
            and(
              eq(diaryEntries.userId, ctx.userId),
              gte(diaryEntries.day, cutoffDay),
            ),
          );
        const kv = await db
          .select()
          .from(deviceKv)
          .where(eq(deviceKv.userId, ctx.userId));
        return {
          available: true as const,
          entries: entries.map((e) => ({
            day: e.day,
            at: e.at,
            slug: e.slug,
            name: e.name,
            servings: e.servings,
            brand: e.brand,
            nutrition: e.nutrition,
            auto: e.auto,
            deleted: e.deleted,
          })),
          kv: kv.map((r) => ({ key: r.key, value: r.value })),
        };
      } catch {
        return { available: false as const, entries: [], kv: [] };
      }
    }),
});
