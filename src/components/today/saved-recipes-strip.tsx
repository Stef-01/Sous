"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useSavedDishes } from "@/lib/hooks/use-saved-dishes";
import { useRecipeDrafts } from "@/lib/recipe-authoring/use-recipe-drafts";
import { userRecipeToQuestDish } from "@/lib/cook/user-recipe-quest";
import {
  buildEatOutQuestDishes,
  buildQuestDishes,
  questDishSelectionHref,
} from "./quest-pool";
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
  const { drafts } = useRecipeDrafts();

  const dishes = useMemo<QuestDish[]>(() => {
    if (saved.length === 0) return [];
    // Every saveable queue source must resolve here; otherwise the Save action
    // succeeds but the item silently vanishes from the user's library.
    const all = [
      ...buildQuestDishes(),
      ...buildEatOutQuestDishes(),
      ...drafts.map(userRecipeToQuestDish),
    ];
    const bySlug = new Map(all.map((d) => [d.slug, d]));
    // Preserve saved order (newest first); keep only resolvable dishes.
    return saved
      .map((s) => bySlug.get(s.slug))
      .filter((d): d is QuestDish => Boolean(d));
  }, [saved, drafts]);

  if (dishes.length === 0) return null;

  return (
    <section className="space-y-2" aria-labelledby="saved-meals-title">
      <h2
        id="saved-meals-title"
        className="sous-label flex items-center gap-1.5 px-1"
      >
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
            onClick={() => router.push(questDishSelectionHref(dish))}
            aria-label={`Open saved ${dish.dishName}`}
            className="w-[9rem] shrink-0 snap-start overflow-hidden rounded-[var(--radius-md)] border border-[var(--nourish-border)] bg-white text-left transition-colors hover:border-[var(--nourish-border-strong)] active:bg-black/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--nourish-green)]"
          >
            <div className="relative aspect-[4/3] w-full">
              <DishImage dish={dish} fit="cover" />
            </div>
            <div className="space-y-0.5 px-2.5 py-2">
              <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-[var(--nourish-dark)]">
                {dish.dishName}
              </p>
              {dish.eatOut ? (
                <p className="truncate text-[10px] font-medium text-[var(--nourish-subtext)]">
                  {dish.eatOut.venueName}
                </p>
              ) : dish.cookTimeMinutes > 0 ? (
                <p className="text-[10px] font-medium text-[var(--nourish-subtext)]">
                  {dish.cookTimeMinutes >= 60
                    ? `${Math.floor(dish.cookTimeMinutes / 60)} hr ${dish.cookTimeMinutes % 60 ? `${dish.cookTimeMinutes % 60} min` : ""}`.trim()
                    : `${dish.cookTimeMinutes} min`}
                </p>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
