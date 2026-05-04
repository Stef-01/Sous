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

// ── Side dishes (V1 internal content) ──────────────────
export const sideDishes = pgTable("side_dishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  cuisineFamily: text("cuisine_family").notNull(),
  prepTimeMinutes: integer("prep_time_minutes").notNull(),
  cookTimeMinutes: integer("cook_time_minutes").notNull(),
  skillLevel: text("skill_level").notNull(), // beginner, intermediate, advanced
  flavorProfile: jsonb("flavor_profile").$type<string[]>().notNull(),
  temperature: text("temperature").notNull(), // hot, cold, room-temp
  proteinGrams: real("protein_grams"),
  fiberGrams: real("fiber_grams"),
  caloriesPerServing: integer("calories_per_serving"),
  heroImageUrl: text("hero_image_url"),
  bestPairedWith: jsonb("best_paired_with").$type<string[]>().notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  // Fields carried over from existing sides.json
  pairingReason: text("pairing_reason"),
  nutritionCategory: text("nutrition_category"), // protein, carb, vegetable
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Guided Cook steps ──────────────────────────────────
export const cookSteps = pgTable("cook_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  sideDishId: uuid("side_dish_id")
    .references(() => sideDishes.id)
    .notNull(),
  phase: text("phase").notNull(), // mission, grab, cook, win
  stepNumber: integer("step_number").notNull(),
  instruction: text("instruction").notNull(),
  timerSeconds: integer("timer_seconds"),
  mistakeWarning: text("mistake_warning"),
  quickHack: text("quick_hack"),
  cuisineFact: text("cuisine_fact"),
  donenessCue: text("doneness_cue"),
  imageUrl: text("image_url"),
});

// ── Ingredients ────────────────────────────────────────
export const ingredients = pgTable("ingredients", {
  id: uuid("id").primaryKey().defaultRandom(),
  sideDishId: uuid("side_dish_id")
    .references(() => sideDishes.id)
    .notNull(),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  isOptional: boolean("is_optional").default(false),
  substitution: text("substitution"),
});

// ── Users ──────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  preferenceVector: jsonb("preference_vector")
    .$type<Record<string, number>>()
    .default({}),
  completedCooks: integer("completed_cooks").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  pathUnlocked: boolean("path_unlocked").default(false),
  communityUnlocked: boolean("community_unlocked").default(false),
  coachTone: text("coach_tone").default("gentle"), // gentle, hype, no-nonsense
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Cook sessions (journey log) ────────────────────────
export const cookSessions = pgTable("cook_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  sideDishId: uuid("side_dish_id")
    .references(() => sideDishes.id)
    .notNull(),
  mainDishInput: text("main_dish_input"),
  inputMode: text("input_mode").notNull(), // text, photo
  status: text("status").notNull(), // started, completed, abandoned
  completionPhotoUrl: text("completion_photo_url"),
  personalNote: text("personal_note"),
  rating: integer("rating"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// ── Saved recipes ──────────────────────────────────────
export const savedRecipes = pgTable("saved_recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  sideDishId: uuid("side_dish_id")
    .references(() => sideDishes.id)
    .notNull(),
  savedAt: timestamp("saved_at").defaultNow(),
});

// ── Coach quiz responses ───────────────────────────────
export const quizResponses = pgTable("quiz_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  questionKey: text("question_key").notNull(),
  answer: text("answer").notNull(),
  answeredAt: timestamp("answered_at").defaultNow(),
});

// ── Parent Mode tables (Stage 2 W14 prep — autonomous-prep stub) ──
// Defined now so when the founder provisions Neon and runs
// `pnpm db:push`, server-side persistence for the localStorage hooks
// (`useParentMode`, `useKidsAteIt`, `useExposureLog`,
// `useRecipeOverlays`) lands without schema work. The localStorage
// layer remains source of truth until W14 lands; these are write-
// through targets.

export const parentProfile = pgTable("parent_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull()
    .unique(),
  enabled: boolean("enabled").notNull().default(false),
  ageBand: text("age_band").notNull().default("4-8"), // 1-3 / 4-8 / 9-13 / 14-18 / mix
  spiceTolerance: integer("spice_tolerance").notNull().default(3), // 1..5
  flaggedAllergens: jsonb("flagged_allergens").$type<string[]>().default([]),
  enabledAt: timestamp("enabled_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const kidFriendlinessLabel = pgTable("kid_friendliness_label", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeSlug: text("recipe_slug").notNull().unique(),
  bitterLoad: integer("bitter_load").notNull(), // 0..3
  smellIntensity: integer("smell_intensity").notNull(), // 0..3
  textureRisk: integer("texture_risk").notNull(), // 0..3
  visibleGreenFlecks: boolean("visible_green_flecks").notNull(),
  deconstructable: boolean("deconstructable").notNull(),
  heatLevel: integer("heat_level").notNull(), // 0..4
  familiarityAnchor: boolean("familiarity_anchor").notNull(),
  colorBrightness: integer("color_brightness").notNull(), // 0..3
  parentModeEligible: boolean("parent_mode_eligible").notNull(),
  rubricNote: text("rubric_note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const kidsAteItLog = pgTable("kids_ate_it_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  cookSessionId: text("cook_session_id").notNull(),
  userId: text("user_id").references(() => users.id),
  recipeSlug: text("recipe_slug").notNull(),
  verdict: text("verdict").notNull(), // 'yes' | 'some' | 'no'
  loggedAt: timestamp("logged_at").defaultNow(),
});

export const recipeOverlay = pgTable("recipe_overlay", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  recipeSlug: text("recipe_slug").notNull(),
  stepIndex: integer("step_index").notNull(),
  note: text("note").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Performance indexes are defined in migrations via drizzle-kit generate.
// Key indexes to create:
// - idx_side_dish_cuisine on side_dishes(cuisine_family)
// - idx_cook_session_user on cook_sessions(user_id)
// - idx_cook_session_status on cook_sessions(status)
// - idx_saved_recipe_user on saved_recipes(user_id)
