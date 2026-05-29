import { describe, expect, it } from "vitest";
import {
  DEFAULT_DAILY_CAP,
  computeConsistencyMultiplier,
  computeCookScore,
  computePodWeeklyScore,
  dayKey,
  enforceDailyCap,
  normaliseStarRating,
  shouldRevealGallery,
  weekKey,
  type CookScoreInput,
  type PodSubmission,
} from "./pod-score";

// ── computeCookScore ────────────────────────────────────────

function cookInput(over: Partial<CookScoreInput> = {}): CookScoreInput {
  return {
    stepCompletion: 0,
    selfRating: 0,
    aesthetic: 0,
    captionLength: 0,
    hasStepImage: false,
    ...over,
  };
}

describe("computeCookScore — boundary cases", () => {
  it("all zeros → 0", () => {
    expect(computeCookScore(cookInput())).toBe(0);
  });

  it("all ones, no bonuses → 100", () => {
    expect(
      computeCookScore(
        cookInput({ stepCompletion: 1, selfRating: 1, aesthetic: 1 }),
      ),
    ).toBe(100);
  });

  it("V1 baseline (0.5 placeholder aesthetic) → 50", () => {
    expect(
      computeCookScore(
        cookInput({ stepCompletion: 0.5, selfRating: 0.5, aesthetic: 0.5 }),
      ),
    ).toBe(50);
  });

  it("step weight is 30 of 100", () => {
    expect(computeCookScore(cookInput({ stepCompletion: 1 }))).toBe(30);
  });

  it("self-rating weight is 30 of 100", () => {
    expect(computeCookScore(cookInput({ selfRating: 1 }))).toBe(30);
  });

  it("aesthetic weight is 40 of 100", () => {
    expect(computeCookScore(cookInput({ aesthetic: 1 }))).toBe(40);
  });
});

describe("computeCookScore — bonuses", () => {
  it("caption bonus = +5 at any non-empty length", () => {
    expect(computeCookScore(cookInput({ captionLength: 1 }))).toBe(5);
    expect(computeCookScore(cookInput({ captionLength: 1000 }))).toBe(5);
  });

  it("step-image bonus = +5", () => {
    expect(computeCookScore(cookInput({ hasStepImage: true }))).toBe(5);
  });

  it("both bonuses = +10", () => {
    expect(
      computeCookScore(cookInput({ captionLength: 5, hasStepImage: true })),
    ).toBe(10);
  });

  it("bonuses cap at 100 with full base", () => {
    expect(
      computeCookScore(
        cookInput({
          stepCompletion: 1,
          selfRating: 1,
          aesthetic: 1,
          captionLength: 50,
          hasStepImage: true,
        }),
      ),
    ).toBe(100);
  });

  it("zero-length caption gets no bonus", () => {
    expect(computeCookScore(cookInput({ captionLength: 0 }))).toBe(0);
  });
});

describe("computeCookScore — clamping", () => {
  it("negative inputs clamp to 0", () => {
    expect(
      computeCookScore(
        cookInput({ stepCompletion: -1, selfRating: -1, aesthetic: -1 }),
      ),
    ).toBe(0);
  });

  it(">1 inputs clamp to 1", () => {
    expect(
      computeCookScore(
        cookInput({ stepCompletion: 5, selfRating: 5, aesthetic: 5 }),
      ),
    ).toBe(100);
  });

  it("NaN inputs collapse to 0", () => {
    expect(
      computeCookScore(
        cookInput({
          stepCompletion: Number.NaN,
          selfRating: Number.NaN,
          aesthetic: Number.NaN,
        }),
      ),
    ).toBe(0);
  });
});

