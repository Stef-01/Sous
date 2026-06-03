import { describe, expect, it } from "vitest";
import { generateExplanation } from "./explainer";
import type {
  ScoreBreakdown,
  ScoredCandidate,
  SideDishCandidate,
} from "./types";

function cand(
  scores: Partial<ScoreBreakdown>,
  name = "Test Side",
): ScoredCandidate {
  return {
    sideDish: { name } as unknown as SideDishCandidate,
    scores: scores as ScoreBreakdown,
    totalScore: 0,
    explanation: "",
  };
}

describe("generateExplanation", () => {
  it("is deterministic for identical input", () => {
    const scores = { cuisineFit: 0.9, flavorContrast: 0.8, prepBurden: 0.2 };
    expect(generateExplanation(cand(scores))).toBe(
      generateExplanation(cand(scores)),
    );
  });

  it("describes the top two dimensions", () => {
    const out = generateExplanation(
      cand({ cuisineFit: 0.9, flavorContrast: 0.8, prepBurden: 0.1 }, "Slaw"),
    );
    expect(out).toBe(
      "Slaw pairs naturally with the cuisine and adds bright contrast.",
    );
  });

  it("falls back when there are no scored dimensions", () => {
    expect(generateExplanation(cand({}, "Rice"))).toBe(
      "Rice pairs well with your meal.",
    );
  });

  it("never mentions the health focus on the default (no-therapeuticFit) path", () => {
    const out = generateExplanation(
      cand({ cuisineFit: 0.9, flavorContrast: 0.85, nutritionBalance: 0.8 }),
    );
    expect(out.toLowerCase()).not.toContain("health focus");
  });

  it("can surface the therapeutic phrase when therapeuticFit ranks top", () => {
    const out = generateExplanation(
      cand({ therapeuticFit: 0.95, cuisineFit: 0.9, flavorContrast: 0.1 }),
    );
    expect(out.toLowerCase()).toContain("health focus");
  });
});
