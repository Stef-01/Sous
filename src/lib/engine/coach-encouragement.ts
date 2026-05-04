/**
 * Coach Encouragement Engine
 *
 * Generates contextual encouragement messages based on user milestones
 * and cooking activity. These messages fire at specific moments in the
 * app (win screen, today page, cook start) to build habit and confidence.
 *
 * Trigger points:
 * - First cook ever
 * - Streak milestones (3, 7, 14, 30 days)
 * - After an abandoned/failed cook
 * - First time cooking a new cuisine
 * - Returning after absence (3+ days without cooking)
 */

export type EncouragementTrigger =
  | "first-cook"
  | "streak-3"
  | "streak-7"
  | "streak-14"
  | "streak-30"
  | "post-abandon"
  | "new-cuisine"
  | "return-after-absence";

export interface EncouragementMessage {
  trigger: EncouragementTrigger;
  message: string;
  emoji: string;
  /** Whether this should feel celebratory (confetti-worthy) or gentle. */
  tone: "celebrate" | "gentle" | "warm";
}

export interface CoachContext {
  completedCooks: number;
  currentStreak: number;
  lastCookDate: string | null;
  cuisinesCovered: string[];
  /** The cuisine of the dish just cooked (for new-cuisine detection). */
  currentCuisine?: string;
  /** Whether the last cook was abandoned/incomplete. */
  lastCookAbandoned?: boolean;
}

const STREAK_MESSAGES: Record<number, { message: string; emoji: string }> = {
  3: {
    message: "Three days in a row — you're building a real habit",
    emoji: "🔥",
  },
  7: {
    message: "A full week of cooking! Your kitchen confidence is showing",
    emoji: "⭐",
  },
  14: {
    message: "Two weeks strong — cooking is becoming second nature",
    emoji: "💪",
  },
  30: {
    message: "30-day streak! You've transformed your relationship with cooking",
    emoji: "🏆",
  },
};

/**
 * Determine which encouragement message (if any) to show based on context.
 * Returns null if no special moment is detected.
 */
export function getEncouragement(
  context: CoachContext,
): EncouragementMessage | null {
  // Priority 1: First cook ever (most important moment)
  if (context.completedCooks === 1) {
    return {
      trigger: "first-cook",
      message: "You just cooked your first meal! That's the hardest one done",
      emoji: "🎉",
      tone: "celebrate",
    };
  }

  // Priority 2: Return after absence (gentle re-engagement)
  if (context.lastCookAbandoned) {
    return {
      trigger: "post-abandon",
      message: "No worries, everyone has off days. Ready for a fresh start?",
      emoji: "🌱",
      tone: "gentle",
    };
  }

  // Priority 3: Return after 3+ days away
  if (context.lastCookDate) {
    const daysSince = getDaysSince(context.lastCookDate);
    if (daysSince >= 3 && context.completedCooks > 1) {
      return {
        trigger: "return-after-absence",
        message: "Welcome back! Your kitchen missed you",
        emoji: "👋",
        tone: "warm",
      };
    }
  }

  // Priority 4: New cuisine exploration
  if (context.currentCuisine) {
    const isNew = !context.cuisinesCovered.some(
      (c) => c.toLowerCase() === context.currentCuisine!.toLowerCase(),
    );
    if (isNew && context.completedCooks > 0) {
      const label =
        context.currentCuisine.charAt(0).toUpperCase() +
        context.currentCuisine.slice(1);
      return {
        trigger: "new-cuisine",
        message: `First time cooking ${label}! That's adventurous`,
        emoji: "🗺️",
        tone: "celebrate",
      };
    }
  }

  // Priority 5: Streak milestones
  const streakMsg = STREAK_MESSAGES[context.currentStreak];
  if (streakMsg) {
    const trigger = `streak-${context.currentStreak}` as EncouragementTrigger;
    return {
      trigger,
      message: streakMsg.message,
      emoji: streakMsg.emoji,
      tone: "celebrate",
    };
  }

  return null;
}

/** Key for tracking which encouragements have been shown (don't repeat). */
const SHOWN_KEY = "sous-coach-shown-v1";

/** Record that an encouragement was shown so we don't repeat it. */
export function markShown(trigger: EncouragementTrigger): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(SHOWN_KEY);
    const shown: string[] = raw ? JSON.parse(raw) : [];
    if (!shown.includes(trigger)) {
      shown.push(trigger);
      window.localStorage.setItem(SHOWN_KEY, JSON.stringify(shown));
    }
  } catch {
    // localStorage unavailable
  }
}

/** Check if an encouragement has already been shown. */
export function wasShown(trigger: EncouragementTrigger): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(SHOWN_KEY);
    if (!raw) return false;
    const shown: string[] = JSON.parse(raw);
    return shown.includes(trigger);
  } catch {
    return false;
  }
}

/**
 * Get encouragement only if it hasn't been shown before.
 * Automatically marks it as shown when returned.
 */
export function getUniqueEncouragement(
  context: CoachContext,
): EncouragementMessage | null {
  const msg = getEncouragement(context);
  if (!msg) return null;

  // Allow repeat of "return-after-absence" and "post-abandon" (these can recur)
  if (msg.trigger === "return-after-absence" || msg.trigger === "post-abandon") {
    return msg;
  }

  if (wasShown(msg.trigger)) return null;
  markShown(msg.trigger);
  return msg;
}

function getDaysSince(isoDate: string): number {
  const then = new Date(isoDate).getTime();
  if (!Number.isFinite(then)) return 0;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}
