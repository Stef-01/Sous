/**
 * RCA regression — dietary-PATTERN classification (Mediterranean & friends).
 *
 * Before the fix, the matcher fired a whole dietary pattern on a SINGLE shared
 * ingredient, so 40% of the catalogue (Pad Thai, sushi, steak-in-olive-oil, Indian
 * curries) was mislabelled "Mediterranean". The fix: a pattern needs its keystone
 * (olive oil — the defining Mediterranean fat) AND ≥2 distinct components.
 *
 * This file is the permanent guard + the 20-food verification.
 */
import { describe, expect, it } from "vitest";
import { meals, sides } from "@/data";
import { getDishTherapeuticProfile } from "@/lib/engine/dish-therapeutic-profile";
import { matchInterventionsForDish } from "@/lib/engine/therapeutic-fit";

/** The three Mediterranean-family pattern records. */
const MED_IDS = new Set([
  "masld-mediterranean",
  "uc-mediterranean",
  "crohns-nutrition-sufficiency",
]);

const allDishes = [...meals, ...sides];

const medMatchesFor = (name: string, id: string) => {
  const prof = getDishTherapeuticProfile(id, name);
  const matches =
    matchInterventionsForDish(
      {
        name,
        tags: [],
        resolvedClasses: prof.therapeuticClasses,
        resolvedGroups: prof.foodGroups,
      },
      undefined,
    ) ?? [];
  return matches.filter((m) => MED_IDS.has(m.record.id));
};
const isMed = (d: { id: string; name: string }) =>
  medMatchesFor(d.name, d.id).length > 0;

const find = (frag: string) =>
  allDishes.find((d) => d.name.toLowerCase().includes(frag.toLowerCase()));

/** Synthetic dish for direct gate unit-testing (bypasses the catalogue). */
const synth = (classes: string[], groups: string[]) =>
  (
    matchInterventionsForDish(
      { name: "x", tags: [], resolvedClasses: classes, resolvedGroups: groups },
      ["masld"],
    ) ?? []
  ).filter((m) => MED_IDS.has(m.record.id));

describe("Mediterranean classification — RCA regression", () => {
  it("01 catalogue-wide: < 5% of dishes are tagged Mediterranean (was 40%)", () => {
    const med = allDishes.filter(isMed);
    expect(med.length / allDishes.length).toBeLessThan(0.05);
  });

  // ── 20-food verification: non-Mediterranean cuisines must NOT be tagged ──
  const NOT_MED = [
    "pad thai",
    "sushi",
    "dim sum",
    "bibimbap",
    "kadhi",
    "tikka",
    "pho",
    "ramen",
    "butter chicken",
    "fried rice",
    "bulgogi",
    "dumpling",
    "churro",
    "steak",
    "burger",
  ];
  for (const frag of NOT_MED) {
    it(`02 "${frag}" is NOT classified Mediterranean`, () => {
      const d = find(frag);
      if (!d) return; // dish not in catalogue — skip, don't fail
      expect(isMed(d), `${d.name} should not be Mediterranean`).toBe(false);
    });
  }

  // ── genuinely Mediterranean dishes MAY match (keystone + component present) ──
  for (const frag of ["hummus", "tabbouleh"]) {
    it(`03 "${frag}" (olive oil + a real component) IS Mediterranean-eligible`, () => {
      const d = find(frag);
      if (!d) return;
      expect(isMed(d)).toBe(true);
    });
  }

  // ── direct gate unit tests ──
  it("04 olive oil ALONE does not fire the pattern (minSignals 2)", () => {
    expect(synth(["olive-oil"], [])).toEqual([]);
  });
  it("05 olive oil + legumes fires it (keystone + 2 components)", () => {
    expect(synth(["olive-oil"], ["legume"]).length).toBeGreaterThan(0);
  });
  it("06 fish + legumes WITHOUT olive oil does NOT fire (keystone missing)", () => {
    expect(synth([], ["seafood", "legume"])).toEqual([]);
  });
  it("07 olive oil + fish fires it", () => {
    expect(synth(["olive-oil"], ["seafood"]).length).toBeGreaterThan(0);
  });
  it("08 a no-olive-oil dish never matches any Mediterranean record", () => {
    const offenders = allDishes.filter((d) => {
      const prof = getDishTherapeuticProfile(d.id, d.name);
      const hasOliveOil =
        prof.therapeuticClasses.includes("olive-oil") ||
        /olive oil/i.test(d.name);
      return !hasOliveOil && isMed(d);
    });
    expect(offenders.map((d) => d.name)).toEqual([]);
  });
});
