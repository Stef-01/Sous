import { describe, expect, it } from "vitest";
import {
  ALLOWED_CONTENT_TYPES,
  MAX_PHOTO_BYTES,
  MIN_PHOTO_BYTES,
  buildPhotoKey,
  isAllowedContentType,
  isPhotoSizeAllowed,
  isR2EnabledIn,
  resolvePhotoUrl,
  resolvePublicUriForGallery,
  sanitiseFilenameForKey,
} from "./photo-pipeline";

// ── isR2EnabledIn ──────────────────────────────────────────

describe("isR2EnabledIn", () => {
  it("returns false when no env vars set", () => {
    expect(isR2EnabledIn({})).toBe(false);
  });

  it("requires all four env vars", () => {
    expect(
      isR2EnabledIn({
        R2_BUCKET_NAME: "sous",
        R2_ACCESS_KEY_ID: "k",
        R2_SECRET_ACCESS_KEY: "s",
      }),
    ).toBe(false);
    expect(
      isR2EnabledIn({
        R2_BUCKET_NAME: "sous",
        R2_ACCESS_KEY_ID: "k",
        R2_PUBLIC_DOMAIN: "https://photos.sous.app",
      }),
    ).toBe(false);
    expect(
      isR2EnabledIn({
        R2_BUCKET_NAME: "sous",
        R2_SECRET_ACCESS_KEY: "s",
        R2_PUBLIC_DOMAIN: "https://photos.sous.app",
      }),
    ).toBe(false);
  });

  it("returns true when all four are set", () => {
    expect(
      isR2EnabledIn({
        R2_BUCKET_NAME: "sous",
        R2_ACCESS_KEY_ID: "k",
        R2_SECRET_ACCESS_KEY: "s",
        R2_PUBLIC_DOMAIN: "https://photos.sous.app",
      }),
    ).toBe(true);
  });
});

// ── content type allowlist ─────────────────────────────────

describe("isAllowedContentType", () => {
  it("accepts the three documented types", () => {
    expect(isAllowedContentType("image/jpeg")).toBe(true);
    expect(isAllowedContentType("image/png")).toBe(true);
    expect(isAllowedContentType("image/webp")).toBe(true);
  });

  it("rejects HEIC + GIF + everything else", () => {
    expect(isAllowedContentType("image/heic")).toBe(false);
    expect(isAllowedContentType("image/gif")).toBe(false);
    expect(isAllowedContentType("application/pdf")).toBe(false);
    expect(isAllowedContentType("")).toBe(false);
  });

  it("ALLOWED_CONTENT_TYPES is a 3-tuple of allowed types", () => {
    expect(ALLOWED_CONTENT_TYPES).toHaveLength(3);
    for (const t of ALLOWED_CONTENT_TYPES) {
      expect(t.startsWith("image/")).toBe(true);
    }
  });
});

// ── size bounds ────────────────────────────────────────────

describe("isPhotoSizeAllowed", () => {
  it("accepts inside bounds", () => {
    expect(isPhotoSizeAllowed(50_000)).toBe(true);
    expect(isPhotoSizeAllowed(MIN_PHOTO_BYTES)).toBe(true);
    expect(isPhotoSizeAllowed(MAX_PHOTO_BYTES)).toBe(true);
  });

  it("rejects too small", () => {
    expect(isPhotoSizeAllowed(0)).toBe(false);
    expect(isPhotoSizeAllowed(MIN_PHOTO_BYTES - 1)).toBe(false);
  });

  it("rejects too big", () => {
    expect(isPhotoSizeAllowed(MAX_PHOTO_BYTES + 1)).toBe(false);
  });

  it("rejects NaN / Infinity", () => {
    expect(isPhotoSizeAllowed(Number.NaN)).toBe(false);
    expect(isPhotoSizeAllowed(Number.POSITIVE_INFINITY)).toBe(false);
  });
});

// ── filename sanitisation ──────────────────────────────────

