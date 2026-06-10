"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, ShoppingCart, X } from "lucide-react";
import { useShoppingList } from "@/lib/hooks/use-shopping-list";
import { usePantry } from "@/lib/hooks/use-pantry";
import { InstacartHint } from "@/components/guided-cook/instacart-hint";
import { EmptyStateCTA } from "@/components/shared/empty-state-cta";
import { GroceryNutritionPreview } from "@/components/shared/grocery-nutrition-preview";
import {
  ingredientCategory,
  ingredientEmoji,
  GROCERY_CATEGORY_ORDER,
  type GroceryCategory,
} from "@/lib/utils/ingredient-meta";
import { imageSrc } from "@/lib/image/image-src";
import { lookupDish } from "@/lib/utils/dish-lookup";
import { getDishEmoji } from "@/lib/utils/dish-emoji";
import { cn } from "@/lib/utils/cn";
import { useUnitPref } from "@/lib/hooks/use-unit-pref";
import { displayQuantity } from "@/lib/units/display-quantity";
import { toast } from "@/lib/hooks/use-toast";

/**
 * Shopping list — the inverse of the pantry, redesigned as an aisle-grouped
 * grocery list: items grouped under colour-coded aisle labels (Produce, Meat &
 * Seafood, …), each row a food-emoji + name + a rounded checkbox, warm cream
 * bars between aisles. Tap an item to mark it bought; bought items can be sent
 * straight to the pantry. Motion-free / reduced-motion safe by construction.
 */
