import { describe, expect, it } from "vitest";
import { gradeToTier, strengthToTier, TIER } from "./evidence-tier";

describe("evidence-tier mappers (Phase 8)", () => {
  it("gradeToTier maps each grade (moderate stays its OWN amber tier — R6)", () => {
    expect(gradeToTier("high")).toBe("strong");
    expect(gradeToTier("moderate")).toBe("moderate"); // NOT folded into strong
    expect(gradeToTier("low")).toBe("limited");
    expect(gradeToTier("very-low")).toBe("limited");
  });

  it("strengthToTier is a 1:1 identity across the three strengths", () => {
    expect(strengthToTier("strong")).toBe("strong");
    expect(strengthToTier("moderate")).toBe("moderate");
    expect(strengthToTier("limited")).toBe("limited");
  });

  it("TIER exposes exactly the three tiers, each from the --tier-* token ramp", () => {
    expect(Object.keys(TIER).sort()).toEqual(["limited", "moderate", "strong"]);
    for (const t of ["strong", "moderate", "limited"] as const) {
      expect(TIER[t].fg).toMatch(/var\(--tier-/);
      expect(TIER[t].bg).toMatch(/var\(--tier-/);
    }
  });
});
