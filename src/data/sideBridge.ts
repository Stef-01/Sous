/**
 * Maps pairing engine side names → app side IDs.
 *
 * The Python pairing engine uses descriptive names (e.g. "Cucumber Raita")
 * while the app uses slug IDs (e.g. "raita"). This bridge resolves them.
 *
 * Only sides present in BOTH catalogs can appear in ranked results.
 * Engine-only sides (no app counterpart) are skipped.
 */

import sidesData from "./sides.json";

const ENGINE_TO_APP: Record<string, string> = {
  // Direct matches (engine name → app side ID)
  "Mango Chutney": "mango-chutney",
  "Mirchi Ka Salan": "mirchi-ka-salan",
  Papadum: "papadum",

  // Raita variants  -  app has a single "raita" entry
  "Cucumber Raita": "raita",

  // Rice variants  -  app has a single "basmati-rice" entry
  "Instant Pot Basmati Rice": "basmati-rice",

  // Naan  -  engine says "Garlic Naan", app has "naan-bread"
  "Garlic Naan": "naan-bread",

  // Samosa
  Samosa: "samosa",

  // Dal
  "Dal Tadka": "dal-tadka",

  // Aloo Gobi
  "Aloo Gobi": "aloo-gobi",

  // New Healthy Sides
  "Bhindi Fry (Side)": "bhindi-fry-side",
  "Baingan Bharta (Side)": "baingan-bharta-side",
  "Cabbage Thoran": "cabbage-thoran",
  "Palak Corn": "palak-corn",

  // International Mappings
  "Corn on the Cob": "corn-on-cob",
  "Mac & Cheese": "mac-and-cheese",
};

// Build set of all app side IDs at import time
const appSideIds = new Set(sidesData.map((s) => s.id));

/**
 * Slugify an engine side name to attempt auto-match with app IDs.
 * "Mango Chutney" → "mango-chutney"
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // Remove parentheticals
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .trim()
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-"); // Collapse multiple hyphens
}

/**
 * Resolve an engine side name to an app side ID.
 * Returns null if no match exists in the app catalog.
 */
export function resolveEngineSideId(engineSideName: string): string | null {
  // 1. Check explicit mapping first
  if (ENGINE_TO_APP[engineSideName]) {
    return ENGINE_TO_APP[engineSideName];
  }

  // 2. Try slugifying the engine name
  const slug = slugify(engineSideName);
  if (appSideIds.has(slug)) {
    return slug;
  }

  // 3. No match  -  this engine side has no app counterpart
  return null;
}
