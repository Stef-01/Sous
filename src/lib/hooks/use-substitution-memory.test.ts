import { describe, it, expect } from "vitest";
import {
  normalizeSubMemoryPayload,
  subMemoryKey,
  SUBSTITUTION_STORAGE_KEY,
} from "./use-substitution-memory";

describe("subMemoryKey", () => {
  it("joins dish and ingredient with :: separator", () => {
    expect(subMemoryKey("pad-thai", "fish-sauce")).toBe("pad-thai::fish-sauce");
  });
});

describe("SUBSTITUTION_STORAGE_KEY", () => {
  it("uses a versioned key so future migrations are trivial", () => {
    expect(SUBSTITUTION_STORAGE_KEY).toMatch(/v\d+$/);
  });
});

describe("normalizeSubMemoryPayload", () => {
  const now = new Date("2026-04-16T00:00:00Z").getTime();
  const recent = new Date("2026-04-10T00:00:00Z").toISOString();
  const expired = new Date("2025-01-01T00:00:00Z").toISOString();

  it("returns empty object for non-object input", () => {
    expect(normalizeSubMemoryPayload(null, now)).toEqual({});
    expect(normalizeSubMemoryPayload("nope", now)).toEqual({});
    expect(normalizeSubMemoryPayload([1, 2, 3], now)).toEqual({});
  });

  it("keeps valid, recent entries", () => {
    const result = normalizeSubMemoryPayload(
      {
        "pad-thai::fish-sauce": { sub: "soy + lime", at: recent },
      },
      now,
    );
    expect(result).toEqual({
      "pad-thai::fish-sauce": { sub: "soy + lime", at: recent },
    });
  });

  it("drops entries older than 90 days", () => {
    const result = normalizeSubMemoryPayload(
      {
        "pad-thai::fish-sauce": { sub: "soy + lime", at: expired },
      },
      now,
    );
    expect(result).toEqual({});
  });

  it("drops malformed entries and keeps good ones", () => {
    const result = normalizeSubMemoryPayload(
      {
        bad1: null,
        bad2: { sub: 123, at: recent },
        bad3: { sub: "x", at: "not-a-date" },
        good: { sub: "yogurt", at: recent },
      },
      now,
    );
    expect(Object.keys(result)).toEqual(["good"]);
    expect(result.good).toEqual({ sub: "yogurt", at: recent });
  });
});
