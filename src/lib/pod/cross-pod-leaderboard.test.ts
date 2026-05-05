import { describe, expect, it } from "vitest";
import {
  findOwnPodRow,
  rankRolling7Leaderboard,
  rankWeeklyLeaderboard,
  type PodEntry,
} from "./cross-pod-leaderboard";
import { POD_SCHEMA_VERSION, type PodSubmission } from "@/types/challenge-pod";

const NOW = new Date("2026-05-04T12:00:00Z");

function mkSub(
  overrides: Partial<PodSubmission> & { score: number; weekKey?: string },
): PodSubmission {
  return {
    schemaVersion: POD_SCHEMA_VERSION,
    id: overrides.id ?? `s-${Math.random().toString(36).slice(2)}`,
    podId: overrides.podId ?? "p",
    weekKey: overrides.weekKey ?? "2026-W18",
    memberId: overrides.memberId ?? "m",
    dayKey: overrides.dayKey ?? "2026-05-04",
    submittedAt: overrides.submittedAt ?? NOW.toISOString(),
    photoUri: overrides.photoUri ?? "data:,",
    selfRating: overrides.selfRating ?? 4,
    caption: null,
    donateTags: [],
    stepCompletion: 1,
    aestheticScore: 0.7,
    hasStepImage: false,
    computedScore: overrides.score,
  };
}

function mkPod(
  overrides: Partial<PodEntry> & {
    podId: string;
    submissions: PodSubmission[];
  },
): PodEntry {
  return {
    name: overrides.name ?? overrides.podId,
    memberCount: overrides.memberCount ?? 4,
    ...overrides,
  };
}

describe("rankWeeklyLeaderboard", () => {
  it("returns empty when no pods have submissions in the week", () => {
    const out = rankWeeklyLeaderboard({
      pods: [
        mkPod({
          podId: "p1",
          submissions: [mkSub({ score: 80, weekKey: "2026-W17" })],
        }),
      ],
      weekKey: "2026-W18",
    });
    expect(out).toEqual([]);
  });

  it("ranks pods by mean per-cook score for the week", () => {
    const out = rankWeeklyLeaderboard({
      pods: [
        mkPod({
          podId: "low",
          submissions: [mkSub({ score: 50 }), mkSub({ score: 50 })],
        }),
        mkPod({
          podId: "high",
          submissions: [mkSub({ score: 90 }), mkSub({ score: 80 })],
        }),
      ],
      weekKey: "2026-W18",
    });
    expect(out[0].podId).toBe("high");
    expect(out[0].averageScore).toBe(85);
    expect(out[0].rank).toBe(1);
    expect(out[1].rank).toBe(2);
  });

  it("uses mean-per-member, not raw sum (so 4-person pods aren't penalised)", () => {
    const out = rankWeeklyLeaderboard({
      pods: [
        mkPod({
          podId: "small",
          memberCount: 2,
          submissions: [mkSub({ score: 90 }), mkSub({ score: 90 })],
        }),
        mkPod({
          podId: "big",
          memberCount: 8,
          submissions: [
            mkSub({ score: 70 }),
            mkSub({ score: 70 }),
            mkSub({ score: 70 }),
            mkSub({ score: 70 }),
          ],
        }),
      ],
      weekKey: "2026-W18",
    });
    // Small pod's mean (90) beats big pod's mean (70) despite
    // smaller absolute total.
    expect(out[0].podId).toBe("small");
  });

  it("assigns sequential ranks starting at 1", () => {
    const out = rankWeeklyLeaderboard({
      pods: [
        mkPod({ podId: "a", submissions: [mkSub({ score: 90 })] }),
        mkPod({ podId: "b", submissions: [mkSub({ score: 80 })] }),
        mkPod({ podId: "c", submissions: [mkSub({ score: 70 })] }),
      ],
      weekKey: "2026-W18",
    });
    expect(out.map((r) => r.rank)).toEqual([1, 2, 3]);
  });

  it("breaks ties by input order", () => {
    const out = rankWeeklyLeaderboard({
      pods: [
        mkPod({ podId: "first", submissions: [mkSub({ score: 80 })] }),
        mkPod({ podId: "second", submissions: [mkSub({ score: 80 })] }),
      ],
      weekKey: "2026-W18",
    });
    expect(out[0].podId).toBe("first");
  });

  it("clamps malformed computedScore values into [0,100]", () => {
    const out = rankWeeklyLeaderboard({
      pods: [
        mkPod({
          podId: "p",
          submissions: [
            mkSub({ score: 200 }), // clamped to 100
            mkSub({ score: -50 }), // clamped to 0
          ],
        }),
      ],
      weekKey: "2026-W18",
    });
    expect(out[0].averageScore).toBe(50);
  });
});

describe("rankRolling7Leaderboard", () => {
  it("includes only submissions in the trailing 7 days", () => {
    const within = mkSub({
      score: 90,
      submittedAt: new Date(
        NOW.getTime() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      dayKey: "2026-05-01",
    });
    const old = mkSub({
      score: 50,
      submittedAt: new Date(
        NOW.getTime() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      dayKey: "2026-04-04",
    });
    const out = rankRolling7Leaderboard({
      pods: [mkPod({ podId: "p", submissions: [within, old] })],
      now: NOW,
    });
    expect(out).toHaveLength(1);
    expect(out[0].submissionCount).toBe(1);
  });

  it("ranks pods by rolling sum of per-day means", () => {
    const t1 = new Date(NOW.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
    const t2 = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const out = rankRolling7Leaderboard({
      pods: [
        mkPod({
          podId: "consistent",
          submissions: [
            mkSub({ score: 80, submittedAt: t1, dayKey: "2026-05-03" }),
            mkSub({ score: 80, submittedAt: t2, dayKey: "2026-05-02" }),
          ],
        }),
        mkPod({
          podId: "spikey",
          submissions: [
            mkSub({ score: 100, submittedAt: t1, dayKey: "2026-05-03" }),
          ],
        }),
      ],
      now: NOW,
    });
    // consistent: 80 + 80 = 160 rolling > spikey: 100 rolling
    expect(out[0].podId).toBe("consistent");
  });

  it("returns empty array on a malformed `now`", () => {
    const out = rankRolling7Leaderboard({
      pods: [mkPod({ podId: "p", submissions: [mkSub({ score: 80 })] })],
      now: new Date("invalid"),
    });
    expect(out).toEqual([]);
  });
});

describe("findOwnPodRow", () => {
  it("returns the pod's row when present", () => {
    const rows = rankWeeklyLeaderboard({
      pods: [
        mkPod({ podId: "mine", submissions: [mkSub({ score: 90 })] }),
        mkPod({ podId: "other", submissions: [mkSub({ score: 80 })] }),
      ],
      weekKey: "2026-W18",
    });
    expect(findOwnPodRow({ rows, podId: "mine" })?.rank).toBe(1);
  });

  it("returns null when not present", () => {
    expect(findOwnPodRow({ rows: [], podId: "x" })).toBeNull();
  });
});
