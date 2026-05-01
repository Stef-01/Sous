"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Pause, Play, Send, X } from "lucide-react";
import { useReelEngagement } from "@/lib/hooks/use-reel-engagement";
import { useContentBookmarks } from "@/lib/hooks/use-content-bookmarks";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Reel } from "@/types/content";

interface Props {
  reel: Reel | null;
  onClose: () => void;
}

/**
 * ReelPlayerSheet — full-frame vertical sheet that simulates a TikTok-style
 * player. There is no real video — playback state is local to the sheet
 * and the poster image is the only visible frame. Honest, demoable,
 * Stage-3 appropriate.
 */
export function ReelPlayerSheet({ reel, onClose }: Props) {
  const router = useRouter();
  const { isLiked, toggleLike, markOpened } = useReelEngagement();
  const { isBookmarked, toggle: toggleBookmark } = useContentBookmarks();

  useEffect(() => {
    if (!reel) return;
    markOpened(reel.id);
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [reel, markOpened, onClose]);

  const liked = reel ? isLiked(reel.id) : false;
  const saved = reel ? isBookmarked("reels", reel.id) : false;

  return (
    <AnimatePresence>
      {reel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-stretch justify-center bg-black/85 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Playing reel: ${reel.title}`}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={reel.posterImageUrl}
              alt={reel.title}
              fill
              sizes="(max-width: 480px) 100vw, 420px"
              className="object-cover opacity-90"
              priority
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/85" />

            <button
              type="button"
              onClick={onClose}
              className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/65"
              aria-label="Close reel"
            >
              <X size={18} />
            </button>

            <div className="absolute inset-x-0 top-0 h-1 bg-white/15">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: reel.durationSeconds, ease: "linear" }}
                className="h-full origin-left bg-white"
              />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.85 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 340 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md"
              >
                <Play size={26} className="ml-0.5" />
              </motion.span>
            </div>

            <aside className="absolute bottom-24 right-3 flex flex-col items-center gap-4">
              <ActionPill
                onClick={() => toggleLike(reel.id)}
                label={liked ? "Unlike" : "Like"}
                count={reel.likes + (liked ? 1 : 0)}
                active={liked}
                activeColor="text-rose-400"
              >
                <Heart
                  size={20}
                  className={cn(liked && "fill-current text-rose-400")}
                />
              </ActionPill>

              <ActionPill
                onClick={() => toggleBookmark("reels", reel.id)}
                label={saved ? "Remove save" : "Save"}
                active={saved}
              >
                {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </ActionPill>

              <ActionPill
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator
                      .share({ title: reel.title, text: reel.caption })
                      .catch(() => {});
                  }
                }}
                label="Share"
              >
                <Send size={20} />
              </ActionPill>

              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
                <Pause size={18} />
              </span>
            </aside>

            <div className="relative mt-auto space-y-2 p-5 text-white">
              <p className="font-semibold drop-shadow-sm">
                {reel.creatorHandle}
              </p>
              <p className="text-sm leading-snug text-white/90">
                {reel.caption}
              </p>
              {reel.dishSlug && (
                <button
                  type="button"
                  onClick={() => router.push(`/cook/${reel.dishSlug}`)}
                  className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/25"
                >
                  Cook this →
                </button>
              )}
              <p className="pt-1 text-[10px] text-white/55">
                Sample reel · simulated playback for prototype
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ActionPill({
  children,
  label,
  count,
  active,
  activeColor,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  activeColor?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex flex-col items-center gap-0.5 text-[10px] font-medium text-white",
        "transition-transform active:scale-95",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors",
          active && (activeColor ?? "text-white"),
        )}
      >
        {children}
      </span>
      {typeof count === "number" && count > 0 && (
        <span className="text-[10px] text-white/85">
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </button>
  );
}
