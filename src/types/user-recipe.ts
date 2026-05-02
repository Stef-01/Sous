import { z } from "zod";

/**
 * UserRecipe — Zod schema for user-authored recipes (Sprint D).
 *
 * W17 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint D, recipe
 * authoring loop, originally scheduled W16). Source of truth for
 * the TS type — `UserRecipe = z.infer<typeof userRecipeSchema>`.
 *
 * Versioning: every payload carries a top-level `schemaVersion`.
 * When the shape evolves, the parser can detect older payloads and
 * migrate them in-place. localStorage payloads from previous
 * versions stay readable.
 *
 * Wire compatibility: the shape mirrors the seed `Dish` shape used
 * in `src/data/meals.json` and `src/data/sides.json` so an authored
 * recipe can be cooked through the same Mission → Grab → Cook → Win
 * flow as a seed recipe (CLAUDE.md rule 4: every recipe renders
 * through the same Quest shell).
 *
 * Vibecode-scoped: localStorage persistence first; Drizzle/Postgres
 * swap is a founder-unlock day post-W26 per FOUNDER-UNLOCK-RUNBOOK.
 */

export const SCHEMA_VERSION = 1 as const;

export const userIngredientSchema = z.object({
  /** Stable id — `<recipe-slug>-i-<n>` for authored, anything for migrated. */
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  quantity: z.string().min(1).max(120),
  isOptional: z.boolean().default(false),
  /** Free-text fallback for substitutions. */
  substitution: z.string().nullable().optional(),
});

export const userStepSchema = z.object({
  /** 1-indexed step number; uniqueness enforced at the recipe level. */
  stepNumber: z.number().int().min(1),
  /** The visible step instruction. Cap at 3000 chars per the W17
   *  stress test — generous enough for any real step but not
   *  unbounded. */
  instruction: z.string().min(1).max(3000),
  /** Optional timer in seconds; rendered as a chip on the step card. */
  timerSeconds: z.number().int().min(1).max(7200).nullable().optional(),
  /** Optional warning shown as a mistake chip. */
  mistakeWarning: z.string().max(400).nullable().optional(),
  /** Optional pro-tip shown as a hack chip. */
  quickHack: z.string().max(400).nullable().optional(),
  /** Optional doneness cue (visual / audible / textural). */
  donenessCue: z.string().max(400).nullable().optional(),
});

export const userRecipeSchema = z.object({
  /** Schema-version header. Bumped on breaking changes; older
   *  payloads can be migrated in-place. */
  schemaVersion: z.literal(SCHEMA_VERSION),

  /** Stable identifier the cook flow consumes. */
  id: z.string().min(1),
  /** URL-safe slug derived from the title. */
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, {
      message: "slug must be lowercase letters, digits, hyphens",
    }),

  /** Display title (what the user typed). */
  title: z.string().min(1).max(120),
  /** Display dish name (often == title, but separable for parity
   *  with seed shape). */
  dishName: z.string().min(1).max(120),
  /** Cuisine family — picked from a known catalog or 'other'. */
  cuisineFamily: z.string().min(1).max(60),

  /** 0-N flavor-profile tags. */
  flavorProfile: z.array(z.string().min(1).max(40)).max(20).default([]),
  /** 0-N dietary flags ('vegan' / 'gluten-free' etc.). */
  dietaryFlags: z.array(z.string().min(1).max(40)).max(10).default([]),

  /** Heat / temperature. Mirrors seed shape. */
  temperature: z.enum(["hot", "cold", "room-temp"]).default("hot"),
  /** Skill level. Mirrors seed shape. */
  skillLevel: z
    .enum(["beginner", "intermediate", "advanced"])
    .default("beginner"),

  /** Time budget in minutes. */
  prepTimeMinutes: z.number().int().min(0).max(480),
  cookTimeMinutes: z.number().int().min(0).max(480),
  /** Servings count. */
  serves: z.number().int().min(1).max(20).default(2),

  /** Optional hero image URL. Author can paste; or stays null until
   *  upload pipeline is built (founder-gated R2 unlock). */
  heroImageUrl: z.string().nullable().optional(),

  /** Free-text description for Mission screen. */
  description: z.string().min(1).max(800),

  /** Ingredient list — capped at 50 per the W17 stress test. */
  ingredients: z.array(userIngredientSchema).min(1).max(50),

  /** Step list — capped at 50, validated 1..N stepNumber sequence. */
  steps: z
    .array(userStepSchema)
    .min(1)
    .max(50)
    .refine((arr) => arr.every((s, i) => s.stepNumber === i + 1), {
      message: "stepNumber must be 1-indexed sequential (1, 2, 3, ...)",
    }),

  /** ISO timestamp of authoring. */
  createdAt: z.string().datetime(),
  /** ISO timestamp of last edit. */
  updatedAt: z.string().datetime(),
});

export type UserRecipe = z.infer<typeof userRecipeSchema>;
export type UserIngredient = z.infer<typeof userIngredientSchema>;
export type UserStep = z.infer<typeof userStepSchema>;

/** Result of a parse attempt — discriminated union for callers. */
export type ParseUserRecipeResult =
  | { ok: true; recipe: UserRecipe }
  | { ok: false; reason: string };

/**
 * Parse a raw JSON string (e.g. from localStorage) into a typed
 * UserRecipe. Defends against:
 *   - missing / empty input
 *   - non-JSON / corrupt payload
 *   - non-object root (null, array, primitive)
 *   - missing or wrong-version schemaVersion (future: trigger migration)
 *   - schema validation failures (returns the zod issue path)
 */
export function parseUserRecipeJson(
  raw: string | null | undefined,
): ParseUserRecipeResult {
  if (!raw) return { ok: false, reason: "empty" };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "invalid-json" };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ok: false, reason: "non-object-root" };
  }
  const obj = parsed as { schemaVersion?: unknown };
  if (obj.schemaVersion !== SCHEMA_VERSION) {
    return {
      ok: false,
      reason: `unsupported-schema-version: ${String(obj.schemaVersion)}`,
    };
  }
  const result = userRecipeSchema.safeParse(parsed);
  if (!result.success) {
    return {
      ok: false,
      reason: result.error.issues[0]?.message ?? "validation-failed",
    };
  }
  return { ok: true, recipe: result.data };
}

/**
 * Serialise a recipe to JSON for storage. Round-trips via
 * `parseUserRecipeJson` losslessly.
 */
export function serialiseUserRecipe(recipe: UserRecipe): string {
  return JSON.stringify(recipe);
}

/**
 * Generate a URL-safe slug from a title. Pure helper — multiple
 * authoring surfaces (settings, cook flow, share pipeline) need
 * the same logic.
 */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
