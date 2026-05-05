/**
 * Eco Mode — carbon-footprint math (pure helpers).
 *
 * Computes per-meal CO2e estimates and the savings a user accrues
 * by cooking at home vs ordering out, vs ordering delivery, and
 * vs an "average American" baseline.
 *
 * Numbers are rounded conservative midpoints from the
 * peer-reviewed + grey-literature sources in
 * `docs/ECO-MODE-PLAN.md`. The dashboard rounds further before
 * displaying so we never imply false precision.
 *
 * Pure / dependency-free / deterministic.
 */

/** Cooking context — drives the per-meal CO2e estimate. */
export type MealContext =
  /** Home-cooked, plant-forward, mostly seasonal/local. */
  | "home-plant-seasonal"
  /** Home-cooked, mixed (some animal protein, some shipped produce). */
  | "home-mixed"
  /** Home-cooked, beef-or-lamb-anchored. */
  | "home-red-meat"
  /** Sit-down restaurant meal. */
  | "restaurant-dine-in"
  /** Takeout / pickup (no delivery vehicle leg). */
  | "takeout-pickup"
  /** Delivery via gig-economy app (extra last-mile leg). */
  | "delivery";

/**
 * Mid-point CO2e per meal in kg, life-cycle including
 * agriculture + processing + transport + packaging + waste.
 *
 * Sources (see ECO-MODE-PLAN.md for full citation table):
 *   - Poore & Nemecek 2018 (Science) — life-cycle dataset for
 *     38k+ farms across 119 countries
 *   - WRI Shifting Diets 2016 — diet-shift carbon analysis
 *   - Project Drawdown — Plant-Rich Diets solution
 *   - Heller & Keoleian 2015 — US foodservice vs household LCA
 *   - Wernet et al. 2016 — packaging + transport multipliers
 *
 * These are deliberately conservative — pessimistic for home,
 * optimistic for restaurant — so user-facing savings claims
 * never overstate. Real-world variance is high; the dashboard
 * displays ranges, never decimal precision.
 */
export const CO2E_PER_MEAL_KG: Record<MealContext, number> = {
  "home-plant-seasonal": 1.4,
  "home-mixed": 2.5,
  "home-red-meat": 5.8,
  "restaurant-dine-in": 4.7,
  "takeout-pickup": 5.2,
  delivery: 6.3,
};

/**
 * Per-meal CO2e savings of choosing context A over context B.
 * Returns 0 when A is not a savings (i.e., B is lower).
 *
 * Used for "you cooked at home tonight — saved X kg vs delivery."
 * Always non-negative so messaging stays positive / never shaming.
 */
export function mealCo2eSavingsKg(input: {
  chosen: MealContext;
  baseline: MealContext;
}): number {
  const chosen = CO2E_PER_MEAL_KG[input.chosen];
  const baseline = CO2E_PER_MEAL_KG[input.baseline];
  return Math.max(0, baseline - chosen);
}

/**
 * Total CO2e a user has saved over a window, given a list of
 * cooking events + an assumed baseline they would have used.
 *
 * Default baseline: "delivery" — generous interpretation (the
 * typical alternative to home-cooking for a busy adult is a
 * delivery app, which is the most carbon-heavy option). The
 * dashboard surfaces the baseline so the user can dial it down.
 */
export interface CookingEvent {
  /** ISO timestamp of the cook. */
  cookedAt: string;
  /** Context of the cook itself. */
  context: MealContext;
}

export function totalCo2eSavedKg(input: {
  events: ReadonlyArray<CookingEvent>;
  baseline?: MealContext;
}): number {
  const baseline = input.baseline ?? "delivery";
  let total = 0;
  for (const e of input.events) {
    total += mealCo2eSavingsKg({ chosen: e.context, baseline });
  }
  return Math.round(total * 10) / 10; // 0.1 kg precision
}

