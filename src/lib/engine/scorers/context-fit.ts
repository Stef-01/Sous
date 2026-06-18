/**
 * Context-fit signal (20-week plan, W2 — Engine moat).
 *
 * Time-of-day + season reweighting (STRATEGY §6.2), as a gentle post-rank
 * reblend BELOW taste (mirrors the W1 pantry-reuse reblend):
 *
 *  - Time-of-day (the genuinely NEW signal — nothing else in `suggestSides`
 *    does this): late-night + morning favor "lighter / simpler" sides (low
 *    total prep+cook time), with a comfort-food allowance late at night.
 *  - Season (deliberately LIGHT here — the live `seasonal` base scorer already
 *    carries season via tag/temperature matching; this only nudges the
 *    temperature direction so the two don't double-count): winter → warm/hot,
 *    summer → cold; spring/autumn neutral.
 *
 * The clock is passed IN as primitives (hour 0-23, month 0-11) read at the
 * client call site — never read here, so the engine stays pure + deterministic
 * + testable (react-compiler-safe). The signal is centered at 0.5 so a neutral
 * context (transition season + a neutral hour) is order-preserving in the
 * reblend — "off-hours never hurt, only help" (§6.2).
 */

import type { Hemisphere, Season } from "../time-rerank";

/**
 * Weight of context-fit in the post-rank reblend. Below every taste dimension
 * (cuisineFit/flavorContrast 0.22; preference 0.08) and at/under the live
 * `seasonal` base weight (0.07), so a context nudge breaks ties + reorders
 * near-equal candidates but can never leapfrog a genuine taste gap.
 */
export const CONTEXT_FIT_WEIGHT = 0.06;

export type DaypartBucket =
  | "morning"
  | "midday"
  | "afternoon"
  | "evening"
  | "late-night";

/** Tags that earn a side the late-night "comfort lane" allowance. */
const COMFORT_TAGS = new Set([
  "comfort",
  "creamy",
  "cheesy",
  "rich",
  "warming",
]);

/**
 * Pure: season from a month index (0-11) + hemisphere, with NO Date
 * construction. Mirrors `inferSeason`'s northern table (Dec/Jan/Feb winter,
 * Mar-May spring, Jun-Aug summer, Sep-Nov autumn) so behaviour matches the
 * existing time-rerank tests, but is clock-free.
 */
export function seasonFromMonth(
  month: number,
  hemisphere: Hemisphere = "northern",
): Season {
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
  const north = northern[((month % 12) + 12) % 12] ?? "spring";
  if (hemisphere === "northern") return north;
  switch (north) {
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

/**
 * Pure: daypart bucket from an hour (0-23). Matches `inferTimeOfDay`'s cutoffs
 * (<5 & ≥22 late-night, <11 morning, <14 midday, <17 afternoon, else evening).
 */
export function daypartFromHour(hour: number): DaypartBucket {
  const h = ((Math.trunc(hour) % 24) + 24) % 24;
  if (h < 5) return "late-night";
  if (h < 11) return "morning";
  if (h < 14) return "midday";
  if (h < 17) return "afternoon";
  if (h < 22) return "evening";
  return "late-night";
}

/** Local clock + hemisphere — read at the call site, passed into the engine. */
export interface ContextFitContext {
  /** Local hour-of-day 0-23. */
  hour: number;
  /** Local month 0-11. */
  month: number;
  hemisphere?: Hemisphere;
}

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * Pure: bounded context-fit signal ∈ [0,1] for one side. 0.5 = neutral (a
 * transition season + a neutral daypart → exactly 0.5, so the reblend is a
 * no-op nudge). Time-of-day is the larger contributor (the new signal); the
 * season component is intentionally small (the live `seasonal` scorer carries
 * the rest).
 */
export function scoreContextFit(
  side: {
    temperature: string;
    tags: readonly string[];
    prepTimeMinutes: number;
    cookTimeMinutes: number;
  },
  ctx: ContextFitContext,
): number {
  const season = seasonFromMonth(ctx.month, ctx.hemisphere ?? "northern");
  const daypart = daypartFromHour(ctx.hour);
  let adj = 0;

  // ── PRIMARY: time-of-day → "lighter / simpler" (the net-new signal) ──
  // Late-night + morning favor low total prep+cook time; late-night allows a
  // comfort lane so a quick-but-cozy side isn't penalized for being cozy.
  if (daypart === "late-night" || daypart === "morning") {
    const totalTime = side.prepTimeMinutes + side.cookTimeMinutes;
    if (totalTime <= 20) adj += 0.05;
    else if (totalTime >= 40) adj -= 0.03;
    if (
      daypart === "late-night" &&
      side.tags.some((t) => COMFORT_TAGS.has(t.toLowerCase()))
    ) {
      adj += 0.02;
    }
  }

  // ── SECONDARY: season × temperature (light — see module header) ──
  const temp = side.temperature.toLowerCase();
  if (season === "winter") {
    if (temp === "hot") adj += 0.02;
    else if (temp === "cold") adj -= 0.02;
  } else if (season === "summer") {
    if (temp === "cold") adj += 0.02;
    else if (temp === "hot") adj -= 0.02;
  }
  // spring/autumn: neutral.

  return clamp01(0.5 + adj);
}
