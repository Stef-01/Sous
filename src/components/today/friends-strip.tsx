"use client";

import { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { getDishEmoji } from "@/lib/utils/dish-emoji";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
      delay: i * 0.07,
    },
  }),
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

/**
 * FriendsStrip — shows the user's recent completed cooks as a horizontal
 * scrollable card row. Replaces the earlier mock friend data with real
 * cook session history for honest social proof and replay motivation.
 * Hidden entirely when the user has no completed cooks.
 */
export function FriendsStrip({
  sessions,
  onDishSelect,
}: {
  sessions: CookSessionRecord[];
  onDishSelect?: (dishName: string) => void;
}) {
  const recent = useMemo(
    () => sessions.filter((s) => s.completedAt).slice(0, 8),
    [sessions],
  );

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  if (recent.length === 0) return null;

  return (
    <div ref={ref} className="space-y-2.5">
      <h2 className="text-[10px] font-bold tracking-[0.12em] text-[var(--nourish-subtext)] uppercase px-1">
        Your recent cooks
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {recent.map((session, idx) => (
          <motion.button
            key={session.sessionId}
            type="button"
            custom={idx}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={cardVariants}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDishSelect?.(session.dishName)}
            className="flex flex-col items-center justify-between gap-1.5 rounded-xl bg-white shadow-sm border border-neutral-100/80 p-3 shrink-0 snap-start cursor-pointer transition-shadow hover:shadow-md"
            style={{ width: 136, height: 152 }}
          >
            {/* Emoji */}
            <div className="flex items-center justify-center w-full flex-1">
              <span
                style={{ fontSize: 44, lineHeight: 1 }}
                role="img"
                aria-label={session.dishName}
              >
                {getDishEmoji(
                  [session.cuisineFamily.toLowerCase()],
                  session.cuisineFamily,
                )}
              </span>
            </div>

            {/* Dish name */}
            <span className="text-[11px] font-semibold text-[var(--nourish-dark)] text-center leading-tight line-clamp-2 w-full">
              {session.dishName}
            </span>

            {/* Rating + time */}
            <div className="flex items-center justify-between w-full gap-1">
              <span className="text-[10px] text-[var(--nourish-subtext)] font-medium truncate flex items-center gap-0.5">
                <RotateCcw size={9} />
                Cook again
              </span>
              <span className="text-[9px] text-[var(--nourish-subtext)]/60 shrink-0">
                {session.completedAt ? formatTimeAgo(session.completedAt) : ""}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
