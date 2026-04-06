/**
 * Cuisine compatibility matrix.
 *
 * Scores how well a side dish from one cuisine family pairs with a main
 * from another. Values are 0-1, where 1 means a natural pairing and 0
 * means a clash.
 *
 * Rows = side dish cuisine, Columns = main dish cuisine.
 * Access: CUISINE_MATRIX[sideCuisine][mainCuisine]
 */

// Default compatibility for unknown pairings
const DEFAULT_COMPATIBILITY = 0.5;

// Self-pairing is always strongest
const SELF_SCORE = 1.0;

/**
 * Regional affinity groups — cuisines that naturally pair well.
 */
const REGIONAL_AFFINITIES: Record<string, string[]> = {
  "south-asian": ["indian", "middle-eastern", "southeast-asian"],
  indian: ["south-asian", "middle-eastern", "southeast-asian"],
  "middle-eastern": ["mediterranean", "south-asian", "indian"],
  mediterranean: ["middle-eastern", "italian", "comfort-classic"],
  italian: ["mediterranean", "comfort-classic", "american"],
  "east-asian": ["japanese", "korean", "chinese", "southeast-asian"],
  japanese: ["east-asian", "korean", "chinese", "southeast-asian"],
  korean: ["east-asian", "japanese", "chinese", "southeast-asian"],
  chinese: ["east-asian", "japanese", "korean", "southeast-asian"],
  "southeast-asian": [
    "thai",
    "vietnamese",
    "filipino",
    "east-asian",
    "south-asian",
  ],
  thai: ["southeast-asian", "vietnamese", "east-asian", "south-asian"],
  vietnamese: ["southeast-asian", "thai", "east-asian", "chinese"],
  filipino: ["southeast-asian", "east-asian", "american", "comfort-classic"],
  "latin-american": ["mexican", "american", "comfort-classic"],
  mexican: ["latin-american", "american", "comfort-classic"],
  american: ["comfort-classic", "mexican", "latin-american", "italian"],
  "comfort-classic": ["american", "italian", "mediterranean"],
  "west-african": ["comfort-classic", "south-asian", "middle-eastern"],
};

/**
 * Get the compatibility score between a side dish cuisine and a main dish cuisine.
 */
export function getCuisineCompatibility(
  sideCuisine: string,
  mainCuisine: string,
): number {
  const sideNorm = sideCuisine.toLowerCase();
  const mainNorm = mainCuisine.toLowerCase();

  // Same cuisine is always the best pairing
  if (sideNorm === mainNorm) return SELF_SCORE;

  // Check if side's cuisine considers main's cuisine an affinity
  const affinities = REGIONAL_AFFINITIES[sideNorm];
  if (affinities?.includes(mainNorm)) return 0.8;

  // Check reverse — if main's cuisine considers side's cuisine an affinity
  const reverseAffinities = REGIONAL_AFFINITIES[mainNorm];
  if (reverseAffinities?.includes(sideNorm)) return 0.75;

  // Comfort classics pair moderately with everything
  if (sideNorm === "comfort-classic" || mainNorm === "comfort-classic")
    return 0.6;

  // Default — distant cuisines
  return DEFAULT_COMPATIBILITY;
}
