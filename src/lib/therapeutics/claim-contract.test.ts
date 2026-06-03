import { describe, expect, it } from "vitest";
import {
  assertNoMedicalClaim,
  isClaimSafe,
  FOOD_FIRST_HEDGE,
} from "./claim-contract";

describe("assertNoMedicalClaim", () => {
  it("rejects disease-claim verbs", () => {
    for (const bad of [
      "This recipe cures IBS.",
      "Turmeric treats ulcerative colitis.",
      "Reverses fatty liver disease.",
      "A miracle food that heals your gut.",
      "Guaranteed to lower your cholesterol.",
      "Prevents anemia outright.",
      "Helps diagnose celiac disease.",
    ]) {
      expect(assertNoMedicalClaim(bad).ok, bad).toBe(false);
    }
  });

  it("accepts structure-function-safe + clinical-referral phrasing", () => {
    for (const good of [
      "Supports a Portfolio-style LDL plan via beta-glucan and nuts.",
      "A good source of soluble fiber; helps with regularity for some people.",
      "Associated with lower anemia risk in fortified-food trials.",
      "Not a replacement for your clinician's care.",
      FOOD_FIRST_HEDGE,
      // 'treatment' and 'care' must NOT trip the word-boundary matcher:
      "Severe deficiency still needs standard medical treatment with your clinician.",
    ]) {
      const res = assertNoMedicalClaim(good);
      expect(res.ok, `${good} -> ${JSON.stringify(res.violations)}`).toBe(true);
    }
  });

  it("reports the offending term + context", () => {
    const res = assertNoMedicalClaim("Our plan cures high cholesterol fast.");
    expect(res.ok).toBe(false);
    expect(res.violations[0].term.toLowerCase()).toBe("cures");
    expect(res.violations[0].context).toContain("cures");
  });

  it("isClaimSafe mirrors assertNoMedicalClaim", () => {
    expect(isClaimSafe("good source of fiber")).toBe(true);
    expect(isClaimSafe("cures everything")).toBe(false);
  });

  it("the canonical hedge is itself claim-safe", () => {
    expect(isClaimSafe(FOOD_FIRST_HEDGE)).toBe(true);
  });
});
