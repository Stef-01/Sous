/**
 * W46 — Nutrient-education spotlights for the Content tab. Food-first, hedged,
 * NO therapeutic promises (no "cure"/"prevents disease"). Every entry is
 * `isPlaceholder: true` with a sample author until the editorial workstream
 * (rule 11). Covers reuse existing food_images only (rule 7 — no generated art).
 *
 * Shape: regular Article items tagged "nutrient-spotlight", so they flow through
 * the existing Content list + FeaturedHero with zero new rendering.
 */

import type { Article } from "@/types/content";

export const NUTRIENT_SPOTLIGHT_ARTICLES: Article[] = [
  {
    id: "spot-omega-3",
    category: "articles",
    isPlaceholder: true,
    slug: "why-omega-3s-and-where-to-get-them",
    kicker: "Nutrient spotlight",
    title: "Omega-3s: small fats, big role",
    excerpt:
      "Why these fats matter and the everyday foods that bring them — no supplement aisle required.",
    coverImageUrl: "/food_images/grilled_salmon.png",
    body: [
      "Omega-3 fats (EPA and DHA in particular) are building blocks your body can't make well on its own, so they have to come from food.",
      "The most concentrated sources are oily fish — salmon, sardines, mackerel. Plant cooks can lean on walnuts, ground flax, chia, and a little rapeseed oil, which supply ALA that the body partly converts.",
      "Aim for variety over perfection: a couple of fish meals a week, or a daily spoon of seeds, covers most people. This is general food guidance, not a treatment plan.",
    ],
    authorId: "expert-maya-patel",
    readMinutes: 4,
    tags: ["nutrient-spotlight", "omega-3", "fats"],
    createdAt: "2026-05-30T09:00:00.000Z",
    relatedRecipeSlug: "grilled-salmon",
  },
  {
    id: "spot-iron-vitc",
    category: "articles",
    isPlaceholder: true,
    slug: "pair-iron-with-vitamin-c",
    kicker: "Nutrient spotlight",
    title: "Iron + vitamin C: a pairing that pays off",
    excerpt:
      "A squeeze of lemon on your lentils does more than brighten the flavour.",
    coverImageUrl: "/food_images/mixed_green_salad.png",
    body: [
      "The iron in beans, lentils, tofu, and greens (non-heme iron) is harder to absorb than the iron in meat — but vitamin C gives it a real lift.",
      "So pair plant iron with something bright: a squeeze of citrus, tomatoes, peppers, or a side of slaw. Tea and coffee do the opposite, so enjoy them between meals rather than alongside an iron-rich plate.",
      "It's a simple cooking habit, not a medical fix — but it's one of the better-evidenced ones in everyday nutrition.",
    ],
    authorId: "expert-maya-patel",
    readMinutes: 3,
    tags: ["nutrient-spotlight", "iron", "vitamin-c"],
    createdAt: "2026-05-28T09:00:00.000Z",
  },
  {
    id: "spot-fiber",
    category: "articles",
    isPlaceholder: true,
    slug: "fiber-the-quiet-workhorse",
    kicker: "Nutrient spotlight",
    title: "Fibre: the quiet workhorse",
    excerpt:
      "Most of us get about half of what we could. Beans, oats, and whole grains close the gap deliciously.",
    coverImageUrl: "/food_images/masoor_dal.png",
    body: [
      "Fibre feeds your gut bacteria, steadies how quickly carbs hit your blood, and helps you feel full — and most people fall short of the everyday target.",
      "The easiest wins are beans and lentils, oats, whole grains, and leaving the skins on fruit and veg. Going slow and drinking water helps your gut adjust.",
      "No need to count grams — just nudge each plate toward the whole, plant-y end. General guidance, not medical advice.",
    ],
    authorId: "expert-maya-patel",
    readMinutes: 4,
    tags: ["nutrient-spotlight", "fiber", "gut-health"],
    createdAt: "2026-05-26T09:00:00.000Z",
    relatedRecipeSlug: "masoor-dal",
  },
  {
    id: "spot-protein-spread",
    category: "articles",
    isPlaceholder: true,
    slug: "spread-your-protein-across-the-day",
    kicker: "Nutrient spotlight",
    title: "Protein: spread it across the day",
    excerpt: "A little at each meal tends to beat one big hit at dinner.",
    coverImageUrl: "/food_images/indian_egg_bites.png",
    body: [
      "Your body uses protein best in steady amounts, so a palm-sized source at each meal generally serves you better than loading it all into dinner.",
      "Mix the sources: eggs or yoghurt at breakfast, beans or fish at lunch, tofu or chicken at dinner. Plant and animal sources both count, and combining plants (rice + beans) rounds out the amino acids.",
      "This is a general pattern that suits most healthy adults — your own needs may differ, so treat it as a guide.",
    ],
    authorId: "expert-maya-patel",
    readMinutes: 3,
    tags: ["nutrient-spotlight", "protein"],
    createdAt: "2026-05-24T09:00:00.000Z",
  },
];
