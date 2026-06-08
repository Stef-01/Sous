/**
 * W14 — engagement milestones. Pure mapping from a streak / count to a celebration
 * payload (or null). Kept pure so the "did I just earn this?" check is testable
 * and the UI just renders. Celebrations are EARNED moments, never nags.
 */

export interface Milestone {
  id: string;
  title: string;
  body: string;
  emoji: string;
}

/** A logging/cook streak crossing a celebrated threshold. Fires only ON the exact
 *  milestone day (3, 7, 14, 30, 100), so it doesn't repeat every day after. */
export function streakMilestone(streak: number): Milestone | null {
  const table: Record<number, Milestone> = {
    3: {
      id: "streak-3",
      title: "3-day streak!",
      body: "You're building a habit.",
      emoji: "🔥",
    },
    7: {
      id: "streak-7",
      title: "One week strong",
      body: "Seven days in a row.",
      emoji: "🔥",
    },
    14: {
      id: "streak-14",
      title: "Two weeks!",
      body: "This is becoming who you are.",
      emoji: "⭐",
    },
    30: {
      id: "streak-30",
      title: "30 days",
      body: "A full month — incredible.",
      emoji: "🏆",
    },
    100: {
      id: "streak-100",
      title: "100 days",
      body: "Legendary consistency.",
      emoji: "👑",
    },
  };
  return table[streak] ?? null;
}

/** A first-of-its-kind moment (first cook, first log). */
export function firstMilestone(
  kind: "cook" | "log",
  count: number,
): Milestone | null {
  if (count !== 1) return null;
  return kind === "cook"
    ? {
        id: "first-cook",
        title: "First cook done!",
        body: "The hardest one is behind you.",
        emoji: "🎉",
      }
    : {
        id: "first-log",
        title: "First meal logged",
        body: "Tracking starts with one.",
        emoji: "✅",
      };
}
