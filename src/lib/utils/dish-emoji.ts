/**
 * Map dish tags/cuisine to a relevant emoji.
 * Shared across quest cards, search results, and fallback thumbnails.
 */
export function getDishEmoji(tags: string[], cuisine: string): string {
  const all = [...tags.map((t) => t.toLowerCase()), cuisine.toLowerCase()];
  // Cuisine-specific
  if (all.includes("japanese")) return "🍱";
  if (all.includes("korean")) return "🍲";
  if (all.includes("thai")) return "🍜";
  if (all.includes("chinese")) return "🥡";
  if (all.includes("vietnamese")) return "🍜";
  if (all.includes("filipino")) return "🍛";
  if (all.includes("indian")) return "🍛";
  if (all.includes("italian")) return "🍝";
  if (all.includes("mexican")) return "🌮";
  if (all.includes("mediterranean")) return "🥘";
  // Type-specific
  if (all.some((t) => ["salad", "fresh", "raw", "green", "greens"].includes(t)))
    return "🥗";
  if (all.some((t) => ["soup", "broth", "stew"].includes(t))) return "🍲";
  if (all.some((t) => ["rice", "fried rice"].includes(t))) return "🍚";
  if (all.some((t) => ["bread", "toast", "baked"].includes(t))) return "🍞";
  if (all.some((t) => ["pasta", "noodle"].includes(t))) return "🍝";
  if (all.some((t) => ["sweet", "dessert"].includes(t))) return "🍮";
  if (all.some((t) => ["roasted", "grilled", "bbq"].includes(t))) return "🥘";
  if (all.some((t) => ["fish", "seafood", "shrimp"].includes(t))) return "🐟";
  if (all.some((t) => ["chicken", "poultry"].includes(t))) return "🍗";
  if (all.some((t) => ["beef", "pork", "meat", "lamb"].includes(t)))
    return "🥩";
  return "🍽️";
}
