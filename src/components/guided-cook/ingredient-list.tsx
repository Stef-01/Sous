"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Check,
  Circle,
  ArrowRightLeft,
  Utensils,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUnitPref } from "@/lib/hooks/use-unit-pref";
import { displayQuantity } from "@/lib/units/display-quantity";
import { ingredientEmoji } from "@/lib/utils/ingredient-meta";
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
import { IngredientPantryDot } from "@/components/shared/ingredient-pantry-dot";

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
  const reducedMotion = useReducedMotion();
  const [viewMode, setViewMode] = useState<"dish" | "station">("dish");
  const { system, setSystem } = useUnitPref();
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
    const missing: Array<{
      name: string;
      quantity?: string;
      sourceRecipeSlug?: string;
      sourceRecipeName?: string;
    }> = [];
    for (const section of effectiveSections) {
      for (const item of section.ingredients) {
        if (!checked.has(item.id))
          missing.push({
            name: item.name,
            quantity: item.quantity || undefined,
            sourceRecipeSlug: dishSlug || undefined,
            sourceRecipeName: recipeName || undefined,
          });
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
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
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
          {/* Unit swap — same preference the profile sheet holds. */}
          <div
            role="tablist"
            aria-label="Units"
            className="ml-auto inline-flex items-center rounded-full border border-neutral-200 bg-white p-0.5 text-[11px] font-semibold"
          >
            {(
              [
                ["metric", "g"],
                ["us", "cups"],
              ] as const
            ).map(([sys, label]) => (
              <button
                key={sys}
                type="button"
                role="tab"
                aria-selected={system === sys}
                onClick={() => setSystem(sys)}
                className={cn(
                  "rounded-full px-2.5 py-1 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
                  system === sys
                    ? "bg-[var(--nourish-green)] text-white"
                    : "text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
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
          <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)]">
            {prepGroups.map((group) => (
              <div key={group.station}>
                <h3 className="sous-label border-b border-neutral-100 bg-neutral-50/60 px-4 py-2">
                  {group.label}
                </h3>
                <div className="divide-y divide-neutral-100">
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
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          isChecked
                            ? "bg-[var(--nourish-green)]/5"
                            : "hover:bg-neutral-50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
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
                        {/* Reference grammar (matches IngredientRow): emoji
                            anchor + NAME-left / AMOUNT-right two columns. */}
                        <span
                          className="shrink-0 text-lg leading-none"
                          aria-hidden
                        >
                          {ingredientEmoji(item.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          {/* NAME-left / AMOUNT floated-right; name wraps under
                              the amount (NYT-style), never squeezed. */}
                          <span className="block">
                            {item.quantity && (
                              <span
                                className={cn(
                                  "float-right ml-3 text-[13px] leading-snug tabular-nums",
                                  "text-[var(--nourish-subtext)]",
                                  isChecked && "line-through",
                                )}
                              >
                                {displayQuantity(
                                  item.quantity,
                                  item.name,
                                  system,
                                )}
                              </span>
                            )}
                            <span
                              className={cn(
                                "text-[15px] leading-snug",
                                isChecked
                                  ? "text-[var(--nourish-subtext)] line-through"
                                  : "text-[var(--nourish-dark)]",
                              )}
                            >
                              {item.name}
                              {item.isOptional && (
                                <span className="text-[var(--nourish-subtext)] italic">
                                  {" · optional"}
                                </span>
                              )}
                            </span>
                          </span>
                          {item.sources.length > 1 && (
                            <span className="mt-0.5 block text-xs text-[var(--nourish-subtext)]">
                              {item.sources.join(" & ")}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)]">
            {effectiveSections.map((section, sectionIdx) => {
              const sectionStartIdx = sectionStartIndices[sectionIdx];

              return (
                <div key={section.label || `section-${sectionIdx}`}>
                  {/* Section header  -  only shown in segmented mode; an in-card
                      sub-label so the whole list reads as one unified surface. */}
                  {isSegmented && section.label && (
                    <motion.h3
                      initial={reducedMotion ? false : { opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={
                        reducedMotion
                          ? { duration: 0 }
                          : { delay: sectionStartIdx * 0.04 }
                      }
                      className="sous-label border-b border-neutral-100 bg-neutral-50/60 px-4 py-2"
                    >
                      {section.label}
                    </motion.h3>
                  )}

                  <div className="divide-y divide-neutral-100">
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
                </div>
              );
            })}
          </div>
        )}

        {/* "Got everything?" message when all checked */}
        <AnimatePresence>
          {allChecked && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={
                reducedMotion
                  ? { duration: 0.12 }
                  : { type: "spring", stiffness: 300, damping: 25 }
              }
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
          whileTap={reducedMotion ? undefined : { scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "w-full rounded-xl py-3.5 text-sm font-semibold text-white",
            "transition-colors duration-200",
            allChecked
              ? "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]"
              : "bg-[var(--nourish-green)]/80 hover:bg-[var(--nourish-green)]",
          )}
          type="button"
        >
          {allChecked ? "Start cooking" : "I have everything"}
        </motion.button>

        {/* Add missing ingredients to shopping list */}
        {!allChecked && missingCount > 0 && (
          <motion.button
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 260, damping: 25, delay: 0.1 }
            }
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
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
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 260, damping: 25, delay: 0.15 }
            }
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
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
  const { system } = useUnitPref();
  const reducedMotion = useReducedMotion();
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
        initial={reducedMotion ? false : { opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={reducedMotion ? { duration: 0 } : { delay: idx * 0.04 }}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-2.5",
          "transition-colors duration-100",
          checked && "opacity-50",
        )}
      >
        {/* Checkbox  -  20px visual circle, 44px touch target via before-inset.
            Left-aligned at the row's padding edge so the name sits a tight
            gap-3 away — no stranded gap between the circle and the label. */}
        <button
          onClick={onToggle}
          className="relative flex h-5 w-5 shrink-0 items-center justify-center transition-transform active:scale-90 before:absolute before:-inset-3 before:content-['']"
          type="button"
          aria-label={checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
        >
          {checked ? (
            <motion.div
              initial={reducedMotion ? false : { scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 400, damping: 15 }
              }
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--nourish-green)]"
            >
              <Check size={12} className="text-white" strokeWidth={3} />
            </motion.div>
          ) : (
            <Circle size={20} className="text-neutral-300" />
          )}
        </button>

        {/* Food emoji — a visual anchor for the ingredient (recipe-preview
            style); decorative, the name carries the label. */}
        <span className="shrink-0 text-lg leading-none" aria-hidden>
          {ingredientEmoji(item.name)}
        </span>

        {/* Ingredient info — NAME primary (full width), AMOUNT secondary
            floated top-right and muted. The name flows the full width and
            wraps UNDER the amount (NYT-style), so a long name + a wordy
            amount ("1/2 medium") never squeeze each other into a ragged
            narrow column. */}
        <button
          onClick={onToggle}
          className="min-w-0 flex-1 text-left active:scale-[0.98] transition-transform"
          type="button"
          aria-label={checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
        >
          {item.quantity && (
            <span
              className={cn(
                "float-right ml-3 text-[13px] leading-snug tabular-nums",
                "text-[var(--nourish-subtext)]",
                checked && "line-through",
              )}
            >
              {displayQuantity(item.quantity, item.name, system)}
            </span>
          )}
          {inPantry && (
            <IngredientPantryDot
              status="have"
              optional={item.isOptional ?? false}
              className="mr-1.5 inline-block align-middle"
            />
          )}
          <span
            className={cn(
              "text-[15px] leading-snug",
              checked
                ? "text-[var(--nourish-subtext)] line-through"
                : "text-[var(--nourish-dark)]",
            )}
          >
            {item.name}
            {item.isOptional && (
              <span className="text-[var(--nourish-subtext)] italic">
                {" · optional"}
              </span>
            )}
          </span>
        </button>

        {/* Substitution toggle  -  44px touch target. The ONLY side action: the
            recipe's default sub is surfaced here on tap, never inline. */}
        {!checked && !item.isOptional && (
          <button
            onClick={onAskSub}
            className={cn(
              "flex h-11 w-9 shrink-0 -my-1 items-center justify-center rounded-md transition-colors",
              showingSub
                ? "text-[var(--nourish-green)] bg-[var(--nourish-green)]/10"
                : "text-neutral-400 hover:text-[var(--nourish-subtext)]",
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
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="overflow-hidden"
          >
            <div className="mb-3 ml-12 mr-4 rounded-lg border border-[var(--nourish-green)]/20 bg-[var(--nourish-green)]/5 p-2.5">
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
