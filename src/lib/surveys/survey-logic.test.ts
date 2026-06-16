import { describe, expect, it } from "vitest";

import {
  getVisibleSteps,
  isStepAnswered,
  toggleMultiValue,
} from "./survey-logic";
import type { SurveyStep } from "@/types/survey";

describe("toggleMultiValue", () => {
  it("adds and removes a value", () => {
    expect(toggleMultiValue([], "a")).toEqual(["a"]);
    expect(toggleMultiValue(["a"], "a")).toEqual([]);
    expect(toggleMultiValue(["a"], "b")).toEqual(["a", "b"]);
  });

  it("picking the none-option clears the others", () => {
    expect(toggleMultiValue(["a", "b"], "none", "none")).toEqual(["none"]);
  });

  it("picking a real option clears the none-option", () => {
    expect(toggleMultiValue(["none"], "a", "none")).toEqual(["a"]);
  });

  it("toggling the none-option off clears it", () => {
    expect(toggleMultiValue(["none"], "none", "none")).toEqual([]);
  });
});

describe("getVisibleSteps", () => {
  const steps: SurveyStep[] = [
    { kind: "single", id: "goal", title: "t", options: [] },
    {
      kind: "wheel",
      id: "weight",
      title: "t",
      min: 0,
      max: 1,
      step: 1,
      default: 0,
      showIf: (a) => a.goal === "macros",
    },
    { kind: "mirror", id: "end", title: "t", cards: [], ctaLabel: "go" },
  ];

  it("hides a branch step until its predicate passes", () => {
    expect(getVisibleSteps(steps, {}).map((s) => s.id)).toEqual([
      "goal",
      "end",
    ]);
  });

  it("reveals the branch step when the gating answer matches", () => {
    expect(getVisibleSteps(steps, { goal: "macros" }).map((s) => s.id)).toEqual(
      ["goal", "weight", "end"],
    );
  });
});

describe("isStepAnswered", () => {
  it("single / likert need a non-empty value", () => {
    const step: SurveyStep = {
      kind: "single",
      id: "s",
      title: "t",
      options: [],
    };
    expect(isStepAnswered(step, undefined)).toBe(false);
    expect(isStepAnswered(step, "")).toBe(false);
    expect(isStepAnswered(step, "a")).toBe(true);
  });

  it("multi-style steps need a non-empty array", () => {
    const step: SurveyStep = {
      kind: "glyph-grid",
      id: "g",
      title: "t",
      mode: "select",
      options: [],
    };
    expect(isStepAnswered(step, [])).toBe(false);
    expect(isStepAnswered(step, ["x"])).toBe(true);
  });

  it("statements need every card decided", () => {
    const step: SurveyStep = {
      kind: "statements",
      id: "st",
      statements: [
        { id: "a", text: "a" },
        { id: "b", text: "b" },
      ],
    };
    expect(isStepAnswered(step, { a: true })).toBe(false);
    expect(isStepAnswered(step, { a: true, b: false })).toBe(true);
  });

  it("thumbs / wheel / interstitial / mirror are always satisfiable", () => {
    const thumbs: SurveyStep = {
      kind: "thumbs",
      id: "t",
      title: "t",
      rows: [],
    };
    const inter: SurveyStep = { kind: "interstitial", id: "i", title: "t" };
    expect(isStepAnswered(thumbs, {})).toBe(true);
    expect(isStepAnswered(inter, undefined)).toBe(true);
  });
});
