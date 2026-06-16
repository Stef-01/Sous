import { describe, expect, it } from "vitest";

import { AgeBandSchema, SurveySignalsSchema, SurveyStepSchema } from "./survey";

describe("SurveyStepSchema — round-trips every kind", () => {
  const steps = [
    {
      kind: "single",
      id: "s",
      title: "t",
      options: [{ value: "a", label: "A" }],
    },
    { kind: "multi", id: "m", title: "t", options: [], noneValue: "none" },
    { kind: "chips", id: "c", title: "t", options: [] },
    { kind: "likert", id: "l", title: "t", options: [] },
    { kind: "statements", id: "st", statements: [{ id: "x", text: "y" }] },
    {
      kind: "thumbs",
      id: "th",
      title: "t",
      rows: [{ value: "v", label: "L" }],
    },
    { kind: "photo-tiles", id: "p", title: "t", options: [] },
    { kind: "glyph-grid", id: "g", title: "t", options: [] },
    { kind: "wheel", id: "w", title: "t", min: 0, max: 10, default: 5 },
    { kind: "interstitial", id: "i", title: "t" },
    {
      kind: "mirror",
      id: "mi",
      title: "t",
      cards: [{ text: "c" }],
      ctaLabel: "go",
    },
  ];

  it.each(steps)("parses a $kind step", (step) => {
    expect(() => SurveyStepSchema.parse(step)).not.toThrow();
  });

  it("applies the glyph-grid mode default", () => {
    const parsed = SurveyStepSchema.parse({
      kind: "glyph-grid",
      id: "g",
      title: "t",
      options: [],
    });
    expect(parsed).toMatchObject({ mode: "select" });
  });

  it("applies the wheel step default", () => {
    const parsed = SurveyStepSchema.parse({
      kind: "wheel",
      id: "w",
      title: "t",
      min: 0,
      max: 10,
      default: 5,
    });
    expect(parsed).toMatchObject({ step: 1 });
  });

  it("rejects an unknown kind", () => {
    expect(() =>
      SurveyStepSchema.parse({ kind: "bogus", id: "x", title: "t" }),
    ).toThrow();
  });
});

describe("SurveySignalsSchema", () => {
  it("accepts a full signal bundle", () => {
    expect(() =>
      SurveySignalsSchema.parse({
        preferenceUpdates: { spicy: 0.5 },
        effortTolerance: "minimal",
        flags: { budgetSensitive: true },
        suppressedTags: ["beef"],
        parentModeAgeBand: "4-8",
      }),
    ).not.toThrow();
  });

  it("accepts a null parentModeAgeBand", () => {
    expect(
      SurveySignalsSchema.parse({ parentModeAgeBand: null }).parentModeAgeBand,
    ).toBeNull();
  });

  it("rejects unknown keys (strict)", () => {
    expect(() => SurveySignalsSchema.parse({ bogus: true })).toThrow();
  });

  it("rejects an invalid effort enum", () => {
    expect(() =>
      SurveySignalsSchema.parse({ effortTolerance: "lazy" }),
    ).toThrow();
  });
});

describe("AgeBandSchema", () => {
  it("accepts the known bands", () => {
    for (const b of ["1-3", "4-8", "9-13", "14-18", "mix"]) {
      expect(AgeBandSchema.safeParse(b).success).toBe(true);
    }
  });
  it("rejects unknown bands", () => {
    expect(AgeBandSchema.safeParse("19-25").success).toBe(false);
  });
});
