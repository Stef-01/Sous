import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sides from "./sides.json";
import { guidedCookData } from "./guided-cook-steps";
import { assertNoMedicalClaim } from "@/lib/therapeutics/claim-contract";

describe("black bean brownies (founder blog recipe, 2026-06-11)", () => {
  const dish = guidedCookData["black-bean-brownies"];
  const side = (sides as Array<{ id: string; imageUrl: string }>).find(
    (s) => s.id === "black-bean-brownies",
  );

  it("registered in BOTH the catalog and the guided-cook layer (rule 7)", () => {
    expect(side).toBeDefined();
    expect(dish).toBeDefined();
    expect(dish.steps.length).toBe(5);
    expect(dish.ingredients.length).toBe(9);
  });

  it("folder-per-food: hero image exists in the new structure", () => {
    expect(side!.imageUrl).toBe("/food_images/black-bean-brownies/hero.jpg");
    expect(existsSync(join(process.cwd(), "public", side!.imageUrl))).toBe(
      true,
    );
    expect(dish.heroImageUrl).toBe(side!.imageUrl);
  });

  it("every health line passes the claim contract (no disease-claim verbs)", () => {
    for (const step of dish.steps) {
      const text = [
        step.instruction,
        step.cuisineFact ?? "",
        step.quickHack ?? "",
        step.mistakeWarning ?? "",
      ].join(" ");
      const res = assertNoMedicalClaim(text);
      expect(res.violations, `step ${step.stepNumber}`).toEqual([]);
    }
    expect(assertNoMedicalClaim(dish.description).violations).toEqual([]);
  });

  it("bake step carries the 20-25 min timer + toothpick cue", () => {
    const bake = dish.steps.find((s) => s.timerSeconds === 1500);
    expect(bake).toBeDefined();
    expect(bake!.donenessCue).toMatch(/toothpick/i);
  });

  it("flax substitution preserved for the egg-free path", () => {
    const eggs = dish.ingredients.find((i) => i.id === "bbb-eggs");
    expect(eggs!.substitution).toMatch(/flax/i);
  });
});
