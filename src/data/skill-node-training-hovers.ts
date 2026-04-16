/**
 * Chef-school style hover copy for skill tree nodes — what you will practically
 * be able to do at each stage (curriculum / station language).
 */
import type { SkillNode } from "@/data/skill-tree";
import { getSkillNode } from "@/data/skill-tree";

export type SkillTrainingHover = {
  /** e.g. "Year 1 — Station 2" */
  courseStage: string;
  /** Practical outcomes (short lines) */
  youWill: string[];
  /** Native tooltip / screen reader summary */
  oneLiner: string;
};

const FALLBACK: SkillTrainingHover = {
  courseStage: "Culinary pathway",
  youWill: [
    "Open the module sheet to see practice dishes and assessment cooks.",
    "Complete station requirements to unlock the next station.",
  ],
  oneLiner: "Tap for syllabus, practice list, and station requirements.",
};

/** Richer copy for pivotal modules; others use tier + node name templates. */
const SPECIFIC: Record<string, SkillTrainingHover> = {
  "knife-skills": {
    courseStage: "Year 1 — Station 1 · Knife lab",
    youWill: [
      "Produce brunoise, julienne, and chiffonade to chef-instructor spec.",
      "Hold edge geometry and board rhythm so veg cooks evenly on the line.",
      "Plate cold apps with clean height and consistent cut size.",
    ],
    oneLiner:
      "Year 1 knife lab: graduate cuts that pass a line-cook practical exam.",
  },
  "mise-en-place": {
    courseStage: "Year 1 — Prep phase · Mise en place",
    youWill: [
      "Set a full prep list with mis en place timers before service simulation.",
      "Run parallel tasks (starch / veg / protein prep) without cross-contamination.",
      "Reset your station to inspection-ready in under two minutes.",
    ],
    oneLiner:
      "Prep phase: work clean, fast, and inspection-ready like a commis.",
  },
  "mother-sauces": {
    courseStage: "Year 2 — Mother sauces module",
    youWill: [
      "Build velouté, espagnole, hollandaise, and tomato bases from roux discipline.",
      "Rescue split emulsions and correct salt/fat balance on the fly.",
      "Nappe a protein and hold sauces through a mock service window.",
    ],
    oneLiner: "Sauce block: classical mother sauces + service holds.",
  },
  "plating-presentation": {
    courseStage: "Year 3 — Plating & presentation lab",
    youWill: [
      "Compose a plate with focal height, negative space, and sauce architecture.",
      "Shoot a consistent ¾ hero frame for critique and peer review.",
      "Iterate one dish through three plating revisions with scored rubrics.",
    ],
    oneLiner: "Plating module: rubric-scored presentation + photo critique.",
  },
  "kitchen-orchestration": {
    courseStage: "Capstone · Kitchen orchestration",
    youWill: [
      "Call a four-course pickup with staggered temps and one oven plan.",
      "Delegate garde manger vs saucier tasks under a 45-minute service clock.",
      "Recover from a simulated rail backup without sacrificing doneness.",
    ],
    oneLiner:
      "Capstone: run the pass like a chef de partie under time pressure.",
  },
  "italian-mastery": {
    courseStage: "Concentration · Italian line",
    youWill: [
      "Hand-roll pasta to al dente spec and finish in emulsified pan sauces.",
      "Build a regional antipasto that reads clearly on a tasting menu card.",
      "Pair acidity, fat, and salt the way a trattoria sommelier would narrate it.",
    ],
    oneLiner:
      "Italian concentration: pasta, regional plates, tasting-menu thinking.",
  },
  "japanese-mastery": {
    courseStage: "Concentration · Japanese line",
    youWill: [
      "Break fish for sashimi-grade yield with minimal waste tracking.",
      "Balance dashi, koji, and umami layers in a multi-bowl set menu.",
      "Execute a kaiseki micro-course with seasonal mise storytelling.",
    ],
    oneLiner:
      "Japanese concentration: fish butchery, dashi, kaiseki discipline.",
  },
  "french-mastery": {
    courseStage: "Concentration · French brigade",
    youWill: [
      "Classical tourne, tournedos, and butter-roasted proteins to temp charts.",
      "Mount pan sauces with monter au beurre timing off a live pickup.",
      "Write a French service sequence with saucier + garde handoffs.",
    ],
    oneLiner: "French concentration: brigade timing, classical sauces, temps.",
  },
};

function tierStage(tier: SkillNode["tier"], name: string): string {
  switch (tier) {
    case "foundation":
      return `Year 1 — Foundations · ${name}`;
    case "intermediate":
      return `Year 2 — Line & pantry · ${name}`;
    case "advanced":
      return `Year 3 — Advanced stations · ${name}`;
    case "pre-mastery":
      return `Pre-apprenticeship capstone · ${name}`;
    case "mastery":
      return `Concentration track · ${name}`;
    default:
      return name;
  }
}

function tierTemplate(node: SkillNode): SkillTrainingHover {
  const stage = tierStage(node.tier, node.name);
  const n = node.cooksRequired;
  return {
    courseStage: stage,
    youWill: [
      `Complete ${n} assessed “service cooks” that map to this module’s rubric.`,
      "Demonstrate timing, sanitation, and repeatable outcomes your chef-mentor can sign off.",
      "Unlock the next station once practicals and mise standards are met.",
    ],
    oneLiner: `${stage}: ${n} assessed cooks to pass this module.`,
  };
}

export function getSkillTrainingHover(id: string): SkillTrainingHover {
  const specific = SPECIFIC[id];
  if (specific) return specific;
  const node = getSkillNode(id);
  if (!node) return FALLBACK;
  return tierTemplate(node);
}
