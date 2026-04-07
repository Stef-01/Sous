import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";

// Daily vibe prompts — one per day of the week, cycling
const VIBE_PROMPTS = [
  {
    questionKey: "energy-tonight",
    question: "What's your cooking energy tonight?",
    optionA: "Quick and easy — dinner on the table fast",
    optionB: "I'm in the mood to actually cook something",
  },
  {
    questionKey: "cuisine-mood",
    question: "What sounds good right now?",
    optionA: "Something familiar and comforting",
    optionB: "Something new I haven't tried before",
  },
  {
    questionKey: "health-mood",
    question: "How are you feeling about food today?",
    optionA: "Light and fresh — I want to feel good",
    optionB: "Hearty and satisfying — I'm hungry",
  },
  {
    questionKey: "cooking-style",
    question: "Pick a cooking vibe.",
    optionA: "One pan, minimum washing up",
    optionB: "I'll use every pot if the result is worth it",
  },
  {
    questionKey: "social-mood",
    question: "Who are you cooking for?",
    optionA: "Just me — easy single portions",
    optionB: "People I want to impress",
  },
  {
    questionKey: "adventure-level",
    question: "What's your ingredient comfort zone tonight?",
    optionA: "Pantry staples only",
    optionB: "I'll make a special trip if it's worth it",
  },
  {
    questionKey: "time-budget",
    question: "How much time do you have?",
    optionA: "Under 20 minutes",
    optionB: "Happy to take my time",
  },
];

// Result cards keyed by questionKey → answer ("A" | "B")
const QUIZ_RESULTS: Record<
  string,
  Record<string, { resultText: string; resultEmoji: string }>
> = {
  "energy-tonight": {
    A: { resultText: "Quick wins coming your way", resultEmoji: "⚡" },
    B: {
      resultText: "Let's make something you'll be proud of",
      resultEmoji: "👨‍🍳",
    },
  },
  "cuisine-mood": {
    A: { resultText: "Comfort is always the right call", resultEmoji: "🏠" },
    B: {
      resultText: "Adventure awaits — new flavours unlocked",
      resultEmoji: "🌍",
    },
  },
  "health-mood": {
    A: { resultText: "Fresh and vibrant it is", resultEmoji: "🥗" },
    B: { resultText: "Fuel yourself right", resultEmoji: "💪" },
  },
  "cooking-style": {
    A: { resultText: "Minimal mess, maximum flavour", resultEmoji: "🍳" },
    B: { resultText: "The journey is the reward", resultEmoji: "✨" },
  },
  "social-mood": {
    A: { resultText: "Solo cook, self-care mode on", resultEmoji: "🧘" },
    B: { resultText: "Time to show off a little", resultEmoji: "🌟" },
  },
  "adventure-level": {
    A: { resultText: "Pantry hero, no trip needed", resultEmoji: "🥫" },
    B: { resultText: "Worth the extra mile", resultEmoji: "🛒" },
  },
  "time-budget": {
    A: { resultText: "Speed mode activated", resultEmoji: "🏃" },
    B: { resultText: "Good things take time", resultEmoji: "⏰" },
  },
};

export const coachRouter = router({
  vibePrompt: publicProcedure.query(() => {
    const dayOfWeek = new Date().getDay(); // 0-6
    return VIBE_PROMPTS[dayOfWeek % VIBE_PROMPTS.length]!;
  }),

  quiz: publicProcedure
    .input(
      z.object({
        questionKey: z.string(),
        answer: z.string(), // "A" or "B"
      }),
    )
    .mutation(({ input }) => {
      const results = QUIZ_RESULTS[input.questionKey];
      return (
        results?.[input.answer.toUpperCase()] ?? {
          resultText: "Great choice — let's cook!",
          resultEmoji: "🍽️",
        }
      );
    }),
});
