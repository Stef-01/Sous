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
 * Numbers are coerced (LLMs sometimes quote them) and unknown keys are stripped
 * (minor format drift shouldn't fail the import).
 */

import { z } from "zod";

/** A quantity-bearing inventory line (pantry + groceries share this). */
export const InventoryItemImportSchema = z.object({
  name: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().positive().max(100000).optional(),
  unit: z.string().trim().max(24).optional(),
  category: z.string().trim().max(40).optional(),
  note: z.string().trim().max(200).optional(),
});
export type InventoryItemImport = z.infer<typeof InventoryItemImportSchema>;

/** A logged food with nutrient info. Only `name` + `calories` are required;
 *  macros and the common label fields are optional (defaulted to 0 downstream
 *  so a partial label still logs cleanly). */
export const NutritionEntryImportSchema = z.object({
  name: z.string().trim().min(1).max(160),
  brand: z.string().trim().max(80).optional(),
  servings: z.coerce.number().positive().max(100).optional(),
  calories: z.coerce.number().nonnegative().max(100000),
  protein_g: z.coerce.number().nonnegative().max(10000).optional(),
  carbs_g: z.coerce.number().nonnegative().max(10000).optional(),
  fat_g: z.coerce.number().nonnegative().max(10000).optional(),
  fiber_g: z.coerce.number().nonnegative().max(10000).optional(),
  sugar_g: z.coerce.number().nonnegative().max(10000).optional(),
  sodium_mg: z.coerce.number().nonnegative().max(1000000).optional(),
  saturatedFat_g: z.coerce.number().nonnegative().max(10000).optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
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
