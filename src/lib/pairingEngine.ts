import type { Meal, SideDish, PairingScore } from "@/types";
import { getSidesByIds, getSideById } from "@/data";
import { getRankedSidesForMeal } from "@/data/pairings";

export interface SideWithScore extends SideDish {
  pairingScore?: PairingScore;
}

/**
 * Select sides for a meal using ranked data when available,
 * falling back to the curated sidePool with Fisher-Yates shuffle.
 *
 * @param meal - The meal to pair sides for
 * @param count - Number of sides to return (default 3)
 * @param exclude - Side IDs to skip (already shown this session)
 * @param rankOffset - Position in the ranked list to start from (for reroll)
 * @returns Object with sides array and the new rank offset
 */
export function selectSides(
  meal: Meal,
  count: number = 3,
  exclude: Set<string> = new Set(),
  rankOffset: number = 0,
  verifiedOnly: boolean = false
): { sides: SideWithScore[]; nextOffset: number; isRanked: boolean } {
  const ranked = getRankedSidesForMeal(meal.id);

  if (ranked && ranked.length > 0) {
    const filteredRanked = verifiedOnly
      ? ranked.filter((r) => getSideById(r.sideId)?.nourishVerified)
      : ranked;
    if (filteredRanked.length > 0) {
      return selectRankedSides(filteredRanked, count, exclude, rankOffset);
    }
  }

  return {
    sides: selectRandomSides(meal, count, exclude, verifiedOnly),
    nextOffset: 0,
    isRanked: false,
  };
}

/**
 * Walk through the ranked list starting at rankOffset,
 * skipping excluded IDs, and return the next `count` sides.
 */
function selectRankedSides(
  ranked: PairingScore[],
  count: number,
  exclude: Set<string>,
  rankOffset: number
): { sides: SideWithScore[]; nextOffset: number; isRanked: boolean } {
  const results: SideWithScore[] = [];
  let pointer = rankOffset;
  let looped = false;

  while (results.length < count) {
    // Wrap around if we've gone past the end
    if (pointer >= ranked.length) {
      if (looped) break; // Already wrapped once — pool exhausted
      pointer = 0;
      looped = true;
    }

    const entry = ranked[pointer];
    pointer++;

    if (exclude.has(entry.sideId)) continue;

    const resolved = getSidesByIds([entry.sideId]);
    if (resolved.length === 0) continue;

    const side: SideWithScore = {
      ...resolved[0],
      pairingScore: entry,
    };
    results.push(side);
  }

  return {
    sides: results,
    nextOffset: pointer,
    isRanked: true,
  };
}

/**
 * Original Fisher-Yates random selection from the meal's sidePool.
 * Used for non-Indian mains without engine data.
 */
function selectRandomSides(
  meal: Meal,
  count: number,
  exclude: Set<string>,
  verifiedOnly: boolean = false
): SideWithScore[] {
  let basePool = meal.sidePool;
  if (verifiedOnly) {
    basePool = basePool.filter((id) => getSideById(id)?.nourishVerified);
  }
  const available = basePool.filter((id) => !exclude.has(id));
  const pool = available.length >= count ? available : [...basePool];

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0 && i >= shuffled.length - count; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selectedIds = shuffled.slice(-count);
  return getSidesByIds(selectedIds) as SideWithScore[];
}

/**
 * Swap a single side at the given index.
 * For ranked meals: picks the next ranked side not currently shown.
 * For unranked meals: picks a random side from the pool.
 */
export function swapOneSide(
  meal: Meal,
  currentSides: SideDish[],
  indexToSwap: number,
  usedIds: Set<string>,
  rankOffset: number = 0
): { newSides: SideWithScore[]; swappedSide: SideWithScore | null; nextOffset: number } {
  const currentIds = new Set(currentSides.map((s) => s.id));
  const allExcluded = new Set([...usedIds, ...currentIds]);

  const ranked = getRankedSidesForMeal(meal.id);

  if (ranked && ranked.length > 0) {
    // Find the next ranked side not currently shown or already used
    const { sides: next, nextOffset } = selectRankedSides(ranked, 1, allExcluded, rankOffset);

    if (next.length === 0) {
      // All ranked sides exhausted — try excluding only current (allow re-use of previously used)
      const { sides: fallback, nextOffset: fbOffset } = selectRankedSides(
        ranked,
        1,
        currentIds,
        rankOffset
      );
      if (fallback.length === 0) {
        return { newSides: currentSides as SideWithScore[], swappedSide: null, nextOffset: rankOffset };
      }
      const newSides = [...currentSides] as SideWithScore[];
      newSides[indexToSwap] = fallback[0];
      return { newSides, swappedSide: fallback[0], nextOffset: fbOffset };
    }

    const newSides = [...currentSides] as SideWithScore[];
    newSides[indexToSwap] = next[0];
    return { newSides, swappedSide: next[0], nextOffset };
  }

  // Fallback: random selection for unranked meals
  let available = meal.sidePool.filter((id) => !allExcluded.has(id));
  if (available.length === 0) {
    available = meal.sidePool.filter((id) => !currentIds.has(id));
  }
  if (available.length === 0) {
    return { newSides: currentSides as SideWithScore[], swappedSide: null, nextOffset: 0 };
  }

  const randomId = available[Math.floor(Math.random() * available.length)];
  const newSide = getSidesByIds([randomId])[0] as SideWithScore | undefined;

  if (!newSide) {
    return { newSides: currentSides as SideWithScore[], swappedSide: null, nextOffset: 0 };
  }

  const newSides = [...currentSides] as SideWithScore[];
  newSides[indexToSwap] = newSide;
  return { newSides, swappedSide: newSide, nextOffset: 0 };
}
