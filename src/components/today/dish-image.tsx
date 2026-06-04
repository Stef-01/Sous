"use client";

import { useState } from "react";
import Image from "next/image";
import {
  UtensilsCrossed,
  Flame,
  Fish,
  Leaf,
  CookingPot,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { QuestDish } from "./quest-card";

/**
 * Dish hero image with a graceful fallback — extracted verbatim from quest-card
 * so the queue/swipe components (and the card) share one leaf renderer. When a
 * dish has no heroImageUrl (or it fails to load) it shows a cuisine-tinted
 * gradient + icon + name instead. Props-only; holds no quest-card state.
 * (`QuestDish` is imported type-only, so there's no runtime import cycle.)
 */

/** Cuisine-specific gradient backgrounds for cards without images. */
function getCuisineGradient(cuisine: string): string {
  const c = cuisine.toLowerCase();
  const gradients: Record<string, string> = {
    japanese: "linear-gradient(135deg, #c0392b 0%, #e74c3c 30%, #f39c12 100%)",
    korean: "linear-gradient(135deg, #d63031 0%, #e17055 40%, #fdcb6e 100%)",
    thai: "linear-gradient(135deg, #00b894 0%, #55efc4 40%, #ffeaa7 100%)",
    chinese: "linear-gradient(135deg, #d63031 0%, #e74c3c 35%, #f9ca24 100%)",
    vietnamese:
      "linear-gradient(135deg, #27ae60 0%, #2ecc71 40%, #f1c40f 100%)",
    filipino: "linear-gradient(135deg, #e17055 0%, #fab1a0 40%, #ffeaa7 100%)",
    indian: "linear-gradient(135deg, #e67e22 0%, #f39c12 35%, #f1c40f 100%)",
    italian: "linear-gradient(135deg, #27ae60 0%, #f1f1f1 50%, #e74c3c 100%)",
    mexican: "linear-gradient(135deg, #00b894 0%, #f1f1f1 50%, #d63031 100%)",
    mediterranean:
      "linear-gradient(135deg, #0984e3 0%, #74b9ff 40%, #ffeaa7 100%)",
  };
  return (
    gradients[c] ??
    "linear-gradient(135deg, #2d5a3d 0%, #4a8c5c 40%, #a8d8b9 100%)"
  );
}

const CUISINE_ICON_MAP: Record<string, LucideIcon> = {
  japanese: Fish,
  korean: Flame,
  thai: Leaf,
  chinese: CookingPot,
  vietnamese: Leaf,
  filipino: CookingPot,
  indian: Flame,
  italian: UtensilsCrossed,
  mexican: Flame,
  mediterranean: Leaf,
};

function CuisineFallbackIcon({ cuisine }: { cuisine: string }) {
  const Icon = CUISINE_ICON_MAP[cuisine.toLowerCase()] ?? UtensilsCrossed;
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
      <Icon size={32} className="text-white" strokeWidth={1.5} />
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

  if (!dish.heroImageUrl || imgError) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        style={{ background: getCuisineGradient(dish.cuisineFamily) }}
      >
        <CuisineFallbackIcon cuisine={dish.cuisineFamily} />
        <span className="max-w-[18rem] px-8 text-center text-lg font-semibold text-white/90">
          {dish.dishName}
        </span>
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
    </>
  );
}
