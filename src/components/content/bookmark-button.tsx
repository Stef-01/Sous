"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useContentBookmarks } from "@/lib/hooks/use-content-bookmarks";
import type { SaveableKind } from "@/types/content";

interface Props {
  kind: SaveableKind;
  id: string;
  label: string;
  variant?: "ghost" | "overlay";
  className?: string;
}

/**
 * BookmarkButton — toggleable save icon for any saveable content item.
 * "ghost" sits inline; "overlay" sits over imagery (white tint, drop shadow).
 *
 * W19b delta #9: instead of a single-frame icon swap, the icon now
 * cross-fades + spring-pops on every state change. The inactive state
 * still spring-shrinks on tap. Respects prefers-reduced-motion (falls
 * back to a no-animation swap).
 */
export function BookmarkButton({
  kind,
  id,
  label,
  variant = "ghost",
  className,
}: Props) {
  const { isBookmarked, toggle } = useContentBookmarks();
  const reducedMotion = useReducedMotion();
  const saved = isBookmarked(kind, id);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(kind, id);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from saved` : `Save ${label}`}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
        variant === "ghost" &&
          "bg-white/0 text-[var(--nourish-subtext)] hover:bg-neutral-100",
        variant === "overlay" &&
          "bg-black/35 text-white backdrop-blur-sm hover:bg-black/55",
        saved && variant === "ghost" && "text-[var(--nourish-green)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={saved ? "saved" : "unsaved"}
          initial={
            reducedMotion ? undefined : { scale: 0.6, opacity: 0, rotate: -8 }
          }
          animate={
            reducedMotion
              ? undefined
              : { scale: [1.15, 1], opacity: 1, rotate: 0 }
          }
          exit={
            reducedMotion ? undefined : { scale: 0.6, opacity: 0, rotate: 8 }
          }
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="inline-flex"
        >
          {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
