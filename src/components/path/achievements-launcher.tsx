"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, X } from "lucide-react";
import { AchievementsGrid } from "@/components/path/achievements-grid";
import type { Achievement } from "@/data/achievements";

interface AchievementsLauncherProps {
  unlocked: Achievement[];
  locked: Achievement[];
}

/**
 * Floating badges entry point — keeps Path uncluttered while preserving
 * the full achievements grid in a lightweight overlay.
 */
export function AchievementsLauncher({
  unlocked,
  locked,
}: AchievementsLauncherProps) {
  const [open, setOpen] = useState(false);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onKey]);

  const total = unlocked.length + locked.length;
  if (total === 0) return null;

  return (
    <>
      {/* FAB sits above the tab bar (≈64px) with a safe-area-aware offset
          so it never overlaps Today/Path/Community icons. The button has
          a minimum 44×44 tap target for iOS HIG and Android Material. */}
      <div
        className="fixed right-3 z-[55] sm:right-4"
        style={{
          bottom: "calc(5.25rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => setOpen(true)}
          className="flex min-h-[44px] items-center gap-2 rounded-full border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-2.5 text-[13px] font-semibold text-amber-950 shadow-[0_8px_20px_-6px_rgba(120,80,20,0.35)] ring-1 ring-amber-100/80 transition-shadow hover:shadow-[0_10px_24px_-6px_rgba(120,80,20,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          aria-label={`View badges and achievements (${unlocked.length} of ${total} unlocked)`}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <Award className="h-4 w-4 text-amber-600" aria-hidden />
          <span>Badges</span>
          <span className="rounded-full bg-white/90 px-2 py-0.5 tabular-nums text-[11px] text-amber-900">
            {unlocked.length}/{total}
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              aria-label="Close achievements"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="achievements-sheet-title"
              className="relative z-10 max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-neutral-200 bg-[var(--nourish-cream)] shadow-2xl"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-[var(--nourish-cream)]/95 px-4 py-3 backdrop-blur-sm">
                <h2
                  id="achievements-sheet-title"
                  className="font-serif text-lg font-semibold text-[var(--nourish-dark)]"
                >
                  Achievements
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-[var(--nourish-subtext)] transition hover:bg-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-2 pb-6 pt-2">
                <AchievementsGrid
                  unlocked={unlocked}
                  locked={locked}
                  showHeading={false}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
