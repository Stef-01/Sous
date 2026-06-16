import { describe, expect, it } from "vitest";

import { computeSurveySignals } from "./compute-survey-signals";
import type { SurveyStep } from "@/types/survey";

describe("computeSurveySignals", () => {
  it("applies a single-select option's signals", () => {
    const step: SurveyStep = {
      kind: "single",
      id: "goal",
      title: "t",
      options: [
        {
          value: "macros",
          label: "Macros",
          signals: {
            preferenceUpdates: { protein: 0.6 },
            effortTolerance: "willing",
          },
        },
        {
          value: "simple",
          label: "Simple",
          signals: { effortTolerance: "minimal" },
        },
      ],
    };
    const out = computeSurveySignals([step], { goal: "macros" });
    expect(out.preferenceUpdates).toEqual({ protein: 0.6 });
    expect(out.effortTolerance).toBe("willing");
  });

  it("sums + clamps preference deltas to -1..1", () => {
    const step: SurveyStep = {
      kind: "statements",
      id: "beliefs",
      statements: [
        { id: "a", text: "a", signals: { preferenceUpdates: { spicy: 0.7 } } },
        { id: "b", text: "b", signals: { preferenceUpdates: { spicy: 0.7 } } },
        { id: "c", text: "c", signals: { preferenceUpdates: { rich: -0.8 } } },
      ],
    };
    const out = computeSurveySignals([step], {
      beliefs: { a: true, b: true, c: true },
    });
    expect(out.preferenceUpdates.spicy).toBe(1); // 1.4 clamped
    expect(out.preferenceUpdates.rich).toBe(-0.8);
  });

  it("only applies AGREED statements", () => {
    const step: SurveyStep = {
      kind: "statements",
      id: "beliefs",
      statements: [
        { id: "a", text: "a", signals: { flags: { budget: true } } },
        { id: "b", text: "b", signals: { flags: { kids: true } } },
      ],
    };
    const out = computeSurveySignals([step], {
      beliefs: { a: true, b: false },
    });
    expect(out.flags).toEqual({ budget: true });
  });

  it("routes thumbs like/dislike and ignores unset rows", () => {
    const step: SurveyStep = {
      kind: "thumbs",
      id: "cuisines",
      title: "t",
      rows: [
        {
          value: "thai",
          label: "Thai",
          likeSignals: { preferenceUpdates: { thai: 0.8 } },
          dislikeSignals: { suppressedTags: ["thai"] },
        },
        {
          value: "indian",
          label: "Indian",
          dislikeSignals: { suppressedTags: ["indian"] },
        },
        {
          value: "italian",
          label: "Italian",
          likeSignals: { preferenceUpdates: { italian: 0.8 } },
        },
      ],
    };
    const out = computeSurveySignals([step], {
      cuisines: { thai: "like", indian: "dislike" /* italian unset */ },
    });
    expect(out.preferenceUpdates).toEqual({ thai: 0.8 });
    expect(out.suppressedTags).toEqual(["indian"]);
  });

  it("de-dupes suppressed tags across options", () => {
    const step: SurveyStep = {
      kind: "glyph-grid",
      id: "dislikes",
      title: "t",
      mode: "dislike",
      options: [
        { value: "x", label: "X", signals: { suppressedTags: ["egg"] } },
        {
          value: "y",
          label: "Y",
          signals: { suppressedTags: ["egg", "beef"] },
        },
      ],
    };
    const out = computeSurveySignals([step], { dislikes: ["x", "y"] });
    expect(out.suppressedTags).toEqual(["egg", "beef"]);
  });

  it("lets later steps override the effort + parent-mode signals", () => {
    const a: SurveyStep = {
      kind: "single",
      id: "a",
      title: "t",
      options: [
        {
          value: "x",
          label: "X",
          signals: { effortTolerance: "minimal", parentModeAgeBand: null },
        },
      ],
    };
    const b: SurveyStep = {
      kind: "single",
      id: "b",
      title: "t",
      options: [
        {
          value: "y",
          label: "Y",
          signals: { effortTolerance: "willing", parentModeAgeBand: "4-8" },
        },
      ],
    };
    const out = computeSurveySignals([a, b], { a: "x", b: "y" });
    expect(out.effortTolerance).toBe("willing");
    expect(out.parentModeAgeBand).toBe("4-8");
  });

  it("ignores steps with no answer", () => {
    const step: SurveyStep = {
      kind: "single",
      id: "goal",
      title: "t",
      options: [{ value: "a", label: "A", signals: { flags: { x: true } } }],
    };
    const out = computeSurveySignals([step], {});
    expect(out).toEqual({
      preferenceUpdates: {},
      flags: {},
      suppressedTags: [],
    });
  });
});
