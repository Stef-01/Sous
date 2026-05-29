import { describe, expect, it } from "vitest";
import {
  aggregateDietaryFromMembers,
  buildPodFromCreation,
  generateInviteCode,
  nextPodId,
  nextPodMemberId,
} from "./pod-create";
import {
  POD_SCHEMA_VERSION,
  challengePodSchema,
  type PodMember,
} from "@/types/challenge-pod";

// ── generateInviteCode ──────────────────────────────────────

describe("generateInviteCode", () => {
  it("returns a 6-character string", () => {
    expect(generateInviteCode().length).toBe(6);
  });

  it("draws only from the safe alphabet (no 0/1/I/O)", () => {
    // 200 codes — chance of any forbidden char is effectively zero.
    for (let i = 0; i < 200; i += 1) {
      const code = generateInviteCode();
      expect(code).toMatch(/^[A-HJ-NP-Z2-9]+$/);
    }
  });

  it("is deterministic when given a seeded rng", () => {
    let seed = 0;
    const rng = () => {
      seed = (seed + 0.137) % 1;
      return seed;
    };
    const a = generateInviteCode(rng);
    seed = 0;
    const b = generateInviteCode(rng);
    expect(a).toBe(b);
  });

  it("returns 6 chars even with rng → 0", () => {
    expect(generateInviteCode(() => 0)).toHaveLength(6);
  });

  it("returns 6 chars even with rng → 0.999", () => {
    expect(generateInviteCode(() => 0.999)).toHaveLength(6);
  });
});

// ── nextPodId ───────────────────────────────────────────────

describe("nextPodId", () => {
  it("formats as pod-<slug>-<unix>", () => {
    const id = nextPodId("Sunday cooks", new Date(1714579200000));
    expect(id).toBe("pod-sunday-cooks-1714579200");
  });

  it("normalises whitespace + case", () => {
    const id = nextPodId("  Friday Night CREW  ", new Date(0));
    expect(id).toBe("pod-friday-night-crew-0");
  });

  it("falls back to 'pod' for emoji-only names", () => {
    const id = nextPodId("🍝🥗", new Date(0));
    expect(id).toBe("pod-pod-0");
  });

  it("trims slug to 32 chars", () => {
    const long = "a".repeat(60);
    const id = nextPodId(long, new Date(0));
    expect(id).toBe(`pod-${"a".repeat(32)}-0`);
  });
});

// ── nextPodMemberId ────────────────────────────────────────

describe("nextPodMemberId", () => {
  it("returns mem-<slug>-1 on empty existing list", () => {
    expect(nextPodMemberId("pod-sunday-cooks-100", [])).toBe(
      "mem-sunday-cooks-1",
    );
  });

  it("increments past the highest existing canonical id", () => {
    const existing = ["mem-sunday-cooks-1", "mem-sunday-cooks-3"];
    expect(nextPodMemberId("pod-sunday-cooks-100", existing)).toBe(
      "mem-sunday-cooks-4",
    );
  });

  it("ignores non-canonical ids in the existing set", () => {
    const existing = ["legacy-id-7", "mem-sunday-cooks-2"];
    expect(nextPodMemberId("pod-sunday-cooks-100", existing)).toBe(
      "mem-sunday-cooks-3",
    );
  });

  it("falls back to slug=member when podId is malformed", () => {
    expect(nextPodMemberId("garbage", [])).toBe("mem-member-1");
  });
});

// ── aggregateDietaryFromMembers ────────────────────────────

function member(over: Partial<PodMember> = {}): PodMember {
  return {
    schemaVersion: POD_SCHEMA_VERSION,
    id: "mem-1",
    displayName: "Alex",
    avatar: "",
    ageBand: "adult",
    dietaryFlags: [],
    cuisinePreferences: [],
    joinedAt: "2026-04-27T00:00:00Z",
    vacationSince: null,
    weeksMissed: 0,
    ...over,
  };
}

describe("aggregateDietaryFromMembers", () => {
  it("empty roster → []", () => {
    expect(aggregateDietaryFromMembers([])).toEqual([]);
  });

  it("dedupes across members", () => {
    const a = member({ dietaryFlags: ["vegan", "gluten-free"] });
    const b = member({ dietaryFlags: ["vegan", "nut-allergy"] });
    expect(aggregateDietaryFromMembers([a, b])).toEqual([
      "gluten-free",
      "nut-allergy",
      "vegan",
    ]);
  });

  it("returns a sorted array (deterministic display)", () => {
    const a = member({ dietaryFlags: ["zucchini", "apple"] });
    expect(aggregateDietaryFromMembers([a])).toEqual(["apple", "zucchini"]);
  });

  it("ignores members with empty dietary flags", () => {
    const a = member({ dietaryFlags: [] });
    const b = member({ dietaryFlags: ["vegan"] });
    expect(aggregateDietaryFromMembers([a, b])).toEqual(["vegan"]);
  });
});

