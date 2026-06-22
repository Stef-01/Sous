"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useSavedDishes } from "@/lib/hooks/use-saved-dishes";
import { buildQuestDishes } from "./quest-pool";
import { DishImage } from "./dish-image";
import type { QuestDish } from "./quest-card";

/**
 * Saved for later — the saved recipes (the deck's heart + the mission bookmark)
 * resurface in the deck but had NO place to browse. This surfaces them as a
 * Today strip so you can re-cook what you bookmarked, newest first. Hidden when
 * nothing is saved (below the fold, like the friends strip).
 */
export function SavedRecipesStrip() {
  const router = useRouter();
  const { saved } = useSavedDishes();

  const dishes = useMemo<QuestDish[]>(() => {
    if (saved.length === 0) return [];
    const bySlug = new Map(buildQuestDishes().map((d) => [d.slug, d]));
    // Preserve saved order (newest first); keep only resolvable catalog dishes.
    return saved
      .map((s) => bySlug.get(s.slug))
      .filter((d): d is QuestDish => Boolean(d));
  }, [saved]);

  if (dishes.length === 0) return null;

  return (
    <section className="mt-7">
      <h2 className="mb-2 flex items-center gap-1.5 px-[var(--gutter)] text-base font-semibold text-[var(--nourish-dark)]">
        <Bookmark
          className="size-4 fill-[var(--nourish-green)] text-[var(--nourish-green)]"
          aria-hidden
        />
        Saved for later
      </h2>
      <div className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {dishes.map((dish) => (
          <button
            key={dish.slug}
            type="button"
            onClick={() => router.push(`/cook/${dish.slug}`)}
            aria-label={`Cook ${dish.dishName}`}
            className="w-[8.5rem] shrink-0 snap-start overflow-hidden rounded-2xl border border-neutral-200/70 bg-white text-left shadow-sm transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--nourish-green)] motion-reduce:active:scale-100"
          >
            <div className="relative h-24 w-full">
              <DishImage dish={dish} fit="cover" />
              {/* Bottom-RIGHT to avoid DishImage's chef-credit chip (bottom-left). */}
              {dish.cookTimeMinutes > 0 && (
                <span className="absolute bottom-1.5 right-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[var(--nourish-dark)] shadow-sm backdrop-blur-sm">
                  {dish.cookTimeMinutes >= 60
                    ? `${Math.floor(dish.cookTimeMinutes / 60)}hr ${dish.cookTimeMinutes % 60 ? `${dish.cookTimeMinutes % 60}m` : ""}`.trim()
                    : `${dish.cookTimeMinutes} min`}
                </span>
              )}
            </div>
            <p className="line-clamp-2 px-2.5 py-2 text-[12px] font-semibold leading-snug text-[var(--nourish-dark)]">
              {dish.dishName}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
