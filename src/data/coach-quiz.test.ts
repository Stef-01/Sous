import { describe, it, expect } from "vitest";
import {
  computePreferencesFromAnswers,
  topCuisines,
  topFlavors,
  coachQuizQuestions,
} from "./coach-quiz";

describe("Coach Quiz — Preference Computation", () => {
  it("returns moderate effort tolerance with all nulls (skipped)", () => {
    const result = computePreferencesFromAnswers([
      null,
      null,
      null,
      null,
      null,
    ]);
    expect(result.effortTolerance).toBe("moderate");
    expect(Object.keys(result.preferences)).toHaveLength(0);
  });

  it("aggregates preference updates from selected options", () => {
    // Select first option for all questions
    const answers = coachQuizQuestions.map(() => 0);
    const result = computePreferencesFromAnswers(answers);
    expect(Object.keys(result.preferences).length).toBeGreaterThan(0);
  });

  it("clamps preference values to -1..1 range", () => {
    const answers = coachQuizQuestions.map(() => 0);
    const result = computePreferencesFromAnswers(answers);
    for (const value of Object.values(result.preferences)) {
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it("handles partial answers (some nulls)", () => {
    const answers: (number | null)[] = [0, null, 1, null, 0];
    const result = computePreferencesFromAnswers(answers);
    // Should not throw, should produce valid output
    expect(result.effortTolerance).toBeDefined();
    expect(result.preferences).toBeDefined();
  });

  it("sets effort tolerance from options that specify it", () => {
    // Find a question option that sets effortLevel
    let answerWithEffort: (number | null)[] | null = null;
    for (let qi = 0; qi < coachQuizQuestions.length; qi++) {
      for (let oi = 0; oi < coachQuizQuestions[qi].options.length; oi++) {
        if (coachQuizQuestions[qi].options[oi].effortLevel) {
          answerWithEffort = Array(coachQuizQuestions.length).fill(null);
          answerWithEffort![qi] = oi;
          break;
        }
      }
      if (answerWithEffort) break;
    }

    if (answerWithEffort) {
      const result = computePreferencesFromAnswers(answerWithEffort);
      expect(["minimal", "moderate", "willing"]).toContain(
        result.effortTolerance,
      );
    }
  });
});

describe("Coach Quiz — Summary Helpers", () => {
  it("topCuisines returns labels for positive cuisine preferences", () => {
    const prefs = { japanese: 0.8, indian: 0.5, mexican: -0.2 };
    const result = topCuisines(prefs, 2);
    expect(result).toContain("Japanese");
    expect(result).toContain("Indian");
    expect(result).not.toContain("Mexican");
  });

  it("topCuisines returns empty for no positive cuisines", () => {
    const result = topCuisines({}, 2);
    expect(result).toHaveLength(0);
  });

  it("topFlavors returns labels for positive flavor preferences", () => {
    const prefs = { spicy: 0.6, fresh: 0.4, creamy: -0.1 };
    const result = topFlavors(prefs, 2);
    expect(result).toContain("Spicy");
    expect(result).toContain("Fresh");
    expect(result).not.toContain("Creamy");
  });
});
