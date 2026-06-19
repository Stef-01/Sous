/**
 * cravingForNow — the shared "craving brain" behind the Sous Everywhere
 * surfaces (the wallpaper, the widget JSON, the gallery hero). Given the local
 * clock it picks the single most crave-worthy real meal to surface RIGHT NOW.
 *
 * It is the main-picking counterpart to the pairing engine (which pairs SIDES
 * to a chosen main): here we choose the MAIN. The signal is deliberately the
 * robust, deterministic one —
 *   1. daypart eligibility (a meal's authored `dayparts`, the same breakfast/
 *      lunch/dinner buckets the deck honours — collapsed from the W2
 *      `daypartFromHour` clock),
 *   2. vividness (a real hero photo beats a gradient — desire-thesis 4.7),
 *   3. light seasonal-cuisine affinity (month → season → cuisine lean),
 *   4. a date-seeded rotation so the pick is stable within a day but rotates
 *      across days (daily-novelty, mirroring the engine's tie-break rotation).
 *
 * Pure + Result-typed, clock INJECTED (no `Date` inside, so it's golden-
 * testable and the widget/wallpaper/gallery all agree for one `seed`). Every
 * returned slug is a real `meals.json` id — it can never invent a dish (rule 7).
 */

import mealsData from "@/data/meals.json";

export type MealDaypart = "breakfast" | "lunch" | "dinner";
type Season = "spring" | "summer" | "fall" | "winter";

interface MealRecord {
  id: string;
  name: string;
  cuisine: string;
  heroImageUrl?: string | null;
  dayparts?: string[];
  sidePool?: string[];
}

const MEALS = mealsData as unknown as MealRecord[];

export interface CravingForNow {
  /** The meal's id — also its cook-route slug. */
  slug: string;
  name: string;
  /** Real hero photo path, or null → the surface uses its gradient/glyph. */
  imageUrl: string | null;
  cuisine: string;
  /** Deep link into the guided cook. */
  deepLink: string;
  daypart: MealDaypart;
}

export interface CravingContext {
  /** Local hour 0-23. */
  hour: number;
  /** Local month 0-11. */
  month: number;
  /** Date-derived seed (e.g. YYYYMMDD) — keeps the pick stable within a day. */
  seed: number;
}

type Result<T> = { success: true; data: T } | { success: false; error: string };

/** Collapse the 24h clock to the three dayparts meals are authored against. */
export function mealDaypartFromHour(hour: number): MealDaypart {
  const h = ((Math.trunc(hour) % 24) + 24) % 24;
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  return "dinner";
}

function seasonFromMonth(month: number): Season {
  const m = ((Math.trunc(month) % 12) + 12) % 12;
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "fall";
  return "winter";
}

/** Cuisines that lean into each season (a light affinity, never a hard gate). */
const SEASON_CUISINES: Record<Season, ReadonlySet<string>> = {
  summer: new Set(["mexican", "mediterranean", "vietnamese", "thai", "greek"]),
  winter: new Set([
    "indian",
    "italian",
    "korean",
    "chinese",
    "comfort-classic",
  ]),
  spring: new Set(["mediterranean", "japanese", "vietnamese", "thai"]),
  fall: new Set(["italian", "indian", "filipino", "korean"]),
};

/** A small, fast, deterministic hash (djb2) → [0,1). The seed is mixed into the
 *  initial state (NOT appended) so consecutive seeds perturb each meal's hash
 *  non-uniformly — otherwise a +1 seed would shift every hash by the same delta
 *  and preserve the relative order, defeating the daily rotation. */
function seededUnit(key: string, seed: number): number {
  let h = (5381 ^ (seed >>> 0)) >>> 0;
  for (let i = 0; i < key.length; i++)
    h = ((h << 5) + h + key.charCodeAt(i)) >>> 0;
  return (h % 100000) / 100000;
}

function craveScore(meal: MealRecord, season: Season, seed: number): number {
  let score = 0;
  if (meal.heroImageUrl) score += 1; // vividness — a real plated photo
  if (SEASON_CUISINES[season].has((meal.cuisine || "").toLowerCase()))
    score += 0.5;
  score += seededUnit(meal.id, seed) * 0.4; // daily rotation
  return score;
}

/** The daypart-eligible pool, falling back to all meals when a daypart has
 *  none authored (never errors — the showcase always has something to crave). */
function eligibleMeals(daypart: MealDaypart): MealRecord[] {
  const pool = MEALS.filter((m) => (m.dayparts ?? []).includes(daypart));
  return pool.length > 0 ? pool : MEALS;
}

function toCraving(meal: MealRecord, daypart: MealDaypart): CravingForNow {
  return {
    slug: meal.id,
    name: meal.name,
    imageUrl: meal.heroImageUrl ?? null,
    cuisine: meal.cuisine,
    deepLink: `/cook/${meal.id}`,
    daypart,
  };
}

/** The single most crave-worthy meal for the given local moment. */
export function cravingForNow(ctx: CravingContext): Result<CravingForNow> {
  if (MEALS.length === 0)
    return { success: false, error: "No meals available" };
  const daypart = mealDaypartFromHour(ctx.hour);
  const season = seasonFromMonth(ctx.month);
  const pool = eligibleMeals(daypart);

  let best = pool[0];
  let bestScore = craveScore(best, season, ctx.seed);
  for (const meal of pool) {
    const s = craveScore(meal, season, ctx.seed);
    // Stable tie-break by id so the pick is fully deterministic.
    if (s > bestScore || (s === bestScore && meal.id < best.id)) {
      best = meal;
      bestScore = s;
    }
  }
  return { success: true, data: toCraving(best, daypart) };
}
