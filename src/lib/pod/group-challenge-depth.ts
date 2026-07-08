import type { PodMember, PodSubmission } from "@/types/challenge-pod";
import { enforceDailyCap } from "./pod-score";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ISO_WEEK_RE = /^(\d{4})-W(\d{2})$/;

export interface InGroupLeaderboardRow {
  memberId: string;
  displayName: string;
  avatar: string;
  rank: number;
  submissionCount: number;
  countedSubmissionCount: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  latestSubmittedAt: string | null;
  completed: boolean;
}

export interface InGroupLeaderboardSummary {
  memberCount: number;
  completedCount: number;
  totalCountedSubmissions: number;
  totalScore: number;
  leader: InGroupLeaderboardRow | null;
}

export function buildInGroupLeaderboard(input: {
  members: ReadonlyArray<PodMember>;
  submissions: ReadonlyArray<PodSubmission>;
  weekKey: string;
  activeMemberIds?: ReadonlyArray<string>;
  targetPerMember?: number;
}): InGroupLeaderboardRow[] {
  const target = Math.max(1, input.targetPerMember ?? 1);
  const activeSet = new Set(
    input.activeMemberIds ??
      input.members
        .filter(
          (member) =>
            member.vacationSince === null || member.vacationSince === undefined,
        )
        .map((member) => member.id),
  );
  const rosterIndex = new Map<string, number>();
  input.members.forEach((member, index) => rosterIndex.set(member.id, index));

  const baseRows = new Map<
    string,
    Omit<InGroupLeaderboardRow, "rank" | "completed">
  >();
  for (const member of input.members) {
    if (!activeSet.has(member.id)) continue;
    baseRows.set(member.id, {
      memberId: member.id,
      displayName: member.displayName,
      avatar: member.avatar,
      submissionCount: 0,
      countedSubmissionCount: 0,
      totalScore: 0,
      averageScore: 0,
      bestScore: 0,
      latestSubmittedAt: null,
    });
  }

  const weekSubmissions = input.submissions
    .filter(
      (submission) =>
        submission.weekKey === input.weekKey &&
        activeSet.has(submission.memberId),
    )
    .sort(compareSubmissionTime);

  for (const submission of weekSubmissions) {
    const row = baseRows.get(submission.memberId);
    if (row) row.submissionCount += 1;
  }

  for (const submission of enforceDailyCap(weekSubmissions)) {
    const row = baseRows.get(submission.memberId);
    if (!row) continue;
    const score = clampScore(submission.computedScore);
    row.countedSubmissionCount += 1;
    row.totalScore = round1(row.totalScore + score);
    row.bestScore = Math.max(row.bestScore, score);
    row.latestSubmittedAt = maxIso(
      row.latestSubmittedAt,
      submission.submittedAt,
    );
  }

  const rows = Array.from(baseRows.values()).map((row) => ({
    ...row,
    totalScore: round1(row.totalScore),
    averageScore:
      row.countedSubmissionCount > 0
        ? round1(row.totalScore / row.countedSubmissionCount)
        : 0,
    bestScore: round1(row.bestScore),
    completed: row.countedSubmissionCount >= target,
    rank: 0,
  }));

  rows.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.countedSubmissionCount !== a.countedSubmissionCount) {
      return b.countedSubmissionCount - a.countedSubmissionCount;
    }
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    const time = compareNullableIso(a.latestSubmittedAt, b.latestSubmittedAt);
    if (time !== 0) return time;
    return (
      (rosterIndex.get(a.memberId) ?? 0) - (rosterIndex.get(b.memberId) ?? 0)
    );
  });

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function summariseInGroupLeaderboard(
  rows: ReadonlyArray<InGroupLeaderboardRow>,
): InGroupLeaderboardSummary {
  return {
    memberCount: rows.length,
    completedCount: rows.filter((row) => row.completed).length,
    totalCountedSubmissions: rows.reduce(
      (sum, row) => sum + row.countedSubmissionCount,
      0,
    ),
    totalScore: round1(rows.reduce((sum, row) => sum + row.totalScore, 0)),
    leader: rows[0] ?? null,
  };
}

export interface GroupChallengeStreak {
  activeWeekKeys: string[];
  completedWeekKeys: string[];
  currentWeekKey: string | null;
  currentWeekComplete: boolean;
  currentStreakWeeks: number;
  bestStreakWeeks: number;
  atRiskWeekKey: string | null;
}

