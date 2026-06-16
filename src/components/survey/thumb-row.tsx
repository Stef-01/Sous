"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FoodGlyph, isFoodGlyphName } from "@/components/icons/food-glyphs";
import type { SurveyThumbRow } from "@/types/survey";

/**
 * ThumbRows — a label + 👍/👎 toggle pair per row (planning.md §6.2 W1). Three
 * states: like / dislike / unset (tapping the active verdict clears it). Like
 * = positive preference seed, dislike = negative seed. Hairline dividers.
 */
export function ThumbRows({
  rows,
  value,
  onChange,
}: {
  rows: SurveyThumbRow[];
  value: Record<string, "like" | "dislike">;
  onChange: (next: Record<string, "like" | "dislike">) => void;
}) {
  const set = (rowValue: string, verdict: "like" | "dislike") => {
    const next = { ...value };
    if (next[rowValue] === verdict) delete next[rowValue];
    else next[rowValue] = verdict;
    onChange(next);
  };

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--nourish-border-strong)] bg-white">
      {rows.map((row, i) => {
        const verdict = value[row.value];
        return (
          <div
            key={row.value}
            className={cn(
              "flex items-center gap-3 px-3.5 py-3",
              i > 0 && "border-t border-[var(--nourish-border)]",
            )}
          >
            {isFoodGlyphName(row.glyph) && (
              <FoodGlyph
                name={row.glyph}
                size={22}
                className="shrink-0 text-[var(--nourish-green)]"
              />
            )}
            <span className="min-w-0 flex-1 text-[15px] font-medium text-[var(--nourish-dark)]">
              {row.label}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => set(row.value, "dislike")}
                aria-pressed={verdict === "dislike"}
                aria-label={`Dislike ${row.label}`}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                  verdict === "dislike"
                    ? "border-[var(--nourish-evaluate)] bg-[var(--nourish-evaluate)]/10 text-[var(--nourish-evaluate)]"
                    : "border-[var(--nourish-border-strong)] text-[var(--nourish-subtext)] hover:border-[var(--nourish-evaluate)]/40",
                )}
              >
                <ThumbsDown size={16} strokeWidth={2.2} />
              </button>
              <button
                type="button"
                onClick={() => set(row.value, "like")}
                aria-pressed={verdict === "like"}
                aria-label={`Like ${row.label}`}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                  verdict === "like"
                    ? "border-[var(--nourish-green)] bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]"
                    : "border-[var(--nourish-border-strong)] text-[var(--nourish-subtext)] hover:border-[var(--nourish-green)]/40",
                )}
              >
                <ThumbsUp size={16} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
