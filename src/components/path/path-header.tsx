"use client";
// v2
import { motion } from "framer-motion";
import { Star, Trophy, ChevronRight, CircleHelp, Flame } from "lucide-react";

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
    <header className="app-header px-4 py-3">
      <div className="mx-auto max-w-md space-y-3">
        {/* Top row: title + stats */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
              Your Path
            </h1>
            {onReplayTutorial && (
              <button
                type="button"
                onClick={onReplayTutorial}
                className="shrink-0 rounded-full p-1 text-[var(--nourish-subtext)] transition hover:bg-neutral-100 hover:text-[var(--nourish-green)]"
                aria-label="Replay Path intro"
              >
                <CircleHelp size={18} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {/* Streak */}
            <motion.div
              className="flex items-center gap-1"
              whileTap={{ scale: 0.9 }}
            >
              <motion.span
                animate={streak > 0 ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="leading-none"
              >
                <Flame
                  size={16}
                  className="text-[var(--nourish-warm)]"
                  strokeWidth={2.2}
                />
              </motion.span>
              <span className="text-sm font-bold text-[var(--nourish-dark)] tabular-nums">
                {streak}
              </span>
            </motion.div>

            {/* Skills completed */}
            <div className="flex items-center gap-1">
              <Trophy
                size={15}
                className="text-[var(--nourish-gold)]"
                strokeWidth={2.2}
              />
              <span className="text-sm font-bold text-[var(--nourish-dark)] tabular-nums">
                {skillsCompleted}
              </span>
            </div>
          </div>
        </div>

        {/* Level + XP bar row */}
        <div className="flex items-center gap-3">
          {/* Level badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 18,
              delay: 0.1,
            }}
            className="relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--nourish-green) 0%, var(--nourish-dark-green) 100%)",
              boxShadow: "var(--shadow-cta)",
            }}
          >
            <span className="text-white font-bold text-sm leading-none">
              {level}
            </span>
            <Star
              size={9}
              className="absolute -top-0.5 -right-0.5 text-[var(--nourish-gold)] fill-[var(--nourish-gold)]"
            />
          </motion.div>

          {/* XP bar */}
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--nourish-green)] uppercase tracking-[0.12em]">
                Level {level}
              </span>
              <span className="text-[11px] text-[var(--nourish-subtext)] tabular-nums">
                {totalXP} XP
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-neutral-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
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
                {/* Shimmer */}
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
            <div className="flex items-center gap-1 text-[9px] text-[var(--nourish-subtext)]">
              <span>
                {xpInCurrentLevel}/{xpNeeded} XP to level {level + 1}
              </span>
              <ChevronRight size={9} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