export function computeGroupChallengeStreak(input: {
  weekKeys: ReadonlyArray<string>;
  submissions: ReadonlyArray<PodSubmission>;
  activeMemberIds: ReadonlyArray<string>;
  targetPerMember?: number;
}): GroupChallengeStreak {
  const activeWeekKeys = normaliseWeekKeys(input.weekKeys);
  if (activeWeekKeys.length === 0 || input.activeMemberIds.length === 0) {
    return {
      activeWeekKeys,
      completedWeekKeys: [],
      currentWeekKey: activeWeekKeys.at(-1) ?? null,
      currentWeekComplete: false,
      currentStreakWeeks: 0,
      bestStreakWeeks: 0,
      atRiskWeekKey: activeWeekKeys.at(-1) ?? null,
    };
  }

  const target = Math.max(1, input.targetPerMember ?? 1);
  const activeSet = new Set(input.activeMemberIds);
  const completedWeekKeys = activeWeekKeys.filter((key) =>
    isWeekComplete({
      weekKey: key,
      submissions: input.submissions,
      activeSet,
      target,
    }),
  );
  const completedSet = new Set(completedWeekKeys);
  const currentWeekKey = activeWeekKeys.at(-1) ?? null;
  const currentWeekComplete =
    currentWeekKey !== null && completedSet.has(currentWeekKey);

  return {
    activeWeekKeys,
    completedWeekKeys,
    currentWeekKey,
    currentWeekComplete,
    currentStreakWeeks: computeCurrentStreak(activeWeekKeys, completedSet),
    bestStreakWeeks: computeBestStreak(activeWeekKeys, completedSet),
    atRiskWeekKey: currentWeekComplete ? null : currentWeekKey,
  };
}

export function buildPodChallengeShareAnalytics(input: {
  podId: string;
  weekKey: string;
  memberCount: number;
  completedCount: number;
  currentStreakWeeks: number;
}): {
  event: "pod_challenge_shared";
  props: {
    podId: string;
    weekKey: string;
    memberCount: number;
    completedCount: number;
    currentStreakWeeks: number;
  };
} {
  return {
    event: "pod_challenge_shared",
    props: {
      podId: input.podId,
      weekKey: input.weekKey,
      memberCount: Math.max(0, Math.trunc(input.memberCount)),
      completedCount: Math.max(0, Math.trunc(input.completedCount)),
      currentStreakWeeks: Math.max(0, Math.trunc(input.currentStreakWeeks)),
    },
  };
}

function isWeekComplete(input: {
  weekKey: string;
  submissions: ReadonlyArray<PodSubmission>;
  activeSet: ReadonlySet<string>;
  target: number;
}): boolean {
  const counts = new Map<string, number>();
  for (const submission of input.submissions) {
    if (
      submission.weekKey !== input.weekKey ||
      !input.activeSet.has(submission.memberId)
    ) {
      continue;
    }
    counts.set(submission.memberId, (counts.get(submission.memberId) ?? 0) + 1);
  }
  for (const memberId of input.activeSet) {
    if ((counts.get(memberId) ?? 0) < input.target) return false;
  }
  return true;
}

function computeCurrentStreak(
  weekKeys: ReadonlyArray<string>,
  completedSet: ReadonlySet<string>,
): number {
  if (weekKeys.length === 0) return 0;
  const latestKey = weekKeys[weekKeys.length - 1]!;
  const scanIndex = completedSet.has(latestKey)
    ? weekKeys.length - 1
    : weekKeys.length - 2;
  let expectedNext = completedSet.has(latestKey)
    ? null
    : isoWeekMondayMs(latestKey);
  let count = 0;

  for (let i = scanIndex; i >= 0; i -= 1) {
    const key = weekKeys[i]!;
    const ms = isoWeekMondayMs(key);
    if (!completedSet.has(key)) break;
    if (expectedNext !== null && expectedNext - ms !== WEEK_MS) break;
    count += 1;
    expectedNext = ms;
  }
  return count;
}

function computeBestStreak(
  weekKeys: ReadonlyArray<string>,
  completedSet: ReadonlySet<string>,
): number {
  let best = 0;
  let run = 0;
  let previousWeekMs: number | null = null;
  for (const key of weekKeys) {
    const ms = isoWeekMondayMs(key);
    const adjacent = previousWeekMs !== null && ms - previousWeekMs === WEEK_MS;
    if (completedSet.has(key)) {
      run = adjacent ? run + 1 : 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
    previousWeekMs = ms;
  }
  return best;
}

function normaliseWeekKeys(weekKeys: ReadonlyArray<string>): string[] {
  return Array.from(
    new Set(weekKeys.filter((key) => ISO_WEEK_RE.test(key))),
  ).sort((a, b) => isoWeekMondayMs(a) - isoWeekMondayMs(b));
}

function isoWeekMondayMs(weekKey: string): number {
  const match = ISO_WEEK_RE.exec(weekKey);
  if (!match) return Number.NaN;
  const year = Number(match[1]);
  const week = Number(match[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const weekOneMonday = new Date(jan4);
  weekOneMonday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
  return weekOneMonday.getTime() + (week - 1) * WEEK_MS;
}

function compareSubmissionTime(a: PodSubmission, b: PodSubmission): number {
  const time = compareNullableIso(a.submittedAt, b.submittedAt);
  if (time !== 0) return time;
  return a.id.localeCompare(b.id);
}

function compareNullableIso(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  const aMs = Date.parse(a);
  const bMs = Date.parse(b);
  if (Number.isFinite(aMs) && Number.isFinite(bMs) && aMs !== bMs) {
    return aMs - bMs;
  }
  return a.localeCompare(b);
}

function maxIso(a: string | null, b: string): string {
  if (a === null) return b;
  return compareNullableIso(a, b) < 0 ? b : a;
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  if (score < 0) return 0;
  if (score > 100) return 100;
  return score;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
