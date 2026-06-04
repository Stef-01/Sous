import { describe, expect, it } from "vitest";
import { buildClinicianReview } from "./clinician-review";

describe("buildClinicianReview", () => {
  const review = buildClinicianReview();

  it("assembles every condition with its interventions", () => {
    expect(review.conditions.length).toBe(review.stats.conditions);
    expect(review.stats.conditions).toBeGreaterThanOrEqual(10);
    for (const c of review.conditions) {
      expect(c.displayName).toBeTruthy();
      // every record is either scorable or education-only, never both
      expect(Array.isArray(c.scorable)).toBe(true);
      expect(Array.isArray(c.educationOnly)).toBe(true);
    }
  });

  it("counts add up", () => {
    const recCount = review.conditions.reduce(
      (n, c) => n + c.scorable.length + c.educationOnly.length,
      0,
    );
    expect(recCount).toBe(review.stats.interventions);
    expect(review.stats.scorable + review.stats.educationOnly).toBe(
      review.stats.interventions,
    );
    expect(review.stats.unreviewed + review.stats.approved).toBe(
      review.stats.interventions,
    );
  });

  it("passes the live anti-overclaim audit (the G5 artifact)", () => {
    // If this ever fails, a record's human-facing text contains a disease claim.
    expect(review.claimAudit.entries).toEqual([]);
    expect(review.claimAudit.ok).toBe(true);
  });

  it("surfaces the interaction map + scoring weight", () => {
    expect(review.interactions.length).toBeGreaterThan(0);
    expect(review.therapeuticWeight).toBeGreaterThan(0);
    expect(review.therapeuticWeight).toBeLessThan(0.5); // below taste
  });
});
