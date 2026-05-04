"use client";

/**
 * RecipeHeroCard — UX-recon patterns #1 (hero card) + #4 (save corner).
 *
 * Reusable card for any surface that lists recipes with a
 * visual-first treatment: bake-sale recipe carousel, /path/recipes
 * featured row, the 'tomorrow's lunch?' chip detail, viral chip
 * preview. Locked aspect ratio (16:10), eyebrow caps (#2),
 * serif title, meta strip with prep/ingredient/spice signals,
 * absolute-positioned save corner that doesn't compete with
 * any other badges.
 *
 * Pure-rendering — no hooks, no effects. Server-component-safe.
 * Reduced-motion safe (no animations).
 *
 * Reuses `IngredientPantryDot` semantics to surface a small
 * pantry-coverage glance — "you have 6 of 8" — when the
 * caller passes the coverage data. When omitted, the strip
 * just shows prep + ingredient count.
 */

import Link from "next/link";
import Image from "next/image";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface RecipeHeroCardProps {
  /** Slug for the underlying recipe — used for the navigation
   *  href. */
  slug: string;
  /** Recipe display title. */
  title: string;
  /** Short eyebrow text — typically `cuisine · mealType`
   *  ('ITALIAN · DINNER'). Caller capitalises to taste; the
   *  component handles the uppercase + tracking visual. */
  eyebrow: string;
  /** Hero image URL (R2 / static seed / data URI). When
   *  null, the card renders a gradient + emoji fallback (see
   *  `fallbackEmoji`). */
  imageUrl: string | null;
  /** Emoji used in the gradient fallback when imageUrl is null. */
  fallbackEmoji?: string;
  /** Prep time in minutes — meta strip first item. */
  prepTimeMinutes: number;
  /** Total ingredient count — meta strip second item. */
  ingredientCount: number;
  /** Optional pantry coverage — when present, replaces the
   *  ingredient count with a "X of Y" coverage signal. */
  pantryCoverage?: { have: number; total: number };
  /** Optional spice level (1-3 chiles). Hidden when undefined. */
  spiceLevel?: 1 | 2 | 3;
  /** Whether this recipe is saved by the user. */
  saved: boolean;
  /** Tap handler for the save toggle. Bubble-stops on the
   *  parent card link. */
  onToggleSave: () => void;
  /** Optional "this is the highlighted card" treatment for
   *  carousels (slightly larger / more saturated). */
  highlighted?: boolean;
  /** Optional href override (defaults to `/cook/<slug>`). */
  href?: string;
  className?: string;
}

export function RecipeHeroCard({
  slug,
  title,
  eyebrow,
  imageUrl,
  fallbackEmoji = "🍽️",
  prepTimeMinutes,
  ingredientCount,
  pantryCoverage,
  spiceLevel,
  saved,
  onToggleSave,
  highlighted = false,
  href,
  className,
}: RecipeHeroCardProps) {
  const navigateHref = href ?? `/cook/${slug}`;
  const coverageText = pantryCoverage
    ? `${pantryCoverage.have} of ${pantryCoverage.total}`
    : `${ingredientCount} ingredient${ingredientCount === 1 ? "" : "s"}`;
  const spiceText = spiceLevel ? "🌶".repeat(spiceLevel) : null;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--nourish-border-soft)] bg-white shadow-sm transition-shadow",
        "focus-within:ring-2 focus-within:ring-[var(--nourish-green)]/30",
        highlighted &&
          "shadow-[var(--shadow-raised)] border-[var(--nourish-border-strong)]",
        className,
      )}
    >
      <Link href={navigateHref} className="block" aria-label={`Open ${title}`}>
        {/* Hero image — locked 16:10 aspect ratio (pattern #1) */}
        <div
          className="relative w-full bg-gradient-to-br from-[var(--nourish-cream)] to-[var(--nourish-input-bg)]"
          style={{ aspectRatio: "16 / 10" }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-5xl"
              aria-hidden
            >
              {fallbackEmoji}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="space-y-1.5 p-3">
          {/* Eyebrow caps (pattern #2) */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-subtext)]">
            {eyebrow}
          </p>
          {/* Title — serif headline */}
          <h3 className="line-clamp-2 font-serif text-base font-semibold leading-snug text-[var(--nourish-dark)]">
            {title}
          </h3>
          {/* Meta strip (pattern #3) */}
          <p className="flex items-center gap-1.5 text-xs text-[var(--nourish-subtext)]">
            <span>{prepTimeMinutes} min</span>
            <span aria-hidden>·</span>
            <span>{coverageText}</span>
            {spiceText && (
              <>
                <span aria-hidden>·</span>
                <span aria-label={`Spice level ${spiceLevel}`}>
                  {spiceText}
                </span>
              </>
            )}
          </p>
        </div>
      </Link>

      {/* Save corner — pattern #4. Absolute-positioned + not
          inside the link element, so the tap target is fully
          its own affordance. */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave();
        }}
        aria-label={saved ? `Unsave ${title}` : `Save ${title}`}
        aria-pressed={saved}
        className={cn(
          "absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-colors",
          "hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
          saved
            ? "text-[var(--nourish-green)]"
            : "text-[var(--nourish-subtext)]",
        )}
      >
        {saved ? (
          <BookmarkCheck size={16} aria-hidden />
        ) : (
          <Bookmark size={16} aria-hidden />
        )}
      </button>
    </article>
  );
}
