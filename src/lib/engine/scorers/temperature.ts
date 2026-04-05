import type { Scorer, MainDishIntent, SideDishCandidate } from "../types";

/**
 * Temperature Scorer
 *
 * Rewards temperature contrast between main and side.
 * Hot main + cold side = refreshing contrast.
 * Hot main + hot side = acceptable but less interesting.
 * Cold main + hot side = warming complement.
 */

function inferMainTemperature(main: MainDishIntent): string {
  const name = main.dishName.toLowerCase();

  // Cold mains
  if (
    name.includes("salad") ||
    name.includes("sushi") ||
    name.includes("poke") ||
    name.includes("ceviche") ||
    name.includes("gazpacho")
  ) {
    return "cold";
  }

  // Room-temp
  if (
    name.includes("sandwich") ||
    name.includes("wrap") ||
    name.includes("burger")
  ) {
    return "room-temp";
  }

  // Default — most mains are hot
  return "hot";
}

export const temperatureScorer: Scorer = {
  name: "temperature",

  score(main: MainDishIntent, side: SideDishCandidate): number {
    const mainTemp = inferMainTemperature(main);
    const sideTemp = side.temperature;

    // Contrast pairings
    if (mainTemp === "hot" && sideTemp === "cold") return 0.95;
    if (mainTemp === "cold" && sideTemp === "hot") return 0.9;

    // Room temp goes with anything
    if (sideTemp === "room-temp") return 0.7;
    if (mainTemp === "room-temp") return 0.7;

    // Same temperature — acceptable but less interesting
    if (mainTemp === sideTemp) return 0.5;

    return 0.6;
  },
};
