import { z } from "zod";

/**
 * HouseholdMember — Zod schema for "who's at the table" memory.
 *
 * W32 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint G W32-W36
 * household memory). Each member carries the small-but-load-
 * bearing facts the pairing engine needs to personalise per
 * person:
 *
 *   - ageBand → drives the W17 KidFriendlinessSignals scoring
 *     and the spice-rewrite intensity in `lib/parent-mode/`.
 *   - spiceTolerance → upper bound on how heat-forward the
 *     pairing engine can recommend.
 *   - dietaryFlags → hard filters (vegan / gluten-free /
 *     dairy-free / nut-allergy / shellfish-allergy / etc.).
 *   - cuisinePreferences → soft signal layered into the
 *     pairing engine's cuisineFit dimension (W30 V2 trainer
 *     can pick up per-member rotation patterns later).
 *
 * Versioning: every payload carries `schemaVersion` so older
 * stored payloads can be migrated in-place when the shape
 * evolves. Source of truth is the schema; TypeScript type is
 * inferred via `z.infer`.
 *
 * Vibecode-scoped: localStorage persistence first (W32). The
 * Drizzle/Postgres swap is a founder-unlock day post-W52 per
 * FOUNDER-UNLOCK-RUNBOOK.
 */

export const HOUSEHOLD_SCHEMA_VERSION = 1 as const;

export const HOUSEHOLD_AGE_BANDS = [
  "child",
  "teen",
  "adult",
  "senior",
] as const;
export type HouseholdAgeBand = (typeof HOUSEHOLD_AGE_BANDS)[number];

export const householdMemberSchema = z.object({
  /** Schema-version header — bumped on breaking changes. */
  schemaVersion: z.literal(HOUSEHOLD_SCHEMA_VERSION),

  /** Stable identifier — `mem-<n>` for authored, anything for
   *  migrated payloads. */
  id: z.string().min(1).max(64),

  /** Display name. Trimmed; cap at 40 chars so the picker chip
   *  stays single-line on a 375px viewport. */
  name: z.string().min(1).max(40),

  /** Age band — drives kid-friendliness scoring + spice rewrite
   *  intensity. Defaults to "adult" so the substrate is safe for
   *  single-user mode where the user just adds themselves. */
  ageBand: z.enum(HOUSEHOLD_AGE_BANDS).default("adult"),

  /** 1 = avoid heat altogether, 5 = bring it on. Mirrors the
   *  existing `useSpiceTolerance` 1-5 scale so the two systems
   *  speak the same numbers. */
  spiceTolerance: z.number().int().min(1).max(5).default(3),

  /** Hard filters — labels match the seed-catalog dietaryFlags
   *  vocabulary so pairing-engine filters compose. */
  dietaryFlags: z.array(z.string().min(1).max(40)).max(20).default([]),

  /** Soft preferences — cuisine families this member likes. */
  cuisinePreferences: z.array(z.string().min(1).max(40)).max(20).default([]),

  /** Avatar emoji or short label. Capped at 8 chars so callers
   *  can't ship a paragraph here. */
  avatar: z.string().max(8).default(""),

  /** ISO timestamp the member was added. */
  createdAt: z.string().datetime(),
});

export type HouseholdMember = z.infer<typeof householdMemberSchema>;

/** Slugify a name into a stable id-friendly suffix. Pure helper
 *  exported so the id-allocator (in household-helpers.ts) and
 *  any future migration code stay consistent. */
export function slugifyMemberName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}
