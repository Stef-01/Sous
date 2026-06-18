"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionKicker } from "@/components/shared/section-kicker";
import { SettingToggle } from "@/components/ui/setting-toggle";
import { PhysicsSlider } from "@/components/shared/physics-slider";
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
        <SettingToggle
          checked={mode.enabled}
          onChange={() => {
            haptic();
            setPantryModeEnabled(!mode.enabled);
          }}
          label={mode.enabled ? "Turn Pantry Mode off" : "Turn Pantry Mode on"}
        />
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
            <PhysicsSlider
              value={mode.tolerance}
              min={PANTRY_TOLERANCE_MIN}
              max={PANTRY_TOLERANCE_MAX}
              step={1}
              onChange={setPantryTolerance}
              ariaLabel="How many extra ingredients to allow"
              formatValue={(v) => (v === 0 ? "exact" : `up to ${v} extra`)}
              className="mt-2"
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
