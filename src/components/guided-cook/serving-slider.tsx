"use client";

/**
 * ServingSlider — pick how many servings to cook; the ingredient quantities
 * scale with it (via scaleQuantity). Reference-visual refinement (2026-06-09):
 * a − N + stepper pill (the Crouton/Mela grammar) replaces the range slider —
 * more precise (exact taps, no thumb-drag overshoot), more compact, and the
 * same control vocabulary as the diary's servings stepper. Same name + API so
 * both cook pages are untouched; the math stays in lib/cook/scale-quantity.ts.
 */

import { Minus, Plus } from "lucide-react";
import { haptic } from "@/lib/motion/haptics";
import { cn } from "@/lib/utils/cn";

interface Props {
  servings: number;
  baseServings: number;
  min?: number;
  max?: number;
  onChange: (servings: number) => void;
  className?: string;
}

function formatMultiplier(m: number): string {
  const r = Math.round(m * 100) / 100;
  return `${r}`;
}

export function ServingSlider({
  servings,
  baseServings,
  min = 1,
  max = 8,
  onChange,
  className,
}: Props) {
  const multiplier = baseServings > 0 ? servings / baseServings : 1;
  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, servings + delta));
    if (next !== servings) {
      haptic("select");
      onChange(next);
    }
  };

  return (
    <div className={cn("flex items-center justify-between p-4", className)}>
      <div className="flex items-center gap-2.5">
        <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={servings <= min}
            aria-label="Fewer servings"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--nourish-dark)] transition-colors hover:bg-neutral-100 active:scale-95 disabled:opacity-30"
          >
            <Minus size={15} strokeWidth={2.2} />
          </button>
          <span
            aria-live="polite"
            className="min-w-[36px] text-center font-serif text-lg leading-none text-[var(--nourish-dark)]"
          >
            {servings}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={servings >= max}
            aria-label="More servings"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--nourish-dark)] transition-colors hover:bg-neutral-100 active:scale-95 disabled:opacity-30"
          >
            <Plus size={15} strokeWidth={2.2} />
          </button>
        </div>
        <span className="text-[13px] text-[var(--nourish-subtext)]">
          servings
        </span>
      </div>
      {Math.abs(multiplier - 1) > 0.01 && (
        <span className="rounded-full bg-[var(--nourish-green)]/10 px-2 py-1 text-[11px] font-semibold text-[var(--nourish-green)]">
          ×{formatMultiplier(multiplier)} amounts
        </span>
      )}
    </div>
  );
}
