/**
 * Pairing engine data adapter.
 *
 * Imports the pre-computed pairings.json from the Python scoring engine
 * and normalizes it for use in the Next.js app. Bridges engine main names
 * and side names to app IDs.
 */

import type { PairingScore } from "@/types";
import type { Meal, SideDish } from "@/types";
import rawPairings from "./pairings.json";
import { resolveEngineSideId } from "./sideBridge";
import { meals, sides as allAppSides } from "./index";

// Raw shape from pairings.json: { "Main Name": [{ side, score, tier, reasons }] }
type RawPairingEntry = {
  side: string;
  score: number;
  tier: string;
  reasons: string[];
};
type RawPairingsMap = Record<string, RawPairingEntry[]>;

const pairingsData = rawPairings as RawPairingsMap;

/**
 * Engine main name → app meal ID mapping.
 *
 * The Python engine uses display names; the app uses slug IDs.
 * Only mains present in BOTH catalogs are mapped here.
 */
const ENGINE_MAIN_TO_MEAL_ID: Record<string, string> = {
  "Bell Pepper Curry": "bell-pepper-curry",
  "Bhindi Masala": "bhindi-masala",
  "Chicken Biryani": "chicken-biryani",
  "Eggplant Methi": "eggplant-methi",
  "Kadhi": "kadhi",
  "Marathi Moong Curry": "marathi-moong-curry",
  "Masoor Dal": "masoor-dal",
  "Mattar Paneer": "mattar-paneer",
  "Mixed Veg + Paneer": "mixed-veg-paneer",
  "Mumbai Pav Bhaji": "mumbai-pav-bhaji",
  "Mushroom Masala": "mushroom-masala",
  "Sambar": "sambar",
  "Tandoori Vegetables": "tandoori-vegetables",
  "Tofu Bhurji": "tofu-bhurji",
};

// Reverse lookup: meal ID → engine main name
const MEAL_ID_TO_ENGINE_MAIN: Record<string, string> = {};
for (const [engineName, mealId] of Object.entries(ENGINE_MAIN_TO_MEAL_ID)) {
  MEAL_ID_TO_ENGINE_MAIN[mealId] = engineName;
}

// Pre-compute resolved rankings per meal ID
const _rankedCache = new Map<string, PairingScore[]>();

function buildRankedList(engineMainName: string): PairingScore[] {
  const rawEntries = pairingsData[engineMainName];
  if (!rawEntries) return [];

  const resolved: PairingScore[] = [];
  for (const entry of rawEntries) {
    const sideId = resolveEngineSideId(entry.side);
    if (sideId) {
      resolved.push({
        sideId,
        score: entry.score,
        tier: entry.tier as PairingScore["tier"],
        reasons: entry.reasons,
      });
    }
  }

  // Already sorted descending by score from the engine, but ensure it
  return resolved.sort((a, b) => b.score - a.score);
}

/**
 * Get ranked sides for a meal, ordered by pairing score descending.
 * Returns null if the meal has no engine data (non-Indian mains).
 */
export function getRankedSidesForMeal(mealId: string): PairingScore[] | null {
  // Check cache
  if (_rankedCache.has(mealId)) {
    return _rankedCache.get(mealId)!;
  }

  const engineMainName = MEAL_ID_TO_ENGINE_MAIN[mealId];
  if (!engineMainName) {
    return null; // No engine data for this meal
  }

  const ranked = buildRankedList(engineMainName);
  if (ranked.length === 0) {
    return null;
  }

  _rankedCache.set(mealId, ranked);
  return ranked;
}

/**
 * Get the full heatmap data for ALL meals and sides in the system.
 *
 * Engine-scored meals get real scores (0-100).
 * Curated-only meals get -1 for sides in their sidePool, 0 otherwise.
 * This lets the UI distinguish engine-scored from curated pairings.
 */
export function getHeatmapData() {
  // Build side ID → name lookup
  const sideIdToName = new Map<string, string>();
  for (const side of allAppSides) {
    sideIdToName.set(side.id, side.name);
  }

  // Collect ALL unique side names: engine sides + all app sides
  const allSideNames = new Set<string>();
  for (const entries of Object.values(pairingsData)) {
    for (const entry of entries) {
      allSideNames.add(entry.side);
    }
  }
  for (const side of allAppSides) {
    allSideNames.add(side.name);
  }
  const sides = [...allSideNames].sort();

  // Build rows for ALL meals
  const mainNames: string[] = [];
  const matrix: number[][] = [];
  const sourceTypes: ("engine" | "curated")[] = [];

  // Engine-scored meals first
  for (const engineMain of Object.keys(pairingsData)) {
    mainNames.push(engineMain);
    sourceTypes.push("engine");

    const entries = pairingsData[engineMain];
    const sideScoreMap = new Map<string, number>();
    for (const entry of entries) {
      sideScoreMap.set(entry.side, entry.score);
    }

    const row: number[] = [];
    for (const side of sides) {
      row.push(sideScoreMap.get(side) ?? 0);
    }
    matrix.push(row);
  }

  // Curated-only meals (not in engine)
  const engineMealIds = new Set(Object.values(ENGINE_MAIN_TO_MEAL_ID));
  for (const meal of meals) {
    if (engineMealIds.has(meal.id)) continue; // Already covered by engine

    mainNames.push(meal.name);
    sourceTypes.push("curated");

    // Build set of side names in this meal's sidePool
    const poolSideNames = new Set<string>();
    for (const sideId of meal.sidePool) {
      const name = sideIdToName.get(sideId);
      if (name) poolSideNames.add(name);
    }

    const row: number[] = [];
    for (const side of sides) {
      row.push(poolSideNames.has(side) ? -1 : 0);
    }
    matrix.push(row);
  }

  return { mains: mainNames, sides, matrix, sourceTypes };
}
