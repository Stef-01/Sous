import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";
import { parseCraving } from "@/lib/ai/craving-parser";
import { suggestSides } from "@/lib/engine/pairing-engine";
import {
  getAvailableCookSlugs,
  getAvailableMealCookSlugs,
} from "@/data/guided-cook-steps";
import { resolveMealSlug } from "@/data/index";
import type { SideDishCandidate } from "@/lib/engine/types";
import {
  inferDietaryFlags,
  satisfiesDietaryRequirement,
} from "@/lib/engine/dietary-inferer";

// Import static data as fallback (until DB is seeded)
import existingSides from "@/data/sides.json";
import existingMeals from "@/data/meals.json";

/**
 * Convert existing sides.json data into engine candidate format.
 */
function buildCandidatesFromStatic(): SideDishCandidate[] {
  // Build bestPairedWith lookup
  const pairedWith = new Map<string, string[]>();
  for (const meal of existingMeals) {
    for (const sideId of meal.sidePool) {
      const existing = pairedWith.get(sideId) ?? [];
      existing.push(meal.id);
      pairedWith.set(sideId, existing);
    }
  }

  return existingSides.map((side) => ({
    id: side.id,
    slug: side.id,
    name: side.name,
    cuisineFamily: deriveCuisineFromTags(side.tags),
    prepTimeMinutes: 10, // default estimate
    cookTimeMinutes: 10,
    skillLevel: "beginner",
    flavorProfile: deriveFlavorFromTags(side.tags, side.description),
    temperature: deriveTemperature(side.tags, side.description),
    proteinGrams: null,
    fiberGrams: null,
    caloriesPerServing: null,
    bestPairedWith: pairedWith.get(side.id) ?? [],
    tags: side.tags,
    pairingReason: side.pairingReason,
    nutritionCategory:
      side.nutritionCategory === "dairy" ? "protein" : side.nutritionCategory,
    // W37: derive dietary flags from tags + description so the
    // household table aggregate can hard-filter candidates.
    dietaryFlags: inferDietaryFlags({
      tags: side.tags,
      description: side.description,
    }),
  }));
}

function deriveCuisineFromTags(tags: string[]): string {
  const t = new Set(tags.map((s) => s.toLowerCase()));
  if (t.has("indian")) return "indian";
  if (t.has("japanese")) return "japanese";
  if (t.has("korean")) return "korean";
  if (t.has("thai")) return "thai";
  if (t.has("chinese")) return "chinese";
  if (t.has("vietnamese")) return "vietnamese";
  if (t.has("filipino")) return "filipino";
  if (t.has("italian")) return "italian";
  if (t.has("mexican")) return "mexican";
  if (t.has("mediterranean") || t.has("greek")) return "mediterranean";
  return "comfort-classic";
}

function deriveFlavorFromTags(tags: string[], desc: string): string[] {
  const flavors: string[] = [];
  const lower = desc.toLowerCase();
  const t = new Set(tags.map((s) => s.toLowerCase()));
  if (t.has("fresh") || t.has("salad")) flavors.push("fresh");
  if (t.has("crispy") || t.has("crunchy")) flavors.push("crunchy");
  if (t.has("spicy")) flavors.push("spicy");
  if (t.has("yogurt") || t.has("creamy")) flavors.push("creamy");
  if (t.has("fried")) flavors.push("rich");
  if (lower.includes("bright")) flavors.push("bright");
  if (lower.includes("herb") || lower.includes("cilantro"))
    flavors.push("herby");
  if (lower.includes("cool")) flavors.push("cooling");
  if (lower.includes("warm") || lower.includes("comfort")) flavors.push("warm");
  return flavors.length > 0 ? flavors : ["savory"];
}

function deriveTemperature(tags: string[], desc: string): string {
  const t = new Set(tags.map((s) => s.toLowerCase()));
  if (t.has("salad") || t.has("fresh") || t.has("pickled") || t.has("yogurt"))
    return "cold";
  if (
    t.has("soup") ||
    t.has("baked") ||
    t.has("fried") ||
    t.has("warm") ||
    t.has("stir-fry")
  )
    return "hot";
  if (
    desc.toLowerCase().includes("cold") ||
    desc.toLowerCase().includes("chilled")
  )
    return "cold";
  if (desc.toLowerCase().includes("hot") || desc.toLowerCase().includes("warm"))
    return "hot";
  return "room-temp";
}

// Cache candidates so we don't rebuild every request
let _candidateCache: SideDishCandidate[] | null = null;
function getCandidates(): SideDishCandidate[] {
  if (!_candidateCache) {
    _candidateCache = buildCandidatesFromStatic();
  }
  return _candidateCache;
}

