import { describe, expect, it } from "vitest";
import {
  buildPhotoObjectKey,
  clampExpirySec,
  composeSignedUrlPayload,
  SIGNED_URL_DEFAULT_EXPIRY_SEC,
  SIGNED_URL_MAX_EXPIRY_SEC,
  SIGNED_URL_MIN_EXPIRY_SEC,
  validateSignedUrlExpiry,
} from "./signed-url";

describe("clampExpirySec", () => {
  it("returns default for non-finite input", () => {
    expect(clampExpirySec(Number.NaN)).toBe(SIGNED_URL_DEFAULT_EXPIRY_SEC);
    expect(clampExpirySec(Number.POSITIVE_INFINITY)).toBe(
      SIGNED_URL_DEFAULT_EXPIRY_SEC,
    );
  });

  it("clamps below MIN", () => {
    expect(clampExpirySec(0)).toBe(SIGNED_URL_MIN_EXPIRY_SEC);
    expect(clampExpirySec(-100)).toBe(SIGNED_URL_MIN_EXPIRY_SEC);
  });

  it("clamps above MAX", () => {
    expect(clampExpirySec(SIGNED_URL_MAX_EXPIRY_SEC + 100)).toBe(
      SIGNED_URL_MAX_EXPIRY_SEC,
    );
  });

  it("passes through valid range", () => {
    expect(clampExpirySec(120)).toBe(120);
    expect(clampExpirySec(120.7)).toBe(120); // floor
  });
});

describe("composeSignedUrlPayload", () => {
  it("produces deterministic payload + canonical for same input", () => {
    const input = {
      objectKey: "u_abc/2026-05-03/cooked/cs-1.jpg",
      method: "GET" as const,
      issuedAt: 1_700_000_000,
      expirySec: 300,
      bucket: "sous-photos",
    };
    const a = composeSignedUrlPayload(input);
    const b = composeSignedUrlPayload(input);
    expect(a).toEqual(b);
    expect(a.canonical).toBe(
      "v1\nsous-photos\nGET\nu_abc/2026-05-03/cooked/cs-1.jpg\n1700000000\n1700000300",
    );
  });

  it("computes expiresAt as issuedAt + clamped expiry", () => {
    const out = composeSignedUrlPayload({
      objectKey: "x.jpg",
      method: "PUT",
      issuedAt: 1_000,
      expirySec: 0, // clamps to MIN
      bucket: "b",
    });
    expect(out.expiresAt).toBe(1_000 + SIGNED_URL_MIN_EXPIRY_SEC);
  });
});

describe("validateSignedUrlExpiry", () => {
  const payload = { issuedAt: 1_000, expiresAt: 1_300 };

  it("ok when within window", () => {
    const out = validateSignedUrlExpiry({ payload, now: 1_100 });
    expect(out.ok).toBe(true);
  });

  it("rejects when past expiry beyond skew", () => {
    const out = validateSignedUrlExpiry({
      payload,
      now: 1_400,
      clockSkewSec: 30,
    });
    expect(out.ok).toBe(false);
  });

  it("allows skew tolerance after expiry", () => {
    const out = validateSignedUrlExpiry({
      payload,
      now: 1_310,
      clockSkewSec: 30,
    });
    expect(out.ok).toBe(true);
  });

  it("rejects when before issued beyond skew", () => {
    const out = validateSignedUrlExpiry({
      payload,
      now: 900,
      clockSkewSec: 30,
    });
    expect(out.ok).toBe(false);
  });

  it("rejects non-finite now", () => {
    const out = validateSignedUrlExpiry({ payload, now: Number.NaN });
    expect(out.ok).toBe(false);
  });
});

describe("buildPhotoObjectKey", () => {
  it("composes ownerId/day/kind/id.ext", () => {
    const key = buildPhotoObjectKey({
      ownerId: "u_abc",
      dayKey: "2026-05-03",
      kind: "cooked",
      id: "cs-1",
      extension: "jpg",
    });
    expect(key).toBe("u_abc/2026-05-03/cooked/cs-1.jpg");
  });

  it("does not start with a slash", () => {
    const key = buildPhotoObjectKey({
      ownerId: "u_abc",
      dayKey: "2026-05-03",
      kind: "scan",
      id: "p-1",
      extension: "webp",
    });
    expect(key.startsWith("/")).toBe(false);
  });
});
