import { describe, expect, it } from "vitest";
import {
  POD_WEEKLY_COOK_TARGET,
  buildPodWeekRingRows,
  summarisePodWeekProgress,
} from "./pod-week-rings";
import type { PodMember, PodSubmission } from "@/types/challenge-pod";

function fixtureMember(over: Partial<PodMember> = {}): PodMember {
  return {
    schemaVersion: 1,
    id: "m-x",
    displayName: "Alice",
    avatar: "🦊",
    ageBand: "adult",
    dietaryFlags: [],
    cuisinePreferences: [],
    joinedAt: "2026-01-01T00:00:00Z",
    weeksMissed: 0,
    ...over,
  };
}

function fixtureSubmission(over: Partial<PodSubmission> = {}): PodSubmission {
  return {
    schemaVersion: 1,
    id: "s-x",
    podId: "p-x",
    weekKey: "2026-W18",
    memberId: "m-x",
    dayKey: "2026-05-01",
    submittedAt: "2026-05-01T18:00:00Z",
    photoUri: "data:image/png;base64,",
    selfRating: 4,
    caption: null,
    donateTags: [],
    stepCompletion: 1,
    aestheticScore: 0.5,
    hasStepImage: false,
    computedScore: 80,
    ...over,
  };
}

describe("buildPodWeekRingRows", () => {
  it("empty everything → empty rows", () => {
    expect(
      buildPodWeekRingRows({
        members: [],
        submissions: [],
        activeMemberIds: [],
      }),
    ).toEqual([]);
  });

  it("active members with no submissions → all 0-count rows", () => {
    const a = fixtureMember({ id: "a", displayName: "Alice" });
    const b = fixtureMember({ id: "b", displayName: "Bob" });
    const out = buildPodWeekRingRows({
      members: [a, b],
      submissions: [],
      activeMemberIds: ["a", "b"],
    });
    expect(out.map((r) => r.member.id)).toEqual(["a", "b"]);
    expect(out.every((r) => r.count === 0)).toBe(true);
  });

  it("counts submissions per member", () => {
    const a = fixtureMember({ id: "a", displayName: "Alice" });
    const b = fixtureMember({ id: "b", displayName: "Bob" });
    const out = buildPodWeekRingRows({
      members: [a, b],
      submissions: [
        fixtureSubmission({ id: "s1", memberId: "a" }),
        fixtureSubmission({ id: "s2", memberId: "a" }),
        fixtureSubmission({ id: "s3", memberId: "b" }),
      ],
      activeMemberIds: ["a", "b"],
    });
    const aRow = out.find((r) => r.member.id === "a");
    const bRow = out.find((r) => r.member.id === "b");
    expect(aRow?.count).toBe(2);
    expect(bRow?.count).toBe(1);
  });

  it("excludes inactive members", () => {
    const a = fixtureMember({ id: "a", displayName: "Alice" });
    const b = fixtureMember({ id: "b", displayName: "Bob" });
    const out = buildPodWeekRingRows({
      members: [a, b],
      submissions: [],
      activeMemberIds: ["a"], // b inactive
    });
    expect(out.length).toBe(1);
    expect(out[0]?.member.id).toBe("a");
  });

  it("sorts done members first, then alphabetically by name", () => {
    const a = fixtureMember({ id: "a", displayName: "Charlie" });
    const b = fixtureMember({ id: "b", displayName: "Alice" });
    const c = fixtureMember({ id: "c", displayName: "Bob" });
    const out = buildPodWeekRingRows({
      members: [a, b, c],
      submissions: [
        fixtureSubmission({ id: "s1", memberId: "a" }), // Charlie done
      ],
      activeMemberIds: ["a", "b", "c"],
    });
    expect(out.map((r) => r.member.displayName)).toEqual([
      "Charlie", // done first
      "Alice", // then alpha among not-done
      "Bob",
    ]);
  });

  it("uses default target when not specified", () => {
    const out = buildPodWeekRingRows({
      members: [fixtureMember()],
      submissions: [],
      activeMemberIds: ["m-x"],
    });
    expect(out[0]?.target).toBe(POD_WEEKLY_COOK_TARGET);
  });

  it("custom target threads through", () => {
    const out = buildPodWeekRingRows({
      members: [fixtureMember()],
      submissions: [],
      activeMemberIds: ["m-x"],
      target: 3,
    });
    expect(out[0]?.target).toBe(3);
  });

  it("POD_WEEKLY_COOK_TARGET is 1", () => {
    expect(POD_WEEKLY_COOK_TARGET).toBe(1);
  });
});

describe("summarisePodWeekProgress", () => {
  it("empty rows → 0/0", () => {
    expect(summarisePodWeekProgress([])).toEqual({ done: 0, total: 0 });
  });

  it("counts members at target as done", () => {
    const out = summarisePodWeekProgress([
      { member: fixtureMember({ id: "a" }), count: 1, target: 1 },
      { member: fixtureMember({ id: "b" }), count: 0, target: 1 },
      { member: fixtureMember({ id: "c" }), count: 2, target: 1 },
    ]);
    expect(out).toEqual({ done: 2, total: 3 });
  });

  it("count below target → not done", () => {
    const out = summarisePodWeekProgress([
      { member: fixtureMember({ id: "a" }), count: 1, target: 3 },
    ]);
    expect(out).toEqual({ done: 0, total: 1 });
  });

  it("count exactly at target → done (inclusive)", () => {
    const out = summarisePodWeekProgress([
      { member: fixtureMember({ id: "a" }), count: 3, target: 3 },
    ]);
    expect(out).toEqual({ done: 1, total: 1 });
  });
});
