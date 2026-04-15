/**
 * Achievement definitions — milestones that reward consistent cooking.
 * Each achievement has a condition checked against user stats.
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: "cooking" | "exploration" | "streak" | "mastery";
  condition: AchievementCondition;
}

export type AchievementCondition =
  | { type: "cooks_completed"; count: number }
  | { type: "cuisines_explored"; count: number }
  | { type: "streak_days"; count: number }
  | { type: "skills_completed"; count: number }
  | { type: "dishes_rated"; count: number }
  | { type: "photos_added"; count: number }
  | { type: "xp_earned"; amount: number }
  | { type: "level_reached"; level: number };

export const achievements: Achievement[] = [
  // Cooking milestones
  {
    id: "first-cook",
    name: "First Flame",
    description: "Complete your first guided cook",
    emoji: "🔥",
    category: "cooking",
    condition: { type: "cooks_completed", count: 1 },
  },
  {
    id: "five-cooks",
    name: "Getting Warmed Up",
    description: "Complete 5 guided cooks",
    emoji: "🍳",
    category: "cooking",
    condition: { type: "cooks_completed", count: 5 },
  },
  {
    id: "ten-cooks",
    name: "Double Digits",
    description: "Complete 10 guided cooks",
    emoji: "👨‍🍳",
    category: "cooking",
    condition: { type: "cooks_completed", count: 10 },
  },
  {
    id: "twenty-five-cooks",
    name: "Kitchen Regular",
    description: "Complete 25 guided cooks",
    emoji: "🏆",
    category: "cooking",
    condition: { type: "cooks_completed", count: 25 },
  },
  {
    id: "fifty-cooks",
    name: "Dedicated Chef",
    description: "Complete 50 guided cooks",
    emoji: "💎",
    category: "cooking",
    condition: { type: "cooks_completed", count: 50 },
  },

  // Exploration milestones
  {
    id: "first-cuisine",
    name: "Culture Curious",
    description: "Cook a dish from your first cuisine",
    emoji: "🌍",
    category: "exploration",
    condition: { type: "cuisines_explored", count: 1 },
  },
  {
    id: "three-cuisines",
    name: "World Traveler",
    description: "Explore 3 different cuisines",
    emoji: "✈️",
    category: "exploration",
    condition: { type: "cuisines_explored", count: 3 },
  },
  {
    id: "five-cuisines",
    name: "Global Palate",
    description: "Explore 5 different cuisines",
    emoji: "🗺️",
    category: "exploration",
    condition: { type: "cuisines_explored", count: 5 },
  },
  {
    id: "eight-cuisines",
    name: "Cuisine Collector",
    description: "Explore all 8 cuisine families",
    emoji: "🌏",
    category: "exploration",
    condition: { type: "cuisines_explored", count: 8 },
  },

  // Streak milestones
  {
    id: "three-day-streak",
    name: "Consistent Cook",
    description: "Maintain a 3-day cooking streak",
    emoji: "🔥",
    category: "streak",
    condition: { type: "streak_days", count: 3 },
  },
  {
    id: "seven-day-streak",
    name: "Week Warrior",
    description: "Cook every day for a week",
    emoji: "⚡",
    category: "streak",
    condition: { type: "streak_days", count: 7 },
  },
  {
    id: "fourteen-day-streak",
    name: "Unstoppable",
    description: "Two weeks of daily cooking",
    emoji: "🌟",
    category: "streak",
    condition: { type: "streak_days", count: 14 },
  },
  {
    id: "thirty-day-streak",
    name: "Iron Chef",
    description: "30-day cooking streak",
    emoji: "👑",
    category: "streak",
    condition: { type: "streak_days", count: 30 },
  },

  // Mastery milestones
  {
    id: "first-skill",
    name: "Skill Unlocked",
    description: "Complete your first skill tree node",
    emoji: "🎯",
    category: "mastery",
    condition: { type: "skills_completed", count: 1 },
  },
  {
    id: "five-skills",
    name: "Rising Star",
    description: "Complete 5 skill tree nodes",
    emoji: "⭐",
    category: "mastery",
    condition: { type: "skills_completed", count: 5 },
  },
  {
    id: "ten-skills",
    name: "Craft Master",
    description: "Complete 10 skill tree nodes",
    emoji: "🏅",
    category: "mastery",
    condition: { type: "skills_completed", count: 10 },
  },

  // XP milestones
  {
    id: "level-5",
    name: "Home Cook",
    description: "Reach Level 5",
    emoji: "🏠",
    category: "mastery",
    condition: { type: "level_reached", level: 5 },
  },
  {
    id: "level-10",
    name: "Plate Master",
    description: "Reach Level 10",
    emoji: "🍽️",
    category: "mastery",
    condition: { type: "level_reached", level: 10 },
  },

  // Engagement milestones
  {
    id: "first-rating",
    name: "Food Critic",
    description: "Rate your first dish",
    emoji: "⭐",
    category: "cooking",
    condition: { type: "dishes_rated", count: 1 },
  },
  {
    id: "first-photo",
    name: "Food Photographer",
    description: "Add a photo to a completed cook",
    emoji: "📸",
    category: "cooking",
    condition: { type: "photos_added", count: 1 },
  },
];

export function getAchievement(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id);
}
