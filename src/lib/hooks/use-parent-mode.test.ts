/**
 * Tests for the pure helpers behind useParentMode.
 *
 * Convention: this repo runs vitest in `node` env (no DOM), so we test
 * the parse/serialize helpers and migration logic, not the React hook
 * itself — matching use-substitution-memory.test.ts.
 */

import { describe, expect, it } from "vitest";
import {
  DEFAULT_PARENT_PROFILE,
  PARENT_MODE_SCHEMA_VERSION,
  PARENT_MODE_STORAGE_KEY,
  parseStoredProfile,
  serializeProfile,
} from "./use-parent-mode";

describe("PARENT_MODE_STORAGE_KEY", () => {
  it("uses a versioned key so future migrations are trivial", () => {
    expect(PARENT_MODE_STORAGE_KEY).toMatch(/v\d+$/);
  });
});

describe("DEFAULT_PARENT_PROFILE", () => {
  it("starts disabled", () => {
    expect(DEFAULT_PARENT_PROFILE.enabled).toBe(false);
  });
  it("defaults ageBand to 4-8 (research §3.2 + plan §9 open-question resolution)", () => {
    expect(DEFAULT_PARENT_PROFILE.ageBand).toBe("4-8");
  });
  it("defaults spiceTolerance to mid-scale 3", () => {
    expect(DEFAULT_PARENT_PROFILE.spiceTolerance).toBe(3);
  });
});

describe("parseStoredProfile", () => {
  it("returns the default when input is null", () => {
    expect(parseStoredProfile(null)).toEqual(DEFAULT_PARENT_PROFILE);
  });

  it("returns the default for malformed JSON", () => {
    expect(parseStoredProfile("{not valid")).toEqual(DEFAULT_PARENT_PROFILE);
  });

  it("returns the default when the schema version is stale", () => {
    const stale = JSON.stringify({
      v: PARENT_MODE_SCHEMA_VERSION - 1,
      profile: {
        enabled: true,
        ageBand: "9-13",
        spiceTolerance: 5,
        enabledAt: "2025-01-01T00:00:00Z",
      },
    });
    expect(parseStoredProfile(stale)).toEqual(DEFAULT_PARENT_PROFILE);
  });

  it("returns the default when profile is missing", () => {
    const missing = JSON.stringify({ v: PARENT_MODE_SCHEMA_VERSION });
    expect(parseStoredProfile(missing)).toEqual(DEFAULT_PARENT_PROFILE);
  });

  it("preserves a valid profile", () => {
    const fresh = JSON.stringify({
      v: PARENT_MODE_SCHEMA_VERSION,
      profile: {
        enabled: true,
        ageBand: "1-3",
        spiceTolerance: 1,
        enabledAt: "2026-05-04T12:00:00.000Z",
      },
    });
    const result = parseStoredProfile(fresh);
    expect(result.enabled).toBe(true);
    expect(result.ageBand).toBe("1-3");
    expect(result.spiceTolerance).toBe(1);
  });

  it("merges partial profile with defaults (forward-compatibility)", () => {
    const partial = JSON.stringify({
      v: PARENT_MODE_SCHEMA_VERSION,
      profile: { enabled: true, enabledAt: "2026-05-04T12:00:00.000Z" },
    });
    const result = parseStoredProfile(partial);
    expect(result.enabled).toBe(true);
    expect(result.ageBand).toBe(DEFAULT_PARENT_PROFILE.ageBand);
    expect(result.spiceTolerance).toBe(DEFAULT_PARENT_PROFILE.spiceTolerance);
  });
});

describe("serializeProfile / parseStoredProfile round-trip", () => {
  it("survives encode -> decode without loss", () => {
    const original = {
      ...DEFAULT_PARENT_PROFILE,
      enabled: true,
      ageBand: "9-13" as const,
      spiceTolerance: 4 as const,
      enabledAt: "2026-05-04T12:34:56.000Z",
    };
    expect(parseStoredProfile(serializeProfile(original))).toEqual(original);
  });
});
