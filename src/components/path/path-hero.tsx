"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PathHeroProps {
  /** Current consecutive-day cook streak. */
  streak: number;
  /** Completed cooks in the current calendar week. */
  cooksThisWeek: number;
  /** Active weekly cook goal. Defaults to 3. */
  weeklyGoal?: number;
  /** Total completed cooks across all time. */
  totalCooks: number;
  /** ISO timestamp of the most recent completed cook. Undefined when the user
   *  has never cooked  -  in that case the "start tonight" copy wins. */
  lastCookedAt?: string;
}

const WELCOME_BACK_THRESHOLD_DAYS = 7;

type TimeBand = "morning" | "afternoon" | "evening";

function resolveTimeBand(date: Date): TimeBand {
  const h = date.getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "afternoon";
  return "evening";
}

/** Calm palettes  -  cream-toned so the rest of the Path UI still reads crisply on top. */
const GRADIENTS: Record<TimeBand, string> = {
  morning:
    "linear-gradient(180deg, #fff4e4 0%, #faeed9 28%, #f7efe1 62%, var(--nourish-cream) 100%)",
  afternoon:
    "linear-gradient(180deg, #f4f5e4 0%, #ecf1d9 30%, #eff2e1 62%, var(--nourish-cream) 100%)",
  evening:
    "linear-gradient(180deg, #ebe6f2 0%, #e3e7ec 30%, #ebedee 62%, var(--nourish-cream) 100%)",
};

const GREETING: Record<TimeBand, string> = {
  morning: "Good morning.",
  afternoon: "Good afternoon.",
  evening: "Good evening.",
};

function resolveHeadline(
  streak: number,
  cooksThisWeek: number,
  weeklyGoal: number,
  totalCooks: number,
  daysSinceLastCook: number | undefined,
): string {
  if (totalCooks === 0) {
    return "Your kitchen story starts tonight.";
  }
  if (
    typeof daysSinceLastCook === "number" &&
    daysSinceLastCook >= WELCOME_BACK_THRESHOLD_DAYS
  ) {
    return "Welcome back. Let's start easy.";
  }
  if (cooksThisWeek >= weeklyGoal) {
    return "You hit your cooking goal this week  -  nice.";
  }
  if (weeklyGoal - cooksThisWeek === 1) {
    return "One more cook this week and you've hit your goal.";
  }
  if (streak >= 3) {
    return `Day ${streak} of your streak. Keep it easy tonight.`;
  }
  if (streak > 0) {
    return "You cooked yesterday. Let's keep the thread.";
  }
  return "What are you cooking tonight?";
}

/**
 * Path Hero  -  the calm, time-of-day-tinted area immediately below the sticky
 * header. It sets the emotional tone of Path without consuming vertical space
 * that crowds the skill tree. One headline, one soft gradient.
 *
 * No new state: greeting is derived from session stats the caller already has.
 */
export function PathHero({
  streak,
  cooksThisWeek,
  weeklyGoal = 3,
  totalCooks,
  lastCookedAt,
}: PathHeroProps) {
  // Resolve band + days-since on the client so the SSR/client branch cannot
  // mismatch. Intentional state-sets on mount  -  impure Date reads are
  // forbidden during render but are the whole point of these effects.
  const [band, setBand] = useState<TimeBand>("afternoon");
  const [daysSinceLastCook, setDaysSinceLastCook] = useState<
    number | undefined
  >(undefined);
  useEffect(() => {
    const now = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBand(resolveTimeBand(now));
    if (lastCookedAt) {
      const diffMs = now.getTime() - new Date(lastCookedAt).getTime();
      setDaysSinceLastCook(Math.max(0, Math.floor(diffMs / 86400000)));
    }
  }, [lastCookedAt]);

  const headline = resolveHeadline(
    streak,
    cooksThisWeek,
    weeklyGoal,
    totalCooks,
    daysSinceLastCook,
  );

  return (
    <motion.section
      aria-label="Path greeting"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden"
      style={{ background: GRADIENTS[band] }}
    >
      <div className="mx-auto max-w-md px-4 pb-5 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--nourish-green)]/80">
          {GREETING[band]}
        </p>
        <p className="mt-1 font-serif text-[21px] leading-[1.25] text-[var(--nourish-dark)]">
          {headline}
        </p>
      </div>
      {/* Gentle bottom feather so the gradient blends into the cream page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(250,250,248,0) 0%, var(--nourish-cream) 100%)",
        }}
      />
    </motion.section>
  );
}
