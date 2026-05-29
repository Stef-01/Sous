import { describe, expect, it } from "vitest";
import { rankEatOut, scoreDish } from "./ranking";
import type { EatOutDish, EatOutVenue } from "@/types/eat-out";
import type { MergedProfile } from "@/lib/intelligence/manual-edit-merge";

const VENUES: EatOutVenue[] = [
  {
    slug: "v1",
    name: "Venue One",
    city: "X",
    country: "Y",
    lat: 0,
    lng: 0,
    priceTier: "$",
    vibe: "...",
  },
  {
    slug: "v2",
    name: "Venue Two",
    city: "X",
    country: "Y",
    lat: 0,
    lng: 0,
    priceTier: "$$$$",
    vibe: "...",
  },
];

const DISHES: EatOutDish[] = [
  {
    slug: "italian-pasta",
    name: "Pasta",
    venueSlug: "v1",
    cuisineFamily: "italian",
    flavors: ["umami"],
    proteins: [],
    whyHere: "...",
    imageUrl: "placeholder:🍝",
    priceUsd: 20,
  },
  {
    slug: "indian-curry",
    name: "Curry",
    venueSlug: "v2",
    cuisineFamily: "indian",
    flavors: ["spicy", "umami"],
    proteins: [],
    whyHere: "...",
    imageUrl: "placeholder:🍛",
    priceUsd: 25,
  },
  {
    slug: "orphan-dish",
    name: "Orphan",
    venueSlug: "missing", // joins to no venue
    cuisineFamily: "thai",
    flavors: [],
    proteins: [],
    whyHere: "...",
    imageUrl: "placeholder:?",
    priceUsd: 10,
  },
];

function emptyProfile(overrides?: Partial<MergedProfile>): MergedProfile {
  return {
    cuisines: {},
    flavors: {},
    proteins: {},
    dishClasses: {},
    ...overrides,
  };
}

describe("rankEatOut", () => {
  it("drops dishes whose venueSlug doesn't join", () => {
    const cards = rankEatOut({ dishes: DISHES, venues: VENUES });
    expect(cards.find((c) => c.dish.slug === "orphan-dish")).toBeUndefined();
    expect(cards).toHaveLength(2);
  });

  it("returns a stable order on cold-start", () => {
    const a = rankEatOut({ dishes: DISHES, venues: VENUES });
    const b = rankEatOut({ dishes: DISHES, venues: VENUES });
    expect(a.map((c) => c.dish.slug)).toEqual(b.map((c) => c.dish.slug));
  });

  it("filters by cuisine when cuisineFilter is set", () => {
    const cards = rankEatOut({
      dishes: DISHES,
      venues: VENUES,
      cuisineFilter: "italian",
    });
    expect(cards).toHaveLength(1);
    expect(cards[0].dish.slug).toBe("italian-pasta");
  });

  it("respects the limit parameter", () => {
    const cards = rankEatOut({
      dishes: DISHES,
      venues: VENUES,
      limit: 1,
    });
    expect(cards).toHaveLength(1);
  });

  it("boosts a cuisine that the profile likes", () => {
    const profile = emptyProfile({ cuisines: { indian: 1, italian: -0.5 } });
    const cards = rankEatOut({
      dishes: DISHES,
      venues: VENUES,
      profile,
    });
    // indian-curry should out-rank italian-pasta now.
    expect(cards[0].dish.slug).toBe("indian-curry");
  });
});

describe("scoreDish", () => {
  it("returns 0.5 baseline + price boost when profile is null", () => {
    const score = scoreDish({
      dish: DISHES[0],
      venue: VENUES[0], // $
      profile: null,
    });
    // baseline 0.5 + price $ boost 0.05 = 0.55
    expect(score).toBeCloseTo(0.55, 5);
  });

  it("clamps to [0, 1]", () => {
    const profile = emptyProfile({
      cuisines: { italian: 5 }, // out-of-range positive
      flavors: { umami: 5 },
    });
    const score = scoreDish({
      dish: DISHES[0],
      venue: VENUES[0],
      profile,
    });
    expect(score).toBeLessThanOrEqual(1);
    expect(score).toBeGreaterThan(0.5);
  });

  it("never returns negative on hostile profile", () => {
    const profile = emptyProfile({
      cuisines: { italian: -1 },
      flavors: { umami: -1 },
    });
    const score = scoreDish({
      dish: DISHES[0],
      venue: VENUES[0],
      profile,
    });
    // 0.5 - 0.25 - 0.2 + 0.05 = 0.1 (positive)
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(0.5);
  });
});
