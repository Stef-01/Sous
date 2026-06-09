import { describe, it, expect } from "vitest";

/**
 * MIRROR of the status→copy logic currently inlined in meal-health-panel.tsx
 * (statusLabel at L105-109, glance pill at L189-195). Extract these into a
 * shared pure helper and import it here so this test guards production, not a copy.
 */
function reviewStatus(
  reviewed: boolean,
  clinicianReview: boolean,
): {
  badge: "Reviewed" | "Clinician review" | "Educational";
  glancePill: string | null;
} {
  const badge = reviewed
    ? "Reviewed"
    : clinicianReview
      ? "Clinician review"
      : "Educational";
  const glancePill = reviewed
    ? null
    : clinicianReview
      ? "Clinician review · unreviewed"
      : "Educational · not reviewed";
  return { badge, glancePill };
}

describe("review-status copy (R1 — unreviewed is never hidden)", () => {
  it("reviewed → 'Reviewed' badge and NO glance caveat pill", () => {
    expect(reviewStatus(true, false)).toEqual({
      badge: "Reviewed",
      glancePill: null,
    });
    // reviewed dominates clinicianReview
    expect(reviewStatus(true, true)).toEqual({
      badge: "Reviewed",
      glancePill: null,
    });
  });

  it("clinician-review → amber badge and an explicit 'unreviewed' glance pill", () => {
    const s = reviewStatus(false, true);
    expect(s.badge).toBe("Clinician review");
    expect(s.glancePill).toBe("Clinician review · unreviewed");
  });

  it("default (neither) → 'Educational' badge and a 'not reviewed' glance pill", () => {
    const s = reviewStatus(false, false);
    expect(s.badge).toBe("Educational");
    expect(s.glancePill).toBe("Educational · not reviewed");
  });

  it("the never-hide rule: whenever the dish is not reviewed, a glance caveat is present and says so", () => {
    for (const clinicianReview of [false, true]) {
      const { glancePill } = reviewStatus(false, clinicianReview);
      expect(glancePill).not.toBeNull();
      expect(/unreviewed|not reviewed/i.test(glancePill!)).toBe(true);
    }
  });

  it("clinician-review NEVER reads as 'Reviewed' (the load-bearing honesty case)", () => {
    const s = reviewStatus(false, true);
    expect(s.badge).not.toBe("Reviewed");
    expect(s.glancePill).not.toMatch(/^Reviewed/);
  });
});
