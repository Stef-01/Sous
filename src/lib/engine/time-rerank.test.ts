import { describe, expect, it } from "vitest";
import {
  TIME_RERANK_MAX_BOOST,
  TIME_RERANK_MAX_PENALTY,
  applyTimeOfDayRerank,
  computeAdjustment,
  inferSeason,
  inferTimeOfDay,
} from "./time-rerank";
import type { ScoredCandidate, SideDishCandidate } from "./types";

function fixtureSide(over: Partial<SideDishCandidate> = {}): SideDishCandidate {
  return {
    id: "s",
    slug: "s",
    name: "S",
    cuisineFamily: "italian",
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    skillLevel: "easy",
    flavorProfile: [],
    temperature: "hot",
    proteinGrams: 5,
    fiberGrams: 2,
    caloriesPerServing: 200,
    bestPairedWith: [],
    tags: [],
    pairingReason: null,
    nutritionCategory: null,
    dietaryFlags: [],
    ...over,
  };
}

function scoredFixture(
  over: Partial<ScoredCandidate> = {},
  sideOver: Partial<SideDishCandidate> = {},
): ScoredCandidate {
  return {
    sideDish: fixtureSide(sideOver),
    scores: {
      cuisineFit: 0.5,
      flavorContrast: 0.5,
      nutritionBalance: 0.5,
      prepBurden: 0.5,
      temperature: 0.5,
      preference: 0.5,
    },
    totalScore: 0.5,
    explanation: "",
    ...over,
  };
}

// ── inferSeason ────────────────────────────────────────────

describe("inferSeason — northern", () => {
  it("Dec/Jan/Feb → winter", () => {
    expect(inferSeason(new Date("2026-01-15T12:00:00Z"), "northern")).toBe(
      "winter",
    );
    expect(inferSeason(new Date("2026-02-15T12:00:00Z"), "northern")).toBe(
      "winter",
    );
    expect(inferSeason(new Date("2026-12-15T12:00:00Z"), "northern")).toBe(
      "winter",
    );
  });

  it("Mar/Apr/May → spring", () => {
    expect(inferSeason(new Date("2026-03-15T12:00:00Z"), "northern")).toBe(
      "spring",
    );
    expect(inferSeason(new Date("2026-05-31T12:00:00Z"), "northern")).toBe(
      "spring",
    );
  });

  it("Jun/Jul/Aug → summer", () => {
    expect(inferSeason(new Date("2026-06-15T12:00:00Z"), "northern")).toBe(
      "summer",
    );
    expect(inferSeason(new Date("2026-08-15T12:00:00Z"), "northern")).toBe(
      "summer",
    );
  });

  it("Sep/Oct/Nov → autumn", () => {
    expect(inferSeason(new Date("2026-09-15T12:00:00Z"), "northern")).toBe(
      "autumn",
    );
    expect(inferSeason(new Date("2026-11-15T12:00:00Z"), "northern")).toBe(
      "autumn",
    );
  });
});

describe("inferSeason — southern", () => {
  it("Dec/Jan/Feb → summer (flipped)", () => {
    expect(inferSeason(new Date("2026-01-15T12:00:00Z"), "southern")).toBe(
      "summer",
    );
  });

  it("Jun/Jul/Aug → winter (flipped)", () => {
    expect(inferSeason(new Date("2026-07-15T12:00:00Z"), "southern")).toBe(
      "winter",
    );
  });

  it("Mar/Apr/May → autumn (flipped)", () => {
    expect(inferSeason(new Date("2026-04-15T12:00:00Z"), "southern")).toBe(
      "autumn",
    );
  });

  it("Sep/Oct/Nov → spring (flipped)", () => {
    expect(inferSeason(new Date("2026-10-15T12:00:00Z"), "southern")).toBe(
      "spring",
    );
  });
});

// ── inferTimeOfDay ────────────────────────────────────────

