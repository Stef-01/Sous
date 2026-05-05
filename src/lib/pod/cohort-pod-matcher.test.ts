import { describe, expect, it } from "vitest";
import {
  scoreAcquisitionWeek,
  scoreEngagementTier,
  suggestPodsForUser,
  type PodCohortSummary,
  type UserCohortHints,
} from "./cohort-pod-matcher";
import type { SegmentLabel } from "@/lib/cohort/segmentation";

function mkUser(
  overrides?: Partial<SegmentLabel> & { dietaryFlags?: string[] },
): UserCohortHints {
  const segment: SegmentLabel = {
    acquisitionWeek: overrides?.acquisitionWeek ?? "2026-W18",
    engagementTier: overrides?.engagementTier ?? "regular",
    segmentKey: "x",
  };
  return {
    segment,
    dietaryFlags: overrides?.dietaryFlags ?? [],
  };
}

function mkPod(overrides: Partial<PodCohortSummary>): PodCohortSummary {
  return {
    podId: overrides.podId ?? "p-default",
    name: overrides.name ?? "Default Pod",
    memberCount: overrides.memberCount ?? 4,
    modalEngagementTier: overrides.modalEngagementTier ?? "regular",
    medianAcquisitionWeek: overrides.medianAcquisitionWeek ?? "2026-W18",
    dietaryFlags: overrides.dietaryFlags ?? [],
    acceptingMembers: overrides.acceptingMembers ?? true,
  };
}

describe("scoreEngagementTier", () => {
  it("max score for same tier", () => {
    expect(scoreEngagementTier({ user: "regular", pod: "regular" })).toBe(0.6);
  });

  it("decays with distance", () => {
    expect(scoreEngagementTier({ user: "regular", pod: "casual" })).toBe(0.3);
    expect(scoreEngagementTier({ user: "regular", pod: "dormant" })).toBe(0.1);
    expect(scoreEngagementTier({ user: "core", pod: "dormant" })).toBe(0);
  });

  it("symmetric across the tier ladder", () => {
    expect(scoreEngagementTier({ user: "casual", pod: "core" })).toBe(
      scoreEngagementTier({ user: "core", pod: "casual" }),
    );
  });
});

describe("scoreAcquisitionWeek", () => {
  it("max score for the same ISO week", () => {
    expect(scoreAcquisitionWeek({ user: "2026-W18", pod: "2026-W18" })).toBe(
      0.3,
    );
  });

  it("decays with distance", () => {
    expect(scoreAcquisitionWeek({ user: "2026-W18", pod: "2026-W20" })).toBe(
      0.2,
    );
    expect(scoreAcquisitionWeek({ user: "2026-W18", pod: "2026-W30" })).toBe(
      0.1,
    );
    expect(scoreAcquisitionWeek({ user: "2026-W18", pod: "2026-W45" })).toBe(0);
  });

  it("returns 0 on malformed input", () => {
    expect(scoreAcquisitionWeek({ user: "garbage", pod: "2026-W18" })).toBe(0);
    expect(scoreAcquisitionWeek({ user: "2026-W18", pod: "" })).toBe(0);
  });
});

describe("suggestPodsForUser", () => {
  it("returns the empty array when no pods are open", () => {
    const out = suggestPodsForUser({
      user: mkUser(),
      pods: [mkPod({ acceptingMembers: false })],
    });
    expect(out).toEqual([]);
  });

  it("drops pods that fail the dietary floor", () => {
    const out = suggestPodsForUser({
      user: mkUser({ dietaryFlags: ["vegetarian"] }),
      pods: [
        mkPod({ podId: "no-veg", dietaryFlags: [] }),
        mkPod({ podId: "veg", dietaryFlags: ["vegetarian"] }),
      ],
    });
    expect(out.map((s) => s.podId)).toEqual(["veg"]);
  });

  it("ranks same-tier same-week pods highest", () => {
    const out = suggestPodsForUser({
      user: mkUser({ engagementTier: "regular", acquisitionWeek: "2026-W18" }),
      pods: [
        mkPod({
          podId: "far",
          modalEngagementTier: "core",
          medianAcquisitionWeek: "2025-W01",
        }),
        mkPod({
          podId: "perfect",
          modalEngagementTier: "regular",
          medianAcquisitionWeek: "2026-W18",
        }),
      ],
    });
    expect(out[0].podId).toBe("perfect");
  });

  it("respects the limit parameter", () => {
    const out = suggestPodsForUser({
      user: mkUser(),
      pods: [
        mkPod({ podId: "a" }),
        mkPod({ podId: "b" }),
        mkPod({ podId: "c" }),
      ],
      limit: 2,
    });
    expect(out).toHaveLength(2);
  });

  it("never returns scores outside [0,1]", () => {
    const out = suggestPodsForUser({
      user: mkUser(),
      pods: [
        mkPod({
          podId: "x",
          modalEngagementTier: "regular",
          medianAcquisitionWeek: "2026-W18",
        }),
      ],
    });
    for (const r of out) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    }
  });

  it("breaks ties by input order", () => {
    const out = suggestPodsForUser({
      user: mkUser(),
      pods: [mkPod({ podId: "first" }), mkPod({ podId: "second" })],
    });
    expect(out[0].podId).toBe("first");
  });

  it("emits a 'why' string for every suggestion", () => {
    const out = suggestPodsForUser({
      user: mkUser(),
      pods: [mkPod({ podId: "x" })],
    });
    expect(out[0].reason).toBeTruthy();
    expect(out[0].reason.length).toBeGreaterThan(2);
  });
});
