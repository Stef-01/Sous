"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useNutritionDiary } from "@/lib/hooks/use-nutrition-diary";
import { usePreferenceProfile } from "@/lib/hooks/use-preference-profile";
import { dishToFacets } from "@/lib/intelligence/dish-to-facets";
import {
  getStaticCookData,
  getStaticMealCookData,
} from "@/data/guided-cook-steps";
import { toast } from "@/lib/hooks/use-toast";
import { haptic } from "@/lib/motion/haptics";
import { cn } from "@/lib/utils/cn";

/**
 * LogItButton (W2 · Phase 3) — the ONE canonical "I ate this" control across every
 * surface (Info sheet, cook readout, quick-add). One write path, one toast, one
 * haptic, one "already logged today" state. `variant`: a compact `pill` (default)
 * or a full-width `block` (the cook-readout style). No form, no modal.
 */
export function LogItButton({
  slug,
  name,
  servings = 1,
  variant = "pill",
  className,
  recordTaste = false,
}: {
  slug: string;
  name: string;
  servings?: number;
  variant?: "pill" | "block";
  className?: string;
  /** When true, logging also feeds the taste flywheel with a `logged` signal
   *  (a real "I ate this" preference). Pass ONLY on non-cook surfaces — the cook
   *  flow already records the stronger `cooked` signal, so passing it on the cook
   *  readout would double-count the same dish. */
  recordTaste?: boolean;
}) {
  const { logCook, entries } = useNutritionDiary();
  const { recordSignal } = usePreferenceProfile();
  const [justLogged, setJustLogged] = useState(false);
  // Already-logged detection lives here now (was re-derived per surface).
  const logged = justLogged || entries.some((e) => e.slug === slug);

  const onLog = () => {
    logCook(slug, name, servings);
    // Flywheel: a manual "I ate this" is a real revealed-taste signal that the
    // diary write alone never sends to the profile. Fire it only on the first
    // log (the already-logged guard) and only when the caller opts in via
    // recordTaste (non-cook surfaces — the cook flow sends `cooked` itself).
    if (recordTaste && !logged) {
      const staticData = getStaticCookData(slug) ?? getStaticMealCookData(slug);
      if (staticData) {
        recordSignal({
          kind: "logged",
          facets: dishToFacets({
            cuisineFamily: staticData.cuisineFamily,
            tags: staticData.flavorProfile,
            ingredients: staticData.ingredients.map((i) => i.name),
          }),
        });
      }
    }
    haptic("commit");
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1800);
    toast.push({
      variant: "success",
      emoji: "🍽️",
      title: `Logged ${name}`,
      body: "In today's diary.",
      dedupKey: `log-${slug}`,
    });
  };

  const tone = logged
    ? "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]"
    : "bg-[var(--nourish-green)] text-white hover:opacity-90";

  if (variant === "block") {
    // Subordinate full-width style (Rule 2): tinted, never solid — it sits under a
    // screen's primary CTA (e.g. the cook "Finish" action).
    return (
      <button
        type="button"
        onClick={onLog}
        aria-label={`Log ${name} to today's diary`}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nourish-green)]/30 py-2.5 text-sm font-medium text-[var(--nourish-green)] transition-colors",
          logged
            ? "bg-[var(--nourish-green)]/12"
            : "bg-[var(--nourish-green)]/5 hover:bg-[var(--nourish-green)]/10",
          className,
        )}
      >
        {logged ? <Check size={15} /> : <Plus size={15} />}
        {logged ? "Logged today" : "Log it"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onLog}
      aria-label={`Log ${name} to today's diary`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
        tone,
        className,
      )}
    >
      {logged ? <Check size={13} /> : <Plus size={13} />}
      {logged ? "Logged" : "Log it"}
    </button>
  );
}
