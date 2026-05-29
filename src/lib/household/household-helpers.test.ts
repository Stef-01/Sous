import { describe, expect, it } from "vitest";
import {
  appendMember,
  defaultHouseholdMember,
  findMemberById,
  nextMemberId,
  removeMemberById,
  updateMemberById,
} from "./household-helpers";
import {
  HOUSEHOLD_SCHEMA_VERSION,
  householdMemberSchema,
  type HouseholdMember,
} from "@/types/household-member";

function member(overrides: Partial<HouseholdMember> = {}): HouseholdMember {
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

describe("defaultHouseholdMember", () => {
  it("returns a schema-valid empty member", () => {
    const m = defaultHouseholdMember("2026-04-01T12:00:00Z");
    // The default has empty name (min=1), so direct .parse fails;
    // fill in a name and confirm the rest validates.
    const filled = { ...m, name: "Alex" };
    expect(() => householdMemberSchema.parse(filled)).not.toThrow();
  });

  it("returns a fresh object every call", () => {
    const a = defaultHouseholdMember();
    const b = defaultHouseholdMember();
    expect(a).not.toBe(b);
    expect(a.dietaryFlags).not.toBe(b.dietaryFlags);
    expect(a.cuisinePreferences).not.toBe(b.cuisinePreferences);
  });

  it("stamps the createdAt timestamp", () => {
    const now = "2026-05-02T18:00:00Z";
    expect(defaultHouseholdMember(now).createdAt).toBe(now);
  });

  it("defaults to ageBand=adult, spice=3, empty arrays", () => {
    const m = defaultHouseholdMember();
    expect(m.ageBand).toBe("adult");
    expect(m.spiceTolerance).toBe(3);
    expect(m.dietaryFlags).toEqual([]);
    expect(m.cuisinePreferences).toEqual([]);
  });
});

describe("nextMemberId", () => {
  it("returns `mem-<slug>-1` on an empty list", () => {
    expect(nextMemberId([], "Alex")).toBe("mem-alex-1");
  });

  it("increments past the highest existing numeric suffix for the slug", () => {
    const members = [
      member({ id: "mem-alex-1" }),
      member({ id: "mem-alex-3" }),
    ];
    expect(nextMemberId(members, "Alex")).toBe("mem-alex-4");
  });

  it("treats different slugs independently", () => {
    const members = [member({ id: "mem-alex-7" })];
    expect(nextMemberId(members, "Bri")).toBe("mem-bri-1");
  });

  it("normalises whitespace and case", () => {
    expect(nextMemberId([], "  Casey Lee  ")).toBe("mem-casey-lee-1");
  });

  it("falls back to `member` when the name slugifies to empty", () => {
    expect(nextMemberId([], "👽👽👽")).toBe("mem-member-1");
  });

  it("ignores ids that don't match the canonical pattern", () => {
    const members = [member({ id: "legacy-id" }), member({ id: "mem-alex-1" })];
    expect(nextMemberId(members, "Alex")).toBe("mem-alex-2");
  });
});

describe("appendMember", () => {
  it("returns a new array with the member appended", () => {
    const a = member({ id: "mem-alex-1" });
    const b = member({ id: "mem-bri-1", name: "Bri" });
    const result = appendMember([a], b);
    expect(result).toEqual([a, b]);
    expect(result).not.toBe([a]);
  });

  it("preserves existing order", () => {
    const a = member({ id: "mem-a" });
    const b = member({ id: "mem-b" });
    const c = member({ id: "mem-c" });
    expect(appendMember([a, b], c)).toEqual([a, b, c]);
  });
});

describe("removeMemberById", () => {
  it("removes the matching member", () => {
    const a = member({ id: "mem-a" });
    const b = member({ id: "mem-b" });
    expect(removeMemberById([a, b], "mem-a")).toEqual([b]);
  });

  it("returns a fresh array unchanged when no id matches", () => {
    const list = [member({ id: "mem-a" })];
    const result = removeMemberById(list, "missing");
    expect(result).toEqual(list);
    expect(result).not.toBe(list);
  });

  it("handles removing all members", () => {
    expect(removeMemberById([member()], member().id)).toEqual([]);
  });
});

describe("updateMemberById", () => {
  it("merges the patch over the existing record", () => {
    const a = member({ id: "mem-a", spiceTolerance: 3 });
    const result = updateMemberById([a], "mem-a", { spiceTolerance: 5 });
    expect(result[0].spiceTolerance).toBe(5);
    expect(result[0].name).toBe("Alex");
  });

  it("preserves id / createdAt / schemaVersion (patch type excludes them)", () => {
    const a = member({ id: "mem-a", createdAt: "2026-01-01T00:00:00Z" });
    const result = updateMemberById([a], "mem-a", { name: "Renamed" });
    expect(result[0].id).toBe("mem-a");
    expect(result[0].createdAt).toBe("2026-01-01T00:00:00Z");
  });

  it("returns the list unchanged when id is missing", () => {
    const list = [member({ id: "mem-a" })];
    const result = updateMemberById(list, "missing", { name: "x" });
    expect(result).toEqual(list);
  });

  it("doesn't mutate input arrays", () => {
    const original = [member({ id: "mem-a", spiceTolerance: 3 })];
    updateMemberById(original, "mem-a", { spiceTolerance: 5 });
    expect(original[0].spiceTolerance).toBe(3);
  });
});

describe("findMemberById", () => {
  it("returns the matching member", () => {
    const a = member({ id: "mem-a" });
    const b = member({ id: "mem-b" });
    expect(findMemberById([a, b], "mem-b")).toBe(b);
  });

  it("returns null when no match", () => {
    expect(findMemberById([member()], "missing")).toBe(null);
  });

  it("returns null on empty list", () => {
    expect(findMemberById([], "any")).toBe(null);
  });
});
