/**
 * Pure transforms from a validated import payload to store-ready records. The
 * import sheet calls these, then does the side-effecting writes (pantry set,
 * inventory store, diary). Keeping the mapping pure makes it fully unit-tested.
 */

import { normalizePantryName } from "@/lib/hooks/use-pantry";
import type { InventoryDraft } from "@/lib/hooks/use-pantry-inventory";
import type { BrandedFood } from "@/lib/nutrition/branded-food";
import type { PerServingNutrition } from "@/types/nutrition";
import type {
  ImportPayload,
  NutritionEntryImport,
} from "@/types/import-bridge";

/** Pantry / groceries payload → de-duped inventory drafts + the raw names to
 *  mirror into the engine's pantry set. */
export function toInventoryDrafts(
  payload: Extract<ImportPayload, { kind: "pantry" | "groceries" }>,
): { drafts: InventoryDraft[]; names: string[] } {
  const byKey = new Map<string, InventoryDraft>();
  const names: string[] = [];
  for (const item of payload.items) {
    const key = normalizePantryName(item.name);
    if (!key) continue;
    if (!byKey.has(key)) names.push(item.name);
    // Last occurrence wins for quantity/unit/category.
    byKey.set(key, {
      key,
      name: item.name.trim(),
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
    });
  }
  return { drafts: Array.from(byKey.values()), names };
}

/** Resolve the payload's free-text date to a concrete Date. */
export function resolveImportDate(raw: string | undefined, now: Date): Date {
  if (!raw) return now;
  const v = raw.trim().toLowerCase();
  if (v === "today" || v === "") return now;
  if (v === "yesterday") {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return d;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? now : parsed;
}

/** Build a per-serving nutrition vector from a partial imported label. Unknown
 *  micros are honest zeros; provenance marks it as a third-party estimate. */
export function importedNutrition(
  entry: NutritionEntryImport,
  slug: string,
  ingestedAt: string,
): PerServingNutrition {
  return {
    recipeSlug: slug,
    servingsPerRecipe: 1,
    calories: Math.round(entry.calories),
    protein_g: entry.protein_g,
    totalCarbs_g: entry.carbs_g,
    totalFat_g: entry.fat_g,
    totalSugars_g: entry.sugar_g,
    fiber_g: entry.fiber_g ?? 0,
    saturatedFat_g: entry.saturatedFat_g ?? 0,
    sodium_mg: entry.sodium_mg ?? 0,
    addedSugar_g: 0,
    calcium_mg: 0,
    iron_mg: 0,
    vitaminD_mcg: 0,
    vitaminA_mcg_rae: 0,
    potassium_mg: 0,
    omega3_g: 0,
    zinc_mg: 0,
    magnesium_mg: 0,
    vitaminB12_mcg: 0,
    choline_mg: 0,
    provenance: "third-party",
    confidence: "approximated",
    ingestedAt,
  };
}

export interface PreparedFoodLog {
  food: BrandedFood;
  servings: number;
}

/** Nutrition payload → branded-food logs (each diary-loggable) + the resolved
 *  date they should be logged under. */
export function toFoodLogs(
  payload: Extract<ImportPayload, { kind: "nutrition" }>,
  now: Date,
): { logs: PreparedFoodLog[]; date: Date } {
  const ingestedAt = now.toISOString();
  const logs = payload.entries.map((entry, i) => {
    const barcode = `import-${normalizePantryName(entry.name).replace(/\s+/g, "-") || "food"}-${i}`;
    const food: BrandedFood = {
      barcode,
      name: entry.name.trim(),
      brand: entry.brand?.trim() || "Imported",
      servingSizeG: 0,
      nutrition: importedNutrition(entry, `off:${barcode}`, ingestedAt),
    };
    return { food, servings: entry.servings ?? 1 };
  });
  return { logs, date: resolveImportDate(payload.date, now) };
}
