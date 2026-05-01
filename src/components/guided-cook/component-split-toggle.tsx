"use client";

/**
 * ComponentSplitToggle — final-assembly affordance that lets a parent
 * plate the dish two ways from one base recipe: a full adult plate and
 * a kid-friendly one with sauce/heat/herbs aside.
 *
 * Minimalism (POLISH-CHECKLIST §1.5.2):
 *   - Renders ONLY when (a) Parent Mode is on, (b) the dish is
 *     deconstructable per the kid-friendliness label, and (c) it's the
 *     last step of the cook flow.
 *   - One pill toggle with two states: "One bowl" (default, no
 *     change) and "Adult & kid plates" (renders the split note).
 *   - The split note is ONE deterministic line — no AI, no list of
 *     "ten things to do differently". Just the rule: hold the heat,
 *     hold the strong garnish, hold the touched-sauce.
 *   - Hides itself when Parent Mode is off — zero footprint.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { useParentMode } from "@/lib/hooks/use-parent-mode";
import { getKidFriendlinessLabel } from "@/data/parent-mode/kid-friendliness-labels";

interface Props {
  dishSlug: string;
}

export function ComponentSplitToggle({ dishSlug }: Props) {
  const { profile } = useParentMode();
  const [open, setOpen] = useState(false);
  const haptic = useHaptic();

  if (!profile.enabled) return null;

  const label = getKidFriendlinessLabel(dishSlug);
  if (!label || !label.deconstructable) return null;

  const splitNote = buildSplitNote(label);

  return (
    <div className="space-y-2" aria-label="Plate split for kids">
      <button
        type="button"
        onClick={() => {
          haptic();
          setOpen((v) => !v);
        }}
        aria-pressed={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
          open
            ? "bg-[var(--nourish-green)] text-white"
            : "bg-neutral-100 text-[var(--nourish-dark)] hover:bg-neutral-200",
        )}
      >
        {open ? "Adult & kid plates" : "Plate split for kids"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <p className="rounded-2xl bg-[var(--nourish-green)]/8 p-3 text-[12px] leading-snug text-[var(--nourish-dark)]/90">
              {splitNote}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Single deterministic line. Composed from the label fields so it
 * stays specific to the dish without invoking AI.
 */
function buildSplitNote(
  label: NonNullable<ReturnType<typeof getKidFriendlinessLabel>>,
): string {
  const parts: string[] = [];
  if (label.heatLevel >= 2) {
    parts.push("hold the chili on the kid plate");
  }
  if (label.visibleGreenFlecks) {
    parts.push("skip the green garnish on the kid plate");
  }
  if (label.smellIntensity >= 2) {
    parts.push("serve the strong sauce on the side");
  }
  if (parts.length === 0) {
    return "Plate the kid portion first, sauce on the side, finish the adult plate as written.";
  }
  return `For the kid plate: ${parts.join(", ")}. Adult plate gets the full version.`;
}
