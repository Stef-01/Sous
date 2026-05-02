"use client";

/**
 * LunchboxSuggestChip — single chip on the Win screen that opens a
 * bottom sheet with a one-paragraph "how to repurpose this dish for
 * tomorrow's lunchbox" tailored to the dish.
 *
 * Minimalism (POLISH-CHECKLIST §1.5.2):
 *   - Renders only when Parent Mode is on.
 *   - One chip, one sheet, one paragraph. No wizard, no list of
 *     containers, no AI.
 *   - Copy is deterministic per (saucy / starchy / proteiny) shape
 *     inferred from the kid-friendliness label fields.
 *   - When the dish has a matching Content article (post W19 Stanford
 *     swap), append a "Read more" link out to /community/article/.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sandwich as LunchIcon, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { useParentMode } from "@/lib/hooks/use-parent-mode";
import { getKidFriendlinessLabel } from "@/data/parent-mode/kid-friendliness-labels";

interface Props {
  dishSlug: string;
  recipeName: string;
}

export function LunchboxSuggestChip({ dishSlug, recipeName }: Props) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const { profile } = useParentMode();
  const haptic = useHaptic();
  const [open, setOpen] = useState(false);

  if (!profile.enabled) return null;

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
        onClick={() => {
          haptic();
          setOpen(true);
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-[var(--nourish-green)]/30 bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
        )}
        aria-label={`Lunchbox tip for ${recipeName}`}
      >
        <LunchIcon size={13} />
        Pack tomorrow&rsquo;s lunchbox
      </motion.button>

      <LunchboxSheet
        open={open}
        onClose={() => setOpen(false)}
        dishSlug={dishSlug}
        recipeName={recipeName}
      />
    </>
  );
}

function LunchboxSheet({
  open,
  onClose,
  dishSlug,
  recipeName,
}: {
  open: boolean;
  onClose: () => void;
  dishSlug: string;
  recipeName: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const tip = buildLunchboxTip(dishSlug, recipeName);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lunchbox tip"
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Lunchbox tip for ${recipeName}`}
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-md rounded-t-3xl bg-[var(--nourish-cream)] px-5 pt-4 pb-6 shadow-2xl sm:rounded-3xl sm:m-4"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--nourish-border-strong)] sm:hidden" />
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
                  Tomorrow&rsquo;s lunchbox
                </p>
                <h2 className="font-serif text-lg leading-tight text-[var(--nourish-dark)]">
                  {recipeName}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:bg-white/70"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-3 text-[14px] leading-snug text-[var(--nourish-dark)]/90">
              {tip}
            </p>
            <p className="mt-3 text-[10px] text-[var(--nourish-subtext)]/80">
              General lunchbox guidance. Refrigerate by morning, pack with an
              ice block. Not medical advice.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Single deterministic tip per dish — composed from the kid-friendliness
 * label fields when available. No AI; the lunchbox surface is intentionally
 * tiny.
 */
function buildLunchboxTip(dishSlug: string, recipeName: string): string {
  const label = getKidFriendlinessLabel(dishSlug);
  if (!label) {
    return `Pack the leftover ${recipeName} cold-friendly: a thermos for anything saucy, a bento box for components, fresh fruit or carrot sticks on the side. Reheat at school is rare — choose what tastes good cold.`;
  }
  const parts: string[] = [];
  if (label.heatLevel >= 2) {
    parts.push("hold the chili oil and any hot sauce on the side");
  }
  if (label.smellIntensity >= 2) {
    parts.push("pack the strong-smelling sauce in a separate small container");
  }
  if (!label.familiarityAnchor) {
    parts.push("add a familiar carrier (rice, bread, pasta) to the box");
  }
  if (label.visibleGreenFlecks) {
    parts.push("rinse off chopped herb garnish if your kid notices the flecks");
  }
  if (parts.length === 0) {
    return `${recipeName} packs well as-is. Use a thermos if it's saucy, a bento box if it's component-style. Add a fruit + a familiar snack on the side.`;
  }
  return `For tomorrow's box: ${parts.join("; ")}. Use a thermos for anything saucy and a bento box for components. Pack a familiar fruit on the side.`;
}
