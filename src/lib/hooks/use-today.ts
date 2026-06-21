"use client";

import { useEffect, useState } from "react";

/**
 * Milliseconds from `now` until just past the next LOCAL midnight (00:00:05 the
 * following day). Pure + testable. The 5s cushion past midnight keeps clock
 * imprecision from firing us a hair early (still on the previous day).
 */
export function msUntilNextLocalMidnight(now: Date): number {
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    5,
  );
  return next.getTime() - now.getTime();
}

/**
 * A `today` Date that refreshes at local midnight.
 *
 * Day-keyed views (the nutrition diary via dayKey(), the Doge pet health, the
 * Today glance) used to memoize `new Date()` once per mount, so a page left open
 * across midnight kept reading the previous day's data until the next remount.
 * This hook closes that edge: it returns a Date that is stable WITHIN a local day
 * (no per-render churn) and updates exactly once when the day rolls over.
 *
 * A single setTimeout is scheduled to just past the next local midnight; on fire
 * it bumps the Date and the effect reschedules for the following midnight. If the
 * tab is backgrounded the timer may be throttled, but it still fires on return —
 * so the worst case degrades to the old behaviour, never worse.
 */
export function useToday(): Date {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const timer = setTimeout(
      () => setToday(new Date()),
      msUntilNextLocalMidnight(new Date()),
    );
    return () => clearTimeout(timer);
  }, [today]);

  return today;
}
