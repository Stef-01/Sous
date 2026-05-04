import { describe, expect, it } from "vitest";
import {
  SWIPE_MIN_COVERAGE,
  SWIPE_POOL_SIZE,
  buildSwipeCardPool,
  type PoolCandidate,
} from "./swipe-pool";

const NOW = new Date("2026-05-15T12:00:00");
const DAY_MS = 24 * 60 * 60 * 1000;

function fixtureCandidate(over: Partial<PoolCandidate> = {}): PoolCandidate {
  return {
    recipeSlug: "x",
    title: "x",
    cuisineFamily: "italian",
    ingredients: ["pasta", "tomato sauce", "basil"],
    prepTimeMinutes: 20,
    dietaryFlags: ["vegetarian"],
    ...over,
  };
}

describe("buildSwipeCardPool — empty + edge", () => {
  it("empty candidates → empty pool", () => {
    expect(
      buildSwipeCardPool({
        candidates: [],
        pantry: ["pasta"],
        dietaryUnion: [],
        recentCooks: [],
        now: NOW,
      }),
    ).toEqual([]);
  });

  it("empty pantry → all candidates fail coverage gate", () => {
    expect(
      buildSwipeCardPool({
        candidates: [fixtureCandidate()],
        pantry: [],
        dietaryUnion: [],
        recentCooks: [],
        now: NOW,
      }),
    ).toEqual([]);
  });

  it("full pantry coverage → candidate makes the pool", () => {
    const out = buildSwipeCardPool({
      candidates: [fixtureCandidate()],
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: [],
      recentCooks: [],
      now: NOW,
    });
    expect(out.length).toBe(1);
  });
});

describe("buildSwipeCardPool — coverage threshold", () => {
  it("below SWIPE_MIN_COVERAGE → excluded", () => {
    // Recipe needs 3 ingredients; pantry has only 1 → coverage 0.33 < 0.7
    const out = buildSwipeCardPool({
      candidates: [fixtureCandidate()],
      pantry: ["pasta"],
      dietaryUnion: [],
      recentCooks: [],
      now: NOW,
    });
    expect(out).toEqual([]);
  });

  it("at SWIPE_MIN_COVERAGE → included (inclusive boundary)", () => {
    // 7 of 10 ingredients in pantry → coverage 0.7
    const ingredients = Array.from({ length: 10 }, (_, i) => `ing${i}`);
    const inPantry = ingredients.slice(0, 7);
    const out = buildSwipeCardPool({
      candidates: [fixtureCandidate({ ingredients })],
      pantry: inPantry,
      dietaryUnion: [],
      recentCooks: [],
      now: NOW,
    });
    expect(out.length).toBe(1);
  });

  it("custom minCoverage threads through", () => {
    const out = buildSwipeCardPool({
      candidates: [fixtureCandidate()],
      pantry: ["pasta"],
      dietaryUnion: [],
      recentCooks: [],
      now: NOW,
      minCoverage: 0.3,
    });
    expect(out.length).toBe(1);
  });
});

describe("buildSwipeCardPool — dietary gate", () => {
  it("dietary union violation → excluded", () => {
    const out = buildSwipeCardPool({
      candidates: [fixtureCandidate({ dietaryFlags: ["vegetarian"] })],
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: ["vegan"],
      recentCooks: [],
      now: NOW,
    });
    expect(out).toEqual([]);
  });

  it("recipe satisfies all union flags → included", () => {
    const out = buildSwipeCardPool({
      candidates: [
        fixtureCandidate({ dietaryFlags: ["vegan", "gluten-free"] }),
      ],
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: ["vegan"],
      recentCooks: [],
      now: NOW,
    });
    expect(out.length).toBe(1);
  });

  it("empty union → no dietary constraint", () => {
    const out = buildSwipeCardPool({
      candidates: [fixtureCandidate({ dietaryFlags: [] })],
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: [],
      recentCooks: [],
      now: NOW,
    });
    expect(out.length).toBe(1);
  });

  it("case-insensitive flag matching", () => {
    const out = buildSwipeCardPool({
      candidates: [fixtureCandidate({ dietaryFlags: ["VEGAN"] })],
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: ["vegan"],
      recentCooks: [],
      now: NOW,
    });
    expect(out.length).toBe(1);
  });
});

