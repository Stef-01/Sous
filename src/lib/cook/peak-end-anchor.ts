/**
 * Peak-end anchor (Y2 W26 — behavioural overlay).
 *
 * The win-screen at the end of a cook fires confetti + a
 * congrats line. This helper picks the right line based on how
 * today's cook score compares to the user's personal best.
 *
 * Three variants:
 *   - "new-peak":   today's score >= personal best → "Your new
 *                   best — N points." Frames the win against the
 *                   user's own history (anchoring + peak-end
 *                   behavioural science).
 *   - "near-peak":  today within ANCHOR_NEAR_WINDOW points of
 *                   the personal best → "Your best of the year
 *                   — barely above N." Reminds the user of the
 *                   high bar they're already brushing.
 *   - "regular":    today is below the near-peak band → no
 *                   anchor copy, generic congrats.
 *
 * Why this shape: "peak-end" is the heuristic that people
 * remember experiences by the most-intense moment + the end.
 * Pinning the win-screen text to the user's personal-best
 * score makes the highest-recall moment also the most-anchored
 * — the user is more likely to internalise "I'm someone who
 * cooks at this level".
 *
 * Pure / dependency-free / deterministic.
 */

/** Today's cook is "near-peak" when its score is within this
 *  many points of the personal best. The plan calls for 5
 *  points — wide enough to fire often, tight enough to feel
 *  earned (a 60 vs a 90 best does NOT trigger this). */
export const ANCHOR_NEAR_WINDOW = 5;

export type PeakEndVariant = "new-peak" | "near-peak" | "regular";

export interface PeakEndAnchor {
  variant: PeakEndVariant;
  /** The personal best score the variant is anchored against.
   *  Only present for "near-peak" — "new-peak" doesn't need
   *  it (the new best is today's own score), and "regular"
   *  has no anchor. */
  anchorScore?: number;
  /** Display copy for the win-screen. Original Sous voice;
   *  caller renders this verbatim. */
  copy: string;
}

/** Pure: pick the peak-end variant + copy.
 *
 *  - todayScore: the score the user just earned (0..100).
 *  - history:   array of prior cook scores (excluding today).
 *               Empty / non-numeric entries are ignored.
 *
 *  When history is empty (cold start), today's cook IS the
 *  personal best. We fire "new-peak" so the user gets the
 *  "your new best" anchor immediately rather than a generic
 *  congrats — the first cook should feel like a peak. */
export function pickPeakEndAnchor(
  todayScore: number,
  history: ReadonlyArray<number>,
): PeakEndAnchor {
  const cleanToday = Number.isFinite(todayScore)
    ? Math.max(0, Math.round(todayScore))
    : 0;

  // Filter history to finite numbers only.
  const cleanHistory: number[] = [];
  for (const s of history) {
    if (Number.isFinite(s)) cleanHistory.push(s);
  }

  if (cleanHistory.length === 0) {
    return {
      variant: "new-peak",
      copy: `Your first cook — banked at ${cleanToday}.`,
    };
  }

  const personalBest = Math.max(...cleanHistory);

  if (cleanToday >= personalBest) {
    return {
      variant: "new-peak",
      copy:
        cleanToday > personalBest
          ? `Your new best — ${cleanToday} points (was ${personalBest}).`
          : `Tied your best — ${cleanToday} points.`,
    };
  }

  const gap = personalBest - cleanToday;
  if (gap <= ANCHOR_NEAR_WINDOW) {
    return {
      variant: "near-peak",
      anchorScore: personalBest,
      copy: `Your best of the year — barely above ${cleanToday}.`,
    };
  }

  return {
    variant: "regular",
    copy: `Banked at ${cleanToday}.`,
  };
}
