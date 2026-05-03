/**
 * Y2 Drizzle table definitions.
 *
 * Y2 Sprint A W2. Adds the server-side counterparts to every Y1
 * localStorage-backed Zod schema:
 *
 *   - users: Clerk-tied profile (subset of Clerk's user)
 *   - pods + pod_members + pod_admins + pod_challenge_weeks +
 *     pod_submissions: cooking-pod challenge backend
 *   - user_recipes: user-authored + community recipes server-
 *     side mirror
 *   - recipe_score_breakdowns: Y2 W6 V3 per-dimension trainer
 *     dependency
 *   - notifications: Y2 W19-W22 smart-notification queue
 *
 * Kept in a separate module from `schema.ts` (Y0/Y1 tables) so
 * the Y2 additions are discoverable + the migration boundary
 * is explicit. drizzle-kit's `schemaFilter` config picks both
 * up when generating migrations.
 *
 * Shape parity with the Y1 Zod schemas is enforced by the
 * `y2-shapes.test.ts` parity suite — every field in the Zod
 * source-of-truth has a Drizzle column of the matching nullable
 * disposition.
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ── users ────────────────────────────────────────────────────

/** Mirror of Clerk's user. We keep only what we need to denormalise
 *  the recipe / pod surfaces; full profile stays in Clerk. */
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user id (e.g. user_2x...)
  displayName: text("display_name"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Sync hint — when Clerk webhook last updated the row.
  lastSyncedAt: timestamp("last_synced_at").defaultNow(),
});

// ── user_recipes ────────────────────────────────────────────

/** Server-side mirror of the localStorage UserRecipe. The
 *  source-tag column drives the filter chip + admin queue. */
export const userRecipes = pgTable("user_recipes", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .references(() => users.id)
    .notNull(),
  schemaVersion: integer("schema_version").notNull().default(1),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  dishName: text("dish_name").notNull(),
  cuisineFamily: text("cuisine_family").notNull(),
  flavorProfile: jsonb("flavor_profile").$type<string[]>().notNull(),
  dietaryFlags: jsonb("dietary_flags").$type<string[]>().notNull(),
  temperature: text("temperature").notNull(),
  skillLevel: text("skill_level").notNull(),
  prepTimeMinutes: integer("prep_time_minutes").notNull(),
  cookTimeMinutes: integer("cook_time_minutes").notNull(),
  serves: integer("serves").notNull(),
  heroImageUrl: text("hero_image_url"),
  description: text("description").notNull(),
  ingredients: jsonb("ingredients").$type<unknown[]>().notNull(),
  steps: jsonb("steps").$type<unknown[]>().notNull(),
  source: text("source").notNull(), // "user" | "community" | "nourish-verified"
  nourishApprovedAt: timestamp("nourish_approved_at"),
  nourishApprovedBy: text("nourish_approved_by"),
  authorDisplayName: text("author_display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── recipe_score_breakdowns (Y2 W6 V3 dep) ───────────────────

/** Persists the engine's score breakdown at the moment the user
 *  picked a side. Y2 W6+ V3 trainer reads this to learn
 *  per-dimension preferences. Foreign key to cook_sessions
 *  (Y1 schema) — implicit via session_id. */
export const recipeScoreBreakdowns = pgTable("recipe_score_breakdowns", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id").notNull(),
  ownerId: text("owner_id")
    .references(() => users.id)
    .notNull(),
  recipeSlug: text("recipe_slug").notNull(),
  cuisineFit: real("cuisine_fit").notNull(),
  flavorContrast: real("flavor_contrast").notNull(),
  nutritionBalance: real("nutrition_balance").notNull(),
  prepBurden: real("prep_burden").notNull(),
  temperature: real("temperature").notNull(),
  preference: real("preference").notNull(),
  totalScore: real("total_score").notNull(),
  attachedAt: timestamp("attached_at").defaultNow().notNull(),
});

// ── pods ─────────────────────────────────────────────────────

export const pods = pgTable("pods", {
  id: text("id").primaryKey(),
  schemaVersion: integer("schema_version").notNull().default(1),
  name: text("name").notNull(),
  ownerId: text("owner_id")
    .references(() => users.id)
    .notNull(),
  adminIds: jsonb("admin_ids").$type<string[]>().notNull().default([]),
  dietaryFlags: jsonb("dietary_flags").$type<string[]>().notNull().default([]),
  podTimezone: text("pod_timezone"),
  revealAtHour: integer("reveal_at_hour").notNull().default(21),
  inviteCode: text("invite_code").notNull().unique(),
  inviteCodeExpiresAt: timestamp("invite_code_expires_at"),
  pausedThisWeek: boolean("paused_this_week").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const podMembers = pgTable("pod_members", {
  id: text("id").primaryKey(),
  podId: text("pod_id")
    .references(() => pods.id)
    .notNull(),
  userId: text("user_id").references(() => users.id),
  schemaVersion: integer("schema_version").notNull().default(1),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  ageBand: text("age_band").notNull(),
  dietaryFlags: jsonb("dietary_flags").$type<string[]>().notNull().default([]),
  cuisinePreferences: jsonb("cuisine_preferences")
    .$type<string[]>()
    .notNull()
    .default([]),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  vacationSince: timestamp("vacation_since"),
  weeksMissed: integer("weeks_missed").notNull().default(0),
});

export const podChallengeWeeks = pgTable("pod_challenge_weeks", {
  id: uuid("id").primaryKey().defaultRandom(),
  podId: text("pod_id")
    .references(() => pods.id)
    .notNull(),
  weekKey: text("week_key").notNull(), // ISO 8601 "2026-W18"
  recipeSlug: text("recipe_slug").notNull(),
  twist: text("twist"),
  startedAt: timestamp("started_at").notNull(),
  donationTagsEnabled: boolean("donation_tags_enabled").notNull().default(true),
});

export const podSubmissions = pgTable("pod_submissions", {
  id: text("id").primaryKey(),
  podId: text("pod_id")
    .references(() => pods.id)
    .notNull(),
  weekKey: text("week_key").notNull(),
  memberId: text("member_id")
    .references(() => podMembers.id)
    .notNull(),
  dayKey: text("day_key").notNull(), // YYYY-MM-DD pod-local
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  photoUri: text("photo_uri").notNull(),
  selfRating: integer("self_rating").notNull(),
  caption: text("caption"),
  donateTags: jsonb("donate_tags").$type<string[]>().notNull().default([]),
  stepCompletion: real("step_completion").notNull(),
  aestheticScore: real("aesthetic_score").notNull(),
  hasStepImage: boolean("has_step_image").notNull().default(false),
  computedScore: real("computed_score").notNull(),
});

// ── notifications (Y2 W19-W22) ──────────────────────────────

/** Smart-notification queue. The W22 scheduler writes
 *  upcoming nudges; the service worker picks them up. */
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .references(() => users.id)
    .notNull(),
  kind: text("kind").notNull(), // "rhythm-nudge" | "viral-recipe" | "pod-reveal"
  scheduledFor: timestamp("scheduled_for").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  status: text("status").notNull().default("pending"), // "pending" | "delivered" | "skipped" | "dismissed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at"),
});
