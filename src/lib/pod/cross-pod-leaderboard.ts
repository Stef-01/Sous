/**
 * Cross-pod leaderboard — Sprint G (Y5 W25–W28).
 *
 * Pure aggregator that turns `PodSubmission` lists from
 * multiple pods into a ranked weekly leaderboard. The scoring
 * is the existing per-cook score (already snapshotted onto each
 * submission's `computedScore`); the aggregator just averages
 * across members so a 4-person pod isn't penalised against an
 * 8-person pod.
 *
 *   weekScore = mean(submissions.computedScore)  ← per pod, per week
 *   rolling7  = sum of weekScores in the trailing 7 days
 *   allTime   = mean of weekScores across the pod's history
 *
 * Pure / dependency-free / deterministic.
 */

import type { PodSubmission } from "@/types/challenge-pod";

export interface PodEntry {
  /** Stable pod id. */
  podId: string;
  /** Display name. */
  name: string;
  /** Member count — used to surface "small pod, big effort"
   *  framing in the UI. */
  memberCount: number;
  /** All submissions ever made by this pod. */
  submissions: ReadonlyArray<PodSubmission>;
}

export interface PodLeaderboardEntry {
  podId: string;
  name: string;
  memberCount: number;
  /** Total submissions in the relevant window. */
  submissionCount: number;
  /** Mean computed score in the window, in [0, 100]. */
  averageScore: number;
  /** Rank starting at 1 (1 = best). */
  rank: number;
}

/**
 * Pure: rank pods by their mean per-cook score for a single
 * ISO week. Pods with no submissions in the week are dropped.
 * Stable tie-break: input pod order.
 */
export function rankWeeklyLeaderboard(input: {
  pods: ReadonlyArray<PodEntry>;
  weekKey: string;
}): PodLeaderboardEntry[] {
  const summaries: Array<Omit<PodLeaderboardEntry, "rank"> & { _idx: number }> =
    [];

  input.pods.forEach((pod, idx) => {
    const subs = pod.submissions.filter((s) => s.weekKey === input.weekKey);
    if (subs.length === 0) return;
    const total = subs.reduce((acc, s) => acc + clampScore(s.computedScore), 0);
    summaries.push({
      podId: pod.podId,
      name: pod.name,
      memberCount: pod.memberCount,
      submissionCount: subs.length,
      averageScore: round1(total / subs.length),
      _idx: idx,
    });
  });

  summaries.sort((a, b) => {
    if (b.averageScore !== a.averageScore) {
      return b.averageScore - a.averageScore;
    }
    return a._idx - b._idx;
  });

  return summaries.map((s, i) => {
    const { _idx, ...rest } = s;
    void _idx;
    return { ...rest, rank: i + 1 };
  });
}

/**
 * Pure: rolling 7-day leaderboard. Sums each pod's per-day
 * mean score across the trailing 7 days from `now`. Pods with
 * no submissions in the window are dropped. Stable tie-break.
 */
export function rankRolling7Leaderboard(input: {
  pods: ReadonlyArray<PodEntry>;
  now: Date;
}): PodLeaderboardEntry[] {
  const nowMs = input.now.getTime();
  if (!Number.isFinite(nowMs)) return [];
  const windowStart = nowMs - 7 * 24 * 60 * 60 * 1000;

  const summaries: Array<
    Omit<PodLeaderboardEntry, "rank"> & { _idx: number; rolling: number }
  > = [];

  input.pods.forEach((pod, idx) => {
    const inWindow = pod.submissions.filter((s) => {
      const ts = Date.parse(s.submittedAt);
      return Number.isFinite(ts) && ts >= windowStart && ts <= nowMs;
    });
    if (inWindow.length === 0) return;
    // Group by dayKey, mean per day, sum across days.
    const byDay = new Map<string, { sum: number; n: number }>();
    for (const s of inWindow) {
      const cur = byDay.get(s.dayKey) ?? { sum: 0, n: 0 };
      cur.sum += clampScore(s.computedScore);
      cur.n += 1;
      byDay.set(s.dayKey, cur);
    }
    let rolling = 0;
    for (const { sum, n } of byDay.values()) {
      rolling += sum / n;
    }
    summaries.push({
      podId: pod.podId,
      name: pod.name,
      memberCount: pod.memberCount,
      submissionCount: inWindow.length,
      averageScore: round1(rolling / Math.max(1, byDay.size)),
      rolling: round1(rolling),
      _idx: idx,
    });
  });

  summaries.sort((a, b) => {
    if (b.rolling !== a.rolling) return b.rolling - a.rolling;
    return a._idx - b._idx;
  });

  return summaries.map((s, i) => {
    const { _idx, rolling, ...rest } = s;
    void _idx;
    void rolling;
    return { ...rest, rank: i + 1 };
  });
}

/** Pure: surface the user's-pod row from a ranked leaderboard.
 *  Returns null when the user's pod isn't in the result set. */
export function findOwnPodRow(input: {
  rows: ReadonlyArray<PodLeaderboardEntry>;
  podId: string;
}): PodLeaderboardEntry | null {
  return input.rows.find((r) => r.podId === input.podId) ?? null;
}

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