describe("buildSwipeCardPool — ranking", () => {
  it("recently-cooked recipe ranked below not-recent ones", () => {
    const recent = fixtureCandidate({ recipeSlug: "recent" });
    const fresh = fixtureCandidate({ recipeSlug: "fresh" });
    const out = buildSwipeCardPool({
      candidates: [recent, fresh],
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: [],
      recentCooks: [
        {
          recipeSlug: "recent",
          cuisineFamily: "italian",
          completedAt: new Date(NOW.getTime() - 3 * DAY_MS).toISOString(),
        },
      ],
      now: NOW,
    });
    expect(out[0]?.recipeSlug).toBe("fresh");
    expect(out[1]?.recipeSlug).toBe("recent");
  });

  it("over-represented cuisine in last 14d ranks lower", () => {
    const italian = fixtureCandidate({
      recipeSlug: "italian-1",
      cuisineFamily: "italian",
    });
    const thai = fixtureCandidate({
      recipeSlug: "thai-1",
      cuisineFamily: "thai",
    });
    const recentItalianCooks = Array.from({ length: 4 }, (_, i) => ({
      recipeSlug: `italian-old-${i}`,
      cuisineFamily: "italian",
      completedAt: new Date(NOW.getTime() - (i + 2) * DAY_MS).toISOString(),
    }));
    const out = buildSwipeCardPool({
      candidates: [italian, thai],
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: [],
      recentCooks: recentItalianCooks,
      now: NOW,
    });
    expect(out[0]?.cuisineFamily).toBe("thai");
  });

  it("quick recipes outrank long ones (ease of prep)", () => {
    const quick = fixtureCandidate({
      recipeSlug: "quick",
      prepTimeMinutes: 8,
    });
    const long = fixtureCandidate({
      recipeSlug: "long",
      prepTimeMinutes: 90,
    });
    const out = buildSwipeCardPool({
      candidates: [quick, long],
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: [],
      recentCooks: [],
      now: NOW,
    });
    expect(out[0]?.recipeSlug).toBe("quick");
  });

  it("alphabetical tie-break when ranks are equal", () => {
    const candidates = [
      fixtureCandidate({ recipeSlug: "zeta" }),
      fixtureCandidate({ recipeSlug: "alpha" }),
    ];
    const out = buildSwipeCardPool({
      candidates,
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: [],
      recentCooks: [],
      now: NOW,
    });
    expect(out.map((c) => c.recipeSlug)).toEqual(["alpha", "zeta"]);
  });
});

describe("buildSwipeCardPool — pool size", () => {
  it("respects SWIPE_POOL_SIZE default", () => {
    const candidates = Array.from({ length: 30 }, (_, i) =>
      fixtureCandidate({ recipeSlug: `r-${i}` }),
    );
    const out = buildSwipeCardPool({
      candidates,
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: [],
      recentCooks: [],
      now: NOW,
    });
    expect(out.length).toBe(SWIPE_POOL_SIZE);
  });

  it("custom poolSize threads through", () => {
    const candidates = Array.from({ length: 30 }, (_, i) =>
      fixtureCandidate({ recipeSlug: `r-${i}` }),
    );
    const out = buildSwipeCardPool({
      candidates,
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: [],
      recentCooks: [],
      now: NOW,
      poolSize: 5,
    });
    expect(out.length).toBe(5);
  });

  it("fewer candidates than pool size → returns what's available", () => {
    const candidates = Array.from({ length: 3 }, (_, i) =>
      fixtureCandidate({ recipeSlug: `r-${i}` }),
    );
    const out = buildSwipeCardPool({
      candidates,
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: [],
      recentCooks: [],
      now: NOW,
    });
    expect(out.length).toBe(3);
  });
});

describe("buildSwipeCardPool — output shape", () => {
  it("each card includes pantryCoverage + rankScore + source", () => {
    const out = buildSwipeCardPool({
      candidates: [fixtureCandidate()],
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: [],
      recentCooks: [],
      now: NOW,
    });
    expect(out[0]?.pantryCoverage).toBeGreaterThan(0);
    expect(out[0]?.rankScore).toBeGreaterThanOrEqual(0);
    expect(out[0]?.rankScore).toBeLessThanOrEqual(1);
    expect(out[0]?.source).toBe("seed");
  });

  it("preserves candidate-supplied source tag", () => {
    const out = buildSwipeCardPool({
      candidates: [fixtureCandidate({ source: "leftovers-successor" })],
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: [],
      recentCooks: [],
      now: NOW,
    });
    expect(out[0]?.source).toBe("leftovers-successor");
  });

  it("SWIPE_MIN_COVERAGE is 0.7 (per the W25 plan)", () => {
    expect(SWIPE_MIN_COVERAGE).toBe(0.7);
  });

  it("SWIPE_POOL_SIZE is 12 (per the W25 plan)", () => {
    expect(SWIPE_POOL_SIZE).toBe(12);
  });
});

describe("buildSwipeCardPool — determinism", () => {
  it("same input → same output", () => {
    const candidates = [
      fixtureCandidate({ recipeSlug: "a" }),
      fixtureCandidate({ recipeSlug: "b" }),
    ];
    const inputs = {
      candidates,
      pantry: ["pasta", "tomato sauce", "basil"],
      dietaryUnion: [],
      recentCooks: [],
      now: NOW,
    };
    const a = buildSwipeCardPool(inputs);
    const b = buildSwipeCardPool(inputs);
    expect(a).toEqual(b);
  });
});
