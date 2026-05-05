import { describe, expect, it } from "vitest";
import {
  DEFAULT_ECO_PROFILE,
  ECO_MODE_SCHEMA_VERSION,
  parseStoredEcoProfile,
  serializeEcoProfile,
  type EcoProfile,
} from "./use-eco-mode";

describe("parseStoredEcoProfile", () => {
  it("returns DEFAULT for null/undefined/empty", () => {
    expect(parseStoredEcoProfile(null)).toEqual(DEFAULT_ECO_PROFILE);
    expect(parseStoredEcoProfile("")).toEqual(DEFAULT_ECO_PROFILE);
  });

  it("returns DEFAULT for non-JSON", () => {
    expect(parseStoredEcoProfile("{not json")).toEqual(DEFAULT_ECO_PROFILE);
  });

  it("returns DEFAULT on schema-version mismatch", () => {
    const stale = JSON.stringify({
      v: 99,
      profile: { enabled: true, comparisonBaseline: "delivery", enabledAt: "" },
    });
    expect(parseStoredEcoProfile(stale)).toEqual(DEFAULT_ECO_PROFILE);
  });

  it("returns DEFAULT when profile object is missing", () => {
    const noProfile = JSON.stringify({ v: ECO_MODE_SCHEMA_VERSION });
    expect(parseStoredEcoProfile(noProfile)).toEqual(DEFAULT_ECO_PROFILE);
  });

  it("rejects an unknown comparisonBaseline string", () => {
    const bad = JSON.stringify({
      v: ECO_MODE_SCHEMA_VERSION,
      profile: {
        enabled: true,
        comparisonBaseline: "not-a-real-context",
        enabledAt: "2026-05-01T00:00:00Z",
      },
    });
    const out = parseStoredEcoProfile(bad);
    expect(out.comparisonBaseline).toBe(DEFAULT_ECO_PROFILE.comparisonBaseline);
    // Other valid fields preserved.
    expect(out.enabled).toBe(true);
    expect(out.enabledAt).toBe("2026-05-01T00:00:00Z");
  });

  it("preserves valid stored payload round-trip", () => {
    const profile: EcoProfile = {
      enabled: true,
      comparisonBaseline: "restaurant-dine-in",
      enabledAt: "2026-05-04T10:00:00Z",
    };
    const out = parseStoredEcoProfile(serializeEcoProfile(profile));
    expect(out).toEqual(profile);
  });

  it("treats non-boolean enabled as false (defensive)", () => {
    const bad = JSON.stringify({
      v: ECO_MODE_SCHEMA_VERSION,
      profile: {
        enabled: "yes" as unknown as boolean,
        comparisonBaseline: "delivery",
        enabledAt: "",
      },
    });
    expect(parseStoredEcoProfile(bad).enabled).toBe(false);
  });

  it("treats missing enabledAt as empty string", () => {
    const partial = JSON.stringify({
      v: ECO_MODE_SCHEMA_VERSION,
      profile: { enabled: true, comparisonBaseline: "delivery" },
    });
    expect(parseStoredEcoProfile(partial).enabledAt).toBe("");
  });

  it("survives a string-coerced profile (defensive)", () => {
    const bad = JSON.stringify({
      v: ECO_MODE_SCHEMA_VERSION,
      profile: "oops" as unknown as EcoProfile,
    });
    expect(parseStoredEcoProfile(bad)).toEqual(DEFAULT_ECO_PROFILE);
  });
});

describe("serializeEcoProfile", () => {
  it("emits the canonical { v, profile } shape", () => {
    const out = JSON.parse(serializeEcoProfile(DEFAULT_ECO_PROFILE)) as {
      v: number;
      profile: EcoProfile;
    };
    expect(out.v).toBe(ECO_MODE_SCHEMA_VERSION);
    expect(out.profile).toEqual(DEFAULT_ECO_PROFILE);
  });

  it("round-trips through parseStoredEcoProfile losslessly", () => {
    const profile: EcoProfile = {
      enabled: true,
      comparisonBaseline: "takeout-pickup",
      enabledAt: "2026-04-15T12:00:00Z",
    };
    expect(parseStoredEcoProfile(serializeEcoProfile(profile))).toEqual(
      profile,
    );
  });
});
