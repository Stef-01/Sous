/**
 * Time-of-day + season reranker (Y2 Sprint C W11).
 *
 * The pairing engine ranks side-dish candidates on six dimensions
 * (cuisine fit, flavor contrast, nutrition, prep, temperature,
 * preference). The reranker is a small *post-process* that nudges
 * scores by ±0.07 max based on context the scorers can't see:
 * what time of day it is + what season we're in.
 *
 * Why rules-based, not learned:
 *
 *   - Y2 W9 V3 eval showed learned-trainer needs ≥ 30 cooks/user
 *     before it beats heuristics. Same problem here: for a learned
 *     time-rerank we'd need cohort data spanning seasons + hours.
 *   - The signal is small + intuitive: hot soup feels right on a
 *     winter evening, gazpacho feels right on a summer afternoon.
 *     That doesn't need a model — it needs a tiny lookup table.
 *   - Caps the maximum nudge at ±0.07 so the rerank can break ties
 *     and reorder close-scored candidates, but a 0.40 base score
 *     can never leapfrog a 0.85 base score. The ranker stays
 *     primary; the rerank is a polish layer.
 *
 * Pure / dependency-free / deterministic given (side, now, hemisphere).
 */

import type { ScoredCandidate } from "./types";

export type Season = "winter" | "spring" | "summer" | "autumn";
export type TimeOfDay =
  | "morning"
  | "midday"
  | "afternoon"
  | "evening"
  | "late-night";
export type Hemisphere = "northern" | "southern";

export interface TimeRerankContext {
  /** The "now" reference. Tests inject a fixed Date; production
   *  callers pass `new Date()`. */
  now: Date;
  /** Hemisphere flips winter ↔ summer + spring ↔ autumn.
   *  Defaults to "northern" — overwhelming majority of users. */
  hemisphere?: Hemisphere;
}

/** Maximum positive adjustment a single candidate can receive
 *  from the rerank. Tracked as a constant so callers (and tests)
 *  can reason about how much the rerank can shift the order. */
export const TIME_RERANK_MAX_BOOST = 0.07;

/** Maximum negative adjustment. Asymmetric vs the boost: penalties
 *  are smaller because a wrong-temperature side is still edible,
 *  whereas a right-temperature side is a clear win. */
export const TIME_RERANK_MAX_PENALTY = -0.05;

/** Pure helper: pick the season for a given date + hemisphere.
 *  Northern: Dec/Jan/Feb winter, Mar-May spring, Jun-Aug summer,
 *  Sep-Nov autumn. Southern: flipped. */
export function inferSeason(date: Date, hemisphere: Hemisphere): Season {
  const month = date.getMonth(); // 0-11
  const northern: Season[] = [
    "winter", // Jan
    "winter", // Feb
    "spring", // Mar
    "spring", // Apr
    "spring", // May
    "summer", // Jun
    "summer", // Jul
    "summer", // Aug
    "autumn", // Sep
    "autumn", // Oct
    "autumn", // Nov
    "winter", // Dec
  ];
  const seasonNorth = northern[month] ?? "spring";
  if (hemisphere === "northern") return seasonNorth;
  return flipSeason(seasonNorth);
}

/** Pure helper: pick the time-of-day bucket from a Date's local
 *  hour. Buckets chosen for cooking-context relevance: morning is
 *  light/breakfast territory, midday/afternoon is lunch, evening
 *  is dinner-prime, late-night is overnight + early-morning. */
export function inferTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour < 5) return "late-night";
  if (hour < 11) return "morning";
  if (hour < 14) return "midday";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "late-night";
}

function flipSeason(season: Season): Season {
  switch (season) {
    case "winter":
      return "summer";
    case "summer":
      return "winter";
    case "spring":
      return "autumn";
    case "autumn":
      return "spring";
  }
}

/** Pure helper: compute the score adjustment for one candidate.
 *  Sums all matching nudges, then clamps to the rerank's ± bounds.
 *  Exported so the explainer / dev-tools can mirror the logic. */
export function computeAdjustment(
  side: { temperature: string; tags: ReadonlyArray<string> },
  season: Season,
  timeOfDay: TimeOfDay,
): number {
  let adj = 0;

  // ── Season × time-of-day × temperature ────────────────────
  // The big-signal cases. Each contributes a single nudge so
  // a candidate can't double-count (winter evening + winter
  // tag stacks, but winter evening + winter morning can't —
  // they're mutually exclusive).
  if (season === "winter") {
    if (timeOfDay === "evening") {
      if (side.temperature === "hot") adj += 0.05;
      else if (side.temperature === "cold") adj -= 0.03;
    } else if (timeOfDay === "morning" && side.temperature === "cold") {
      // A cold raw veg in a cold morning isn't appealing.
      adj -= 0.02;
    }
  }
  if (season === "summer") {
    if (timeOfDay === "afternoon" || timeOfDay === "midday") {
      if (side.temperature === "cold") adj += 0.05;
      else if (side.temperature === "hot") adj -= 0.03;
    }
  }
  // Spring/autumn: no temperature nudges (transitional seasons
  // where either temperature reads as fine).

  // ── Tag-based seasonal hints ──────────────────────────────
  // Side dishes that explicitly tag themselves with a season
  // get a small extra boost when that season matches. Cooks /
  // recipe authors who tag this way are signalling intent.
  const seasonTags: Record<Season, ReadonlyArray<string>> = {
    winter: ["winter", "winter-warming", "winter-pick", "warming", "comfort"],
    summer: ["summer", "summer-fresh", "summer-pick", "refreshing", "light"],
    spring: ["spring", "spring-fresh", "spring-pick"],
    autumn: ["autumn", "autumn-pick", "fall", "harvest"],
  };
  const candidateTags = new Set(side.tags.map((t) => t.toLowerCase()));
  const matchedSeasonTag = seasonTags[season].some((tag) =>
    candidateTags.has(tag),
  );
  if (matchedSeasonTag) adj += 0.02;

  // Clamp.
  if (adj > TIME_RERANK_MAX_BOOST) return TIME_RERANK_MAX_BOOST;
  if (adj < TIME_RERANK_MAX_PENALTY) return TIME_RERANK_MAX_PENALTY;
  return adj;
}

/** Pure post-processor: apply the time-of-day + season rerank to
 *  an already-ranked list. Returns a NEW array (no mutation),
 *  re-sorted by adjusted totalScore. The per-dim `scores` are not
 *  touched — only `totalScore`. Explainers downstream can read
 *  the delta by comparing pre/post if needed.
 *
 *  Determinism: given the same (ranked, context) the output is
 *  bit-identical. No `Date.now()` reads — all time comes from
 *  context.now. */
export function applyTimeOfDayRerank(
  ranked: ReadonlyArray<ScoredCandidate>,
  context: TimeRerankContext,
): ScoredCandidate[] {
  const hemisphere = context.hemisphere ?? "northern";
  const season = inferSeason(context.now, hemisphere);
  const timeOfDay = inferTimeOfDay(context.now);

  const adjusted = ranked.map((c) => {
    const adj = computeAdjustment(c.sideDish, season, timeOfDay);
    if (adj === 0) return c;
    const next: ScoredCandidate = {
      ...c,
      totalScore: clampUnit(c.totalScore + adj),
    };
    return next;
  });

  // Re-sort by adjusted totalScore. Stable enough — the input
  // was already deterministically ordered, and `.sort` in V8 is
  // stable for small arrays anyway.
  adjusted.sort((a, b) => b.totalScore - a.totalScore);
  return adjusted;
}

function clampUnit(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
