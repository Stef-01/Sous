import { describe, expect, it } from "vitest";
import {
  activeMemberIds,
  listSubmissionsForWeek,
  parseStoredPodState,
} from "./use-current-pod";
import {
  POD_SCHEMA_VERSION,
  type ChallengePod,
  type PodChallengeWeek,
  type PodMember,
  type PodState,
  type PodSubmission,
} from "@/types/challenge-pod";

// ── fixtures ────────────────────────────────────────────────

function member(over: Partial<PodMember> = {}): PodMember {
  return {
    schemaVersion: POD_SCHEMA_VERSION,
    id: "mem-alex",
    displayName: "Alex",
    avatar: "👋",
    ageBand: "adult",
    dietaryFlags: [],
    cuisinePreferences: [],
    joinedAt: "2026-04-27T00:00:00Z",
    vacationSince: null,
    weeksMissed: 0,
    ...over,
  };
}

function pod(over: Partial<ChallengePod> = {}): ChallengePod {
  return {
    schemaVersion: POD_SCHEMA_VERSION,
    id: "pod-sunday-cooks-1",
    name: "Sunday cooks",
    createdAt: "2026-04-27T00:00:00Z",
    ownerId: "mem-alex",
    adminIds: [],
    members: [member()],
    dietaryFlags: [],
    podTimezone: "America/Los_Angeles",
    revealAtHour: 21,
    inviteCode: "ABC123",
    inviteCodeExpiresAt: null,
    pausedThisWeek: false,
    ...over,
  };
}

function week(over: Partial<PodChallengeWeek> = {}): PodChallengeWeek {
  return {
    schemaVersion: POD_SCHEMA_VERSION,
    weekKey: "2026-W18",
    podId: "pod-sunday-cooks-1",
    recipeSlug: "caesar-salad",
    twist: null,
    startedAt: "2026-04-27T00:00:00Z",
    donationTagsEnabled: true,
    ...over,
  };
}

function submission(over: Partial<PodSubmission> = {}): PodSubmission {
  return {
    schemaVersion: POD_SCHEMA_VERSION,
    id: "sub-1",
    podId: "pod-sunday-cooks-1",
    weekKey: "2026-W18",
    memberId: "mem-alex",
    dayKey: "2026-04-30",
    submittedAt: "2026-04-30T19:00:00Z",
    photoUri: "data:image/png;base64,abc",
    selfRating: 5,
    caption: null,
    donateTags: [],
    stepCompletion: 0.92,
    aestheticScore: 0.5,
    hasStepImage: false,
    computedScore: 56,
    ...over,
  };
}

// ── parseStoredPodState — short-circuits ────────────────────

describe("parseStoredPodState — short-circuits", () => {
  it("null / undefined / empty string → fresh default", () => {
    expect(parseStoredPodState(null).pod).toBe(null);
    expect(parseStoredPodState(undefined).pod).toBe(null);
    expect(parseStoredPodState("").pod).toBe(null);
  });

  it("non-JSON → fresh default", () => {
    const result = parseStoredPodState("{not-json");
    expect(result.pod).toBe(null);
    expect(result.weeks).toEqual({});
    expect(result.submissions).toEqual({});
  });

  it("JSON null / array / primitive → fresh default", () => {
    expect(parseStoredPodState("null").pod).toBe(null);
    expect(parseStoredPodState("[]").pod).toBe(null);
    expect(parseStoredPodState("42").pod).toBe(null);
  });

  it("schemaVersion mismatch → fresh default", () => {
    const raw = JSON.stringify({ schemaVersion: 99, pod: pod() });
    expect(parseStoredPodState(raw).pod).toBe(null);
  });
});

describe("parseStoredPodState — pod handling", () => {
  it("preserves a valid pod round-trip", () => {
    const state: PodState = {
      schemaVersion: POD_SCHEMA_VERSION,
      pod: pod(),
      weeks: {},
      submissions: {},
    };
    const parsed = parseStoredPodState(JSON.stringify(state));
    expect(parsed.pod).toEqual(pod());
  });

  it("falls back to no-pod when the pod is corrupt", () => {
    const corruptPod = { ...pod(), name: "" }; // name min=1 → invalid
    const raw = JSON.stringify({
      schemaVersion: POD_SCHEMA_VERSION,
      pod: corruptPod,
    });
    expect(parseStoredPodState(raw).pod).toBe(null);
  });

  it("explicit pod=null is preserved", () => {
    const raw = JSON.stringify({
      schemaVersion: POD_SCHEMA_VERSION,
      pod: null,
    });
    expect(parseStoredPodState(raw).pod).toBe(null);
  });

  it("missing pod key → no-pod", () => {
    const raw = JSON.stringify({ schemaVersion: POD_SCHEMA_VERSION });
    expect(parseStoredPodState(raw).pod).toBe(null);
  });
});