describe("normaliseStarRating", () => {
  it("5 stars → 1.0", () => {
    expect(normaliseStarRating(5)).toBe(1);
  });

  it("3 stars → 0.6", () => {
    expect(normaliseStarRating(3)).toBeCloseTo(0.6);
  });

  it("1 star → 0.2", () => {
    expect(normaliseStarRating(1)).toBeCloseTo(0.2);
  });

  it("clamps below 1 to 1 (0.2)", () => {
    expect(normaliseStarRating(0)).toBeCloseTo(0.2);
    expect(normaliseStarRating(-3)).toBeCloseTo(0.2);
  });

  it("clamps above 5 to 5 (1.0)", () => {
    expect(normaliseStarRating(99)).toBe(1);
  });

  it("NaN → 0", () => {
    expect(normaliseStarRating(Number.NaN)).toBe(0);
  });
});

// ── enforceDailyCap ─────────────────────────────────────────

function sub(
  memberId: string,
  dayKeyStr: string,
  score: number = 50,
): PodSubmission {
  return { memberId, dayKey: dayKeyStr, score };
}

describe("enforceDailyCap", () => {
  it("empty list → []", () => {
    expect(enforceDailyCap([])).toEqual([]);
  });

  it("below cap → all kept", () => {
    const subs = [sub("alex", "2026-05-02"), sub("alex", "2026-05-03")];
    expect(enforceDailyCap(subs)).toHaveLength(2);
  });

  it("exactly at cap → all kept", () => {
    const subs = [sub("alex", "2026-05-02"), sub("alex", "2026-05-02")];
    expect(enforceDailyCap(subs)).toHaveLength(2);
  });

  it("over cap → first N kept (input order)", () => {
    const a = sub("alex", "2026-05-02", 1);
    const b = sub("alex", "2026-05-02", 2);
    const c = sub("alex", "2026-05-02", 3);
    expect(enforceDailyCap([a, b, c])).toEqual([a, b]);
  });

  it("different members not affected by each other", () => {
    const subs = [
      sub("alex", "2026-05-02"),
      sub("alex", "2026-05-02"),
      sub("bri", "2026-05-02"),
      sub("bri", "2026-05-02"),
      sub("bri", "2026-05-02"),
    ];
    expect(enforceDailyCap(subs)).toHaveLength(4);
  });

  it("different days not affected by each other", () => {
    const subs = [
      sub("alex", "2026-05-02"),
      sub("alex", "2026-05-02"),
      sub("alex", "2026-05-03"),
      sub("alex", "2026-05-03"),
    ];
    expect(enforceDailyCap(subs)).toHaveLength(4);
  });

  it("DEFAULT_DAILY_CAP === 2", () => {
    expect(DEFAULT_DAILY_CAP).toBe(2);
  });

  it("custom maxPerDay respected", () => {
    const subs = [
      sub("alex", "2026-05-02"),
      sub("alex", "2026-05-02"),
      sub("alex", "2026-05-02"),
    ];
    expect(enforceDailyCap(subs, 1)).toHaveLength(1);
    expect(enforceDailyCap(subs, 3)).toHaveLength(3);
  });

  it("maxPerDay 0 drops everything", () => {
    expect(enforceDailyCap([sub("alex", "2026-05-02")], 0)).toEqual([]);
  });
});

// ── computeConsistencyMultiplier ───────────────────────────

describe("computeConsistencyMultiplier — short-circuits", () => {
  it("empty list → 1.0", () => {
    expect(computeConsistencyMultiplier([])).toBe(1.0);
  });

  it("single-member → 1.0", () => {
    expect(computeConsistencyMultiplier([100])).toBe(1.0);
  });

  it("all zeros → 1.0 (no penalty when there's nothing to compare)", () => {
    expect(computeConsistencyMultiplier([0, 0, 0])).toBe(1.0);
  });
});

