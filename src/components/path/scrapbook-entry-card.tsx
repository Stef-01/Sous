"use client";

import { motion } from "framer-motion";
import {
  Star,
  Heart,
  RotateCcw,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

interface ScrapbookEntryCardProps {
  session: CookSessionRecord;
  onReplay: (slug: string) => void;
  onToggleFavorite: (sessionId: string) => void;
  index?: number;
  /** Placeholder evaluator scores (1–5) until rubric is persisted on sessions. */
  evaluatorScores: { plating: number; technique: number };
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

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-[9px] font-medium text-[var(--nourish-subtext)]">
        <span>{label}</span>
        <span className="tabular-nums text-[var(--nourish-dark)]">
          {value}/5
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--nourish-green)] to-emerald-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Scrapbook entry — polaroid-style memory with dual-use evaluator strip
 * (plating + technique) for wonder and longitudinal improvement.
 */
export function ScrapbookEntryCard({
  session,
  onReplay,
  onToggleFavorite,
  index = 0,
  evaluatorScores,
}: ScrapbookEntryCardProps) {
  const completedDate = session.completedAt
    ? formatRelativeDate(session.completedAt)
    : "In progress";

  const rotation = index % 2 === 0 ? "-0.6deg" : "0.5deg";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      className="rounded-2xl border border-[#e8e4dc] bg-[#fffdf8] p-3 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-serif text-sm font-semibold leading-tight text-[var(--nourish-dark)]">
            {session.dishName}
          </h4>
          {session.mainDishInput && (
            <p className="text-[10px] text-[var(--nourish-subtext)]">
              Paired with {session.mainDishInput}
            </p>
          )}
          <p className="mt-0.5 text-[10px] text-[var(--nourish-subtext)]">
            {(session.cuisineFamily && session.cuisineFamily !== "unknown"
              ? `${session.cuisineFamily} · `
              : "") + completedDate}
          </p>
        </div>
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
          <Heart size={15} className={session.favorite ? "fill-current" : ""} />
        </button>
      </div>

      {/* Polaroid frame + plate snapshot (placeholder or photo) */}
      <div
        className="relative mx-auto mt-3 max-w-[240px]"
        style={{ transform: `rotate(${rotation})` }}
      >
        <div className="rounded-lg bg-white p-2 pb-6 shadow-[0_10px_28px_rgba(40,35,30,0.12)] ring-1 ring-neutral-200/80">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-[linear-gradient(145deg,#f4e8dc,#e8d5c4)]">
            {session.photoUri ? (
              // eslint-disable-next-line @next/next/no-img-element -- user data URIs / arbitrary URLs from device
              <img
                src={session.photoUri}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
                <UtensilsCrossed
                  size={28}
                  className="text-[#6b5a4a]"
                  aria-hidden
                />
                <span className="px-3 text-[10px] font-medium text-[#6b5a4a]">
                  Plate snapshot placeholder — evaluator will score your next
                  hero shot here.
                </span>
              </div>
            )}
            <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-amber-800 shadow-sm ring-1 ring-amber-100">
              <Sparkles className="h-3 w-3" aria-hidden />
              Yearbook frame
            </div>
          </div>
        </div>
      </div>

      {/* Dual-use evaluator strip (plating + technique) */}
      <div className="mt-3 space-y-2 rounded-xl border border-dashed border-[var(--nourish-green)]/25 bg-white/80 px-3 py-2.5">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--nourish-green)]">
          Meal evaluator · preview rubric
        </p>
        <ScoreBar
          label="Plating & composition"
          value={evaluatorScores.plating}
        />
        <ScoreBar
          label="Technique & timing"
          value={evaluatorScores.technique}
        />
        <p className="text-[9px] leading-snug text-[var(--nourish-subtext)]">
          Same archive powers coach feedback and your “before → after” wall — so
          you can see the curve, not just the calories.
        </p>
      </div>

      {session.rating && session.rating > 0 && (
        <div className="mt-2 flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={12}
              className={cn(
                star <= session.rating!
                  ? "fill-[var(--nourish-gold)] text-[var(--nourish-gold)]"
                  : "text-neutral-200",
              )}
            />
          ))}
        </div>
      )}

      {session.note && (
        <p className="mt-2 text-[11px] italic leading-snug text-[var(--nourish-subtext)] line-clamp-2">
          &ldquo;{session.note}&rdquo;
        </p>
      )}

      <button
        onClick={() => onReplay(session.recipeSlug)}
        className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[var(--nourish-green)] transition hover:underline active:scale-95"
        type="button"
      >
        <RotateCcw size={11} />
        Cook again
      </button>
    </motion.article>
  );
}
