"use client";
// v2
import { motion } from "framer-motion";
import { Star, Trophy, CircleHelp, Flame } from "lucide-react";

interface PathHeaderProps {
  streak: number;
  totalXP: number;
  level: number;
  levelProgress: number;
  skillsCompleted: number;
  /** Re-open the Path orientation tutorial (2-minute click-through). */
  onReplayTutorial?: () => void;
}

/** XP thresholds per level */
const XP_PER_LEVEL = 100;

/**
 * Path Header — gamified stats bar at the top of the skill tree.
 * Duolingo-inspired: big level badge, animated gradient XP bar, streak flame.
 */
export function PathHeader({
  streak,
  totalXP,
  level,
  levelProgress,
  skillsCompleted,
  onReplayTutorial,
}: PathHeaderProps) {
  const xpInCurrentLevel = totalXP % XP_PER_LEVEL;
  const xpNeeded = XP_PER_LEVEL;

  return (
    <header className="app-header px-4 pt-3 pb-2.5">
      <div className="mx-auto max-w-md space-y-2">
        {/* Row 1 — title + compact stats. Stats cluster is a single pill-row
            with equal baseline so the two numbers line up even when one is
            double-digit. */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <h1 className="font-serif text-[17px] font-semibold leading-none text-[var(--nourish-dark)]">
              Your Path
            </h1>
            {onReplayTutorial && (
              <button
                type="button"
                onClick={onReplayTutorial}
                className="shrink-0 rounded-full p-1 text-[var(--nourish-subtext)] transition hover:bg-neutral-100 hover:text-[var(--nourish-green)]"
                aria-label="Replay Path intro"
              >
                <CircleHelp size={16} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <motion.div
              className="flex items-center gap-1 leading-none"
              whileTap={{ scale: 0.92 }}
            >
              <motion.span
                animate={streak > 0 ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="leading-none"
              >
                <Flame
                  size={14}
                  className="text-[var(--nourish-warm)]"
                  strokeWidth={2.4}
                />
              </motion.span>
              <span className="text-[13px] font-bold text-[var(--nourish-dark)] tabular-nums">
                {streak}
              </span>
            </motion.div>

            <div className="flex items-center gap-1 leading-none">
              <Trophy
                size={13}
                className="text-[var(--nourish-gold)]"
                strokeWidth={2.4}
              />
              <span className="text-[13px] font-bold text-[var(--nourish-dark)] tabular-nums">
                {skillsCompleted}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2 — level badge + single-line XP bar. Previous layout stacked
            three tiny caption rows; now the bar carries one caption only so
            the level/XP block matches the 36px badge height cleanly. */}
        <div className="flex items-center gap-2.5">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 18,
              delay: 0.1,
            }}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "linear-gradient(135deg, var(--nourish-green) 0%, var(--nourish-dark-green) 100%)",
              boxShadow: "var(--shadow-cta)",
            }}
          >
            <span className="text-[13px] font-bold leading-none text-white">
              {level}
            </span>
            <Star
              size={8}
              className="absolute -top-0.5 -right-0.5 text-[var(--nourish-gold)] fill-[var(--nourish-gold)]"
            />
          </motion.div>

          <div className="flex flex-1 flex-col justify-center gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--nourish-green)]">
                Level {level}
              </span>
              <span className="text-[10px] text-[var(--nourish-subtext)] tabular-nums">
                {xpInCurrentLevel}
                <span className="text-[var(--nourish-subtext)]/60">
                  {" "}
                  / {xpNeeded}{" "}
                </span>
                XP
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <motion.div
                className="relative h-full overflow-hidden rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, var(--nourish-dark-green) 0%, var(--nourish-green) 55%, var(--nourish-light-green) 100%)",
                }}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.max(Math.min((xpInCurrentLevel / xpNeeded) * 100, 100), levelProgress > 0 ? 4 : 0)}%`,
                }}
                transition={{
                  duration: 1,
                  delay: 0.3,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 1.8,
                    delay: 1.1,
                    ease: "linear",
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