describe("inferTimeOfDay", () => {
  it("0-4 → late-night", () => {
    expect(inferTimeOfDay(new Date(2026, 0, 1, 0))).toBe("late-night");
    expect(inferTimeOfDay(new Date(2026, 0, 1, 4))).toBe("late-night");
  });

  it("5-10 → morning", () => {
    expect(inferTimeOfDay(new Date(2026, 0, 1, 5))).toBe("morning");
    expect(inferTimeOfDay(new Date(2026, 0, 1, 10))).toBe("morning");
  });

  it("11-13 → midday", () => {
    expect(inferTimeOfDay(new Date(2026, 0, 1, 11))).toBe("midday");
    expect(inferTimeOfDay(new Date(2026, 0, 1, 13))).toBe("midday");
  });

  it("14-16 → afternoon", () => {
    expect(inferTimeOfDay(new Date(2026, 0, 1, 14))).toBe("afternoon");
    expect(inferTimeOfDay(new Date(2026, 0, 1, 16))).toBe("afternoon");
  });

  it("17-21 → evening", () => {
    expect(inferTimeOfDay(new Date(2026, 0, 1, 17))).toBe("evening");
    expect(inferTimeOfDay(new Date(2026, 0, 1, 21))).toBe("evening");
  });

  it("22-23 → late-night", () => {
    expect(inferTimeOfDay(new Date(2026, 0, 1, 22))).toBe("late-night");
    expect(inferTimeOfDay(new Date(2026, 0, 1, 23))).toBe("late-night");
  });
});

// ── computeAdjustment ─────────────────────────────────────

describe("computeAdjustment — winter evening", () => {
  it("hot side → +0.05", () => {
    expect(
      computeAdjustment({ temperature: "hot", tags: [] }, "winter", "evening"),
    ).toBe(0.05);
  });

  it("cold side → -0.03 penalty", () => {
    expect(
      computeAdjustment({ temperature: "cold", tags: [] }, "winter", "evening"),
    ).toBe(-0.03);
  });

  it("room-temp side → 0 (no nudge)", () => {
    expect(
      computeAdjustment(
        { temperature: "room-temp", tags: [] },
        "winter",
        "evening",
      ),
    ).toBe(0);
  });
});

describe("computeAdjustment — summer afternoon", () => {
  it("cold side → +0.05", () => {
    expect(
      computeAdjustment(
        { temperature: "cold", tags: [] },
        "summer",
        "afternoon",
      ),
    ).toBe(0.05);
  });

  it("hot side → -0.03 penalty", () => {
    expect(
      computeAdjustment(
        { temperature: "hot", tags: [] },
        "summer",
        "afternoon",
      ),
    ).toBe(-0.03);
  });

  it("midday treated like afternoon", () => {
    expect(
      computeAdjustment({ temperature: "cold", tags: [] }, "summer", "midday"),
    ).toBe(0.05);
  });
});

describe("computeAdjustment — winter morning", () => {
  it("cold side → -0.02 penalty", () => {
    expect(
      computeAdjustment({ temperature: "cold", tags: [] }, "winter", "morning"),
    ).toBe(-0.02);
  });

  it("hot side → 0 (morning isn't dinner-prime)", () => {
    expect(
      computeAdjustment({ temperature: "hot", tags: [] }, "winter", "morning"),
    ).toBe(0);
  });
});

describe("computeAdjustment — spring/autumn", () => {
  it("transitional seasons → no temperature nudge", () => {
    expect(
      computeAdjustment({ temperature: "hot", tags: [] }, "spring", "evening"),
    ).toBe(0);
    expect(
      computeAdjustment(
        { temperature: "cold", tags: [] },
        "autumn",
        "afternoon",
      ),
    ).toBe(0);
  });
});

describe("computeAdjustment — tag hints", () => {
  it("season tag matches → +0.02 bonus", () => {
    expect(
      computeAdjustment(
        { temperature: "room-temp", tags: ["winter-warming"] },
        "winter",
        "midday",
      ),
    ).toBe(0.02);
  });

  it("season tag stacks on top of temperature nudge", () => {
    // winter evening + hot (+0.05) + winter tag (+0.02) = +0.07 (the cap)
    expect(
      computeAdjustment(
        { temperature: "hot", tags: ["winter-warming"] },
        "winter",
        "evening",
      ),
    ).toBe(0.07);
    expect(0.07).toBe(TIME_RERANK_MAX_BOOST);
  });

  it("season tag is case-insensitive", () => {
    expect(
      computeAdjustment(
        { temperature: "room-temp", tags: ["Summer-Fresh"] },
        "summer",
        "midday",
      ),
    ).toBe(0.02 + 0); // tag bonus only — room-temp gets no temp nudge
  });

  it("non-matching season tag → no bonus", () => {
    expect(
      computeAdjustment(
        { temperature: "room-temp", tags: ["summer-fresh"] },
        "winter",
        "evening",
      ),
    ).toBe(0);
  });

  it("multiple matching tags → still single +0.02 bonus", () => {
    expect(
      computeAdjustment(
        {
          temperature: "room-temp",
          tags: ["winter", "winter-warming", "comfort"],
        },
        "winter",
        "midday",
      ),
    ).toBe(0.02);
  });
});

