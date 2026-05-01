/**
 * Expert Voices — fictional sample profiles for the Content tab.
 *
 * Names, credentials, and affiliations are placeholders. The "(sample)"
 * suffix on every affiliation is intentional and load-bearing — it keeps
 * the prototype honest until a real editorial workstream replaces this seed.
 */

import type { ExpertVoice } from "@/types/content";

export const EXPERT_VOICES: ExpertVoice[] = [
  {
    id: "expert-maya-patel",
    category: "experts",
    isPlaceholder: true,
    title: "Maya Patel, RD",
    slug: "maya-patel",
    name: "Maya Patel",
    credential: "RD, MS",
    affiliation: "Bay Area Lifestyle Medicine (sample)",
    bio: "Plant-forward dietitian focused on practical home cooking for South Asian families. Writes about how cultural foods already do most of the nutrition work — no kale required.",
    avatarUrl: "/food_images/butter_chicken.png",
    createdAt: "2026-04-12T10:00:00.000Z",
    articleIds: ["art-myth-carbs", "art-spice-as-medicine"],
  },
  {
    id: "expert-david-chen",
    category: "experts",
    isPlaceholder: true,
    title: "David Chen, MD",
    slug: "david-chen",
    name: "David Chen",
    credential: "MD, Internal Medicine",
    affiliation: "Pacific Coast Health Group (sample)",
    bio: "Internist who spends half his clinic hours talking about food. Convinced that the best cardiovascular intervention is a stocked pantry and twenty minutes.",
    avatarUrl: "/food_images/grilled_salmon.png",
    createdAt: "2026-04-13T10:00:00.000Z",
    articleIds: ["art-blood-pressure-pantry", "art-protein-debate"],
  },
  {
    id: "expert-leila-haddad",
    category: "experts",
    isPlaceholder: true,
    title: "Leila Haddad, RDN",
    slug: "leila-haddad",
    name: "Leila Haddad",
    credential: "RDN, CDCES",
    affiliation: "Mediterranean Nutrition Collective (sample)",
    bio: "Diabetes educator and Levantine home cook. Writes about glycemic balance through the lens of mezze, beans, and olive oil — not protein bars.",
    avatarUrl: "/food_images/falafel_wrap.png",
    createdAt: "2026-04-14T10:00:00.000Z",
    articleIds: ["art-diabetes-mezze"],
  },
  {
    id: "expert-jordan-rivera",
    category: "experts",
    isPlaceholder: true,
    title: "Jordan Rivera, RD",
    slug: "jordan-rivera",
    name: "Jordan Rivera",
    credential: "RD, CSSD",
    affiliation: "Sports & Performance Nutrition Lab (sample)",
    bio: "Sports dietitian who quietly believes the average home cook eats better than most pro athletes. Translates training-table principles into weeknight dinners.",
    avatarUrl: "/food_images/chicken_shawarma.png",
    createdAt: "2026-04-15T10:00:00.000Z",
    articleIds: ["art-protein-debate", "art-rest-day-fueling"],
  },
];

export function getExpertById(id: string): ExpertVoice | undefined {
  return EXPERT_VOICES.find((e) => e.id === id);
}

export function getExpertBySlug(slug: string): ExpertVoice | undefined {
  return EXPERT_VOICES.find((e) => e.slug === slug);
}
