"use client";

/**
 * ReelsFeed — vertical snap-mandatory scroller that hosts the
 * immersive reel pages. The feed itself owns the activeId and passes
 * `isActive` to each card so only the visible reel animates / advances.
 *
 * The active reel is computed via useActiveReel (IntersectionObserver
 * over [data-reel-id] children).
 */

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActiveReel } from "@/lib/hooks/use-active-reel";
import {
  buildInfiniteReelsFeed,
  todaySeed,
} from "@/lib/hooks/use-reels-feed-cursor";
import { ReelCard } from "./reel-card";
import type { Reel } from "@/types/content";

interface Props {
  reels: Reel[];
  /** Optional reel id to scroll to on mount (e.g. when entered from rail tap). */
  initialReelId?: string | null;
}

export function ReelsFeed({ reels, initialReelId }: Props) {
  const router = useRouter();
  const activeId = useActiveReel();
  const containerRef = useRef<HTMLDivElement>(null);

  const ordered = useMemo(
    () => buildInfiniteReelsFeed(reels, todaySeed()),
    [reels],
  );

  // Initial-position scroll: when an initialReelId is provided (deep
  // link from the Content-home rail), jump to it before the snap
  // observer kicks in.
  useEffect(() => {
    if (!initialReelId) return;
    const el = containerRef.current?.querySelector<HTMLElement>(
      `[data-reel-id="${CSS.escape(initialReelId)}"]`,
    );
    if (el) el.scrollIntoView({ block: "start", behavior: "instant" });
  }, [initialReelId]);

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/community");
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[70] h-[100dvh] w-full snap-y snap-mandatory overflow-y-auto overflow-x-hidden bg-black"
      style={{
        scrollSnapStop: "always",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {ordered.map((reel, idx) => (
        <ReelCard
          key={`${reel.id}-${idx}`}
          reel={reel}
          isActive={activeId === reel.id}
          onClose={handleClose}
        />
      ))}
    </div>
  );
}