describe("computeAdjustment — clamp", () => {
  it("respects MAX_BOOST cap (no compounding past +0.07)", () => {
    // Hypothetical stacked positive nudges still cap at +0.07
    const adj = computeAdjustment(
      { temperature: "hot", tags: ["winter-warming"] },
      "winter",
      "evening",
    );
    expect(adj).toBeLessThanOrEqual(TIME_RERANK_MAX_BOOST);
  });

  it("respects MAX_PENALTY floor", () => {
    const adj = computeAdjustment(
      { temperature: "cold", tags: [] },
      "winter",
      "evening",
    );
    expect(adj).toBeGreaterThanOrEqual(TIME_RERANK_MAX_PENALTY);
  });
});

// ── applyTimeOfDayRerank ──────────────────────────────────

describe("applyTimeOfDayRerank — pure / immutable", () => {
  it("returns a new array — does not mutate input", () => {
    const ranked: ScoredCandidate[] = [
      scoredFixture({ totalScore: 0.6 }, { temperature: "hot" }),
    ];
    const out = applyTimeOfDayRerank(ranked, {
      now: new Date("2026-01-15T19:00:00"), // winter evening (local)
    });
    expect(out).not.toBe(ranked);
    expect(ranked[0]?.totalScore).toBe(0.6);
  });

  it("empty input → empty output", () => {
    expect(
      applyTimeOfDayRerank([], { now: new Date("2026-01-15T19:00:00") }),
    ).toEqual([]);
  });

  it("preserves per-dim scores (only totalScore changes)", () => {
    const original = scoredFixture({ totalScore: 0.6 }, { temperature: "hot" });
    const out = applyTimeOfDayRerank([original], {
      now: new Date("2026-01-15T19:00:00"),
    });
    expect(out[0]?.scores).toEqual(original.scores);
  });
});

describe("applyTimeOfDayRerank — reordering", () => {
  it("winter evening: hot side overtakes barely-higher cold side", () => {
    const cold = scoredFixture({
      sideDish: fixtureSide({ id: "cold", slug: "cold", temperature: "cold" }),
      totalScore: 0.62,
    });
    const hot = scoredFixture({
      sideDish: fixtureSide({ id: "hot", slug: "hot", temperature: "hot" }),
      totalScore: 0.6,
    });
    // Pre-rerank: cold (0.62) > hot (0.60)
    // Winter evening: cold → 0.62 - 0.03 = 0.59; hot → 0.60 + 0.05 = 0.65
    // Post-rerank: hot first, cold second.
    const out = applyTimeOfDayRerank([cold, hot], {
      now: new Date("2026-01-15T19:00:00"),
    });
    expect(out[0]?.sideDish.id).toBe("hot");
    expect(out[1]?.sideDish.id).toBe("cold");
  });

  it("summer afternoon: cold side overtakes barely-higher hot side", () => {
    const hot = scoredFixture({
      sideDish: fixtureSide({ id: "hot", slug: "hot", temperature: "hot" }),
      totalScore: 0.62,
    });
    const cold = scoredFixture({
      sideDish: fixtureSide({ id: "cold", slug: "cold", temperature: "cold" }),
      totalScore: 0.6,
    });
    const out = applyTimeOfDayRerank([hot, cold], {
      now: new Date("2026-07-15T15:00:00"),
    });
    expect(out[0]?.sideDish.id).toBe("cold");
  });

  it("rerank can't promote a 0.40 base above a 0.85 base (cap is 0.07)", () => {
    const high = scoredFixture({
      sideDish: fixtureSide({ id: "high", slug: "high", temperature: "cold" }),
      totalScore: 0.85,
    });
    const low = scoredFixture({
      sideDish: fixtureSide({
        id: "low",
        slug: "low",
        temperature: "hot",
        tags: ["winter-warming"],
      }),
      totalScore: 0.4,
    });
    // Winter evening: high (cold) → 0.85 - 0.03 = 0.82; low (hot+tag) → 0.40 + 0.07 = 0.47
    // High still wins.
    const out = applyTimeOfDayRerank([high, low], {
      now: new Date("2026-01-15T19:00:00"),
    });
    expect(out[0]?.sideDish.id).toBe("high");
  });

  it("spring evening: no temperature nudge → order unchanged", () => {
    const a = scoredFixture({
      sideDish: fixtureSide({ id: "a", slug: "a", temperature: "hot" }),
      totalScore: 0.62,
    });
    const b = scoredFixture({
      sideDish: fixtureSide({ id: "b", slug: "b", temperature: "cold" }),
      totalScore: 0.6,
    });
    const out = applyTimeOfDayRerank([a, b], {
      now: new Date("2026-04-15T19:00:00"),
    });
    expect(out[0]?.sideDish.id).toBe("a");
    expect(out[1]?.sideDish.id).toBe("b");
  });
});

