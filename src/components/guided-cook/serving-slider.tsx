"use client";

/**
 * ServingSlider — pick how many servings to cook; the ingredient quantities
 * scale with it (via scaleQuantity). A plain styled range input, so it is fully
 * accessible + needs no motion gate. The scalable serving control referenced in
 * the cook flow: the UI here only picks a number; the math lives in
 * lib/cook/scale-quantity.ts.
 */

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
  return Number.isInteger(r) ? `${r}` : `${r}`;
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

  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white p-4",
        className,
      )}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-[var(--nourish-dark)]">
          Servings
        </span>
        <span className="text-sm font-semibold text-[var(--nourish-green)]">
          {servings}
          {Math.abs(multiplier - 1) > 0.01 && (
            <span className="ml-1.5 text-[11px] font-medium text-[var(--nourish-subtext)]">
              ×{formatMultiplier(multiplier)}
            </span>
          )}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={servings}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Servings"
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-[var(--nourish-green)]"
      />
      <div className="mt-1.5 flex justify-between text-[10px] font-medium text-[var(--nourish-subtext-faint)]">
        <span>{min}</span>
        <span>scales the ingredient amounts</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
