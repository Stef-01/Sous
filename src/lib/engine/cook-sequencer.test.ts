import { describe, it, expect } from "vitest";
import {
  sequenceDishes,
  buildSequencerDish,
  type SequencerDish,
} from "./cook-sequencer";

describe("cook-sequencer", () => {
  const coldSalad: SequencerDish = {
    slug: "caesar-salad",
    name: "Caesar Salad",
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    temperature: "cold",
    steps: [
      {
        dishSlug: "caesar-salad",
        dishName: "Caesar Salad",
        stepIndex: 0,
        instruction: "Wash and chop romaine lettuce",
        durationMinutes: 3,
        isPassive: false,
        timerSeconds: null,
      },
      {
        dishSlug: "caesar-salad",
        dishName: "Caesar Salad",
        stepIndex: 1,
        instruction: "Make dressing and toss salad",
        durationMinutes: 5,
        isPassive: false,
        timerSeconds: null,
      },
    ],
  };

  const hotPotato: SequencerDish = {
    slug: "roasted-potatoes",
    name: "Roasted Potatoes",
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    temperature: "hot",
    steps: [
      {
        dishSlug: "roasted-potatoes",
        dishName: "Roasted Potatoes",
        stepIndex: 0,
        instruction: "Cut potatoes into cubes and season",
        durationMinutes: 5,
        isPassive: false,
        timerSeconds: null,
      },
      {
        dishSlug: "roasted-potatoes",
        dishName: "Roasted Potatoes",
        stepIndex: 1,
        instruction: "Roast in oven at 425°F until golden",
        durationMinutes: 25,
        isPassive: true,
        timerSeconds: 1500,
      },
      {
        dishSlug: "roasted-potatoes",
        dishName: "Roasted Potatoes",
        stepIndex: 2,
        instruction: "Remove and season with herbs",
        durationMinutes: 2,
        isPassive: false,
        timerSeconds: null,
      },
    ],
  };

  const quickStirFry: SequencerDish = {
    slug: "stir-fry-veg",
    name: "Stir-Fry Vegetables",
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    temperature: "hot",
    steps: [
      {
        dishSlug: "stir-fry-veg",
        dishName: "Stir-Fry Vegetables",
        stepIndex: 0,
        instruction: "Slice all vegetables",
        durationMinutes: 4,
        isPassive: false,
        timerSeconds: null,
      },
      {
        dishSlug: "stir-fry-veg",
        dishName: "Stir-Fry Vegetables",
        stepIndex: 1,
        instruction: "Stir-fry on high heat",
        durationMinutes: 5,
        isPassive: false,
        timerSeconds: 300,
      },
    ],
  };

  it("returns empty sequence for no dishes", () => {
    const result = sequenceDishes([]);
    expect(result.steps).toHaveLength(0);
    expect(result.totalEstimatedMinutes).toBe(0);
  });

  it("returns single dish steps in order", () => {
    const result = sequenceDishes([coldSalad]);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].dishSlug).toBe("caesar-salad");
    expect(result.steps[1].dishSlug).toBe("caesar-salad");
    expect(result.dishOrder).toEqual(["caesar-salad"]);
  });

  it("prioritizes cold dishes first in multi-dish sequence", () => {
    const result = sequenceDishes([hotPotato, coldSalad]);
    expect(result.steps[0].dishSlug).toBe("caesar-salad");
  });

  it("sorts by total time (longest first) among same-temperature dishes", () => {
    const result = sequenceDishes([quickStirFry, hotPotato]);
    expect(result.dishOrder[0]).toBe("roasted-potatoes");
  });

  it("adds parallel hints during passive steps", () => {
    const result = sequenceDishes([hotPotato, quickStirFry]);
    const passiveStep = result.steps.find(
      (s) => s.isPassive && s.timerSeconds && s.timerSeconds > 120,
    );
    expect(passiveStep?.parallelHint).toBeTruthy();
    expect(passiveStep?.parallelHint).toContain("While");
  });

  it("interleaves steps during passive wait times", () => {
    const result = sequenceDishes([hotPotato, quickStirFry]);
    const roastStep = result.steps.findIndex(
      (s) => s.dishSlug === "roasted-potatoes" && s.isPassive,
    );
    if (roastStep >= 0 && roastStep < result.steps.length - 1) {
      expect(result.steps[roastStep + 1].dishSlug).toBe("stir-fry-veg");
    }
  });

  it("handles three dishes with mixed temperatures", () => {
    const result = sequenceDishes([quickStirFry, hotPotato, coldSalad]);
    expect(result.steps.length).toBe(7);
    expect(result.dishOrder[0]).toBe("caesar-salad");
  });

  describe("buildSequencerDish", () => {
    it("converts raw dish data to sequencer format", () => {
      const dish = buildSequencerDish({
        slug: "test",
        name: "Test Dish",
        prepTimeMinutes: 5,
        cookTimeMinutes: 10,
        temperature: "hot",
        steps: [
          { instruction: "Chop vegetables", timerSeconds: null },
          { instruction: "Simmer for 10 minutes", timerSeconds: 600 },
        ],
      });
      expect(dish.steps).toHaveLength(2);
      expect(dish.steps[0].isPassive).toBe(false);
      expect(dish.steps[1].isPassive).toBe(true);
      expect(dish.steps[1].durationMinutes).toBe(10);
    });

    it("classifies cold temperature correctly", () => {
      const dish = buildSequencerDish({
        slug: "salad",
        name: "Salad",
        prepTimeMinutes: 5,
        cookTimeMinutes: 0,
        temperature: "cold",
        steps: [{ instruction: "Toss salad", timerSeconds: null }],
      });
      expect(dish.temperature).toBe("cold");
    });
  });
});
