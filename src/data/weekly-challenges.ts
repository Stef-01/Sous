/**
 * Weekly Challenges — rotating cooking goals that award bonus XP.
 * A new challenge rotates each Monday. Deterministic: same week = same challenge.
 */

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  goal: ChallengeGoal;
  bonusXP: number;
}

export type ChallengeGoal =
  | { type: "cook_count"; target: number }
  | { type: "cuisine_cook"; cuisine: string; target: number }
  | { type: "unique_dishes"; target: number }
  | { type: "rate_dishes"; target: number }
  | { type: "streak_days"; target: number };

const challengePool: WeeklyChallenge[] = [
  {
    id: "cook-3",
    title: "Cook 3 Times",
    description: "Complete 3 guided cooks this week",
    emoji: "🍳",
    goal: { type: "cook_count", target: 3 },
    bonusXP: 50,
  },
  {
    id: "japanese-week",
    title: "Japanese Week",
    description: "Cook 2 Japanese dishes this week",
    emoji: "🍱",
    goal: { type: "cuisine_cook", cuisine: "Japanese", target: 2 },
    bonusXP: 75,
  },
  {
    id: "italian-week",
    title: "Italian Week",
    description: "Cook 2 Italian dishes this week",
    emoji: "🍝",
    goal: { type: "cuisine_cook", cuisine: "Italian", target: 2 },
    bonusXP: 75,
  },
  {
    id: "variety-cook",
    title: "Try Something New",
    description: "Cook 3 different dishes this week",
    emoji: "🌟",
    goal: { type: "unique_dishes", target: 3 },
    bonusXP: 60,
  },
  {
    id: "rate-5",
    title: "Food Critic Week",
    description: "Rate 5 dishes after cooking",
    emoji: "⭐",
    goal: { type: "rate_dishes", target: 5 },
    bonusXP: 40,
  },
  {
    id: "streak-5",
    title: "5-Day Streak",
    description: "Cook every day for 5 days",
    emoji: "🔥",
    goal: { type: "streak_days", target: 5 },
    bonusXP: 100,
  },
  {
    id: "indian-week",
    title: "Indian Spice Week",
    description: "Cook 2 Indian dishes this week",
    emoji: "🍛",
    goal: { type: "cuisine_cook", cuisine: "Indian", target: 2 },
    bonusXP: 75,
  },
  {
    id: "cook-5",
    title: "High Five",
    description: "Complete 5 guided cooks this week",
    emoji: "✋",
    goal: { type: "cook_count", target: 5 },
    bonusXP: 80,
  },
  {
    id: "mexican-week",
    title: "Mexican Fiesta",
    description: "Cook 2 Mexican dishes this week",
    emoji: "🌮",
    goal: { type: "cuisine_cook", cuisine: "Mexican", target: 2 },
    bonusXP: 75,
  },
  {
    id: "thai-week",
    title: "Thai Taste",
    description: "Cook 2 Thai dishes this week",
    emoji: "🍜",
    goal: { type: "cuisine_cook", cuisine: "Thai", target: 2 },
    bonusXP: 75,
  },
];

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

export function getCurrentChallenge(): WeeklyChallenge {
  const weekNum = getWeekNumber();
  return challengePool[weekNum % challengePool.length];
}

export function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getDaysRemainingInWeek(): number {
  const now = new Date();
  const day = now.getDay();
  return day === 0 ? 0 : 7 - day;
}
