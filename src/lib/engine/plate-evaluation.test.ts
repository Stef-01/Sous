import { describe, it, expect } from "vitest";
import { evaluatePlate } from "./plate-evaluation";
import type { Meal, SideDish } from "@/types";

// ── Test fixtures ──────────────────────────────────────

const chickenMeal: Meal = {
  id: "chicken-tikka",
  name: "Chicken Tikka Masala",
  aliases: [],
  heroImageUrl: null,
  sidePool: [],
  cuisine: "indian",
  description: "Chicken in a creamy tomato-based sauce.",
};

const pastaMeal: Meal = {
  id: "pasta-carbonara",
  name: "Pasta Carbonara",
  aliases: [],
  heroImageUrl: null,
  sidePool: [],
  cuisine: "italian",
  description: "Pasta with egg, cheese, and pancetta.",
};

function makeSide(
  overrides: Partial<SideDish> & { id: string; name: string },
): SideDish {
  return {
    imageUrl: "",
    tags: [],
    description: "",
    pairingReason: "",
    nutritionCategory: "vegetable",
    ...overrides,
  };
}

const vegSide = makeSide({
  id: "caesar",
  name: "Caesar Salad",
  tags: ["fresh", "crunchy", "creamy"],
  nutritionCategory: "vegetable",
});

const carbSide = makeSide({
  id: "naan",
  name: "Garlic Naan",
  tags: ["bread", "savory", "buttery"],
  nutritionCategory: "carb",
});

const proteinSide = makeSide({
  id: "edamame",
  name: "Edamame",
  tags: ["protein", "light", "savory"],
  nutritionCategory: "protein",
});

const carbSide2 = makeSide({
  id: "rice",
  name: "Basmati Rice",
  tags: ["grain", "plain"],
  nutritionCategory: "carb",
});

// ── Tests ──────────────────────────────────────────────

describe("Plate Evaluation Engine", () => {
  describe("Category coverage", () => {
    it("detects all three categories covered", () => {
      const result = evaluatePlate({
        meal: chickenMeal, // protein main
        sides: [vegSide, carbSide],
      });
      expect(result.categoryCoverage.vegetables).toBe(true);
      expect(result.categoryCoverage.protein).toBe(true);
      expect(result.categoryCoverage.carbs).toBe(true);
    });

    it("detects missing vegetables", () => {
      const result = evaluatePlate({
        meal: chickenMeal, // protein main
        sides: [carbSide],
      });
      expect(result.categoryCoverage.vegetables).toBe(false);
      expect(result.categoryCoverage.protein).toBe(true);
      expect(result.categoryCoverage.carbs).toBe(true);
    });

    it("detects missing protein", () => {
      const result = evaluatePlate({
        meal: pastaMeal, // carb main
        sides: [vegSide],
      });
      expect(result.categoryCoverage.protein).toBe(false);
    });
  });

  describe("Signal detection", () => {
    it("detects carb-heavy when main is carb and side is carb", () => {
      const result = evaluatePlate({
        meal: pastaMeal, // carb main
        sides: [carbSide],
      });
      expect(result.signals).toContain("carb_heavy");
    });

    it("detects carb-heavy when 2+ carb sides with non-carb main", () => {
      const result = evaluatePlate({
        meal: chickenMeal, // protein main
        sides: [carbSide, carbSide2],
      });
      expect(result.signals).toContain("carb_heavy");
    });

    it("detects freshness_missing when no fresh flavors", () => {
      const plainSide = makeSide({
        id: "plain",
        name: "Plain Rice",
        tags: ["grain", "plain"],
        nutritionCategory: "carb",
      });
      const result = evaluatePlate({
        meal: chickenMeal,
        sides: [plainSide],
      });
      expect(result.signals).toContain("freshness_missing");
    });

    it("does not flag freshness when fresh tags present", () => {
      const result = evaluatePlate({
        meal: chickenMeal,
        sides: [vegSide], // has "fresh" tag
      });
      expect(result.signals).not.toContain("freshness_missing");
    });

    it("signals balanced when all categories and no issues", () => {
      const result = evaluatePlate({
        meal: chickenMeal,
        sides: [vegSide, carbSide],
      });
      // vegSide has "fresh" and "crunchy" and "creamy" tags, so texture+freshness covered
      expect(result.signals).toContain("balanced");
    });
  });

  describe("Status computation", () => {
    it("returns balanced status for a complete plate", () => {
      const result = evaluatePlate({
        meal: chickenMeal,
        sides: [vegSide, carbSide],
      });
      expect(result.status).toBe("balanced");
    });

    it("returns needs_improvement for carb-heavy plate", () => {
      const result = evaluatePlate({
        meal: pastaMeal,
        sides: [carbSide],
      });
      expect(result.status).toBe("needs_improvement");
    });
  });

  describe("Appraisal", () => {
    it("gives balanced appraisal for complete plate", () => {
      const result = evaluatePlate({
        meal: chickenMeal,
        sides: [vegSide, carbSide],
      });
      expect(result.appraisalTone).toBe("balanced");
      expect(result.appraisal).toContain("Balanced");
    });

    it("gives needs-work appraisal for carb-heavy plate", () => {
      const result = evaluatePlate({
        meal: pastaMeal,
        sides: [carbSide],
      });
      expect(result.appraisalTone).toBe("needs-work");
    });
  });

  describe("One best move", () => {
    it("suggests keep_as_is for balanced plate", () => {
      const result = evaluatePlate({
        meal: chickenMeal,
        sides: [vegSide, carbSide],
      });
      expect(result.oneBestMove?.type).toBe("keep_as_is");
    });

    it("suggests swap for carb-heavy plate", () => {
      const result = evaluatePlate({
        meal: pastaMeal,
        sides: [carbSide],
      });
      expect(result.oneBestMove?.type).toBe("swap_side");
    });

    it("suggests adding vegetables when missing", () => {
      const result = evaluatePlate({
        meal: chickenMeal,
        sides: [proteinSide],
      });
      // protein main + protein side = missing veg
      const move = result.oneBestMove;
      expect(move).toBeDefined();
      expect(move?.replacementHint).toBe("vegetable");
    });
  });

  describe("Already working (strengths)", () => {
    it("includes at least one strength", () => {
      const result = evaluatePlate({
        meal: chickenMeal,
        sides: [carbSide],
      });
      expect(result.alreadyWorking.length).toBeGreaterThanOrEqual(1);
    });

    it("mentions all food groups when covered", () => {
      const result = evaluatePlate({
        meal: chickenMeal,
        sides: [vegSide, carbSide],
      });
      expect(result.alreadyWorking).toContain("All three food groups covered");
    });

    it("mentions fresh flavors when present", () => {
      const result = evaluatePlate({
        meal: chickenMeal,
        sides: [vegSide],
      });
      expect(result.alreadyWorking.some((s) => s.includes("Fresh"))).toBe(true);
    });
  });
});