describe("computeConsistencyMultiplier — invariants", () => {
  it("perfect even distribution → 1.0", () => {
    expect(computeConsistencyMultiplier([50, 50, 50, 50])).toBe(1.0);
  });

  it("never below 0.5 floor", () => {
    // One carrier, 5 zeros — extreme uneven.
    const result = computeConsistencyMultiplier([100, 0, 0, 0, 0, 0]);
    expect(result).toBeGreaterThanOrEqual(0.5);
  });

  it("never above 1.0", () => {
    expect(computeConsistencyMultiplier([100, 100, 100])).toBeLessThanOrEqual(
      1.0,
    );
  });

  it("more even → higher multiplier", () => {
    const moreEven = computeConsistencyMultiplier([80, 70, 60, 50]);
    const lessEven = computeConsistencyMultiplier([100, 80, 30, 50]);
    expect(moreEven).toBeGreaterThan(lessEven);
  });

  it("monotonic — wider variance → lower multiplier", () => {
    const a = computeConsistencyMultiplier([50, 50, 50]);
    const b = computeConsistencyMultiplier([60, 50, 40]);
    const c = computeConsistencyMultiplier([90, 50, 10]);
    expect(a).toBeGreaterThanOrEqual(b);
    expect(b).toBeGreaterThanOrEqual(c);
  });
});

// ── computePodWeeklyScore ──────────────────────────────────

describe("computePodWeeklyScore — basic shapes", () => {
  it("empty pod → 0/1/0/{}", () => {
    expect(
      computePodWeeklyScore({ submissions: [], activeMemberIds: [] }),
    ).toEqual({ raw: 0, multiplier: 1, total: 0, perMember: {} });
  });

  it("single member, single cook → score, 1.0, score", () => {
    const result = computePodWeeklyScore({
      submissions: [sub("alex", "2026-05-02", 60)],
      activeMemberIds: ["alex"],
    });
    expect(result.raw).toBe(60);
    expect(result.multiplier).toBe(1);
    expect(result.total).toBe(60);
    expect(result.perMember).toEqual({ alex: 60 });
  });

  it("zero active members → 0/1/0", () => {
    const result = computePodWeeklyScore({
      submissions: [sub("alex", "2026-05-02", 100)],
      activeMemberIds: [],
    });
    expect(result.raw).toBe(0);
    expect(result.multiplier).toBe(1);
    expect(result.total).toBe(0);
  });
});

describe("computePodWeeklyScore — daily cap inside", () => {
  it("3rd cook by the same member on the same day doesn't add", () => {
    const result = computePodWeeklyScore({
      submissions: [
        sub("alex", "2026-05-02", 50),
        sub("alex", "2026-05-02", 50),
        sub("alex", "2026-05-02", 50),
      ],
      activeMemberIds: ["alex"],
    });
    expect(result.raw).toBe(100);
    expect(result.perMember.alex).toBe(100);
  });

  it("cooks across two days both count up to the cap", () => {
    const result = computePodWeeklyScore({
      submissions: [
        sub("alex", "2026-05-02", 50),
        sub("alex", "2026-05-02", 50),
        sub("alex", "2026-05-02", 99), // dropped
        sub("alex", "2026-05-03", 40),
        sub("alex", "2026-05-03", 30),
      ],
      activeMemberIds: ["alex"],
    });
    expect(result.raw).toBe(170);
  });
});

describe("computePodWeeklyScore — multiplier in action", () => {
  it("two members with equal totals → 1.0 multiplier", () => {
    const result = computePodWeeklyScore({
      submissions: [
        sub("alex", "2026-05-02", 60),
        sub("bri", "2026-05-02", 60),
      ],
      activeMemberIds: ["alex", "bri"],
    });
    expect(result.multiplier).toBe(1);
    expect(result.total).toBe(120);
  });

  it("one carrier among 4 active → multiplier hits the 0.5 floor", () => {
    const result = computePodWeeklyScore({
      submissions: [sub("alex", "2026-05-02", 100)],
      activeMemberIds: ["alex", "bri", "casey", "drew"],
    });
    expect(result.multiplier).toBe(0.5);
    expect(result.total).toBe(50);
  });

  it("submissions for non-active members are ignored", () => {
    const result = computePodWeeklyScore({
      submissions: [
        sub("alex", "2026-05-02", 60),
        sub("ghost", "2026-05-02", 9999),
      ],
      activeMemberIds: ["alex"],
    });
    expect(result.raw).toBe(60);
    expect(result.perMember).toEqual({ alex: 60 });
    expect(result.perMember.ghost).toBeUndefined();
  });

  it("perMember has zero entries for active members with no cooks", () => {
    const result = computePodWeeklyScore({
      submissions: [sub("alex", "2026-05-02", 60)],
      activeMemberIds: ["alex", "bri"],
    });
    expect(result.perMember).toEqual({ alex: 60, bri: 0 });
  });
});

