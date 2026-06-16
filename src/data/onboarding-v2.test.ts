import { describe, expect, it } from "vitest";

import {
  collectOnboardingStrings,
  ONBOARDING_MASTERY_CUISINES,
  ONBOARDING_V2_DEF,
} from "./onboarding-v2";
import { SurveyStepSchema } from "@/types/survey";
import { FOOD_GLYPH_NAMES } from "@/components/icons/food-glyphs";
import { assertNoMedicalClaim } from "@/lib/therapeutics/claim-contract";

// D-22: ban fabricated social-proof stats like "25% of users save money".
const STAT_BAN = /\d+\s*%[^.]*\b(users|cooks|people|members|customers)\b/i;

describe("ONBOARDING_V2_DEF", () => {
  it("every step's data validates against SurveyStepSchema", () => {
    for (const step of ONBOARDING_V2_DEF.steps) {
      expect(() => SurveyStepSchema.parse(step), step.id).not.toThrow();
    }
  });

  it("every glyph referenced is registered", () => {
    for (const step of ONBOARDING_V2_DEF.steps) {
      const glyphs: (string | undefined)[] = [];
      if ("options" in step) for (const o of step.options) glyphs.push(o.glyph);
      if (step.kind === "thumbs")
        for (const r of step.rows) glyphs.push(r.glyph);
      if (step.kind === "statements")
        for (const s of step.statements) glyphs.push(s.glyph);
      if (step.kind === "interstitial") glyphs.push(step.glyph);
      for (const g of glyphs) {
        if (g) expect(FOOD_GLYPH_NAMES, `${step.id}:${g}`).toContain(g);
      }
    }
  });

  it("offers eight glyph-backed mastery cuisines", () => {
    expect(ONBOARDING_MASTERY_CUISINES).toHaveLength(8);
    for (const c of ONBOARDING_MASTERY_CUISINES) {
      expect(FOOD_GLYPH_NAMES, c.key).toContain(c.glyph);
    }
  });

  it("only branches the parent + numeric steps", () => {
    const branched = ONBOARDING_V2_DEF.steps
      .filter((s) => s.showIf)
      .map((s) => s.id);
    expect(branched).toEqual([
      "parentAge",
      "familyBelief",
      "numericIntro",
      "sex",
      "age",
      "height",
      "weight",
    ]);
  });

  describe("copy safety (D-22 + claim contract)", () => {
    const strings = collectOnboardingStrings(ONBOARDING_V2_DEF);

    it("collects a non-trivial amount of copy", () => {
      expect(strings.length).toBeGreaterThan(20);
    });

    it("is free of medical claims", () => {
      for (const s of strings) expect(assertNoMedicalClaim(s).ok, s).toBe(true);
    });

    it("is free of fabricated social-proof stats", () => {
      for (const s of strings) expect(STAT_BAN.test(s), s).toBe(false);
    });
  });
});
