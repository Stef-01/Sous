"use client";

/**
 * UnverifiedRecipeCard — pure presentational card for an
 * agent-generated recipe candidate (Y5 E, audit P0).
 *
 * Verified vs. Unverified taxonomy: catalog dishes (sides /
 * meals seeded into the data layer) are Verified; anything the
 * autogen pipeline returns is Unverified until a clinician /
 * editorial pass blesses it. The Unverified UI MUST make that
 * provenance unambiguous so the user can decide whether to
 * trust the recipe.
 *
 * Visual treatment:
 *   - amber provenance pill ("Unverified · agent draft")
 *   - dashed-border card so it reads as a "candidate" not a
 *     blessed recipe
 *   - tap-for-info affordance via aria-describedby on the pill
 *
 * No data fetching here — caller passes the parsed
 * AutogenResponse + a tap handler.
 */

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Info } from "lucide-react";
import type { AutogenResponse } from "@/lib/recipe-authoring/autogen-prompt";
import { cn } from "@/lib/utils/cn";

interface UnverifiedRecipeCardProps {
  recipe: AutogenResponse;
  /** Tap handler — caller decides what to do with the draft
   *  (stash + navigate, open in a sheet, etc). */
  onOpen: () => void;
  /** Optional disabled flag for the CTA (e.g. while a stash
   *  operation is in flight). */
  disabled?: boolean;
}

export function UnverifiedRecipeCard({
  recipe,
  onOpen,
  disabled = false,
}: UnverifiedRecipeCardProps) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const totalMinutes = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="space-y-2 rounded-2xl border border-dashed border-[var(--nourish-warm)]/40 bg-white/80 p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p
            id={`unverified-pill-${recipe.dishName}`}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--nourish-warm)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-warm)]"
          >
            <Sparkles size={10} aria-hidden />
            Unverified · agent draft
          </p>
          <h3 className="font-serif text-base font-semibold leading-tight text-[var(--nourish-dark)]">
            {recipe.title}
          </h3>
          <p className="text-[12px] leading-snug text-[var(--nourish-subtext)]">
            {recipe.description}
          </p>
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--nourish-subtext)]">
        <div>
          <dt className="sr-only">Cuisine</dt>
          <dd className="capitalize">{recipe.cuisineFamily}</dd>
        </div>
        <div>
          <dt className="sr-only">Time</dt>
          <dd>{totalMinutes} min total</dd>
        </div>
        <div>
          <dt className="sr-only">Skill</dt>
          <dd className="capitalize">{recipe.skillLevel}</dd>
        </div>
        <div>
          <dt className="sr-only">Ingredient count</dt>
          <dd>
            {recipe.ingredients.length} ingredient
            {recipe.ingredients.length === 1 ? "" : "s"}
          </dd>
        </div>
      </dl>

      <p
        className="flex items-start gap-1 rounded-lg bg-[var(--nourish-warm)]/5 px-2.5 py-1.5 text-[10px] leading-snug text-[var(--nourish-subtext)]"
        aria-describedby={`unverified-pill-${recipe.dishName}`}
      >
        <Info size={11} className="mt-px shrink-0" aria-hidden />
        Generated for you. Review the steps before you cook — sources
        aren&apos;t verified.
      </p>

      <button
        type="button"
        onClick={onOpen}
        disabled={disabled}
        className={cn(
          "mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors",
          disabled
            ? "cursor-not-allowed bg-neutral-100 text-neutral-400"
            : "bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)]",
        )}
      >
        Open as draft
      </button>
    </motion.div>
  );
}
