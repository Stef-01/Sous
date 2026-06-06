/**
 * The full nutrient-display table for the nutrition panel — every nutrient the
 * engine composes, with its label, unit, daily target, and group. Targets are
 * FDA Daily Values (21 CFR 101.9, adults 4+); omega-3 + water use the AI;
 * amino-acid targets are the WHO/FAO 2007 scoring pattern × the 50 g protein DV.
 * `dv: null` = no meaningful daily target (shown as a value, no %).
 */

import type { PerServingNutrition } from "@/types/nutrition";

export type NutrientGroup =
  | "General"
  | "Carbs"
  | "Fats"
  | "Vitamins"
  | "Minerals"
  | "Protein";

export interface NutrientMeta {
  key: keyof PerServingNutrition;
  label: string;
  unit: string;
  dv: number | null;
  group: NutrientGroup;
}

export const NUTRIENT_GROUP_ORDER: readonly NutrientGroup[] = [
  "General",
  "Carbs",
  "Fats",
  "Vitamins",
  "Minerals",
  "Protein",
];

export const NUTRIENT_DISPLAY: NutrientMeta[] = [
  // General
  {
    key: "calories",
    label: "Energy",
    unit: "kcal",
    dv: 2000,
    group: "General",
  },
  { key: "water_g", label: "Water", unit: "g", dv: 3700, group: "General" },
  {
    key: "caffeine_mg",
    label: "Caffeine",
    unit: "mg",
    dv: null,
    group: "General",
  },
  { key: "alcohol_g", label: "Alcohol", unit: "g", dv: null, group: "General" },
  // Carbs
  { key: "totalCarbs_g", label: "Carbs", unit: "g", dv: 275, group: "Carbs" },
  { key: "fiber_g", label: "Fiber", unit: "g", dv: 28, group: "Carbs" },
  {
    key: "totalSugars_g",
    label: "Sugars",
    unit: "g",
    dv: null,
    group: "Carbs",
  },
  {
    key: "addedSugar_g",
    label: "Added sugars",
    unit: "g",
    dv: 50,
    group: "Carbs",
  },
  { key: "starch_g", label: "Starch", unit: "g", dv: null, group: "Carbs" },
  // Fats
  { key: "totalFat_g", label: "Fat", unit: "g", dv: 78, group: "Fats" },
  {
    key: "saturatedFat_g",
    label: "Saturated",
    unit: "g",
    dv: 20,
    group: "Fats",
  },
  {
    key: "monoFat_g",
    label: "Monounsaturated",
    unit: "g",
    dv: null,
    group: "Fats",
  },
  {
    key: "polyFat_g",
    label: "Polyunsaturated",
    unit: "g",
    dv: null,
    group: "Fats",
  },
  { key: "transFat_g", label: "Trans", unit: "g", dv: null, group: "Fats" },
  { key: "omega3_g", label: "Omega-3", unit: "g", dv: 1.6, group: "Fats" },
  {
    key: "cholesterol_mg",
    label: "Cholesterol",
    unit: "mg",
    dv: 300,
    group: "Fats",
  },
  // Vitamins
  {
    key: "vitaminA_mcg_rae",
    label: "Vitamin A",
    unit: "mcg",
    dv: 900,
    group: "Vitamins",
  },
  {
    key: "vitaminC_mg",
    label: "Vitamin C",
    unit: "mg",
    dv: 90,
    group: "Vitamins",
  },
  {
    key: "vitaminD_mcg",
    label: "Vitamin D",
    unit: "mcg",
    dv: 20,
    group: "Vitamins",
  },
  {
    key: "vitaminE_mg",
    label: "Vitamin E",
    unit: "mg",
    dv: 15,
    group: "Vitamins",
  },
  {
    key: "vitaminK_mcg",
    label: "Vitamin K",
    unit: "mcg",
    dv: 120,
    group: "Vitamins",
  },
  {
    key: "thiamin_mg",
    label: "B1 (Thiamin)",
    unit: "mg",
    dv: 1.2,
    group: "Vitamins",
  },
  {
    key: "riboflavin_mg",
    label: "B2 (Riboflavin)",
    unit: "mg",
    dv: 1.3,
    group: "Vitamins",
  },
  {
    key: "niacin_mg",
    label: "B3 (Niacin)",
    unit: "mg",
    dv: 16,
    group: "Vitamins",
  },
  {
    key: "pantothenicAcid_mg",
    label: "B5 (Pantothenic)",
    unit: "mg",
    dv: 5,
    group: "Vitamins",
  },
  {
    key: "vitaminB6_mg",
    label: "B6 (Pyridoxine)",
    unit: "mg",
    dv: 1.7,
    group: "Vitamins",
  },
  {
    key: "folate_mcg",
    label: "Folate",
    unit: "mcg",
    dv: 400,
    group: "Vitamins",
  },
  {
    key: "vitaminB12_mcg",
    label: "B12 (Cobalamin)",
    unit: "mcg",
    dv: 2.4,
    group: "Vitamins",
  },
  {
    key: "choline_mg",
    label: "Choline",
    unit: "mg",
    dv: 550,
    group: "Vitamins",
  },
  // Minerals
  {
    key: "calcium_mg",
    label: "Calcium",
    unit: "mg",
    dv: 1300,
    group: "Minerals",
  },
  { key: "iron_mg", label: "Iron", unit: "mg", dv: 18, group: "Minerals" },
  {
    key: "magnesium_mg",
    label: "Magnesium",
    unit: "mg",
    dv: 420,
    group: "Minerals",
  },
  {
    key: "phosphorus_mg",
    label: "Phosphorus",
    unit: "mg",
    dv: 1250,
    group: "Minerals",
  },
  {
    key: "potassium_mg",
    label: "Potassium",
    unit: "mg",
    dv: 4700,
    group: "Minerals",
  },
  {
    key: "sodium_mg",
    label: "Sodium",
    unit: "mg",
    dv: 2300,
    group: "Minerals",
  },
  { key: "zinc_mg", label: "Zinc", unit: "mg", dv: 11, group: "Minerals" },
  { key: "copper_mg", label: "Copper", unit: "mg", dv: 0.9, group: "Minerals" },
  {
    key: "manganese_mg",
    label: "Manganese",
    unit: "mg",
    dv: 2.3,
    group: "Minerals",
  },
  {
    key: "selenium_mcg",
    label: "Selenium",
    unit: "mcg",
    dv: 55,
    group: "Minerals",
  },
  // Protein + amino acids (amino targets = WHO/FAO mg/g × 50 g protein DV)
  { key: "protein_g", label: "Protein", unit: "g", dv: 50, group: "Protein" },
  {
    key: "histidine_g",
    label: "Histidine",
    unit: "g",
    dv: 0.75,
    group: "Protein",
  },
  {
    key: "isoleucine_g",
    label: "Isoleucine",
    unit: "g",
    dv: 1.5,
    group: "Protein",
  },
  {
    key: "leucine_g",
    label: "Leucine",
    unit: "g",
    dv: 2.95,
    group: "Protein",
  },
  {
    key: "lysine_g",
    label: "Lysine",
    unit: "g",
    dv: 2.25,
    group: "Protein",
  },
  {
    key: "methionine_g",
    label: "Methionine",
    unit: "g",
    dv: 0.8,
    group: "Protein",
  },
  {
    key: "cystine_g",
    label: "Cystine",
    unit: "g",
    dv: 0.3,
    group: "Protein",
  },
  {
    key: "phenylalanine_g",
    label: "Phenylalanine",
    unit: "g",
    dv: 1.25,
    group: "Protein",
  },
  {
    key: "tyrosine_g",
    label: "Tyrosine",
    unit: "g",
    dv: 0.65,
    group: "Protein",
  },
  {
    key: "threonine_g",
    label: "Threonine",
    unit: "g",
    dv: 1.15,
    group: "Protein",
  },
  {
    key: "tryptophan_g",
    label: "Tryptophan",
    unit: "g",
    dv: 0.3,
    group: "Protein",
  },
  {
    key: "valine_g",
    label: "Valine",
    unit: "g",
    dv: 1.95,
    group: "Protein",
  },
];
