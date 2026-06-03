/**
 * SEO helpers for guided-cook dishes — Schema.org/Recipe structured data
 * (JSON-LD) and per-dish page metadata.
 *
 * Server-only by convention: this pulls the full guided-cook-steps catalog
 * (~599KB) to read step text + ingredients, so it must NEVER be imported by a
 * Client Component (that would ship the catalog to the browser). It is imported
 * by the cook/[slug] server layout, the gift server page, sitemap.ts, and the
 * unit test only.
 *
 * Why this exists: Sous is a recipe app, and a recipe app with no Recipe
 * structured data forfeits Google rich results (recipe cards, cook time, star
 * eligibility) for every guided cook. The data already lives in the catalog —
 * this just exposes it in the shape crawlers expect. No invented content
 * (CLAUDE.md rule 7): every field is read straight from the existing dish data.
 */

import type { Metadata } from "next";
import {
  getStaticCookData,
  getStaticMealCookData,
  type StaticDishData,
} from "@/data/guided-cook-steps";

/** Canonical site origin. Mirrors the root layout's metadataBase. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sous.vercel.app"
).replace(/\/$/, "");

/** Resolve a cook slug to its dish data, plus whether it is a side or a main.
 *  Side-first precedence matches the gift page and the cook flow. */
export function resolveDish(
  slug: string,
): { dish: StaticDishData; kind: "side" | "main" } | null {
  const asSide = getStaticCookData(slug);
  if (asSide) return { dish: asSide, kind: "side" };
  const asMain = getStaticMealCookData(slug);
  if (asMain) return { dish: asMain, kind: "main" };
  return null;
}

/** Minutes → ISO-8601 duration (PT#M), or undefined for non-positive input so
 *  the field can be omitted rather than emitting an invalid "PT0M". */
export function isoDuration(minutes: number): string | undefined {
  if (!Number.isFinite(minutes) || minutes <= 0) return undefined;
  return `PT${Math.round(minutes)}M`;
}

/** Make a repo-relative asset path absolute for JSON-LD (which, unlike Next
 *  Metadata, does not resolve against metadataBase). */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Build a Schema.org/Recipe JSON-LD object for a cook slug, or null if the slug
 * is not a real guided cook. Only emits fields backed by real data.
 */
export function buildRecipeJsonLd(
  slug: string,
): Record<string, unknown> | null {
  const resolved = resolveDish(slug);
  if (!resolved) return null;
  const { dish, kind } = resolved;

  const prepTime = isoDuration(dish.prepTimeMinutes);
  const cookTime = isoDuration(dish.cookTimeMinutes);
  const totalTime = isoDuration(
    (dish.prepTimeMinutes || 0) + (dish.cookTimeMinutes || 0),
  );

  const recipeIngredient = dish.ingredients
    .map((i) => [i.quantity, i.name].filter(Boolean).join(" ").trim())
    .filter(Boolean);

  const recipeInstructions = dish.steps
    .filter((s) => s.instruction.trim().length > 0)
    .map((s) => ({
      "@type": "HowToStep",
      position: s.stepNumber,
      text: s.instruction.trim(),
    }));

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: dish.name,
    description: dish.description,
    recipeCategory: kind === "side" ? "Side dish" : "Main course",
    recipeCuisine: dish.cuisineFamily,
    author: { "@type": "Organization", name: "Sous" },
    url: `${SITE_URL}/cook/${slug}`,
  };

  if (dish.heroImageUrl) jsonLd.image = [absoluteUrl(dish.heroImageUrl)];
  if (dish.flavorProfile?.length)
    jsonLd.keywords = dish.flavorProfile.join(", ");
  if (prepTime) jsonLd.prepTime = prepTime;
  if (cookTime) jsonLd.cookTime = cookTime;
  if (totalTime) jsonLd.totalTime = totalTime;
  if (recipeIngredient.length) jsonLd.recipeIngredient = recipeIngredient;
  if (recipeInstructions.length) jsonLd.recipeInstructions = recipeInstructions;

  return jsonLd;
}

/**
 * Build per-dish page Metadata (title / description / OpenGraph / Twitter /
 * canonical) for a cook slug, or null if the slug is not a real dish so the
 * caller can fall back to the site defaults. Image URLs stay relative — Next
 * resolves them against the root layout's metadataBase.
 */
export function buildDishMetadata(slug: string): Metadata | null {
  const resolved = resolveDish(slug);
  if (!resolved) return null;
  const { dish } = resolved;

  const image = dish.heroImageUrl ?? "/og-image.png";
  const ogTitle = `${dish.name}  -  Sous`;

  return {
    title: `${dish.name}  -  Guided Recipe | Sous`,
    description: dish.description,
    alternates: { canonical: `/cook/${slug}` },
    openGraph: {
      title: ogTitle,
      description: dish.description,
      type: "article",
      images: [{ url: image, alt: dish.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: dish.description,
      images: [image],
    },
  };
}
