/**
 * Eat Out — Stanford-area DEMO dataset (founder-directed prototype,
 * 2026-06-10). Thirteen REAL restaurants within 20 km of Stanford's campus,
 * each with real signature menu items, hand-estimated restaurant-portion
 * nutrition (provenance "manual-estimate", confidence "approximated" — never
 * presented as official), and photos from the repo's existing real-photo
 * library chosen to match each dish.
 *
 * This is INDICATIVE demo data for showing the flow — distances are
 * approximate from the Main Quad, menus shift seasonally, and no live
 * hours/availability are claimed (that's the Y7 Places integration).
 *
 * heroImage files under public/eat-out/ are pulled from the restaurants'
 * OWN websites for this PRIVATE prototype only (founder-directed) — they
 * must not ship in any public or distributed build without permission.
 */

import type { BrandedFood } from "@/lib/nutrition/branded-food";
import type { PerServingNutrition } from "@/types/nutrition";

export interface DemoDish {
  slug: string;
  name: string;
  /** One appetising line — what it is, why people order it. */
  blurb: string;
  priceUsd: number;
  /** Restaurant-portion estimates (whole plate as served). */
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  /** Repo photo (public/food_images) matched to the dish. */
  image: string;
  /** Goal-fit tags — same vocabulary the goal plans star. */
  tags: ReadonlyArray<
    "high-protein" | "veggie-forward" | "lighter" | "omega-3" | "iron" | "fiber"
  >;
}

export interface DemoVenue {
  slug: string;
  name: string;
  area: string;
  cuisine: string;
  /** Approx. km from Stanford Main Quad. */
  distanceKm: number;
  price: "$" | "$$" | "$$$";
  /** One-line identity — real reputation, no invented claims. */
  vibe: string;
  /** Venue hero from the restaurant's own site (private demo only). */
  heroImage?: string;
  dishes: DemoDish[];
}

const d = (
  slug: string,
  name: string,
  blurb: string,
  priceUsd: number,
  kcal: number,
  protein_g: number,
  carbs_g: number,
  fat_g: number,
  image: string,
  tags: DemoDish["tags"] = [],
): DemoDish => ({
  slug,
  name,
  blurb,
  priceUsd,
  kcal,
  protein_g,
  carbs_g,
  fat_g,
  image,
  tags,
});

