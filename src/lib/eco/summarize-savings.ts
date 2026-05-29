/**
 * summarize-savings — pure helpers that turn cook-session records
 * into Eco Mode tally lines.
 *
 * Two windows are surfaced:
 *   - "month-to-date" — drives the Today chip (Y5 D, audit P0).
 *   - "year-to-date"  — drives the /path/eco dashboard headline.
 *
 * The chosen-meal context is conservative `home-mixed`; per-cook
 * ingredient classification is a Y5 L follow-up. Until then,
 * under-promise / never-overstate.
 *
 * Pure / dependency-free / deterministic.
 */

import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import {
  totalCo2eSavedKg,
  type CookingEvent,
  type MealContext,
} from "@/lib/eco/carbon-math";

export interface SummaryWindow {
  /** Window-relative count of completed cooks. */
  cookCount: number;
  /** Total CO2e saved (kg, 0.1 precision) versus the baseline. */
  savedKg: number;
  /** Friendly label for the window: "this month", "this year". */
  windowLabel: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Shared filter: completed sessions with a parseable timestamp
 *  whose age in ms is within `windowMs`. Returns CookingEvents
 *  with the conservative home-mixed context. */
function eventsInWindow(
  sessions: ReadonlyArray<CookSessionRecord>,
  now: number,
  windowMs: number,
): CookingEvent[] {
  const events: CookingEvent[] = [];
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const ts = new Date(s.completedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    const age = now - ts;
    if (age < 0 || age > windowMs) continue;
    events.push({ cookedAt: s.completedAt, context: "home-mixed" });
  }
  return events;
}

/** Pure: month-to-date summary. Window = trailing 30 days. */
export function summarizeMonthlySavings(input: {
  sessions: ReadonlyArray<CookSessionRecord>;
  now?: Date;
  baseline?: MealContext;
}): SummaryWindow {
  const now = (input.now ?? new Date()).getTime();
  const events = eventsInWindow(input.sessions, now, 30 * DAY_MS);
  return {
    cookCount: events.length,
    savedKg: totalCo2eSavedKg({ events, baseline: input.baseline }),
    windowLabel: "this month",
  };
}

/** Pure: year-to-date summary. Window = trailing 365 days. */
export function summarizeYearlySavings(input: {
  sessions: ReadonlyArray<CookSessionRecord>;
  now?: Date;
  baseline?: MealContext;
}): SummaryWindow {
  const now = (input.now ?? new Date()).getTime();
  const events = eventsInWindow(input.sessions, now, 365 * DAY_MS);
  return {
    cookCount: events.length,
    savedKg: totalCo2eSavedKg({ events, baseline: input.baseline }),
    windowLabel: "this year",
  };
}