/**
 * "Average American" annual food-related CO2e baseline.
 *
 * 2.5 t CO2e/yr from the food share of personal carbon
 * footprint per Carbon Footprint of an American (EPA 2023 +
 * Heller & Keoleian 2014 dietary LCA + USDA loss-adjusted
 * food availability survey). Of that, ~40% is attributable
 * to food-away-from-home (eating out + takeout + delivery)
 * per BLS Consumer Expenditure Survey 2023 spend share.
 *
 *   2500 kg CO2e/yr × 40% food-away-share = 1000 kg CO2e/yr
 *   from eating out alone.
 *
 * The home-cooking comparison is against this 1000 kg baseline.
 */
export const AVG_AMERICAN_FOOD_AWAY_KG_CO2E_PER_YEAR = 1000;

/**
 * Compare a user's total CO2e saved to the avg-American
 * eating-out baseline. Returns a percentage in [0, 100].
 *
 * Caps at 100% — anything beyond that is "you saved more than
 * an average American eats out in a year" which is unlikely
 * over <12 months but possible long-term; the cap keeps
 * messaging tight.
 */
export function pctOfAvgAmericanAvoided(input: { savedKg: number }): number {
  if (!Number.isFinite(input.savedKg) || input.savedKg <= 0) return 0;
  const pct = (input.savedKg / AVG_AMERICAN_FOOD_AWAY_KG_CO2E_PER_YEAR) * 100;
  return Math.min(100, Math.round(pct * 10) / 10);
}

/**
 * Translate kg CO2e into a relatable analogy. Picks the most
 * intuitive comparison given the magnitude.
 *
 * Conversion factors (rounded; sources in ECO-MODE-PLAN.md):
 *   - 1 km in an average gas car ≈ 0.21 kg CO2e (EPA 2023)
 *   - 1 mile = 1.609 km → 1 mile ≈ 0.34 kg CO2e
 *   - 1 mature tree absorbs ~22 kg CO2e/year (USDA Forest
 *     Service)
 *   - 1 kg of beef ≈ 60 kg CO2e (Poore & Nemecek 2018)
 */
export interface CarbonAnalogy {
  /** Short user-facing string. */
  label: string;
  /** Numeric value rendered in the label, for unit testing. */
  value: number;
}

export function pickCarbonAnalogy(savedKg: number): CarbonAnalogy {
  if (!Number.isFinite(savedKg) || savedKg <= 0) {
    return { label: "0 miles avoided", value: 0 };
  }
  // Under 5 kg → very small; "miles avoided in a gas car".
  if (savedKg < 5) {
    const miles = Math.round(savedKg / 0.34);
    return { label: `${miles} miles avoided in a gas car`, value: miles };
  }
  // 5–110 kg → "X tank-fills of an average car not burned".
  if (savedKg < 110) {
    const miles = Math.round(savedKg / 0.34);
    return { label: `${miles} miles avoided`, value: miles };
  }
  // 110+ kg → trees-worth-of-yearly-absorption framing.
  const trees = Math.round(savedKg / 22);
  return {
    label: `equal to ${trees} tree${trees === 1 ? "" : "s"} working all year`,
    value: trees,
  };
}

/**
 * Encouraging copy generator. Inputs are the user's savings
 * + window length; output is a single short line for the
 * Eco Mode dashboard or the cook-completion celebration.
 *
 * Never shames. Never compares pejoratively. Always frames the
 * saved amount as a gain, with a relatable analogy.
 */
export function buildEncouragementCopy(input: {
  savedKg: number;
  /** "this week" / "this month" / "this year" — surface label. */
  windowLabel: string;
}): string {
  if (!Number.isFinite(input.savedKg) || input.savedKg <= 0) {
    // Cold-start: invite without naming the comparison.
    return "Your first cook starts the count.";
  }
  const analogy = pickCarbonAnalogy(input.savedKg).label;
  const pretty =
    input.savedKg < 1
      ? `${Math.round(input.savedKg * 1000)}g`
      : `${Math.round(input.savedKg * 10) / 10} kg`;
  return `${pretty} CO₂e saved ${input.windowLabel} — ${analogy}.`;
}
