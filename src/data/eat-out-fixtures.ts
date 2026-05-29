/**
 * Eat Out — curated venue + dish fixtures (Y5 J).
 *
 * 4 venues × 2 dishes each = 8-card starter stack per the Y5 plan.
 * Real Yelp / Google Places integration is Y7 K. Until then the
 * surface runs on this hand-curated set, which is enough to
 * demo the dish-first card flow end-to-end.
 *
 * The picks are flagship dishes from well-known restaurants where
 * the dish is closely associated with the venue's identity. Each
 * dish has a `whyHere` blurb explaining the connection — that
 * narrative is the core value-prop of Eat Out vs a generic Yelp
 * search.
 *
 * Pure data — no React, no DOM.
 */

import type { EatOutDish, EatOutVenue } from "@/types/eat-out";

export const EAT_OUT_VENUES: ReadonlyArray<EatOutVenue> = [
  {
    slug: "lartusi",
    name: "L'Artusi",
    city: "New York",
    country: "USA",
    lat: 40.7378,
    lng: -74.0048,
    priceTier: "$$$",
    vibe: "Buzzy West Village trattoria — pasta-first, low lighting, bottle list runs deep.",
  },
  {
    slug: "swan-oyster",
    name: "Swan Oyster Depot",
    city: "San Francisco",
    country: "USA",
    lat: 37.7892,
    lng: -122.4198,
    priceTier: "$$",
    vibe: "Counter-only seafood since 1912 — line out the door, no reservations, cash and chowder.",
  },
  {
    slug: "din-tai-fung",
    name: "Din Tai Fung",
    city: "Taipei",
    country: "Taiwan",
    lat: 25.0337,
    lng: 121.5645,
    priceTier: "$$",
    vibe: "Michelin-starred dumpling house famously precise — 18 pleats per xiaolongbao, exactly.",
  },
  {
    slug: "noma",
    name: "Noma",
    city: "Copenhagen",
    country: "Denmark",
    lat: 55.6826,
    lng: 12.6105,
    priceTier: "$$$$",
    vibe: "Three-Michelin-star fermentation lab — seasonal reservations book months out.",
  },
];

export const EAT_OUT_DISHES: ReadonlyArray<EatOutDish> = [
  // L'Artusi (NYC)
  {
    slug: "lartusi-bucatini",
    name: "Bucatini al Limone",
    venueSlug: "lartusi",
    cuisineFamily: "italian",
    flavors: ["bright", "creamy", "umami"],
    proteins: [],
    whyHere:
      "Their bucatini al limone is the dish that built the room — chewy thick noodle, lemon-pecorino emulsion, finishing crack of black pepper.",
    imageUrl: "placeholder:🍝",
    priceUsd: 28,
  },
  {
    slug: "lartusi-octopus",
    name: "Charred Octopus",
    venueSlug: "lartusi",
    cuisineFamily: "italian",
    flavors: ["smoky", "savory"],
    proteins: ["octopus"],
    whyHere:
      "Slow-poached then over open flame — tender inside, char outside, served warm with potato and salsa verde.",
    imageUrl: "placeholder:🐙",
    priceUsd: 24,
  },

  // Swan Oyster Depot (SF)
  {
    slug: "swan-clam-chowder",
    name: "Clam Chowder",
    venueSlug: "swan-oyster",
    cuisineFamily: "american",
    flavors: ["creamy", "savory"],
    proteins: ["clam"],
    whyHere:
      "Their Boston-style chowder is the line-justifier — bowl-thick, tableware-warming, no liquid smoke shortcuts.",
    imageUrl: "placeholder:🥣",
    priceUsd: 12,
  },
  {
    slug: "swan-dungeness",
    name: "Dungeness Crab",
    venueSlug: "swan-oyster",
    cuisineFamily: "american",
    flavors: ["sweet", "fresh"],
    proteins: ["crab"],
    whyHere:
      "Cracked-to-order Dungeness with sourdough — peak from November to June; ask for the Louie if you want the salad version.",
    imageUrl: "placeholder:🦀",
    priceUsd: 38,
  },

  // Din Tai Fung (Taipei)
  {
    slug: "dtf-xiaolongbao",
    name: "Xiao Long Bao",
    venueSlug: "din-tai-fung",
    cuisineFamily: "chinese",
    flavors: ["umami", "savory"],
    proteins: ["pork"],
    whyHere:
      "Eighteen-pleat soup dumplings — pork-and-broth filling held inside a wrapper thin enough to read through.",
    imageUrl: "placeholder:🥟",
    priceUsd: 11,
  },
  {
    slug: "dtf-truffle-bao",
    name: "Truffle &amp; Pork Bao",
    venueSlug: "din-tai-fung",
    cuisineFamily: "chinese",
    flavors: ["umami", "rich"],
    proteins: ["pork"],
    whyHere:
      "Seasonal item — black-truffle butter folded into the pork filling. Order early; sells out by 8pm most nights.",
    imageUrl: "placeholder:🥟",
    priceUsd: 18,
  },

  // Noma (Copenhagen)
  {
    slug: "noma-vegetable-platter",
    name: "Vegetable Season Platter",
    venueSlug: "noma",
    cuisineFamily: "comfort-classic",
    flavors: ["fresh", "umami", "tangy"],
    proteins: [],
    whyHere:
      "Rotates by season — peak summer is stone fruits and greens fermented in-house. Ten courses, one plate at a time.",
    imageUrl: "placeholder:🥬",
    priceUsd: 305,
  },
  {
    slug: "noma-game-tasting",
    name: "Game-and-Forest Tasting",
    venueSlug: "noma",
    cuisineFamily: "comfort-classic",
    flavors: ["smoky", "savory", "rich"],
    proteins: ["venison", "duck"],
    whyHere:
      "Winter's signature — roe-deer carpaccio, smoked-bone-marrow tartare, pinecone-syrup desserts. Two-month booking lead.",
    imageUrl: "placeholder:🦌",
    priceUsd: 305,
  },
];
