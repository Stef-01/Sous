import { describe, expect, it } from "vitest";
import {
  glassesToMl,
  HYDRATION_GOAL_GLASSES,
  ML_PER_GLASS,
} from "./use-hydration";

describe("hydration (W23)", () => {
  it("converts glasses to millilitres", () => {
    expect(glassesToMl(0)).toBe(0);
    expect(glassesToMl(1)).toBe(250);
    expect(glassesToMl(8)).toBe(2000);
  });

  it("the daily goal is 8 glasses ≈ 2 L", () => {
    expect(HYDRATION_GOAL_GLASSES).toBe(8);
    expect(ML_PER_GLASS).toBe(250);
    expect(glassesToMl(HYDRATION_GOAL_GLASSES)).toBe(2000);
  });
});
