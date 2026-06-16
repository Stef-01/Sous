"use client";

import { cn } from "@/lib/utils/cn";
import { FoodGlyph, isFoodGlyphName } from "@/components/icons/food-glyphs";
import type { SurveyOption } from "@/types/survey";

/**
 * GlyphGrid — a 3-col grid of 88px circles (planning.md §6.2 W1, Family B). In
 * `select` mode a pick gets a green ring + tint. In `dislike` mode a pick gets
 * the accent (evaluate) ring, a diagonal slash overlay, and a struck-through
 * muted label — the dislikes grammar from IMG_4557. The value is a string[].
 */
export function GlyphGrid({
  options,
  value,
  mode = "select",
  onChange,
}: {
  options: SurveyOption[];
  value: string[];
  mode?: "select" | "dislike";
  onChange: (next: string[]) => void;
}) {
  const dislike = mode === "dislike";
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-4">
      {options.map((o) => {
        const selected = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={selected}
            aria-label={`${dislike && selected ? "Disliked" : ""} ${o.label}`.trim()}
            onClick={() => toggle(o.value)}
            className="flex flex-col items-center gap-2"
          >
            <span
              className={cn(
                "relative flex h-[88px] w-[88px] items-center justify-center rounded-full border-2 transition-colors",
                selected
                  ? dislike
                    ? "border-[var(--nourish-evaluate)] bg-[var(--nourish-evaluate)]/[0.06] text-[var(--nourish-evaluate)]"
                    : "border-[var(--nourish-green)] bg-[var(--nourish-green)]/[0.07] text-[var(--nourish-green)]"
                  : "border-[var(--nourish-border-strong)] bg-white text-[var(--nourish-dark)] hover:border-[var(--nourish-green)]/40",
              )}
            >
              <FoodGlyph
                name={isFoodGlyphName(o.glyph) ? o.glyph : "utensils"}
                size={36}
              />
              {selected && dislike && (
                <svg
                  className="absolute inset-0"
                  viewBox="0 0 88 88"
                  aria-hidden
                  fill="none"
                  stroke="var(--nourish-evaluate)"
                  strokeWidth={3}
                  strokeLinecap="round"
                >
                  <line x1="22" y1="22" x2="66" y2="66" />
                </svg>
              )}
            </span>
            <span
              className={cn(
                "text-center text-[12px] font-medium leading-tight",
                selected && dislike
                  ? "text-[var(--nourish-subtext)] line-through"
                  : "text-[var(--nourish-dark)]",
              )}
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
