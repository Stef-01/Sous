"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FoodGlyph, isFoodGlyphName } from "@/components/icons/food-glyphs";
import { toggleMultiValue } from "@/lib/surveys/survey-logic";

/**
 * CheckRow — a multi-select survey row (planning.md §6.2 W1). A 24px rounded
 * checkbox on the LEFT (Family A grammar), then an optional glyph + label.
 * Selection state and the none-option exclusivity are owned by the parent
 * (`MultiSelect`); this is the leaf row.
 */
export function CheckRow({
  label,
  glyph,
  subtext,
  selected,
  onToggle,
}: {
  label: string;
  glyph?: string;
  subtext?: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        "flex min-h-[64px] w-full items-center gap-3 rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left transition-colors",
        selected
          ? "border-[var(--nourish-green)] bg-[var(--nourish-green)]/[0.05]"
          : "border-[var(--nourish-border-strong)] bg-white hover:border-[var(--nourish-green)]/40",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border-2 transition-colors",
          selected
            ? "border-[var(--nourish-green)] bg-[var(--nourish-green)] text-white"
            : "border-[var(--nourish-border-strong)] text-transparent",
        )}
      >
        <Check size={14} strokeWidth={3} />
      </span>
      {isFoodGlyphName(glyph) && (
        <FoodGlyph
          name={glyph}
          size={22}
          className="shrink-0 text-[var(--nourish-green)]"
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium text-[var(--nourish-dark)]">
          {label}
        </span>
        {subtext && (
          <span className="mt-0.5 block text-[13px] text-[var(--nourish-subtext)]">
            {subtext}
          </span>
        )}
      </span>
    </button>
  );
}

/**
 * MultiSelect — owns the selected-set + the exclusive none-option logic for a
 * `multi` step. Picking the none-option clears the rest; picking anything else
 * clears the none-option.
 */
export function MultiSelect({
  options,
  value,
  noneValue,
  onChange,
}: {
  options: { value: string; label: string; glyph?: string; subtext?: string }[];
  value: string[];
  noneValue?: string;
  onChange: (next: string[]) => void;
}) {
  const toggle = (v: string) => onChange(toggleMultiValue(value, v, noneValue));

  return (
    <div className="flex flex-col gap-[var(--row-gap)]">
      {options.map((o) => (
        <CheckRow
          key={o.value}
          label={o.label}
          glyph={o.glyph}
          subtext={o.subtext}
          selected={value.includes(o.value)}
          onToggle={() => toggle(o.value)}
        />
      ))}
    </div>
  );
}
