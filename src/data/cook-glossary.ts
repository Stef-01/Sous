/**
 * Cook-step glossary  -  plain-English explanations for technique words
 * that show up in recipe instructions. Used by `<Glossify>` to underline
 * the word and reveal a short tooltip on tap or hover.
 *
 * Keep entries short. One sentence. No jargon-to-jargon definitions.
 * The audience is someone who wants to cook, not someone studying cooking.
 */

export interface GlossaryEntry {
  /** Canonical name shown as the tooltip title. */
  term: string;
  /**
   * All word forms (lowercase, plain text) that should be underlined and
   * mapped back to this entry. Include common gerund/past-tense variants.
   * Multi-word entries are written with a literal space.
   */
  patterns: string[];
  /** One-line plain-English explanation. */
  meaning: string;
}

export const cookGlossary: GlossaryEntry[] = [
  {
    term: "Deglaze",
    patterns: ["deglaze", "deglazes", "deglazed", "deglazing"],
    meaning:
      "Splash a liquid (wine, broth, water) into a hot pan to lift the brown bits stuck to the bottom  -  that is pure flavor.",
  },
  {
    term: "Sauté",
    patterns: ["sauté", "sautés", "sautéed", "sautéing", "saute", "sauteed"],
    meaning:
      "Cook in a hot pan with a small amount of fat, stirring often, until just soft or lightly browned.",
  },
  {
    term: "Simmer",
    patterns: ["simmer", "simmers", "simmered", "simmering"],
    meaning:
      "Keep the liquid just below a boil so the surface gently trembles  -  never a rolling boil.",
  },
  {
    term: "Reduce",
    patterns: ["reduce", "reduces", "reduced", "reducing"],
    meaning:
      "Let a liquid simmer uncovered until some water evaporates and the flavor concentrates.",
  },
  {
    term: "Poach",
    patterns: ["poach", "poaches", "poached", "poaching"],
    meaning:
      "Cook something gently in liquid that is hot but not bubbling  -  a barely-moving surface.",
  },
  {
    term: "Braise",
    patterns: ["braise", "braises", "braised", "braising"],
    meaning:
      "Brown first, then cook slowly in a little liquid, covered, until very tender.",
  },
  {
    term: "Blanch",
    patterns: ["blanch", "blanches", "blanched", "blanching"],
    meaning:
      "Drop briefly into boiling water, then into cold water, to set color and stop the cooking.",
  },
  {
    term: "Sear",
    patterns: ["sear", "sears", "seared", "searing"],
    meaning:
      "Cook over high heat for a short time to build a deep brown crust on the outside.",
  },
  {
    term: "Caramelize",
    patterns: [
      "caramelize",
      "caramelizes",
      "caramelized",
      "caramelizing",
      "caramelise",
      "caramelised",
      "caramelising",
    ],
    meaning:
      "Cook until the natural sugars turn golden-brown and sweet  -  onions, for example, take time.",
  },
  {
    term: "Render",
    patterns: ["render", "renders", "rendered", "rendering"],
    meaning:
      "Melt the fat out of a piece of meat slowly so it bastes what is cooking and leaves a crisp edge.",
  },
  {
    term: "Sweat",
    patterns: ["sweat", "sweats", "sweated", "sweating"],
    meaning:
      "Cook vegetables low and slow with a pinch of salt until soft and translucent, never brown.",
  },
  {
    term: "Temper",
    patterns: ["temper", "tempers", "tempered", "tempering"],
    meaning:
      "Warm something delicate (eggs, dairy) by adding a little hot liquid first so it does not curdle when combined.",
  },
  {
    term: "Bloom",
    patterns: ["bloom", "blooms", "bloomed", "blooming"],
    meaning:
      "Briefly heat whole spices in oil to release their aroma before anything else goes in.",
  },
  {
    term: "Fold",
    patterns: ["fold", "folds", "folded", "folding"],
    meaning:
      "Combine gently from the bottom up with a spatula so you keep the air in  -  do not stir.",
  },
  {
    term: "Whisk",
    patterns: ["whisk", "whisks", "whisked", "whisking"],
    meaning: "Beat with quick wrist motion to mix, add air, or break up lumps.",
  },
  {
    term: "Emulsify",
    patterns: ["emulsify", "emulsifies", "emulsified", "emulsifying"],
    meaning:
      "Whisk oil into a watery liquid in a steady stream so they become one smooth sauce.",
  },
  {
    term: "Julienne",
    patterns: ["julienne", "julienned", "juliennes", "julienning"],
    meaning: "Cut into thin matchstick strips about the length of your thumb.",
  },
  {
    term: "Chiffonade",
    patterns: ["chiffonade", "chiffonades", "chiffonaded"],
    meaning:
      "Stack leaves, roll them into a cigar, and slice across into thin ribbons.",
  },
  {
    term: "Mince",
    patterns: ["mince", "minces", "minced", "mincing"],
    meaning:
      "Chop as finely as you can  -  smaller than dice, almost a paste for garlic.",
  },
  {
    term: "Dice",
    patterns: ["dice", "dices", "diced", "dicing"],
    meaning: "Cut into even small cubes, usually about the size of a pea.",
  },
  {
    term: "Zest",
    patterns: ["zest", "zests", "zested", "zesting"],
    meaning:
      "Grate only the colorful outer layer of a citrus peel  -  avoid the bitter white pith underneath.",
  },
  {
    term: "Al dente",
    patterns: ["al dente"],
    meaning:
      "Cooked through but with a little firmness left  -  pasta should still have a gentle bite.",
  },
  {
    term: "Score",
    patterns: ["score", "scores", "scored", "scoring"],
    meaning:
      "Make shallow cuts across the surface so fat renders, marinade sinks in, or the skin does not curl.",
  },
  {
    term: "Rest",
    patterns: ["rest", "rests", "resting"],
    meaning:
      "Leave cooked meat alone off the heat for a few minutes so the juices settle back inside before you cut.",
  },
  {
    term: "Toast",
    patterns: [
      "toast",
      "toasts",
      "toasted",
      "toasting",
      "dry-toast",
      "dry toast",
    ],
    meaning:
      "Heat in a dry pan, stirring often, just until fragrant and lightly colored  -  no oil needed.",
  },
  {
    term: "Reserve",
    patterns: ["reserve", "reserves", "reserved", "reserving"],
    meaning:
      "Set aside for later in the same recipe  -  do not throw it out, you will use it soon.",
  },
];

/**
 * Compiled regex matching any glossary pattern with word boundaries.
 * Case-insensitive; Unicode-aware so accented characters behave correctly.
 *
 * Multi-word entries are allowed because `\b` anchors on word-character
 * transitions and spaces sit between two word characters cleanly.
 */
const allPatterns = cookGlossary
  .flatMap((e) => e.patterns)
  // Sort longest-first so "al dente" wins over "dent" or similar overlaps.
  .sort((a, b) => b.length - a.length)
  // Escape nothing  -  all entries are plain words; no regex metacharacters used.
  .join("|");

export const glossaryRegexSource = `\\b(${allPatterns})\\b`;

const patternToEntry = new Map<string, GlossaryEntry>();
for (const e of cookGlossary) {
  for (const p of e.patterns) patternToEntry.set(p.toLowerCase(), e);
}

/** Look up a matched raw word (any case) and return its glossary entry. */
export function lookupTerm(word: string): GlossaryEntry | undefined {
  return patternToEntry.get(word.toLowerCase());
}