describe("applyTimeOfDayRerank — hemisphere", () => {
  it("southern hemisphere flips the season → opposite nudges", () => {
    const hot = scoredFixture({
      sideDish: fixtureSide({ id: "hot", slug: "hot", temperature: "hot" }),
      totalScore: 0.6,
    });
    // Jan in southern hemisphere = summer
    const out = applyTimeOfDayRerank([hot], {
      now: new Date("2026-01-15T15:00:00"),
      hemisphere: "southern",
    });
    // Summer afternoon + hot side → -0.03 penalty
    expect(out[0]?.totalScore).toBeCloseTo(0.57, 5);
  });

  it("hemisphere defaults to northern", () => {
    const hot = scoredFixture({
      sideDish: fixtureSide({ id: "hot", slug: "hot", temperature: "hot" }),
      totalScore: 0.6,
    });
    const out = applyTimeOfDayRerank([hot], {
      now: new Date("2026-01-15T19:00:00"),
    });
    // Northern winter evening + hot → +0.05 boost
    expect(out[0]?.totalScore).toBeCloseTo(0.65, 5);
  });
});

describe("applyTimeOfDayRerank — clamp to [0, 1]", () => {
  it("score above 1 clamps down", () => {
    const c = scoredFixture({
      sideDish: fixtureSide({
        id: "c",
        slug: "c",
        temperature: "hot",
        tags: ["winter-warming"],
      }),
      totalScore: 0.97,
    });
    const out = applyTimeOfDayRerank([c], {
      now: new Date("2026-01-15T19:00:00"),
    });
    expect(out[0]?.totalScore).toBeLessThanOrEqual(1);
  });

  it("score below 0 clamps up", () => {
    const c = scoredFixture({
      sideDish: fixtureSide({ id: "c", slug: "c", temperature: "cold" }),
      totalScore: 0.01,
    });
    const out = applyTimeOfDayRerank([c], {
      now: new Date("2026-01-15T19:00:00"),
    });
    expect(out[0]?.totalScore).toBeGreaterThanOrEqual(0);
  });
});

describe("applyTimeOfDayRerank — determinism", () => {
  it("same input + same context → bit-identical output", () => {
    const ranked: ScoredCandidate[] = [
      scoredFixture(
        { totalScore: 0.6 },
        { id: "a", slug: "a", temperature: "hot" },
      ),
      scoredFixture(
        { totalScore: 0.5 },
        { id: "b", slug: "b", temperature: "cold" },
      ),
    ];
    const ctx = { now: new Date("2026-01-15T19:00:00") };
    const out1 = applyTimeOfDayRerank(ranked, ctx);
    const out2 = applyTimeOfDayRerank(ranked, ctx);
    expect(out1.map((c) => c.totalScore)).toEqual(
      out2.map((c) => c.totalScore),
    );
    expect(out1.map((c) => c.sideDish.id)).toEqual(
      out2.map((c) => c.sideDish.id),
    );
  });
});
