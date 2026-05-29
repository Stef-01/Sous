import { describe, expect, it } from "vitest";
import { parseStoredHouseholdMembers } from "./use-household-members";
import {
  HOUSEHOLD_SCHEMA_VERSION,
  type HouseholdMember,
} from "@/types/household-member";

function validMember(
  overrides: Partial<HouseholdMember> = {},
): HouseholdMember {
  return {
    schemaVersion: HOUSEHOLD_SCHEMA_VERSION,
    id: "mem-alex-1",
    name: "Alex",
    ageBand: "adult",
    spiceTolerance: 3,
    dietaryFlags: [],
    cuisinePreferences: [],
    avatar: "",
    createdAt: "2026-04-01T12:00:00Z",
    ...overrides,
  };
}

describe("parseStoredHouseholdMembers", () => {
  it("returns empty list on null / undefined / empty string", () => {
    expect(parseStoredHouseholdMembers(null)).toEqual([]);
    expect(parseStoredHouseholdMembers(undefined)).toEqual([]);
    expect(parseStoredHouseholdMembers("")).toEqual([]);
  });

  it("returns empty list on non-JSON", () => {
    expect(parseStoredHouseholdMembers("{not-json")).toEqual([]);
  });

  it("returns empty list when root is not an array", () => {
    expect(parseStoredHouseholdMembers("null")).toEqual([]);
    expect(parseStoredHouseholdMembers("{}")).toEqual([]);
    expect(parseStoredHouseholdMembers("42")).toEqual([]);
  });

  it("returns valid members round-trip", () => {
    const m = validMember();
    const raw = JSON.stringify([m]);
    expect(parseStoredHouseholdMembers(raw)).toEqual([m]);
  });

  it("drops invalid entries but keeps valid siblings (partial recovery)", () => {
    const valid = validMember();
    const invalid = { ...validMember(), name: "" }; // name min=1 → invalid
    const raw = JSON.stringify([valid, invalid]);
    expect(parseStoredHouseholdMembers(raw)).toEqual([valid]);
  });

  it("drops entries with wrong schemaVersion", () => {
    const stale = { ...validMember(), schemaVersion: 99 };
    const raw = JSON.stringify([stale, validMember()]);
    expect(parseStoredHouseholdMembers(raw)).toEqual([validMember()]);
  });

  it("drops entries with out-of-range spiceTolerance", () => {
    const oob = { ...validMember(), spiceTolerance: 99 };
    const raw = JSON.stringify([oob]);
    expect(parseStoredHouseholdMembers(raw)).toEqual([]);
  });

  it("drops entries with bogus ageBand", () => {
    const bogus = { ...validMember(), ageBand: "elderly" };
    const raw = JSON.stringify([bogus]);
    expect(parseStoredHouseholdMembers(raw)).toEqual([]);
  });

  it("preserves order across mixed valid + invalid entries", () => {
    const a = validMember({ id: "mem-a-1" });
    const bad = { invalid: true };
    const c = validMember({ id: "mem-c-1", name: "Casey" });
    const raw = JSON.stringify([a, bad, c]);
    expect(parseStoredHouseholdMembers(raw)).toEqual([a, c]);
  });

  it("handles a 50-member payload without dropping valid entries", () => {
    const members = Array.from({ length: 50 }, (_, i) =>
      validMember({
        id: `mem-${i}`,
        name: `Member ${i}`,
        createdAt: new Date(2026, 0, 1, 0, i).toISOString(),
      }),
    );
    const raw = JSON.stringify(members);
    expect(parseStoredHouseholdMembers(raw)).toHaveLength(50);
  });

  it("returns a fresh array every call (no shared mutable state)", () => {
    const a = parseStoredHouseholdMembers(null);
    const b = parseStoredHouseholdMembers(null);
    expect(a).not.toBe(b);
  });
});
