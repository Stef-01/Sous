import { describe, expect, it } from "vitest";
import {
  rollAccessoryDrop,
  ACCESSORY_IDS,
  ACCESSORY_DROP_CHANCE,
  accessoryById,
} from "./pet-accessories";

describe("rollAccessoryDrop", () => {
  it("drops a not-yet-owned accessory when the roll lands in the window", () => {
    const got = rollAccessoryDrop(new Set(), 0.0);
    expect(got).not.toBeNull();
    expect(ACCESSORY_IDS).toContain(got!);
  });

  it("drops nothing when the roll is outside the window", () => {
    expect(rollAccessoryDrop(new Set(), ACCESSORY_DROP_CHANCE)).toBeNull();
    expect(rollAccessoryDrop(new Set(), 0.99)).toBeNull();
  });

  it("never drops a duplicate, and stops once everything is owned", () => {
    const all = new Set(ACCESSORY_IDS);
    expect(rollAccessoryDrop(all, 0.0)).toBeNull();
    // owning all-but-one → only that one can drop
    const allButCrown = new Set(ACCESSORY_IDS.filter((id) => id !== "crown"));
    for (const roll of [0, 0.1, 0.2, 0.33]) {
      const got = rollAccessoryDrop(allButCrown, roll);
      if (got) expect(got).toBe("crown");
    }
  });

  it("spreads which one drops across the in-window roll (not always the first)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < ACCESSORY_DROP_CHANCE * 100; i++) {
      const roll = (i / 100) % ACCESSORY_DROP_CHANCE;
      const got = rollAccessoryDrop(new Set(), roll);
      if (got) seen.add(got);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("is deterministic for a fixed (owned, roll)", () => {
    expect(rollAccessoryDrop(new Set(), 0.05)).toBe(
      rollAccessoryDrop(new Set(), 0.05),
    );
  });

  it("is defensive against a negative/NaN roll", () => {
    expect(rollAccessoryDrop(new Set(), -1)).toBeNull();
    expect(rollAccessoryDrop(new Set(), Number.NaN)).toBeNull();
  });
});

describe("accessoryById", () => {
  it("resolves a real id and returns null otherwise", () => {
    expect(accessoryById("bandana")?.name).toBe("Bandana");
    expect(accessoryById("nope")).toBeNull();
    expect(accessoryById(null)).toBeNull();
  });
});
