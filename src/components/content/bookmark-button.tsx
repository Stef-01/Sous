"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { motion } from "framer-motion";
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
 */
export function BookmarkButton({
  kind,
  id,
  label,
  variant = "ghost",
  className,
}: Props) {
  const { isBookmarked, toggle } = useContentBookmarks();
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
      {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
    </motion.button>
  );
}
