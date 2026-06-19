"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Reel } from "@/types/content";
import { BookmarkButton } from "./bookmark-button";
import { SectionHeader } from "./section-header";

interface Props {
  reels: Reel[];
  onSelect: (reel: Reel) => void;
  onSeeAll?: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Horizontal reel preview rail. The food image stays clean; title and creator
 * live below the media instead of covering it.
 */
export function ReelsRail({ reels, onSelect, onSeeAll }: Props) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  if (reels.length === 0) return null;

  return (
    <section aria-label="Cooking reels" className="space-y-2">
      <SectionHeader
        eyebrow="Reels"
        title="Watch"
        action={onSeeAll ? { label: "See all", onClick: onSeeAll } : undefined}
      />

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {reels.map((reel) => (
          <motion.div
            key={reel.id}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
            className="w-[158px] shrink-0 snap-start"
          >
            <div className="relative aspect-[9/13] overflow-hidden rounded-[var(--radius-lg)] bg-neutral-100">
              <button
                type="button"
                onClick={() => onSelect(reel)}
                className="group block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--nourish-green)]/40"
                aria-label={`Open reel: ${reel.title}`}
              >
                <Image
                  src={reel.posterImageUrl}
                  alt={reel.title}
                  fill
                  sizes="158px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[var(--nourish-dark)] transition-transform duration-300 group-hover:scale-105">
                    <Play size={20} className="ml-0.5" />
                  </span>
                </span>
              </button>
              <div className="absolute right-2 top-2 z-10">
                <BookmarkButton
                  kind="reels"
                  id={reel.id}
                  label={reel.title}
                  variant="overlay"
                />
              </div>
              <div className="absolute left-2 top-2 inline-flex items-center rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white">
                {formatDuration(reel.durationSeconds)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelect(reel)}
              className="mt-2 block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
            >
              <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-[var(--nourish-dark)]">
                {reel.title}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[var(--nourish-subtext)]">
                {reel.creatorHandle}
              </p>
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
