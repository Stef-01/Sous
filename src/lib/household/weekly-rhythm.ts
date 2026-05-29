/**
 * Weekly rhythm — cook cadence + cuisine rotation summary
 * computed from the user's cook session history.
 *
 * W36 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint G W32-W36
 * household memory). The widget surfaces on /today; pure helpers
 * here so the rhythm calculation is testable without React.
 *
 * Pure / dependency-free. Inputs are CookSessionRecord-shaped
 * (only the fields the rhythm needs are typed locally so the
 * helpers don't import the React-y hook file).
 */

export interface RhythmCookRecord {
  /** ISO timestamp; only sessions with completedAt are counted. */
  completedAt?: string;
  /** Cuisine family key — drives the rotation calculation. */
  cuisineFamily: string;
}

export interface WeeklyRhythm {
  /** Cooks completed in the last 7 days (relative to `now`). */
  cooksThisWeek: number;
  /** Distinct cuisines cooked in that window. */
  cuisinesThisWeek: number;
  /** Days since the most recent cook. `null` when no history. */
  daysSinceLastCook: number | null;
  /** "Streak" interpretation: did the user cook on the most
   *  recent calendar day? Used to decide whether the rhythm
   *  widget congratulates or nudges. */
  cookedToday: boolean;
  /** Sorted descending by frequency; capped at 3. Powers the
   *  "you've been cooking <cuisine> a lot" callout in the UI. */
  topCuisines: string[];
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

/** Compute the weekly rhythm summary. `now` is a parameter so
 *  tests can pin the relative window without mocking Date. */
export function computeWeeklyRhythm(
  history: ReadonlyArray<RhythmCookRecord>,
  now: Date = new Date(),
): WeeklyRhythm {
  const completed = history.filter(
    (h): h is RhythmCookRecord & { completedAt: string } =>
      typeof h.completedAt === "string",
  );

  if (completed.length === 0) {
    return {
      cooksThisWeek: 0,
      cuisinesThisWeek: 0,
      daysSinceLastCook: null,
      cookedToday: false,
      topCuisines: [],
    };
  }

  const nowMs = now.getTime();
  const sevenDaysAgo = nowMs - SEVEN_DAYS_MS;

  const inWindow = completed.filter((c) => {
    const t = Date.parse(c.completedAt);
    return Number.isFinite(t) && t >= sevenDaysAgo && t <= nowMs;
  });

  const cuisinesInWindow = new Set(inWindow.map((c) => c.cuisineFamily));

  // Days since the most recent completed cook (any time, not
  // just in window).
  let mostRecentMs = -Infinity;
  for (const c of completed) {
    const t = Date.parse(c.completedAt);
    if (Number.isFinite(t) && t > mostRecentMs) mostRecentMs = t;
  }
  const daysSinceLastCook =
    mostRecentMs === -Infinity
      ? null
      : Math.floor((nowMs - mostRecentMs) / ONE_DAY_MS);

  // Top cuisines across the in-window cooks. Sorted by count
  // descending, ties broken by the cuisine name for determinism.
  const counts = new Map<string, number>();
  for (const c of inWindow) {
    counts.set(c.cuisineFamily, (counts.get(c.cuisineFamily) ?? 0) + 1);
  }
  const topCuisines = Array.from(counts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .slice(0, 3)
    .map(([cuisine]) => cuisine);

  return {
    cooksThisWeek: inWindow.length,
    cuisinesThisWeek: cuisinesInWindow.size,
    daysSinceLastCook,
    cookedToday: daysSinceLastCook === 0,
    topCuisines,
  };
}
