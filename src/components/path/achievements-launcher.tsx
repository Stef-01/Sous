"use client";

import { useCallback, useEffect, useImperativeHandle, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { AchievementsGrid } from "@/components/path/achievements-grid";
import type { Achievement } from "@/data/achievements";

interface AchievementsLauncherProps {
  unlocked: Achievement[];
  locked: Achievement[];
  /**
   * Optional imperative handle so a parent (e.g. PathHeader's chip) can open
   * the sheet without needing this component to render its own trigger.
   */
  openRef?: React.RefObject<AchievementsLauncherHandle | null>;
  /** When true, renders no inline trigger at all  -  sheet is opened imperatively. */
  headless?: boolean;
}

export interface AchievementsLauncherHandle {
  open: () => void;
}

/**
 * Achievements sheet controller. By default headless  -  the parent renders its
 * own trigger (typically a chip in PathHeader) and calls `open()` via ref.
 * Kept separate from the header so its animation + dismissal logic stays
 * co-located with the grid.
 */
export function AchievementsLauncher({
  unlocked,
  locked,
  openRef,
  headless = true,
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

  useImperativeHandle(
    openRef,
    () => ({
      open: () => setOpen(true),
    }),
    [],
  );

  const total = unlocked.length + locked.length;
  if (total === 0) return null;

  return (
    <>
      {!headless && (
        <div className="px-4 pb-2 pt-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 px-3 py-1.5 text-[12px] font-semibold text-amber-950 shadow-sm ring-1 ring-amber-100/60"
            aria-haspopup="dialog"
          >
            Badges
            <span className="tabular-nums">
              {unlocked.length}/{total}
            </span>
          </button>
        </div>
      )}

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
