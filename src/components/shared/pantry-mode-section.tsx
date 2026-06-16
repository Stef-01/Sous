"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { SectionKicker } from "@/components/shared/section-kicker";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { usePantry } from "@/lib/hooks/use-pantry";
import {
  usePantryMode,
  setPantryModeEnabled,
  setPantryTolerance,
  PANTRY_TOLERANCE_MIN,
  PANTRY_TOLERANCE_MAX,
} from "@/lib/hooks/use-pantry-mode";

/**
 * Pantry Mode settings (Feature C) — a toggle that anchors recommendations to
 * the pantry, plus a tolerance slider for how many *extra* (non-staple)
 * ingredients a recipe may need and still be prioritised. Same toggle shape as
 * Parent / Eco Mode. Lives in the Profile & Settings sheet — the single
 * permitted settings surface (rule 3), extended here at the founder's request.
 */
export function PantryModeSection() {
  const reducedMotion = useReducedMotion();
  const haptic = useHaptic();
  const mode = usePantryMode();
  const { items: pantryItems, mounted } = usePantry();
  const pantryCount = mounted ? pantryItems.length : 0;

  const toleranceLabel =
    mode.tolerance === 0
      ? "Only what I can make now"
      : `Up to ${mode.tolerance} extra ${
          mode.tolerance === 1 ? "ingredient" : "ingredients"
        }`;

  return (
    <section className="mt-4 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <SectionKicker as="p" size="10px">
            Pantry Mode
          </SectionKicker>
          <p className="text-[13px] text-[var(--nourish-dark)]">
            Anchor suggestions to what you have — recipes you can make float to
            the top.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            haptic();
            setPantryModeEnabled(!mode.enabled);
          }}
          role="switch"
          aria-checked={mode.enabled}
          aria-label={
            mode.enabled ? "Turn Pantry Mode off" : "Turn Pantry Mode on"
          }
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
            mode.enabled ? "bg-[var(--nourish-green)]" : "bg-neutral-200",
          )}
        >
          <motion.span
            layout={!reducedMotion}
            transition={
              reducedMotion
                ? { duration: 0.12 }
                : { type: "spring", stiffness: 500, damping: 30 }
            }
            className={cn(
              "inline-block h-5 w-5 rounded-full bg-white shadow",
              mode.enabled ? "ml-6" : "ml-1",
            )}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {mode.enabled && (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={
              reducedMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }
            }
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reducedMotion ? 0.12 : 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex items-center justify-between gap-2">
              <SectionKicker as="p" size="10px">
                Shopping tolerance
              </SectionKicker>
              <span className="text-[11px] font-medium text-[var(--nourish-green)]">
                {toleranceLabel}
              </span>
            </div>
            <input
              type="range"
              min={PANTRY_TOLERANCE_MIN}
              max={PANTRY_TOLERANCE_MAX}
              step={1}
              value={mode.tolerance}
              onChange={(e) => setPantryTolerance(Number(e.target.value))}
              aria-label="How many extra ingredients to allow"
              className="mt-2 w-full accent-[var(--nourish-green)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--nourish-subtext-faint)]">
              <span>Exact</span>
              <span>Flexible</span>
            </div>
            <p className="mt-3 text-[10px] leading-snug text-[var(--nourish-subtext-faint)]">
              Basics like oil, salt, butter, water and common spices are always
              assumed on hand.
              {pantryCount === 0 &&
                " Add items to your pantry for this to take effect."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
