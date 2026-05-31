/**
 * Pure seed-row builders.
 *
 * Zero I/O, zero external deps (no zod, no `@/` aliases) so the
 * module runs identically under `tsx` (founder `pnpm db:seed`) and
 * under Node's native `--experimental-strip-types` (the offline SQL
 * generator that seeds via the Supabase MCP). The caller supplies
 * the already-parsed data; this module only transforms it.
 *
 * The side-dish enrichment mirrors the original `run-seed.ts`
 * heuristics verbatim so the catalog is identical regardless of
 * which path writes it.
 */

// ── Input shapes (subset of sides.json / meals.json) ──────────

export interface RawSide {
  id: string;
  name: string;
  imageUrl: string | null;
  tags: string[];
  description: string;
  pairingReason: string;
  nutritionCategory: string;
  nourishVerified?: boolean;
}

export interface RawMeal {
  id: string;
  name: string;
  aliases: string[];
  heroImageUrl: string | null;
  sidePool: string[];
  cuisine: string;
  description: string;
  nourishVerified?: boolean;
}

/** Shape of `guidedCookData` / `guidedCookMeals` values. */
export interface StaticDishData {
  name: string;
  slug: string;
  description: string;
  cuisineFamily: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  skillLevel: string;
  heroImageUrl: string | null;
  flavorProfile: string[];
  temperature: string;
  ingredients: {
    id: string;
    name: string;
    quantity: string;
    isOptional: boolean;
    substitution: string | null;
  }[];
  steps: {
    phase: string;
    stepNumber: number;
    instruction: string;
    timerSeconds: number | null;
    mistakeWarning: string | null;
    quickHack: string | null;
    cuisineFact: string | null;
    donenessCue: string | null;
    imageUrl: string | null;
  }[];
}

// ── Output row shapes (camelCase; mapped to snake_case in SQL) ─

export interface SideDishRow {
  name: string;
  slug: string;
  description: string;
  cuisineFamily: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  skillLevel: string;
  flavorProfile: string[];
  temperature: string;
  proteinGrams: number | null;
  fiberGrams: number | null;
  caloriesPerServing: number | null;
  heroImageUrl: string | null;
  bestPairedWith: string[];
  tags: string[];
  pairingReason: string | null;
  nutritionCategory: string | null;
}

export interface MealRow {
  id: string;
  name: string;
  aliases: string[];
  heroImageUrl: string | null;
  sidePool: string[];
  cuisine: string;
  description: string;
  nourishVerified: boolean;
}

export interface CookStepRow {
  slug: string;
  phase: string;
  stepNumber: number;
  instruction: string;
  timerSeconds: number | null;
  mistakeWarning: string | null;
  quickHack: string | null;
  cuisineFact: string | null;
  donenessCue: string | null;
  imageUrl: string | null;
}

export interface IngredientRow {
  slug: string;
  name: string;
  quantity: string;
  isOptional: boolean;
  substitution: string | null;
}

// ── Enrichment heuristics (ported verbatim from run-seed.ts) ───

function deriveCuisineFamily(side: RawSide): string {
  const tagSet = new Set(side.tags.map((t) => t.toLowerCase()));
  if (tagSet.has("indian") || tagSet.has("south-asian")) return "indian";
  if (tagSet.has("japanese")) return "japanese";
  if (tagSet.has("korean")) return "korean";
  if (tagSet.has("thai")) return "thai";
  if (tagSet.has("chinese")) return "chinese";
  if (tagSet.has("vietnamese")) return "vietnamese";
  if (tagSet.has("filipino")) return "filipino";
  if (tagSet.has("italian")) return "italian";
  if (tagSet.has("mexican")) return "mexican";
  if (
    tagSet.has("mediterranean") ||
    tagSet.has("greek") ||
    tagSet.has("middle-eastern")
  )
    return "mediterranean";
  if (tagSet.has("american") || tagSet.has("comfort")) return "comfort-classic";

  const name = side.name.toLowerCase();
  if (
    name.includes("kimchi") ||
    name.includes("namul") ||
    name.includes("gochujang")
  )
    return "korean";
  if (name.includes("miso") || name.includes("dashi") || name.includes("soba"))
    return "japanese";
  if (
    name.includes("wonton") ||
    name.includes("bok choy") ||
    name.includes("mapo")
  )
    return "chinese";
  if (name.includes("pho") || name.includes("banh") || name.includes("goi"))
    return "vietnamese";
  if (name.includes("som tum") || name.includes("pad") || name.includes("tod"))
    return "thai";
  return "comfort-classic";
}

