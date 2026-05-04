import { z } from "zod";

/**
 * ChallengePod — Zod schemas for the W45-W46 Cooking Pod
 * Challenge per `docs/COOKING-POD-CHALLENGE.md` V2.
 *
 * V1 is single-pod-per-device localStorage (Stefan-confirmed
 * vibecode acceptable). Multi-device public launch lands at
 * Year-2 W1-W4 when auth + Postgres + R2 unlock.
 *
 * Source-of-truth pattern from W17 UserRecipe: Zod schema is the
 * source; TypeScript types are inferred via `z.infer`.
 */

export const POD_SCHEMA_VERSION = 1 as const;

// ── PodMember ────────────────────────────────────────────────

/** A pod member is a *projection* of a household member at the
 *  moment of join. The pod stores its own copy of dietary flags
 *  + cuisine prefs so the user changing their household profile
 *  later doesn't silently mutate the pod's filter contract.
 *  Refresh is a future UX exercise. */
export const podMemberSchema = z.object({
  schemaVersion: z.literal(POD_SCHEMA_VERSION),
  id: z.string().min(1).max(64),
  displayName: z.string().min(1).max(40),
  /** Emoji avatar; capped at 8 chars per the W32 household
   *  member convention. */
  avatar: z.string().max(8).default(""),
  ageBand: z.enum(["child", "teen", "adult", "senior"]).default("adult"),
  dietaryFlags: z.array(z.string().min(1).max(40)).max(20).default([]),
  cuisinePreferences: z.array(z.string().min(1).max(40)).max(20).default([]),
  /** ISO timestamp this member joined the pod. */
  joinedAt: z.string().datetime(),
  /** ISO timestamp the member entered vacation mode (3 missed
   *  weeks → auto-vacation). null = active. */
  vacationSince: z.string().datetime().nullable().optional(),
  /** Rolling counter for "consecutive weeks with no submission".
   *  Resets to 0 on any submission; auto-vacation triggers at 3. */
  weeksMissed: z.number().int().min(0).default(0),
});

export type PodMember = z.infer<typeof podMemberSchema>;

// ── ChallengePod ─────────────────────────────────────────────

export const challengePodSchema = z.object({
  schemaVersion: z.literal(POD_SCHEMA_VERSION),
  /** Stable identifier — `pod-<slug>-<n>` for authored. */
  id: z.string().min(1).max(64),
  /** Display name (e.g. "Sunday cooks club"). */
  name: z.string().min(1).max(60),
  /** ISO timestamp the pod was created. */
  createdAt: z.string().datetime(),
  /** Member id of the pod's owner — kept distinct from the
   *  `adminIds` list so an owner can't accidentally remove
   *  themselves and orphan the pod. */
  ownerId: z.string().min(1).max(64),
  /** Shared admin per Stefan's directive — multiple members can
   *  hold admin power. The owner is implicitly an admin
   *  regardless of inclusion in this list. */
  adminIds: z.array(z.string().min(1).max(64)).max(8).default([]),
  /** Member roster. 2-8 members per the V2 design (intimacy
   *  matters; workplace pods sub-divide via the Year-2 work). */
  members: z.array(podMemberSchema).min(1).max(8),
  /** Dietary flags binding the weekly challenge picker — the
   *  union of all members' flags at pod-creation time. Refresh
   *  via the admin "rescan members" action. */
  dietaryFlags: z.array(z.string().min(1).max(40)).max(20).default([]),
  /** IANA timezone (e.g. "America/Los_Angeles"). Empty string is
   *  the V1 sentinel for "host-local" (single-pod-per-device);
   *  multi-tz pods get explicit IANA values when the auth/server
   *  unlock lands. */
  podTimezone: z.string().max(64).default(""),
  /** Hour of Sunday at which the gallery reveals (0-23). Default
   *  21 (9pm) per Stefan's directive. */
  revealAtHour: z.number().int().min(0).max(23).default(21),
  /** 6-digit invite code. Letters or digits acceptable; cap at
   *  8 chars to give room for human-readable variants. */
  inviteCode: z
    .string()
    .min(4)
    .max(8)
    .regex(/^[A-Z0-9]+$/, "invite code must be A-Z / 0-9 only"),
  /** Optional ISO timestamp the invite code expires. null =
   *  never. */
  inviteCodeExpiresAt: z.string().datetime().nullable().optional(),
  /** Pod is paused (admin-set "vacation week") — gallery doesn't
   *  reveal, no challenge for the week. */
  pausedThisWeek: z.boolean().default(false),
});

