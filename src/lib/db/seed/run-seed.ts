/**
 * Founder seed runner  -  `pnpm db:seed`.
 *
 * Loads the local catalog (sides.json / meals.json) + guided-cook
 * data, builds rows with the shared pure builder, and writes them to
 * Postgres via Drizzle + postgres-js. Idempotent: side_dishes/meals
 * upsert on their natural keys; cook_steps + ingredients are cleared
 * and reinserted (they have no natural key).
 *
 * Requires DATABASE_URL (the Supabase connection string). Without it,
 * the script runs in count-only mode and prints what *would* be
 * seeded — see docs/SUPABASE-SETUP.md for the one-line wire-up.
 *
 * The same content is already live in the provisioned project; this
 * script exists so the founder can re-seed a fresh branch/clone.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import {
  sideDishes,
  meals as mealsTable,
  cookSteps,
  ingredients,
} from "../schema";
import {
  buildSideDishRows,
  buildMealRows,
  buildCookContent,
} from "./build-seed";
import { guidedCookData } from "../../../data/guided-cook-steps";

const root = process.cwd();
const readJson = (p: string) =>
  JSON.parse(readFileSync(resolve(root, p), "utf8"));
const sides = readJson("src/data/sides.json");
const meals = readJson("src/data/meals.json");

const sideRows = buildSideDishRows(sides, meals);
const mealRows = buildMealRows(meals);

async function seed() {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;
  if (!url) {
    console.log(
      `No DATABASE_URL/POSTGRES_URL set — count-only mode.\nWould seed: side_dishes=${sideRows.length} meals=${mealRows.length}\nSee docs/SUPABASE-SETUP.md to wire up the connection string.`,
    );
    return;
  }

  const client = postgres(url, { prepare: false });
  const db = drizzle(client, {
    schema: { sideDishes, meals: mealsTable, cookSteps, ingredients },
  });

  console.log("Seeding side_dishes + meals…");
  for (const r of sideRows) {
    await db
      .insert(sideDishes)
      .values({
        name: r.name,
        slug: r.slug,
        description: r.description,
        cuisineFamily: r.cuisineFamily,
        prepTimeMinutes: r.prepTimeMinutes,
        cookTimeMinutes: r.cookTimeMinutes,
        skillLevel: r.skillLevel,
        flavorProfile: r.flavorProfile,
        temperature: r.temperature,
        proteinGrams: r.proteinGrams,
        fiberGrams: r.fiberGrams,
        caloriesPerServing: r.caloriesPerServing,
        heroImageUrl: r.heroImageUrl,
        bestPairedWith: r.bestPairedWith,
        tags: r.tags,
        pairingReason: r.pairingReason,
        nutritionCategory: r.nutritionCategory,
      })
      .onConflictDoNothing({ target: sideDishes.slug });
  }
  for (const r of mealRows) {
    await db
      .insert(mealsTable)
      .values({
        id: r.id,
        name: r.name,
        aliases: r.aliases,
        heroImageUrl: r.heroImageUrl,
        sidePool: r.sidePool,
        cuisine: r.cuisine,
        description: r.description,
        nourishVerified: r.nourishVerified,
      })
      .onConflictDoNothing({ target: mealsTable.id });
  }

  // Resolve slug → id, then (re)seed cook_steps + ingredients.
  const seeded = await db
    .select({ id: sideDishes.id, slug: sideDishes.slug })
    .from(sideDishes);
  const idBySlug = new Map(seeded.map((s) => [s.slug, s.id]));
  const validSlugs = new Set(idBySlug.keys());
  const { steps, ingredients: ings } = buildCookContent(
    guidedCookData,
    validSlugs,
  );

  console.log("Re-seeding cook_steps + ingredients…");
  // Clear authored content only for the dishes we are about to seed.
  for (const slug of new Set(steps.map((s) => s.slug))) {
    const id = idBySlug.get(slug)!;
    await db.delete(cookSteps).where(eq(cookSteps.sideDishId, id));
    await db.delete(ingredients).where(eq(ingredients.sideDishId, id));
  }
  for (const s of steps) {
    await db.insert(cookSteps).values({
      sideDishId: idBySlug.get(s.slug)!,
      phase: s.phase,
      stepNumber: s.stepNumber,
      instruction: s.instruction,
      timerSeconds: s.timerSeconds,
      mistakeWarning: s.mistakeWarning,
      quickHack: s.quickHack,
      cuisineFact: s.cuisineFact,
      donenessCue: s.donenessCue,
      imageUrl: s.imageUrl,
    });
  }
  for (const i of ings) {
    await db.insert(ingredients).values({
      sideDishId: idBySlug.get(i.slug)!,
      name: i.name,
      quantity: i.quantity,
      isOptional: i.isOptional,
      substitution: i.substitution,
    });
  }

  console.log(
    `Done. side_dishes=${sideRows.length} meals=${mealRows.length} cook_steps=${steps.length} ingredients=${ings.length}`,
  );
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
