/**
 * imageSrc — single source-of-truth for food / content image URLs.
 *
 * Stage 2 W15 prep (autonomous-prep stub). When the founder provisions
 * a Cloudflare R2 bucket and sets the `R2_BASE_URL` (or
 * `NEXT_PUBLIC_R2_BASE_URL`) env var, every image request flips from
 * `/public/...` to the CDN URL with zero call-site changes.
 *
 * Until then, the helper passes paths through unchanged so the local
 * `/public/food_images/*.png` and `/public/content/<slug>/*.webp`
 * assets keep working.
 *
 * Usage:
 *   <Image src={imageSrc("/food_images/butter_chicken.png")} ... />
 *   <Image src={imageSrc(reel.posterImageUrl)} ... />
 *
 * Pure function. SSR-safe. No side effects.
 */

const R2_BASE_URL =
  // Server-side: read from CLOUDFLARE / R2 secret-style env var.
  (typeof process !== "undefined" ? process.env.R2_BASE_URL : undefined) ??
  // Client-side: only NEXT_PUBLIC_ prefix is exposed to the browser.
  (typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_R2_BASE_URL
    : undefined) ??
  null;

export function imageSrc(localPath: string): string {
  if (!localPath) return localPath;
  // Already absolute (http(s) or data: or blob:) — pass through.
  if (
    localPath.startsWith("http://") ||
    localPath.startsWith("https://") ||
    localPath.startsWith("data:") ||
    localPath.startsWith("blob:")
  ) {
    return localPath;
  }
  if (!R2_BASE_URL) return localPath;
  // Trim leading slash so join is clean regardless of whether the
  // R2_BASE_URL ends with a slash.
  const trimmed = localPath.startsWith("/") ? localPath.slice(1) : localPath;
  const base = R2_BASE_URL.endsWith("/") ? R2_BASE_URL : `${R2_BASE_URL}/`;
  return `${base}${trimmed}`;
}

/** Whether R2 is currently active. Used by upload paths + dashboards. */
export function isR2Configured(): boolean {
  return R2_BASE_URL !== null;
}
