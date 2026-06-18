/**
 * Map dish tags/cuisine to a relevant emoji.
 * Shared across quest cards, search results, and fallback thumbnails.
 */
export function getDishEmoji(tags: string[], cuisine: string): string {
  const all = [...tags.map((t) => t.toLowerCase()), cuisine.toLowerCase()];
  // Type-specific FIRST (matches getDishGlyph) so dishes within a cuisine differ.
  if (all.includes("pizza")) return "🍕";
  if (
    all.some((t) => ["burger", "cheeseburger", "patty", "slider"].includes(t))
  )
    return "🍔";
  if (all.some((t) => ["taco", "tacos", "quesadilla"].includes(t))) return "🌮";
  if (
    all.some((t) =>
      ["dumpling", "dumplings", "gyoza", "potsticker", "wonton"].includes(t),
    )
  )
    return "🥟";
  if (
    all.some((t) => ["bowl", "poke", "grain bowl", "buddha bowl"].includes(t))
  )
    return "🥣";
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
  // Cuisine fallback
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
  if (all.includes("american")) return "🍔";
  return "🍽️";
}
