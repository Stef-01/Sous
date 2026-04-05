import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";
import { parseCraving } from "@/lib/ai/craving-parser";
import { suggestSides } from "@/lib/engine/pairing-engine";
import { getAvailableCookSlugs } from "@/data/guided-cook-steps";
import type { SideDishCandidate } from "@/lib/engine/types";

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
    nutritionCategory: side.nutritionCategory === "dairy" ? "protein" : side.nutritionCategory,
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
  if (lower.includes("herb") || lower.includes("cilantro")) flavors.push("herby");
  if (lower.includes("cool")) flavors.push("cooling");
  if (lower.includes("warm") || lower.includes("comfort")) flavors.push("warm");
  return flavors.length > 0 ? flavors : ["savory"];
}

function deriveTemperature(tags: string[], desc: string): string {
  const t = new Set(tags.map((s) => s.toLowerCase()));
  if (t.has("salad") || t.has("fresh") || t.has("pickled") || t.has("yogurt")) return "cold";
  if (t.has("soup") || t.has("baked") || t.has("fried") || t.has("warm") || t.has("stir-fry")) return "hot";
  if (desc.toLowerCase().includes("cold") || desc.toLowerCase().includes("chilled")) return "cold";
  if (desc.toLowerCase().includes("hot") || desc.toLowerCase().includes("warm")) return "hot";
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
      })
    )
    .query(async ({ input }) => {
      // 1. Parse craving text into structured intent
      const parseResult = await parseCraving(input.mainDish);
      if (!parseResult.success) {
        return { success: false as const, error: parseResult.error, sides: [] };
      }

      const intent = parseResult.data;

      // Add cuisine hint if provided (from camera recognition)
      if (input.cuisineHint && !intent.cuisineSignals.includes(input.cuisineHint)) {
        intent.cuisineSignals.unshift(input.cuisineHint);
      }

      // 2. Run pairing engine
      const candidates = getCandidates();
      const result = suggestSides(intent, candidates);

      if (!result.success) {
        return { success: false as const, error: result.error, sides: [] };
      }

      // 3. Return top 3 with explanations
      const cookSlugs = new Set(getAvailableCookSlugs());

      return {
        success: true as const,
        intent,
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
          imageUrl: existingSides.find((es) => es.id === s.sideDish.id)?.imageUrl ?? "",
          description: existingSides.find((es) => es.id === s.sideDish.id)?.description ?? "",
          // Whether guided cook steps exist for this dish
          hasGuidedCook: cookSlugs.has(s.sideDish.slug),
        })),
      };
    }),

  explain: publicProcedure
    .input(z.object({ sideDishId: z.string(), mainDish: z.string() }))
    .query(async ({ input }) => {
      // Parse intent for this main dish
      const parseResult = await parseCraving(input.mainDish);
      if (!parseResult.success) {
        return { explanation: "Great pairing for your meal." };
      }

      // Find this specific side and re-score
      const candidates = getCandidates();
      const side = candidates.find((c) => c.id === input.sideDishId);
      if (!side) {
        return { explanation: "Great pairing for your meal." };
      }

      const result = suggestSides(parseResult.data, [side]);
      if (result.success && result.data.sides.length > 0) {
        return { explanation: result.data.sides[0].explanation };
      }

      return { explanation: "Great pairing for your meal." };
    }),
});
