"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Circle, ArrowRightLeft, Utensils } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { trpc } from "@/lib/trpc/client";

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
  /** Flat ingredient list — used for single-dish mode. */
  ingredients: Ingredient[];
  /** Segmented ingredient sections — used for combined mains+sides mode.
   *  When provided, overrides the flat `ingredients` prop. */
  sections?: IngredientSection[];
  recipeName?: string;
  cuisineFamily?: string;
  onReady: () => void;
  onSelectSides?: () => void;
}

/**
 * Ingredient List — the Grab phase.
 * Checkable list of ingredients with quantities and substitutions.
 * Supports both flat (single-dish) and segmented (combined cook) modes.
 * Tap "I don't have this" for AI-powered substitution suggestions.
 * "I have everything" button advances to Cook phase.
 */
export function IngredientList({
  ingredients,
  sections,
  recipeName = "",
  cuisineFamily = "",
  onReady,
  onSelectSides,
}: IngredientListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [askingSub, setAskingSub] = useState<string | null>(null);

  // Build effective sections: either use provided sections or wrap flat list
  const effectiveSections = useMemo<IngredientSection[]>(() => {
    if (sections && sections.length > 0) return sections;
    return [{ label: "", ingredients }];
  }, [sections, ingredients]);

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
        <h2 className="font-serif text-xl text-[var(--nourish-dark)]">
          Gather these
        </h2>

        {effectiveSections.map((section, sectionIdx) => {
          const sectionStartIdx = sectionStartIndices[sectionIdx];

          return (
            <div
              key={section.label || `section-${sectionIdx}`}
              className="space-y-1"
            >
              {/* Section header — only shown in segmented mode */}
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
                  onToggle={() => toggleItem(item.id)}
                  onAskSub={() =>
                    setAskingSub(askingSub === item.id ? null : item.id)
                  }
                />
              ))}
            </div>
          );
        })}

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

      {/* Pinned CTAs — always visible, no scroll required */}
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
  onToggle,
  onAskSub,
}: {
  item: Ingredient;
  idx: number;
  checked: boolean;
  showingSub: boolean;
  recipeName: string;
  cuisineFamily: string;
  onToggle: () => void;
  onAskSub: () => void;
}) {
  // AI substitution query — fires only when expanded
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
        {/* Checkbox — 44px touch target wraps 20px visual circle */}
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
            {item.isOptional && (
              <span className="text-[10px] text-[var(--nourish-subtext)] italic">
                optional
              </span>
            )}
          </div>
          {item.substitution && !showingSub && (
            <p className="mt-0.5 text-xs text-[var(--nourish-subtext)]/70">
              sub: {item.substitution}
            </p>
          )}
        </button>

        {/* Substitution toggle — 44px touch target */}
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
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-[var(--nourish-dark)]">
                    {subQuery.data.suggestion}
                  </p>
                  {subQuery.data.notes && (
                    <p className="text-[10px] text-[var(--nourish-subtext)]">
                      {subQuery.data.notes}
                    </p>
                  )}
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
