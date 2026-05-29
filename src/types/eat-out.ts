/**
 * Eat Out — Zod schema for venue + dish fixtures (Y5 J substrate
 * per Sprint J in `docs/YEAR-5-VIBECODE-PLAN.md`).
 *
 * Eat Out is a dish-first venue surface: the user swipes through
 * a small stack of dishes that match their craving + signal
 * profile, and each dish reveals the venue that serves it best.
 * Real Yelp / Google Places integration is Y7 K — until then the
 * surface runs on the curated fixtures shipped here.
 *
 * Pure / dependency-free (Zod runtime only).
 */

import { z } from "zod";

export const EAT_OUT_SCHEMA_VERSION = 1 as const;

/** A single restaurant / venue entry. Lat/lng only used for
 *  distance ranking when a user location is available. */
export const eatOutVenueSchema = z.object({
  /** Stable URL-safe slug. */
  slug: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  /** City label shown on the card. */
  city: z.string().min(1).max(80),
  /** Country label. */
  country: z.string().min(1).max(80),
  /** Latitude in [-90, 90]. */
  lat: z.number().gte(-90).lte(90),
  /** Longitude in [-180, 180]. */
  lng: z.number().gte(-180).lte(180),
  /** Friendly price tier for sort hint. */
  priceTier: z.enum(["$", "$$", "$$$", "$$$$"]),
  /** Free-form 1-line vibe blurb. */
  vibe: z.string().min(1).max(160),
});
export type EatOutVenue = z.infer<typeof eatOutVenueSchema>;

/** A single dish offered by a venue. Multiple dishes may map to
 *  the same venue. */
export const eatOutDishSchema = z.object({
  slug: z.string().min(1).max(80),
  /** User-facing dish name. */
  name: z.string().min(1).max(120),
  /** Venue slug — joins to `eatOutVenueSchema`. */
  venueSlug: z.string().min(1).max(80),
  /** Cuisine slug — same vocab as the catalog (`indian`,
   *  `italian`, etc.). Drives intelligence-layer ranking. */
  cuisineFamily: z.string().min(1).max(40),
  /** Lowercase flavor tags. */
  flavors: z.array(z.string().min(1).max(40)).max(10),
  /** Lowercase protein tags. */
  proteins: z.array(z.string().min(1).max(40)).max(10),
  /** 1-2 sentence "why this dish, here" blurb shown on reveal. */
  whyHere: z.string().min(1).max(400),
  /** Hero image URL (placeholder convention OK). */
  imageUrl: z.string().min(1).max(300),
  /** Approximate price in USD; informs the price-tier badge. */
  priceUsd: z.number().nonnegative().lte(500),
});
export type EatOutDish = z.infer<typeof eatOutDishSchema>;

/** Pre-resolved card shape — joins a dish to its venue + score
 *  so the UI doesn't have to re-thread the join on every render. */
export interface EatOutCard {
  dish: EatOutDish;
  venue: EatOutVenue;
  /** Personalisation score in [0, 1] from the ranking helper. */
  score: number;
}
