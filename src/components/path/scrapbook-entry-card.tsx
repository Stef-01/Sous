"use client";

import { motion } from "framer-motion";
import { Star, Heart, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

interface ScrapbookEntryCardProps {
  session: CookSessionRecord;
  onReplay: (slug: string) => void;
  onToggleFavorite: (sessionId: string) => void;
  index?: number;
}

/**
 * Scrapbook entry card — compact display of a completed cook.
 * Shows dish name, cuisine, date, rating, and actions.
 */
export function ScrapbookEntryCard({
  session,
  onReplay,
  onToggleFavorite,
  index = 0,
}: ScrapbookEntryCardProps) {
  const completedDate = session.completedAt
    ? formatRelativeDate(session.completedAt)
    : "In progress";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="rounded-xl border border-neutral-100 bg-white p-3.5 space-y-2"
    >
      {/* Top row: dish name + cuisine */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-serif text-sm font-semibold text-[var(--nourish-dark)] truncate">
            {session.dishName}
          </h4>
          {session.mainDishInput && (
            <p className="text-[10px] text-[var(--nourish-subtext)] truncate">
              with {session.mainDishInput}
            </p>
          )}
          <p className="text-[10px] text-[var(--nourish-subtext)] uppercase tracking-wide">
            {session.cuisineFamily && session.cuisineFamily !== "unknown"
              ? `${session.cuisineFamily} · `
              : ""}
            {completedDate}
          </p>
        </div>

        {/* Favorite toggle */}
        <button
          onClick={() => onToggleFavorite(session.sessionId)}
          className={cn(
            "shrink-0 rounded-lg p-1.5 transition-all active:scale-90",
            session.favorite
              ? "text-pink-500"
              : "text-neutral-300 hover:text-pink-400",
          )}
          type="button"
          aria-label={
            session.favorite ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Heart size={14} className={session.favorite ? "fill-current" : ""} />
        </button>
      </div>

      {/* Rating stars (if rated) */}
      {session.rating && session.rating > 0 && (
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={11}
              className={cn(
                star <= session.rating!
                  ? "fill-[var(--nourish-gold)] text-[var(--nourish-gold)]"
                  : "text-neutral-200",
              )}
            />
          ))}
        </div>
      )}

      {/* Note preview */}
      {session.note && (
        <p className="text-[11px] text-[var(--nourish-subtext)] line-clamp-2 italic">
          &ldquo;{session.note}&rdquo;
        </p>
      )}

      {/* Replay button */}
      <button
        onClick={() => onReplay(session.recipeSlug)}
        className="flex items-center gap-1 text-[11px] font-medium text-[var(--nourish-green)] hover:underline transition-all active:scale-95"
        type="button"
      >
        <RotateCcw size={11} />
        Cook again
      </button>
    </motion.div>
  );
}

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
