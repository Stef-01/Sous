import { describe, it, expect } from "vitest";
import mealsData from "@/data/meals.json";
import sidesData from "@/data/sides.json";
import { dishToFood } from "./dish-to-food";

const MEALS = mealsData as {
  id: string;
  name: string;
  heroImageUrl?: string | null;
}[];
const SIDES = sidesData as {
  id: string;
  name: string;
  imageUrl?: string | null;
}[];
const CATALOG = new Set([...MEALS.map((m) => m.id), ...SIDES.map((s) => s.id)]);

describe("dishToFood", () => {
  it("maps a real meal (pho) to a meal-band food with its own photo", () => {
    const food = dishToFood("pho");
    expect(food).not.toBeNull();
    expect(food).toMatchObject({
      id: "pho",
      name: "Pho",
      customImage: "/food_images/pho.png",
      hunger_replenish: 40,
      fun_replenish: 8,
      health_replenish: 6,
      cuisine: "Vietnamese",
    });
  });

  it("maps a real side to a side-band food", () => {
    const side = SIDES[0];
    const food = dishToFood(side.id);
    expect(food).not.toBeNull();
    expect(food!.id).toBe(side.id);
    expect(food!.hunger_replenish).toBe(18);
    expect(food!.cuisine).toBe("");
  });

  it("returns null for user-created dishes (custom-*) — rule 7", () => {
    expect(dishToFood("custom-my-recipe")).toBeNull();
  });

  it("returns null for unknown slugs — rule 7", () => {
    expect(dishToFood("not-a-real-dish-xyz")).toBeNull();
    expect(dishToFood("")).toBeNull();
  });

  it("only ever produces ids that exist in the catalog", () => {
    for (const id of ["pho", "caesar-salad", MEALS[10].id, SIDES[20].id]) {
      const food = dishToFood(id);
      if (food) expect(CATALOG.has(food.id)).toBe(true);
    }
  });

  it("falls back to a real foods_on.png cell when a dish has no photo", () => {
    const noPhotoMeal = MEALS.find((m) => !m.heroImageUrl);
    if (noPhotoMeal) {
      const food = dishToFood(noPhotoMeal.id)!;
      expect(food.customImage).toBeNull();
      expect(food.spriteFallback).toBeGreaterThan(0);
    }
  });
});
