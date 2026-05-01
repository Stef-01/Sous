"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Circle,
  ArrowRightLeft,
  Utensils,
  ShoppingCart,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { trpc } from "@/lib/trpc/client";
import { usePantry } from "@/lib/hooks/use-pantry";
import { useShoppingList } from "@/lib/hooks/use-shopping-list";
import { useSubstitutionMemory } from "@/lib/hooks/use-substitution-memory";
import { toast } from "@/lib/hooks/use-toast";
import {
  coalescePrepList,
  normalizePrepName,
  type PrepListGroup,
} from "@/lib/engine/prep-list";
import type { StaticDishData } from "@/data/guided-cook-steps";
import { InstacartHint } from "./instacart-hint";

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  isOptional: boolean | null;
  substitution: string | null;
}

/** A labeled group of ingredients (e.g., "For Pizza Margherita"). */
export interface IngredientSection {
  label: string;
  ingredients: Ingredient[];
}

interface IngredientListProps {
  /** Flat ingredient list  -  used for single-dish mode. */
  ingredients: Ingredient[];
  /** Segmented ingredient sections  -  used for combined mains+sides mode.
   *  When provided, overrides the flat `ingredients` prop. */
  sections?: IngredientSection[];
  /** Full dish data for every dish in the combined flow. When present and
   *  there's more than one, the component offers a "By station" toggle that
   *  shows the coalesced mise-en-place grouped by prep station. */
  prepDishes?: StaticDishData[];
  recipeName?: string;
  cuisineFamily?: string;
  /** Dish slug  -  enables persistent per-dish substitution memory. */
  dishSlug?: string;
  onReady: () => void;
  onSelectSides?: () => void;
}

/**
 * Ingredient List  -  the Grab phase.
 * Checkable list of ingredients with quantities and substitutions.
 * Supports both flat (single-dish) and segmented (combined cook) modes.
 * Tap "I don't have this" for AI-powered substitution suggestions.
 * "I have everything" button advances to Cook phase.
 */
