import type { Meal } from "@/types";

export interface NutritionProfile {
  tags: string[];
  category: "protein" | "carb" | "vegetable";
}

// Helper to guess nutrition for main dish since it lacks explicit tags
export function inferMealNutrition(meal: Meal): NutritionProfile {
  const lowerName = meal.name.toLowerCase();
  const lowerDesc = meal.description.toLowerCase();
  const text = `${lowerName} ${lowerDesc}`;

  const tags: string[] = [];
  let category: "protein" | "carb" | "vegetable" = "protein"; // Default to protein for main

  // Heuristic Tagging
  if (text.includes("chicken")) tags.push("chicken");
  if (text.includes("fish") || text.includes("salmon")) tags.push("fish");
  if (text.includes("paneer")) tags.push("paneer");
  if (text.includes("dal") || text.includes("lentil")) tags.push("lentil");
  if (text.includes("tofu")) tags.push("tofu");
  if (
    text.includes("beef") ||
    text.includes("steak") ||
    text.includes("burger")
  )
    tags.push("meat");
  if (text.includes("pork") || text.includes("ribs")) tags.push("meat");

  if (text.includes("rice") || text.includes("biryani")) {
    tags.push("rice");
    category = "carb";
  }
  if (
    text.includes("pasta") ||
    text.includes("spaghetti") ||
    text.includes("lasagna")
  ) {
    tags.push("pasta");
    category = "carb";
  }
  if (
    text.includes("noodles") ||
    text.includes("ramen") ||
    text.includes("pad thai")
  ) {
    tags.push("noodles");
    category = "carb";
  }
  if (text.includes("potato") || text.includes("aloo")) {
    tags.push("potato");
    category = "carb"; // Usually side, but if main...
  }
  if (
    text.includes("pizza") ||
    text.includes("sandwich") ||
    text.includes("wrap") ||
    text.includes("burger") ||
    text.includes("taco")
  ) {
    category = "carb";
    tags.push("bread");
  }

  if (
    text.includes("salad") ||
    text.includes("bowl") ||
    text.includes("vegetable") ||
    text.includes("sabzi")
  ) {
    // If it's a salad but has chicken, it might be balanced, but primary cat might be veg?
    // Let's stick to simple heuristics: if name says Salad, it's Veg primarily, but tags will show protein.
    category = "vegetable";
  }

  // Tags for badges
  if (
    text.includes("spinach") ||
    text.includes("saag") ||
    text.includes("palak")
  )
    tags.push("spinach");
  if (
    text.includes("leafy") ||
    text.includes("greens") ||
    text.includes("kale")
  )
    tags.push("leafy");
  if (text.includes("curry")) tags.push("curry");
  if (text.includes("fried")) tags.push("fried");
  if (
    text.includes("yogurt") ||
    text.includes("curd") ||
    text.includes("raita") ||
    text.includes("lassi") ||
    text.includes("tzatziki")
  )
    tags.push("yogurt");
  if (
    text.includes("cheese") ||
    text.includes("paneer") ||
    text.includes("mozzarella")
  )
    tags.push("cheese");

  return { tags, category };
}
