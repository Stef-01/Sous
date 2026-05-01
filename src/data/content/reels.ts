/**
 * Reels — sample TikTok-style cooking content for the Content tab.
 *
 * Posters are existing /public/food_images/ files. Creator handles and
 * names are fictional. There is no real video file behind any of these —
 * the player UI is simulated chrome (poster image + play overlay + controls).
 * Replacing this seed with real video content is a Stage-2 workstream.
 */

import type { Reel } from "@/types/content";

export const REELS: Reel[] = [
  {
    id: "reel-tadka-101",
    category: "reels",
    isPlaceholder: true,
    title: "Tadka in 30 seconds",
    posterImageUrl: "/food_images/butter_chicken.png",
    caption:
      "Hot ghee, mustard seeds, curry leaves, then everything else. The whole flavour base of Indian cooking is one minute of work.",
    creatorHandle: "@cookwithpriya",
    creatorName: "Priya R.",
    durationSeconds: 32,
    likes: 18243,
    technique: "tadka",
    dishSlug: "butter-chicken",
    createdAt: "2026-04-29T14:00:00.000Z",
  },
  {
    id: "reel-knife-grip",
    category: "reels",
    isPlaceholder: true,
    title: "The knife grip nobody taught you",
    posterImageUrl: "/food_images/cabbage_salad_tadka.png",
    caption:
      "Pinch the blade, curl the knuckles. Three weeks of practice and your dinner prep gets twice as fast.",
    creatorHandle: "@knifeworkdaily",
    creatorName: "Marco D.",
    durationSeconds: 48,
    likes: 26890,
    technique: "knife-skills",
    createdAt: "2026-04-28T14:00:00.000Z",
  },
  {
    id: "reel-pasta-water",
    category: "reels",
    isPlaceholder: true,
    title: "Why pasta water is gold",
    posterImageUrl: "/food_images/pasta_carbonara.png",
    caption:
      "Starchy water + a knob of butter + parmesan. That's the sauce. Stop pouring this stuff down the drain.",
    creatorHandle: "@nonnasrules",
    creatorName: "Sofia G.",
    durationSeconds: 41,
    likes: 41202,
    technique: "emulsification",
    dishSlug: "pasta-carbonara",
    createdAt: "2026-04-27T14:00:00.000Z",
  },
  {
    id: "reel-rice-rinse",
    category: "reels",
    isPlaceholder: true,
    title: "Rinse your rice. Always.",
    posterImageUrl: "/food_images/jasmine_rice.png",
    caption:
      "Three rinses until the water runs clear. This is the difference between gummy and fluffy. Non-negotiable.",
    creatorHandle: "@ricelaboratory",
    creatorName: "Hana K.",
    durationSeconds: 27,
    likes: 12345,
    technique: "rice",
    createdAt: "2026-04-26T14:00:00.000Z",
  },
  {
    id: "reel-sear-fish",
    category: "reels",
    isPlaceholder: true,
    title: "Crispy-skin salmon, every time",
    posterImageUrl: "/food_images/grilled_salmon.png",
    caption:
      "Pat dry. Cold pan. Skin down with weight on top for the first two minutes. Watch what happens.",
    creatorHandle: "@chefdailybites",
    creatorName: "Owen M.",
    durationSeconds: 55,
    likes: 33108,
    technique: "pan-sear",
    dishSlug: "grilled-salmon",
    createdAt: "2026-04-25T14:00:00.000Z",
  },
  {
    id: "reel-pho-broth",
    category: "reels",
    isPlaceholder: true,
    title: "Pho broth in 20 minutes (yes, really)",
    posterImageUrl: "/food_images/pho.png",
    caption:
      "Charred ginger + onion + a quality stock + the spice sachet. Not ancestral, but a Tuesday-night save.",
    creatorHandle: "@quickbroth",
    creatorName: "Linh T.",
    durationSeconds: 60,
    likes: 21987,
    technique: "broth",
    dishSlug: "pho",
    createdAt: "2026-04-24T14:00:00.000Z",
  },
  {
    id: "reel-tadka-dal",
    category: "reels",
    isPlaceholder: true,
    title: "Dal that doesn't taste like a hospital",
    posterImageUrl: "/food_images/masoor_dal.png",
    caption:
      "The trick is two tadkas. One in the dal, one on top at the end. Most people skip the second.",
    creatorHandle: "@dailydaal",
    creatorName: "Anjali V.",
    durationSeconds: 44,
    likes: 19876,
    technique: "tadka",
    createdAt: "2026-04-23T14:00:00.000Z",
  },
  {
    id: "reel-crispy-tofu",
    category: "reels",
    isPlaceholder: true,
    title: "Tofu so crispy it crackles",
    posterImageUrl: "/food_images/tofu_bhurji.png",
    caption:
      "Press it. Cornstarch coating. Hot oil. Don't move it. Three rules.",
    creatorHandle: "@plantkitchen",
    creatorName: "Wei L.",
    durationSeconds: 38,
    likes: 28432,
    technique: "shallow-fry",
    createdAt: "2026-04-22T14:00:00.000Z",
  },
];

export function getReelById(id: string): Reel | undefined {
  return REELS.find((r) => r.id === id);
}
