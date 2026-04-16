/**
 * Cuisine Compass — dish origin data for the geography game.
 * Each dish maps to a region with coordinates for scoring.
 */

export interface CuisineOrigin {
  dishName: string;
  emoji: string;
  region: string;
  country: string;
  funFact: string;
  lat: number;
  lng: number;
}

export const cuisineOrigins: CuisineOrigin[] = [
  {
    dishName: "Pizza Margherita",
    emoji: "🍕",
    region: "Europe",
    country: "Italy",
    funFact: "Created in Naples in 1889 to honor Queen Margherita",
    lat: 40.85,
    lng: 14.27,
  },
  {
    dishName: "Sushi",
    emoji: "🍣",
    region: "Asia",
    country: "Japan",
    funFact: "Originally a preservation method using fermented rice",
    lat: 35.68,
    lng: 139.69,
  },
  {
    dishName: "Tacos",
    emoji: "🌮",
    region: "Americas",
    country: "Mexico",
    funFact: "Evidence of tacos dates back to 1500s silver mines",
    lat: 19.43,
    lng: -99.13,
  },
  {
    dishName: "Croissant",
    emoji: "🥐",
    region: "Europe",
    country: "France",
    funFact: "Originated in Austria as the kipferl, perfected in Paris",
    lat: 48.86,
    lng: 2.35,
  },
  {
    dishName: "Pad Thai",
    emoji: "🍜",
    region: "Asia",
    country: "Thailand",
    funFact: "Created as a national dish by PM Phibunsongkhram in the 1930s",
    lat: 13.76,
    lng: 100.5,
  },
  {
    dishName: "Hummus",
    emoji: "🫘",
    region: "Middle East",
    country: "Lebanon",
    funFact: "Mentioned in manuscripts from 13th century Cairo",
    lat: 33.89,
    lng: 35.5,
  },
  {
    dishName: "Biryani",
    emoji: "🍚",
    region: "Asia",
    country: "India",
    funFact: "Believed to have arrived with Mughal emperors",
    lat: 17.38,
    lng: 78.49,
  },
  {
    dishName: "Fish and Chips",
    emoji: "🐟",
    region: "Europe",
    country: "England",
    funFact: "First fish and chip shop opened in London in 1860",
    lat: 51.51,
    lng: -0.13,
  },
  {
    dishName: "Pho",
    emoji: "🍲",
    region: "Asia",
    country: "Vietnam",
    funFact: "Emerged in Hanoi in the early 20th century",
    lat: 21.03,
    lng: 105.85,
  },
  {
    dishName: "Falafel",
    emoji: "🧆",
    region: "Middle East",
    country: "Egypt",
    funFact: "May have originated with Egyptian Copts as a meat substitute",
    lat: 30.04,
    lng: 31.24,
  },
  {
    dishName: "Ramen",
    emoji: "🍜",
    region: "Asia",
    country: "Japan",
    funFact: "Adapted from Chinese noodle soup, now distinctly Japanese",
    lat: 43.06,
    lng: 141.35,
  },
  {
    dishName: "Empanadas",
    emoji: "🥟",
    region: "Americas",
    country: "Argentina",
    funFact: "Every Argentine province has its own signature filling",
    lat: -34.6,
    lng: -58.38,
  },
  {
    dishName: "Kimchi",
    emoji: "🥬",
    region: "Asia",
    country: "Korea",
    funFact: "Over 200 varieties exist across Korean regions",
    lat: 37.57,
    lng: 126.98,
  },
  {
    dishName: "Paella",
    emoji: "🥘",
    region: "Europe",
    country: "Spain",
    funFact: "Originally cooked by farmers over open fire near Valencia",
    lat: 39.47,
    lng: -0.38,
  },
  {
    dishName: "Tiramisu",
    emoji: "🍰",
    region: "Europe",
    country: "Italy",
    funFact: "Invented in the 1960s in Treviso, Veneto region",
    lat: 45.67,
    lng: 12.24,
  },
];

export const regions = [
  { name: "Europe", emoji: "🇪🇺", lat: 48.0, lng: 10.0 },
  { name: "Asia", emoji: "🌏", lat: 30.0, lng: 100.0 },
  { name: "Americas", emoji: "🌎", lat: 15.0, lng: -80.0 },
  { name: "Middle East", emoji: "🕌", lat: 30.0, lng: 45.0 },
  { name: "Africa", emoji: "🌍", lat: 0.0, lng: 25.0 },
];

export function getRandomOrigins(count: number): CuisineOrigin[] {
  const shuffled = [...cuisineOrigins].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
