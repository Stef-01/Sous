import { describe, expect, it } from "vitest";
import { aggregateTable, formatTableLabel } from "./table-aggregate";
import {
  HOUSEHOLD_SCHEMA_VERSION,
  type HouseholdMember,
} from "@/types/household-member";

function member(overrides: Partial<HouseholdMember> = {}): HouseholdMember {
  return {
    schemaVersion: HOUSEHOLD_SCHEMA_VERSION,
    id: "mem-alex",
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

describe("aggregateTable", () => {
  it("returns DEFAULT shape for empty selection", () => {
    const result = aggregateTable([member()], []);
    expect(result.count).toBe(0);
    expect(result.members).toEqual([]);
    expect(result.dietaryFlags).toEqual([]);
    expect(result.cuisinePreferences).toEqual([]);
    expect(result.minSpiceTolerance).toBe(5);
    expect(result.hasChild).toBe(false);
  });

  it("returns DEFAULT shape for empty member list", () => {
    const result = aggregateTable([], ["any-id"]);
    expect(result.count).toBe(0);
    expect(result.minSpiceTolerance).toBe(5);
  });

  it("ignores selected ids that don't exist", () => {
    const result = aggregateTable([member()], ["missing"]);
    expect(result.count).toBe(0);
  });

  it("preserves input member ordering, not selection ordering", () => {
    const a = member({ id: "mem-a", name: "Alex" });
    const b = member({ id: "mem-b", name: "Bri" });
    const c = member({ id: "mem-c", name: "Casey" });
    const result = aggregateTable([a, b, c], ["mem-c", "mem-a"]);
    expect(result.members.map((m) => m.id)).toEqual(["mem-a", "mem-c"]);
  });

  it("dietaryFlags is the deduped union", () => {
    const a = member({ id: "mem-a", dietaryFlags: ["vegan", "gluten-free"] });
    const b = member({ id: "mem-b", dietaryFlags: ["vegan", "nut-allergy"] });
    const result = aggregateTable([a, b], ["mem-a", "mem-b"]);
    expect(result.dietaryFlags).toEqual([
      "gluten-free",
      "nut-allergy",
      "vegan",
    ]);
  });

  it("cuisinePreferences is the deduped union", () => {
    const a = member({
      id: "mem-a",
      cuisinePreferences: ["indian", "italian"],
    });
    const b = member({
      id: "mem-b",
      cuisinePreferences: ["italian", "japanese"],
    });
    const result = aggregateTable([a, b], ["mem-a", "mem-b"]);
    expect(result.cuisinePreferences).toEqual([
      "indian",
      "italian",
      "japanese",
    ]);
  });

  it("minSpiceTolerance is the smallest among selected", () => {
    const a = member({ id: "mem-a", spiceTolerance: 4 });
    const b = member({ id: "mem-b", spiceTolerance: 2 });
    const c = member({ id: "mem-c", spiceTolerance: 5 });
    const result = aggregateTable([a, b, c], ["mem-a", "mem-b", "mem-c"]);
    expect(result.minSpiceTolerance).toBe(2);
  });

  it("hasChild=true when any selected member is ageBand=child", () => {
    const adult = member({ id: "mem-a", ageBand: "adult" });
    const kid = member({ id: "mem-k", ageBand: "child" });
    expect(aggregateTable([adult, kid], ["mem-a", "mem-k"]).hasChild).toBe(
      true,
    );
    expect(aggregateTable([adult, kid], ["mem-a"]).hasChild).toBe(false);
  });

  it("count reflects matched members, not selectedIds.length", () => {
    const a = member({ id: "mem-a" });
    const result = aggregateTable([a], ["mem-a", "missing-1", "missing-2"]);
    expect(result.count).toBe(1);
  });
});

describe("formatTableLabel", () => {
  it("returns empty string for empty selection", () => {
    const result = aggregateTable([], []);
    expect(formatTableLabel(result)).toBe("");
  });

  it("joins names with middle-dots", () => {
    const a = member({ id: "mem-a", name: "Alex" });
    const b = member({ id: "mem-b", name: "Bri" });
    const result = aggregateTable([a, b], ["mem-a", "mem-b"]);
    expect(formatTableLabel(result)).toBe("Alex · Bri");
  });

  it("prepends avatar when set", () => {
    const a = member({ id: "mem-a", name: "Alex", avatar: "👋" });
    const result = aggregateTable([a], ["mem-a"]);
    expect(formatTableLabel(result)).toBe("👋 Alex");
  });

  it("appends dietary flags after an em-dash when present", () => {
    const a = member({
      id: "mem-a",
      name: "Alex",
      dietaryFlags: ["vegan", "gluten-free"],
    });
    const result = aggregateTable([a], ["mem-a"]);
    expect(formatTableLabel(result)).toBe("Alex — gluten-free, vegan");
  });

  it("omits the em-dash when no dietary flags", () => {
    const a = member({ id: "mem-a", name: "Alex" });
    const result = aggregateTable([a], ["mem-a"]);
    expect(formatTableLabel(result).includes("—")).toBe(false);
  });
});
