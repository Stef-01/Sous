import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildDishMetadata, buildRecipeJsonLd } from "@/lib/seo/recipe";

/**
 * Server layout for the guided-cook route. The page itself is a Client
 * Component (interactive cook flow), so it cannot export metadata — this
 * sibling layout supplies dish-specific <title>/OpenGraph and injects the
 * Schema.org/Recipe JSON-LD for crawlers. Both fall back gracefully (site
 * defaults / no script) when the slug is a user-authored recipe or otherwise
 * not in the static catalog.
 */

interface SlugParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: SlugParams): Promise<Metadata> {
  const { slug } = await params;
  return buildDishMetadata(slug) ?? {};
}

export default async function CookSlugLayout({
  children,
  params,
}: SlugParams & { children: ReactNode }) {
  const { slug } = await params;
  const jsonLd = buildRecipeJsonLd(slug);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // Schema.org Recipe markup. JSON.stringify output is safe to inline;
          // all values originate from the static catalog, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
