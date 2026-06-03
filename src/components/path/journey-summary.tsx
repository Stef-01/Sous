"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Flame } from "lucide-react";
import type {
  CookStats,
  CookSessionRecord,
} from "@/lib/hooks/use-cook-sessions";
import { getDishEmoji } from "@/lib/utils/dish-emoji";

interface JourneySummaryProps {
  stats: CookStats;
  /** Recent cooks, folded in as a compact thumbnail strip (was its own card). */
  recentSessions?: CookSessionRecord[];
}

interface StatBlockProps {
  value: number | string;
  label: string;
  icon?: React.ReactNode;
  delay?: number;
  highlight?: boolean;
}

function StatBlock({
  value,
  label,
  icon,
  delay = 0,
  highlight = false,
}: StatBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex-1 text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 18,
          delay: delay + 0.1,
        }}
        className={`flex items-center justify-center gap-1 text-2xl font-bold tabular-nums ${
          value === 0 && !highlight
            ? // Mute a still-zero stat so it recedes behind live numbers rather
              // than reading as failure on a new account. (corpus: empty-states,
              // visual-hierarchy)
              "text-[var(--nourish-dark)]/30"
            : highlight
              ? "text-[var(--nourish-green)]"
              : "text-[var(--nourish-dark)]"
        }`}
      >
        {value}
        {icon}
      </motion.div>
      <div className="text-[11px] text-[var(--nourish-subtext)] uppercase tracking-wide mt-0.5">
        {label}
      </div>
    </motion.div>
  );
}

/** Deterministic warm gradient per session, for the no-photo fallback. */
function hashToHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

/**
 * Journey summary  -  one card for "how far you've come": the stats row plus a
 * compact ribbon of recent cooks (merged from the old standalone montage, so
 * Path carries one look-back surface, not two). Tapping a cook opens the
 * scrapbook.
 */
export const JourneySummary = memo(function JourneySummary({
  stats,
  recentSessions = [],
}: JourneySummaryProps) {
  const reducedMotion = useReducedMotion();
  const recent = recentSessions.filter((s) => !!s.completedAt).slice(0, 8);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
      className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="font-serif text-base text-[var(--nourish-dark)]">
            Your journey
          </h2>
          {stats.completedCooks >= 10 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 12,
                delay: 0.5,
              }}
            >
              <Star
                size={15}
                className="text-[var(--nourish-gold)] fill-[var(--nourish-gold)]"
              />
            </motion.span>
          )}
        </div>
        {recent.length > 0 && (
          <Link
            href="/path/scrapbook"
            className="text-[12px] font-medium text-[var(--nourish-subtext)] underline-offset-2 hover:text-[var(--nourish-dark)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
          >
            See scrapbook
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        <StatBlock
          value={stats.completedCooks}
          label="Dishes made"
          delay={0.05}
          highlight={stats.completedCooks >= 10}
        />

        <div className="h-10 w-px bg-neutral-100" />

        <StatBlock
          value={stats.currentStreak}
          icon={
            <Flame
              size={18}
              className="text-[var(--nourish-warm)]"
              strokeWidth={2.2}
            />
          }
          label="Day streak"
          delay={0.1}
          highlight={stats.currentStreak >= 3}
        />

        <div className="h-10 w-px bg-neutral-100" />

        <StatBlock
          value={(stats.cuisinesCovered ?? []).length}
          label="Cuisines"
          delay={0.15}
        />
      </div>

      {/* Recent cooks  -  compact thumbnail strip (no names/dates; those live
          in the scrapbook). Photo, or a deterministic warm gradient + emoji. */}
      {recent.length > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 scrollbar-hide">
          {recent.map((session) => {
            const emoji = getDishEmoji([], session.cuisineFamily ?? "");
            const hue = hashToHue(session.sessionId);
            return (
              <Link
                key={session.sessionId}
                href="/path/scrapbook"
                aria-label={session.dishName}
                className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40 rounded-lg"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-[var(--nourish-border)]">
                  {session.photoUri ? (
                    <Image
                      src={session.photoUri}
                      alt={session.dishName}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-lg"
                      style={{
                        background: `linear-gradient(135deg, hsl(${hue} 45% 92%) 0%, hsl(${(hue + 30) % 360} 40% 86%) 100%)`,
                      }}
                      aria-hidden
                    >
                      {emoji}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </motion.div>
  );
});