export const STANFORD_VENUES: DemoVenue[] = [
  {
    slug: "zareens-palo-alto",
    name: "Zareen's",
    area: "California Ave, Palo Alto",
    cuisine: "Pakistani-Indian",
    distanceKm: 3.9,
    price: "$$",
    vibe: "Michelin Bib Gourmand Pakistani-Indian — the campus favourite.",
    heroImage: "/eat-out/zareens.jpg",
    dishes: [
      d(
        "zareens-chicken-tikka-masala",
        "Chicken Tikka Masala",
        "The house signature — char-grilled tikka folded into a silken tomato-cream masala.",
        17,
        880,
        42,
        68,
        48,
        "/food_images/chicken_tikka_masala.png",
        ["high-protein"],
      ),
      d(
        "zareens-chicken-biryani",
        "Chicken Biryani",
        "Layered basmati, bone-in chicken, fried onions — weekend sell-out.",
        16,
        760,
        38,
        82,
        30,
        "/food_images/chicken_biryani.png",
        ["high-protein", "iron"],
      ),
      d(
        "zareens-masala-fries",
        "Masala Fries",
        "Crispy fries dusted in chaat masala with cilantro chutney.",
        8,
        520,
        8,
        64,
        26,
        "/food_images/masala_fries.png",
        ["veggie-forward"],
      ),
    ],
  },
  {
    slug: "orens-hummus",
    name: "Oren's Hummus",
    area: "University Ave, Palo Alto",
    cuisine: "Israeli",
    distanceKm: 2.6,
    price: "$$",
    vibe: "Tel-Aviv-style hummus bar; everything tastes of olive oil + lemon.",
    heroImage: "/eat-out/orens.png",
    dishes: [
      d(
        "orens-falafel-pita",
        "Falafel Pita",
        "Herb-green falafel, Israeli salad and tahini in fresh pita.",
        14,
        620,
        18,
        74,
        28,
        "/food_images/falafel_wrap.png",
        ["veggie-forward", "fiber"],
      ),
      d(
        "orens-israeli-salad",
        "Israeli Chopped Salad",
        "Fine-diced cucumber + tomato, lemon, parsley — the lighter classic.",
        9,
        180,
        4,
        14,
        12,
        "/food_images/kachumber.png",
        ["lighter", "veggie-forward"],
      ),
    ],
  },
  {
    slug: "evvia-estiatorio",
    name: "Evvia Estiatorio",
    area: "Emerson St, Palo Alto",
    cuisine: "Greek",
    distanceKm: 2.7,
    price: "$$$",
    vibe: "Warm taverna with a wood grill — Palo Alto's special-occasion Greek.",
    dishes: [
      d(
        "evvia-paidakia",
        "Paidakia — Lamb Chops",
        "Mesquite-grilled lamb chops with lemonato potatoes.",
        52,
        720,
        52,
        8,
        54,
        "/food_images/lamb_chops.png",
        ["high-protein", "iron"],
      ),
      d(
        "evvia-moussaka",
        "Moussaka",
        "Layers of eggplant, spiced lamb and béchamel, baked to order.",
        34,
        640,
        28,
        38,
        42,
        "/food_images/moussaka.png",
        [],
      ),
    ],
  },
  {
    slug: "tamarine",
    name: "Tamarine",
    area: "University Ave, Palo Alto",
    cuisine: "Vietnamese",
    distanceKm: 2.4,
    price: "$$$",
    vibe: "Modern Vietnamese — shaking beef has been the order for 20 years.",
    dishes: [
      d(
        "tamarine-shaking-beef",
        "Bò Lúc Lắc — Shaking Beef",
        "Cubed filet wok-tossed with garlic + watercress, lime-pepper dip.",
        42,
        580,
        42,
        18,
        38,
        "/food_images/steak.png",
        ["high-protein", "iron"],
      ),
    ],
  },
  {
    slug: "gotts-roadside",
    name: "Gott's Roadside",
    area: "Town & Country Village",
    cuisine: "American",
    distanceKm: 1.6,
    price: "$$",
    vibe: "Across from campus — the post-game burger institution.",
    heroImage: "/eat-out/gotts.jpg",
    dishes: [
      d(
        "gotts-cheeseburger",
        "Cheeseburger",
        "Niman Ranch beef, American cheese, secret sauce on an egg bun.",
        15,
        660,
        32,
        44,
        38,
        "/food_images/beef_burger.png",
        ["high-protein"],
      ),
      d(
        "gotts-sweet-potato-fries",
        "Sweet Potato Fries",
        "The side that outsells the regular fries.",
        7,
        420,
        4,
        56,
        20,
        "/food_images/sweet_potato_fries.png",
        ["veggie-forward"],
      ),
    ],
  },
  {
    slug: "ramen-nagi",
    name: "Ramen Nagi",
    area: "University Ave, Palo Alto",
    cuisine: "Japanese",
    distanceKm: 2.5,
    price: "$$",
    vibe: "Tokyo's customisable tonkotsu line, transplanted to University Ave.",
    dishes: [
      d(
        "nagi-karaage",
        "Chicken Karaage",
        "Soy-ginger fried chicken — the side everyone adds.",
        9,
        480,
        28,
        24,
        30,
        "/food_images/karaage.png",
        ["high-protein"],
      ),
      d(
        "nagi-gyoza",
        "Gyoza",
        "Pan-seared pork dumplings, five to the plate.",
        8,
        310,
        12,
        30,
        14,
        "/food_images/gyoza.png",
        [],
      ),
    ],
  },
  {
    slug: "true-food-kitchen",
    name: "True Food Kitchen",
    area: "Stanford Shopping Center",
    cuisine: "Health-forward",
    distanceKm: 1.4,
    price: "$$",
    vibe: "Anti-inflammatory-leaning menu a 15-minute walk from the Quad.",
    dishes: [
      d(
        "tfk-ancient-grains",
        "Ancient Grains Bowl",
        "Farro + quinoa, miso-glazed sweet potato, turmeric, avocado.",
        18,
        560,
        16,
        78,
        20,
        "/food_images/quinoa.png",
        ["veggie-forward", "fiber"],
      ),
      d(
        "tfk-grilled-salmon",
        "Grilled Sustainable Salmon",
        "With quinoa + market vegetables — the omega-3 order.",
        29,
        530,
        40,
        22,
        30,
        "/food_images/grilled_salmon.png",
        ["high-protein", "omega-3", "lighter"],
      ),
    ],
  },
  {
    slug: "sweetgreen-palo-alto",
    name: "Sweetgreen",
    area: "University Ave, Palo Alto",
    cuisine: "Salads",
    distanceKm: 2.4,
    price: "$$",
    vibe: "The fast lunch line for half of downtown Palo Alto.",
    dishes: [
      d(
        "sg-harvest-bowl",
        "Harvest Bowl",
        "Roasted chicken, sweet potato, wild rice, apple, balsamic.",
        16,
        705,
        24,
        79,
        33,
        "/food_images/mixed_green_salad.png",
        ["fiber"],
      ),
      d(
        "sg-kale-caesar",
        "Kale Caesar",
        "Shaved parm, lime squeeze, the lighter Caesar.",
        14,
        430,
        12,
        24,
        32,
        "/food_images/caesar_salad.png",
        ["lighter", "veggie-forward"],
      ),
    ],
  },
  {
    slug: "reposado",
    name: "Reposado",
    area: "Hamilton Ave, Palo Alto",
    cuisine: "Mexican",
    distanceKm: 2.6,
    price: "$$$",
    vibe: "Upscale Mexican with a mesquite grill and a serious agave list.",
    heroImage: "/eat-out/reposado.jpg",
    dishes: [
      d(
        "reposado-enchiladas-mole",
        "Enchiladas de Mole",
        "House mole negro over chicken enchiladas, crema + queso fresco.",
        26,
        690,
        30,
        52,
        40,
        "/food_images/enchiladas.png",
        [],
      ),
      d(
        "reposado-tacos-al-pastor",
        "Tacos al Pastor",
        "Spit-style pork, pineapple, salsa verde on heirloom-corn tortillas.",
        21,
        540,
        28,
        48,
        24,
        "/food_images/tacos_al_pastor.png",
        ["high-protein"],
      ),
    ],
  },
  {
    slug: "terun",
    name: "Terún",
    area: "California Ave, Palo Alto",
    cuisine: "Italian",
    distanceKm: 3.8,
    price: "$$",
    vibe: "Certified Neapolitan oven — the blistered-crust pizza benchmark.",
    heroImage: "/eat-out/terun.jpg",
    dishes: [
      d(
        "terun-margherita",
        "Pizza Margherita D.O.P.",
        "San Marzano, fior di latte, basil — 90 seconds in the wood oven.",
        21,
        850,
        34,
        96,
        34,
        "/food_images/pizza_margherita.png",
        [],
      ),
    ],
  },
  {
    slug: "jin-sho",
    name: "Jin Sho",
    area: "California Ave, Palo Alto",
    cuisine: "Japanese",
    distanceKm: 3.7,
    price: "$$$",
    vibe: "Quiet sushi-ya from Nobu alumni; the nigiri plate is the move.",
    dishes: [
      d(
        "jinsho-sushi-platter",
        "Nigiri Omakase Plate",
        "Chef's selection nigiri + maki, market fish.",
        48,
        520,
        38,
        58,
        12,
        "/food_images/sushi_platter.png",
        ["high-protein", "omega-3", "lighter"],
      ),
    ],
  },
  {
    slug: "so-gong-dong",
    name: "So Gong Dong Tofu House",
    area: "El Camino Real, Palo Alto",
    cuisine: "Korean",
    distanceKm: 4.4,
    price: "$",
    vibe: "Bubbling soondubu and stone-pot rice — the rainy-day answer.",
    dishes: [
      d(
        "sgd-dolsot-bibimbap",
        "Dolsot Bibimbap",
        "Crackling stone-pot rice, vegetables, egg, gochujang.",
        17,
        720,
        26,
        92,
        24,
        "/food_images/bibimbap.png",
        ["veggie-forward", "fiber", "iron"],
      ),
    ],
  },
  {
    slug: "pho-vi-hoa",
    name: "Pho Vi Hoa",
    area: "Los Altos",
    cuisine: "Vietnamese",
    distanceKm: 7.1,
    price: "$",
    vibe: "Decades-old Los Altos pho house; broth simmered overnight.",
    dishes: [
      d(
        "pvh-pho-dac-biet",
        "Phở Đặc Biệt",
        "The combination bowl — rare steak, brisket, meatballs, fresh herbs.",
        16,
        580,
        36,
        68,
        14,
        "/food_images/pho.png",
        ["high-protein", "lighter", "iron"],
      ),
    ],
  },
];

/** Demo dish → a BrandedFood the diary already knows how to log (brand =
 *  restaurant; nutrition is the whole plate as one serving). */
export function demoDishToBrandedFood(
  dish: DemoDish,
  venue: DemoVenue,
): BrandedFood {
  const nutrition = {
    recipeSlug: dish.slug,
    servingsPerRecipe: 1,
    provenance: "manual-estimate",
    confidence: "approximated",
    ingestedAt: "2026-06-10T00:00:00.000Z",
    calories: dish.kcal,
    protein_g: dish.protein_g,
    totalCarbs_g: dish.carbs_g,
    totalFat_g: dish.fat_g,
  } as unknown as PerServingNutrition;
  return {
    barcode: `demo-${dish.slug}`,
    name: dish.name,
    brand: venue.name,
    servingSizeG: 100,
    nutrition,
  };
}

export const ALL_CUISINES: string[] = [
  ...new Set(STANFORD_VENUES.map((v) => v.cuisine)),
];
