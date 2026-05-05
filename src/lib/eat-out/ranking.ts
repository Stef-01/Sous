/**
 * Eat Out — pure ranking helper (Y5 J).
 *
 * Joins the dish + venue fixtures into a sorted card stack
 * informed by the user's preference profile. The ranking is
 * deliberately simple in V1 — flavour overlap + cuisine boost +
 * price-tier preference — because the dataset is small (8 cards)
 * and the demo value is in the dish-first reveal flow, not the
 * ranking subtlety.
 *
 * Pure / dependency-free / deterministic. No DOM, no React.
 */

import type { EatOutCard, EatOutDish, EatOutVenue } from "@/types/eat-out";
import type { MergedProfile } from "@/lib/intelligence/manual-edit-merge";

export interface RankEatOutInput {
  dishes: ReadonlyArray<EatOutDish>;
  venues: ReadonlyArray<EatOutVenue>;
  /** Optional intelligence-layer profile. When present, the
   *  cuisine + flavor weight maps boost matching dishes. */
  profile?: MergedProfile | null;
  /** Optional cuisine slug filter (case-insensitive). When set,
   *  only dishes in that cuisine appear in the result. */
  cuisineFilter?: string | null;
  /** Maximum number of cards to return. Default 8. */
  limit?: number;
}

/**
 * Pure: rank + join the fixture sets into a card stack.
 *
 * Score in [0, 1]:
 *   - 0.5 baseline (every dish starts here so empty profiles
 *     produce a stable order)
 *   - +0.25 max from cuisine alignment
 *   - +0.20 max from flavor alignment
 *   - +0.05 from venue price tier "$" / "$$" preference (cheaper
 *     ranks higher when the profile is cold-start; the formula
 *     is symmetric so $$$$ doesn't get penalised harshly)
 *
 * Stable tie-break: original dish order in the dataset.
 */
export function rankEatOut(input: RankEatOutInput): EatOutCard[] {
  const venueBySlug = new Map<string, EatOutVenue>();
  for (const v of input.venues) venueBySlug.set(v.slug, v);

  const filtered = input.cuisineFilter
    ? input.dishes.filter(
        (d) =>
          d.cuisineFamily.toLowerCase() ===
          (input.cuisineFilter ?? "").toLowerCase(),
      )
    : input.dishes;

  const cards: Array<EatOutCard & { _idx: number }> = [];
  filtered.forEach((dish, idx) => {
    const venue = venueBySlug.get(dish.venueSlug);
    if (!venue) return; // dataset misjoin; drop quietly
    const score = scoreDish({ dish, venue, profile: input.profile ?? null });
    cards.push({ dish, venue, score, _idx: idx });
  });

  cards.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a._idx - b._idx;
  });

  const limit = Math.max(1, Math.floor(input.limit ?? 8));
  return cards.slice(0, limit).map(({ _idx, ...card }) => {
    void _idx;
    return card;
  });
}

interface ScoreInput {
  dish: EatOutDish;
  venue: EatOutVenue;
  profile: MergedProfile | null;
}

/** Pure: per-dish score in [0, 1]. */
export function scoreDish(input: ScoreInput): number {
  const baseline = 0.5;
  const cuisineBoost = cuisineComponent(input.dish, input.profile);
  const flavorBoost = flavorComponent(input.dish, input.profile);
  const priceBoost = priceComponent(input.venue);
  const raw = baseline + cuisineBoost + flavorBoost + priceBoost;
  return clamp01(raw);
}

function cuisineComponent(
  dish: EatOutDish,
  profile: MergedProfile | null,
): number {
  if (!profile) return 0;
  const w = profile.cuisines[dish.cuisineFamily.toLowerCase()] ?? 0;
  // [-1, 1] → [-0.25, 0.25]
  return clampRange(w, -1, 1) * 0.25;
}

function flavorComponent(
  dish: EatOutDish,
  profile: MergedProfile | null,
): number {
  if (!profile) return 0;
  if (dish.flavors.length === 0) return 0;
  let sum = 0;
  let n = 0;
  for (const f of dish.flavors) {
    const w = profile.flavors[f.toLowerCase()];
    if (typeof w === "number") {
      sum += w;
      n += 1;
    }
  }
  if (n === 0) return 0;
  const avg = sum / n;
  return clampRange(avg, -1, 1) * 0.2;
}

function priceComponent(venue: EatOutVenue): number {
  // Profile-agnostic mild preference for accessible price tiers.
  switch (venue.priceTier) {
    case "$":
      return 0.05;
    case "$$":
      return 0.04;
    case "$$$":
      return 0.02;
    case "$$$$":
      return 0;
  }
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function clampRange(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}
