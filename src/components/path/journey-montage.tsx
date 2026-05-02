"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { CookSessionRecord } from "@/lib/hooks/use-cook-sessions";
import { getDishEmoji } from "@/lib/utils/dish-emoji";
import { cn } from "@/lib/utils/cn";

interface JourneyMontageProps {
  completedSessions: CookSessionRecord[];
  /** Max entries displayed in the strip. Defaults to 10. */
  limit?: number;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Gradient fallback when a session has no photo  -  cream + cuisine-tinted.
 * Deterministic per-session via a cheap hash so tiles stay visually stable
 * across renders.
 */
function hashToHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

/**
 * Journey Montage  -  the last N cooks as a polaroid-style ribbon.
 *
 * Each card shows the dish's photo (or a warm gradient fallback with the
 * cuisine emoji), the name, and the cook date. A subtle, deterministic
 * rotation on each card gives the strip a scrapbook feel without chaos.
 *
 * Hidden when there are zero completed cooks  -  an empty ribbon is a
 * chore in disguise.
 */
export function JourneyMontage({
  completedSessions,
  limit = 10,
}: JourneyMontageProps) {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const latest = completedSessions
    .filter((s) => !!s.completedAt)
    .slice(0, limit);

  if (latest.length === 0) return null;

  return (
    <section
      aria-label="Recent cooks"
      className="relative mx-auto w-full max-w-md"
    >
      <div className="mb-2 flex items-end justify-between px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--nourish-green)]/80">
          Your cooks so far
        </p>
        <Link
          href="/path/scrapbook"
          className="text-[12px] font-medium text-[var(--nourish-subtext)] underline-offset-2 hover:text-[var(--nourish-dark)] hover:underline"
        >
          See scrapbook
        </Link>
      </div>

      <div
        role="list"
        className="scroll-contain scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2"
      >
        {latest.map((session, idx) => {
          const emoji = getDishEmoji([], session.cuisineFamily ?? "");
          const hue = hashToHue(session.sessionId);
          const rotation =
            ((hashToHue(session.sessionId + "tilt") % 5) - 2) * 0.9;
          return (
            <motion.div
              key={session.sessionId}
              role="listitem"
              initial={{ opacity: 0, y: 8, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: rotation }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 28,
                delay: 0.04 * idx,
              }}
              className="shrink-0"
            >
              <Link
                href="/path/scrapbook"
                className={cn(
                  "block rounded-lg bg-white p-1.5 transition-shadow",
                  "shadow-[0_2px_10px_rgba(15,20,28,0.08)] hover:shadow-[0_6px_18px_rgba(15,20,28,0.14)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40",
                )}
                aria-label={`${session.dishName}  -  cooked ${formatShortDate(session.completedAt!)}`}
              >
                <div className="relative h-[84px] w-[84px] overflow-hidden rounded-md">
                  {session.photoUri ? (
                    <Image
                      src={session.photoUri}
                      alt={session.dishName}
                      fill
                      sizes="84px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-3xl"
                      style={{
                        background: `linear-gradient(135deg, hsl(${hue} 45% 92%) 0%, hsl(${(hue + 30) % 360} 40% 86%) 100%)`,
                      }}
                      aria-hidden
                    >
                      {emoji}
                    </div>
                  )}
                </div>
                <div className="mt-1.5 w-[84px] px-0.5">
                  <p className="truncate text-[11px] font-medium leading-tight text-[var(--nourish-dark)]">
                    {session.dishName}
                  </p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-[var(--nourish-subtext)]">
                    {formatShortDate(session.completedAt!)}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
