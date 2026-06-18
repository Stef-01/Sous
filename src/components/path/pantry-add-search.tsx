"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import { usePantry, normalizePantryName } from "@/lib/hooks/use-pantry";
import {
  addInventoryItems,
  type InventoryNutrition,
} from "@/lib/hooks/use-pantry-inventory";
import { searchIngredients } from "@/lib/pantry/ingredient-search";
import { getIngredient } from "@/data/ingredients";
import { haptic } from "@/lib/motion/haptics";

/** Mass/volume units we can convert to grams to compute an honest total from the
 *  registry's per-100g density. Anything else (e.g. "bag") → quantity only. */
const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  ml: 1,
  l: 1000,
  liter: 1000,
  litre: 1000,
  oz: 28.35,
  ounce: 28.35,
  lb: 453.6,
  lbs: 453.6,
  pound: 453.6,
};

/** Honest macro total for a registry ingredient at a given mass/volume — scaled
 *  from per-100g. Returns undefined when we can't compute it accurately (no
 *  registry match, or a non-mass unit), so we never show a fabricated number. */
function inventoryNutritionFor(
  id: string | undefined,
  quantity: number,
  unit: string | undefined,
): InventoryNutrition | undefined {
  if (!id || !unit) return undefined;
  const grams = quantity * (UNIT_TO_GRAMS[unit.toLowerCase()] ?? 0);
  if (grams <= 0) return undefined;
  const per100g = getIngredient(id)?.per100g;
  if (!per100g) return undefined;
  const f = grams / 100;
  const r1 = (n: number) => Math.round(n * f * 10) / 10;
  return {
    calories: Math.round(per100g.calories * f),
    protein_g: r1(per100g.protein_g),
    carbs_g: r1(per100g.totalCarbs_g),
    fat_g: r1(per100g.totalFat_g),
  };
}

/**
 * Pantry search-to-add — a typeahead over the canonical ingredient registry,
 * plus a free-text "Add …" row for anything not in the registry. Gives the
 * pantry a simple manual add path (it was AI-import-only). Adds are idempotent
 * (the pantry is a Set) and the input clears + keeps focus for fast multi-add.
 *
 * An optional quantity (e.g. "2 kg") attaches an inventory row so manual items
 * show the same qty/kcal pill as AI-imported ones (kcal is computed honestly
 * from the registry density for mass/volume units; omitted otherwise).
 */
export function PantryAddSearch() {
  const { add, has } = usePantry();
  const [q, setQ] = useState("");
  const [qty, setQty] = useState("");
  const trimmed = q.trim();
  const results = useMemo(() => searchIngredients(trimmed), [trimmed]);
  const exactMatch = results.some(
    (r) => r.name.toLowerCase() === trimmed.toLowerCase(),
  );

  const addName = (name: string, id?: string) => {
    const value = name.trim();
    if (!value) return;
    haptic("select");
    add(value);
    const m = qty.trim().match(/^([\d.]+)\s*(.*)$/);
    if (m) {
      const quantity = Number(m[1]);
      const unit = m[2].trim() || undefined;
      const nutrition = inventoryNutritionFor(id, quantity, unit);
      addInventoryItems(
        [
          {
            key: normalizePantryName(value),
            name: value,
            quantity,
            ...(unit ? { unit } : {}),
            ...(nutrition ? { nutrition } : {}),
          },
        ],
        new Date().toISOString(),
      );
    }
    setQ("");
    setQty("");
  };

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 transition-colors focus-within:border-[var(--nourish-green)]/45">
        <Search
          size={15}
          className="shrink-0 text-[var(--nourish-subtext)]"
          aria-hidden
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addName(results[0]?.name ?? trimmed, results[0]?.id);
            }
          }}
          placeholder="Add an ingredient…"
          aria-label="Search ingredients to add to your pantry"
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--nourish-dark)] placeholder:text-[var(--nourish-subtext)] focus:outline-none"
        />
        <input
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Qty"
          aria-label="Quantity (optional, e.g. 2 kg)"
          className="w-14 shrink-0 border-l border-neutral-200 bg-transparent pl-2 text-right text-sm text-[var(--nourish-dark)] placeholder:text-[var(--nourish-subtext)] focus:outline-none"
        />
      </div>

      {trimmed.length >= 2 && (
        <ul className="mt-1.5 space-y-1">
          {results.map((r) => {
            const already = has(r.name);
            return (
              <li key={r.id}>
                <button
                  type="button"
                  disabled={already}
                  onClick={() => addName(r.name, r.id)}
                  className="flex w-full items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm capitalize text-[var(--nourish-dark)] transition-colors hover:border-[var(--nourish-green)]/40 disabled:cursor-default disabled:opacity-60"
                >
                  <span className="flex-1 truncate">{r.name}</span>
                  {already ? (
                    <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-[var(--nourish-green)]">
                      <Check size={12} aria-hidden /> Added
                    </span>
                  ) : (
                    <Plus
                      size={15}
                      className="shrink-0 text-[var(--nourish-green)]"
                      aria-hidden
                    />
                  )}
                </button>
              </li>
            );
          })}

          {!exactMatch && (
            <li>
              <button
                type="button"
                onClick={() => addName(trimmed)}
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-2 text-left text-sm text-[var(--nourish-subtext)] transition-colors hover:border-[var(--nourish-green)]/40"
              >
                <Plus
                  size={15}
                  className="shrink-0 text-[var(--nourish-green)]"
                  aria-hidden
                />
                <span className="truncate">
                  Add &ldquo;
                  <span className="font-medium text-[var(--nourish-dark)]">
                    {trimmed}
                  </span>
                  &rdquo;
                </span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
