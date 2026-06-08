/**
 * W12 — Ayurvedic Kitchen: Content-tab spotlights for the evidence-backed
 * culinary herbs. Same honesty rails as the nutrient spotlights — traditional use
 * AND modern evidence stated separately, hedged, no cure/disease claims, food-vs-
 * supplement-dose caveat, `isPlaceholder: true` until editorial review. Covers
 * reuse existing food_images only (rule 7). The full herb index lives in the
 * Profile "Ayurvedic lens"; these are the readable deep-dives.
 */

import type { Article } from "@/types/content";

export const AYURVEDIC_ARTICLES: Article[] = [
  {
    id: "ayur-turmeric",
    category: "articles",
    isPlaceholder: true,
    slug: "turmeric-the-evidence-behind-the-gold",
    kicker: "Ayurvedic kitchen",
    title: "Turmeric (Haridra): what the trials actually show",
    excerpt:
      "Ayurveda's golden anti-inflammatory has real RCT support — with one big caveat about dose.",
    coverImageUrl: "/food_images/butter_chicken.png",
    body: [
      "In Ayurveda, turmeric (Haridra) is a warming anti-inflammatory used for joints, skin, and digestion.",
      "Modern evidence backs part of that: network meta-analyses of ~16 randomised trials find turmeric/curcumin EXTRACTS ease knee osteoarthritis pain, in some studies comparably to NSAIDs.",
      "The catch: those benefits used concentrated extracts paired with black pepper — far more than a pinch in curry. In the kitchen, turmeric is a flavourful, gently beneficial spice; it is not a substitute for treatment.",
    ],
    authorId: "expert-maya-patel",
    readMinutes: 4,
    tags: ["ayurvedic-kitchen", "turmeric", "anti-inflammatory"],
    createdAt: "2026-06-04T09:00:00.000Z",
    relatedRecipeSlug: "butter-chicken",
  },
  {
    id: "ayur-fenugreek",
    category: "articles",
    isPlaceholder: true,
    slug: "fenugreek-methi-and-blood-sugar",
    kicker: "Ayurvedic kitchen",
    title: "Fenugreek (Methi) and blood sugar",
    excerpt:
      "A bitter green with meta-analysis support for glucose — mostly at higher doses.",
    coverImageUrl: "/food_images/eggplant_methi.png",
    body: [
      "Methi (fenugreek) is a staple Ayurvedic digestive, used for centuries for blood sugar and lactation.",
      "Meta-analyses of randomised trials show fenugreek lowers fasting glucose and HbA1c — but mainly at medium-to-high doses in people with diabetes, and the studies vary.",
      "As food it's a tasty, fibre-rich addition. If you take diabetes medication, larger medicinal doses can stack with it — worth a word with your clinician.",
    ],
    authorId: "expert-maya-patel",
    readMinutes: 3,
    tags: ["ayurvedic-kitchen", "fenugreek", "blood-sugar"],
    createdAt: "2026-06-02T09:00:00.000Z",
  },
  {
    id: "ayur-cumin",
    category: "articles",
    isPlaceholder: true,
    slug: "cumin-jeera-the-everyday-digestive",
    kicker: "Ayurvedic kitchen",
    title: "Cumin (Jeera): the everyday digestive",
    excerpt:
      "Beloved in Ayurveda for digestion — the modern evidence is early but real.",
    coverImageUrl: "/food_images/jeera_rice.png",
    body: [
      "Jeera (cumin) is one of the most-used Ayurvedic spices, traditionally a digestive (deepana) tempered into almost everything.",
      "Modern research is still early: small randomised trials hint at modest improvements in lipids and blood sugar, but the evidence base is thin — treat it as promising, not proven.",
      "Either way it's a warm, aromatic, food-safe spice that makes whole-food cooking taste better — which is its own kind of win.",
    ],
    authorId: "expert-maya-patel",
    readMinutes: 3,
    tags: ["ayurvedic-kitchen", "cumin", "digestion"],
    createdAt: "2026-05-31T09:00:00.000Z",
  },
];
