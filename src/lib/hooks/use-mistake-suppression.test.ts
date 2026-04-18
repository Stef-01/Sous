import { describe, it, expect } from "vitest";
import {
  MISTAKE_STORAGE_KEY,
  mistakeSuppressionKey,
  normalizeSuppressionPayload,
} from "./use-mistake-suppression";

describe("mistakeSuppressionKey", () => {
  it("scopes the key per dish + mistake", () => {
    expect(mistakeSuppressionKey("pad-thai", "step-3")).toBe(
      "pad-thai::step-3",
    );
  });
});

describe("MISTAKE_STORAGE_KEY", () => {
  it("uses a versioned storage key", () => {
    expect(MISTAKE_STORAGE_KEY).toMatch(/v\d+$/);
  });
});

describe("normalizeSuppressionPayload", () => {
  const now = new Date("2026-04-16T00:00:00Z").getTime();
  const recent = new Date("2026-04-10T00:00:00Z").toISOString(); // ~6 days
  const expired = new Date("2025-09-01T00:00:00Z").toISOString(); // > 180d

  it("returns {} for invalid payloads", () => {
    expect(normalizeSuppressionPayload(null, now)).toEqual({});
    expect(normalizeSuppressionPayload("bad", now)).toEqual({});
    expect(normalizeSuppressionPayload([], now)).toEqual({});
  });

  it("keeps recent suppressions", () => {
    const result = normalizeSuppressionPayload(
      { "pad-thai::step-3": recent },
      now,
    );
    expect(result).toEqual({ "pad-thai::step-3": recent });
  });

  it("drops suppressions older than 180 days", () => {
    const result = normalizeSuppressionPayload(
      { "pad-thai::step-3": expired },
      now,
    );
    expect(result).toEqual({});
  });

  it("drops malformed entries", () => {
    const result = normalizeSuppressionPayload(
      {
        garbage: 123,
        invalid: "not-a-date",
        good: recent,
      },
      now,
    );
    expect(Object.keys(result)).toEqual(["good"]);
  });
});
