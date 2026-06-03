import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/recipe";

/**
 * robots.txt — allow crawling, point to the sitemap. The gift links carry
 * user names/ratings in query strings, so disallow the /gift path from being
 * indexed (the canonical recipe lives at /cook/[slug]). Served at /robots.txt.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/gift/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
