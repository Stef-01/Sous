import { describe, expect, it } from "vitest";
import {
  DEFAULT_TWIST_OPTIONS,
  detectTwistStreak,
  formatTwistStreakIdentity,
  resolveWeeklyTwist,
  tallyTwistVotes,
} from "./twist-vote";

// ── DEFAULT_TWIST_OPTIONS ─────────────────────────────────

describe("DEFAULT_TWIST_OPTIONS", () => {
  it("exposes the 6 starter twists from the W37 plan", () => {
    expect(DEFAULT_TWIST_OPTIONS.length).toBe(6);
    expect(DEFAULT_TWIST_OPTIONS).toContain("vegetarian");
    expect(DEFAULT_TWIST_OPTIONS).toContain("spicy");
    expect(DEFAULT_TWIST_OPTIONS).toContain("speedy");
  });
});

// ── tallyTwistVotes ───────────────────────────────────────

describe("tallyTwistVotes — basic tally", () => {
  const opts = ["spicy", "vegetarian", "speedy"];

  it("empty votes → empty ranked + null winner", () => {
    const out = tallyTwistVotes(opts, []);
    expect(out.ranked).toEqual([]);
    expect(out.winner).toBe(null);
  });

  it("single-vote twist wins", () => {
    const out = tallyTwistVotes(opts, ["spicy"]);
    expect(out.winner).toBe("spicy");
    expect(out.ranked.length).toBe(1);
  });

  it("most-voted twist wins", () => {
    const out = tallyTwistVotes(opts, [
      "spicy",
      "spicy",
      "vegetarian",
      "speedy",
    ]);
    expect(out.winner).toBe("spicy");
    expect(out.ranked[0]?.count).toBe(2);
  });

  it("case-insensitive vote matching", () => {
    const out = tallyTwistVotes(opts, ["SPICY", "Spicy", "spicy"]);
    expect(out.winner).toBe("spicy");
    expect(out.ranked[0]?.count).toBe(3);
  });

  it("votes whose twist isn't in proposedOptions → silently dropped", () => {
    const out = tallyTwistVotes(opts, [
      "spicy",
      "off-list-twist",
      "another-rogue",
    ]);
    expect(out.winner).toBe("spicy");
    expect(out.ranked[0]?.count).toBe(1);
  });

  it("non-string votes → silently dropped", () => {
    const out = tallyTwistVotes(opts, [
      "spicy",
      null as unknown as string,
      undefined as unknown as string,
      42 as unknown as string,
    ]);
    expect(out.winner).toBe("spicy");
    expect(out.ranked[0]?.count).toBe(1);
  });
});

describe("tallyTwistVotes — tie-break", () => {
  const opts = ["spicy", "vegetarian", "speedy"];

  it("tie → earlier-proposed wins", () => {
    const out = tallyTwistVotes(opts, ["spicy", "vegetarian"]);
    // Both have 1 vote; spicy proposed first → wins
    expect(out.winner).toBe("spicy");
  });

  it("triple tie → earliest-proposed wins", () => {
    const out = tallyTwistVotes(opts, ["spicy", "vegetarian", "speedy"]);
    expect(out.winner).toBe("spicy");
  });

  it("tie-break across re-ordered options", () => {
    const reordered = ["speedy", "spicy", "vegetarian"];
    const out = tallyTwistVotes(reordered, ["spicy", "speedy"]);
    expect(out.winner).toBe("speedy"); // proposed first now
  });
});

// ── resolveWeeklyTwist ────────────────────────────────────

describe("resolveWeeklyTwist", () => {
  it("returns the winner string", () => {
    expect(resolveWeeklyTwist(["spicy", "vegetarian"], ["spicy"])).toBe(
      "spicy",
    );
  });

  it("returns null when no votes cast", () => {
    expect(resolveWeeklyTwist(["spicy", "vegetarian"], [])).toBe(null);
  });
});

// ── detectTwistStreak ─────────────────────────────────────

describe("detectTwistStreak", () => {
  it("empty history → null current, streak 0", () => {
    expect(detectTwistStreak([])).toEqual({ current: null, streakWeeks: 0 });
  });

  it("most recent entry is null → no current", () => {
    const out = detectTwistStreak([
      { week: 18, twist: "spicy" },
      { week: 19, twist: null },
    ]);
    expect(out.current).toBe(null);
    expect(out.streakWeeks).toBe(0);
  });

  it("4-week consecutive same twist → streak=4", () => {
    const out = detectTwistStreak([
      { week: 16, twist: "spicy" },
      { week: 17, twist: "spicy" },
      { week: 18, twist: "spicy" },
      { week: 19, twist: "spicy" },
    ]);
    expect(out.current).toBe("spicy");
    expect(out.streakWeeks).toBe(4);
  });

  it("streak breaks at first non-matching twist", () => {
    const out = detectTwistStreak([
      { week: 16, twist: "vegetarian" },
      { week: 17, twist: "spicy" },
      { week: 18, twist: "spicy" },
      { week: 19, twist: "spicy" },
    ]);
    expect(out.current).toBe("spicy");
    expect(out.streakWeeks).toBe(3);
  });

  it("streak breaks at null gap", () => {
    const out = detectTwistStreak([
      { week: 17, twist: "spicy" },
      { week: 18, twist: null },
      { week: 19, twist: "spicy" },
    ]);
    expect(out.current).toBe("spicy");
    expect(out.streakWeeks).toBe(1);
  });

  it("case-insensitive streak detection", () => {
    const out = detectTwistStreak([
      { week: 17, twist: "Spicy" },
      { week: 18, twist: "SPICY" },
      { week: 19, twist: "spicy" },
    ]);
    expect(out.streakWeeks).toBe(3);
  });

  it("out-of-order history → sorted by week desc internally", () => {
    const out = detectTwistStreak([
      { week: 19, twist: "spicy" },
      { week: 17, twist: "spicy" },
      { week: 18, twist: "spicy" },
    ]);
    expect(out.streakWeeks).toBe(3);
  });
});

// ── formatTwistStreakIdentity ─────────────────────────────

describe("formatTwistStreakIdentity", () => {
  it("streak >= 2 → identity string", () => {
    const out = formatTwistStreakIdentity({
      current: "spicy",
      streakWeeks: 4,
    });
    expect(out).toBe("Spicy week 4 of 4.");
  });

  it("streak = 2 (minimum threshold) → identity fires", () => {
    expect(
      formatTwistStreakIdentity({ current: "vegetarian", streakWeeks: 2 }),
    ).toBe("Vegetarian week 2 of 2.");
  });

  it("streak = 1 → null (suppressed; no identity from single week)", () => {
    expect(
      formatTwistStreakIdentity({ current: "spicy", streakWeeks: 1 }),
    ).toBe(null);
  });

  it("streak = 0 / no current → null", () => {
    expect(formatTwistStreakIdentity({ current: null, streakWeeks: 0 })).toBe(
      null,
    );
  });

  it("capitalises the first letter of the twist", () => {
    expect(
      formatTwistStreakIdentity({
        current: "leftover-mode",
        streakWeeks: 3,
      }),
    ).toContain("Leftover-mode");
  });
});
