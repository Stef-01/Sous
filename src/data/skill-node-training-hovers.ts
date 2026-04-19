/**
 * Skill node copy: tiny hover preview + richer "at home" story in the detail sheet.
 * Tone is practical home-kitchen outcomes, not brigade / exam jargon.
 */
import type { SkillNode } from "@/data/skill-tree";
import { getSkillNode } from "@/data/skill-tree";

export type SkillTrainingHover = {
  /** Small chip on hover, e.g. "Basics" */
  badge: string;
  /** One short line for hover (keep under ~100 chars) */
  hoverTeaser: string;
  /** Sheet subhead under the skill title */
  sheetHeadline: string;
  /** Deeper bullets  -  shown in the bottom sheet with stagger animation */
  atHomeYoull: string[];
  /** Native tooltip / title */
  oneLiner: string;
};

const FALLBACK: SkillTrainingHover = {
  badge: "Path",
  hoverTeaser: "Tap to see what to cook next and how close you are.",
  sheetHeadline: "Pick a practice dish and cook it for real.",
  atHomeYoull: [
    "Each node is a habit you prove by finishing real meals, not quizzes.",
    "We suggest dishes that match this focus so you’re not hunting recipes.",
    "When the bar fills, the next skill unlocks automatically.",
  ],
  oneLiner: "Open this skill to see practice dishes and progress.",
};

function tierBadge(tier: SkillNode["tier"]): string {
  switch (tier) {
    case "foundation":
      return "Basics";
    case "intermediate":
      return "Level up";
    case "advanced":
      return "Confident";
    case "pre-mastery":
      return "Showpiece";
    case "mastery":
      return "Deep dive";
    default:
      return "Path";
  }
}

