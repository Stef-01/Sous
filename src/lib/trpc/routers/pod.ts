import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";
import {
  challengePodSchema,
  podChallengeWeekSchema,
  podSubmissionSchema,
} from "@/types/challenge-pod";

/**
 * Cooking-pod write path (Supabase-backed) — Stage G of
 * docs/MVP-FEATURE-PLAN.md. Mirrors `use-current-pod` onto the four pod
 * tables (pods, pod_members, pod_challenge_weeks, pod_submissions).
 *
 * `pods.owner_id` is the device user (the FK target); local pod members
 * are not necessarily app users, so `pod_members.user_id` is null.
 * Members are upserted (not delete-and-replaced) so a member's
 * submissions are never cascade-deleted. Graceful no-db fallback.
 */
const toDate = (s?: string | null): Date | null => (s ? new Date(s) : null);

export const podRouter = router({
  savePod: publicProcedure
    .input(challengePodSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { pods, podMembers } = await import("@/lib/db/y2-tables");
        const { users } = await import("@/lib/db/schema");
        const db = ctx.db as import("@/lib/db").Database;
        const ownerId = ctx.userId;
        await db.insert(users).values({ id: ownerId }).onConflictDoNothing();

        const podFields = {
          schemaVersion: input.schemaVersion,
          name: input.name,
          ownerId,
          adminIds: input.adminIds,
          dietaryFlags: input.dietaryFlags,
          podTimezone: input.podTimezone,
          revealAtHour: input.revealAtHour,
          inviteCode: input.inviteCode,
          inviteCodeExpiresAt: toDate(input.inviteCodeExpiresAt),
          pausedThisWeek: input.pausedThisWeek,
        };
        await db
          .insert(pods)
          .values({
            id: input.id,
            createdAt: toDate(input.createdAt) ?? new Date(),
            ...podFields,
          })
          .onConflictDoUpdate({ target: pods.id, set: podFields });

        for (const m of input.members) {
          const memberFields = {
            podId: input.id,
            userId: null,
            schemaVersion: m.schemaVersion,
            displayName: m.displayName,
            avatar: m.avatar,
            ageBand: m.ageBand,
            dietaryFlags: m.dietaryFlags,
            cuisinePreferences: m.cuisinePreferences,
            vacationSince: toDate(m.vacationSince),
            weeksMissed: m.weeksMissed,
          };
          await db
            .insert(podMembers)
            .values({
              id: m.id,
              joinedAt: toDate(m.joinedAt) ?? new Date(),
              ...memberFields,
            })
            .onConflictDoUpdate({ target: podMembers.id, set: memberFields });
        }
        return { persisted: true as const };
      } catch (err) {
        console.warn("pod save failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  upsertWeek: publicProcedure
    .input(podChallengeWeekSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { podChallengeWeeks } = await import("@/lib/db/y2-tables");
        const db = ctx.db as import("@/lib/db").Database;
        const fields = {
          recipeSlug: input.recipeSlug,
          twist: input.twist ?? null,
          startedAt: toDate(input.startedAt) ?? new Date(),
          donationTagsEnabled: input.donationTagsEnabled,
        };
        await db
          .insert(podChallengeWeeks)
          .values({ podId: input.podId, weekKey: input.weekKey, ...fields })
          .onConflictDoUpdate({
            target: [podChallengeWeeks.podId, podChallengeWeeks.weekKey],
            set: fields,
          });
        return { persisted: true as const };
      } catch (err) {
        console.warn("pod week upsert failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  upsertSubmission: publicProcedure
    .input(podSubmissionSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { podSubmissions } = await import("@/lib/db/y2-tables");
        const db = ctx.db as import("@/lib/db").Database;
        const fields = {
          podId: input.podId,
          weekKey: input.weekKey,
          memberId: input.memberId,
          dayKey: input.dayKey,
          submittedAt: toDate(input.submittedAt) ?? new Date(),
          photoUri: input.photoUri,
          selfRating: input.selfRating,
          caption: input.caption ?? null,
          donateTags: input.donateTags,
          stepCompletion: input.stepCompletion,
          aestheticScore: input.aestheticScore,
          hasStepImage: input.hasStepImage,
          computedScore: input.computedScore,
        };
        await db
          .insert(podSubmissions)
          .values({ id: input.id, ...fields })
          .onConflictDoUpdate({ target: podSubmissions.id, set: fields });
        return { persisted: true as const };
      } catch (err) {
        console.warn("pod submission upsert failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  removeSubmission: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { eq } = await import("drizzle-orm");
        const { podSubmissions } = await import("@/lib/db/y2-tables");
        const db = ctx.db as import("@/lib/db").Database;
        await db.delete(podSubmissions).where(eq(podSubmissions.id, input.id));
        return { persisted: true as const };
      } catch (err) {
        console.warn("pod submission remove failed, staying local:", err);
        return { persisted: false as const };
      }
    }),

  clearPod: publicProcedure
    .input(z.object({ podId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db || !ctx.userId) return { persisted: false as const };
      try {
        const { eq, and } = await import("drizzle-orm");
        const { pods } = await import("@/lib/db/y2-tables");
        const db = ctx.db as import("@/lib/db").Database;
        // Cascade removes members, weeks, submissions. Owner-scoped.
        await db
          .delete(pods)
          .where(and(eq(pods.id, input.podId), eq(pods.ownerId, ctx.userId)));
        return { persisted: true as const };
      } catch (err) {
        console.warn("pod clear failed, staying local:", err);
        return { persisted: false as const };
      }
    }),
});
