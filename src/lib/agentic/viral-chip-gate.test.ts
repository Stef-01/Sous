import { describe, expect, it } from "vitest";
import {
  CUISINE_CONCENTRATION_HOLD_RATIO,
  VIRALITY_FIRE_THRESHOLD,
  evaluateViralChipEligibility,
  formatAttribution,
  formatViralChipCopy,
  sameCuisineConcentration,
  type RecentCookEntry,
  type ViralCandidate,
} from "./viral-chip-gate";
import { freshCooldownState } from "./viral-cooldown";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-05-15T18:00:00");

function fixtureCandidate(): ViralCandidate {
  return {
    searchResult: {
      title: "Kim K's viral smoothie everyone is making",
      url: "https://tiktok.com/@example/post/1",
      snippet: "Hit 2.5M views — gone viral overnight",
      publishedAt: new Date(NOW.getTime() - 2 * DAY_MS).toISOString(),
      sourceDomain: "tiktok.com",
    },
    recipe: {
      slug: "viral-smoothie",
      displayName: "morning smoothie",
      creator: "Kim K",
      sourceUrl: "https://tiktok.com/@example/post/1",
      title: "Kim K's morning smoothie",
      cuisineFamily: "american",
      ingredients: ["oat milk", "banana", "spirulina"],
      dietaryFlags: ["vegan", "vegetarian", "gluten-free"],
    },
  };
}

// ── sameCuisineConcentration ──────────────────────────────

describe("sameCuisineConcentration", () => {
  it("no recent cooks → 0", () => {
    expect(sameCuisineConcentration([], "italian", NOW)).toBe(0);
  });

  it("all recent cooks same cuisine → 1.0", () => {
    const recent: RecentCookEntry[] = Array.from({ length: 5 }, (_, i) => ({
      cuisineFamily: "italian",
      completedAt: new Date(NOW.getTime() - i * DAY_MS).toISOString(),
    }));
    expect(sameCuisineConcentration(recent, "italian", NOW)).toBe(1.0);
  });

  it("half same / half different → 0.5", () => {
    const recent: RecentCookEntry[] = [
      {
        cuisineFamily: "italian",
        completedAt: new Date(NOW.getTime() - 1 * DAY_MS).toISOString(),
      },
      {
        cuisineFamily: "italian",
        completedAt: new Date(NOW.getTime() - 2 * DAY_MS).toISOString(),
      },
      {
        cuisineFamily: "indian",
        completedAt: new Date(NOW.getTime() - 3 * DAY_MS).toISOString(),
      },
      {
        cuisineFamily: "thai",
        completedAt: new Date(NOW.getTime() - 4 * DAY_MS).toISOString(),
      },
    ];
    expect(sameCuisineConcentration(recent, "italian", NOW)).toBe(0.5);
  });

  it("excludes cooks outside lookback window", () => {
    const recent: RecentCookEntry[] = [
      {
        cuisineFamily: "italian",
        completedAt: new Date(NOW.getTime() - 30 * DAY_MS).toISOString(),
      },
      {
        cuisineFamily: "thai",
        completedAt: new Date(NOW.getTime() - 1 * DAY_MS).toISOString(),
      },
    ];
    expect(sameCuisineConcentration(recent, "italian", NOW)).toBe(0);
  });

  it("case-insensitive cuisine match", () => {
    const recent: RecentCookEntry[] = [
      {
        cuisineFamily: "Italian",
        completedAt: new Date(NOW.getTime() - 1 * DAY_MS).toISOString(),
      },
    ];
    expect(sameCuisineConcentration(recent, "italian", NOW)).toBe(1.0);
  });
});

// ── formatViralChipCopy ───────────────────────────────────

describe("formatViralChipCopy", () => {
  it("includes creator + dish in template", () => {
    const c = formatViralChipCopy({ creator: "Kim K", dish: "smoothie" });
    expect(c).toContain("Kim K");
    expect(c).toContain("smoothie");
    expect(c).toContain("viral");
  });

  it("creator-less variant when creator empty", () => {
    const c = formatViralChipCopy({ creator: "", dish: "smoothie" });
    expect(c).toContain("smoothie");
    expect(c).not.toContain("'s");
  });

  it("trims whitespace in creator + dish", () => {
    const c = formatViralChipCopy({
      creator: "  Kim K  ",
      dish: "  smoothie  ",
    });
    expect(c).toContain("Kim K");
    expect(c).toContain("smoothie");
  });
});

// ── formatAttribution ─────────────────────────────────────

