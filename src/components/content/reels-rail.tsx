"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Reel } from "@/types/content";
import { BookmarkButton } from "./bookmark-button";
import { SectionKicker } from "@/components/shared/section-kicker";

interface Props {
  reels: Reel[];
  onSelect: (reel: Reel) => void;
  onSeeAll?: () => void;
}

function formatLikes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * ReelsRail — horizontal-scroll TikTok-style portrait cards. Tap opens
 * the simulated reel player sheet. Posters are existing food images;
 * playback is mocked, so we never claim a video file we don't have.
 */
export function ReelsRail({ reels, onSelect, onSeeAll }: Props) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  if (reels.length === 0) return null;

  return (
    <section aria-label="Cooking reels" className="space-y-2">
      <div className="flex items-baseline justify-between px-1">
        <SectionKicker>Reels worth watching</SectionKicker>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-[11px] font-semibold text-[var(--nourish-green)] hover:underline"
          >
            See all
          </button>
        )}
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="relative aspect-[9/16] w-[160px] shrink-0 snap-start"
          >
            {/* Bookmark must NOT nest inside the card button — render as
                an absolutely-positioned sibling on top of the card. */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 360, damping: 24 }}
              onClick={() => onSelect(reel)}
              className="group relative block h-full w-full overflow-hidden rounded-2xl bg-neutral-900 text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
              aria-label={`Open reel: ${reel.title}`}
            >
              <Image
                src={reel.posterImageUrl}
                alt={reel.title}
                fill
                sizes="160px"
                className="object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/30" />
              <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                <span aria-hidden>•</span>
                {formatDuration(reel.durationSeconds)}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-[var(--nourish-dark)] shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Play size={20} className="ml-0.5" />
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 space-y-1 p-2.5 text-white">
                <p className="text-[12px] font-semibold leading-tight line-clamp-2 drop-shadow-sm">
                  {reel.title}
                </p>
                <p className="flex items-center justify-between text-[10px] text-white/85">
                  <span className="truncate">{reel.creatorHandle}</span>
                  <span>♥ {formatLikes(reel.likes)}</span>
                </p>
              </div>
            </motion.button>
            <div className="absolute right-2 top-2 z-10">
              <BookmarkButton
                kind="reels"
                id={reel.id}
                label={reel.title}
                variant="overlay"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
