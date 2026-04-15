/**
 * Flavor pairing data for the memory-style matching game.
 * Each pair is two ingredients that work well together.
 */

export interface FlavorPair {
  a: { name: string; emoji: string };
  b: { name: string; emoji: string };
  why: string;
}

const easyPairs: FlavorPair[] = [
  { a: { name: "Tomato", emoji: "🍅" }, b: { name: "Basil", emoji: "🌿" }, why: "Classic Italian aromatics" },
  { a: { name: "Peanut Butter", emoji: "🥜" }, b: { name: "Jelly", emoji: "🍇" }, why: "Sweet meets savory" },
  { a: { name: "Chips", emoji: "🍟" }, b: { name: "Ketchup", emoji: "🥫" }, why: "Salt and tang" },
  { a: { name: "Bread", emoji: "🍞" }, b: { name: "Butter", emoji: "🧈" }, why: "Foundation of comfort" },
  { a: { name: "Chocolate", emoji: "🍫" }, b: { name: "Milk", emoji: "🥛" }, why: "Rich and creamy" },
  { a: { name: "Rice", emoji: "🍚" }, b: { name: "Soy Sauce", emoji: "🫘" }, why: "Umami meets starch" },
  { a: { name: "Lemon", emoji: "🍋" }, b: { name: "Fish", emoji: "🐟" }, why: "Acid cuts richness" },
  { a: { name: "Cheese", emoji: "🧀" }, b: { name: "Wine", emoji: "🍷" }, why: "Fat and tannins" },
];

const mediumPairs: FlavorPair[] = [
  { a: { name: "Miso", emoji: "🫙" }, b: { name: "Caramel", emoji: "🍮" }, why: "Salt amplifies sweetness" },
  { a: { name: "Fig", emoji: "🫒" }, b: { name: "Prosciutto", emoji: "🥩" }, why: "Sweet fruit, salty meat" },
  { a: { name: "Ginger", emoji: "🫚" }, b: { name: "Honey", emoji: "🍯" }, why: "Warmth and sweetness" },
  { a: { name: "Lime", emoji: "🍈" }, b: { name: "Coconut", emoji: "🥥" }, why: "Tropical brightness" },
  { a: { name: "Garlic", emoji: "🧄" }, b: { name: "Rosemary", emoji: "🌱" }, why: "Mediterranean staple" },
  { a: { name: "Apple", emoji: "🍎" }, b: { name: "Cinnamon", emoji: "🪵" }, why: "Autumn perfection" },
  { a: { name: "Avocado", emoji: "🥑" }, b: { name: "Lime", emoji: "🍋" }, why: "Fat needs acid" },
  { a: { name: "Chicken", emoji: "🍗" }, b: { name: "Thyme", emoji: "🌿" }, why: "Poultry's best friend" },
];

const hardPairs: FlavorPair[] = [
  { a: { name: "Strawberry", emoji: "🍓" }, b: { name: "Balsamic", emoji: "🫙" }, why: "Sweet acid on sweet fruit" },
  { a: { name: "Watermelon", emoji: "🍉" }, b: { name: "Feta", emoji: "🧀" }, why: "Salty contrast on sweet" },
  { a: { name: "Chocolate", emoji: "🍫" }, b: { name: "Chili", emoji: "🌶️" }, why: "Aztec inspiration" },
  { a: { name: "Pear", emoji: "🍐" }, b: { name: "Blue Cheese", emoji: "🧀" }, why: "Delicate meets pungent" },
  { a: { name: "Peach", emoji: "🍑" }, b: { name: "Burrata", emoji: "🫕" }, why: "Summer luxury" },
  { a: { name: "Coffee", emoji: "☕" }, b: { name: "Cardamom", emoji: "🌰" }, why: "Arabic tradition" },
  { a: { name: "Mango", emoji: "🥭" }, b: { name: "Chili Flakes", emoji: "🌶️" }, why: "Sweet heat" },
  { a: { name: "Duck", emoji: "🦆" }, b: { name: "Orange", emoji: "🍊" }, why: "French classic" },
];

export function getPairs(difficulty: "easy" | "medium" | "hard"): FlavorPair[] {
  switch (difficulty) {
    case "easy": return easyPairs;
    case "medium": return mediumPairs;
    case "hard": return hardPairs;
  }
}

export function getRandomPairs(count: number, difficulty: "easy" | "medium" | "hard"): FlavorPair[] {
  const pool = getPairs(difficulty);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
