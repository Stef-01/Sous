import { describe, expect, it } from "vitest";
import { weightsForProfile, THERAPEUTIC_WEIGHT } from "./therapeutic-weights";
import { DEFAULT_WEIGHTS } from "./types";

const sum = (w: Record<string, number>) =>
  Object.values(w).reduce((a, b) => a + b, 0);

describe("weightsForProfile", () => {
  it("returns DEFAULT_WEIGHTS unchanged when inactive", () => {
    expect(weightsForProfile(false)).toEqual(DEFAULT_WEIGHTS);
  });

  it("adds therapeuticFit and still sums to 1.0 when active", () => {
    const w = weightsForProfile(true);
    expect(w.therapeuticFit).toBe(THERAPEUTIC_WEIGHT);
    expect(sum(w)).toBeCloseTo(1.0, 10);
  });

  it("keeps taste dimensions above the therapeutic weight", () => {
    const w = weightsForProfile(true);
    expect(w.cuisineFit).toBeGreaterThan(w.therapeuticFit!);
    expect(w.flavorContrast).toBeGreaterThan(w.therapeuticFit!);
  });
});