export function IngredientList({
  ingredients,
  sections,
  prepDishes,
  recipeName = "",
  cuisineFamily = "",
  dishSlug,
  onReady,
  onSelectSides,
}: IngredientListProps) {
  const [viewMode, setViewMode] = useState<"dish" | "station">("dish");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [askingSub, setAskingSub] = useState<string | null>(null);
  const {
    mounted: pantryMounted,
    has: pantryHas,
    toggle: togglePantry,
  } = usePantry();
  const {
    get: getRememberedSub,
    remember: rememberSub,
    mounted: subMemMounted,
  } = useSubstitutionMemory();

  // Build effective sections: either use provided sections or wrap flat list
  const effectiveSections = useMemo<IngredientSection[]>(() => {
    if (sections && sections.length > 0) return sections;
    return [{ label: "", ingredients }];
  }, [sections, ingredients]);

  // Auto-check ingredients the user already has in their pantry.
  /* eslint-disable react-hooks/set-state-in-effect -- sync pantry membership (external store) into local checked set */
  useEffect(() => {
    if (!pantryMounted) return;
    setChecked((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const section of effectiveSections) {
        for (const item of section.ingredients) {
          if (!next.has(item.id) && pantryHas(item.name)) {
            next.add(item.id);
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [pantryMounted, pantryHas, effectiveSections]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Count total ingredients across all sections
  const totalIngredients = useMemo(
    () => effectiveSections.reduce((sum, s) => sum + s.ingredients.length, 0),
    [effectiveSections],
  );

  const isSegmented =
    effectiveSections.length > 1 || effectiveSections[0]?.label !== "";

  const toggleItem = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allChecked = checked.size >= totalIngredients;
  const missingCount = totalIngredients - checked.size;
  const { addMany: addToShopping } = useShoppingList();

  const handleAddMissingToShopping = () => {
    const missing: string[] = [];
    for (const section of effectiveSections) {
      for (const item of section.ingredients) {
        if (!checked.has(item.id)) missing.push(item.name);
      }
    }
    if (missing.length === 0) return;
    addToShopping(missing);
    toast.push({
      variant: "success",
      title: `Added ${missing.length} to shopping list`,
      body: "Find it under Path → Shopping list",
      dedupKey: "shopping-list-add",
    });
  };

  // Coalesced prep-list: only surfaced when we have 2+ dishes of authored
  // cook data, which is the case for combined cook flows. For single-dish
  // flows we don't offer the toggle since it would just duplicate the
  // by-dish view.
  const prepGroups = useMemo<PrepListGroup[]>(() => {
    if (!prepDishes || prepDishes.length < 2) return [];
    return coalescePrepList(prepDishes);
  }, [prepDishes]);
  const hasCoalescedView = prepGroups.length > 0;

  // Build a map: prep-item key -> list of source ingredient ids, so that
  // tapping a coalesced row can check every underlying ingredient and keep
  // the existing "all checked → go cook" state machine honest.
  const prepSourceIds = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!prepDishes || prepDishes.length === 0) return map;
    for (const dish of prepDishes) {
      for (const ing of dish.ingredients) {
        const key = normalizePrepName(ing.name);
        if (!key) continue;
        const arr = map.get(key) ?? [];
        arr.push(ing.id);
        map.set(key, arr);
      }
    }
    return map;
  }, [prepDishes]);

  const toggleCoalesced = (prepName: string) => {
    const ids = prepSourceIds.get(normalizePrepName(prepName));
    if (!ids || ids.length === 0) return;
    setChecked((prev) => {
      const allOn = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allOn) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Precompute running index offsets for stagger animation delay
  const sectionStartIndices = useMemo(() => {
    const indices: number[] = [];
    let running = 0;
    for (const section of effectiveSections) {
      indices.push(running);
      running += section.ingredients.length;
    }
    return indices;
  }, [effectiveSections]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col"
      style={{ minHeight: "calc(100dvh - 180px)" }}
    >
      {/* Scrollable ingredient list */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-xl text-[var(--nourish-dark)]">
            Gather these
          </h2>
          {hasCoalescedView && (
            <div
              role="tablist"
              aria-label="Prep view"
              className="inline-flex items-center rounded-full border border-neutral-200 bg-white p-0.5 text-[11px] font-semibold"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "dish"}
                onClick={() => setViewMode("dish")}
                className={cn(
                  "rounded-full px-2.5 py-1 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
                  viewMode === "dish"
                    ? "bg-[var(--nourish-green)] text-white"
                    : "text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]",
                )}
              >
                By dish
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "station"}
                onClick={() => setViewMode("station")}
                className={cn(
                  "rounded-full px-2.5 py-1 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
                  viewMode === "station"
                    ? "bg-[var(--nourish-green)] text-white"
                    : "text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]",
                )}
              >
                By station
              </button>
            </div>
          )}
        </div>

        {viewMode === "station" && hasCoalescedView ? (
          <div className="space-y-4">
            {prepGroups.map((group) => (
              <div key={group.station} className="space-y-1">
                <h3 className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[var(--nourish-subtext)]">
                  {group.label}
                </h3>
                {group.items.map((item) => {
                  const ids =
                    prepSourceIds.get(normalizePrepName(item.name)) ?? [];
                  const isChecked =
                    ids.length > 0 && ids.every((id) => checked.has(id));
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCoalesced(item.name)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        isChecked
                          ? "bg-[var(--nourish-green)]/5"
                          : "hover:bg-neutral-50",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                          isChecked
                            ? "border-[var(--nourish-green)] bg-[var(--nourish-green)]"
                            : "border-neutral-300",
                        )}
                      >
                        {isChecked ? (
                          <Check
                            size={12}
                            className="text-white"
                            strokeWidth={3}
                          />
                        ) : (
                          <Circle size={6} className="text-transparent" />
                        )}
                      </span>
                      <span className="flex-1">
                        <span
                          className={cn(
                            "block text-sm font-medium",
                            isChecked
                              ? "text-[var(--nourish-subtext)] line-through"
                              : "text-[var(--nourish-dark)]",
                          )}
                        >
                          {item.name}
                        </span>
                        <span className="block text-[11px] text-[var(--nourish-subtext)]">
                          {item.quantity}
                          {item.sources.length > 1
                            ? ` · ${item.sources.join(" & ")}`
                            : ""}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          effectiveSections.map((section, sectionIdx) => {
            const sectionStartIdx = sectionStartIndices[sectionIdx];

            return (
              <div
                key={section.label || `section-${sectionIdx}`}
                className="space-y-1"
              >
                {/* Section header  -  only shown in segmented mode */}
                {isSegmented && section.label && (
                  <motion.h3
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sectionStartIdx * 0.04 }}
                    className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide px-3 pt-3 pb-1"
                  >
                    {section.label}
                  </motion.h3>
                )}

                {section.ingredients.map((item, idx) => (
                  <IngredientRow
                    key={item.id}
                    item={item}
                    idx={sectionStartIdx + idx}
                    checked={checked.has(item.id)}
                    showingSub={askingSub === item.id}
                    recipeName={recipeName}
                    cuisineFamily={cuisineFamily}
                    inPantry={pantryMounted && pantryHas(item.name)}
                    rememberedSub={
                      dishSlug && subMemMounted
                        ? getRememberedSub(dishSlug, item.id)
                        : null
                    }
                    onRememberSub={(sub) => {
                      if (dishSlug) rememberSub(dishSlug, item.id, sub);
                    }}
                    onToggle={() => toggleItem(item.id)}
                    onAskSub={() =>
                      setAskingSub(askingSub === item.id ? null : item.id)
                    }
                    onTogglePantry={() => togglePantry(item.name)}
                  />
                ))}
              </div>
            );
          })
        )}

        {/* "Got everything?" message when all checked */}
        <AnimatePresence>
          {allChecked && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex items-center gap-2 rounded-xl border border-[var(--nourish-green)]/25 bg-[var(--nourish-green)]/5 px-4 py-3"
            >
              <span className="text-lg">✅</span>
              <p className="text-sm font-medium text-[var(--nourish-green)]">
                Got everything! Ready to cook.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pinned CTAs  -  always visible, no scroll required */}
      <div className="mt-auto pt-3 space-y-2">
        {/* Primary: Proceed to cook */}
        <motion.button
          onClick={onReady}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "w-full rounded-xl py-3.5 text-sm font-semibold text-white",
            "shadow-sm transition-all duration-200",
            allChecked
              ? "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)] shadow-[var(--nourish-green)]/20"
              : "bg-[var(--nourish-green)]/80 hover:bg-[var(--nourish-green)]",
          )}
          type="button"
        >
          {allChecked ? "Let\u2019s cook! 🍳" : "I have everything"}
        </motion.button>

        {/* Add missing ingredients to shopping list */}
        {!allChecked && missingCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 25,
              delay: 0.1,
            }}
            whileTap={{ scale: 0.96 }}
            onClick={handleAddMissingToShopping}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium",
              "text-[#003D29] bg-[#003D29]/5 border border-[#003D29]/15",
              "hover:bg-[#003D29]/10 transition-colors duration-200",
            )}
            type="button"
          >
            <ShoppingCart size={15} />
            Add {missingCount} item{missingCount !== 1 ? "s" : ""} to shopping
            list
          </motion.button>
        )}

        {/* Instacart placeholder hint — single line below the shopping
            CTA. Encourages "keep going" instead of "give up" when an
            ingredient is missing. No screen, no modal. */}
        <InstacartHint missingCount={missingCount} />

        {/* Secondary: Select sides to pair */}
        {onSelectSides && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 25,
              delay: 0.15,
            }}
            whileTap={{ scale: 0.96 }}
            onClick={onSelectSides}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-medium",
              "text-[var(--nourish-green)] border border-[var(--nourish-green)]/25",
              "hover:bg-[var(--nourish-green)]/5 transition-colors duration-200",
            )}
            type="button"
          >
            <Utensils size={14} />
            Select sides to pair
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function IngredientRow({
  item,
  idx,
  checked,
  showingSub,
  recipeName,
  cuisineFamily,
  inPantry,
  rememberedSub,
  onRememberSub,
  onToggle,
  onAskSub,
  onTogglePantry,
}: {
  item: Ingredient;
  idx: number;
  checked: boolean;
  showingSub: boolean;
  recipeName: string;
  cuisineFamily: string;
  inPantry: boolean;
  rememberedSub: string | null;
  onRememberSub: (sub: string) => void;
  onToggle: () => void;
  onAskSub: () => void;
  onTogglePantry: () => void;
}) {
  // AI substitution query  -  fires only when expanded
  const subQuery = trpc.ai.suggestSubstitution.useQuery(
    {
      missingIngredient: item.name,
      recipeName,
      cuisineFamily,
    },
    { enabled: showingSub, staleTime: Infinity },
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.04 }}
        className={cn(
          "flex w-full items-start gap-3 rounded-lg px-3 py-2.5",
          "transition-colors duration-100",
          checked && "opacity-60",
        )}
      >
        {/* Checkbox  -  44px touch target wraps 20px visual circle */}
        <button
          onClick={onToggle}
          className="flex h-11 w-11 shrink-0 -m-1.5 items-center justify-center active:scale-90 transition-transform"
          type="button"
          aria-label={checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
        >
          {checked ? (
            <motion.div
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--nourish-green)]"
            >
              <Check size={12} className="text-white" strokeWidth={3} />
            </motion.div>
          ) : (
            <Circle size={20} className="text-neutral-300" />
          )}
        </button>

        {/* Ingredient info */}
        <button
          onClick={onToggle}
          className="flex-1 min-w-0 text-left active:scale-[0.98] transition-transform"
          type="button"
          aria-label={checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
        >
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-sm font-medium",
                checked
                  ? "text-[var(--nourish-subtext)] line-through"
                  : "text-[var(--nourish-dark)]",
              )}
            >
              {item.name}
            </span>
            <span className="text-xs text-[var(--nourish-subtext)]">
              {item.quantity}
            </span>
            {inPantry && (
              <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--nourish-green)]">
                in pantry
              </span>
            )}
            {item.isOptional && (
              <span className="text-[11px] text-[var(--nourish-subtext)] italic">
                optional
              </span>
            )}
          </div>
          {item.substitution && !showingSub && !rememberedSub && (
            <p className="mt-0.5 text-xs text-[var(--nourish-subtext)]/70">
              sub: {item.substitution}
            </p>
          )}
          {rememberedSub && !showingSub && (
            <p className="mt-0.5 text-xs text-[var(--nourish-green)]/80">
              last time: {rememberedSub}
            </p>
          )}
        </button>

        {/* Stash in pantry  -  small bookmark toggle, preserves future cooks */}
        <button
          onClick={onTogglePantry}
          className={cn(
            "flex h-11 w-9 shrink-0 -m-1 items-center justify-center rounded-md transition-colors",
            inPantry
              ? "text-[var(--nourish-green)]"
              : "text-neutral-300 hover:text-[var(--nourish-subtext)]",
          )}
          type="button"
          aria-label={
            inPantry
              ? `Remove ${item.name} from pantry`
              : `Add ${item.name} to pantry`
          }
          title={inPantry ? "In your pantry" : "Add to pantry"}
        >
          <Bookmark size={14} fill={inPantry ? "currentColor" : "none"} />
        </button>

        {/* Substitution toggle  -  44px touch target */}
        {!checked && !item.isOptional && (
          <button
            onClick={onAskSub}
            className={cn(
              "flex h-11 w-9 shrink-0 -m-1 items-center justify-center rounded-md transition-colors",
              showingSub
                ? "text-[var(--nourish-green)] bg-[var(--nourish-green)]/10"
                : "text-neutral-300 hover:text-[var(--nourish-subtext)]",
            )}
            type="button"
            aria-label={`Find substitute for ${item.name}`}
            title="I don't have this"
          >
            <ArrowRightLeft size={14} />
          </button>
        )}
      </motion.div>

      {/* AI substitution suggestion */}
      <AnimatePresence>
        {showingSub && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-9 mr-3 mb-2 rounded-lg border border-[var(--nourish-green)]/20 bg-[var(--nourish-green)]/5 p-2.5">
              {subQuery.isLoading ? (
                <p className="text-xs text-[var(--nourish-subtext)] animate-pulse">
                  Finding a swap...
                </p>
              ) : subQuery.isError ? (
                <p className="text-xs text-amber-600">
                  Couldn&apos;t find a swap right now. Try using what you have!
                </p>
              ) : subQuery.data ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[var(--nourish-dark)]">
                    {subQuery.data.suggestion}
                  </p>
                  {subQuery.data.notes && (
                    <p className="text-[11px] text-[var(--nourish-subtext)]">
                      {subQuery.data.notes}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      subQuery.data && onRememberSub(subQuery.data.suggestion)
                    }
                    className={cn(
                      "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                      rememberedSub === subQuery.data.suggestion
                        ? "bg-[var(--nourish-green)]/15 text-[var(--nourish-green)]"
                        : "bg-white/60 text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/10",
                    )}
                    aria-label={
                      rememberedSub === subQuery.data.suggestion
                        ? "Swap remembered"
                        : "Remember this swap"
                    }
                  >
                    {rememberedSub === subQuery.data.suggestion
                      ? "Saved as my swap"
                      : "Remember this swap"}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[var(--nourish-subtext)]">
                  No substitution found.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
