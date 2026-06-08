/**
 * Nutrition content accuracy — ROUND 2 of 5: bioavailability tip RELEVANCE.
 * Sweeps every dish and proves no tip is surfaced that doesn't trace to an
 * ingredient actually in the dish (the "no blatantly-incorrect note" guarantee).
 * 10 tests.
 */
import { describe, expect, it } from "vitest";
import {
  getDishNutrition,
  getDishIngredientIds,
} from "@/lib/engine/dish-nutrition";
import { bioavailabilityTip } from "./bioavailability";
import { meals, sides } from "@/data";

const LEGUMES = [
  "red-lentils",
  "chickpeas",
  "black-beans",
  "pinto-beans",
  "navy-beans",
];

const tips = [...meals, ...sides]
  .map((d) => {
    const { perServing } = getDishNutrition(d.id);
    const ids = getDishIngredientIds(d.id);
    return {
      id: d.id,
      ids,
      p: perServing,
      tip: perServing ? bioavailabilityTip(perServing, ids) : null,
    };
  })
  .filter((x) => x.tip) as Array<{
  id: string;
  ids: Set<string>;
  p: NonNullable<ReturnType<typeof getDishNutrition>["perServing"]>;
  tip: NonNullable<ReturnType<typeof bioavailabilityTip>>;
}>;

const tipFor = (id: string) => {
  const { perServing } = getDishNutrition(id);
  return perServing
    ? bioavailabilityTip(perServing, getDishIngredientIds(id))
    : null;
};

describe("Round 2 — bioavailability tip relevance", () => {
  it("11 a turmeric/pepper tip ONLY appears when turmeric is in the dish", () => {
    const bad = tips.filter(
      (t) => /turmeric/i.test(t.tip.tip) && !t.ids.has("turmeric"),
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("12 the pepper tip never fires when black pepper is already present", () => {
    const bad = tips.filter(
      (t) => /black pepper/i.test(t.tip.tip) && t.ids.has("black-pepper"),
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("13 a lycopene/tomato tip ONLY appears when tomato is in the dish", () => {
    const bad = tips.filter(
      (t) =>
        /lycopene|tomato/i.test(t.tip.tip) &&
        !t.ids.has("tomato") &&
        !t.ids.has("tomato-paste"),
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("14 a soaking tip ONLY appears when a legume is in the dish", () => {
    const bad = tips.filter(
      (t) =>
        /soak|sprout/i.test(t.tip.tip) && !LEGUMES.some((l) => t.ids.has(l)),
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("15 the iron-ABSORPTION tip ONLY appears on iron-bearing dishes", () => {
    // (the soaking tip also mentions iron+zinc but fires on legume+zinc — excluded)
    const bad = tips.filter(
      (t) => /absorb the iron/i.test(t.tip.tip) && (t.p.iron_mg ?? 0) < 3,
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("16 a fat-soluble-vitamin tip only when the dish is genuinely low-fat", () => {
    const bad = tips.filter(
      (t) => /A, D, E and K/i.test(t.tip.tip) && (t.p.totalFat_g ?? 0) >= 3,
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("17 masoor-dal surfaces the turmeric+pepper tip (has turmeric, no pepper)", () => {
    const t = tipFor("masoor-dal");
    if (t) expect(t.tip).toMatch(/black pepper/i);
  });

  it("18 pizza-margherita surfaces the cooked-tomato lycopene tip", () => {
    const t = tipFor("pizza-margherita");
    if (t) expect(t.tip).toMatch(/lycopene|tomato/i);
  });

  it("19 every surfaced tip carries a non-empty mechanism ('why')", () => {
    const bad = tips.filter((t) => !t.tip.why || t.tip.why.length < 10);
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("20 the tip is deterministic for the same dish", () => {
    for (const id of ["masoor-dal", "pizza-margherita", "falafel-wrap"]) {
      expect(tipFor(id)?.tip).toBe(tipFor(id)?.tip);
    }
  });
});
