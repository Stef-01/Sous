import { describe, expect, it } from "vitest";
import {
  EMPTY_CARE_PROFILE,
  parseStoredCareProfile,
  serializeCareProfile,
  CARE_PROFILE_SCHEMA_VERSION,
} from "./use-care-profile";
import type { CareProfile } from "@/types/care-profile";

describe("care profile storage", () => {
  it("returns empty profile for null/empty/garbage", () => {
    expect(parseStoredCareProfile(null)).toEqual(EMPTY_CARE_PROFILE);
    expect(parseStoredCareProfile("")).toEqual(EMPTY_CARE_PROFILE);
    expect(parseStoredCareProfile("{not json")).toEqual(EMPTY_CARE_PROFILE);
  });

  it("rejects a stale schema version", () => {
    const stale = JSON.stringify({ v: 99, conditions: ["ibs"] });
    expect(parseStoredCareProfile(stale)).toEqual(EMPTY_CARE_PROFILE);
  });

  it("round-trips a valid profile", () => {
    const profile: CareProfile = {
      v: CARE_PROFILE_SCHEMA_VERSION as 1,
      conditions: ["high-ldl", "ibs"],
      avoid: ["nut-allergy"],
      fodmapPhase: "elimination",
      updatedAt: "2026-06-03T00:00:00.000Z",
    };
    expect(parseStoredCareProfile(serializeCareProfile(profile))).toEqual(
      profile,
    );
  });

  it("coerces malformed arrays back to empty", () => {
    const weird = JSON.stringify({
      v: CARE_PROFILE_SCHEMA_VERSION,
      conditions: "ibs",
      avoid: null,
    });
    const parsed = parseStoredCareProfile(weird);
    expect(parsed.conditions).toEqual([]);
    expect(parsed.avoid).toEqual([]);
    expect(parsed.fodmapPhase).toBeNull();
  });
});
