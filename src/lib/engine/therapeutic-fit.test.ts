import { describe, expect, it } from "vitest";
import {
  scoreTherapeuticFit,
  matchInterventionsForDish,
  EVIDENCE_WEIGHT,
} from "./therapeutic-fit";
import type { CareProfile } from "@/types/care-profile";

function care(conditions: CareProfile["conditions"]): CareProfile {
  return { v: 1, conditions, avoid: [], fodmapPhase: null, updatedAt: "" };
}

const dish = (name: string, tags: string[]) => ({ name, tags });

describe("structural bridge (food identity beats spelling)", () => {
  // A name with no signal words, but resolved ingredients ARE legumes.
  const noSignalName = "Grandma's Tuesday Bowl";

  it("matches a legume intervention via resolved food group, not the name", () => {
    const withProfile = matchInterventionsForDish(
      { name: noSignalName, tags: [], resolvedGroups: ["legume"] },
      ["masld"],
    );
    expect(withProfile.length).toBeGreaterThan(0);

    // Same dish WITHOUT the resolved profile → substring finds nothing.
    const withoutProfile = matchInterventionsForDish(
      { name: noSignalName, tags: [] },
      ["masld"],
    );
    expect(withoutProfile.length).toBe(0);
  });

  it("matches oily-fish evidence via resolved class", () => {
    const matches = matchInterventionsForDish(
      { name: noSignalName, tags: [], resolvedClasses: ["oily-fish"] },
      ["masld"],
    );
    expect(matches.some((m) => /omega|fish/i.test(m.record.label))).toBe(true);
  });

  it("lifts the fit score through the bridge", () => {
    const plain = scoreTherapeuticFit(care(["masld"]), {
      name: noSignalName,
      tags: [],
    });
    const bridged = scoreTherapeuticFit(care(["masld"]), {
      name: noSignalName,
      tags: [],
      resolvedGroups: ["legume"],
    });
    expect(plain).toBe(0.5);
    expect(bridged).toBeGreaterThan(0.5);
  });

  it("never matches an unmapped class (no false positives)", () => {
    const matches = matchInterventionsForDish(
      { name: noSignalName, tags: [], resolvedClasses: ["fermented"] },
      ["masld"],
    );
    expect(matches.length).toBe(0);
  });

  it("a legume's soluble fiber does NOT falsely match IBS psyllium", () => {
    // Legumes are high-FODMAP, often restricted in IBS — a lentil dish must not
    // structurally match the IBS soluble-fiber (psyllium) record.
    const legume = {
      name: noSignalName,
      tags: [],
      resolvedClasses: ["soluble-fiber", "plant-protein"],
      resolvedGroups: ["legume"],
    };
    expect(matchInterventionsForDish(legume, ["ibs"]).length).toBe(0);
    // ...but it still matches LDL (legumes → Portfolio pattern).
    expect(
      matchInterventionsForDish(legume, ["high-ldl"]).length,
    ).toBeGreaterThan(0);
  });
});

describe("scoreTherapeuticFit", () => {
  it("is neutral (0.5) with no conditions", () => {
    expect(scoreTherapeuticFit(care([]), dish("Oat Pilaf", ["oats"]))).toBe(
      0.5,
    );
  });

  it("is neutral when nothing matches", () => {
    expect(
      scoreTherapeuticFit(
        care(["high-ldl"]),
        dish("Plain Rice", ["white rice"]),
      ),
    ).toBe(0.5);
  });

  it("rewards a dish that realizes recipe-native LDL evidence", () => {
    const oats = scoreTherapeuticFit(
      care(["high-ldl"]),
      dish("Oat Porridge", ["oats"]),
    );
    expect(oats).toBeGreaterThan(0.5);
    expect(oats).toBeLessThanOrEqual(1);
  });

  it("stacks multiple matches higher than one", () => {
    const one = scoreTherapeuticFit(
      care(["high-ldl"]),
      dish("Oat Bowl", ["oats"]),
    );
    const many = scoreTherapeuticFit(
      care(["high-ldl"]),
      dish("Oat, Nut & Bean Bowl", ["oats", "nuts", "legumes"]),
    );
    expect(many).toBeGreaterThan(one);
  });

  it("never lets an education-only extract drive the score (UC curcumin)", () => {
    // UC's only scorable record is the Mediterranean pattern; curcumin is
    // extract-only (empty recipeSignals) so a turmeric dish must stay neutral.
    expect(
      scoreTherapeuticFit(
        care(["ulcerative-colitis"]),
        dish("Turmeric Rice", ["turmeric"]),
      ),
    ).toBe(0.5);
    // ...but an olive-oil/vegetable dish DOES match the Mediterranean record.
    expect(
      scoreTherapeuticFit(
        care(["ulcerative-colitis"]),
        dish("Greek Veg Bowl", ["olive oil", "vegetables"]),
      ),
    ).toBeGreaterThan(0.5);
  });

  it("uses the report's evidence-weight ladder", () => {
    expect(EVIDENCE_WEIGHT.high).toBeGreaterThan(EVIDENCE_WEIGHT.moderate);
    expect(EVIDENCE_WEIGHT.moderate).toBeGreaterThan(EVIDENCE_WEIGHT.low);
    expect(EVIDENCE_WEIGHT.low).toBeGreaterThan(EVIDENCE_WEIGHT["very-low"]);
  });
});

