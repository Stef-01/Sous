/**
 * Seasonal-ingredient challenges + sponsored challenges.
 *
 * A challenge is a time-bounded (start, end) curated list of
 * featured ingredients the user is invited to cook with. Two
 * flavours:
 *
 *   1. Seasonal (free) — driven by USDA Seasonal Produce Guide
 *      regional calendars. Spring/Summer/Fall/Winter rotations.
 *      Eco-leaning copy ("local · in-season · low food-miles").
 *
 *   2. Sponsored (paid) — third-party ingredient (e.g.
 *      Beyond Meat, Mighty Earth Cocoa). Sponsor pays per
 *      challenge launch + per-cook completion. The challenge
 *      shape is identical to seasonal; only the `sponsoredBy`
 *      field differs.
 *
 * Both surface the same "carbon avoided" copy on completion
 * since the underlying ingredient eco math is the same.
 *
 * Pure / dependency-free / deterministic.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export type ChallengeKind = "seasonal" | "sponsored";

export interface Challenge {
  /** Stable slug — used as the challenge key for progress
   *  tracking + analytics. */
  slug: string;
  kind: ChallengeKind;
  /** User-facing title. */
  title: string;
  /** One-line subtitle / hook copy. */
  subtitle: string;
  /** Lowercase plain-name list of featured ingredients. */
  featuredIngredients: ReadonlyArray<string>;
  /** ISO start date (inclusive). */
  startsAt: string;
  /** ISO end date (exclusive). */
  endsAt: string;
  /** Number of cooks required to "complete" the challenge. */
  targetCooks: number;
  /** Estimated kg CO2e saved per qualifying cook. Used for
   *  end-screen messaging. Conservative midpoint. */
  estCo2eSavedPerCookKg: number;
  /** Sponsor name when kind === "sponsored", else null. */
  sponsoredBy: string | null;
  /** Optional eco-claim URL — sponsor or NGO source. */
  ecoSourceUrl?: string;
}

/**
 * Curated 2026 seasonal calendar — northern-hemisphere USA.
 * Sources:
 *   - USDA SNAP-Ed Seasonal Produce Guide
 *   - Sustainable Table Seasonal Food Guide
 *   - CUESA What's-In-Season tables
 *
 * Each season has one main challenge that runs the user-facing
 * 90 days (calendar season). Sponsored challenges layer on top
 * via the registry below.
 */
export const SEASONAL_CHALLENGES_2026: ReadonlyArray<Challenge> = [
  {
    slug: "spring-greens-2026",
    kind: "seasonal",
    title: "Spring Greens",
    subtitle:
      "Asparagus, arugula, peas, radishes, spinach. In season, local, low food-miles.",
    featuredIngredients: [
      "asparagus",
      "arugula",
      "spinach",
      "peas",
      "radishes",
    ],
    startsAt: "2026-03-20T00:00:00Z",
    endsAt: "2026-06-21T00:00:00Z",
    targetCooks: 3,
    // Local seasonal produce vs out-of-state shipped baseline
    // saves ~2.6 kg CO2e per meal (Poore & Nemecek 2018 +
    // Heller & Keoleian 2015 + USDA AMS food-miles study).
    estCo2eSavedPerCookKg: 2.6,
    sponsoredBy: null,
    ecoSourceUrl: "https://snaped.fns.usda.gov/seasonal-produce-guide",
  },
  {
    slug: "summer-stone-fruit-2026",
    kind: "seasonal",
    title: "Summer Stone Fruit",
    subtitle: "Peaches, plums, cherries, apricots. Peak local in-season.",
    featuredIngredients: ["peach", "plum", "cherry", "apricot", "nectarine"],
    startsAt: "2026-06-21T00:00:00Z",
    endsAt: "2026-09-22T00:00:00Z",
    targetCooks: 3,
    estCo2eSavedPerCookKg: 2.6,
    sponsoredBy: null,
    ecoSourceUrl: "https://snaped.fns.usda.gov/seasonal-produce-guide",
  },
  {
    slug: "autumn-roots-2026",
    kind: "seasonal",
    title: "Autumn Roots",
    subtitle: "Squash, sweet potato, beets, parsnip, kale.",
    featuredIngredients: ["squash", "sweet potato", "beet", "parsnip", "kale"],
    startsAt: "2026-09-22T00:00:00Z",
    endsAt: "2026-12-21T00:00:00Z",
    targetCooks: 3,
    estCo2eSavedPerCookKg: 2.6,
    sponsoredBy: null,
    ecoSourceUrl: "https://snaped.fns.usda.gov/seasonal-produce-guide",
  },
  {
    slug: "winter-citrus-2026",
    kind: "seasonal",
    title: "Winter Citrus",
    subtitle:
      "Lemons, oranges, grapefruit, mandarin. CA + FL season; low food-miles.",
    featuredIngredients: ["lemon", "orange", "grapefruit", "mandarin", "lime"],
    startsAt: "2025-12-21T00:00:00Z",
    endsAt: "2026-03-20T00:00:00Z",
    targetCooks: 3,
    estCo2eSavedPerCookKg: 2.0,
    sponsoredBy: null,
    ecoSourceUrl: "https://snaped.fns.usda.gov/seasonal-produce-guide",
  },
];

