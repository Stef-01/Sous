"use client";

import { cn } from "@/lib/utils/cn";
import { FoodGlyph, isFoodGlyphName } from "@/components/icons/food-glyphs";
import { toggleMultiValue } from "@/lib/surveys/survey-logic";
import type { SurveyOption } from "@/types/survey";

/**
 * ChipCloud — a wrap layout of 32px multi-select pills (planning.md §6.2 W1,
 * Family C). Options flagged `recommended` render first under a pre-tinted
 * "Recommended for you" group. Supports an exclusive none-chip.
 */
export function ChipCloud({
  options,
  value,
  noneValue,
  onChange,
}: {
  options: SurveyOption[];
  value: string[];
  noneValue?: string;
  onChange: (next: string[]) => void;
}) {
  const toggle = (v: string) => onChange(toggleMultiValue(value, v, noneValue));

  const recommended = options.filter((o) => o.recommended);
  const rest = options.filter((o) => !o.recommended);

  const Chip = (o: SurveyOption) => {
    const selected = value.includes(o.value);
    return (
      <button
        key={o.value}
        type="button"
        role="checkbox"
        aria-checked={selected}
        onClick={() => toggle(o.value)}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
          selected
            ? "border-[var(--nourish-green)] bg-[var(--nourish-green)] text-white"
            : o.recommended
              ? "border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/[0.06] text-[var(--nourish-green)] hover:bg-[var(--nourish-green)]/10"
              : "border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-dark)] hover:border-[var(--nourish-green)]/40",
        )}
      >
        {isFoodGlyphName(o.glyph) && <FoodGlyph name={o.glyph} size={15} />}
        {o.label}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {recommended.length > 0 && (
        <div>
          <p className="sous-label mb-2">Recommended for you</p>
          <div className="flex flex-wrap gap-2">{recommended.map(Chip)}</div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">{rest.map(Chip)}</div>
    </div>
  );
}
