/**
 * Demo venue cuisine string → the preference profile's lowercase family key.
 * Shared by the eat-out venue/featured sort and the home-chef surplus rail so
 * both personalise against the SAME taste weights (no divergence).
 */
export const CUISINE_KEY: Record<string, string> = {
  "pakistani-indian": "indian",
  israeli: "mediterranean",
};

export function cuisineKeyFor(cuisine: string): string {
  const k = cuisine.toLowerCase();
  return CUISINE_KEY[k] ?? k;
}
