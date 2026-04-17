"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Users, X } from "lucide-react";
import { useTasteBlend } from "@/lib/hooks/use-taste-blend";

/** Cook-for-two chip + slider.
 *
 *  Collapsed state: a small pill that says "Cook for two?" (when duo is
 *  off) or "Cooking for two" with the current blend label (when on). Tap
 *  expands into the single blend slider — one knob, no settings.
 *
 *  Deliberately below the primary quest card so it never competes for
 *  attention. It's the kind of thing you reach for occasionally, not every
 *  cook. */
export function CookForTwoChip() {
  const { mounted, duo, alpha, setDuo, setAlpha } = useTasteBlend();
  const [open, setOpen] = useState(false);

  if (!mounted) return null;

  const blendLabel =
    alpha >= 0.75
      ? "Mostly yours"
      : alpha >= 0.45
        ? "Balanced"
        : alpha >= 0.2
          ? "Mostly theirs"
          : "All theirs";

  return (
    <section aria-label="Cook for two" className="mx-auto max-w-md">
      <motion.button
        layout
        type="button"
        onClick={() => {
          if (!duo) setDuo(true);
          setOpen((o) => !o);
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={`flex w-full items-center justify-between gap-2 rounded-full border px-4 py-2 text-xs transition-colors ${
          duo
            ? "border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5 text-[var(--nourish-green)]"
            : "border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-subtext)]"
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <Users size={13} />
          {duo ? `Cooking for two · ${blendLabel}` : "Cook for two?"}
        </span>
        {duo && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setDuo(false);
              setOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                setDuo(false);
                setOpen(false);
              }
            }}
            aria-label="Turn off cook for two"
            className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--nourish-subtext)] hover:bg-[var(--nourish-cream)]"
          >
            <X size={12} />
          </span>
        )}
      </motion.button>

      <AnimatePresence initial={false}>
        {duo && open && (
          <motion.div
            layout
            key="slider"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2 rounded-2xl border border-[var(--nourish-border-strong)] bg-white px-4 py-3">
              <div className="flex items-center justify-between text-[11px] text-[var(--nourish-subtext)]">
                <span>More theirs</span>
                <span>More yours</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(alpha * 100)}
                onChange={(e) =>
                  setAlpha(Number.parseInt(e.target.value, 10) / 100)
                }
                aria-label="Taste blend — more theirs or more yours"
                className="w-full accent-[var(--nourish-green)]"
              />
              <p className="text-center text-[11px] text-[var(--nourish-subtext)]">
                {blendLabel}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
