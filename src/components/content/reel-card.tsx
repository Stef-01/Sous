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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { useReelEngagement } from "@/lib/hooks/use-reel-engagement";
import { ReelActionRail } from "./reel-action-rail";
import type { Reel } from "@/types/content";

interface Props {
  reel: Reel;
  reelInstanceId: string;
  isActive: boolean;
  onClose: () => void;
}

export function ReelCard({ reel, reelInstanceId, isActive, onClose }: Props) {
  const reducedMotion = useReducedMotion();
  const { markOpened } = useReelEngagement();
  const [paused, setPaused] = useState(false);
  const [endHintVisible, setEndHintVisible] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setEndHintVisible(false);
    }
  }, [isActive]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Reels-V3: end-of-reel "Up next" hint. Schedules a single show at
  // (durationSeconds - 1.5s) so the hint appears for the last beat of
  // the reel — invitation to swipe to the next one. The hint stays
  // until the reel either de-activates (next reel comes into view) or
  // the user manually pauses/scrolls. Cleared on de-activation,
  // pause, or unmount so a stale timer can't surface a hint after
  // the reel has gone.

  /* eslint-disable react-hooks/set-state-in-effect -- legitimate: hint visibility is a scheduled UI cue tied to the reel's natural duration */
  useEffect(() => {
    if (endHintTimer.current) {
      clearTimeout(endHintTimer.current);
      endHintTimer.current = null;
    }
    if (!isActive || paused || reducedMotion) {
      setEndHintVisible(false);
      return;
    }
    const showAt = Math.max((reel.durationSeconds - 1.5) * 1000, 0);
    endHintTimer.current = setTimeout(() => {
      setEndHintVisible(true);
    }, showAt);
    return () => {
      if (endHintTimer.current) {
        clearTimeout(endHintTimer.current);
        endHintTimer.current = null;
      }
    };
  }, [isActive, paused, reducedMotion, reel.durationSeconds, reel.id]);
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
      data-reel-id={reelInstanceId}
      data-reel-source-id={reel.id}
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
          className="object-cover"
          priority={isActive}
        />
      </motion.div>

      {/* Gradients top + bottom for legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/35 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

      {/* Top progress bar — 1px, fills over durationSeconds while active */}
      <div
        className="absolute inset-x-3 h-[2px] overflow-hidden rounded-full bg-white/15"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 2.5rem)" }}
      >
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

      {/* Close (×) — only on the active reel so accessibility focus stays quiet. */}
      {isActive && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reels"
          className="absolute left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white ring-1 ring-white/14 transition-colors hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 3.25rem)" }}
        >
          <X size={18} />
        </button>
      )}

      {/* Right-rail actions */}
      {isActive && <ReelActionRail reel={reel} />}

      {/* Bottom-left creator + caption + (optional) cook CTA */}
      {isActive && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="absolute inset-x-0 bottom-0 z-10 space-y-2 px-4 pr-24 text-white"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4rem)",
          }}
        >
          <p className="text-[14px] font-bold leading-tight">
            {reel.creatorHandle}
          </p>
          <p className="line-clamp-2 text-[13px] leading-snug text-white/95">
            {reel.caption}
          </p>
          {reel.dishSlug && (
            <Link
              href={`/cook/${reel.dishSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-neutral-950 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Cook this →
            </Link>
          )}
        </motion.div>
      )}

      {/* Pause overlay (small, centered, only while held) */}
      {paused && isActive && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            Paused
          </div>
        </div>
      )}

      {/* Reels-V3: end-of-reel "Up next" hint. Appears for the last
          ~1.5s of the reel's natural duration as an invitation to
          swipe to the next one. Bouncing chevron + brief copy.
          Pointer-events:none so it doesn't intercept the scroll the
          user is invited to perform. */}
      <AnimatePresence>
        {isActive && endHintVisible && !paused && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute inset-x-0 bottom-[26%] z-10 flex flex-col items-center gap-1 text-white"
          >
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"
            >
              <ChevronDown size={18} />
            </motion.div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
              Swipe up for next
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
