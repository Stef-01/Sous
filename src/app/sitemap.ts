import type { MetadataRoute } from "next";
import {
  getAvailableCookSlugs,
  getAvailableMealCookSlugs,
} from "@/data/guided-cook-steps";
import { SITE_URL } from "@/lib/seo/recipe";

/**
 * Sitemap — the static top-level routes plus every guided-cook page, so
 * crawlers can discover the recipe pages that carry Schema.org/Recipe markup.
 * Served at /sitemap.xml by Next's App Router.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/today`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/path`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/community`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/games`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const cookSlugs = Array.from(
    new Set([...getAvailableCookSlugs(), ...getAvailableMealCookSlugs()]),
  ).sort();

  const cookRoutes: MetadataRoute.Sitemap = cookSlugs.map((slug) => ({
    url: `${SITE_URL}/cook/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...cookRoutes];
}