export const pairingRouter = router({
  suggest: publicProcedure
    .input(
      z.object({
        mainDish: z.string(),
        inputMode: z.enum(["text", "camera"]),
        cuisineHint: z.string().optional(),
        /** Busts TanStack Query cache when the client rerolls; ignored on the server. */
        _rerollSeed: z.number().optional(),
        userPreferences: z.record(z.number()).optional(),
        /** W30 pairing-engine V2 — per-user weight vector trained
         *  client-side from cook history. Validated as positive
         *  numbers; the engine itself defaults to DEFAULT_WEIGHTS
         *  when this field is absent. */
        userWeights: z.record(z.number().nonnegative()).optional(),
        /** W37 household dietary constraints — union of dietary
         *  flags across the "who's at the table" selection on
         *  /today. Engine hard-filters candidates whose
         *  dietaryFlags don't include every entry here. */
        householdDietaryFlags: z.array(z.string()).max(20).optional(),
        effortTolerance: z.enum(["minimal", "moderate", "willing"]).optional(),
      }),
    )
    .query(async ({ input }) => {
      // 1. Parse craving text into structured intent
      const parseResult = await parseCraving(input.mainDish);
      if (!parseResult.success) {
        return { success: false as const, error: parseResult.error, sides: [] };
      }

      const intent = parseResult.data;

      // Add cuisine hint if provided (from camera recognition)
      if (
        input.cuisineHint &&
        !intent.cuisineSignals.includes(input.cuisineHint)
      ) {
        intent.cuisineSignals.unshift(input.cuisineHint);
      }

      // Override effort tolerance from quiz if provided
      if (input.effortTolerance) {
        intent.effortTolerance = input.effortTolerance;
      }

      // 2. Run pairing engine (with optional user preferences from
      // coach quiz + W30 V2 trained weight vector + W37 household
      // dietary constraints if the client provided them).
      const allCandidates = getCandidates();
      const householdRequired = input.householdDietaryFlags ?? [];
      const candidates =
        householdRequired.length > 0
          ? allCandidates.filter((c) =>
              satisfiesDietaryRequirement(c.dietaryFlags, householdRequired),
            )
          : allCandidates;
      const result = suggestSides(
        intent,
        candidates,
        input.userPreferences,
        input.userWeights,
      );

      if (!result.success) {
        return { success: false as const, error: result.error, sides: [] };
      }

      // 3. Return top 3 with explanations
      const cookSlugs = new Set(getAvailableCookSlugs());

      // Resolve main dish to a meal slug for combined cook navigation.
      // Try the parsed intent's dish name first (more precise), then raw input as fallback.
      const mealCookSlugs = new Set(getAvailableMealCookSlugs());
      const resolvedMealSlug =
        resolveMealSlug(intent.dishName) ?? resolveMealSlug(input.mainDish);
      const mainHasGuidedCook =
        resolvedMealSlug !== null && mealCookSlugs.has(resolvedMealSlug);

      return {
        success: true as const,
        intent,
        intentParseSource: parseResult.source,
        resolvedMealSlug: mainHasGuidedCook ? resolvedMealSlug : null,
        sides: result.data.sides.map((s) => ({
          id: s.sideDish.id,
          slug: s.sideDish.slug,
          name: s.sideDish.name,
          cuisineFamily: s.sideDish.cuisineFamily,
          tags: s.sideDish.tags,
          pairingReason: s.sideDish.pairingReason,
          nutritionCategory: s.sideDish.nutritionCategory,
          explanation: s.explanation,
          totalScore: s.totalScore,
          scores: s.scores,
          // Include image and description from original data
          imageUrl:
            existingSides.find((es) => es.id === s.sideDish.id)?.imageUrl ?? "",
          description:
            existingSides.find((es) => es.id === s.sideDish.id)?.description ??
            "",
          // Whether guided cook steps exist for this dish
          hasGuidedCook: cookSlugs.has(s.sideDish.slug),
        })),
      };
    }),

  /**
   * Reroll a single side  -  returns 1 replacement excluding specified IDs.
   */
  rerollSide: publicProcedure
    .input(
      z.object({
        mainDish: z.string(),
        excludeIds: z.array(z.string()),
        cuisineHint: z.string().optional(),
        userPreferences: z.record(z.number()).optional(),
        userWeights: z.record(z.number().nonnegative()).optional(),
        householdDietaryFlags: z.array(z.string()).max(20).optional(),
        effortTolerance: z.enum(["minimal", "moderate", "willing"]).optional(),
      }),
    )
    .query(async ({ input }) => {
      const parseResult = await parseCraving(input.mainDish);
      if (!parseResult.success) {
        return {
          success: false as const,
          error: parseResult.error,
          side: null,
        };
      }

      const intent = parseResult.data;
      if (
        input.cuisineHint &&
        !intent.cuisineSignals.includes(input.cuisineHint)
      ) {
        intent.cuisineSignals.unshift(input.cuisineHint);
      }
      if (input.effortTolerance) {
        intent.effortTolerance = input.effortTolerance;
      }

      const excludeSet = new Set(input.excludeIds);
      const householdRequired = input.householdDietaryFlags ?? [];
      const candidates = getCandidates().filter(
        (c) =>
          !excludeSet.has(c.id) &&
          satisfiesDietaryRequirement(c.dietaryFlags, householdRequired),
      );
      const result = suggestSides(
        intent,
        candidates,
        input.userPreferences,
        input.userWeights,
        1,
      );

      if (!result.success || result.data.sides.length === 0) {
        return {
          success: false as const,
          error: "No more alternatives available",
          side: null,
        };
      }

      const cookSlugs = new Set(getAvailableCookSlugs());
      const s = result.data.sides[0];

      return {
        success: true as const,
        intentParseSource: parseResult.source,
        side: {
          id: s.sideDish.id,
          slug: s.sideDish.slug,
          name: s.sideDish.name,
          cuisineFamily: s.sideDish.cuisineFamily,
          tags: s.sideDish.tags,
          pairingReason: s.sideDish.pairingReason,
          nutritionCategory: s.sideDish.nutritionCategory,
          explanation: s.explanation,
          totalScore: s.totalScore,
          scores: s.scores,
          imageUrl:
            existingSides.find((es: { id: string }) => es.id === s.sideDish.id)
              ?.imageUrl ?? "",
          description:
            existingSides.find((es: { id: string }) => es.id === s.sideDish.id)
              ?.description ?? "",
          hasGuidedCook: cookSlugs.has(s.sideDish.slug),
        },
      };
    }),
});