describe("matchInterventionsForDish (swipe-up health panel data)", () => {
  it("returns the interventions a dish realizes, with the matched signals", () => {
    const matches = matchInterventionsForDish(
      dish("Oat & Barley Pilaf", ["oats", "barley"]),
    );
    expect(matches.length).toBeGreaterThan(0);
    for (const m of matches) {
      expect(m.matchedSignals.length).toBeGreaterThan(0);
      // every matched signal really appears in the dish text
      const hay = `${"Oat & Barley Pilaf"} oats barley`.toLowerCase();
      for (const sig of m.matchedSignals) {
        expect(hay.includes(sig.toLowerCase())).toBe(true);
      }
    }
  });

  it("returns nothing for a dish that realizes no intervention", () => {
    expect(
      matchInterventionsForDish(dish("Plain White Rice", ["white rice"])),
    ).toEqual([]);
  });

  it("scopes to the given conditions when personalizing", () => {
    const ldl = matchInterventionsForDish(dish("Oat Porridge", ["oats"]), [
      "high-ldl",
    ]);
    expect(ldl.length).toBeGreaterThan(0);
    expect(ldl.every((m) => m.record.conditionId === "high-ldl")).toBe(true);
  });

  it("orders strongest evidence first", () => {
    const matches = matchInterventionsForDish(
      dish("Oat, Nut & Bean Bowl", ["oats", "nuts", "legumes"]),
      ["high-ldl"],
    );
    for (let i = 1; i < matches.length; i++) {
      expect(
        EVIDENCE_WEIGHT[matches[i - 1].record.grade],
      ).toBeGreaterThanOrEqual(EVIDENCE_WEIGHT[matches[i].record.grade]);
    }
  });

  it("agrees with scoreTherapeuticFit by construction (shared predicate)", () => {
    const samples: Array<{ name: string; tags: string[] }> = [
      dish("Oat Porridge", ["oats"]),
      dish("Plain White Rice", ["white rice"]),
      dish("Greek Veg Bowl", ["olive oil", "vegetables"]),
    ];
    for (const d of samples) {
      const matched = matchInterventionsForDish(d, ["high-ldl"]).length > 0;
      const scored = scoreTherapeuticFit(care(["high-ldl"]), d) > 0.5;
      expect(matched).toBe(scored);
    }
  });

  it("never surfaces education-only or non-benefit interventions (claim-safety spine)", () => {
    // The swipe-up panel must inherit the same anti-overclaim guarantee as the
    // scorer: a supplement/extract record (e.g. UC curcumin) or a no-benefit /
    // exclude direction must never reach the user as a dish's "evidence", even
    // for a dish whose text mentions the underlying ingredient.
    const probes = [
      dish("Turmeric & Curcumin Rice", ["turmeric", "curcumin", "supplement"]),
      dish("Oats, Salmon, Olive Oil, Vegetables & Nuts Bowl", [
        "oats",
        "salmon",
        "olive oil",
        "vegetables",
        "nuts",
        "legumes",
      ]),
      dish("Coffee-Rubbed Fish with Greens", ["coffee", "fish", "greens"]),
    ];
    for (const d of probes) {
      for (const m of matchInterventionsForDish(d)) {
        expect(m.record.interventionClass).not.toBe("extract-or-supplement");
        expect(["lowers", "raises", "improves-symptoms"]).toContain(
          m.record.direction,
        );
        expect(m.matchedSignals.length).toBeGreaterThan(0);
      }
    }
  });
});
