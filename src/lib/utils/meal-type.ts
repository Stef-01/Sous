/**
 * Meal-type metadata — the single source for the planner's colour-coded
 * meal tags (Breakfast / Lunch / Dinner / Snack). Colour is the ONE accent on
 * the planner: it encodes WHEN a meal is eaten at a glance. Backgrounds + text
 * resolve to the `--meal-*` design tokens (light + dark) so the palette lives
 * in one place.
 */

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

/** Display order — breakfast → snack, matching the day's arc. */
export const MEAL_TYPES: readonly MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

export interface MealTypeMeta {
  label: string;
  /** CSS var() for the pill background tint. */
  bg: string;
  /** CSS var() for the pill text. */
  fg: string;
}

export const MEAL_TYPE_META: Record<MealType, MealTypeMeta> = {
  breakfast: {
    label: "Breakfast",
    bg: "var(--meal-breakfast-bg)",
    fg: "var(--meal-breakfast-fg)",
  },
  lunch: {
    label: "Lunch",
    bg: "var(--meal-lunch-bg)",
    fg: "var(--meal-lunch-fg)",
  },
  dinner: {
    label: "Dinner",
    bg: "var(--meal-dinner-bg)",
    fg: "var(--meal-dinner-fg)",
  },
  snack: {
    label: "Snack",
    bg: "var(--meal-snack-bg)",
    fg: "var(--meal-snack-fg)",
  },
};

export function mealTypeMeta(type: MealType): MealTypeMeta {
  return MEAL_TYPE_META[type];
}
