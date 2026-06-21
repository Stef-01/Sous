/**
 * Home-Chef Surplus-Meal — DEMO fixtures (STRATEGY §12.11, rule-12 prep).
 *
 * These are INDICATIVE sample batches for the flag-gated (default-OFF) rail —
 * they ship to NO user until a real partner surplus feed replaces them. Each
 * batch references an EXISTING eat-out venue + dish (slugs from
 * src/data/eat-out/stanford-demo.ts) — no invented recipes (CLAUDE.md rule 7);
 * a surplus batch is an existing dish re-priced from rescued ingredients.
 *
 * The surplus prices + pickup windows + quantities are illustrative placeholders
 * for the prototype, not real offers.
 */

import type { HomeChefBatch } from "@/types/home-chef";

export const DEMO_HOME_CHEF_BATCHES: HomeChefBatch[] = [
  {
    id: "batch-zareens-biryani",
    restaurantSlug: "zareens-palo-alto",
    restaurantName: "Zareen's",
    cuisine: "Pakistani-Indian",
    dishSlug: "zareens-chicken-biryani",
    dishName: "Chicken Biryani",
    surplusIngredients: [
      "weekend bone-in chicken prepped for the Saturday rush",
      "basmati cooked in bulk",
    ],
    regularPrice: 16,
    surplusPrice: 9,
    qtyAvailable: 6,
    pickupWindow: "6:00–7:30 PM today",
    perBatchNutrition: { kcal: 760, protein_g: 38, carbs_g: 82, fat_g: 30 },
  },
  {
    id: "batch-orens-falafel",
    restaurantSlug: "orens-hummus",
    restaurantName: "Oren's Hummus",
    cuisine: "Israeli",
    dishSlug: "orens-falafel-pita",
    dishName: "Falafel Pita",
    surplusIngredients: [
      "soaked chickpeas from today's batch",
      "fresh herbs nearing end of day",
    ],
    regularPrice: 14,
    surplusPrice: 8,
    qtyAvailable: 10,
    pickupWindow: "7:00–8:00 PM today",
    perBatchNutrition: { kcal: 620, protein_g: 18, carbs_g: 74, fat_g: 28 },
  },
  {
    id: "batch-evvia-moussaka",
    restaurantSlug: "evvia-estiatorio",
    restaurantName: "Evvia Estiatorio",
    cuisine: "Greek",
    dishSlug: "evvia-moussaka",
    dishName: "Moussaka",
    surplusIngredients: [
      "over-ordered eggplant",
      "house béchamel made fresh this morning",
    ],
    regularPrice: 34,
    surplusPrice: 19,
    qtyAvailable: 4,
    pickupWindow: "8:30–9:30 PM today",
    perBatchNutrition: { kcal: 640, protein_g: 28, carbs_g: 38, fat_g: 42 },
  },
  {
    id: "batch-gotts-sp-fries",
    restaurantSlug: "gotts-roadside",
    restaurantName: "Gott's Roadside",
    cuisine: "American",
    dishSlug: "gotts-sweet-potato-fries",
    dishName: "Sweet Potato Fries",
    surplusIngredients: [
      "sweet potatoes cut for the dinner rush that didn't land",
    ],
    regularPrice: 7,
    surplusPrice: 4,
    qtyAvailable: 12,
    pickupWindow: "5:30–6:30 PM today",
    perBatchNutrition: { kcal: 420, protein_g: 4, carbs_g: 56, fat_g: 20 },
  },
  {
    id: "batch-tfk-ancient-grains",
    restaurantSlug: "true-food-kitchen",
    restaurantName: "True Food Kitchen",
    cuisine: "Health-forward",
    dishSlug: "tfk-ancient-grains",
    dishName: "Ancient Grains Bowl",
    surplusIngredients: [
      "farro + quinoa cooked in bulk",
      "miso-glazed sweet potato from the lunch prep",
    ],
    regularPrice: 18,
    surplusPrice: 11,
    qtyAvailable: 8,
    pickupWindow: "7:30–8:30 PM today",
    perBatchNutrition: { kcal: 560, protein_g: 16, carbs_g: 78, fat_g: 20 },
  },
];
