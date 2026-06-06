"use client";

import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getMealCookSummary } from "@/data/guided-cook-summary";
import { ingredientEmoji } from "@/lib/utils/ingredient-meta";
import { usePantry } from "@/lib/hooks/use-pantry";
import { useShoppingList } from "@/lib/hooks/use-shopping-list";
import { lookupDish } from "@/lib/utils/dish-lookup";
import { toast } from "@/lib/hooks/use-toast";

/**
 * IngredientsToCheck — the dish's ingredients with a pantry have/need state, so
 * a user can confirm they can actually cook it BEFORE committing (the friction
 * fix from the appraisal). Missing items add to the shopping list in one tap.
 * Renders nothing when the dish has no ingredient data.
 */
export function IngredientsToCheck({ slug }: { slug?: string }) {
  const summary = slug ? getMealCookSummary(slug) : null;
  const { has, mounted } = usePantry();
  const { addMany } = useShoppingList();
  const names = summary?.ingredientNames ?? [];
  if (names.length === 0) return null;

  const rows = names.map((n) => ({ name: n, have: mounted ? has(n) : false }));
  const need = rows.filter((r) => !r.have);

  const addMissing = () => {
    if (need.length === 0 || !slug) return;
    addMany(
      need.map((r) => ({
        name: r.name,
        sourceRecipeSlug: slug,
        sourceRecipeName: lookupDish(slug).name,
      })),
    );
    toast.push({
      variant: "success",
      title: `Added ${need.length} to shopping list`,
      dedupKey: "info-add-shopping",
    });
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="sous-label">Ingredients to check</p>
        {mounted && (
          <p className="text-[12px] text-[var(--nourish-subtext)]">
            have {rows.length - need.length} · need {need.length}
          </p>
        )}
      </div>
      <ul className="divide-y divide-[var(--nourish-border)]">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center gap-3 py-2">
            <span className="w-6 shrink-0 text-center text-lg" aria-hidden>
              {ingredientEmoji(r.name)}
            </span>
            <span
              className={cn(
                "flex-1 truncate text-[15px] capitalize",
                r.have
                  ? "text-[var(--nourish-subtext)]"
                  : "text-[var(--nourish-dark)]",
              )}
            >
              {r.name}
            </span>
            {r.have ? (
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[var(--nourish-green)]">
                <Check size={13} className="text-white" strokeWidth={3} />
              </span>
            ) : (
              <span className="text-[12px] font-medium text-[var(--nourish-subtext-faint)]">
                need
              </span>
            )}
          </li>
        ))}
      </ul>
      {mounted && need.length > 0 && (
        <button
          type="button"
          onClick={addMissing}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5 py-2.5 text-sm font-medium text-[var(--nourish-green)] transition-colors hover:bg-[var(--nourish-green)]/10"
        >
          <Plus size={14} aria-hidden />
          Add {need.length} missing to shopping
        </button>
      )}
    </div>
  );
}
