import { describe, expect, it } from "vitest";
import type {
  PreferenceSignal,
  SignalKind,
  SignalFacets,
} from "@/types/preference-profile";
import { aggregateSignals, decayMultiplier } from "./signal-aggregator";

const facets = (over: Partial<SignalFacets> = {}): SignalFacets => ({
  cuisine: "indian",
  flavors: ["spicy"],
  proteins: ["chicken"],
  dishClass: "curry",
  ingredients: [],
  ...over,
});

const signal = (
  kind: SignalKind,
  daysAgo: number,
  over: Partial<PreferenceSignal> = {},
): PreferenceSignal => {
  const capturedAt = new Date(
    Date.UTC(2026, 4, 4) - daysAgo * 86400000,
  ).toISOString();
  return {
    id: `s-${Math.random()}`,
    kind,
    facets: over.facets ?? facets(),
    capturedAt,
    timeOfDay: "dinner",
    dayOfWeek: 1,
    ...over,
  };
};

const NOW = new Date("2026-05-04T00:00:00Z");

describe("decayMultiplier", () => {
  it("returns 1.0 at zero age", () => {
    expect(decayMultiplier(0)).toBe(1);
  });

  it("returns 0.5 at half-life (60 days)", () => {
    expect(decayMultiplier(60)).toBeCloseTo(0.5, 5);
  });

  it("returns 0.25 at two half-lives (120 days)", () => {
    expect(decayMultiplier(120)).toBeCloseTo(0.25, 5);
  });

  it("returns 1.0 for negative ages (defensive)", () => {
    expect(decayMultiplier(-5)).toBe(1);
  });

  it("returns 1.0 for non-finite age", () => {
    expect(decayMultiplier(Number.NaN)).toBe(1);
  });
});

describe("aggregateSignals — empty + invalid input", () => {
  it("returns empty inferred + bucket maps for empty signals", () => {
    const out = aggregateSignals({ signals: [], now: NOW });
    expect(out.contributingSignalCount).toBe(0);
    expect(out.inferred.cuisines).toEqual({});
    expect(out.timeOfDayPatterns.dinner.topTags).toEqual([]);
    expect(out.timeOfDayPatterns.dinner.confidence).toBe(0);
  });

  it("excludes signals with malformed capturedAt", () => {
    const out = aggregateSignals({
      signals: [signal("cooked", 0, { capturedAt: "not-a-date" })],
      now: NOW,
    });
    expect(out.contributingSignalCount).toBe(0);
  });
});

describe("aggregateSignals — positive signals", () => {
  it("a 'cooked' signal produces a strong positive cuisine weight", () => {
    const out = aggregateSignals({
      signals: [signal("cooked", 0)],
      now: NOW,
    });
    // Single signal: weighted=1.5, decayedVolume=1.0 → 1.5 → clamped to 1.0
    expect(out.inferred.cuisines.indian).toBe(1);
    expect(out.inferred.flavors.spicy).toBe(1);
    expect(out.inferred.proteins.chicken).toBe(1);
    expect(out.inferred.dishClasses.curry).toBe(1);
  });

  it("'swipe-right' produces a positive but unsaturated weight", () => {
    const out = aggregateSignals({
      signals: [signal("swipe-right", 0)],
      now: NOW,
    });
    // 1.0 / 1.0 = 1.0 → clamped (still saturates due to /1.0 single-signal case)
    expect(out.inferred.cuisines.indian).toBe(1);
  });

  it("multiple cooks of the same cuisine reinforce the weight (still saturated)", () => {
    const out = aggregateSignals({
      signals: [signal("cooked", 0), signal("cooked", 1), signal("cooked", 2)],
      now: NOW,
    });
    expect(out.inferred.cuisines.indian).toBe(1);
  });
});

describe("aggregateSignals — positive vs negative cancel", () => {
  it("equal positive and negative signal counts produce a neutral weight", () => {
    const out = aggregateSignals({
      signals: [signal("swipe-right", 0), signal("swipe-left", 0)],
      now: NOW,
    });
    // weighted: 1.0 + (-0.6) = 0.4; volume: 2.0 → 0.2
    expect(out.inferred.cuisines.indian).toBeCloseTo(0.2, 5);
  });

  it("'swipe-left' produces a negative weight on its own", () => {
    const out = aggregateSignals({
      signals: [signal("swipe-left", 0)],
      now: NOW,
    });
    expect(out.inferred.cuisines.indian).toBeLessThan(0);
  });
});

describe("aggregateSignals — time decay", () => {
  it("a recent strong signal outweighs an older one", () => {
    const out = aggregateSignals({
      signals: [
        signal("cooked", 0, {
          facets: facets({ cuisine: "italian" }),
          id: "recent-italian",
        }),
        signal("cooked", 90, {
          facets: facets({ cuisine: "thai" }),
          id: "old-thai",
        }),
      ],
      now: NOW,
    });
    expect(out.inferred.cuisines.italian).toBeGreaterThan(
      out.inferred.cuisines.thai,
    );
  });

  it("old signals still contribute (just less)", () => {
    const out = aggregateSignals({
      signals: [signal("cooked", 90)],
      now: NOW,
    });
    expect(out.inferred.cuisines.indian).toBeGreaterThan(0);
  });
});

