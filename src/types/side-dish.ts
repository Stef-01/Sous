import { z } from "zod";

/**
 * Zod schema for a V1 side dish — source of truth for the SideDish type.
 * Used for seed data validation and API input/output.
 */
export const sideDishSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  cuisineFamily: z.string().min(1),
  prepTimeMinutes: z.number().int().min(0),
  cookTimeMinutes: z.number().int().min(0),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  flavorProfile: z.array(z.string()).min(1),
  temperature: z.enum(["hot", "cold", "room-temp"]),
  proteinGrams: z.number().nullable().optional(),
  fiberGrams: z.number().nullable().optional(),
  caloriesPerServing: z.number().int().nullable().optional(),
  heroImageUrl: z.string().nullable().optional(),
  bestPairedWith: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  pairingReason: z.string().nullable().optional(),
  nutritionCategory: z.enum(["protein", "carb", "vegetable"]).nullable().optional(),
});

export type SideDishInput = z.infer<typeof sideDishSchema>;

/**
 * Zod schema for a seed file that includes ingredients and cook steps.
 */
export const seedSideDishSchema = sideDishSchema.extend({
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.string().min(1),
        isOptional: z.boolean().default(false),
        substitution: z.string().nullable().optional(),
      })
    )
    .optional(),
  steps: z
    .array(
      z.object({
        phase: z.enum(["mission", "grab", "cook", "win"]),
        stepNumber: z.number().int().min(1),
        instruction: z.string().min(1),
        timerSeconds: z.number().int().nullable().optional(),
        mistakeWarning: z.string().nullable().optional(),
        quickHack: z.string().nullable().optional(),
        cuisineFact: z.string().nullable().optional(),
        donenessCue: z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional(),
      })
    )
    .optional(),
});

export type SeedSideDishInput = z.infer<typeof seedSideDishSchema>;
