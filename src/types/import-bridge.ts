/**
 * AI paste-bridge import schemas.
 *
 * Sous defers real LLM integration (founder-gated — needs an API key + cost
 * controls; see CLAUDE.md rule 12). Instead, users run a provided prompt in the
 * assistant they ALREADY have (ChatGPT/Claude), which returns structured JSON,
 * and paste it here. These zod schemas are the contract that JSON must satisfy;
 * the prompts in `src/data/import-prompts.ts` embed the same shape so the
 * assistant's output validates on the first try.
 *
 * One discriminated union covers all three flows so a single parser/paste box
 * routes by the payload's own `kind`:
 *   - pantry    — current inventory (what you have + how much)
 *   - groceries — a shop/receipt you just bought (also lands in the inventory)
 *   - nutrition — food you ate, with nutrient info, for the diary
 *
 * Full nutrition is REQUIRED on EVERY row of EVERY kind (founder rule): calories
 * + protein/carbs/fat are mandatory so every imported item — pantry, groceries,
 * or food log — carries its macro panel. Common extras (fiber/sugar/sodium/
 * saturated fat) stay optional. Numbers are coerced (LLMs sometimes quote them)
 * and unknown keys are stripped (minor format drift shouldn't fail the import).
 */

import { z } from "zod";

/** Mandatory macro panel — required on every imported row, every kind. */
const requiredNutrition = {
  calories: z.coerce.number().nonnegative().max(100000),
  protein_g: z.coerce.number().nonnegative().max(10000),
  carbs_g: z.coerce.number().nonnegative().max(10000),
  fat_g: z.coerce.number().nonnegative().max(10000),
};

/** Optional label extras, shared by every kind. */
const optionalNutrition = {
  fiber_g: z.coerce.number().nonnegative().max(10000).optional(),
  sugar_g: z.coerce.number().nonnegative().max(10000).optional(),
  sodium_mg: z.coerce.number().nonnegative().max(1000000).optional(),
  saturatedFat_g: z.coerce.number().nonnegative().max(10000).optional(),
};

/** A quantity-bearing inventory line (pantry + groceries share this) — now
 *  carrying its full nutrition so the inventory knows the macros of what you
 *  have, not just the amount. Nutrition is PER TYPICAL SERVING of the item. */
export const InventoryItemImportSchema = z.object({
  name: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().positive().max(100000).optional(),
  unit: z.string().trim().max(24).optional(),
  category: z.string().trim().max(40).optional(),
  note: z.string().trim().max(200).optional(),
  ...requiredNutrition,
  ...optionalNutrition,
});
export type InventoryItemImport = z.infer<typeof InventoryItemImportSchema>;

/** A logged food with its nutrition. Values are PER the number of servings. */
export const NutritionEntryImportSchema = z.object({
  name: z.string().trim().min(1).max(160),
  brand: z.string().trim().max(80).optional(),
  servings: z.coerce.number().positive().max(100).optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  ...requiredNutrition,
  ...optionalNutrition,
});
export type NutritionEntryImport = z.infer<typeof NutritionEntryImportSchema>;

export const ImportPayloadSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("pantry"),
    items: z.array(InventoryItemImportSchema).min(1).max(300),
  }),
  z.object({
    kind: z.literal("groceries"),
    items: z.array(InventoryItemImportSchema).min(1).max(300),
  }),
  z.object({
    kind: z.literal("nutrition"),
    /** ISO date the food was eaten (YYYY-MM-DD or full ISO). Defaults to today. */
    date: z.string().trim().max(40).optional(),
    entries: z.array(NutritionEntryImportSchema).min(1).max(200),
  }),
]);
export type ImportPayload = z.infer<typeof ImportPayloadSchema>;
export type ImportKind = ImportPayload["kind"];

/** How many rows a payload carries (drives the preview count). */
export function importItemCount(payload: ImportPayload): number {
  return payload.kind === "nutrition"
    ? payload.entries.length
    : payload.items.length;
}
