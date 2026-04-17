"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Users } from "lucide-react";
import { useTasteBlend } from "@/lib/hooks/use-taste-blend";

/** One-time playful prompt on Path: "Cooking for someone else tonight
 *  too?" If yes, we turn on duo mode with a neutral blend (alpha = 0.5)
 *  and let the user fine-tune via the "Cook for two" chip on Today. No
 *  second account, no second profile, no settings. */
export function TasteBlendPrompt() {
  const { mounted, shouldPrompt, setDuo, dismissPrompt } = useTasteBlend();
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {shouldPrompt && (
        <motion.section
          key="taste-blend-prompt"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          aria-label="Cooking for someone else"
          className="mx-auto mt-3 max-w-md rounded-2xl border border-[var(--nourish-border-strong)] bg-white/80 px-4 py-3 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-green)]/10">
              <Users size={16} className="text-[var(--nourish-green)]" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-[var(--nourish-dark)]">
                Cooking for someone else tonight too?
              </p>
              <p className="text-[11px] text-[var(--nourish-subtext)]">
                We&apos;ll blend their taste into your pairings. One knob, no
                extra account — change it anytime from the Today tab.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDuo(true)}
                  className="flex-1 rounded-lg bg-[var(--nourish-green)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--nourish-dark-green)]"
                >
                  Yes, blend it
                </button>
                <button
                  type="button"
                  onClick={dismissPrompt}
                  className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-xs text-[var(--nourish-subtext)] hover:border-neutral-300"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