function capitalizeWord(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function masteryHover(node: SkillNode): SkillTrainingHover {
  const n = node.cooksRequired;
  const raw = node.cuisineFamily ?? node.name.replace(/\s+Mastery$/i, "");
  const short = capitalizeWord(raw.replace(/-/g, " "));
  return {
    badge: "Deep dive",
    hoverTeaser: `Cook ${n} real ${short} dinners you’d serve friends  -  tap for ideas.`,
    sheetHeadline: `Make ${short} flavors feel natural in your own kitchen.`,
    atHomeYoull: [
      `Rotate a few go-to ${short} plates so shopping and timing get easier.`,
      "Learn the smell-and-look cues so you’re not guessing when food is done.",
      `After ${n} cooks, you’ll improvise sides and sauces without leaning on recipes.`,
    ],
    oneLiner: `${node.name} · ${n} home cooks`,
  };
}

/** Richer copy for pivotal modules; mastery uses `masteryHover` unless overridden here. */
const SPECIFIC: Record<string, SkillTrainingHover> = {
  "knife-skills": {
    badge: "Basics",
    hoverTeaser:
      "Safer, faster chopping for every salad and stir-fry  -  tap for more.",
    sheetHeadline: "Chop with confidence so dinner prep stops feeling chaotic.",
    atHomeYoull: [
      "Even slices mean even cooking  -  fewer burnt edges and raw centers.",
      "Prep a whole veg tray in one go for sheet pans, tacos, and grain bowls.",
      "After a few cooks, your board rhythm feels steady instead of hesitant.",
    ],
    oneLiner: "Knife skills: safer, faster prep at home.",
  },
  "mise-en-place": {
    badge: "Basics",
    hoverTeaser:
      "Everything measured and staged before the pan gets hot  -  tap to see why.",
    sheetHeadline:
      "Set yourself up so stir-fries and pastas don’t turn into a scramble.",
    atHomeYoull: [
      "Lay out ingredients once so you’re not opening drawers mid-sear.",
      "Time dishes so protein, veg, and starch land on the plate together.",
      "Clean as you go  -  the kitchen still looks kind when it’s time to eat.",
    ],
    oneLiner: "Mise en place: calmer weeknight cooking.",
  },
  "mother-sauces": {
    badge: "Level up",
    hoverTeaser:
      "Pan sauces and gravies that taste like a restaurant  -  tap for practice dishes.",
    sheetHeadline:
      "Build sauces from scratch so leftovers feel like a new meal.",
    atHomeYoull: [
      "Thicken and season by taste instead of hoping the recipe was right.",
      "Rescue a split or salty pan sauce without starting over.",
      "Nap a piece of chicken or pork with something you actually want to lick off the plate.",
    ],
    oneLiner: "Sauces you’ll reuse on chicken, pasta, and veg.",
  },
  "plating-presentation": {
    badge: "Showpiece",
    hoverTeaser:
      "Plates that look as good as they taste  -  tap for simple tricks.",
    sheetHeadline: "Make home dinners feel special without extra shopping.",
    atHomeYoull: [
      "Give each plate a clear focal point so it reads well on the table.",
      "Use height and color contrast with what you already bought this week.",
      "Snap a quick photo to notice what to tweak next time  -  no food-stylist gear needed.",
    ],
    oneLiner: "Plating: make tonight’s dinner look intentional.",
  },
  "kitchen-orchestration": {
    badge: "Showpiece",
    hoverTeaser:
      "Serve a full dinner hot, together  -  tap for how we practice that.",
    sheetHeadline:
      "Run timing for mains, sides, and guests without melting down.",
    atHomeYoull: [
      "Sequence ovens, stovetops, and resting so nothing dies on the pass… er, counter.",
      "Delegate a side or salad to a helper without losing your flow.",
      "Recover when one dish runs late without sacrificing the rest.",
    ],
    oneLiner: "Orchestration: multi-dish dinners that land together.",
  },
  "italian-mastery": {
    badge: "Deep dive",
    hoverTeaser:
      "Pasta nights that taste traveled  -  tap for dish ideas and pacing.",
    sheetHeadline:
      "Own Italian weeknights: pasta, sauces, and simple antipasti.",
    atHomeYoull: [
      "Finish pasta in the sauce so every bite is glossy, not watery.",
      "Balance acid, fat, and salt the way your favorite trattoria does.",
      "Host a small dinner where the menu feels cohesive, not random Italian hits.",
    ],
    oneLiner: "Italian mastery: pasta and plates you’ll repeat.",
  },
  "japanese-mastery": {
    badge: "Deep dive",
    hoverTeaser:
      "Dashi, rice, and clean flavors at home  -  tap for the practice path.",
    sheetHeadline:
      "Build Japanese comfort food without a pantry full of mystery bottles.",
    atHomeYoull: [
      "Layer umami with a few staples so soups and bowls feel deep, not flat.",
      "Cook rice you’re proud to serve on its own.",
      "Plate a simple set meal where every small dish has a reason to be there.",
    ],
    oneLiner: "Japanese mastery: umami-forward home cooking.",
  },
  "french-mastery": {
    badge: "Deep dive",
    hoverTeaser:
      "Butter, wine pan sauces, and roasts that feel classic  -  tap to plan cooks.",
    sheetHeadline: "French techniques that still fit real weeknights.",
    atHomeYoull: [
      "Pan-roast proteins and finish with a quick pan sauce you’d swipe bread through.",
      "Know when to walk back heat so butter browns instead of burns.",
      "Serve a small French-leaning menu without staying up past midnight.",
    ],
    oneLiner: "French mastery: sauces and roasts at home.",
  },
};

function tierTemplate(node: SkillNode): SkillTrainingHover {
  const n = node.cooksRequired;
  const badge = tierBadge(node.tier);
  const topic = node.name;

  if (node.tier === "mastery") {
    return masteryHover(node);
  }

  const hoverTeaser =
    node.tier === "foundation"
      ? `${n} easy wins on ${topic.toLowerCase()}  -  tap for dish ideas.`
      : node.tier === "intermediate"
        ? `Sharpen ${topic.toLowerCase()} across ${n} real dinners  -  tap to see how.`
        : node.tier === "advanced"
          ? `Push ${topic.toLowerCase()} with ${n} cooks you’d serve friends  -  tap for more.`
          : `${n} show-off cooks on ${topic.toLowerCase()}  -  tap for the plan.`;

  const sheetHeadline =
    node.tier === "foundation"
      ? `Build a solid base: ${topic.toLowerCase()}`
      : node.tier === "intermediate"
        ? `Cook ${topic.toLowerCase()} with less stress and better timing`
        : node.tier === "advanced"
          ? `Level ${topic.toLowerCase()} until it feels instinctive`
          : `Capstone: ${topic.toLowerCase()} under dinner-party pressure`;

  const atHomeYoull =
    node.tier === "foundation"
      ? [
          `Finish ${n} guided cooks so ${topic.toLowerCase()} stops feeling guessy.`,
          "Pick techniques you’ll reuse on salads, sheet pans, and quick sautés.",
          "Unlock the next focus when this one feels natural  -  no cramming.",
        ]
      : node.tier === "intermediate"
        ? [
            `Use ${n} dinners to tighten timing, seasoning, and cleanup habits.`,
            "Lean on suggested dishes so you’re not doom-scrolling recipes mid-week.",
            "Notice what repeats  -  that’s the muscle we’re building.",
          ]
        : node.tier === "advanced"
          ? [
              `Treat each of the ${n} cooks like a dress rehearsal for guests.`,
              "Practice reading doneness and adjusting heat without panic.",
              "Plate with intention so the meal matches the effort you put in.",
            ]
          : [
              `String ${n} ambitious cooks into a cohesive “you’ve got this” streak.`,
              "Practice recovery moves when something runs early or late.",
              "Finish feeling proud of how the whole table came together.",
            ];

  return {
    badge,
    hoverTeaser,
    sheetHeadline,
    atHomeYoull,
    oneLiner: `${topic} · ${n} practice cooks`,
  };
}

export function getSkillTrainingHover(id: string): SkillTrainingHover {
  const specific = SPECIFIC[id];
  if (specific) return specific;
  const node = getSkillNode(id);
  if (!node) return FALLBACK;
  return tierTemplate(node);
}
