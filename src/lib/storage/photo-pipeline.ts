/**
 * Photo upload pipeline — pure substrate (Y2 Sprint A W3).
 *
 * Stub-mode V1 ships everything except the actual R2 fetch:
 * pure helpers for content-type validation, key composition,
 * size bounds, and the runtime flag that toggles real-vs-stub.
 *
 * The API route (`src/app/api/upload/photo/route.ts`) lands when
 * R2 credentials are configured per
 * `docs/FOUNDER-UNLOCK-RUNBOOK.md` entry #2. Until then, photo
 * upload paths use the stub passthrough — data URIs land on
 * localStorage as-is, and the resolver returns them unchanged.
 *
 * Pure / dependency-free.
 */

/** R2 runtime flag. True iff the bucket name + access key are
 *  configured. Mirrors the auth-flag pattern from W1. */
export interface R2Env {
  R2_BUCKET_NAME?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_PUBLIC_DOMAIN?: string;
}

export function isR2EnabledIn(env: R2Env): boolean {
  return Boolean(
    env.R2_BUCKET_NAME &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_PUBLIC_DOMAIN,
  );
}

export function isR2Enabled(): boolean {
  if (typeof process === "undefined") return false;
  return isR2EnabledIn({
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_PUBLIC_DOMAIN: process.env.R2_PUBLIC_DOMAIN,
  });
}

// ── Content-type allowlist ──────────────────────────────────

/** Photo formats the upload pipeline accepts. WebP preferred for
 *  size; JPEG / PNG for compatibility. No HEIC (Safari-only +
 *  patent encumbrance). */
export const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

export function isAllowedContentType(
  contentType: string,
): contentType is AllowedContentType {
  return (ALLOWED_CONTENT_TYPES as readonly string[]).includes(contentType);
}

// ── Size bounds ─────────────────────────────────────────────

/** Hard cap on uploaded photo bytes. 5 MB is generous for a
 *  cooked-dish photo at 1080p; the client-side compressor in
 *  `compressBeforeUpload` (Y2 W3 follow-on) targets <500 KB. */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Floor — defends against empty / zero-byte uploads. */
export const MIN_PHOTO_BYTES = 1024;

export function isPhotoSizeAllowed(bytes: number): boolean {
  if (!Number.isFinite(bytes)) return false;
  return bytes >= MIN_PHOTO_BYTES && bytes <= MAX_PHOTO_BYTES;
}

// ── Key composition ─────────────────────────────────────────

/** Sanitise a filename for inclusion in an object key. Removes
 *  path separators, control chars, and non-portable characters.
 *  Caps at 80 chars. */
export function sanitiseFilenameForKey(filename: string): string {
  if (typeof filename !== "string") return "untitled";
  const cleaned = filename
    .replace(/\\/g, "/")
    .split("/")
    .pop()!
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
  return cleaned.length === 0 ? "untitled" : cleaned;
}

export interface PhotoKeyInput {
  /** Logical prefix — e.g. "pod-submissions/<podId>/<weekKey>" or
   *  "user-recipes/<recipeId>". Caller is responsible for
   *  sanitising the prefix segments; this helper joins + trims
   *  trailing slashes. */
  prefix: string;
  /** Original filename (used for the suffix). */
  filename: string;
  /** Optional millisecond timestamp for uniqueness. Defaults to
   *  Date.now(). Pure-overridable for tests. */
  now?: number;
}

/** Compose a deterministic photo key. Format:
 *  `<prefix>/<unix-ms>-<sanitised-filename>`. Uniqueness comes
 *  from the timestamp + the sanitised filename. */
export function buildPhotoKey(input: PhotoKeyInput): string {
  const prefix = input.prefix.replace(/\/+$/, "").trim();
  const cleanFilename = sanitiseFilenameForKey(input.filename);
  const ts = Number.isFinite(input.now ?? NaN) ? input.now : Date.now();
  return `${prefix}/${ts}-${cleanFilename}`;
}

// ── URL resolution ──────────────────────────────────────────

/** Build the public URL for an uploaded key. When R2 isn't
 *  configured, returns null — the caller should fall back to
 *  the original data URI / placeholder. When configured,
 *  returns `${R2_PUBLIC_DOMAIN}/${key}`. */
export function resolvePhotoUrl(key: string, env?: R2Env): string | null {
  const e =
    env ??
    (typeof process !== "undefined"
      ? {
          R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
          R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
          R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
          R2_PUBLIC_DOMAIN: process.env.R2_PUBLIC_DOMAIN,
        }
      : {});
  if (!isR2EnabledIn(e) || !key) return null;
  const domain = e.R2_PUBLIC_DOMAIN!.replace(/\/+$/, "");
  return `${domain}/${key.replace(/^\/+/, "")}`;
}

/** Stub-mode passthrough. When R2 is off, photo URIs are
 *  data: / placeholder strings on the client; the pod gallery
 *  renders them via the existing `<Image unoptimized />` path.
 *  When R2 is on, the pipeline rewrites them to public URLs at
 *  upload time. This helper unifies both paths into a single
 *  string the gallery component renders without branching. */
export function resolvePublicUriForGallery(
  storedUri: string,
  env?: R2Env,
): string {
  // If the stored URI is already a public URL or data URI, return
  // as-is. Only object keys (no scheme) get rewritten.
  if (
    storedUri.startsWith("data:") ||
    storedUri.startsWith("http://") ||
    storedUri.startsWith("https://")
  ) {
    return storedUri;
  }
  const resolved = resolvePhotoUrl(storedUri, env);
  return resolved ?? storedUri;
}
