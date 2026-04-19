"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCookStore } from "@/lib/hooks/use-cook-store";
import { cn } from "@/lib/utils/cn";

/**
 * TimerStack  -  a slim horizontal strip at the top of the cook view that shows
 * every running timer as a pill with label + remaining time. Designed for
 * combined cooks where "rice has 4 min, curry has 9 min" should be visible at
 * a glance without tapping around.
 *
 * Driven entirely by `useCookStore.timers`. Renders nothing when empty.
 */
export function TimerStack() {
  const timers = useCookStore((s) => s.timers);
  const stopTimer = useCookStore((s) => s.stopTimer);

  if (timers.length === 0) return null;

  // Lowest-remaining first so the most urgent pill reads leftmost.
  const ordered = [...timers].sort((a, b) => {
    // Completed timers sink to the right.
    if (a.completedAt !== null && b.completedAt === null) return 1;
    if (a.completedAt === null && b.completedAt !== null) return -1;
    return a.remaining - b.remaining;
  });

  return (
    <div className="mb-4 -mx-1" role="region" aria-label="Active cook timers">
      <div className="flex gap-2 overflow-x-auto pb-1 pl-1 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {ordered.map((t) => {
            const minutes = Math.floor(t.remaining / 60);
            const seconds = t.remaining % 60;
            const time =
              t.totalSeconds >= 60
                ? `${minutes}:${String(seconds).padStart(2, "0")}`
                : `${t.remaining}s`;
            const isDone = t.completedAt !== null;
            const isLow = !isDone && t.remaining <= 10;
            const fraction =
              t.totalSeconds > 0
                ? Math.max(0, Math.min(1, t.remaining / t.totalSeconds))
                : 0;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 360, damping: 28 }}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 pr-1.5 text-[12px] font-medium",
                  isDone
                    ? "border-[var(--nourish-gold)]/50 bg-[var(--nourish-gold)]/10 text-[var(--nourish-gold)]"
                    : isLow
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-[var(--nourish-border-strong)] bg-white/80 text-[var(--nourish-dark)]",
                )}
              >
                {/* Thin progress bar along the bottom of the pill */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-2 bottom-0 h-[2px] overflow-hidden rounded-full bg-black/5"
                >
                  <motion.span
                    className={cn(
                      "block h-full rounded-full",
                      isDone
                        ? "bg-[var(--nourish-gold)]"
                        : isLow
                          ? "bg-rose-500"
                          : "bg-[var(--nourish-green)]",
                    )}
                    initial={false}
                    animate={{ width: `${fraction * 100}%` }}
                    transition={{ duration: 0.8, ease: "linear" }}
                  />
                </span>

                <span className="max-w-[10rem] truncate">{t.label}</span>
                <span
                  className={cn(
                    "font-mono tabular-nums",
                    isDone ? "" : "text-[var(--nourish-subtext)]",
                  )}
                >
                  {isDone ? "Done!" : time}
                </span>
                <button
                  type="button"
                  onClick={() => stopTimer(t.id)}
                  aria-label={`Stop ${t.label}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--nourish-subtext)]/70 transition-colors hover:bg-black/5 hover:text-[var(--nourish-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
                >
                  <X size={13} strokeWidth={2.2} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
