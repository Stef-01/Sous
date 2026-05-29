"use client";

/**
 * ReelActionRail — bottom-aligned vertical column on the right side of
 * each reel. TikTok parity: heart, save, share, optional comment count.
 *
 * Minimalism: icons only. Counts hide when zero. Spring-physics tap
 * feedback + haptic on every action.
 */

import { motion, useReducedMotion } from "framer-motion";
import { Bookmark, BookmarkCheck, Heart, Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { useContentBookmarks } from "@/lib/hooks/use-content-bookmarks";
import { useReelEngagement } from "@/lib/hooks/use-reel-engagement";
import type { Reel } from "@/types/content";

interface Props {
  reel: Reel;
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function ReelActionRail({ reel }: Props) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const haptic = useHaptic();
  const { isLiked, toggleLike } = useReelEngagement();
  const { isBookmarked, toggle: toggleBookmark } = useContentBookmarks();
  const liked = isLiked(reel.id);
  const saved = isBookmarked("reels", reel.id);
  const likeCount = reel.likes + (liked ? 1 : 0);

  return (
    <aside
      className="absolute bottom-28 right-3 z-10 flex flex-col items-center gap-5"
      aria-label="Reel actions"
    >
      <ActionButton
        label={liked ? "Unlike" : "Like"}
        count={likeCount}
        onClick={() => {
          haptic();
          toggleLike(reel.id);
        }}
      >
        <Heart
          size={26}
          className={cn(
            "transition-colors",
            liked ? "fill-rose-500 text-rose-500" : "text-white",
          )}
        />
      </ActionButton>

      <ActionButton
        label={saved ? "Unsave" : "Save"}
        onClick={() => {
          haptic();
          toggleBookmark("reels", reel.id);
        }}
      >
        {saved ? (
          <BookmarkCheck size={24} className="text-white" />
        ) : (
          <Bookmark size={24} className="text-white" />
        )}
      </ActionButton>

      <ActionButton
        label="Share reel"
        onClick={() => {
          haptic();
          if (typeof navigator !== "undefined" && navigator.share) {
            navigator
              .share({ title: reel.title, text: reel.caption })
              .catch(() => {});
          }
        }}
      >
        <Send size={22} className="text-white" />
      </ActionButton>
    </aside>
  );
}

function ActionButton({
  children,
  label,
  count,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 400, damping: 16 }}
      aria-label={label}
      className="flex flex-col items-center gap-0.5"
    >
      <span className="flex h-12 w-12 items-center justify-center">
        {children}
      </span>
      {typeof count === "number" && count > 0 && (
        <span className="text-[11px] font-semibold text-white drop-shadow-sm">
          {compact(count)}
        </span>
      )}
    </motion.button>
  );
}
