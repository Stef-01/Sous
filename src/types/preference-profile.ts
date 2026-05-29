/**
 * Preference profile + signals — Zod schema (Y5 C foundation).
 *
 * Each user action emits a typed signal (swipe, cook, reroll, save,
 * skip). Signals decay over a 90-day window into per-tag weights
 * that form an editable preference profile. The profile is the
 * source of truth for personalised recommendations across
 * QuestCard / ResultStack / search / Eat Out.
 *
 * Manual user edits override inferred weights — the user is always
 * source of truth, the ML output is a hint they can edit.
 *
 * Pure / dependency-free (Zod is the only runtime).
 *
 * See `docs/INTELLIGENCE-LAYER-PLAN.md` for full architecture.
 */

import { z } from "zod";

// ── Signal events ────────────────────────────────────────────

export const signalKindEnum = z.enum([
  "swipe-right",
  "swipe-left",
  "cooked",
  "rerolled",
  "saved",
  "skipped",
  "search-issued",
  "search-result-tapped",
]);
export type SignalKind = z.infer<typeof signalKindEnum>;

/** Time-of-day buckets — drives the time-aware suggestion layer. */
export const timeOfDayEnum = z.enum([
  "morning", // 05:00–11:00
  "lunch", // 11:00–14:00
  "afternoon", // 14:00–17:00
  "dinner", // 17:00–21:00
  "late-night", // 21:00–05:00
]);
export type TimeOfDay = z.infer<typeof timeOfDayEnum>;

/** Day-of-week (0 = Sunday, 6 = Saturday) — JS Date.getDay() shape. */
export const dayOfWeekEnum = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);
export type DayOfWeek = z.infer<typeof dayOfWeekEnum>;

export const signalFacetsSchema = z.object({
  /** Cuisine slug, e.g. "indian". Empty string when unknown. */
  cuisine: z.string(),
  /** Lowercase flavor adjective list. */
  flavors: z.array(z.string()),
  /** Lowercase protein names. */
  proteins: z.array(z.string()),
  /** Dish-class slug (curry / bowl / noodle / etc.). */
  dishClass: z.string(),
  /** Lowercase ingredient names for fine-grained matching. */
  ingredients: z.array(z.string()),
});
export type SignalFacets = z.infer<typeof signalFacetsSchema>;

export const preferenceSignalSchema = z.object({
  id: z.string().min(1).max(80),
  kind: signalKindEnum,
  facets: signalFacetsSchema,
  capturedAt: z.string().datetime(),
  timeOfDay: timeOfDayEnum,
  dayOfWeek: dayOfWeekEnum,
});
export type PreferenceSignal = z.infer<typeof preferenceSignalSchema>;

// ── Aggregated profile ───────────────────────────────────────

/** Per-tag weights, lowercase tag → weight in [-1, 1]. */
export const tagWeightMapSchema = z.record(
  z.string(),
  z.number().min(-1).max(1),
);
export type TagWeightMap = z.infer<typeof tagWeightMapSchema>;

export const inferredTagsSchema = z.object({
  cuisines: tagWeightMapSchema,
  flavors: tagWeightMapSchema,
  proteins: tagWeightMapSchema,
  dishClasses: tagWeightMapSchema,
});
export type InferredTags = z.infer<typeof inferredTagsSchema>;

export const manualTagsSchema = z.object({
  /** User-curated likes — boost above any inferred weight. */
  likes: z.array(z.string()),
  /** User-curated dislikes — hard suppress (-1.0 effective). */
  dislikes: z.array(z.string()),
  /** "Don't infer this" — even if signals point at it, suppress. */
  suppressed: z.array(z.string()),
});
export type ManualTags = z.infer<typeof manualTagsSchema>;

export const timeOfDayPatternSchema = z.object({
  /** Top tags for this bucket (cuisine + flavor + dishClass mix). */
  topTags: z.array(z.string()),
  /** [0, 1] confidence — based on signal volume in the bucket. */
  confidence: z.number().min(0).max(1),
});
export type TimeOfDayPattern = z.infer<typeof timeOfDayPatternSchema>;

export const PREFERENCE_PROFILE_SCHEMA_VERSION = 1 as const;