// ── buildPodFromCreation ────────────────────────────────────

describe("buildPodFromCreation — basic shape", () => {
  it("composes a schema-valid pod", () => {
    const pod = buildPodFromCreation({
      name: "Sunday cooks",
      revealAtHour: 21,
      members: [
        {
          displayName: "Alex",
          avatar: "👋",
          ageBand: "adult",
          dietaryFlags: [],
          cuisinePreferences: [],
        },
      ],
      now: new Date("2026-04-27T00:00:00Z"),
      rng: () => 0,
    });
    expect(challengePodSchema.safeParse(pod).success).toBe(true);
  });

  it("first member becomes the owner + sole admin", () => {
    const pod = buildPodFromCreation({
      name: "Sunday cooks",
      revealAtHour: 21,
      members: [
        {
          displayName: "Alex",
          avatar: "",
          ageBand: "adult",
          dietaryFlags: [],
          cuisinePreferences: [],
        },
        {
          displayName: "Bri",
          avatar: "",
          ageBand: "adult",
          dietaryFlags: [],
          cuisinePreferences: [],
        },
      ],
    });
    expect(pod.ownerId).toBe(pod.members[0].id);
    expect(pod.adminIds).toEqual([pod.members[0].id]);
  });

  it("preserves member order in the roster", () => {
    const pod = buildPodFromCreation({
      name: "Test",
      revealAtHour: 18,
      members: [
        {
          displayName: "Alex",
          avatar: "",
          ageBand: "adult",
          dietaryFlags: [],
          cuisinePreferences: [],
        },
        {
          displayName: "Bri",
          avatar: "",
          ageBand: "child",
          dietaryFlags: [],
          cuisinePreferences: [],
        },
        {
          displayName: "Casey",
          avatar: "",
          ageBand: "adult",
          dietaryFlags: [],
          cuisinePreferences: [],
        },
      ],
    });
    expect(pod.members.map((m) => m.displayName)).toEqual([
      "Alex",
      "Bri",
      "Casey",
    ]);
  });

  it("aggregates dietary flags across the roster", () => {
    const pod = buildPodFromCreation({
      name: "Test",
      revealAtHour: 21,
      members: [
        {
          displayName: "A",
          avatar: "",
          ageBand: "adult",
          dietaryFlags: ["vegan"],
          cuisinePreferences: [],
        },
        {
          displayName: "B",
          avatar: "",
          ageBand: "adult",
          dietaryFlags: ["gluten-free"],
          cuisinePreferences: [],
        },
      ],
    });
    expect(pod.dietaryFlags).toEqual(["gluten-free", "vegan"]);
  });

  it("caps avatar at 8 chars", () => {
    const pod = buildPodFromCreation({
      name: "Test",
      revealAtHour: 21,
      members: [
        {
          displayName: "A",
          avatar: "🦄🌮🥗🍝🍜🍱🥘🍙🍚🍛", // 10 emoji
          ageBand: "adult",
          dietaryFlags: [],
          cuisinePreferences: [],
        },
      ],
    });
    expect(pod.members[0].avatar.length).toBeLessThanOrEqual(8);
  });

  it("generates a 6-char invite code from the rng", () => {
    const pod = buildPodFromCreation({
      name: "Test",
      revealAtHour: 21,
      members: [
        {
          displayName: "A",
          avatar: "",
          ageBand: "adult",
          dietaryFlags: [],
          cuisinePreferences: [],
        },
      ],
      rng: () => 0,
    });
    expect(pod.inviteCode).toHaveLength(6);
    expect(pod.inviteCode).toMatch(/^[A-HJ-NP-Z2-9]+$/);
  });

  it("respects revealAtHour input", () => {
    const pod = buildPodFromCreation({
      name: "Test",
      revealAtHour: 18,
      members: [
        {
          displayName: "A",
          avatar: "",
          ageBand: "adult",
          dietaryFlags: [],
          cuisinePreferences: [],
        },
      ],
    });
    expect(pod.revealAtHour).toBe(18);
  });

  it("starts with pausedThisWeek=false and inviteCodeExpiresAt=null", () => {
    const pod = buildPodFromCreation({
      name: "Test",
      revealAtHour: 21,
      members: [
        {
          displayName: "A",
          avatar: "",
          ageBand: "adult",
          dietaryFlags: [],
          cuisinePreferences: [],
        },
      ],
    });
    expect(pod.pausedThisWeek).toBe(false);
    expect(pod.inviteCodeExpiresAt).toBe(null);
  });
});
