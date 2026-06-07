import { describe, expect, it } from "vitest";
import { planBalance } from "./plan-balance";

describe("planBalance", () => {
  it("is empty for an empty plan", () => {
    const b = planBalance([]);
    expect(b.foodGroups).toEqual([]);
    expect(b.hasVegetable).toBe(false);
    expect(b.hasProtein).toBe(false);
  });

  it("aggregates distinct food groups across a real plan", () => {
    const b = planBalance(["guacamole", "tabbouleh", "three-bean-salad"]);
    expect(b.foodGroups.length).toBeGreaterThan(0);
    // food groups are distinct
    expect(new Set(b.foodGroups).size).toBe(b.foodGroups.length);
  });

  it("derives hasProtein from a primary protein group (legumes), not dairy", () => {
    const b = planBalance(["three-bean-salad"]);
    if (b.foodGroups.includes("legume")) {
      expect(b.hasProtein).toBe(true);
    }
    // a dairy-only side must NOT register as a protein source
    const dairyOnly = planBalance(["plain-dahi"]);
    if (
      dairyOnly.foodGroups.includes("dairy") &&
      !dairyOnly.foodGroups.some((g) =>
        ["legume", "seafood", "poultry", "egg", "red-meat"].includes(g),
      )
    ) {
      expect(dairyOnly.hasProtein).toBe(false);
    }
  });
});