export const preferenceProfileSchema = z.object({
  schemaVersion: z.literal(PREFERENCE_PROFILE_SCHEMA_VERSION),
  inferredTags: inferredTagsSchema,
  manualTags: manualTagsSchema,
  timeOfDayPatterns: z.object({
    morning: timeOfDayPatternSchema,
    lunch: timeOfDayPatternSchema,
    afternoon: timeOfDayPatternSchema,
    dinner: timeOfDayPatternSchema,
    "late-night": timeOfDayPatternSchema,
  }),
  /** Total signal count contributing to the profile. Drives
   *  cold-start vs confident-recommendation messaging. */
  signalCount: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});
export type PreferenceProfile = z.infer<typeof preferenceProfileSchema>;

// ── Confidence tiers ─────────────────────────────────────────

export type ConfidenceTier =
  | "cold-start"
  | "weak"
  | "medium"
  | "strong"
  | "very-strong";

/** Pure: tier the profile from signal count. Drives copy + UI
 *  decisions (e.g., when to surface time-of-day patterns). */
export function confidenceTier(signalCount: number): ConfidenceTier {
  if (!Number.isFinite(signalCount) || signalCount <= 0) return "cold-start";
  if (signalCount < 5) return "weak";
  if (signalCount < 20) return "medium";
  if (signalCount < 50) return "strong";
  return "very-strong";
}

// ── Recipe provenance (Verified vs Unverified) ───────────────

export const recipeSourceEnum = z.enum([
  "nourish-verified", // catalog seed + clinician-approved
  "nourish-curated", // catalog seed without clinician layer
  "user-authored", // saved from /path/recipes/new
  "agent-found", // Anthropic+Tavily agent fetched
]);
export type RecipeSource = z.infer<typeof recipeSourceEnum>;

export const recipeProvenanceSchema = z.object({
  source: recipeSourceEnum,
  /** External URL when source === "agent-found". */
  sourceUrl: z.string().url().optional(),
  /** Human-readable source title. */
  sourceTitle: z.string().optional(),
  /** ISO timestamp the snapshot was fetched (agent-found only). */
  fetchedAt: z.string().datetime().optional(),
  /** Brief safety/health appraisal from the agent. */
  agentNote: z.string().max(500).optional(),
});
export type RecipeProvenance = z.infer<typeof recipeProvenanceSchema>;

// ── Defaults ─────────────────────────────────────────────────

const emptyTimeOfDayPattern: TimeOfDayPattern = {
  topTags: [],
  confidence: 0,
};

export const FRESH_PREFERENCE_PROFILE: PreferenceProfile = {
  schemaVersion: PREFERENCE_PROFILE_SCHEMA_VERSION,
  inferredTags: {
    cuisines: {},
    flavors: {},
    proteins: {},
    dishClasses: {},
  },
  manualTags: {
    likes: [],
    dislikes: [],
    suppressed: [],
  },
  timeOfDayPatterns: {
    morning: emptyTimeOfDayPattern,
    lunch: emptyTimeOfDayPattern,
    afternoon: emptyTimeOfDayPattern,
    dinner: emptyTimeOfDayPattern,
    "late-night": emptyTimeOfDayPattern,
  },
  signalCount: 0,
  updatedAt: new Date(0).toISOString(),
};

/** Pure: factory for a fresh profile (typed clone of the constant).
 *  Always returns a brand-new object — never share mutable state. */
export function freshPreferenceProfile(): PreferenceProfile {
  return {
    ...FRESH_PREFERENCE_PROFILE,
    inferredTags: {
      cuisines: {},
      flavors: {},
      proteins: {},
      dishClasses: {},
    },
    manualTags: {
      likes: [],
      dislikes: [],
      suppressed: [],
    },
    timeOfDayPatterns: {
      morning: { ...emptyTimeOfDayPattern, topTags: [] },
      lunch: { ...emptyTimeOfDayPattern, topTags: [] },
      afternoon: { ...emptyTimeOfDayPattern, topTags: [] },
      dinner: { ...emptyTimeOfDayPattern, topTags: [] },
      "late-night": { ...emptyTimeOfDayPattern, topTags: [] },
    },
  };
}
