"use client";

import { Lock } from "lucide-react";
import { FoodGlyph, isFoodGlyphName } from "@/components/icons/food-glyphs";

/**
 * Interstitial — a between-steps beat (planning.md §6.2 W1, Family C). A glyph
 * tile, an eyebrow, a serif headline, a ≤2-line body, and an optional locked
 * privacy caption. Renders inside the shell content slot (the shell supplies
 * the CTA), so it owns no progress/footer chrome.
 */
export function Interstitial({
  glyph,
  eyebrow,
  title,
  body,
  caption,
}: {
  glyph?: string;
  eyebrow?: string;
  title: string;
  body?: string;
  caption?: string;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 px-2 text-center">
      {isFoodGlyphName(glyph) && (
        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-[var(--radius-lg)] bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]">
          <FoodGlyph name={glyph} size={40} strokeWidth={1.6} />
        </span>
      )}
      {eyebrow && <p className="sous-label">{eyebrow}</p>}
      <h3 className="font-serif text-[26px] font-normal leading-[1.15] [text-wrap:balance] text-[var(--nourish-dark)]">
        {title}
      </h3>
      {body && (
        <p className="max-w-[300px] text-[15px] leading-snug text-[var(--nourish-subtext)]">
          {body}
        </p>
      )}
      {caption && (
        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[var(--nourish-subtext-faint)]">
          <Lock size={12} strokeWidth={2.2} aria-hidden />
          {caption}
        </p>
      )}
    </div>
  );
}
