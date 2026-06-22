"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { FoodGlyph } from "@/components/icons/food-glyphs";
import { getDishGlyph } from "@/lib/utils/dish-glyph";
import type { QuestDish } from "./quest-card";
import { recipeCreditShort } from "@/lib/utils/recipe-credit";

/**
 * Dish hero image with a graceful fallback — extracted verbatim from quest-card
 * so the queue/swipe components (and the card) share one leaf renderer. When a
 * dish has no heroImageUrl (or it fails to load) it shows a cuisine-tinted
 * gradient + icon + name instead. Props-only; holds no quest-card state.
 * (`QuestDish` is imported type-only, so there's no runtime import cycle.)
 */

/** Cuisine-specific gradient backgrounds for cards without images. */
const CUISINE_GRADIENTS: Record<string, string> = {
  japanese: "linear-gradient(135deg, #c0392b 0%, #e74c3c 30%, #f39c12 100%)",
  korean: "linear-gradient(135deg, #d63031 0%, #e17055 40%, #fdcb6e 100%)",
  thai: "linear-gradient(135deg, #00b894 0%, #55efc4 40%, #ffeaa7 100%)",
  chinese: "linear-gradient(135deg, #d63031 0%, #e74c3c 35%, #f9ca24 100%)",
  vietnamese: "linear-gradient(135deg, #27ae60 0%, #2ecc71 40%, #f1c40f 100%)",
  filipino: "linear-gradient(135deg, #e17055 0%, #fab1a0 40%, #ffeaa7 100%)",
  indian: "linear-gradient(135deg, #e67e22 0%, #f39c12 35%, #f1c40f 100%)",
  italian: "linear-gradient(135deg, #27ae60 0%, #f1f1f1 50%, #e74c3c 100%)",
  mexican: "linear-gradient(135deg, #00b894 0%, #f1f1f1 50%, #d63031 100%)",
  mediterranean:
    "linear-gradient(135deg, #0984e3 0%, #74b9ff 40%, #ffeaa7 100%)",
  american: "linear-gradient(135deg, #b23b3b 0%, #efe9dd 50%, #2e5a8c 100%)",
};

function getCuisineGradient(cuisine: string): string {
  return (
    CUISINE_GRADIENTS[cuisine.toLowerCase()] ??
    "linear-gradient(135deg, var(--nourish-green) 0%, var(--nourish-light-green) 40%, #a8d8b9 100%)"
  );
}

/** W22b — the dish's dominant accent (the first gradient stop) for tinting
 *  celebration moments. Null when the cuisine has no mapped palette. */
export function cuisineAccent(
  cuisine: string | null | undefined,
): string | null {
  if (!cuisine) return null;
  const g = CUISINE_GRADIENTS[cuisine.toLowerCase()];
  return g?.match(/#[0-9a-fA-F]{6}/)?.[0] ?? null;
}

function CuisineFallbackIcon({
  cuisine,
  tags,
}: {
  cuisine: string;
  tags: string[];
}) {
  // The dish's OWN glyph (type-first, cuisine as fallback) so two image-less
  // dishes in the same cuisine look distinct — not all "pho". Falls to utensils.
  const glyph = getDishGlyph(tags, cuisine) ?? "utensils";
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
      <FoodGlyph
        name={glyph}
        size={32}
        strokeWidth={1.6}
        className="text-white"
      />
    </div>
  );
}

export function DishImage({
  dish,
  priority = false,
  fit = "cover",
}: {
  dish: QuestDish;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  // Subtle partner-chef credit (e.g. "Chef Tu") for attributed recipes.
  const credit = recipeCreditShort(dish.slug);

  if (!dish.heroImageUrl || imgError) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        style={{ background: getCuisineGradient(dish.cuisineFamily) }}
      >
        <CuisineFallbackIcon cuisine={dish.cuisineFamily} tags={dish.tags} />
        <span className="max-w-[18rem] px-8 text-center text-lg font-semibold text-white/90">
          {dish.dishName}
        </span>
        {credit && <ChefCreditChip label={credit} />}
      </div>
    );
  }

  return (
    <>
      {!imgLoaded && <div className="absolute inset-0 shimmer" />}
      <Image
        src={dish.heroImageUrl}
        alt={dish.dishName}
        fill
        sizes="(max-width: 768px) 100vw, 430px"
        className={cn(
          "transition-opacity duration-300",
          fit === "contain" ? "object-contain" : "object-cover",
          imgLoaded ? "opacity-100" : "opacity-0",
        )}
        draggable={false}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgError(true)}
      />
      {credit && <ChefCreditChip label={credit} />}
    </>
  );
}

/** Subtle, light credit chip pinned to the image's bottom-left. */
function ChefCreditChip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-full bg-black/35 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
      {label}
    </span>
  );
}
