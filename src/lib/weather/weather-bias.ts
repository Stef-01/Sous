/**
 * Weather bias — the pure spine that turns a WeatherSnapshot into a craving
 * lean, and a dish into a temperature profile. Shared by three surfaces: the
 * hunger-aware deck reorder, the crave-it resurface ("save a cold dish, it
 * comes back when it's hot"), and the weather-aware craving brain. No Date, no
 * fetch, no DOM — fully unit-tested.
 *
 * It biases the SAME temperature axis the season nudge already uses (W2 /
 * STRATEGY §6.2): hot weather → cold/fresh food; cold·rain·snow → warm/comfort
 * food. Never a hard filter — a small reorder boost that breaks ties.
 */

import type { WeatherSnapshot } from "@/lib/weather/weather-adapter";

/** What the weather makes you crave. `neutral` → no weather signal (the deck
 *  stays byte-identical, the lean app default). */
export type WeatherLean = "cold-food" | "warm-food" | "neutral";

/** A dish's own temperature character, inferred from its tags + description. */
export type DishTemp = "cold" | "warm" | "neutral";

// Comfortable-room thresholds: ≥24°C leans you toward something cold/fresh,
// ≤12°C (or any rain/snow) toward something warm. The 12-24 band is neutral.
const HOT_C = 24;
const COLD_C = 12;

export function weatherTempLean(
  snapshot: WeatherSnapshot | null | undefined,
): WeatherLean {
  if (!snapshot) return "neutral";
  if (snapshot.condition === "snow") return "warm-food";
  if (snapshot.tempC >= HOT_C) return "cold-food";
  if (snapshot.tempC <= COLD_C || snapshot.condition === "rain")
    return "warm-food";
  return "neutral";
}

const COLD_SIGNALS = [
  "salad",
  "fresh",
  "cold",
  "chilled",
  "iced",
  "smoothie",
  "gazpacho",
  "ceviche",
  "raw",
  "summer roll",
  "sashimi",
  "poke",
  "refreshing",
  "crisp",
];

const WARM_SIGNALS = [
  "soup",
  "stew",
  "braise",
  "braised",
  "roast",
  "roasted",
  "baked",
  "grill",
  "grilled",
  "hot",
  "hearty",
  "comfort",
  "warming",
  "curry",
  "ramen",
  "pho",
  "broth",
  "chili",
  "casserole",
  "fried",
  "rich",
];

function countHits(haystack: string, needles: string[]): number {
  let n = 0;
  for (const needle of needles) if (haystack.includes(needle)) n += 1;
  return n;
}

/** Cold vs warm character from a dish's tags + description. Ties / no signal →
 *  `neutral`, so a generic dish is never wrongly pushed by weather. */
export function dishTempProfile(dish: {
  tags?: string[];
  description?: string;
}): DishTemp {
  const hay = [
    ...(dish.tags ?? []).map((t) => t.toLowerCase()),
    (dish.description ?? "").toLowerCase(),
  ].join(" ");
  const cold = countHits(hay, COLD_SIGNALS);
  const warm = countHits(hay, WARM_SIGNALS);
  if (cold > warm) return "cold";
  if (warm > cold) return "warm";
  return "neutral";
}

/** Does this dish match what the weather makes you crave? Used to amplify both
 *  the weather deck boost and the crave-it resurface. */
export function dishMatchesWeather(lean: WeatherLean, temp: DishTemp): boolean {
  if (lean === "cold-food") return temp === "cold";
  if (lean === "warm-food") return temp === "warm";
  return false;
}
