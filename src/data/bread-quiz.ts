/**
 * "What Bread Are You?" — BuzzFeed-style personality quiz.
 *
 * 8 lifestyle/vibe questions, each with 4 options.
 * Each option maps to one of 8 bread archetypes via a weighted tally.
 * The bread with the highest score at the end is the user's result.
 */

export type BreadType =
  | "sourdough"
  | "croissant"
  | "baguette"
  | "banana-bread"
  | "focaccia"
  | "brioche"
  | "pretzel"
  | "naan";

export interface QuizOption {
  label: string;
  /** Which bread types get +1 for this answer */
  maps: BreadType[];
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export interface BreadResult {
  bread: BreadType;
  displayName: string;
  emoji: string;
  headline: string;
  description: string;
  /** Cuisine families this personality gravitates toward */
  cuisineAffinities: string[];
}

// ── Questions ────────────────────────────────────────

export const quizQuestions: QuizQuestion[] = [
  {
    question: "It's Saturday morning. What are you doing?",
    options: [
      { label: "Farmers market before anyone's awake", maps: ["sourdough", "focaccia"] },
      { label: "Sleeping in, croissant crumbs on the sheets", maps: ["croissant", "brioche"] },
      { label: "Already at brunch with 6 friends", maps: ["pretzel", "baguette"] },
      { label: "Making something cozy in the kitchen", maps: ["banana-bread", "naan"] },
    ],
  },
  {
    question: "Pick a holiday vibe.",
    options: [
      { label: "Tiny village in the south of France", maps: ["baguette", "croissant"] },
      { label: "Street food crawl through Bangkok", maps: ["naan", "pretzel"] },
      { label: "Cottage in the woods, no Wi-Fi", maps: ["banana-bread", "sourdough"] },
      { label: "Rooftop bar overlooking a harbour", maps: ["focaccia", "brioche"] },
    ],
  },
  {
    question: "Your friend cancels dinner plans. You:",
    options: [
      { label: "Finally make that recipe you bookmarked", maps: ["sourdough", "naan"] },
      { label: "Order something indulgent, no guilt", maps: ["croissant", "brioche"] },
      { label: "Call someone else — the night's young", maps: ["pretzel", "baguette"] },
      { label: "Couch + blanket + comfort food", maps: ["banana-bread", "focaccia"] },
    ],
  },
  {
    question: "What's your coffee order?",
    options: [
      { label: "Black, single origin, no milk", maps: ["sourdough", "baguette"] },
      { label: "Oat latte with a little something extra", maps: ["croissant", "brioche"] },
      { label: "Whatever's biggest with the most caffeine", maps: ["pretzel", "banana-bread"] },
      { label: "Chai or something spiced", maps: ["naan", "focaccia"] },
    ],
  },
  {
    question: "You're at a party. Where do you end up?",
    options: [
      { label: "In the kitchen, tasting everything", maps: ["focaccia", "sourdough"] },
      { label: "Centre of the dance floor", maps: ["pretzel", "brioche"] },
      { label: "Deep conversation on the balcony", maps: ["baguette", "naan"] },
      { label: "Left early, honestly happier at home", maps: ["banana-bread", "croissant"] },
    ],
  },
  {
    question: "Pick the playlist.",
    options: [
      { label: "Jazz & bossa nova", maps: ["baguette", "croissant"] },
      { label: "Lo-fi beats or ambient", maps: ["sourdough", "banana-bread"] },
      { label: "Pop bangers, no skips", maps: ["pretzel", "brioche"] },
      { label: "World music & Bollywood", maps: ["naan", "focaccia"] },
    ],
  },
  {
    question: "What's your superpower in the kitchen?",
    options: [
      { label: "Patience — I'll wait 3 days for the perfect ferment", maps: ["sourdough", "naan"] },
      { label: "Presentation — it has to look beautiful", maps: ["croissant", "baguette"] },
      { label: "Flavour instinct — I never measure anything", maps: ["focaccia", "pretzel"] },
      { label: "Comfort — everything I make feels like a hug", maps: ["banana-bread", "brioche"] },
    ],
  },
  {
    question: "Finally: pick a colour palette.",
    options: [
      { label: "Warm neutrals and terracotta", maps: ["sourdough", "focaccia"] },
      { label: "Soft pastels and blush pink", maps: ["croissant", "brioche"] },
      { label: "Bold jewel tones", maps: ["naan", "pretzel"] },
      { label: "Forest green and cream", maps: ["banana-bread", "baguette"] },
    ],
  },
];

// ── Results ──────────────────────────────────────────

export const breadResults: Record<BreadType, BreadResult> = {
  sourdough: {
    bread: "sourdough",
    displayName: "Sourdough",
    emoji: "\uD83E\uDD56",
    headline: "You\u2019re Sourdough",
    description:
      "You do things properly or not at all. You own a reusable tote, know your local barista by name, and your gut health is immaculate. You\u2019re the friend everyone trusts with a secret and a dinner reservation.",
    cuisineAffinities: ["mediterranean", "comfort-classic", "italian"],
  },
  croissant: {
    bread: "croissant",
    displayName: "Croissant",
    emoji: "\uD83E\uDD50",
    headline: "You\u2019re a Croissant",
    description:
      "Effortlessly chic with a flaky exterior and a soft, warm centre. You treat yourself because you\u2019ve earned it. Your aesthetic game is unmatched and your brunch spots are always a vibe.",
    cuisineAffinities: ["italian", "mediterranean"],
  },
  baguette: {
    bread: "baguette",
    displayName: "Baguette",
    emoji: "\uD83E\uDD56",
    headline: "You\u2019re a Baguette",
    description:
      "Classic, dependable, and secretly the backbone of every great meal. You\u2019re cultured without being pretentious and can hold a conversation about literally anything. People underestimate you until they need you.",
    cuisineAffinities: ["italian", "mediterranean", "comfort-classic"],
  },
  "banana-bread": {
    bread: "banana-bread",
    displayName: "Banana Bread",
    emoji: "\uD83C\uDF4C",
    headline: "You\u2019re Banana Bread",
    description:
      "Homemade, warm, and everyone\u2019s comfort person. You\u2019re the group chat therapist with the cosiest home and the best Spotify playlists. You peaked during lockdown and you\u2019re not ashamed.",
    cuisineAffinities: ["comfort-classic", "japanese"],
  },
  focaccia: {
    bread: "focaccia",
    displayName: "Focaccia",
    emoji: "\uD83C\uDF3F",
    headline: "You\u2019re Focaccia",
    description:
      "Herby, generous, and quietly the most interesting person in the room. You throw dinner parties where everyone stays too late. You know good olive oil costs more and you pay it every time.",
    cuisineAffinities: ["italian", "mediterranean"],
  },
  brioche: {
    bread: "brioche",
    displayName: "Brioche",
    emoji: "\u2728",
    headline: "You\u2019re Brioche",
    description:
      "Rich, a little extra, and absolutely worth the calories. You\u2019re the friend who turns up with champagne on a Tuesday. Life is too short for boring bread and boring plans.",
    cuisineAffinities: ["italian", "comfort-classic"],
  },
  pretzel: {
    bread: "pretzel",
    displayName: "Pretzel",
    emoji: "\uD83E\uDD68",
    headline: "You\u2019re a Pretzel",
    description:
      "Bold, salty, and impossible to ignore. You\u2019re the one who suggests the random Tuesday adventure and somehow convinces everyone to come. Your energy is contagious and your snack game is elite.",
    cuisineAffinities: ["comfort-classic", "korean", "mexican"],
  },
  naan: {
    bread: "naan",
    displayName: "Naan",
    emoji: "\uD83E\uDD59",
    headline: "You\u2019re Naan",
    description:
      "Warm, versatile, and the absolute glue that holds everything together. You bring people from different worlds into the same room and make it work. Your spice tolerance is a personality trait.",
    cuisineAffinities: ["indian", "thai", "japanese"],
  },
};

// ── Scoring helper ───────────────────────────────────

/**
 * Tally answers and return the winning bread type.
 * Each answer maps to 1-2 bread types that get +1.
 * Ties broken by order in the BreadType union (first match wins).
 */
export function scoreBreadQuiz(answers: number[]): BreadType {
  const scores: Record<BreadType, number> = {
    sourdough: 0,
    croissant: 0,
    baguette: 0,
    "banana-bread": 0,
    focaccia: 0,
    brioche: 0,
    pretzel: 0,
    naan: 0,
  };

  for (let i = 0; i < answers.length; i++) {
    const question = quizQuestions[i];
    if (!question) continue;
    const option = question.options[answers[i]];
    if (!option) continue;
    for (const bread of option.maps) {
      scores[bread] += 1;
    }
  }

  // Find the max
  let winner: BreadType = "sourdough";
  let maxScore = 0;
  for (const [bread, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      winner = bread as BreadType;
    }
  }

  return winner;
}
