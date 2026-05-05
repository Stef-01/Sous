import { describe, expect, it } from "vitest";
import {
  buildDemoPodState,
  DEMO_CHALLENGE_OPTIONS,
  DEMO_TEAMMATES,
  findChallengeOption,
} from "./seed-pod-challenge";

const NOW = new Date("2026-05-08T20:00:00Z"); // a Friday so the week is mid-active

describe("DEMO_CHALLENGE_OPTIONS", () => {
  it("includes the user-flagged challenges (Beyond Meat + Spring Greens)", () => {
    expect(
      DEMO_CHALLENGE_OPTIONS.some((c) => c.slug === "demo-beyond-meat"),
    ).toBe(true);
    expect(
      DEMO_CHALLENGE_OPTIONS.some((c) => c.slug === "demo-spring-greens"),
    ).toBe(true);
  });

  it("Beyond Meat is sponsored, Spring Greens is not", () => {
    const beyondMeat = DEMO_CHALLENGE_OPTIONS.find(
      (c) => c.slug === "demo-beyond-meat",
    );
    const springGreens = DEMO_CHALLENGE_OPTIONS.find(
      (c) => c.slug === "demo-spring-greens",
    );
    expect(beyondMeat?.sponsoredBy).toBe("Beyond Meat");
    expect(springGreens?.sponsoredBy).toBeNull();
  });

  it("every option has a recipe slug + non-empty title + subtitle", () => {
    for (const opt of DEMO_CHALLENGE_OPTIONS) {
      expect(opt.recipeSlug.length).toBeGreaterThan(0);
      expect(opt.title.length).toBeGreaterThan(0);
      expect(opt.subtitle.length).toBeGreaterThan(0);
    }
  });
});

describe("DEMO_TEAMMATES", () => {
  it("ships exactly 3 AI teammates so the pod always has volume", () => {
    expect(DEMO_TEAMMATES).toHaveLength(3);
  });

  it("each teammate has a distinct id + displayName", () => {
    const ids = new Set(DEMO_TEAMMATES.map((t) => t.id));
    const names = new Set(DEMO_TEAMMATES.map((t) => t.displayName));
    expect(ids.size).toBe(3);
    expect(names.size).toBe(3);
  });

  it("offsets are negative — teammates 'submit' before the user's now", () => {
    for (const t of DEMO_TEAMMATES) {
      expect(t.submitOffsetHours).toBeLessThan(0);
    }
  });
});

describe("buildDemoPodState", () => {
  const beyondMeat = DEMO_CHALLENGE_OPTIONS.find(
    (c) => c.slug === "demo-beyond-meat",
  )!;

  it("returns a pod with 4 members (user + 3 AI teammates)", () => {
    const state = buildDemoPodState({ challenge: beyondMeat, now: NOW });
    expect(state.pod?.members).toHaveLength(4);
    expect(state.pod?.members[0].id).toBe("user-demo");
  });

  it("the pod's weeks map carries one week keyed by current ISO week", () => {
    const state = buildDemoPodState({ challenge: beyondMeat, now: NOW });
    const weeks = Object.values(state.weeks);
    expect(weeks).toHaveLength(1);
    expect(weeks[0].recipeSlug).toBe(beyondMeat.recipeSlug);
  });

  it("attaches the challenge twist to the active week", () => {
    const state = buildDemoPodState({ challenge: beyondMeat, now: NOW });
    const wk = Object.values(state.weeks)[0];
    expect(wk.twist).toBe("vegetarian"); // beyond-meat sets vegetarian
  });

  it("pre-fills teammate submissions by default (gallery has content)", () => {
    const state = buildDemoPodState({ challenge: beyondMeat, now: NOW });
    const subs = Object.values(state.submissions);
    expect(subs.length).toBeGreaterThan(0);
    // Each submission belongs to one of the AI teammates.
    for (const s of subs) {
      expect(DEMO_TEAMMATES.some((t) => t.id === s.memberId)).toBe(true);
    }
  });

  it("submissions have valid stars (1-5) and step completion (0-1)", () => {
    const state = buildDemoPodState({ challenge: beyondMeat, now: NOW });
    for (const s of Object.values(state.submissions)) {
      expect(s.selfRating).toBeGreaterThanOrEqual(1);
      expect(s.selfRating).toBeLessThanOrEqual(5);
      expect(s.stepCompletion).toBeGreaterThanOrEqual(0);
      expect(s.stepCompletion).toBeLessThanOrEqual(1);
    }
  });

  it("withPrefilledSubmissions=false emits no submissions (test branch)", () => {
    const state = buildDemoPodState({
      challenge: beyondMeat,
      now: NOW,
      withPrefilledSubmissions: false,
    });
    expect(Object.keys(state.submissions)).toHaveLength(0);
  });

  it("submission photoUris are inline data URIs (no external dependency)", () => {
    const state = buildDemoPodState({ challenge: beyondMeat, now: NOW });
    for (const s of Object.values(state.submissions)) {
      expect(s.photoUri.startsWith("data:image/")).toBe(true);
    }
  });

  it("all submissions belong to the pod's active week", () => {
    const state = buildDemoPodState({ challenge: beyondMeat, now: NOW });
    const wk = Object.keys(state.weeks)[0];
    for (const s of Object.values(state.submissions)) {
      expect(s.weekKey).toBe(wk);
    }
  });

  it("the user is the pod owner (no admin gate needed)", () => {
    const state = buildDemoPodState({ challenge: beyondMeat, now: NOW });
    expect(state.pod?.ownerId).toBe("user-demo");
    // Empty admin list is fine — owner is implicitly admin.
    expect(state.pod?.adminIds).toEqual([]);
  });

  it("schemaVersion is set on every artifact", () => {
    const state = buildDemoPodState({ challenge: beyondMeat, now: NOW });
    expect(state.schemaVersion).toBeGreaterThan(0);
    expect(state.pod?.schemaVersion).toBe(state.schemaVersion);
    for (const m of state.pod!.members) {
      expect(m.schemaVersion).toBe(state.schemaVersion);
    }
  });
});

describe("findChallengeOption", () => {
  it("matches by full slug", () => {
    expect(findChallengeOption("demo-beyond-meat")?.title).toBe(
      "Cook with Beyond Meat",
    );
  });

  it("matches by short slug (auto-prefixes with 'demo-')", () => {
    expect(findChallengeOption("beyond-meat")?.sponsoredBy).toBe("Beyond Meat");
    expect(findChallengeOption("spring-greens")?.title).toBe("Spring Greens");
  });

  it("matches by recipe slug", () => {
    expect(findChallengeOption("beyond-meat-tacos")?.slug).toBe(
      "demo-beyond-meat",
    );
  });

  it("is case-insensitive + whitespace-tolerant", () => {
    expect(findChallengeOption("  BEYOND-MEAT  ")?.title).toBe(
      "Cook with Beyond Meat",
    );
  });

  it("returns null for an unknown slug", () => {
    expect(findChallengeOption("not-a-thing")).toBeNull();
  });
});
