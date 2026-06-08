import { describe, expect, it } from "vitest";
import mealsJson from "@/data/meals.json";
import sidesJson from "@/data/sides.json";
import type { Meal, SideDish, Daypart, SideRole } from "@/types";

const meals = mealsJson as unknown as Meal[];
const sides = sidesJson as unknown as SideDish[];

const DAYPARTS = new Set<Daypart>(["breakfast", "lunch", "dinner"]);
const ROLES = new Set<SideRole>(["side", "drink", "snack"]);

describe("dish facets (Today Filter — Phase A)", () => {
  it("every meal has a non-empty dayparts set drawn from the enum", () => {
    for (const m of meals) {
      expect(Array.isArray(m.dayparts), m.id).toBe(true);
      expect(m.dayparts!.length, m.id).toBeGreaterThan(0);
      for (const d of m.dayparts!) {
        expect(DAYPARTS.has(d), `${m.id}:${d}`).toBe(true);
      }
    }
  });

  it("every side has a role drawn from the enum", () => {
    for (const s of sides) {
      expect(ROLES.has(s.role as SideRole), `${s.id}:${s.role}`).toBe(true);
    }
  });

  it("has a sane spread of roles and dayparts", () => {
    const drinks = sides.filter((s) => s.role === "drink").length;
    const snacks = sides.filter((s) => s.role === "snack").length;
    const breakfast = meals.filter((m) => m.dayparts!.includes("breakfast"));
    expect(drinks).toBeGreaterThanOrEqual(3);
    expect(snacks).toBeGreaterThanOrEqual(15);
    expect(breakfast.length).toBeGreaterThanOrEqual(3);
    // every meal is reachable from lunch or dinner (no main hidden from both)
    expect(
      meals.every(
        (m) => m.dayparts!.includes("lunch") || m.dayparts!.includes("dinner"),
      ),
    ).toBe(true);
    // a salad is a side, a tea is a drink (spot-check the classification)
    expect(sides.find((s) => s.id === "caesar-salad")?.role).toBe("side");
    expect(sides.find((s) => s.id === "thai-iced-tea")?.role).toBe("drink");
    expect(sides.find((s) => s.id === "samosa")?.role).toBe("snack");
  });
});
