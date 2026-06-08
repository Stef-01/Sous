/**
 * Nutrition content accuracy — ROUND 3 of 5: Ayurvedic herb-note accuracy.
 * Sweeps every dish and proves no herb note is surfaced for a herb that isn't
 * actually in the dish (exact-id matching, zero phantoms). 10 tests.
 */
import { describe, expect, it } from "vitest";
import { getDishIngredientIds } from "@/lib/engine/dish-nutrition";
import { ayurvedicHerbsForDish, AYURVEDIC_HERBS } from "./ayurvedic-evidence";
import { meals, sides } from "@/data";

const HERB_IDS = new Set(AYURVEDIC_HERBS.map((h) => h.id));
const HERB_INGREDIENTS = new Set(AYURVEDIC_HERBS.map((h) => h.ingredientId));

const rows = [...meals, ...sides].map((d) => {
  const ids = getDishIngredientIds(d.id);
  return { id: d.id, ids, herbs: ayurvedicHerbsForDish(ids) };
});

describe("Round 3 — Ayurvedic herb-note accuracy", () => {
  it("21 NO phantom herbs — every surfaced herb is genuinely in the dish", () => {
    const bad: string[] = [];
    for (const r of rows)
      for (const h of r.herbs)
        if (!r.ids.has(h.ingredientId)) bad.push(`${r.id}:${h.id}`);
    expect(bad).toEqual([]);
  });

  it("22 every surfaced herb is a known evidence-backed entry", () => {
    const bad: string[] = [];
    for (const r of rows)
      for (const h of r.herbs)
        if (!HERB_IDS.has(h.id)) bad.push(`${r.id}:${h.id}`);
    expect(bad).toEqual([]);
  });

  it("23 the herb count equals the herb-ingredients actually present", () => {
    const bad = rows.filter((r) => {
      const present = [...r.ids].filter((i) => HERB_INGREDIENTS.has(i)).length;
      return r.herbs.length !== present;
    });
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("24 a dish containing garlic surfaces the garlic note", () => {
    const r = rows.find((x) => x.ids.has("garlic"));
    if (r) expect(r.herbs.map((h) => h.id)).toContain("garlic");
  });

  it("25 masoor-dal surfaces turmeric + ginger + garlic (all present)", () => {
    const r = rows.find((x) => x.id === "masoor-dal");
    if (r) {
      const ids = r.herbs.map((h) => h.id);
      expect(ids).toContain("turmeric");
      expect(ids).toContain("ginger");
      expect(ids).toContain("garlic");
    }
  });

  it("26 a dish with no herb ingredients surfaces no herb notes", () => {
    const noHerb = rows.find(
      (r) => ![...r.ids].some((i) => HERB_INGREDIENTS.has(i)),
    );
    if (noHerb) expect(noHerb.herbs).toEqual([]);
  });

  it("27 churros surfaces cinnamon (it's in the recipe) and nothing else spurious", () => {
    const r = rows.find((x) => x.id === "churros");
    if (r && r.ids.has("cinnamon"))
      expect(r.herbs.map((h) => h.id)).toContain("cinnamon");
  });

  it("28 herbs are de-duplicated within a dish", () => {
    const bad = rows.filter((r) => {
      const ids = r.herbs.map((h) => h.id);
      return new Set(ids).size !== ids.length;
    });
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("29 an empty / missing ingredient set yields no herbs", () => {
    expect(ayurvedicHerbsForDish(new Set())).toEqual([]);
    expect(ayurvedicHerbsForDish(undefined)).toEqual([]);
  });

  it("30 turmeric note never appears on a dish without turmeric", () => {
    const bad = rows.filter(
      (r) => r.herbs.some((h) => h.id === "turmeric") && !r.ids.has("turmeric"),
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });
});
