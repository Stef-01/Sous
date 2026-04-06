/**
 * Seed runner — migrates existing sides.json data into the V1 database.
 *
 * Usage: pnpm db:seed
 *
 * This script:
 * 1. Reads all 203 sides from src/data/sides.json
 * 2. Enriches them with V1 schema fields (cuisineFamily, flavorProfile, etc.)
 * 3. Validates each record with Zod
 * 4. Inserts into the side_dishes table
 * 5. Reports success/failure counts
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sideDishes } from "../schema";
import { sideDishSchema, type SideDishInput } from "@/types/side-dish";

// Import existing data
import existingSides from "@/data/sides.json";
import existingMeals from "@/data/meals.json";

type ExistingSide = (typeof existingSides)[number];
type ExistingMeal = (typeof existingMeals)[number];

// ── Enrichment helpers ─────────────────────────────────

/**
 * Derive cuisineFamily from a side's tags.
 */
function deriveCuisineFamily(side: ExistingSide): string {
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

  // Fallback: check name patterns
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

  return "comfort-classic"; // Safe default
}

/**
 * Derive flavorProfile from tags and description.
 */
function deriveFlavorProfile(side: ExistingSide): string[] {
  const tags = side.tags.map((t) => t.toLowerCase());
  const desc = side.description.toLowerCase();
  const reason = side.pairingReason.toLowerCase();
  const profiles: string[] = [];

  // From tags
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

  // From description and pairing reason
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

  // Deduplicate
  const unique = [...new Set(profiles)];
  return unique.length > 0 ? unique : ["savory"];
}

/**
 * Derive temperature from tags and category.
 */
function deriveTemperature(side: ExistingSide): "hot" | "cold" | "room-temp" {
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

/**
 * Compute bestPairedWith from which meals include this side in their sidePool.
 */
function computeBestPairedWith(
  sideId: string,
  meals: ExistingMeal[],
): string[] {
  const paired: string[] = [];
  for (const meal of meals) {
    if (meal.sidePool.includes(sideId)) {
      paired.push(meal.id);
    }
  }
  return paired;
}

/**
 * Estimate prep and cook time from description and tags.
 */
function estimatePrepTime(side: ExistingSide): { prep: number; cook: number } {
  const tags = side.tags.map((t) => t.toLowerCase());

  // No-cook items
  if (
    tags.includes("no-cook") ||
    tags.includes("raw") ||
    tags.includes("fresh")
  ) {
    return { prep: 5, cook: 0 };
  }

  // Quick items
  if (
    tags.includes("salad") ||
    tags.includes("yogurt") ||
    tags.includes("pickled") ||
    tags.includes("condiment")
  ) {
    return { prep: 10, cook: 0 };
  }

  // Fried/baked items
  if (tags.includes("fried") || tags.includes("baked")) {
    return { prep: 10, cook: 15 };
  }

  // Soup
  if (tags.includes("soup")) {
    return { prep: 10, cook: 20 };
  }

  // Bread/grain
  if (
    tags.includes("bread") ||
    tags.includes("grain") ||
    tags.includes("rice")
  ) {
    return { prep: 5, cook: 15 };
  }

  // Stir-fry
  if (tags.includes("stir-fry")) {
    return { prep: 10, cook: 10 };
  }

  // Default
  return { prep: 10, cook: 10 };
}

// ── Main seed function ─────────────────────────────────

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.log("No DATABASE_URL found. Running in validation-only mode.\n");
    return validateOnly();
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log(`Seeding ${existingSides.length} side dishes...\n`);

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const side of existingSides) {
    try {
      const enriched = enrichSide(side);
      const validated = sideDishSchema.parse(enriched);

      await db.insert(sideDishes).values({
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        cuisineFamily: validated.cuisineFamily,
        prepTimeMinutes: validated.prepTimeMinutes,
        cookTimeMinutes: validated.cookTimeMinutes,
        skillLevel: validated.skillLevel,
        flavorProfile: validated.flavorProfile,
        temperature: validated.temperature,
        proteinGrams: validated.proteinGrams ?? null,
        fiberGrams: validated.fiberGrams ?? null,
        caloriesPerServing: validated.caloriesPerServing ?? null,
        heroImageUrl: validated.heroImageUrl ?? null,
        bestPairedWith: validated.bestPairedWith,
        tags: validated.tags,
        pairingReason: validated.pairingReason ?? null,
        nutritionCategory: validated.nutritionCategory ?? null,
      });

      success++;
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${side.id}: ${message}`);
    }
  }

  console.log(`Done! ${success} succeeded, ${failed} failed.\n`);
  if (errors.length > 0) {
    console.log("Errors:");
    for (const err of errors) {
      console.log(`  - ${err}`);
    }
  }
}

function validateOnly() {
  console.log(`Validating ${existingSides.length} side dishes (no DB)...\n`);

  let valid = 0;
  let invalid = 0;
  const errors: string[] = [];

  for (const side of existingSides) {
    try {
      const enriched = enrichSide(side);
      sideDishSchema.parse(enriched);
      valid++;
    } catch (err) {
      invalid++;
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${side.id}: ${message}`);
    }
  }

  console.log(`Validation: ${valid} valid, ${invalid} invalid.\n`);
  if (errors.length > 0) {
    console.log("Errors:");
    for (const err of errors.slice(0, 10)) {
      console.log(`  - ${err}`);
    }
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more`);
    }
  }
}

function normalizeNutritionCategory(
  cat: string,
): "protein" | "carb" | "vegetable" {
  const valid = ["protein", "carb", "vegetable"];
  if (valid.includes(cat)) return cat as "protein" | "carb" | "vegetable";
  // Map non-standard categories
  if (cat === "dairy") return "protein"; // dairy is protein-adjacent
  return "vegetable"; // safe default
}

function enrichSide(side: ExistingSide): SideDishInput {
  const times = estimatePrepTime(side);
  return {
    name: side.name,
    slug: side.id,
    description: side.description,
    cuisineFamily: deriveCuisineFamily(side),
    prepTimeMinutes: times.prep,
    cookTimeMinutes: times.cook,
    skillLevel: "beginner", // Default; will be refined per dish
    flavorProfile: deriveFlavorProfile(side),
    temperature: deriveTemperature(side),
    proteinGrams: null,
    fiberGrams: null,
    caloriesPerServing: null,
    heroImageUrl: side.imageUrl,
    bestPairedWith: computeBestPairedWith(
      side.id,
      existingMeals as ExistingMeal[],
    ),
    tags: side.tags,
    pairingReason: side.pairingReason,
    nutritionCategory: normalizeNutritionCategory(side.nutritionCategory),
  };
}

seed().catch(console.error);