export default function ShoppingListPage() {
  const router = useRouter();
  const {
    items,
    mounted,
    unboughtCount,
    toggleBought,
    remove,
    clear,
    clearBought,
  } = useShoppingList();
  const { add: addToPantry } = usePantry();

  const boughtItems = useMemo(() => items.filter((i) => i.bought), [items]);
  const unboughtItems = useMemo(() => items.filter((i) => !i.bought), [items]);

  // Group unbought items by aisle, in display order, skipping empty aisles.
  const grouped = useMemo(() => {
    const map = new Map<GroceryCategory, typeof unboughtItems>();
    for (const it of unboughtItems) {
      const cat = ingredientCategory(it.name);
      const arr = map.get(cat) ?? [];
      arr.push(it);
      map.set(cat, arr);
    }
    return GROCERY_CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
      category: c,
      list: map.get(c)!,
    }));
  }, [unboughtItems]);

  // Distinct source recipes (for the "Recipes" carousel), in first-seen order.
  const recipes = useMemo(() => {
    const seen = new Map<string, string>();
    for (const it of items) {
      if (it.sourceRecipeSlug && !seen.has(it.sourceRecipeSlug))
        seen.set(it.sourceRecipeSlug, it.sourceRecipeName ?? "");
    }
    return [...seen.keys()].map((slug) => lookupDish(slug));
  }, [items]);

  const removeRecipe = (slug: string) => {
    for (const it of items) if (it.sourceRecipeSlug === slug) remove(it.key);
  };

  const handleMoveBoughtToPantry = () => {
    if (boughtItems.length === 0) return;
    for (const item of boughtItems) addToPantry(item.name);
    clearBought();
    toast.push({
      variant: "success",
      title: `Stashed ${boughtItems.length} in pantry`,
      dedupKey: "shopping-to-pantry",
    });
  };

  return (
    <div className="min-h-full bg-[var(--nourish-cream)]">
      <header className="app-header page-x py-2.5">
        <div className="mx-auto flex max-w-md items-center">
          <button
            onClick={() => router.push("/path")}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--nourish-subtext)] transition hover:bg-white hover:text-[var(--nourish-dark)] active:scale-90 motion-reduce:active:scale-100"
            type="button"
            aria-label="Back to Path"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md page-x pb-28">
        {/* Title row — big serif. */}
        <div className="flex items-center justify-between gap-2 pt-1 pb-1">
          <h1 className="sous-title text-[var(--nourish-dark)]">
            Shopping list
          </h1>
          {unboughtCount > 0 && (
            <span className="shrink-0 text-[13px] font-medium text-[var(--nourish-subtext)]">
              {unboughtCount} to buy
            </span>
          )}
        </div>

        {!mounted ? (
          <div className="mt-4 animate-pulse space-y-2">
            <div className="h-12 rounded-xl bg-neutral-100" />
            <div className="h-12 rounded-xl bg-neutral-100" />
            <div className="h-12 rounded-xl bg-neutral-100" />
          </div>
        ) : items.length === 0 ? (
          <div className="pt-4">
            <EmptyStateCTA
              icon={ShoppingCart}
              iconSize={24}
              primary="List is empty."
              helper={`Tap "Add to shopping list" while you cook.`}
              cta={{ label: "Find something to cook" }}
              href="/today"
            />
          </div>
        ) : (
          <>
            <div className="mb-2 mt-1">
              <InstacartHint missingCount={unboughtCount} />
            </div>

            {/* Recipes that contributed items — horizontal carousel. */}
            {recipes.length > 0 && (
              <section className="mb-1">
                <p
                  className="sous-label pb-2 pt-1"
                  style={{ color: "var(--grocery-cat)" }}
                >
                  Recipes
                </p>
                <div className="-mx-[var(--gutter)] flex gap-3 overflow-x-auto px-[var(--gutter)] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {recipes.map((r) => (
                    <RecipeChip
                      key={r.slug}
                      slug={r.slug}
                      name={r.name}
                      image={r.image}
                      tags={r.tags}
                      cuisine={r.cuisine}
                      onRemove={() => removeRecipe(r.slug)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* W33 — what the planned recipes will deliver (nutrition rollup). */}
            {recipes.length > 0 && (
              <div className="mb-3">
                <GroceryNutritionPreview
                  recipeSlugs={recipes.map((r) => r.slug)}
                />
              </div>
            )}

            {/* Aisle-grouped, to-buy items. */}
            {grouped.map(({ category, list }, i) => (
              <section key={category}>
                {i > 0 && (
                  <div
                    className="-mx-[var(--gutter)] mt-1 h-1.5 bg-[var(--divider-warm)]"
                    aria-hidden
                  />
                )}
                <p
                  className="sous-label pt-4 pb-1"
                  style={{ color: "var(--grocery-cat)" }}
                >
                  {category}
                </p>
                <ul className="divide-y divide-dashed divide-[var(--nourish-border)]">
                  {list.map((item) => (
                    <GroceryRow
                      key={item.key}
                      name={item.name}
                      quantity={item.quantity}
                      bought={false}
                      onToggle={() => toggleBought(item.key)}
                      onRemove={() => remove(item.key)}
                    />
                  ))}
                </ul>
              </section>
            ))}

            {boughtItems.length > 0 && (
              <section>
                <div
                  className="-mx-[var(--gutter)] mt-1 h-1.5 bg-[var(--divider-warm)]"
                  aria-hidden
                />
                <p className="sous-label pt-4 pb-1 text-[var(--nourish-subtext-faint)]">
                  In the cart ({boughtItems.length})
                </p>
                <ul className="divide-y divide-dashed divide-[var(--nourish-border)]">
                  {boughtItems.map((item) => (
                    <GroceryRow
                      key={item.key}
                      name={item.name}
                      quantity={item.quantity}
                      bought
                      onToggle={() => toggleBought(item.key)}
                      onRemove={() => remove(item.key)}
                    />
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-6 space-y-2">
              {boughtItems.length > 0 && (
                <button
                  onClick={handleMoveBoughtToPantry}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5 py-3 text-sm font-medium text-[var(--nourish-green)] transition-colors hover:bg-[var(--nourish-green)]/10"
                  type="button"
                >
                  <Check size={14} />
                  Move bought ({boughtItems.length}) into pantry
                </button>
              )}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    if (
                      typeof window !== "undefined" &&
                      window.confirm("Clear the whole list?")
                    ) {
                      clear();
                    }
                  }}
                  className="text-xs font-medium text-[var(--nourish-subtext)] underline decoration-dotted underline-offset-4 hover:text-[var(--nourish-dark)]"
                  type="button"
                >
                  Clear list
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function GroceryRow({
  name,
  quantity,
  bought,
  onToggle,
  onRemove,
}: {
  name: string;
  quantity?: string;
  bought: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  // Reference grammar (Crouton mockups): checkbox LEFT, name left, BOLD
  // quantity right-aligned on the same line, food emoji far right.
  const { system } = useUnitPref();
  return (
    <li className="flex items-center gap-3 py-3">
      {/* Rounded-square checkbox — LEFT edge, like the reference mockups. */}
      <button
        onClick={onToggle}
        className="shrink-0 transition-transform active:scale-90 motion-reduce:active:scale-100"
        type="button"
        aria-label={bought ? `Mark ${name} not bought` : `Mark ${name} bought`}
      >
        {bought ? (
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[var(--nourish-green)]">
            <Check size={14} className="text-white" strokeWidth={3} />
          </span>
        ) : (
          <span className="block h-[22px] w-[22px] rounded-md border-2 border-neutral-300" />
        )}
      </button>
      <button
        onClick={onToggle}
        className="min-w-0 flex flex-1 items-center gap-3 text-left"
        type="button"
        aria-label={bought ? `Mark ${name} not bought` : `Mark ${name} bought`}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[15px] capitalize",
            bought
              ? "text-[var(--nourish-subtext)] line-through"
              : "text-[var(--nourish-dark)]",
          )}
        >
          {name}
        </span>
        {quantity && (
          <span
            className={cn(
              "shrink-0 text-[14px] font-semibold",
              bought
                ? "text-[var(--nourish-subtext-faint)] line-through"
                : "text-[var(--nourish-dark)]",
            )}
          >
            {displayQuantity(quantity, name, system)}
          </span>
        )}
        <span className="w-7 shrink-0 text-center text-xl" aria-hidden>
          {ingredientEmoji(name)}
        </span>
      </button>
      {/* Quiet per-item remove — present but subordinate to the checkbox. */}
      <button
        onClick={onRemove}
        className="flex h-8 w-7 shrink-0 items-center justify-center rounded-md text-neutral-300 transition-colors hover:text-[var(--nourish-dark)]"
        type="button"
        aria-label={`Remove ${name}`}
      >
        <X size={14} />
      </button>
    </li>
  );
}

/** A recipe card in the grocery "Recipes" carousel (image + name + View recipe
 *  + a remove that clears that recipe's items). */
function RecipeChip({
  slug,
  name,
  image,
  tags,
  cuisine,
  onRemove,
}: {
  slug: string;
  name: string;
  image: string | null;
  tags: string[];
  cuisine: string | null;
  onRemove: () => void;
}) {
  const label = name.replace(/\s*\([^)]*\)\s*$/, "").trim() || name;
  return (
    <div className="relative w-[176px] shrink-0 overflow-hidden rounded-2xl border border-[var(--nourish-border-strong)] bg-white">
      <div className="relative aspect-[4/3] bg-[var(--nourish-cream)]">
        {image ? (
          <Image
            src={imageSrc(image)}
            alt=""
            fill
            sizes="176px"
            className="object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-3xl"
            aria-hidden
          >
            {getDishEmoji(tags, cuisine ?? "")}
          </div>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label} items`}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-[var(--nourish-subtext)] backdrop-blur-sm transition-colors hover:text-[var(--nourish-dark)]"
        >
          <X size={13} />
        </button>
      </div>
      <div className="p-2.5">
        <p className="truncate text-[14px] font-semibold text-[var(--nourish-dark)]">
          {label}
        </p>
        <Link
          href={`/cook/${slug}`}
          className="mt-0.5 inline-flex items-center gap-0.5 text-[12px] font-medium text-[var(--nourish-subtext)] transition-colors hover:text-[var(--nourish-dark)]"
        >
          View recipe <ChevronRight size={13} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