// ── weekKey + dayKey ──────────────────────────────────────

describe("weekKey", () => {
  it("returns ISO 8601 week format", () => {
    expect(weekKey(new Date("2026-05-02T12:00:00Z"))).toMatch(/^\d{4}-W\d{2}$/);
  });

  it("Saturday and prior Monday return the same week", () => {
    const monday = weekKey(new Date("2026-04-27T00:00:00Z"));
    const saturday = weekKey(new Date("2026-05-02T12:00:00Z"));
    expect(monday).toBe(saturday);
  });

  it("Sunday is part of the prior ISO week", () => {
    // 2026-05-03 is a Sunday — same ISO week as 2026-04-27 Monday.
    expect(weekKey(new Date("2026-05-03T00:00:00Z"))).toBe(
      weekKey(new Date("2026-04-27T00:00:00Z")),
    );
  });

  it("year boundary: Jan 1 may belong to last year's last week", () => {
    // Sanity check that the format works for year boundaries
    // without enforcing a specific spec (Jan 1 2026 falls on Thu
    // → ISO 2026-W01).
    expect(weekKey(new Date("2026-01-01T12:00:00Z"))).toBe("2026-W01");
  });
});

describe("dayKey", () => {
  it("returns YYYY-MM-DD", () => {
    expect(dayKey(new Date(2026, 4, 2, 14))).toBe("2026-05-02");
  });

  it("pads single-digit month and day", () => {
    expect(dayKey(new Date(2026, 0, 5, 0))).toBe("2026-01-05");
  });
});

// ── shouldRevealGallery ────────────────────────────────────

describe("shouldRevealGallery", () => {
  it("returns false during the week", () => {
    const monday = new Date(2026, 4, 4, 0); // Mon 2026-05-04
    const wednesday = new Date(2026, 4, 6, 12); // mid-week
    expect(
      shouldRevealGallery({
        weekStartedAt: monday,
        now: wednesday,
      }),
    ).toBe(false);
  });

  it("returns true at Sunday 9pm pod-local (default)", () => {
    const monday = new Date(2026, 4, 4, 0);
    const sundayNine = new Date(2026, 4, 10, 21);
    expect(
      shouldRevealGallery({
        weekStartedAt: monday,
        now: sundayNine,
      }),
    ).toBe(true);
  });

  it("returns false at Sunday 8:59pm (one minute early)", () => {
    const monday = new Date(2026, 4, 4, 0);
    const justBefore = new Date(2026, 4, 10, 20, 59);
    expect(
      shouldRevealGallery({
        weekStartedAt: monday,
        now: justBefore,
      }),
    ).toBe(false);
  });

  it("respects custom revealAtHour", () => {
    const monday = new Date(2026, 4, 4, 0);
    const sundaySix = new Date(2026, 4, 10, 18);
    expect(
      shouldRevealGallery({
        weekStartedAt: monday,
        revealAtHour: 18,
        now: sundaySix,
      }),
    ).toBe(true);
  });

  it("returns true any time after the reveal hour", () => {
    const monday = new Date(2026, 4, 4, 0);
    const muchLater = new Date(2026, 4, 11, 8); // Mon 8am — past reveal
    expect(
      shouldRevealGallery({
        weekStartedAt: monday,
        now: muchLater,
      }),
    ).toBe(true);
  });
});
