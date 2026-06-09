import { describe, expect, it } from "vitest";
import { sousRead } from "@/lib/nutrition/sous-read";
import {
  NUTRITION_COVERAGE_FLOOR,
  getDishNutrition,
} from "@/lib/engine/dish-nutrition";
import { getDishTherapeuticProfile } from "@/lib/engine/dish-therapeutic-profile";
import { assertNoMedicalClaim } from "@/lib/therapeutics/claim-contract";
import { meals, sides } from "@/data";
import type { PerServingNutrition } from "@/types/nutrition";

const N = (o: Record<string, number>) => o as unknown as PerServingNutrition;

const EFFECT_DENYLIST =
  /\b(effect|helps?|lowers?|raises?|reduces?|boosts?|improves?|prevents?|treats?|supports?|good for|gentle on|easy on|blood sugar|glycemic|glycaemic|inflammation|cholesterol)\b/i;

const readFor = (id: string) => {
  const { perServing, massedCoverage } = getDishNutrition(id);
  const prof = getDishTherapeuticProfile(id, id.replace(/-/g, " "));
  return sousRead(perServing, prof.foodGroups, massedCoverage);
};

const allReads = [...meals, ...sides]
  .map((d) => ({ id: d.id, read: readFor(d.id) }))
  .filter((x) => x.read) as {
  id: string;
  read: NonNullable<ReturnType<typeof readFor>>;
}[];

describe("sousRead — coverage-floor boundary (R7)", () => {
  it("imports the shared constant (0.7) and uses it as the floor", () => {
    expect(NUTRITION_COVERAGE_FLOOR).toBe(0.7);
  });

  it("coverage EXACTLY at the floor returns a read (not null)", () => {
    const r = sousRead(
      N({ calories: 200, totalCarbs_g: 20 }),
      [],
      NUTRITION_COVERAGE_FLOOR,
    );
    expect(r).not.toBeNull();
  });

  it("coverage just below the floor returns null", () => {
    const r = sousRead(
      N({ calories: 200, totalCarbs_g: 20 }),
      [],
      NUTRITION_COVERAGE_FLOOR - 0.001,
    );
    expect(r).toBeNull();
  });

  it("undefined coverage bypasses the floor (engine always supplies it)", () => {
    const r = sousRead(N({ calories: 200, totalCarbs_g: 20 }), []);
    expect(r).not.toBeNull();
  });
});

describe("sousRead — energy guard robustness", () => {
  it("null / zero / negative energy → null", () => {
    expect(sousRead(null, [])).toBeNull();
    expect(sousRead(N({ calories: 0 }), [])).toBeNull();
    expect(sousRead(N({ calories: -5 }), [])).toBeNull();
  });

  it("NaN energy never leaks NaN into a string and stays claim-safe", () => {
    const r = sousRead(N({ calories: Number.NaN, totalCarbs_g: 10 }), []);
    if (r) {
      const text = [r.headline, ...r.facets].join(" ");
      expect(/NaN/.test(text)).toBe(false);
      expect(assertNoMedicalClaim(text).ok).toBe(true);
    }
  });
});

describe("sousRead — macro fallback branches (no notable facets)", () => {
  it("fat-dominant → 'A richer, higher-fat dish.' empty facets, claim-safe", () => {
    const r = sousRead(
      N({ calories: 300, totalFat_g: 30, protein_g: 2, totalCarbs_g: 5 }),
      [],
      1,
    )!;
    expect(r.facets).toEqual([]);
    expect(r.headline).toBe("A richer, higher-fat dish.");
    expect(EFFECT_DENYLIST.test(r.headline)).toBe(false);
    expect(assertNoMedicalClaim(r.headline).ok).toBe(true);
  });

  it("carb-dominant → 'Mostly carbohydrate.'", () => {
    const r = sousRead(
      N({ calories: 200, totalCarbs_g: 45, protein_g: 1, totalFat_g: 1 }),
      [],
      1,
    )!;
    expect(r.headline).toBe("Mostly carbohydrate.");
    expect(r.facets).toEqual([]);
  });

  it("protein-leaning-but-unremarkable → 'A balanced mix of macros.'", () => {
    // protein energy strictly greatest (neither fat nor carb branch wins) but
    // protein < 15 so no 'Good protein' stem → falls through to balanced.
    const r = sousRead(
      N({ calories: 100, protein_g: 10, totalCarbs_g: 5, totalFat_g: 1 }),
      [],
      1,
    )!;
    expect(r.headline).toBe("A balanced mix of macros.");
    expect(r.facets).toEqual([]);
  });
});

describe("sousRead — fibre divergence is intentional", () => {
  it("with 2+ stronger stems, Fibre-rich stays a facet but drops from the headline", () => {
    const r = sousRead(
      N({
        calories: 200,
        protein_g: 20,
        totalCarbs_g: 30,
        fiber_g: 10,
        totalFat_g: 5,
      }),
      ["vegetable"],
      1,
    )!;
    expect(r.facets).toContain("Fibre-rich");
    expect(r.headline.toLowerCase()).not.toContain("fibre");
  });

  it("fibre IS in the headline when it's one of the few notable stems", () => {
    const r = sousRead(
      N({
        calories: 150,
        totalCarbs_g: 30,
        fiber_g: 8,
        protein_g: 2,
        totalFat_g: 1,
      }),
      ["vegetable"],
      1,
    )!;
    expect(r.facets).toContain("Fibre-rich");
    expect(r.headline.toLowerCase()).toContain("fibre");
  });
});

describe("sousRead — catalogue invariants (no fabrication)", () => {
  it("every read has a non-empty headline and 0..4 facets", () => {
    for (const { id, read } of allReads) {
      expect(read.headline.length, id).toBeGreaterThan(0);
      expect(read.facets.length, id).toBeLessThanOrEqual(4);
    }
  });

  it("facets are unique within a read", () => {
    for (const { id, read } of allReads) {
      expect(new Set(read.facets).size, id).toBe(read.facets.length);
    }
  });

  it("every concept named in the headline has a backing facet (no fabricated praise)", () => {
    const bad: string[] = [];
    for (const { id, read } of allReads) {
      const h = read.headline.toLowerCase();
      const f = new Set(read.facets);
      if (/plant-forward/.test(h) && !f.has("Plant-forward"))
        bad.push(`${id}:plant`);
      if (/complete protein/.test(h) && !f.has("Complete protein"))
        bad.push(`${id}:complete`);
      if (/good source of protein/.test(h) && !f.has("Good protein"))
        bad.push(`${id}:good-prot`);
      if (/nutrient-dense/.test(h) && !f.has("Nutrient-dense"))
        bad.push(`${id}:dense`);
    }
    expect(bad).toEqual([]);
  });

  it("is deterministic across repeated calls for every dish", () => {
    for (const d of [...meals, ...sides]) {
      expect(JSON.stringify(readFor(d.id))).toBe(JSON.stringify(readFor(d.id)));
    }
  });
});