describe("sanitiseFilenameForKey", () => {
  it("preserves safe filenames", () => {
    expect(sanitiseFilenameForKey("photo-123.jpg")).toBe("photo-123.jpg");
  });

  it("lowercases", () => {
    expect(sanitiseFilenameForKey("PHOTO.JPG")).toBe("photo.jpg");
  });

  it("strips path traversal attempts", () => {
    expect(sanitiseFilenameForKey("../../etc/passwd")).toBe("passwd");
    expect(sanitiseFilenameForKey("/abs/path/photo.jpg")).toBe("photo.jpg");
    expect(sanitiseFilenameForKey("..\\windows\\file.jpg")).toBe("file.jpg");
  });

  it("collapses runs of unsafe chars", () => {
    expect(sanitiseFilenameForKey("my photo!!!.jpg")).toBe("my-photo-.jpg");
  });

  it("caps at 80 chars", () => {
    const long = "a".repeat(150) + ".jpg";
    expect(sanitiseFilenameForKey(long).length).toBeLessThanOrEqual(80);
  });

  it("strips emoji-only basename, keeps extension", () => {
    // "🍝🥗.jpg" → emojis are non-portable chars and collapse;
    // extension survives. Caller gets a safe (if minimal) name.
    expect(sanitiseFilenameForKey("🍝🥗.jpg")).toBe("jpg");
  });

  it("falls back to 'untitled' when entire string sanitises to empty", () => {
    expect(sanitiseFilenameForKey("🍝")).toBe("untitled");
    expect(sanitiseFilenameForKey("...")).toBe("untitled");
  });

  it("falls back to 'untitled' on non-string", () => {
    expect(sanitiseFilenameForKey(null as unknown as string)).toBe("untitled");
  });
});

// ── buildPhotoKey ──────────────────────────────────────────

describe("buildPhotoKey", () => {
  it("composes prefix/<ts>-<filename>", () => {
    expect(
      buildPhotoKey({
        prefix: "pod-submissions/pod-1/2026-W18",
        filename: "cook.jpg",
        now: 1714579200000,
      }),
    ).toBe("pod-submissions/pod-1/2026-W18/1714579200000-cook.jpg");
  });

  it("strips trailing slashes from prefix", () => {
    expect(
      buildPhotoKey({
        prefix: "pods///",
        filename: "x.jpg",
        now: 0,
      }),
    ).toBe("pods/0-x.jpg");
  });

  it("sanitises the filename portion", () => {
    expect(
      buildPhotoKey({
        prefix: "p",
        filename: "../etc/passwd!.jpg",
        now: 100,
      }),
    ).toBe("p/100-passwd-.jpg");
  });

  it("uses Date.now() when 'now' is unset", () => {
    const key = buildPhotoKey({ prefix: "p", filename: "x.jpg" });
    expect(key).toMatch(/^p\/\d+-x\.jpg$/);
  });
});

// ── resolvePhotoUrl ────────────────────────────────────────

describe("resolvePhotoUrl", () => {
  const fullEnv = {
    R2_BUCKET_NAME: "sous",
    R2_ACCESS_KEY_ID: "k",
    R2_SECRET_ACCESS_KEY: "s",
    R2_PUBLIC_DOMAIN: "https://photos.sous.app",
  };

  it("returns null when R2 isn't configured", () => {
    expect(resolvePhotoUrl("a/b.jpg", {})).toBe(null);
  });

  it("returns null on empty key", () => {
    expect(resolvePhotoUrl("", fullEnv)).toBe(null);
  });

  it("composes domain + key", () => {
    expect(resolvePhotoUrl("p/100-x.jpg", fullEnv)).toBe(
      "https://photos.sous.app/p/100-x.jpg",
    );
  });

  it("strips trailing slash from domain + leading slash from key", () => {
    expect(
      resolvePhotoUrl("/p/100-x.jpg", {
        ...fullEnv,
        R2_PUBLIC_DOMAIN: "https://photos.sous.app/",
      }),
    ).toBe("https://photos.sous.app/p/100-x.jpg");
  });
});

// ── resolvePublicUriForGallery ─────────────────────────────

describe("resolvePublicUriForGallery", () => {
  const fullEnv = {
    R2_BUCKET_NAME: "sous",
    R2_ACCESS_KEY_ID: "k",
    R2_SECRET_ACCESS_KEY: "s",
    R2_PUBLIC_DOMAIN: "https://photos.sous.app",
  };

  it("passes data URIs through", () => {
    expect(resolvePublicUriForGallery("data:image/png;base64,abc", {})).toBe(
      "data:image/png;base64,abc",
    );
  });

  it("passes http URLs through", () => {
    expect(
      resolvePublicUriForGallery("https://example.com/photo.jpg", {}),
    ).toBe("https://example.com/photo.jpg");
  });

  it("rewrites object keys to public URLs when R2 is configured", () => {
    expect(resolvePublicUriForGallery("p/100-x.jpg", fullEnv)).toBe(
      "https://photos.sous.app/p/100-x.jpg",
    );
  });

  it("falls back to the stored value when R2 isn't configured", () => {
    expect(resolvePublicUriForGallery("p/100-x.jpg", {})).toBe("p/100-x.jpg");
  });
});
