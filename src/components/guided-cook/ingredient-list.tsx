"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Square } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  isOptional: boolean | null;
  substitution: string | null;
}

interface IngredientListProps {
  ingredients: Ingredient[];
  onReady: () => void;
}

/**
 * Ingredient List — the Grab phase.
 * Checkable list of ingredients with quantities and substitutions.
 * "I have everything" button advances to Cook phase.
 */
export function IngredientList({ ingredients, onReady }: IngredientListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

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

  const allChecked = checked.size >= ingredients.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <h2 className="font-serif text-xl text-[var(--nourish-dark)]">
        Gather these
      </h2>

      <div className="space-y-1">
        {ingredients.map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            onClick={() => toggleItem(item.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left",
              "hover:bg-neutral-50 transition-colors duration-100",
              checked.has(item.id) && "opacity-60"
            )}
            type="button"
          >
            {/* Checkbox */}
            <div className="mt-0.5 shrink-0">
              {checked.has(item.id) ? (
                <Check size={18} className="text-[var(--nourish-green)]" />
              ) : (
                <Square size={18} className="text-neutral-300" />
              )}
            </div>

            {/* Ingredient info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    checked.has(item.id)
                      ? "text-[var(--nourish-subtext)] line-through"
                      : "text-[var(--nourish-dark)]"
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
              {item.substitution && (
                <p className="mt-0.5 text-xs text-[var(--nourish-subtext)]/70">
                  sub: {item.substitution}
                </p>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Proceed button */}
      <button
        onClick={onReady}
        className={cn(
          "w-full rounded-xl py-3.5 text-sm font-semibold text-white",
          "transition-all duration-200",
          allChecked
            ? "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]"
            : "bg-[var(--nourish-green)]/80 hover:bg-[var(--nourish-green)]"
        )}
        type="button"
      >
        {allChecked ? "Let's cook!" : "I have everything"}
      </button>
    </motion.div>
  );
}