describe("formatAttribution", () => {
  it("includes creator credit + source URL + 'View original'", () => {
    const a = formatAttribution({
      creator: "Kim K",
      sourceUrl: "https://example.test/x",
    });
    expect(a.attributionLine).toContain("Kim K");
    expect(a.attributionLine).toContain("https://example.test/x");
    expect(a.attributionLine).toContain("View original");
  });

  it("omits creator when empty (still includes source + view)", () => {
    const a = formatAttribution({
      creator: "",
      sourceUrl: "https://example.test/x",
    });
    expect(a.attributionLine).toContain("https://example.test/x");
    expect(a.attributionLine).toContain("View original");
  });
});

// ── evaluateViralChipEligibility ──────────────────────────

describe("evaluateViralChipEligibility — all gates pass", () => {
  it("happy path → fire with copy + attribution", () => {
    const out = evaluateViralChipEligibility({
      candidate: fixtureCandidate(),
      cooldown: freshCooldownState(),
      dietaryUnion: [],
      recentCooks: [],
      existingPool: [],
      now: NOW,
    });
    expect(out.fire).toBe(true);
    if (out.fire) {
      expect(out.slug).toBe("viral-smoothie");
      expect(out.copy).toContain("Kim K");
      expect(out.attribution.attributionLine).toContain("View original");
      expect(out.score).toBeGreaterThanOrEqual(VIRALITY_FIRE_THRESHOLD);
    }
  });
});

describe("evaluateViralChipEligibility — gate failures", () => {
  it("cool-down hold → fire=false", () => {
    const out = evaluateViralChipEligibility({
      candidate: fixtureCandidate(),
      cooldown: {
        lastShownAt: new Date(NOW.getTime() - 1 * DAY_MS).toISOString(),
        dismissalCount: 0,
      },
      dietaryUnion: [],
      recentCooks: [],
      existingPool: [],
      now: NOW,
    });
    expect(out.fire).toBe(false);
    if (!out.fire) expect(out.reason.toLowerCase()).toContain("cool-down");
  });

  it("low virality (no boosts) → fire=false", () => {
    const candidate = fixtureCandidate();
    candidate.searchResult = {
      ...candidate.searchResult,
      title: "Plain weekday dinner",
      snippet: "A nice meal",
      publishedAt: null,
      sourceDomain: "nytimes.com",
    };
    const out = evaluateViralChipEligibility({
      candidate,
      cooldown: freshCooldownState(),
      dietaryUnion: [],
      recentCooks: [],
      existingPool: [],
      now: NOW,
    });
    expect(out.fire).toBe(false);
    if (!out.fire) expect(out.reason.toLowerCase()).toContain("virality");
  });

  it("dietary union violation → fire=false", () => {
    const candidate = fixtureCandidate();
    // Strip vegan flag → user requires vegan but recipe doesn't have it
    candidate.recipe.dietaryFlags = ["vegetarian"];
    const out = evaluateViralChipEligibility({
      candidate,
      cooldown: freshCooldownState(),
      dietaryUnion: ["vegan"],
      recentCooks: [],
      existingPool: [],
      now: NOW,
    });
    expect(out.fire).toBe(false);
    if (!out.fire) expect(out.reason.toLowerCase()).toContain("diet flag");
  });

  it("cuisine concentration >= 80% → fire=false", () => {
    const recent: RecentCookEntry[] = Array.from({ length: 10 }, (_, i) => ({
      cuisineFamily: i < 9 ? "american" : "italian", // 9/10 american
      completedAt: new Date(NOW.getTime() - i * DAY_MS).toISOString(),
    }));
    const out = evaluateViralChipEligibility({
      candidate: fixtureCandidate(), // american
      cooldown: freshCooldownState(),
      dietaryUnion: [],
      recentCooks: recent,
      existingPool: [],
      now: NOW,
    });
    expect(out.fire).toBe(false);
    if (!out.fire) expect(out.reason.toLowerCase()).toContain("same-cuisine");
  });

  it("dedup hit → fire=false", () => {
    const candidate = fixtureCandidate();
    const out = evaluateViralChipEligibility({
      candidate,
      cooldown: freshCooldownState(),
      dietaryUnion: [],
      recentCooks: [],
      existingPool: [
        {
          slug: "existing-smoothie",
          title: candidate.recipe.title,
          cuisineFamily: candidate.recipe.cuisineFamily,
          ingredients: [...candidate.recipe.ingredients],
        },
      ],
      now: NOW,
    });
    expect(out.fire).toBe(false);
    if (!out.fire) expect(out.reason).toContain("existing-smoothie");
  });

  it("CUISINE_CONCENTRATION_HOLD_RATIO is 0.8 (W42 plan)", () => {
    expect(CUISINE_CONCENTRATION_HOLD_RATIO).toBe(0.8);
  });

  it("VIRALITY_FIRE_THRESHOLD is 0.7 (W42 plan)", () => {
    expect(VIRALITY_FIRE_THRESHOLD).toBe(0.7);
  });
});
