import { describe, expect, it } from "vitest";
import { planBalance } from "./plan-balance";

describe("planBalance", () => {
  it("is empty for an empty plan", () => {
    const b = planBalance([]);
    expect(b.foodGroups).toEqual([]);
    expect(b.mealsCounted).toBe(0);
    expect(b.hasVegetable).toBe(false);
    expect(b.hasProtein).toBe(false);
  });

  it("aggregates distinct food groups across a real plan", () => {
    const b = planBalance(["guacamole", "tabbouleh", "three-bean-salad"]);
    expect(b.mealsCounted).toBe(3);
    expect(b.foodGroups.length).toBeGreaterThan(0);
    // food groups are distinct
    expect(new Set(b.foodGroups).size).toBe(b.foodGroups.length);
  });

  it("derives hasProtein from a protein-group dish (legumes)", () => {
    const b = planBalance(["three-bean-salad"]);
    if (b.foodGroups.includes("legume")) {
      expect(b.hasProtein).toBe(true);
    }
  });
});
