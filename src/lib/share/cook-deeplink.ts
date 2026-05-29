/**
 * Pure helpers for the W51 sharing surface.
 *
 * Y1 W51 (Recipe Ecosystem V2): "Share" button on the recipe
 * save success toast copies a cook deeplink to clipboard. Y2 W4
 * extends with author-attribution + recipe-detail variants.
 *
 * Three deeplink shapes:
 *   - direct cook: https://sous.app/cook/<slug>
 *   - cook + author attribution: …?author=<name>
 *   - pod-week submission link (Y2): /pod/<id>/week/<week>
 *
 * V1 ships only the direct cook link with optional author param.
 * The other shapes are noted in the doc but unimplemented until
 * the surfaces that need them ship.
 *
 * Pure / dependency-free. Tested without DOM or clipboard API.
 */

const DEFAULT_ORIGIN = "https://sous.app";

/** Strip everything that isn't safe in a URL path slug, keeping
 *  hyphens and lowercase alphanumerics. Already-slug-shaped
 *  strings pass through unchanged. Defensive against slugs
 *  containing unsafe characters from legacy data. */
export function sanitiseSlugForUrl(slug: string): string {
  if (typeof slug !== "string") return "";
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Sanitise an author display name for URL inclusion. Allows
 *  letters, digits, spaces (encoded as +); strips everything
 *  else; caps at 40 chars to match the schema. */
export function sanitiseAuthorParam(name: string): string {
  if (typeof name !== "string") return "";
  return encodeURIComponent(
    name
      .trim()
      .replace(/[^\p{L}\p{N}\s'-]/gu, "")
      .slice(0, 40),
  );
}

export interface CookDeeplinkOptions {
  /** Recipe slug. Required. */
  slug: string;
  /** Optional author display name. When set, appended as
   *  ?author=<encoded-name>. Useful for community / shared
   *  recipes where the recipient should see who shared it. */
  authorDisplayName?: string | null;
  /** Optional override for the origin host. Defaults to the
   *  production sous.app. Useful for tests + dev links. */
  origin?: string;
}

/** Compose a cook deeplink. Returns null when the slug is empty
 *  or sanitises to nothing — the caller decides how to surface
 *  that (toast, disabled button, etc.). */
export function buildCookDeeplink(opts: CookDeeplinkOptions): string | null {
  const slug = sanitiseSlugForUrl(opts.slug);
  if (slug.length === 0) return null;
  const origin = (opts.origin ?? DEFAULT_ORIGIN).replace(/\/+$/, "");
  let url = `${origin}/cook/${slug}`;
  const author = opts.authorDisplayName?.trim();
  if (author) {
    const encoded = sanitiseAuthorParam(author);
    if (encoded.length > 0) url += `?author=${encoded}`;
  }
  return url;
}

/** Compose a copy-to-clipboard payload for the share affordance.
 *  Includes the deeplink + a one-line caption. The caller pipes
 *  this into navigator.clipboard.writeText. */
export interface SharePayload {
  /** The deeplink itself. */
  url: string;
  /** Plain-text body for clipboard / share-sheet. */
  text: string;
  /** Optional title (shown on system share-sheets). */
  title: string;
}

export function buildSharePayload(opts: {
  slug: string;
  recipeTitle: string;
  authorDisplayName?: string | null;
  origin?: string;
}): SharePayload | null {
  const url = buildCookDeeplink({
    slug: opts.slug,
    authorDisplayName: opts.authorDisplayName,
    origin: opts.origin,
  });
  if (!url) return null;
  const titleLabel = opts.recipeTitle.trim() || "Sous recipe";
  const author = opts.authorDisplayName?.trim();
  const text = author
    ? `${titleLabel} — shared by ${author}\n${url}`
    : `${titleLabel}\n${url}`;
  return { url, text, title: titleLabel };
}
