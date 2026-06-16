"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FoodGlyph, isFoodGlyphName } from "@/components/icons/food-glyphs";
import type { SurveyOption } from "@/types/survey";

/**
 * PhotoTileGrid — a 2-col tile grid (planning.md §6.2 W1, Family A). Each tile
 * has a label strip ON TOP and the image below; images MUST come from existing
 * food_images (rules 7/11 — no generated dish art), with a cuisine-glyph
 * gradient fallback when an image is absent or fails to load. Single- or
 * multi-select; the value is always a string[] (≤1 entry in single mode).
 */
export function PhotoTileGrid({
  options,
  value,
  multi,
  onChange,
}: {
  options: SurveyOption[];
  value: string[];
  multi?: boolean;
  onChange: (next: string[]) => void;
}) {
  const toggle = (v: string) => {
    if (multi) {
      onChange(
        value.includes(v) ? value.filter((x) => x !== v) : [...value, v],
      );
    } else {
      onChange(value.includes(v) ? [] : [v]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((o) => (
        <Tile
          key={o.value}
          option={o}
          selected={value.includes(o.value)}
          onToggle={() => toggle(o.value)}
        />
      ))}
    </div>
  );
}

function Tile({
  option,
  selected,
  onToggle,
}: {
  option: SurveyOption;
  selected: boolean;
  onToggle: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = option.image && !imgError;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        "overflow-hidden rounded-[var(--radius-sm)] border-2 bg-white text-left transition-colors",
        selected
          ? "border-[var(--nourish-green)]"
          : "border-[var(--nourish-border-strong)] hover:border-[var(--nourish-green)]/40",
      )}
    >
      <div className="flex items-center justify-between gap-1 px-3 py-2">
        <span className="truncate text-[14px] font-medium text-[var(--nourish-dark)]">
          {option.label}
        </span>
        <span
          aria-hidden
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            selected
              ? "border-[var(--nourish-green)] bg-[var(--nourish-green)] text-white"
              : "border-[var(--nourish-border-strong)] text-transparent",
          )}
        >
          <Check size={12} strokeWidth={3} />
        </span>
      </div>
      <div className="relative aspect-[4/3] w-full bg-[var(--nourish-cream)]">
        {showImage ? (
          <Image
            src={option.image as string}
            alt=""
            fill
            sizes="50vw"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--nourish-green)]/[0.07] text-[var(--nourish-green)]">
            {isFoodGlyphName(option.glyph) ? (
              <FoodGlyph name={option.glyph} size={34} />
            ) : (
              <FoodGlyph name="utensils" size={34} />
            )}
          </div>
        )}
      </div>
    </button>
  );
}
