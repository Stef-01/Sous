"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FoodGlyph, isFoodGlyphName } from "@/components/icons/food-glyphs";

/**
 * OptionRow — a single-select survey row (planning.md §6.2 W1). Min-h 64px,
 * `--radius-md`, a leading food glyph, label + optional witty subtext / a
 * "(Recommended)" caption, and a check disc on the right that fills green when
 * selected (Family C grammar). Selected rows also get a green ring.
 */
export function OptionRow({
  label,
  glyph,
  subtext,
  recommended,
  selected,
  onSelect,
}: {
  label: string;
  glyph?: string;
  subtext?: string;
  recommended?: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex min-h-[64px] w-full items-center gap-3 rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left transition-colors",
        selected
          ? "border-2 border-[var(--nourish-green)] bg-[var(--nourish-green)]/[0.05]"
          : "border-[var(--nourish-border-strong)] bg-white hover:border-[var(--nourish-green)]/40",
      )}
    >
      {isFoodGlyphName(glyph) && (
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            selected
              ? "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]"
              : "bg-[var(--nourish-cream)] text-[var(--nourish-dark)]",
          )}
        >
          <FoodGlyph name={glyph} size={22} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium text-[var(--nourish-dark)]">
          {label}
        </span>
        {(subtext || recommended) && (
          <span className="mt-0.5 block text-[13px] text-[var(--nourish-subtext)]">
            {recommended ? "(Recommended)" : subtext}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className={cn(
          "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected
            ? "border-[var(--nourish-green)] bg-[var(--nourish-green)] text-white"
            : "border-[var(--nourish-border-strong)] text-transparent",
        )}
      >
        <Check size={13} strokeWidth={3} />
      </span>
    </button>
  );
}
