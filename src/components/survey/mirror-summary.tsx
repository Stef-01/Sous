"use client";

import { FoodGlyph, isFoodGlyphName } from "@/components/icons/food-glyphs";

/**
 * MirrorSummary — the closing "here's what we heard" beat (planning.md §6.2 W1,
 * Family A P4). One echo card per captured signal: a glyph + a single-line
 * forward-promise (NEVER a fabricated stat — D-22, enforced by test). The CTA
 * is the shell's footer button, so this renders only the stacked cards.
 */
export function MirrorSummary({
  cards,
}: {
  cards: { glyph?: string; text: string }[];
}) {
  return (
    <div className="flex flex-col gap-[var(--row-gap)] py-1">
      {cards.map((card, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--nourish-border)] bg-white px-4 py-3.5 shadow-[var(--shadow-raised)]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]">
            <FoodGlyph
              name={isFoodGlyphName(card.glyph) ? card.glyph : "utensils"}
              size={22}
            />
          </span>
          <p className="text-[14px] font-medium leading-snug text-[var(--nourish-dark)]">
            {card.text}
          </p>
        </div>
      ))}
    </div>
  );
}
