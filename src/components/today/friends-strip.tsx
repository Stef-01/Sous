"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import { FRIEND_COOKS, type FriendCook } from "@/data/friend-cooks";

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 26,
      delay: i * 0.05,
    },
  }),
};

const accentRing: Record<NonNullable<FriendCook["accent"]>, string> = {
  rose: "ring-rose-300/80",
  amber: "ring-amber-300/80",
  green: "ring-[var(--nourish-green)]/70",
  sky: "ring-sky-300/80",
  violet: "ring-violet-300/80",
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function initialFor(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "·";
  return trimmed[0]!.toUpperCase();
}

/**
 * FriendsStrip — second-fold social feed for the Today page.
 *
 * Shows a horizontal-scroll row of meal photos from friends' recent cooks,
 * plus the user's own recent cooks (when present) layered in front. Tap a
 * tile to drop its dish name into the craving search. No likes, no
 * threading — this is a gentle "look what's getting made this week" nudge,
 * not a feed product.
 */
export function FriendsStrip({
  sessions,
  onDishSelect,
}: {
  sessions: CookSessionRecord[];
  onDishSelect?: (dishName: string) => void;
}) {
  const entries = useMemo(() => {
    // User's own completed cooks come first when present. We fall back to
    // the canonical recipe photo (via recipeSlug → /food_images/<slug>.png)
    // when the user did not save a scrapbook shot.
    const mine: FriendCook[] = sessions
      .filter((s) => s.completedAt)
      .slice(0, 4)
      .map((s) => ({
        id: `me-${s.sessionId}`,
        friend: "You",
        initial: "Y",
        dish: s.dishName,
        dishSlug: s.recipeSlug,
        imageUrl:
          s.photoUri ??
          `/food_images/${s.recipeSlug.replace(/-/g, "_")}.png`,
        postedAgo: s.completedAt ? formatTimeAgo(s.completedAt) : "",
        accent: "green",
      }));
    return [...mine, ...FRIEND_COOKS];
  }, [sessions]);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  if (entries.length === 0) return null;

  return (
    <section ref={ref} className="space-y-2" aria-label="Friends' recent cooks">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-[11px] font-bold tracking-[0.12em] text-[var(--nourish-subtext)] uppercase">
          Friends cooked this week
        </h2>
        <span className="text-[10px] text-[var(--nourish-subtext)]/70">
          Swipe &raquo;
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {entries.map((entry, idx) => (
          <motion.button
            key={entry.id}
            type="button"
            custom={idx}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={cardVariants}
            whileTap={{ scale: 0.97 }}
            onClick={() => onDishSelect?.(entry.dish)}
            className="group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm border border-neutral-100/80 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
            style={{ width: 168 }}
            aria-label={`${entry.friend} made ${entry.dish}`}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--nourish-cream)]">
              {entry.imageUrl ? (
                <Image
                  src={entry.imageUrl}
                  alt={entry.dish}
                  fill
                  sizes="168px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">
                  🍽️
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

              {/* Friend avatar + name overlay */}
              <div className="absolute inset-x-2 bottom-2 flex items-center gap-1.5 text-white">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/90 text-[10px] font-bold text-[var(--nourish-dark)] ring-2 ${
                    entry.accent
                      ? accentRing[entry.accent]
                      : "ring-white/40"
                  }`}
                >
                  {entry.initial || initialFor(entry.friend)}
                </div>
                <span className="truncate text-[11px] font-semibold drop-shadow-sm">
                  {entry.friend}
                </span>
                <span className="ml-auto shrink-0 text-[9px] font-medium text-white/80 drop-shadow-sm">
                  {entry.postedAgo}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-0.5 px-2.5 py-2">
              <span className="text-[12px] font-semibold leading-tight text-[var(--nourish-dark)] line-clamp-1">
                {entry.dish}
              </span>
              {entry.note && (
                <span className="line-clamp-2 text-[10px] leading-snug text-[var(--nourish-subtext)]">
                  {entry.note}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
