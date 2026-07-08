import { describe, expect, it } from "vitest";
import {
  buildInGroupLeaderboard,
  buildPodChallengeShareAnalytics,
  computeGroupChallengeStreak,
  summariseInGroupLeaderboard,
} from "./group-challenge-depth";
import {
  POD_SCHEMA_VERSION,
  type PodMember,
  type PodSubmission,
} from "@/types/challenge-pod";

function member(id: string, name: string, vacationSince?: string): PodMember {
  return {
    schemaVersion: POD_SCHEMA_VERSION,
    id,
    displayName: name,
    avatar: name[0] ?? "",
    ageBand: "adult",
    dietaryFlags: [],
    cuisinePreferences: [],
    joinedAt: "2026-01-01T00:00:00.000Z",
    weeksMissed: 0,
    vacationSince,
  };
}

function sub(
  overrides: Partial<PodSubmission> & { id: string },
): PodSubmission {
  return {
    schemaVersion: POD_SCHEMA_VERSION,
    podId: "pod-1",
    weekKey: "2026-W18",
    memberId: "alex",
    dayKey: "2026-05-04",
    submittedAt: "2026-05-04T12:00:00.000Z",
    photoUri: "data:,",
    selfRating: 4,
    caption: null,
    donateTags: [],
    stepCompletion: 1,
    aestheticScore: 0.7,
    hasStepImage: false,
    computedScore: 80,
    ...overrides,
  };
}

describe("buildInGroupLeaderboard", () => {
  it("ranks active members by counted score and keeps zero-cook rows visible", () => {
    const rows = buildInGroupLeaderboard({
      members: [
        member("alex", "Alex"),
        member("bri", "Bri"),
        member("casey", "Casey"),
      ],
      submissions: [
        sub({ id: "a1", memberId: "alex", computedScore: 70 }),
        sub({ id: "b1", memberId: "bri", computedScore: 90 }),
      ],
      weekKey: "2026-W18",
    });

    expect(rows.map((row) => [row.memberId, row.rank, row.totalScore])).toEqual(
      [
        ["bri", 1, 90],
        ["alex", 2, 70],
        ["casey", 3, 0],
      ],
    );
    expect(rows[2].completed).toBe(false);
  });

  it("uses the existing daily cap before leaderboard scoring", () => {
    const rows = buildInGroupLeaderboard({
      members: [member("alex", "Alex")],
      submissions: [
        sub({ id: "a1", memberId: "alex", computedScore: 40 }),
        sub({ id: "a2", memberId: "alex", computedScore: 50 }),
        sub({ id: "a3", memberId: "alex", computedScore: 100 }),
      ],
      weekKey: "2026-W18",
    });

    expect(rows[0].submissionCount).toBe(3);
    expect(rows[0].countedSubmissionCount).toBe(2);
    expect(rows[0].totalScore).toBe(90);
    expect(rows[0].bestScore).toBe(50);
  });

  it("excludes vacationing members by default but can accept an explicit active set", () => {
    const members = [
      member("alex", "Alex"),
      member("bri", "Bri", "2026-05-01T00:00:00.000Z"),
    ];

    expect(
      buildInGroupLeaderboard({
        members,
        submissions: [sub({ id: "b1", memberId: "bri", computedScore: 95 })],
        weekKey: "2026-W18",
      }).map((row) => row.memberId),
    ).toEqual(["alex"]);

    expect(
      buildInGroupLeaderboard({
        members,
        submissions: [sub({ id: "b1", memberId: "bri", computedScore: 95 })],
        weekKey: "2026-W18",
        activeMemberIds: ["bri"],
      }).map((row) => row.memberId),
    ).toEqual(["bri"]);
  });

  it("summarises the in-group leaderboard for compact UI and analytics", () => {
    const rows = buildInGroupLeaderboard({
      members: [member("alex", "Alex"), member("bri", "Bri")],
      submissions: [
        sub({ id: "a1", memberId: "alex", computedScore: 80 }),
        sub({ id: "b1", memberId: "bri", computedScore: 60 }),
      ],
      weekKey: "2026-W18",
    });

    expect(summariseInGroupLeaderboard(rows)).toMatchObject({
      memberCount: 2,
      completedCount: 2,
      totalCountedSubmissions: 2,
      totalScore: 140,
      leader: expect.objectContaining({ memberId: "alex" }),
    });
  });
});

describe("computeGroupChallengeStreak", () => {
  it("counts consecutive all-member completed weeks and marks the current week complete", () => {
    const result = computeGroupChallengeStreak({
      weekKeys: ["2026-W18", "2026-W19", "2026-W20"],
      activeMemberIds: ["alex", "bri"],
      submissions: [
        sub({ id: "18a", weekKey: "2026-W18", memberId: "alex" }),
        sub({ id: "18b", weekKey: "2026-W18", memberId: "bri" }),
        sub({ id: "19a", weekKey: "2026-W19", memberId: "alex" }),
        sub({ id: "19b", weekKey: "2026-W19", memberId: "bri" }),
        sub({ id: "20a", weekKey: "2026-W20", memberId: "alex" }),
        sub({ id: "20b", weekKey: "2026-W20", memberId: "bri" }),
      ],
    });

    expect(result.currentStreakWeeks).toBe(3);
    expect(result.bestStreakWeeks).toBe(3);
    expect(result.currentWeekComplete).toBe(true);
    expect(result.atRiskWeekKey).toBeNull();
  });

  it("carries the previous streak while the current week is still at risk", () => {
    const result = computeGroupChallengeStreak({
      weekKeys: ["2026-W18", "2026-W19", "2026-W20"],
      activeMemberIds: ["alex", "bri"],
      submissions: [
        sub({ id: "18a", weekKey: "2026-W18", memberId: "alex" }),
        sub({ id: "18b", weekKey: "2026-W18", memberId: "bri" }),
        sub({ id: "19a", weekKey: "2026-W19", memberId: "alex" }),
        sub({ id: "19b", weekKey: "2026-W19", memberId: "bri" }),
        sub({ id: "20a", weekKey: "2026-W20", memberId: "alex" }),
      ],
    });

    expect(result.currentStreakWeeks).toBe(2);
    expect(result.currentWeekComplete).toBe(false);
    expect(result.atRiskWeekKey).toBe("2026-W20");
  });

  it("breaks streaks across missing ISO weeks", () => {
    const result = computeGroupChallengeStreak({
      weekKeys: ["2026-W18", "2026-W20"],
      activeMemberIds: ["alex"],
      submissions: [
        sub({ id: "18a", weekKey: "2026-W18", memberId: "alex" }),
        sub({ id: "20a", weekKey: "2026-W20", memberId: "alex" }),
      ],
    });

    expect(result.currentStreakWeeks).toBe(1);
    expect(result.bestStreakWeeks).toBe(1);
  });
});

describe("buildPodChallengeShareAnalytics", () => {
  it("returns non-PII pod share analytics props", () => {
    expect(
      buildPodChallengeShareAnalytics({
        podId: "pod-sunday",
        weekKey: "2026-W20",
        memberCount: 4.8,
        completedCount: 3.2,
        currentStreakWeeks: 2.9,
      }),
    ).toEqual({
      event: "pod_challenge_shared",
      props: {
        podId: "pod-sunday",
        weekKey: "2026-W20",
        memberCount: 4,
        completedCount: 3,
        currentStreakWeeks: 2,
      },
    });
  });
});
