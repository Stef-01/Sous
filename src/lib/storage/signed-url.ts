/**
 * R2 signed-URL contract (Y4 W11).
 *
 * Pure helpers for the signed-URL flow used by the photo
 * upload + viewer paths once R2 is configured (Y2 W3 ships the
 * pipeline; W11 layers the time-bounded URL signing contract
 * on top). Two pieces:
 *
 *   - composeSignedUrlPayload: build the deterministic payload
 *     that the real-mode signer will sign. Same input → same
 *     payload string, so test fixtures pin the shape.
 *   - validateSignedUrlExpiry: pure expiry check; the consumer
 *     does NOT need network or crypto to gate stale URLs.
 *
 * Real-mode wire-up: pasting R2 credentials enables the actual
 * AWS-SigV4 signing in the API route. Until then, the photo
 * pipeline stub passes data URIs through unchanged (Y2 W3
 * substrate). The contract here makes the migration mechanical.
 *
 * Pure / dependency-free / deterministic.
 */

export const SIGNED_URL_DEFAULT_EXPIRY_SEC = 60 * 5; // 5 minutes
export const SIGNED_URL_MAX_EXPIRY_SEC = 60 * 60; // 1 hour
export const SIGNED_URL_MIN_EXPIRY_SEC = 30; // 30 seconds

export type SignedUrlMethod = "GET" | "PUT";

export interface SignedUrlPayloadInput {
  /** R2 object key. e.g. "users/u_abc/2026-05-03/cooked.jpg". */
  objectKey: string;
  /** HTTP method the signed URL allows. */
  method: SignedUrlMethod;
  /** Issued-at timestamp (UNIX seconds). Caller passes
   *  Date.now()/1000 floored. Pure to make tests deterministic. */
  issuedAt: number;
  /** TTL in seconds. Clamped to [MIN, MAX] inclusive. */
  expirySec: number;
  /** Bucket name. */
  bucket: string;
}

export interface SignedUrlPayload {
  bucket: string;
  objectKey: string;
  method: SignedUrlMethod;
  issuedAt: number;
  expiresAt: number;
  /** Canonical string used as the signature input — the real-
   *  mode signer hashes this. Stable + sortable. */
  canonical: string;
}

export function clampExpirySec(expirySec: number): number {
  if (!Number.isFinite(expirySec)) return SIGNED_URL_DEFAULT_EXPIRY_SEC;
  const floored = Math.floor(expirySec);
  if (floored < SIGNED_URL_MIN_EXPIRY_SEC) return SIGNED_URL_MIN_EXPIRY_SEC;
  if (floored > SIGNED_URL_MAX_EXPIRY_SEC) return SIGNED_URL_MAX_EXPIRY_SEC;
  return floored;
}

/** Pure: build the deterministic payload-to-sign. */
export function composeSignedUrlPayload(
  input: SignedUrlPayloadInput,
): SignedUrlPayload {
  const expirySec = clampExpirySec(input.expirySec);
  const expiresAt = input.issuedAt + expirySec;
  const canonical = [
    "v1",
    input.bucket,
    input.method,
    input.objectKey,
    String(input.issuedAt),
    String(expiresAt),
  ].join("\n");
  return {
    bucket: input.bucket,
    objectKey: input.objectKey,
    method: input.method,
    issuedAt: input.issuedAt,
    expiresAt,
    canonical,
  };
}

export interface ValidateSignedUrlInput {
  payload: Pick<SignedUrlPayload, "issuedAt" | "expiresAt">;
  /** "Now" in UNIX seconds. */
  now: number;
  /** Optional clock-skew allowance (default 30s). */
  clockSkewSec?: number;
}

/** Pure: is the URL still valid at the supplied time? Allows
 *  symmetric clock skew on both sides. */
export function validateSignedUrlExpiry(
  input: ValidateSignedUrlInput,
): { ok: true } | { ok: false; reason: string } {
  const skew = input.clockSkewSec ?? 30;
  if (!Number.isFinite(input.now)) {
    return { ok: false, reason: "Invalid `now` timestamp." };
  }
  if (input.now < input.payload.issuedAt - skew) {
    return { ok: false, reason: "URL not yet valid (clock skew)." };
  }
  if (input.now > input.payload.expiresAt + skew) {
    return { ok: false, reason: "URL expired." };
  }
  return { ok: true };
}

/** Pure: build the canonical R2 object key. */
export function buildPhotoObjectKey(input: {
  ownerId: string;
  /** ISO YYYY-MM-DD prefix to keep the bucket browseable. */
  dayKey: string;
  /** Logical purpose — "cooked" / "scan" / "avatar". */
  kind: string;
  /** Stable id (e.g. cook-session id). */
  id: string;
  /** Extension (no dot). e.g. "jpg" / "webp". */
  extension: string;
}): string {
  // No leading slash; R2 treats keys as raw strings. The
  // segments are URL-safe by construction.
  return `${input.ownerId}/${input.dayKey}/${input.kind}/${input.id}.${input.extension}`;
}
