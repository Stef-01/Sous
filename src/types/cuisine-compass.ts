/**
 * Cuisine Compass — Zod schema for dishes, guesses, scores
 * (Y5 N substrate, per `docs/CUISINE-COMPASS-MAP-GAME-PLAN.md`).
 *
 * The game's data shape: a calendar-ordered set of dishes, each
 * with a geographical origin. The user drags a pin onto a world
 * map; we compute great-circle distance + a time-decayed score.
 *
 * Pure / dependency-free (Zod only).
 */

import { z } from "zod";

export const COMPASS_SCHEMA_VERSION = 1 as const;

// ── Dish + dataset ───────────────────────────────────────────

export const compassOriginSchema = z.object({
  city: z.string().min(1).max(80),
  country: z.string().min(1).max(80),
  /** Latitude in [-90, 90], decimal degrees. */
  lat: z.number().gte(-90).lte(90),
  /** Longitude in [-180, 180], decimal degrees. */
  lng: z.number().gte(-180).lte(180),
});
export type CompassOrigin = z.infer<typeof compassOriginSchema>;

export const compassDishSchema = z.object({
  /** Stable URL-safe slug; matches the catalog when a recipe
   *  exists, otherwise game-only. */
  slug: z.string().min(1).max(80),
  /** User-facing name. */
  name: z.string().min(1).max(120),
  origin: compassOriginSchema,
  /** 1-2 sentence reveal blurb shown after submit. */
  history: z.string().min(1).max(400),
  /** Cuisine slug for cross-engine linking. */
  cuisineFamily: z.string().min(1).max(40),
  /** Hero image URL. May point at /food_images/* or external. */
  imageUrl: z.string().min(1).max(300),
  /** Calendar-day index (0-364) for the deterministic rotation.
   *  When two dishes share an index the resolver tie-breaks by
   *  slug for determinism. */
  dayIndex: z.number().int().min(0).max(364),
});
export type CompassDish = z.infer<typeof compassDishSchema>;

// ── Game state ───────────────────────────────────────────────

/** A single guess: lat/lng pair the user pinned. */
export const compassGuessSchema = z.object({
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
});
export type CompassGuess = z.infer<typeof compassGuessSchema>;

/** The result of evaluating a guess against a dish. */
export const compassResultSchema = z.object({
  /** ISO date the puzzle was for (UTC YYYY-MM-DD). */
  puzzleDate: z.string().min(10).max(10),
  /** Slug of the dish that was the answer. */
  dishSlug: z.string(),
  /** The guess as submitted. */
  guess: compassGuessSchema,
  /** Distance in km between guess and origin. */
  distanceKm: z.number().nonnegative(),
  /** Elapsed seconds the user spent before submitting. */
  elapsedSec: z.number().nonnegative(),
  /** Hints used (0-2). Each costs 800 pts. */
  hintsUsed: z.number().int().min(0).max(2),
  /** Final score in [0, 5000]. */
  score: z.number().int().min(0).max(5000),
});
export type CompassResult = z.infer<typeof compassResultSchema>;

/** Streak record per the W15 RCA pattern — total + last-played. */
export const compassStreakSchema = z.object({
  schemaVersion: z.literal(COMPASS_SCHEMA_VERSION),
  /** Current consecutive-day streak. */
  current: z.number().int().min(0),
  /** All-time best streak. */
  best: z.number().int().min(0),
  /** ISO date (YYYY-MM-DD UTC) of the last completed puzzle. */
  lastPlayedDate: z.string(),
  /** Per-puzzle results keyed by puzzle date. */
  results: z.record(z.string(), compassResultSchema),
});
export type CompassStreak = z.infer<typeof compassStreakSchema>;
