"use client";

/**
 * ReelCard — a single full-bleed reel "page" inside the immersive
 * vertical feed.
 *
 * TikTok parity:
 *   - Full-bleed poster (Ken-Burns gentle zoom over duration when active).
 *   - Top progress bar (1px, fills linearly while active).
 *   - Top-left close (×) button.
 *   - Bottom-left creator + caption (2-line clamp + "more").
 *   - Right-rail actions (heart, save, share) via ReelActionRail.
 *   - Long-press anywhere to pause; release to resume.
 *   - Optional "Cook this →" deep-link when reel.dishSlug is set.
 *
 * Reduced-motion: the snap-scroll container stays (structural), but
 * Ken-Burns zoom and caption fade are disabled.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useReelEngagement } from "@/lib/hooks/use-reel-engagement";
import { ReelActionRail } from "./reel-action-rail";
import type { Reel } from "@/types/content";

interface Props {
  reel: Reel;
  isActive: boolean;
  onClose: () => void;
}

export function ReelCard({ reel, isActive, onClose }: Props) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { markOpened } = useReelEngagement();
  const [paused, setPaused] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stamp a view exactly once per reel-page mount (when it becomes
  // active and the user actually sees it, not on render).
  const viewedRef = useRef(false);
  useEffect(() => {
    if (!isActive || viewedRef.current) return;
    viewedRef.current = true;
    markOpened(reel.id);
  }, [isActive, reel.id, markOpened]);

  // Reset pause + caption on de-activation so the next time this reel
  // becomes the visible one, it starts fresh. The setState calls are
  // legitimately reactive to a prop transition (TikTok-parity behaviour),
  // not stateful drift; suppressed for the whole effect block.
  /* eslint-disable react-hooks/set-state-in-effect -- reset on de-activation */
  useEffect(() => {
    if (!isActive) {
      setPaused(false);
      setCaptionExpanded(false);
    }
  }, [isActive]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Long-press to pause: 250ms threshold. Cancelled on early release.
  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => setPaused(true), 250);
  };
  const handlePointerUpOrLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPaused(false);
  };

  return (
    <section
      data-reel-id={reel.id}
      className="relative h-[100dvh] w-full snap-start overflow-hidden bg-black"
      aria-label={`Reel: ${reel.title}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUpOrLeave}
      onPointerLeave={handlePointerUpOrLeave}
      onPointerCancel={handlePointerUpOrLeave}
    >
      {/* Poster — Ken-Burns slow zoom while active for life-like motion */}
      <motion.div
        className="absolute inset-0"
        animate={
          isActive && !paused && !reducedMotion ? { scale: 1.06 } : { scale: 1 }
        }
        transition={{
          duration: reel.durationSeconds,
          ease: "linear",
        }}
      >
        <Image
          src={reel.posterImageUrl}
          alt={reel.title}
          fill
          sizes="(max-width: 480px) 100vw, 420px"
          className="object-cover opacity-90"
          priority={isActive}
        />
      </motion.div>

      {/* Gradients top + bottom for legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Top progress bar — 1px, fills over durationSeconds while active */}
      <div className="absolute inset-x-3 top-3 h-[2px] overflow-hidden rounded-full bg-white/15">
        <motion.div
          key={`${reel.id}-${isActive ? "on" : "off"}-${paused ? "p" : "r"}`}
          initial={{ width: "0%" }}
          animate={
            isActive && !paused
              ? { width: "100%" }
              : isActive
                ? { width: undefined }
                : { width: "0%" }
          }
          transition={{
            duration: isActive && !paused ? reel.durationSeconds : 0,
            ease: "linear",
          }}
          className="h-full origin-left bg-white"
        />
      </div>

      {/* Close (×) — top-left, subtle */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close reels"
        className="absolute left-3 top-7 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <X size={18} />
      </button>

      {/* Right-rail actions */}
      {isActive && <ReelActionRail reel={reel} />}

      {/* Bottom-left creator + caption + (optional) cook CTA */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 10 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.85, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="absolute inset-x-0 bottom-0 z-10 space-y-2 px-4 pb-10 text-white"
      >
        <p className="text-[14px] font-bold leading-tight drop-shadow-sm">
          {reel.creatorHandle}
        </p>
        <p
          className={
            captionExpanded
              ? "text-[13px] leading-snug text-white/95"
              : "text-[13px] leading-snug text-white/95 line-clamp-2"
          }
        >
          {reel.caption}
        </p>
        {!captionExpanded && reel.caption.length > 90 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCaptionExpanded(true);
            }}
            className="text-[12px] font-semibold text-white/80 hover:text-white"
          >
            more
          </button>
        )}
        {reel.dishSlug && (
          <Link
            href={`/cook/${reel.dishSlug}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Cook this →
          </Link>
        )}
        <p className="pt-1 text-[10px] text-white/55">
          Sample reel · simulated playback for prototype
        </p>
      </motion.div>

      {/* Pause overlay (small, centered, only while held) */}
      {paused && isActive && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            Paused
          </div>
        </div>
      )}

      {/* Suppress unused router warning when no dishSlug present */}
      <span className="sr-only">{router ? "" : ""}</span>
    </section>
  );
}
