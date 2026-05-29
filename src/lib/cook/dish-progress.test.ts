import { describe, expect, it } from "vitest";
import { buildDishProgress } from "./dish-progress";

describe("buildDishProgress", () => {
  const dishes = [
    { name: "Butter chicken", totalSteps: 6 },
    { name: "Basmati rice", totalSteps: 4 },
    { name: "Cucumber raita", totalSteps: 3 },
  ];

  it("dish before active is fully complete", () => {
    const result = buildDishProgress(dishes, 1, 2);
    expect(result[0]).toEqual({
      name: "Butter chicken",
      totalSteps: 6,
      completedSteps: 6,
      progress: 1,
      isActive: false,
    });
  });

  it("dish after active is at zero", () => {
    const result = buildDishProgress(dishes, 1, 2);
    expect(result[2]).toEqual({
      name: "Cucumber raita",
      totalSteps: 3,
      completedSteps: 0,
      progress: 0,
      isActive: false,
    });
  });

  it("active dish reflects current step index", () => {
    const result = buildDishProgress(dishes, 1, 2);
    expect(result[1]).toEqual({
      name: "Basmati rice",
      totalSteps: 4,
      completedSteps: 2,
      progress: 0.5,
      isActive: true,
    });
  });

  it("clamps overshoot on the active dish", () => {
    const result = buildDishProgress(dishes, 0, 999);
    expect(result[0].completedSteps).toBe(6);
    expect(result[0].progress).toBe(1);
  });

  it("clamps negative step index on the active dish", () => {
    const result = buildDishProgress(dishes, 0, -3);
    expect(result[0].completedSteps).toBe(0);
    expect(result[0].progress).toBe(0);
  });

  it("handles a dish with zero total steps without dividing by zero", () => {
    const empty = [{ name: "Garnish", totalSteps: 0 }];
    const result = buildDishProgress(empty, 0, 0);
    expect(result[0].progress).toBe(0);
    expect(result[0].completedSteps).toBe(0);
  });

  it("returns one entry per input dish", () => {
    const result = buildDishProgress(dishes, 0, 0);
    expect(result).toHaveLength(3);
  });

  it("first dish active at step 0 → all zeros", () => {
    const result = buildDishProgress(dishes, 0, 0);
    expect(result.map((r) => r.progress)).toEqual([0, 0, 0]);
    expect(result[0].isActive).toBe(true);
  });

  it("last dish complete → all 1.0", () => {
    const result = buildDishProgress(dishes, 2, 3);
    expect(result.map((r) => r.progress)).toEqual([1, 1, 1]);
    expect(result[2].isActive).toBe(true);
  });

  it("preserves dish names in order", () => {
    const result = buildDishProgress(dishes, 1, 2);
    expect(result.map((r) => r.name)).toEqual([
      "Butter chicken",
      "Basmati rice",
      "Cucumber raita",
    ]);
  });

  it("activeDishIndex out of range → no dish is marked active", () => {
    const result = buildDishProgress(dishes, 99, 0);
    expect(result.every((r) => r.isActive === false)).toBe(true);
    // Every dish is "before" the out-of-range active index → all complete.
    expect(result.every((r) => r.progress === 1)).toBe(true);
  });

  it("empty dish list returns empty array", () => {
    expect(buildDishProgress([], 0, 0)).toEqual([]);
  });
});
