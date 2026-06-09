"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";
import { useRestDays } from "@/lib/hooks/use-rest-days";
import { useXPSystem } from "@/lib/hooks/use-xp-system";
import { cn } from "@/lib/utils/cn";

interface StreakCounterProps {
  streak?: number;
}

/**
 * StreakCounter  -  compact pill with a tiny "…" affordance. The overflow menu
 * reveals a single inline confirm: "Take a rest day." Rest days bridge the
 * streak so one skipped day doesn't reset progress. The pill renders with a
 * dotted ring around today when a rest day is active so the user can see the
 * streak is being held open on purpose.
 */
export function StreakCounter({ streak = 0 }: StreakCounterProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { canRestToday, todayIsRestDay, markRestDay, mounted } = useRestDays();
  const reducedMotion = useReducedMotion();
  const { awardXP } = useXPSystem();

  // Close the popover on outside tap / Escape, matching the existing subtle
  // popover patterns elsewhere in the app.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setConfirming(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (streak <= 0) return null;

  const showMenuButton = mounted;

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (showMenuButton) {
            setOpen((v) => !v);
            setConfirming(false);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Streak: ${streak} day${streak === 1 ? "" : "s"}. Streak options.`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={
          reducedMotion || !showMenuButton ? undefined : { scale: 0.94 }
        }
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "flex items-center gap-1 rounded-full bg-[var(--nourish-warm)]/10 px-2 py-1 transition-colors duration-150 hover:bg-[var(--nourish-warm)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
          // Dotted ring when today is a rest day  -  signals the streak is
          // being intentionally held open.
          todayIsRestDay &&
            "outline-dashed outline-1 outline-offset-2 outline-[var(--nourish-warm)]/60",
        )}
      >
        {/* W22b animation: continuous flicker on the flame once the streak
            has momentum (>= 3 days) — and the flame EARNS intensity with the
            streak: gentle at 3+, filled + livelier at 7+, a proud wobble at
            30+. Cheap sine loops; skipped under prefers-reduced-motion. */}
        <motion.span
          aria-label="streak"
          animate={
            streak >= 3 && !reducedMotion
              ? {
                  scale: [
                    1,
                    streak >= 30 ? 1.16 : streak >= 7 ? 1.12 : 1.08,
                    1,
                  ],
                  opacity: [1, 0.85, 1],
                  ...(streak >= 30 ? { rotate: [0, -4, 4, 0] } : {}),
                }
              : undefined
          }
          transition={{
            duration: streak >= 30 ? 1.1 : streak >= 7 ? 1.3 : 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="inline-flex"
        >
          <Flame
            size={12}
            className={cn(
              "text-[var(--nourish-warm)]",
              // A week of momentum fills the flame — the quiet badge upgrade.
              streak >= 7 && "fill-current",
            )}
            strokeWidth={2.2}
          />
        </motion.span>
        <span className="text-[11px] font-bold text-[var(--nourish-warm)]">
          {streak}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -2, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="absolute left-0 top-full z-30 mt-1.5 w-56 rounded-xl border border-[var(--nourish-border-strong)] bg-white p-1.5 shadow-lg"
          >
            {todayIsRestDay ? (
              <div className="flex flex-col gap-1 px-2 py-2 text-[12px] text-[var(--nourish-subtext)]">
                <span className="font-medium text-[var(--nourish-dark)]">
                  Resting today
                </span>
                <span className="text-[11px]">
                  Your streak stays alive. Cook tomorrow to keep it going.
                </span>
              </div>
            ) : !canRestToday ? (
              <div className="flex flex-col gap-1 px-2 py-2 text-[12px] text-[var(--nourish-subtext)]">
                <span className="font-medium text-[var(--nourish-dark)]">
                  Rest day already used
                </span>
                <span className="text-[11px]">
                  One rest day per week keeps the streak honest.
                </span>
              </div>
            ) : !confirming ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => setConfirming(true)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] text-[var(--nourish-dark)] transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
              >
                <span>Take a rest day</span>
                <span className="sous-label">1 / week</span>
              </button>
            ) : (
              <div className="flex flex-col gap-1.5 p-1.5">
                <p className="px-1 text-[12px] text-[var(--nourish-subtext)]">
                  Keep the streak alive without cooking today?
                </p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      markRestDay();
                      // Audit-only zero-XP event per the XP ledger convention.
                      awardXP("rest_day", 0);
                      setConfirming(false);
                      setOpen(false);
                    }}
                    className="flex-1 rounded-lg bg-[var(--nourish-green)] px-2.5 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[var(--nourish-dark-green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40 active:scale-[0.97]"
                  >
                    Rest today
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="rounded-lg border border-[var(--nourish-border-strong)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--nourish-subtext)] transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
                  >
                    Nevermind
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
