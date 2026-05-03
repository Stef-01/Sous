/**
 * Recipe-authoring templates — a curated list of seed recipes
 * the user can fork as a starting point.
 *
 * W43 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint I content
 * polish). Each entry is a thin display manifest — just slug,
 * name, cuisine, and a short pitch. The actual seed data is
 * loaded on demand when the user lands on
 * /path/recipes/new?fork=<slug>; this manifest stays in the
 * /path/recipes bundle without dragging the full guided-cook-
 * steps catalog along with it.
 *
 * Slugs MUST match seed-catalog ids in
 * `src/data/guided-cook-steps.ts`. A test verifies this so a
 * silent typo doesn't ship a dead template card.
 */

export interface RecipeTemplate {
  slug: string;
  name: string;
  cuisine: string;
  pitch: string;
}

export const RECIPE_TEMPLATES: ReadonlyArray<RecipeTemplate> = [
  {
    slug: "caesar-salad",
    name: "Caesar Salad",
    cuisine: "italian",
    pitch: "Crisp romaine, garlic croutons, anchovy-Parmesan dressing.",
  },
  {
    slug: "garlic-bread",
    name: "Garlic Bread",
    cuisine: "italian",
    pitch: "Toasted baguette, herb-garlic butter, golden edges.",
  },
  {
    slug: "guacamole",
    name: "Guacamole",
    cuisine: "mexican",
    pitch: "Hand-mashed avocado, lime, cilantro, finely diced onion.",
  },
  {
    slug: "miso-soup",
    name: "Miso Soup",
    cuisine: "japanese",
    pitch: "Dashi base, soft tofu, scallion, restrained miso bloom.",
  },
  {
    slug: "tabbouleh",
    name: "Tabbouleh",
    cuisine: "mediterranean",
    pitch: "Bulgur, parsley, mint, lemon-bright, olive-oil rich.",
  },
  {
    slug: "aloo-gobi",
    name: "Aloo Gobi",
    cuisine: "indian",
    pitch: "Potato + cauliflower, turmeric-cumin tempered, dry curry.",
  },
];