/**
 * Active sponsored challenges. Edited per-deal; in real-mode
 * loaded from a server-of-record (Sprint C). The shape mirrors
 * SEASONAL_CHALLENGES_2026.
 */
export const SPONSORED_CHALLENGES: ReadonlyArray<Challenge> = [
  // Example slot — Beyond Meat plant-protein challenge. Inactive
  // by default; populated by the founder when a deal closes.
  // {
  //   slug: "beyond-meat-spring-2026",
  //   kind: "sponsored",
  //   title: "Plant Protein Week",
  //   subtitle: "Three dinners, one protein swap. Beyond Meat presents.",
  //   featuredIngredients: ["plant-protein", "ground"],
  //   startsAt: "2026-04-15T00:00:00Z",
  //   endsAt: "2026-04-22T00:00:00Z",
  //   targetCooks: 3,
  //   estCo2eSavedPerCookKg: 4.5,
  //   sponsoredBy: "Beyond Meat",
  //   ecoSourceUrl: "https://www.beyondmeat.com/en-US/our-story/the-impact",
  // },
];

/** Pure: every challenge active at the supplied moment. Returns
 *  empty array when none are. Sponsored challenges sort first
 *  (paid placement); ties broken by start date desc. */
export function activeChallenges(input: {
  now: Date;
}): ReadonlyArray<Challenge> {
  const at = input.now.getTime();
  if (!Number.isFinite(at)) return [];
  const all = [...SPONSORED_CHALLENGES, ...SEASONAL_CHALLENGES_2026];
  return all
    .filter((c) => {
      const s = new Date(c.startsAt).getTime();
      const e = new Date(c.endsAt).getTime();
      return Number.isFinite(s) && Number.isFinite(e) && at >= s && at < e;
    })
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "sponsored" ? -1 : 1;
      return b.startsAt.localeCompare(a.startsAt);
    });
}

/** Pure: days remaining until the challenge ends. Returns 0
 *  when already past the end. Used in dashboard copy. */
export function daysRemaining(input: {
  challenge: Challenge;
  now: Date;
}): number {
  const end = new Date(input.challenge.endsAt).getTime();
  const at = input.now.getTime();
  if (!Number.isFinite(end) || !Number.isFinite(at)) return 0;
  if (at >= end) return 0;
  return Math.ceil((end - at) / DAY_MS);
}

/**
 * Pure: classify whether a recipe satisfies a challenge — at
 * least one of the recipe's ingredients matches a featured
 * ingredient (substring, case-insensitive). Conservative match —
 * "lemon zest" matches "lemon", "spinach pesto" matches
 * "spinach".
 */
export function recipeMatchesChallenge(input: {
  recipeIngredients: ReadonlyArray<string>;
  challenge: Challenge;
}): boolean {
  const lc = input.recipeIngredients.map((i) =>
    typeof i === "string" ? i.toLowerCase() : "",
  );
  return input.challenge.featuredIngredients.some((feat) =>
    lc.some((ing) => ing.includes(feat)),
  );
}

export interface ChallengeProgress {
  challengeSlug: string;
  /** Cooks completed against this challenge. */
  completedCooks: number;
  /** Target cooks to "complete" the challenge. */
  targetCooks: number;
  /** [0, 1] — clamps at 1 when target is met. */
  progressFraction: number;
  /** Total CO2e saved across qualifying cooks (kg). */
  totalCo2eSavedKg: number;
  /** True when completedCooks ≥ targetCooks. */
  completed: boolean;
}

/** Pure: compute progress on a challenge from a list of cooks
 *  that match it. The caller has already filtered by
 *  recipeMatchesChallenge — this helper just aggregates. */
export function computeChallengeProgress(input: {
  challenge: Challenge;
  qualifyingCookCount: number;
}): ChallengeProgress {
  const cooks = Math.max(0, Math.floor(input.qualifyingCookCount));
  const target = Math.max(1, input.challenge.targetCooks);
  return {
    challengeSlug: input.challenge.slug,
    completedCooks: cooks,
    targetCooks: target,
    progressFraction: Math.min(1, cooks / target),
    totalCo2eSavedKg:
      Math.round(cooks * input.challenge.estCo2eSavedPerCookKg * 10) / 10,
    completed: cooks >= target,
  };
}
