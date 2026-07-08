import { sanitiseSlugForUrl, type SharePayload } from "./cook-deeplink";

const DEFAULT_ORIGIN = "https://sous.app";

export type RecipeGiftSource = "win" | "friends" | "pod";

export interface RecipeGiftOptions {
  slug: string;
  fromName?: string | null;
  stars?: number | null;
  source?: RecipeGiftSource;
}

export interface RecipeGiftUrlOptions extends RecipeGiftOptions {
  origin?: string;
}

export interface RecipeGiftPayload extends SharePayload {
  source: RecipeGiftSource;
  stars: number;
  analytics: {
    dishSlug: string;
    source: RecipeGiftSource;
    hasSender: boolean;
    starCount: number;
  };
}

export function normaliseGiftSenderName(
  raw: string | null | undefined,
): string {
  if (!raw) return "A friend";
  const cleaned = raw.replace(/[^\p{L}\p{N}\s'\-]/gu, "").trim();
  return cleaned.slice(0, 24) || "A friend";
}

export function clampGiftStars(
  raw: number | string | null | undefined,
): number {
  if (raw === null || raw === undefined || raw === "") return 0;
  const n = typeof raw === "number" ? raw : Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, Math.trunc(n)));
}

export function normaliseRecipeGiftSource(
  raw: string | null | undefined,
): RecipeGiftSource {
  return raw === "friends" || raw === "pod" ? raw : "win";
}

export function buildRecipeGiftPath(opts: RecipeGiftOptions): string | null {
  const slug = sanitiseSlugForUrl(opts.slug);
  if (!slug) return null;
  const sender = normaliseGiftSenderName(opts.fromName);
  const stars = clampGiftStars(opts.stars);
  const source = opts.source ?? "win";
  const params = new URLSearchParams({ from: sender });
  if (stars > 0) params.set("stars", String(stars));
  if (source !== "win") params.set("src", source);
  return `/gift/${encodeURIComponent(slug)}?${params.toString()}`;
}

export function buildRecipeGiftUrl(opts: RecipeGiftUrlOptions): string | null {
  const path = buildRecipeGiftPath(opts);
  if (!path) return null;
  const origin = (opts.origin ?? DEFAULT_ORIGIN).replace(/\/+$/, "");
  return `${origin}${path}`;
}

export function buildRecipeGiftPayload(opts: {
  slug: string;
  dishName: string;
  fromName?: string | null;
  stars?: number | null;
  source?: RecipeGiftSource;
  origin?: string;
}): RecipeGiftPayload | null {
  const source = opts.source ?? "win";
  const sender = normaliseGiftSenderName(opts.fromName);
  const stars = clampGiftStars(opts.stars);
  const url = buildRecipeGiftUrl({
    slug: opts.slug,
    fromName: sender,
    stars,
    source,
    origin: opts.origin,
  });
  if (!url) return null;
  const dishName = opts.dishName.trim() || "this Sous recipe";
  return {
    url,
    title: `${sender} cooked ${dishName}`,
    text: `${sender} made ${dishName} on Sous. Want to cook it too?`,
    source,
    stars,
    analytics: {
      dishSlug: sanitiseSlugForUrl(opts.slug),
      source,
      hasSender: sender !== "A friend",
      starCount: stars,
    },
  };
}
