"use client";
// v2
import { motion, useReducedMotion } from "framer-motion";
import { Trophy, CircleHelp, Award } from "lucide-react";
import { LevelRing } from "./level-ring";

interface PathHeaderProps {
  totalXP: number;
  level: number;
  skillsCompleted: number;
  /** Re-open the Path orientation tutorial (2-minute click-through). */
  onReplayTutorial?: () => void;
  /** Total achievements unlocked  -  rendered as an inline chip when defined. */
  badgesUnlocked?: number;
  /** Total achievements available. */
  badgesTotal?: number;
  /** Open the achievements grid modal. If undefined, no badges chip renders. */
  onOpenBadges?: () => void;
}

/** XP thresholds per level */
const XP_PER_LEVEL = 100;

/**
 * Path Header  -  gamified stats bar at the top of the skill tree.
 * Duolingo-inspired: big level badge, animated gradient XP bar, streak flame.
 */
export function PathHeader({
  totalXP,
  level,
  skillsCompleted,
  onReplayTutorial,
  badgesUnlocked,
  badgesTotal,
  onOpenBadges,
}: PathHeaderProps) {
  const reducedMotion = useReducedMotion();
  const showBadges =
    typeof onOpenBadges === "function" &&
    typeof badgesUnlocked === "number" &&
    typeof badgesTotal === "number" &&
    badgesTotal > 0;
  const xpInCurrentLevel = totalXP % XP_PER_LEVEL;
  const xpNeeded = XP_PER_LEVEL;

  return (
    <header className="app-header page-x pt-3 pb-2.5">
      <div className="mx-auto max-w-md space-y-2">
        {/* Row 1  -  title + compact stats. Stats cluster is a single pill-row
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
                className="-my-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--nourish-subtext)] transition hover:bg-neutral-100 hover:text-[var(--nourish-green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
                aria-label="Replay Path intro"
              >
                <CircleHelp size={16} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            {/* Streak is NOT echoed here — it lives once, in the "Your journey"
                card below. (rule 13: one source per signal.) */}

            {/* Trophy count only appears once at least one skill is earned —
                a bare "0" reads as failure on a brand-new account.
                (corpus: content-priority, whitespace-balance, empty-states) */}
            {skillsCompleted > 0 && (
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
            )}

            {showBadges && (
              <motion.button
                type="button"
                whileTap={reducedMotion ? undefined : { scale: 0.94 }}
                onClick={onOpenBadges}
                className="flex items-center gap-1 rounded-full border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 px-2 py-0.5 leading-none text-amber-950 shadow-sm ring-1 ring-amber-100/60 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label={`View badges (${badgesUnlocked} of ${badgesTotal} unlocked)`}
                aria-haspopup="dialog"
              >
                <Award
                  size={12}
                  className="text-amber-600"
                  strokeWidth={2.4}
                  aria-hidden
                />
                <span className="text-[12px] font-bold tabular-nums">
                  {badgesUnlocked}
                  <span className="text-amber-700/70">/{badgesTotal}</span>
                </span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Row 2  -  bespoke level ring (custom SVG) + XP label. The ring's arc
            carries the XP progress, so the old flat bar + separate badge
            collapse into one crafted element. */}
        <div className="flex items-center gap-3">
          <LevelRing level={level} progress={xpInCurrentLevel / xpNeeded} />
          <div className="flex flex-col gap-0.5">
            <span className="sous-label text-[var(--nourish-green)]">
              Level {level}
            </span>
            <span className="text-[12px] text-[var(--nourish-subtext)] tabular-nums">
              {xpInCurrentLevel}
              <span className="opacity-60"> / {xpNeeded} XP</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
