import { z } from "zod";

/**
 * Home-Chef Surplus-Meal — the rule-12 AUTO-BUILD data contract for STRATEGY
 * §12.11 (PARKED, off-thesis + founder-gated). The two-sided marketplace itself
 * (supply onboarding, payments, pickup logistics, food-safety) is NOT
 * AI-executable and ships nothing to users. What IS shippable now is this typed
 * contract + demo fixtures + a flag-gated (default-OFF) rail, so a real partner
 * surplus feed becomes a one-config edit instead of a rebuild.
 *
 * A "batch" = a discounted, home-packed meal a partner restaurant produces at
 * scale, ideally built from unsold / over-ordered SURPLUS ingredients
 * (waste-reduction angle). It references an EXISTING eat-out dish — no invented
 * recipes (CLAUDE.md rule 7).
 */

export const HomeChefBatchSchema = z
  .object({
    id: z.string().describe("Stable batch id"),
    /** Partner restaurant — matches an eat-out DemoVenue slug. */
    restaurantSlug: z.string(),
    restaurantName: z.string(),
    cuisine: z
      .string()
      .describe("Cuisine family — drives taste personalisation"),
    /** The dish — references an EXISTING eat-out DemoDish slug (rule 7: no
     *  invented recipes; a surplus batch is an existing dish, re-priced). */
    dishSlug: z.string(),
    dishName: z.string(),
    /** Surplus / over-ordered ingredients this batch rescues — the
     *  waste-reduction story shown to the user (≥1, plain-language). */
    surplusIngredients: z.array(z.string()).min(1),
    /** Regular menu price (USD). */
    regularPrice: z.number().positive(),
    /** Discounted surplus price (USD) — enforced below to be a real discount. */
    surplusPrice: z.number().positive(),
    /** Batches available right now (0 = sold out). */
    qtyAvailable: z.number().int().nonnegative(),
    /** Human pickup window, e.g. "5:30–7:00 PM today". */
    pickupWindow: z.string().min(1),
    /** Per-batch nutrition (restaurant-portion estimate, same shape as eat-out). */
    perBatchNutrition: z.object({
      kcal: z.number().nonnegative(),
      protein_g: z.number().nonnegative(),
      carbs_g: z.number().nonnegative(),
      fat_g: z.number().nonnegative(),
    }),
  })
  .refine((b) => b.surplusPrice < b.regularPrice, {
    message: "surplusPrice must be below regularPrice (a batch is a discount)",
    path: ["surplusPrice"],
  });

export type HomeChefBatch = z.infer<typeof HomeChefBatchSchema>;

/** Percent saved vs the regular price (rounded, 0-100). */
export function batchDiscountPct(
  b: Pick<HomeChefBatch, "regularPrice" | "surplusPrice">,
): number {
  if (b.regularPrice <= 0) return 0;
  return Math.max(0, Math.round((1 - b.surplusPrice / b.regularPrice) * 100));
}

/** Is the batch buyable right now? (qty > 0). */
export function isBatchAvailable(
  b: Pick<HomeChefBatch, "qtyAvailable">,
): boolean {
  return b.qtyAvailable > 0;
}
