/**
 * preference-observations — derive warm, human sentences from cook history.
 *
 * Sprint C, Phase 1: Users cannot feel the engine learning unless we show
 * it. Percentages feel creepy; bars feel like a dashboard. So instead we
 * render at most three plain sentences in the voice of a partner who has
 * been paying attention: "Tuesday carbs are a pattern" / "You reach for
 * bowls when you're tired" / "Spicier on weekends."
 *
 * Deterministic: given identical session inputs and the same `now`, output
 * is identical. No random tiebreakers, sentences sorted by signal strength.
 *
 * Silent by default below MIN_COOKS — until the user has enough history
 * to speak about, we stay quiet.
 */

import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

/** Minimum cooks before any observation fires. Below this the strip is
 *  silent — speaking too early feels like cold reading, not insight. */
export const PREFERENCE_MIN_COOKS = 5;

export interface PreferenceObservation {
  /** Stable key for React + testing. */
  id: string;
  /** Human-readable sentence. No trailing period — caller renders one. */
  text: string;
  /** Internal score used for ordering. Higher = stronger signal. */
  score: number;
}

type DayName = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

const DAY_NAMES: DayName[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WEEKEND: ReadonlySet<DayName> = new Set(["Sat", "Sun"]);

function dayOfWeek(iso: string): DayName | null {
  const d = new Date(iso);
  const n = d.getDay();
  if (!Number.isFinite(n)) return null;
  return DAY_NAMES[n] ?? null;
}

function titleCase(s: string): string {
  if (!s) return s;
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

function formatCuisine(cuisine: string): string {
  const c = cuisine.trim().toLowerCase();
  if (!c) return "this cuisine";
  if (c === "middle-eastern") return "Middle Eastern";
  return titleCase(c);
}

/**
 * Derive up to three observations from completed cook sessions.
 *
 * @param sessions All cook sessions (incomplete will be filtered out).
 * @param now Current time (defaults to `Date.now()`). Passed in for tests.
 */
export function derivePreferenceObservations(
  sessions: CookSessionRecord[],
  now: number = Date.now(),
): PreferenceObservation[] {
  const completed = sessions.filter((s) => Boolean(s.completedAt));
  if (completed.length < PREFERENCE_MIN_COOKS) return [];

  const observations: PreferenceObservation[] = [];

  // ── Cuisine concentration ────────────────────────────────────────────
  const cuisineCount = new Map<string, number>();
  for (const s of completed) {
    const c = (s.cuisineFamily ?? "").trim().toLowerCase();
    if (!c) continue;
    cuisineCount.set(c, (cuisineCount.get(c) ?? 0) + 1);
  }
  const cuisineEntries = [...cuisineCount.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .filter(([, n]) => n >= 3);

  if (cuisineEntries.length >= 1) {
    const [top, count] = cuisineEntries[0]!;
    const share = count / completed.length;
    if (share >= 0.4) {
      observations.push({
        id: `cuisine-${top}`,
        text: `${formatCuisine(top)} shows up most in your week`,
        score: 80 + Math.round(share * 20),
      });
    }
  }

  // ── Day-of-week patterns ────────────────────────────────────────────
  const dayCount = new Map<DayName, number>();
  for (const s of completed) {
    if (!s.completedAt) continue;
    const d = dayOfWeek(s.completedAt);
    if (!d) continue;
    dayCount.set(d, (dayCount.get(d) ?? 0) + 1);
  }
  const dayEntries = [...dayCount.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  if (dayEntries.length > 0) {
    const [topDay, topN] = dayEntries[0]!;
    // Require at least 3 occurrences on a single weekday to call it a pattern.
    if (topN >= 3) {
      observations.push({
        id: `day-${topDay}`,
        text: `${topDay}s are quietly becoming your cook night`,
        score: 60 + topN,
      });
    }
  }

  // ── Weekend adventurousness (bolder cuisines on Sat/Sun) ────────────
  let weekendCount = 0;
  const weekendCuisines = new Set<string>();
  const weekdayCuisines = new Set<string>();
  for (const s of completed) {
    if (!s.completedAt) continue;
    const d = dayOfWeek(s.completedAt);
    if (!d) continue;
    const cuisine = (s.cuisineFamily ?? "").trim().toLowerCase();
    if (WEEKEND.has(d)) {
      weekendCount++;
      if (cuisine) weekendCuisines.add(cuisine);
    } else if (cuisine) {
      weekdayCuisines.add(cuisine);
    }
  }
  if (
    weekendCount >= 3 &&
    weekendCuisines.size > weekdayCuisines.size &&
    weekendCuisines.size - weekdayCuisines.size >= 2
  ) {
    observations.push({
      id: "weekend-range",
      text: "Weekends are when you roam — more cuisines land on Sat/Sun",
      score: 55,
    });
  }

  // ── High-rating pattern ─────────────────────────────────────────────
  const ratedSessions = completed.filter(
    (s) => typeof s.rating === "number" && (s.rating ?? 0) > 0,
  );
  if (ratedSessions.length >= 4) {
    const topRated = ratedSessions.filter((s) => (s.rating ?? 0) >= 4);
    if (topRated.length >= 3) {
      // Quietly observe the cuisine of the best-rated cooks, if any.
      const topCuisineCount = new Map<string, number>();
      for (const s of topRated) {
        const c = (s.cuisineFamily ?? "").trim().toLowerCase();
        if (!c) continue;
        topCuisineCount.set(c, (topCuisineCount.get(c) ?? 0) + 1);
      }
      const dominant = [...topCuisineCount.entries()].sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
      )[0];
      if (dominant && dominant[1] >= 2) {
        observations.push({
          id: `top-rated-${dominant[0]}`,
          text: `You rate ${formatCuisine(dominant[0])} cooks higher than the rest`,
          score: 50,
        });
      }
    }
  }

  // ── Recent momentum (last 14 days) ──────────────────────────────────
  const fourteenDays = 14 * 24 * 60 * 60 * 1000;
  const recentCount = completed.filter((s) => {
    if (!s.completedAt) return false;
    const ts = new Date(s.completedAt).getTime();
    if (!Number.isFinite(ts)) return false;
    return now - ts <= fourteenDays;
  }).length;
  if (recentCount >= 4) {
    observations.push({
      id: "momentum-recent",
      text: `${recentCount} cooks in the last two weeks — you are on a roll`,
      score: 45,
    });
  }

  observations.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return observations.slice(0, 3);
}
