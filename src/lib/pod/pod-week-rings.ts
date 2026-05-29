/**
 * Per-member weekly-cook counts (Y3 W2 polish-week backfill).
 *
 * Pure helper for the pod-home gallery's made-it-ring strip.
 * Counts how many submissions each pod member has logged in the
 * current challenge week, for the per-member ring above the
 * gallery photo grid.
 *
 * Each member's ring fills at 1 cook this week — pod challenges
 * are one-cook-per-member-per-week by design (the made-it ring
 * is binary 0/1 for the V1 gallery integration). The component
 * surface decides how to render that visually.
 *
 * Pure / dependency-free / deterministic.
 */

import type { PodMember, PodSubmission } from "@/types/challenge-pod";

/** Default per-member weekly cook target. Pod challenges are
 *  one-cook-per-member-per-week; the made-it ring fills at 1.
 *  Pods that scale to multiple cooks per week can override via
 *  the option. */
export const POD_WEEKLY_COOK_TARGET = 1;

export interface PodWeekRingRow {
  member: PodMember;
  count: number;
  target: number;
}

/** Pure: count submissions per active member for the current
 *  challenge week. Members with 0 submissions appear in the
 *  output with count=0 — the ring strip needs to show an
 *  outline ring for everyone, not just contributors. */
export function buildPodWeekRingRows(opts: {
  members: ReadonlyArray<PodMember>;
  submissions: ReadonlyArray<PodSubmission>;
  activeMemberIds: ReadonlyArray<string>;
  target?: number;
}): PodWeekRingRow[] {
  const target = opts.target ?? POD_WEEKLY_COOK_TARGET;
  const counts = new Map<string, number>();
  for (const sub of opts.submissions) {
    counts.set(sub.memberId, (counts.get(sub.memberId) ?? 0) + 1);
  }

  const activeSet = new Set(opts.activeMemberIds);
  const rows: PodWeekRingRow[] = [];
  for (const member of opts.members) {
    if (!activeSet.has(member.id)) continue;
    rows.push({
      member,
      count: counts.get(member.id) ?? 0,
      target,
    });
  }

  // Sort by completed-then-not-completed, then by display name
  // so the gallery reads "who's done" first.
  rows.sort((a, b) => {
    const aDone = a.count >= a.target ? 1 : 0;
    const bDone = b.count >= b.target ? 1 : 0;
    if (bDone !== aDone) return bDone - aDone;
    return a.member.displayName.localeCompare(b.member.displayName);
  });

  return rows;
}

/** Pure: top-line summary of "how many of N members have
 *  cooked this week" — used by the strip's eyebrow caption. */
export function summarisePodWeekProgress(rows: ReadonlyArray<PodWeekRingRow>): {
  done: number;
  total: number;
} {
  let done = 0;
  for (const r of rows) {
    if (r.count >= r.target) done += 1;
  }
  return { done, total: rows.length };
}