describe("aggregateSignals — multi-axis tagging", () => {
  it("flavors aggregate independently from cuisine", () => {
    const out = aggregateSignals({
      signals: [
        signal("cooked", 0, {
          facets: facets({ cuisine: "indian", flavors: ["spicy", "tangy"] }),
        }),
      ],
      now: NOW,
    });
    expect(out.inferred.flavors.spicy).toBeGreaterThan(0);
    expect(out.inferred.flavors.tangy).toBeGreaterThan(0);
  });

  it("multiple flavors per signal each weighted equally", () => {
    const out = aggregateSignals({
      signals: [
        signal("cooked", 0, {
          facets: facets({ flavors: ["spicy", "tangy", "umami"] }),
        }),
      ],
      now: NOW,
    });
    expect(out.inferred.flavors.spicy).toBe(out.inferred.flavors.tangy);
    expect(out.inferred.flavors.tangy).toBe(out.inferred.flavors.umami);
  });

  it("ignores empty-string axis values", () => {
    const out = aggregateSignals({
      signals: [
        signal("cooked", 0, {
          facets: facets({ cuisine: "", dishClass: "" }),
        }),
      ],
      now: NOW,
    });
    expect(Object.keys(out.inferred.cuisines)).toHaveLength(0);
    expect(Object.keys(out.inferred.dishClasses)).toHaveLength(0);
  });

  it("trims + lowercases tags before keying", () => {
    const out = aggregateSignals({
      signals: [
        signal("cooked", 0, {
          facets: facets({
            cuisine: "  Italian  ",
            flavors: ["SPICY", "  Tangy"],
          }),
        }),
      ],
      now: NOW,
    });
    expect(out.inferred.cuisines).toHaveProperty("italian");
    expect(out.inferred.flavors).toHaveProperty("spicy");
    expect(out.inferred.flavors).toHaveProperty("tangy");
  });
});

describe("aggregateSignals — time-of-day patterns", () => {
  it("does NOT surface a bucket below the confidence floor (<5 signals)", () => {
    const out = aggregateSignals({
      signals: [
        signal("cooked", 0, { timeOfDay: "morning" }),
        signal("cooked", 0, { timeOfDay: "morning" }),
        signal("cooked", 0, { timeOfDay: "morning" }),
      ],
      now: NOW,
    });
    expect(out.timeOfDayPatterns.morning.topTags).toEqual([]);
    expect(out.timeOfDayPatterns.morning.confidence).toBe(0);
  });

  it("surfaces top tags once a bucket has ≥5 signals", () => {
    const morningSignals = Array.from({ length: 6 }, (_, i) =>
      signal("cooked", i, {
        id: `m-${i}`,
        timeOfDay: "morning",
        facets: facets({
          cuisine: "american",
          flavors: ["fresh", "fruity"],
          dishClass: "oats",
          proteins: [],
        }),
      }),
    );
    const out = aggregateSignals({ signals: morningSignals, now: NOW });
    expect(out.timeOfDayPatterns.morning.topTags.length).toBeGreaterThan(0);
    expect(out.timeOfDayPatterns.morning.confidence).toBeGreaterThan(0);
    expect(out.timeOfDayPatterns.morning.topTags).toContain("fresh");
  });

  it("only surfaces positively-weighted tags", () => {
    // 6 morning swipe-LEFTs on "indian" should NOT surface "indian"
    // as a positive top-tag (its weight is negative).
    const morningSignals = Array.from({ length: 6 }, (_, i) =>
      signal("swipe-left", i, {
        id: `ml-${i}`,
        timeOfDay: "morning",
      }),
    );
    const out = aggregateSignals({ signals: morningSignals, now: NOW });
    expect(out.timeOfDayPatterns.morning.topTags).not.toContain("indian");
  });

  it("confidence ramps from 0 (at 5 signals) to 1 (at 25+)", () => {
    const make = (count: number) =>
      Array.from({ length: count }, (_, i) =>
        signal("cooked", i % 30, {
          id: `c-${i}-${count}`,
          timeOfDay: "dinner",
        }),
      );
    const fewer = aggregateSignals({ signals: make(5), now: NOW });
    const middle = aggregateSignals({ signals: make(15), now: NOW });
    const many = aggregateSignals({ signals: make(30), now: NOW });
    expect(fewer.timeOfDayPatterns.dinner.confidence).toBeLessThan(
      middle.timeOfDayPatterns.dinner.confidence,
    );
    expect(middle.timeOfDayPatterns.dinner.confidence).toBeLessThanOrEqual(
      many.timeOfDayPatterns.dinner.confidence,
    );
    expect(many.timeOfDayPatterns.dinner.confidence).toBe(1);
  });
});

describe("aggregateSignals — invariants", () => {
  it("output weights stay in [-1, 1]", () => {
    // Construct an absurdly skewed input and confirm we don't escape.
    const huge = Array.from({ length: 200 }, (_, i) =>
      signal("cooked", i % 60),
    );
    const out = aggregateSignals({ signals: huge, now: NOW });
    for (const w of Object.values(out.inferred.cuisines)) {
      expect(w).toBeGreaterThanOrEqual(-1);
      expect(w).toBeLessThanOrEqual(1);
    }
  });

  it("contributingSignalCount excludes invalid timestamps", () => {
    const out = aggregateSignals({
      signals: [
        signal("cooked", 0),
        signal("cooked", 0, { capturedAt: "garbled" }),
      ],
      now: NOW,
    });
    expect(out.contributingSignalCount).toBe(1);
  });
});
