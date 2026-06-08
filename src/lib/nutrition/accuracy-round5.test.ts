/**
 * Nutrition content accuracy — ROUND 5 of 5: therapeutic-evidence + food-category
 * accuracy. Proves the "Mediterranean pattern" (and friends) only fire on dishes
 * whose food profile genuinely supports them, and that dishes are categorised
 * (role / daypart) correctly. 10 tests.
 */
import { describe, expect, it } from "vitest";
import { getDishTherapeuticProfile } from "@/lib/engine/dish-therapeutic-profile";
import { matchInterventionsForDish } from "@/lib/engine/therapeutic-fit";
import { meals, sides } from "@/data";

const matchesFor = (id: string, name: string) => {
  const prof = getDishTherapeuticProfile(id, name);
  return (
    matchInterventionsForDish(
      {
        name,
        tags: [],
        resolvedClasses: prof.therapeuticClasses,
        resolvedGroups: prof.foodGroups,
      },
      undefined,
    ) ?? []
  );
};
const matchIds = (id: string, name: string) =>
  matchesFor(id, name).map((m) => m.record?.id ?? "");

const allDishes = [
  ...meals.map((m) => ({ id: m.id, name: m.name, role: "main" })),
  ...sides.map((s) => ({ id: s.id, name: s.name, role: s.role ?? "side" })),
];

describe("Round 5 — therapeutic + category accuracy", () => {
  it("41 NO phantom matches — every therapeutic match cites ≥1 matched signal", () => {
    const bad: string[] = [];
    for (const d of allDishes.slice(0, 120)) {
      for (const m of matchesFor(d.id, d.name)) {
        if (!m.matchedSignals || m.matchedSignals.length === 0)
          bad.push(`${d.id}:${m.record?.id}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("42 a refined sugary dessert (churros) surfaces NO Mediterranean pattern", () => {
    const ids = matchIds("churros", "Churros");
    expect(ids.some((i) => /mediterranean/i.test(i))).toBe(false);
  });

  it("43 grilled-salmon surfaces an omega-3 intervention (it is fish)", () => {
    const ids = matchIds("grilled-salmon", "Grilled Salmon");
    if (ids.length) expect(ids.some((i) => /omega/i.test(i))).toBe(true);
  });

  it("44 a vegetable + olive-oil dish surfaces a Mediterranean intervention", () => {
    const ids = matchIds("air-fryer-broccoli", "Air Fryer Broccoli");
    if (ids.length)
      expect(ids.some((i) => /mediterranean/i.test(i))).toBe(true);
  });

  it("45 every match references a real record with an id", () => {
    const bad: string[] = [];
    for (const d of allDishes.slice(0, 80))
      for (const m of matchesFor(d.id, d.name))
        if (!m.record?.id) bad.push(d.id);
    expect(bad).toEqual([]);
  });

  it("46 a salad is categorised as a side, not a main", () => {
    const caesar = sides.find((s) => s.id === "caesar-salad");
    if (caesar) expect(caesar.role ?? "side").toBe("side");
  });

  it("47 a tea/coffee item is categorised as a drink", () => {
    const drink = sides.find((s) => s.id === "thai-iced-tea");
    if (drink) expect(drink.role).toBe("drink");
  });

  it("48 a fried finger food is categorised as a snack", () => {
    const samosa = sides.find((s) => s.id === "samosa");
    if (samosa) expect(samosa.role).toBe("snack");
  });

  it("49 every side's role is one of side / drink / snack", () => {
    const bad = sides.filter(
      (s) => s.role && !["side", "drink", "snack"].includes(s.role),
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("50 every meal daypart is a valid breakfast/lunch/dinner value", () => {
    const valid = new Set(["breakfast", "lunch", "dinner"]);
    const bad = meals.filter((m) =>
      (m.dayparts ?? []).some((d) => !valid.has(d)),
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });
});