export type ChallengePod = z.infer<typeof challengePodSchema>;

// ── PodChallengeWeek ─────────────────────────────────────────

export const podChallengeWeekSchema = z.object({
  schemaVersion: z.literal(POD_SCHEMA_VERSION),
  /** ISO 8601 week key — "2026-W18". Computed via
   *  `weekKey(date)` from `lib/pod/pod-score.ts`. */
  weekKey: z.string().regex(/^\d{4}-W\d{2}$/),
  podId: z.string().min(1).max(64),
  /** The seed-catalog slug for this week's challenge recipe.
   *  Stefan's directive: seed-only V1 (no user-authored). */
  recipeSlug: z.string().min(1).max(80),
  /** Optional creative twist voted by the pod
   *  (vegetarian / spicy / leftover-mode / kids-cook / budget). */
  twist: z.string().max(40).nullable().optional(),
  /** ISO timestamp the week started — Monday 00:00 pod-local. */
  startedAt: z.string().datetime(),
  /** Donate-a-Cook tags enabled for this week. */
  donationTagsEnabled: z.boolean().default(true),
});

export type PodChallengeWeek = z.infer<typeof podChallengeWeekSchema>;

// ── PodSubmission ────────────────────────────────────────────

export const DONATE_TAGS = ["shared", "bake-sale", "cooked-together"] as const;
export type DonateTag = (typeof DONATE_TAGS)[number];

export const podSubmissionSchema = z.object({
  schemaVersion: z.literal(POD_SCHEMA_VERSION),
  id: z.string().min(1).max(64),
  podId: z.string().min(1).max(64),
  weekKey: z.string().regex(/^\d{4}-W\d{2}$/),
  memberId: z.string().min(1).max(64),
  /** Local-day key in YYYY-MM-DD format for the daily-cap
   *  enforcement. Computed via `dayKey(date)` from pod-score. */
  dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** ISO timestamp the photo was submitted. Server-stamped when
   *  auth lands; client-stamped V1. */
  submittedAt: z.string().datetime(),
  /** Photo URL or data URI. R2 storage post-Y2 unlock. */
  photoUri: z.string().min(1).max(8192),
  /** 1-5 self-rating from the win-screen. Fed through
   *  `normaliseStarRating` before scoring. */
  selfRating: z.number().int().min(1).max(5),
  /** Optional "what I'd do differently" caption. */
  caption: z.string().max(280).nullable().optional(),
  /** Donate-a-Cook tags (V1 honour-system). */
  donateTags: z.array(z.enum(DONATE_TAGS)).max(3).default([]),
  /** 0..1 fraction of guided cook steps actually tapped through.
   *  Snapshotted from the cook store at submit time. */
  stepCompletion: z.number().min(0).max(1),
  /** 0..1 AI vision aesthetic score. V1 default 0.5. */
  aestheticScore: z.number().min(0).max(1).default(0.5),
  /** Did the cook use a per-step image (visual-mode authored)? */
  hasStepImage: z.boolean().default(false),
  /** Snapshotted score at submit time. Recomputed lazily by the
   *  pod home, but stored so the gallery can render without
   *  re-running the math on every render. */
  computedScore: z.number().min(0).max(100),
});

export type PodSubmission = z.infer<typeof podSubmissionSchema>;

// ── Pod state envelope ───────────────────────────────────────

/** The localStorage payload — a single pod with its current
 *  challenge week + accumulated submissions. V1 single-pod-per-
 *  device; the multi-pod design + server-side schema land Year-2. */
export const podStateSchema = z.object({
  schemaVersion: z.literal(POD_SCHEMA_VERSION),
  pod: challengePodSchema.nullable(),
  /** Map of weekKey → PodChallengeWeek. Past weeks accumulate
   *  for gallery review. */
  weeks: z.record(podChallengeWeekSchema).default({}),
  /** Submissions by submission id. Filterable by weekKey. */
  submissions: z.record(podSubmissionSchema).default({}),
});

export type PodState = z.infer<typeof podStateSchema>;