describe("parseStoredPodState — weeks per-record validation", () => {
  it("preserves valid weeks", () => {
    const state = {
      schemaVersion: POD_SCHEMA_VERSION,
      pod: pod(),
      weeks: { "2026-W18": week() },
      submissions: {},
    };
    const parsed = parseStoredPodState(JSON.stringify(state));
    expect(parsed.weeks["2026-W18"]).toEqual(week());
  });

  it("drops invalid week records but keeps siblings", () => {
    const valid = week();
    const invalid = { ...week(), weekKey: "garbage" };
    const state = {
      schemaVersion: POD_SCHEMA_VERSION,
      pod: pod(),
      weeks: { "2026-W18": valid, garbage: invalid },
      submissions: {},
    };
    const parsed = parseStoredPodState(JSON.stringify(state));
    expect(parsed.weeks["2026-W18"]).toEqual(valid);
    expect(parsed.weeks.garbage).toBeUndefined();
  });

  it("non-object weeks → empty record", () => {
    const raw = JSON.stringify({
      schemaVersion: POD_SCHEMA_VERSION,
      pod: pod(),
      weeks: "garbage",
    });
    expect(parseStoredPodState(raw).weeks).toEqual({});
  });
});

describe("parseStoredPodState — submissions per-record validation", () => {
  it("preserves valid submissions", () => {
    const state = {
      schemaVersion: POD_SCHEMA_VERSION,
      pod: pod(),
      weeks: {},
      submissions: { "sub-1": submission() },
    };
    const parsed = parseStoredPodState(JSON.stringify(state));
    expect(parsed.submissions["sub-1"]).toEqual(submission());
  });

  it("drops invalid submission records but keeps siblings", () => {
    const valid = submission();
    const invalid = { ...submission(), id: "sub-2", selfRating: 99 };
    const state = {
      schemaVersion: POD_SCHEMA_VERSION,
      pod: pod(),
      weeks: {},
      submissions: { "sub-1": valid, "sub-2": invalid },
    };
    const parsed = parseStoredPodState(JSON.stringify(state));
    expect(parsed.submissions["sub-1"]).toEqual(valid);
    expect(parsed.submissions["sub-2"]).toBeUndefined();
  });

  it("handles a 50-submission payload without dropping valid entries", () => {
    const subs: Record<string, PodSubmission> = {};
    for (let i = 0; i < 50; i += 1) {
      subs[`sub-${i}`] = submission({ id: `sub-${i}` });
    }
    const state = {
      schemaVersion: POD_SCHEMA_VERSION,
      pod: pod(),
      weeks: {},
      submissions: subs,
    };
    const parsed = parseStoredPodState(JSON.stringify(state));
    expect(Object.keys(parsed.submissions)).toHaveLength(50);
  });
});

describe("parseStoredPodState — fresh-object invariant", () => {
  it("returns a fresh state object every call", () => {
    const a = parseStoredPodState(null);
    const b = parseStoredPodState(null);
    expect(a).not.toBe(b);
    expect(a.weeks).not.toBe(b.weeks);
    expect(a.submissions).not.toBe(b.submissions);
  });
});

// ── listSubmissionsForWeek ──────────────────────────────────

describe("listSubmissionsForWeek", () => {
  it("returns empty when no submissions match", () => {
    const state: PodState = {
      schemaVersion: POD_SCHEMA_VERSION,
      pod: pod(),
      weeks: {},
      submissions: {},
    };
    expect(listSubmissionsForWeek(state, "2026-W18")).toEqual([]);
  });

  it("filters to the target week", () => {
    const a = submission({ id: "a", weekKey: "2026-W18" });
    const b = submission({ id: "b", weekKey: "2026-W19" });
    const state: PodState = {
      schemaVersion: POD_SCHEMA_VERSION,
      pod: pod(),
      weeks: {},
      submissions: { a, b },
    };
    const result = listSubmissionsForWeek(state, "2026-W18");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a");
  });

  it("sorts by submittedAt ascending (deterministic gallery order)", () => {
    const a = submission({ id: "a", submittedAt: "2026-04-30T20:00:00Z" });
    const b = submission({ id: "b", submittedAt: "2026-04-30T08:00:00Z" });
    const c = submission({ id: "c", submittedAt: "2026-04-30T14:00:00Z" });
    const state: PodState = {
      schemaVersion: POD_SCHEMA_VERSION,
      pod: pod(),
      weeks: {},
      submissions: { a, b, c },
    };
    expect(listSubmissionsForWeek(state, "2026-W18").map((s) => s.id)).toEqual([
      "b",
      "c",
      "a",
    ]);
  });
});

// ── activeMemberIds ────────────────────────────────────────

describe("activeMemberIds", () => {
  it("returns [] for null pod", () => {
    expect(activeMemberIds(null)).toEqual([]);
  });

  it("returns all members when none are vacationing", () => {
    const p = pod({
      members: [
        member({ id: "a", vacationSince: null }),
        member({ id: "b", vacationSince: undefined }),
      ],
    });
    expect(activeMemberIds(p)).toEqual(["a", "b"]);
  });

  it("excludes vacationing members", () => {
    const p = pod({
      members: [
        member({ id: "a", vacationSince: null }),
        member({ id: "b", vacationSince: "2026-04-15T00:00:00Z" }),
        member({ id: "c", vacationSince: null }),
      ],
    });
    expect(activeMemberIds(p)).toEqual(["a", "c"]);
  });

  it("returns [] when every member is vacationing", () => {
    const p = pod({
      members: [
        member({ id: "a", vacationSince: "2026-04-15T00:00:00Z" }),
        member({ id: "b", vacationSince: "2026-04-15T00:00:00Z" }),
      ],
    });
    expect(activeMemberIds(p)).toEqual([]);
  });
});
