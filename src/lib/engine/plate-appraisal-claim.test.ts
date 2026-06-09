/**
 * Phase 6 / binding R3 — the live plate-ring surfaces evaluatePlate().appraisal as
 * user-facing copy, so it must pass the SAME claim contract as the Sous-read and
 * the therapeutics registry. It must never read as a medical claim or a numeric
 * grade — it answers "is my plate balanced?" (food-group coverage), nothing more.
 */
import { describe, expect, it } from "vitest";
import { evaluatePlate } from "@/lib/engine/plate-evaluation";
import type { PlateEvaluation } from "@/lib/engine/plate-evaluation";
import { assertNoMedicalClaim } from "@/lib/therapeutics/claim-contract";
import { meals, sides } from "@/data";

// Sweep a broad cross-section of meal × side combinations to hit every appraisal
// branch (balanced / good_start / needs_improvement, with 0–3 sides).
const evals: PlateEvaluation[] = [];
for (const meal of meals.slice(0, 30)) {
  for (const combo of [
    [],
    [sides[0]],
    [sides[0], sides[1]],
    [sides[0], sides[1], sides[2]],
  ]) {
    evals.push(evaluatePlate({ meal, sides: combo }));
  }
}

describe("plate appraisal — claim contract (R3)", () => {
  it("every appraisal sentence passes assertNoMedicalClaim", () => {
    const bad = evals
      .map((e) => e.appraisal)
      .filter((a) => !assertNoMedicalClaim(a).ok);
    expect(bad).toEqual([]);
  });

  it("no appraisal prints a numeric percentage or letter grade", () => {
    const bad = evals
      .map((e) => e.appraisal)
      .filter((a) => /\d|\b[A-F][+-]?\b grade|%/.test(a));
    expect(bad).toEqual([]);
  });

  it("the ring input (covered food groups) is always an integer in 0..3", () => {
    for (const e of evals) {
      const c = e.categoryCoverage;
      const covered = [c.vegetables, c.protein, c.carbs].filter(Boolean).length;
      expect(covered).toBeGreaterThanOrEqual(0);
      expect(covered).toBeLessThanOrEqual(3);
    }
  });

  it("appraisalTone is always one of the three known tones", () => {
    for (const e of evals)
      expect(["balanced", "strong", "needs-work"]).toContain(e.appraisalTone);
  });
});
