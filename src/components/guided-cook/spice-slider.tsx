"use client";

/**
 * SpiceSlider — minimal 5-dot heat selector that sits inline above any
 * cook step containing chili language. Off-screen unless the step text
 * actually mentions heat (containsChiliHeat upstream).
 *
 * Minimalism (POLISH-CHECKLIST §1.5.2):
 *   - 5 dots, no per-dot labels.
 *   - One quiet line of preview copy below ("kid-mild" / "full heat").
 *   - No icons, no chips, no expand/collapse — the dots ARE the control.
 *   - Inactive dots are nearly invisible; the active dot carries the colour.
 *   - Hides itself when Parent Mode is off AND tolerance is at the
 *     default 3 (zero footprint for users who don't care).
 */

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useHaptic } from "@/lib/hooks/use-haptic";
import type { SpiceTolerance } from "@/lib/parent-mode/spice-rewrite";

interface Props {
  value: SpiceTolerance;
  onChange: (next: SpiceTolerance) => void;
  /** When true, render even at default 3 (used when Parent Mode is on). */
  alwaysShow?: boolean;
}

const PREVIEW: Record<SpiceTolerance, string> = {
  1: "Kid-mild — heat removed",
  2: "Aromatic only — paprika swap",
  3: "A quarter of the chili",
  4: "Half the chili",
  5: "Full heat",
};

export function SpiceSlider({ value, onChange, alwaysShow }: Props) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const haptic = useHaptic();
  if (!alwaysShow && value === 3) return null;

  return (
    <div className="space-y-1.5" aria-label="Spice level">
      <div
        className="inline-flex items-center gap-1.5"
        role="radiogroup"
        aria-label="Adjust spice level"
      >
        {[1, 2, 3, 4, 5].map((dot) => {
          const active = dot <= value;
          return (
            <motion.button
              key={dot}
              type="button"
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
              role="radio"
              aria-checked={dot === value}
              aria-label={`Spice level ${dot} of 5`}
              onClick={() => {
                haptic();
                onChange(dot as SpiceTolerance);
              }}
              className={cn(
                "h-3 w-3 rounded-full transition-colors",
                active
                  ? "bg-[var(--nourish-warm)]"
                  : "bg-[var(--nourish-border)]",
              )}
            />
          );
        })}
      </div>
      <p className="text-[11px] italic leading-snug text-[var(--nourish-subtext)]">
        {PREVIEW[value]}
      </p>
    </div>
  );
}