function deriveFlavorProfile(side: RawSide): string[] {
  const tags = side.tags.map((t) => t.toLowerCase());
  const desc = side.description.toLowerCase();
  const reason = side.pairingReason.toLowerCase();
  const profiles: string[] = [];

  if (tags.includes("fresh") || tags.includes("salad")) profiles.push("fresh");
  if (tags.includes("crispy") || tags.includes("crunchy"))
    profiles.push("crunchy");
  if (tags.includes("spicy")) profiles.push("spicy");
  if (tags.includes("fermented") || tags.includes("pickled"))
    profiles.push("tangy");
  if (tags.includes("sweet")) profiles.push("sweet");
  if (tags.includes("savory")) profiles.push("savory");
  if (tags.includes("fried")) profiles.push("rich");
  if (tags.includes("yogurt") || tags.includes("creamy"))
    profiles.push("creamy");

  if (desc.includes("bright") || reason.includes("bright"))
    profiles.push("bright");
  if (
    desc.includes("herb") ||
    desc.includes("cilantro") ||
    desc.includes("mint")
  )
    profiles.push("herby");
  if (desc.includes("cool") || reason.includes("cool"))
    profiles.push("cooling");
  if (
    desc.includes("tangy") ||
    desc.includes("sour") ||
    desc.includes("vinegar")
  )
    profiles.push("tangy");
  if (
    desc.includes("rich") ||
    desc.includes("buttery") ||
    reason.includes("rich")
  )
    profiles.push("rich");
  if (desc.includes("warm") || desc.includes("comforting"))
    profiles.push("warm");
  if (desc.includes("light") || reason.includes("light"))
    profiles.push("light");
  if (desc.includes("crisp") || reason.includes("crunch"))
    profiles.push("crunchy");

  const unique = [...new Set(profiles)];
  return unique.length > 0 ? unique : ["savory"];
}

function deriveTemperature(side: RawSide): "hot" | "cold" | "room-temp" {
  const tags = side.tags.map((t) => t.toLowerCase());
  const desc = side.description.toLowerCase();
  if (
    tags.includes("salad") ||
    tags.includes("fresh") ||
    tags.includes("pickled") ||
    tags.includes("yogurt")
  )
    return "cold";
  if (
    tags.includes("soup") ||
    tags.includes("baked") ||
    tags.includes("fried") ||
    tags.includes("warm") ||
    tags.includes("stir-fry")
  )
    return "hot";
  if (
    desc.includes("cold") ||
    desc.includes("chilled") ||
    desc.includes("refreshing")
  )
    return "cold";
  if (
    desc.includes("hot") ||
    desc.includes("warm") ||
    desc.includes("toasted") ||
    desc.includes("steamed") ||
    desc.includes("grilled")
  )
    return "hot";
  return "room-temp";
}

