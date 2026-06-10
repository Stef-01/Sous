import { describe, expect, it } from "vitest";
import { GOAL_PLANS } from "./goal-plans";
import { assertNoMedicalClaim } from "@/lib/therapeutics/claim-contract";
import { FLAGGABLE_DEFICIT_KEYS } from "./deficits";

describe("goal plans", () => {
  it("every plan string passes the claim contract (no disease-claim verbs)", () => {
    for (const p of GOAL_PLANS) {
      const text = [p.label, p.note, p.avoid ?? ""].join(" ");
      const res = assertNoMedicalClaim(text);
      expect(res.violations).toEqual([]);
    }
  });

  it("every plan nutrient is a real flaggable vector key", () => {
    for (const p of GOAL_PLANS)
      for (const k of p.nutrients)
        expect(FLAGGABLE_DEFICIT_KEYS.has(k), `${p.id}:${k}`).toBe(true);
  });

  it("plans are small (focus, not a checklist)", () => {
    for (const p of GOAL_PLANS)
      expect(p.nutrients.length).toBeLessThanOrEqual(3);
  });
});
