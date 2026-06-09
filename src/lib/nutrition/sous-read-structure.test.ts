import { describe, it, expect } from "vitest";
import { sousRead } from "@/lib/nutrition/sous-read";
import { NUTRITION_COVERAGE_FLOOR } from "@/lib/engine/dish-nutrition";
import { assertNoMedicalClaim } from "@/lib/therapeutics/claim-contract";
import type { PerServingNutrition } from "@/types/nutrition";
import type { FoodGroup } from "@/types/ingredient";

// The catalogue uses many optional micro keys; cast keeps fixtures terse while
// matching how the production callers build PerServingNutrition.
const N = (o: Record<string, number>) => o as unknown as PerServingNutrition;

// The COMPLETE descriptor vocabulary sousRead is allowed to emit as facets.
const FACET_VOCAB = new Set([
  "Plant-forward",
  "Nutrient-dense",
  "Complete protein",
  "Good protein",
  "Fibre-rich",
]);

// Any verb/phrase that would turn a composition read into an effect/outcome claim.
const EFFECT =
  /\b(effect|helps?|lowers?|raises?|reduces?|boosts?|improves?|prevents?|treats?|supports?|good for|gentle on|easy on|blood sugar|glycemic|glycaemic|inflammation|cholesterol|digest\w*)\b/i;

describe("sousRead — structural invariants (Phase 2 / R2)", () => {
  it("every facet is drawn from the fixed descriptor vocabulary and never exceeds 4", () => {
    const grid: Array<readonly FoodGroup[]> = [
      [],
      ["vegetable"],
      ["leafy-green"],
      ["legume"],
      ["vegetable", "legume", "grain"],
    ];
    for (const groups of grid) {
      for (const protein of [0, 5, 15, 25]) {
        for (const fiber of [0, 3, 6, 20]) {
          for (const dense of [
            {},
            { calcium_mg: 9999, iron_mg: 9999, potassium_mg: 9999 },
          ] as Record<string, number>[]) {
            const r = sousRead(
              N({
                calories: 200,
                protein_g: protein,
                fiber_g: fiber,
                totalCarbs_g: 25,
                totalFat_g: 5,
                ...dense,
              }),
              groups,
              1,
            );
            if (!r) continue;
            expect(r.facets.length).toBeLessThanOrEqual(4);
            for (const f of r.facets) expect(FACET_VOCAB.has(f), f).toBe(true);
          }
        }
      }
    }
  });

  it("the headline is descriptive only — no effect verb across a macro grid (R2)", () => {
    for (const groups of [[], ["vegetable"]] as ReadonlyArray<FoodGroup>[]) {
      for (const carbs of [2, 25, 80]) {
        for (const fat of [1, 14, 30]) {
          for (const protein of [1, 12, 25]) {
            for (const fiber of [0, 8]) {
              const r = sousRead(
                N({
                  calories: 300,
                  totalCarbs_g: carbs,
                  totalFat_g: fat,
                  protein_g: protein,
                  fiber_g: fiber,
                }),
                groups,
                1,
              );
              if (!r) continue;
              expect(EFFECT.test(r.headline), r.headline).toBe(false);
              expect(assertNoMedicalClaim(r.headline).ok).toBe(true);
              // structural shape: a single sentence, capitalised, terminated.
              expect(r.headline.endsWith(".")).toBe(true);
              expect(r.headline[0]).toBe(r.headline[0].toUpperCase());
              expect(r.headline.length).toBeLessThanOrEqual(120);
            }
          }
        }
      }
    }
  });

  it("macro-dominance fallbacks emit the expected descriptive strings", () => {
    // Verified by exact-equality probe against the live implementation.
    expect(
      sousRead(
        N({ calories: 300, totalCarbs_g: 70, protein_g: 1, totalFat_g: 1 }),
        [],
        1,
      ),
    ).toEqual({ headline: "Mostly carbohydrate.", facets: [] });
    expect(
      sousRead(
        N({ calories: 300, totalFat_g: 30, totalCarbs_g: 2, protein_g: 1 }),
        [],
        1,
      ),
    ).toEqual({ headline: "A richer, higher-fat dish.", facets: [] });
  });

  it("composes multiple stems with an 'and' join and caps the headline stems at two", () => {
    // veg + complete-protein-miss(protein>=15) + fiber>=5: fiber is suppressed from
    // the HEADLINE (len<2 gate) but still surfaces as a FACET. This asymmetry is intentional.
    const r = sousRead(
      N({ calories: 200, protein_g: 20, fiber_g: 10, totalCarbs_g: 10 }),
      ["vegetable", "legume"],
      1,
    );
    expect(r).toEqual({
      headline: "Plant-forward and a good source of protein.",
      facets: ["Plant-forward", "Good protein", "Fibre-rich"],
    });
    expect(r!.headline).not.toMatch(/fibre/i); // suppressed in headline
    expect(r!.facets).toContain("Fibre-rich"); // but kept as a facet
  });

  it("a lone notable signal yields a single-stem headline (no dangling 'and')", () => {
    const r = sousRead(
      N({ calories: 200, fiber_g: 8, totalCarbs_g: 30 }),
      [],
      1,
    );
    expect(r).toEqual({ headline: "Fibre-rich.", facets: ["Fibre-rich"] });
    expect(r!.headline).not.toContain(" and ");
  });

  it("null-render contract: no fabricated verdict on thin/absent data", () => {
    expect(sousRead(null, ["vegetable"])).toBeNull();
    expect(sousRead(undefined, ["vegetable"])).toBeNull();
    expect(
      sousRead(N({ calories: 0, protein_g: 5 }), ["vegetable"]),
    ).toBeNull();
    expect(sousRead(N({ calories: -1 }), [])).toBeNull();
    // below the imported floor → null; at/above → a read.
    expect(
      sousRead(
        N({ calories: 200, totalCarbs_g: 20 }),
        [],
        NUTRITION_COVERAGE_FLOOR - 0.01,
      ),
    ).toBeNull();
    expect(
      sousRead(
        N({ calories: 200, totalCarbs_g: 20 }),
        [],
        NUTRITION_COVERAGE_FLOOR,
      ),
    ).not.toBeNull();
  });

  it("coverage UNDEFINED does not gate — legacy callers without coverage still get a read", () => {
    // The Win screen / side-pairing reuse path may call without coverage; it must not null out.
    const r = sousRead(N({ calories: 200, protein_g: 20, totalCarbs_g: 10 }), [
      "vegetable",
    ]);
    expect(r).not.toBeNull();
  });

  it("is a pure function of its inputs (deterministic, no hidden state)", () => {
    const args = [
      N({ calories: 220, protein_g: 18, fiber_g: 6, totalCarbs_g: 20 }),
      ["vegetable"],
      1,
    ] as const;
    expect(JSON.stringify(sousRead(...args))).toBe(
      JSON.stringify(sousRead(...args)),
    );
  });
});