function estimatePrepTime(side: RawSide): { prep: number; cook: number } {
  const tags = side.tags.map((t) => t.toLowerCase());
  if (
    tags.includes("no-cook") ||
    tags.includes("raw") ||
    tags.includes("fresh")
  )
    return { prep: 5, cook: 0 };
  if (
    tags.includes("salad") ||
    tags.includes("yogurt") ||
    tags.includes("pickled") ||
    tags.includes("condiment")
  )
    return { prep: 10, cook: 0 };
  if (tags.includes("fried") || tags.includes("baked"))
    return { prep: 10, cook: 15 };
  if (tags.includes("soup")) return { prep: 10, cook: 20 };
  if (tags.includes("bread") || tags.includes("grain") || tags.includes("rice"))
    return { prep: 5, cook: 15 };
  if (tags.includes("stir-fry")) return { prep: 10, cook: 10 };
  return { prep: 10, cook: 10 };
}

function computeBestPairedWith(sideId: string, meals: RawMeal[]): string[] {
  const paired: string[] = [];
  for (const meal of meals) {
    if (meal.sidePool.includes(sideId)) paired.push(meal.id);
  }
  return paired;
}

function normalizeNutritionCategory(
  cat: string,
): "protein" | "carb" | "vegetable" {
  const valid = ["protein", "carb", "vegetable"];
  if (valid.includes(cat)) return cat as "protein" | "carb" | "vegetable";
  if (cat === "dairy") return "protein";
  return "vegetable";
}

// ── Row builders ──────────────────────────────────────────────

export function buildSideDishRows(
  sides: RawSide[],
  meals: RawMeal[],
): SideDishRow[] {
  return sides.map((side) => {
    const times = estimatePrepTime(side);
    return {
      name: side.name,
      slug: side.id,
      description: side.description,
      cuisineFamily: deriveCuisineFamily(side),
      prepTimeMinutes: times.prep,
      cookTimeMinutes: times.cook,
      skillLevel: "beginner",
      flavorProfile: deriveFlavorProfile(side),
      temperature: deriveTemperature(side),
      proteinGrams: null,
      fiberGrams: null,
      caloriesPerServing: null,
      heroImageUrl: side.imageUrl ?? null,
      bestPairedWith: computeBestPairedWith(side.id, meals),
      tags: side.tags,
      pairingReason: side.pairingReason ?? null,
      nutritionCategory: normalizeNutritionCategory(side.nutritionCategory),
    };
  });
}

export function buildMealRows(meals: RawMeal[]): MealRow[] {
  return meals.map((meal) => ({
    id: meal.id,
    name: meal.name,
    aliases: meal.aliases ?? [],
    heroImageUrl: meal.heroImageUrl ?? null,
    sidePool: meal.sidePool ?? [],
    cuisine: meal.cuisine,
    description: meal.description,
    nourishVerified: Boolean(meal.nourishVerified),
  }));
}

/**
 * Build cook_steps + ingredients rows from the guided-cook data,
 * keyed by side-dish slug. Only slugs that exist in `side_dishes`
 * will actually insert (the SQL join filters the rest), so passing
 * extra slugs is harmless.
 */
export function buildCookContent(
  guided: Record<string, StaticDishData>,
  validSlugs: ReadonlySet<string>,
): { steps: CookStepRow[]; ingredients: IngredientRow[] } {
  const steps: CookStepRow[] = [];
  const ingredients: IngredientRow[] = [];

  for (const [slug, dish] of Object.entries(guided)) {
    if (!validSlugs.has(slug)) continue;
    for (const s of dish.steps) {
      steps.push({
        slug,
        phase: s.phase ?? "cook",
        stepNumber: s.stepNumber,
        instruction: s.instruction,
        timerSeconds: s.timerSeconds ?? null,
        mistakeWarning: s.mistakeWarning ?? null,
        quickHack: s.quickHack ?? null,
        cuisineFact: s.cuisineFact ?? null,
        donenessCue: s.donenessCue ?? null,
        imageUrl: s.imageUrl ?? null,
      });
    }
    for (const i of dish.ingredients) {
      ingredients.push({
        slug,
        name: i.name,
        quantity: i.quantity,
        isOptional: Boolean(i.isOptional),
        substitution: i.substitution ?? null,
      });
    }
  }

  return { steps, ingredients };
}
