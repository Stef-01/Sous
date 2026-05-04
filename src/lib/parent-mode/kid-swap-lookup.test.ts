import { describe, expect, it } from "vitest";
import {
  isDeterministicLookupSufficient,
  suggestKidSwapsFromLabel,
} from "./kid-swap-lookup";
import { KID_FRIENDLINESS_LABELS } from "@/data/parent-mode/kid-friendliness-labels";
import type { KidFriendlinessLabel } from "@/types/parent-mode";

const safe: KidFriendlinessLabel = {
  recipeSlug: "ideal",
  bitterLoad: 0,
  smellIntensity: 0,
  textureRisk: 0,
  visibleGreenFlecks: false,
  deconstructable: true,
  heatLevel: 0,
  familiarityAnchor: true,
  colorBrightness: 3,
  parentModeEligible: true,
};

describe("suggestKidSwapsFromLabel — risk-driven priority", () => {
  it("returns no swaps for a label with no risks", () => {
    expect(suggestKidSwapsFromLabel(safe)).toHaveLength(0);
  });

  it("flags heat first when heatLevel >= 3", () => {
    const result = suggestKidSwapsFromLabel({ ...safe, heatLevel: 3 });
    expect(result[0]?.label).toBe("Halve the chili");
  });

  it("flags strong smell when smellIntensity >= 2", () => {
    const result = suggestKidSwapsFromLabel({ ...safe, smellIntensity: 3 });
    expect(result.some((s) => s.label === "Sauce on the side")).toBe(true);
  });

  it("flags bitter when bitterLoad >= 2", () => {
    const result = suggestKidSwapsFromLabel({ ...safe, bitterLoad: 2 });
    expect(result.some((s) => s.label === "Skip the bitter green")).toBe(true);
  });

  it("flags visible green flecks with rationale", () => {
    const result = suggestKidSwapsFromLabel({
      ...safe,
      visibleGreenFlecks: true,
    });
    expect(result.some((s) => s.label === "Garnish only the adult plate")).toBe(
      true,
    );
  });

  it("never returns more than 3 swaps", () => {
    const result = suggestKidSwapsFromLabel({
      ...safe,
      heatLevel: 4,
      smellIntensity: 3,
      bitterLoad: 3,
      visibleGreenFlecks: true,
      textureRisk: 3,
      familiarityAnchor: false,
    });
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("handles every hand-curated label without throwing", () => {
    for (const label of KID_FRIENDLINESS_LABELS) {
      const swaps = suggestKidSwapsFromLabel(label);
      expect(Array.isArray(swaps)).toBe(true);
      expect(swaps.length).toBeLessThanOrEqual(3);
    }
  });
});

describe("isDeterministicLookupSufficient", () => {
  it("returns true when 2+ swaps are produced", () => {
    expect(
      isDeterministicLookupSufficient([
        { label: "a", rationale: "" },
        { label: "b", rationale: "" },
      ]),
    ).toBe(true);
  });
  it("returns false for 0 or 1 swaps", () => {
    expect(isDeterministicLookupSufficient([])).toBe(false);
    expect(
      isDeterministicLookupSufficient([{ label: "a", rationale: "" }]),
    ).toBe(false);
  });
});
