import { describe, expect, it } from "vitest";

import { PULSES, PULSE_IDS, pulsesForAnchor, type PulseAnchor } from "./pulses";
import { SurveyStepSchema } from "@/types/survey";
import { FOOD_GLYPH_NAMES } from "@/components/icons/food-glyphs";
import { assertNoMedicalClaim } from "@/lib/therapeutics/claim-contract";

const STAT_BAN = /\d+\s*%[^.]*\b(users|cooks|people|members|customers)\b/i;

describe("PULSES registry", () => {
  it("has unique ids and is non-trivial", () => {
    expect(new Set(PULSE_IDS).size).toBe(PULSE_IDS.length);
    expect(PULSES.length).toBeGreaterThanOrEqual(5);
  });

  it("every pulse is a single-step SurveyDef that validates", () => {
    for (const p of PULSES) {
      expect(p.def.steps, p.id).toHaveLength(1);
      expect(() => SurveyStepSchema.parse(p.def.steps[0]), p.id).not.toThrow();
      expect(p.anchors.length, p.id).toBeGreaterThanOrEqual(1);
    }
  });

  it("every glyph referenced is registered", () => {
    for (const p of PULSES) {
      const step = p.def.steps[0];
      const glyphs: (string | undefined)[] = [];
      if ("options" in step) for (const o of step.options) glyphs.push(o.glyph);
      if (step.kind === "thumbs")
        for (const r of step.rows) glyphs.push(r.glyph);
      if (step.kind === "statements")
        for (const s of step.statements) glyphs.push(s.glyph);
      for (const g of glyphs) {
        if (g) expect(FOOD_GLYPH_NAMES, `${p.id}:${g}`).toContain(g);
      }
    }
  });

  describe("copy safety (D-22 + claim contract)", () => {
    const strings: string[] = [];
    for (const p of PULSES) {
      const step = p.def.steps[0];
      if ("title" in step && step.title) strings.push(step.title);
      if ("subtitle" in step && step.subtitle) strings.push(step.subtitle);
      if ("options" in step)
        for (const o of step.options) strings.push(o.label);
      if (step.kind === "thumbs")
        for (const r of step.rows) strings.push(r.label);
      if (step.kind === "statements")
        for (const s of step.statements) strings.push(s.text);
    }

    it("is free of medical claims", () => {
      for (const s of strings) expect(assertNoMedicalClaim(s).ok, s).toBe(true);
    });
    it("is free of fabricated social-proof stats", () => {
      for (const s of strings) expect(STAT_BAN.test(s), s).toBe(false);
    });
  });

  it("pulsesForAnchor returns only pulses carrying that anchor", () => {
    const anchors: PulseAnchor[] = [
      "win-close",
      "deck-exhaust",
      "plan-open",
      "visit",
    ];
    for (const a of anchors) {
      for (const p of pulsesForAnchor(a)) {
        expect(p.anchors, `${p.id}@${a}`).toContain(a);
      }
    }
  });
});
