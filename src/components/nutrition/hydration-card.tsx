"use client";

import { GlassWater } from "lucide-react";
import { useHydration } from "@/lib/hooks/use-hydration";
import { cn } from "@/lib/utils/cn";

/**
 * HydrationCard (W23) — a daily water tracker. The glass pips ARE the control
 * (rule 13: no separate +/− buttons): tap the Nth glass to fill up to it, tap
 * the last-filled glass to empty it. Capped at the 8-glass goal.
 */
export function HydrationCard() {
  const { mounted, glasses, goal, ml, setGlasses } = useHydration();
  if (!mounted) return null;

  const met = glasses >= goal;

  return (
    <section className="rounded-2xl border border-[var(--nourish-border-strong)] bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="sous-label">Water</p>
        <span
          className={cn(
            "text-[12px] tabular-nums",
            met
              ? "font-medium text-[var(--nourish-green)]"
              : "text-[var(--nourish-subtext)]",
          )}
        >
          {met ? "Goal hit" : `${glasses} of ${goal}`} · {ml} ml
        </span>
      </div>

      <div
        className="mt-3 flex items-center gap-1"
        role="group"
        aria-label="Water glasses"
      >
        {Array.from({ length: goal }, (_, i) => {
          const filled = i < glasses;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setGlasses(glasses === i + 1 ? i : i + 1)}
              aria-label={`Set water to ${i + 1} ${i === 0 ? "glass" : "glasses"}`}
              aria-pressed={filled}
              className="flex flex-1 items-center justify-center rounded-lg py-1.5 transition-transform active:scale-90"
            >
              <GlassWater
                size={20}
                className={cn(
                  "transition-colors",
                  filled ? "text-sky-500" : "text-neutral-300",
                )}
                fill={filled ? "currentColor" : "none"}
                strokeWidth={filled ? 1.5 : 2}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
