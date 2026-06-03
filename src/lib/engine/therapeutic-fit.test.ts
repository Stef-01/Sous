import { describe, expect, it } from "vitest";
import { scoreTherapeuticFit, EVIDENCE_WEIGHT } from "./therapeutic-fit";
import type { CareProfile } from "@/types/care-profile";

function care(conditions: CareProfile["conditions"]): CareProfile {
  return { v: 1, conditions, avoid: [], fodmapPhase: null, updatedAt: "" };
}

const dish = (name: string, tags: string[]) => ({ name, tags });

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
