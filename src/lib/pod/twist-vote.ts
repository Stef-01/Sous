/**
 * Voted twist + tiny goal + identity streak (Y2 Sprint I W37).
 *
 * Three pure helpers for the pod weekly-twist Sunday-afternoon
 * voting flow:
 *
 *   1. tallyTwistVotes — count votes per option, rank, tie-break
 *      via admin-proposal order.
 *   2. resolveWeeklyTwist — pick the winning twist string,
 *      defaulting to null when no votes are cast.
 *   3. detectTwistStreak — scan past-N-week twist history for
 *      a consecutive run on the same option. Feeds the W37
 *      identity-language overlay ("Spicy week 4 of 4").
 *
 * The DEFAULT_TWIST_OPTIONS list is the small starter set
 * admins propose from. Pods can also propose custom twists; the
 * helpers handle either.
 *
 * Pure / dependency-free / deterministic.
 */

/** Default twist options the admin can propose from. Six small,
 *  concrete, atomic-week-sized twists per the W37 plan. */
export const DEFAULT_TWIST_OPTIONS: ReadonlyArray<string> = [
  "vegetarian",
  "spicy",
  "leftover-mode",
  "kids-cook",
  "budget",
  "speedy",
];

export interface TwistTallyEntry {
  twist: string;
  count: number;
  /** 0-based proposal order — used for tie-breaking. Lower
   *  index = proposed first = wins ties. */
  proposalIndex: number;
}

export interface TwistTallyResult {
  /** Ranked entries, descending by count then ascending by
   *  proposalIndex (admin-order tie-break). */
  ranked: TwistTallyEntry[];
  /** The winning twist string. null when no votes cast. */
  winner: string | null;
}

/** Pure: count votes per option, rank, return winner.
 *
 *  Tie-break: same vote count → earlier proposalIndex wins.
 *  This implicitly defers to the admin who proposed the twist
 *  (since admins propose in order).
 *
 *  Vote validation: votes whose twist isn't in the proposed
 *  options array are silently dropped (defensive; UI should
 *  never let this happen but defence-in-depth). */
export function tallyTwistVotes(
  proposedOptions: ReadonlyArray<string>,
  votes: ReadonlyArray<string>,
): TwistTallyResult {
  const optionIndex = new Map<string, number>();
  proposedOptions.forEach((opt, idx) => {
    optionIndex.set(opt.toLowerCase(), idx);
  });

  const counts = new Map<string, number>();
  for (const v of votes) {
    if (typeof v !== "string") continue;
    const normalised = v.toLowerCase().trim();
    if (!optionIndex.has(normalised)) continue;
    counts.set(normalised, (counts.get(normalised) ?? 0) + 1);
  }

  const ranked: TwistTallyEntry[] = [];
  for (const [twist, count] of counts) {
    const proposalIndex = optionIndex.get(twist) ?? Number.MAX_SAFE_INTEGER;
    ranked.push({ twist, count, proposalIndex });
  }

  ranked.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.proposalIndex - b.proposalIndex;
  });

  const winner = ranked.length > 0 ? (ranked[0]?.twist ?? null) : null;
  return { ranked, winner };
}

/** Pure: resolve the week's twist string. Convenience wrapper
 *  that always returns a single value (or null) for the
 *  agentic-picker to consume. */
export function resolveWeeklyTwist(
  proposedOptions: ReadonlyArray<string>,
  votes: ReadonlyArray<string>,
): string | null {
  return tallyTwistVotes(proposedOptions, votes).winner;
}

export interface TwistStreakEntry {
  /** Week-of-year or any monotonically-increasing week index. */
  week: number;
  /** The twist that won that week (null when no twist set). */
  twist: string | null;
}

export interface TwistStreakResult {
  /** The currently-running twist (most recent winner). */
  current: string | null;
  /** Number of consecutive weeks with the same twist, including
   *  the current week. 0 when current is null. */
  streakWeeks: number;
}

/** Pure: detect the current twist-streak from a per-week
 *  history. Scans backward from the latest entry; counts
 *  consecutive weeks with identical twist (case-insensitive).
 *
 *  Stops at the first different / null entry or when history
 *  runs out.
 *
 *  Used for the identity-reinforcement overlay — "Spicy week
 *  N of N" where N >= 2 (single-week non-streak suppressed). */
export function detectTwistStreak(
  history: ReadonlyArray<TwistStreakEntry>,
): TwistStreakResult {
  if (history.length === 0) return { current: null, streakWeeks: 0 };

  // Sort by week descending so we walk newest-first.
  const sorted = [...history].sort((a, b) => b.week - a.week);
  const head = sorted[0];
  if (!head || head.twist === null) {
    return { current: null, streakWeeks: 0 };
  }

  const currentTwist = head.twist.toLowerCase();
  let streakWeeks = 0;
  for (const entry of sorted) {
    if (entry.twist === null) break;
    if (entry.twist.toLowerCase() !== currentTwist) break;
    streakWeeks += 1;
  }

  return { current: head.twist, streakWeeks };
}

/** Pure: format the identity-language string for the pod
 *  gallery. Returns null when streak is below 2 weeks (no
 *  identity claim from a single-week pick).
 *
 *  Examples:
 *    streak=2 → "Spicy week 2 of 2."
 *    streak=4 → "Spicy week 4 of 4."
 *    streak=1 → null (suppressed)
 *    streak=0 → null  */
export function formatTwistStreakIdentity(
  streak: TwistStreakResult,
): string | null {
  if (streak.current === null) return null;
  if (streak.streakWeeks < 2) return null;
  const label = capitaliseFirst(streak.current);
  return `${label} week ${streak.streakWeeks} of ${streak.streakWeeks}.`;
}

function capitaliseFirst(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
