import { describe, expect, it } from "vitest";
import { buildEvidenceCard, formatEffect } from "./evidence-card";
import { assertNoMedicalClaim } from "./claim-contract";
import { CONDITION_IDS } from "@/data/therapeutics";

describe("formatEffect", () => {
  it("renders a negative effect with a minus sign + note", () => {
    expect(
      formatEffect({
        metric: "LDL-C MD",
        value: -0.73,
        unit: "mmol/L",
        note: "~ -17%",
      }),
    ).toBe("LDL-C MD −0.73 mmol/L (~ -17%)");
  });

  it("renders a positive effect with a plus sign", () => {
    expect(formatEffect({ metric: "Hb", value: 0.42, unit: "g/dL" })).toBe(
      "Hb +0.42 g/dL",
    );
  });
});

describe("buildEvidenceCard", () => {
  it("builds the LDL card with a graded, classed fortified row", () => {
    const card = buildEvidenceCard("high-ldl");
    expect(card.displayName).toBe("High LDL cholesterol");
    expect(card.reviewed).toBe(false); // gate G1 not cleared
    expect(card.rows.length).toBeGreaterThan(0);
    expect(card.rows.some((r) => r.classLabel === "Fortified food")).toBe(true);
    expect(card.rows.some((r) => r.gradeLabel === "Moderate")).toBe(true);
  });

  it("flags extract records as education-only (IBS peppermint)", () => {
    const card = buildEvidenceCard("ibs");
    const edu = card.rows.filter((r) => r.isEducation);
    expect(edu.length).toBeGreaterThan(0);
    expect(edu.every((r) => r.classLabel.includes("education"))).toBe(true);
  });

  it("carries the food-first hedge and never a medical claim", () => {
    for (const id of CONDITION_IDS) {
      const card = buildEvidenceCard(id);
      expect(assertNoMedicalClaim(card.hedge).ok).toBe(true);
      for (const row of card.rows) {
        expect(assertNoMedicalClaim(row.note).ok, `${id}/${row.id}`).toBe(true);
      }
    }
  });
});
