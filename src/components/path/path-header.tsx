"use client";
// v2
import { motion } from "framer-motion";
import { Star, Trophy, ChevronRight, CircleHelp } from "lucide-react";

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
    <header className="border-b border-neutral-100/80 bg-white px-4 pt-4 pb-3">
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
                className="text-base leading-none"
              >
                🔥
              </motion.span>
              <span className="text-sm font-bold text-[var(--nourish-dark)] tabular-nums">
                {streak}
              </span>
            </motion.div>

            {/* Skills completed */}
            <div className="flex items-center gap-1">
              <Trophy size={15} className="text-amber-400" />
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
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              boxShadow: "0 2px 8px rgba(34, 197, 94, 0.35)",
            }}
          >
            <span className="text-white font-bold text-sm leading-none">
              {level}
            </span>
            <Star
              size={9}
              className="absolute -top-0.5 -right-0.5 text-amber-300 fill-amber-300"
            />
          </motion.div>

          {/* XP bar */}
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[var(--nourish-green)] uppercase tracking-wider">
                Level {level}
              </span>
              <span className="text-[10px] text-[var(--nourish-subtext)] tabular-nums">
                {totalXP} XP
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-neutral-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(90deg, #22c55e 0%, #4ade80 60%, #86efac 100%)",
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
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
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
