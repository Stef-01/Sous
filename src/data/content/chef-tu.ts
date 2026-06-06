/**
 * Chef Tu David Phu — REAL partner content for the Content tab.
 *
 * Unlike the placeholder editorial seed, Chef Tu is Sous's consented co-launch
 * partner, so these carry `isPlaceholder: false`, his real name, and a real
 * (non-"sample") affiliation. The teaching copy is ORIGINAL writing about his
 * publicly-known craft and technique — it does not reproduce any text from his
 * cookbook or recipe headnotes. Recipe images are his partner-authorized
 * library photos already self-hosted in /food_images.
 */

import type { Article, ExpertVoice } from "@/types/content";

const ARTICLE_IDS = [
  "art-tu-fish-sauce",
  "art-tu-pho-broth",
  "art-tu-nuoc-cham",
] as const;

export const CHEF_TU_EXPERT: ExpertVoice = {
  id: "expert-tu-david-phu",
  category: "experts",
  isPlaceholder: false,
  title: "Chef Tu David Phu",
  slug: "tu-david-phu",
  name: "Tu David Phu",
  credential: "Chef · Top Chef alum",
  affiliation: "Partner chef · cheftu.com",
  bio: "Oakland-born Vietnamese-American chef and Top Chef alum, the son of refugees from Phú Quốc. He cooks the umami-forward, fish-sauce-driven food he grew up with and teaches home cooks to trust their senses — taste, smell, sound — over rigid measurements. On Sous he shares the techniques behind his recipe library.",
  avatarUrl: "/food_images/tu_pho_dac_biet.jpg",
  createdAt: "2026-06-01T10:00:00.000Z",
  articleIds: [...ARTICLE_IDS],
};

export const CHEF_TU_ARTICLES: Article[] = [
  {
    id: "art-tu-fish-sauce",
    category: "articles",
    isPlaceholder: false,
    createdAt: "2026-06-01T10:00:00.000Z",
    slug: "fish-sauce-the-backbone",
    kicker: "Chef Tu teaches",
    title: "Fish sauce is the backbone, not the garnish",
    excerpt:
      "Most home cooks treat fish sauce like hot sauce — a few drops at the end. Chef Tu uses it the way other kitchens use salt: as the seasoning a dish is built on.",
    coverImageUrl: "/food_images/tu_nuoc_cham.jpg",
    body: [
      "If there is one habit that separates Vietnamese cooking from the way most home kitchens season, it is this: fish sauce is not a finishing condiment. It is the salt of the dish. You build flavor on it from the first step, not the last.",
      "Start by tasting your fish sauce straight, the way you would taste a wine before cooking with it. A good bottle is salty up front, then savory and almost sweet on the back end, with a clean smell — funky, yes, but never harsh. The first ingredient on the label should be anchovies, and the protein number (often printed as °N) tells you how concentrated it is; higher means you need less.",
      "When you season a braise or a broth, add fish sauce early and in stages. A spoonful at the start dissolves into the background and deepens everything around it; a spoonful at the end sits on top and tastes sharp. If a dish tastes flat but you've already salted it, the fix is almost always a small splash of fish sauce, not more salt — it brings the savory depth that salt alone can't.",
      "The test isn't whether you can taste the fish sauce. Done right, you can't. You taste a dish that is rounder, meatier, more complete — and you reach for a second bite without knowing why.",
    ],
    authorId: "expert-tu-david-phu",
    readMinutes: 4,
    tags: ["technique", "vietnamese", "seasoning", "chef-tu"],
    relatedRecipeSlug: "tu-nuoc-cham",
    featured: true,
  },
  {
    id: "art-tu-pho-broth",
    category: "articles",
    isPlaceholder: false,
    createdAt: "2026-06-02T10:00:00.000Z",
    slug: "clean-clear-pho-broth",
    kicker: "Chef Tu teaches",
    title: "How to build a clean, clear pho broth",
    excerpt:
      "A great pho broth is judged before you ever taste it — by how clear it is. The clarity isn't luck; it comes from two steps most recipes rush.",
    coverImageUrl: "/food_images/tu_pho_dac_biet.jpg",
    body: [
      "The mark of a serious pho is a broth you can almost read a menu through. Cloudiness comes from scum and rendered impurities boiling back into the liquid, so the whole technique is about getting those out and keeping them out.",
      "First, parboil the bones. Cover them with cold water, bring to a hard boil for a few minutes, then dump that water and rinse the bones clean. It feels wasteful, but that first grey water is exactly the gunk that would otherwise cloud your pot for the next six hours. Start the real broth with fresh cold water.",
      "Second, char your aromatics. Blacken halved onions and a knob of ginger directly over a flame or under the broiler until the edges are truly charred, not just warm. That char is where pho gets its smoky depth and amber colour. Toast your spices — star anise, cinnamon, clove, coriander — in a dry pan until fragrant before they go in.",
      "Then protect the clarity: keep the pot at a bare simmer, never a rolling boil, and skim the surface patiently for the first hour. A boil emulsifies the fat back into the liquid; a simmer lets it rise so you can lift it off. Season with fish sauce and a little rock sugar near the end, and taste for balance.",
      "Low and slow, skimmed and patient — that's the whole secret. The broth tells the truth about how you treated it.",
    ],
    authorId: "expert-tu-david-phu",
    readMinutes: 5,
    tags: ["technique", "vietnamese", "pho", "broth", "chef-tu"],
    relatedRecipeSlug: "tu-pho-ga",
  },
  {
    id: "art-tu-nuoc-cham",
    category: "articles",
    isPlaceholder: false,
    createdAt: "2026-06-03T10:00:00.000Z",
    slug: "nuoc-cham-the-balance",
    kicker: "Chef Tu teaches",
    title: "Nước chấm: learn the balance, ditch the recipe",
    excerpt:
      "The dipping sauce on every Vietnamese table is really a lesson in balance. Once you can taste the four forces against each other, you'll never need to measure again.",
    coverImageUrl: "/food_images/tu_nuoc_cham.jpg",
    body: [
      "Nước chấm is the little bowl of magic that ties a Vietnamese meal together, and it's the best place to learn to cook by taste. It's a balance of four things: salty (fish sauce), sour (lime), sweet (sugar), and heat (chili), loosened with water and lifted with garlic.",
      "Start with a base of warm water and sugar so the sugar dissolves, then build the balance in this order: fish sauce until it's pleasantly salty, lime until it's bright, and chili and garlic to finish. The water is not an afterthought — it's what turns a harsh, concentrated mix into something you can spoon over a whole plate.",
      "Adjust to what it's serving. A dip for rich grilled pork wants to be sharper and more sour to cut the fat; a sauce for delicate fresh rolls wants to be gentler and rounder. The 'right' ratio changes with the dish, which is exactly why memorizing one recipe holds you back.",
      "Taste it on a piece of the food it's meant for, not off the spoon — sauce always reads differently against rice or herbs than it does alone. Chase the point where no single flavour wins. That balance, not a measurement, is the recipe.",
    ],
    authorId: "expert-tu-david-phu",
    readMinutes: 4,
    tags: ["technique", "vietnamese", "sauce", "balance", "chef-tu"],
    relatedRecipeSlug: "tu-nuoc-cham",
  },
];
