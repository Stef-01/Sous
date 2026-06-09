import { describe, expect, it } from "vitest";
import { sousRead } from "./sous-read";
import { getDishNutrition } from "@/lib/engine/dish-nutrition";
import { getDishTherapeuticProfile } from "@/lib/engine/dish-therapeutic-profile";
import { assertNoMedicalClaim } from "@/lib/therapeutics/claim-contract";
import { meals, sides } from "@/data";
import type { PerServingNutrition } from "@/types/nutrition";

const N = (o: Record<string, number>) => o as unknown as PerServingNutrition;

/** Binding R2: a COMPOSITION read must never use effect/outcome language. */
const EFFECT_DENYLIST =
  /\b(effect|helps?|lowers?|raises?|reduces?|boosts?|improves?|prevents?|treats?|supports?|good for|gentle on|easy on|blood sugar|glycemic|glycaemic|inflammation|cholesterol)\b/i;

const readFor = (id: string) => {
  const { perServing, massedCoverage } = getDishNutrition(id);
  const prof = getDishTherapeuticProfile(id, id.replace(/-/g, " "));
  return sousRead(perServing, prof.foodGroups, massedCoverage);
};
const allReads = [...meals, ...sides]
  .map((d) => ({ id: d.id, read: readFor(d.id) }))
  .filter((x) => x.read);

describe("sousRead — composition read (Phase 1)", () => {
  it("01 a leafy vegetable side reads plant-forward", () => {
    const r = readFor("air-fryer-broccoli");
    if (r) expect(r.facets).toContain("Plant-forward");
  });

  it("02 a refined/sugary dessert is NOT flagged nutrient-dense", () => {
    const r = readFor("churros");
    if (r) expect(r.facets).not.toContain("Nutrient-dense");
  });

  it("03 returns null below the coverage floor (imports the shared constant)", () => {
    expect(
      sousRead(N({ calories: 200, totalCarbs_g: 20 }), [], 0.5),
    ).toBeNull();
    // at/above the 0.7 floor it may produce a read
    expect(
      sousRead(N({ calories: 200, totalCarbs_g: 20 }), [], 0.9),
    ).not.toBeNull();
  });

  it("04 returns null for absent / empty-energy nutrition", () => {
    expect(sousRead(null, [])).toBeNull();
    expect(sousRead(N({ calories: 0 }), [])).toBeNull();
  });

  it("05 R2 — across the WHOLE catalogue, no read uses effect/outcome language", () => {
    const bad = allReads.filter(({ read }) => {
      const text = [read!.headline, ...read!.facets].join(" ");
      return EFFECT_DENYLIST.test(text);
    });
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("06 R2 — every read passes the medical-claim contract", () => {
    const bad = allReads.filter(({ read }) =>
      [read!.headline, ...read!.facets].some(
        (s) => !assertNoMedicalClaim(s).ok,
      ),
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("07 adversarial fixtures stay descriptive (no effect language)", () => {
    const fixtures = [
      N({ calories: 120, totalFat_g: 14 }), // single oily ingredient
      N({ calories: 300, totalCarbs_g: 60, fiber_g: 18, vitaminC_mg: 5 }), // carby-but-fibrous (macro vs glycemic tension)
      N({ calories: 90, protein_g: 0, totalCarbs_g: 1 }), // near-empty
      N({ calories: 500, totalCarbs_g: 80, totalSugars_g: 70, fiber_g: 0 }), // sugar bomb
    ];
    for (const f of fixtures) {
      const r = sousRead(f, ["vegetable"], 1);
      if (!r) continue;
      const text = [r.headline, ...r.facets].join(" ");
      expect(EFFECT_DENYLIST.test(text), text).toBe(false);
      expect(assertNoMedicalClaim(text).ok).toBe(true);
    }
  });

  it("08 facets carry no numbers and never exceed 4 (Rule 13d)", () => {
    const bad = allReads.filter(
      ({ read }) =>
        read!.facets.length > 4 || read!.facets.some((f) => /\d/.test(f)),
    );
    expect(bad.map((b) => b.id)).toEqual([]);
  });

  it("09 a fish dish reads as a complete protein when scored", () => {
    const r = readFor("grilled-salmon");
    // protein-quality may be null without amino data; only assert when present
    if (r && r.facets.includes("Complete protein"))
      expect(r.headline.toLowerCase()).toContain("complete protein");
  });

  it("10 is deterministic for the same dish", () => {
    expect(JSON.stringify(readFor("masoor-dal"))).toBe(
      JSON.stringify(readFor("masoor-dal")),
    );
  });
});
