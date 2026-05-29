/**
 * Cuisine Compass — curated dish dataset (Y5 N).
 *
 * Hand-curated from Wikipedia regional cuisine articles, Larousse
 * Gastronomique, and the Oxford Companion to Food per the
 * editorial brief in `docs/CUISINE-COMPASS-MAP-GAME-PLAN.md`.
 * Each entry pairs a dish with its primary origin city + a short
 * history blurb shown after the user submits their guess.
 *
 * 50 dishes shipped here in Sprint N; another 100 in Sprint O;
 * remaining 215 in Y6+Y7 as a content workstream.
 *
 * The image-URL convention: dishes that exist in the existing
 * `/food_images/` catalog reuse their png. Everything else uses
 * the `placeholder:<emoji>` convention so the rendering layer
 * can fall back to an emoji card without a network round-trip.
 *
 * Keep this list alphabetised by dayIndex (which equals position).
 * Tie-breaking on the same dayIndex is by slug — see
 * `daily-rotation.ts`.
 *
 * Pure data — no React, no DOM, no Zod runtime here. The Zod
 * schema lives in `src/types/cuisine-compass.ts`; the schema is
 * applied via the parse helper in tests + the streak-hook
 * persistence layer.
 */

import type { CompassDish } from "@/types/cuisine-compass";

export const COMPASS_DISHES: ReadonlyArray<CompassDish> = [
  {
    slug: "pad-thai",
    name: "Pad Thai",
    origin: {
      city: "Bangkok",
      country: "Thailand",
      lat: 13.7563,
      lng: 100.5018,
    },
    history:
      "Promoted as a national dish in the late 1930s by Prime Minister Plaek Phibunsongkhram as part of a wartime push to reduce rice consumption.",
    cuisineFamily: "thai",
    imageUrl: "placeholder:🍜",
    dayIndex: 0,
  },
  {
    slug: "pizza-margherita",
    name: "Pizza Margherita",
    origin: { city: "Naples", country: "Italy", lat: 40.8518, lng: 14.2681 },
    history:
      "Created in 1889 in honor of Queen Margherita of Savoy — tomato, mozzarella, and basil mirroring the Italian flag.",
    cuisineFamily: "italian",
    imageUrl: "placeholder:🍕",
    dayIndex: 1,
  },
  {
    slug: "sushi-edomae",
    name: "Edomae Sushi",
    origin: { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
    history:
      "Modern hand-formed nigiri took shape in 1820s Edo as a fast-food street snack served from yatai stalls.",
    cuisineFamily: "japanese",
    imageUrl: "placeholder:🍣",
    dayIndex: 2,
  },
  {
    slug: "tacos-al-pastor",
    name: "Tacos al Pastor",
    origin: {
      city: "Mexico City",
      country: "Mexico",
      lat: 19.4326,
      lng: -99.1332,
    },
    history:
      "Lebanese immigrants brought shawarma's vertical spit to Puebla in the early 20th century; Mexico City swapped lamb for marinated pork.",
    cuisineFamily: "mexican",
    imageUrl: "placeholder:🌮",
    dayIndex: 3,
  },
  {
    slug: "chicken-tikka-masala",
    name: "Chicken Tikka Masala",
    origin: {
      city: "Glasgow",
      country: "United Kingdom",
      lat: 55.8642,
      lng: -4.2518,
    },
    history:
      "Most-cited origin: Shish Mahal in Glasgow in the 1970s, where a creamy tomato sauce was added to placate a customer's complaint about dry tikka.",
    cuisineFamily: "indian",
    imageUrl: "placeholder:🍛",
    dayIndex: 4,
  },
  {
    slug: "pho",
    name: "Pho",
    origin: { city: "Hanoi", country: "Vietnam", lat: 21.0285, lng: 105.8542 },
    history:
      "Emerged in early-1900s Nam Định province before settling into Hanoi's street-food canon; influenced by Chinese rice noodles and French pot-au-feu.",
    cuisineFamily: "vietnamese",
    imageUrl: "placeholder:🍲",
    dayIndex: 5,
  },
  {
    slug: "caesar-salad",
    name: "Caesar Salad",
    origin: {
      city: "Tijuana",
      country: "Mexico",
      lat: 32.5149,
      lng: -117.0382,
    },
    history:
      "Invented by Italian-American restaurateur Caesar Cardini in his Tijuana hotel kitchen during a busy 1924 Fourth of July when supplies ran low.",
    cuisineFamily: "italian",
    imageUrl: "/food_images/caesar_salad.png",
    dayIndex: 6,
  },
  {
    slug: "buffalo-wings",
    name: "Buffalo Wings",
    origin: {
      city: "Buffalo, NY",
      country: "USA",
      lat: 42.8864,
      lng: -78.8784,
    },
    history:
      "Created at Anchor Bar in 1964 when Teressa Bellissimo improvised a late-night snack from leftover chicken wings + Frank's hot sauce.",
    cuisineFamily: "american",
    imageUrl: "placeholder:🍗",
    dayIndex: 7,
  },
  {
    slug: "bibimbap",
    name: "Bibimbap",
    origin: {
      city: "Jeonju",
      country: "South Korea",
      lat: 35.8242,
      lng: 127.148,
    },
    history:
      "Jeonju's traditional dolsot bibimbap is documented in 19th-century records; the city is officially recognized by UNESCO as a city of gastronomy.",
    cuisineFamily: "korean",
    imageUrl: "placeholder:🍱",
    dayIndex: 8,
  },
  {
    slug: "chana-masala",
    name: "Chana Masala",
    origin: { city: "Amritsar", country: "India", lat: 31.634, lng: 74.8723 },
    history:
      "A Punjabi staple of chickpeas in a cumin-coriander-tomato gravy; Amritsar's gurudwara langar tradition kept the recipe widely shared.",
    cuisineFamily: "indian",
    imageUrl: "placeholder:🫘",
    dayIndex: 9,
  },
  {
    slug: "hummus",
    name: "Hummus",
    origin: { city: "Beirut", country: "Lebanon", lat: 33.8938, lng: 35.5018 },
    history:
      "Earliest known recipe is in a 13th-century Cairo cookbook; the Levantine variant with tahini + lemon is the canonical modern form.",
    cuisineFamily: "mediterranean",
    imageUrl: "placeholder:🥙",
    dayIndex: 10,
  },
  {
    slug: "croissant",
    name: "Croissant",
    origin: { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
    history:
      "Adapted from the Austrian kipferl by Parisian boulangeries in the late 1830s; laminated dough technique is purely French.",
    cuisineFamily: "french",
    imageUrl: "placeholder:🥐",
    dayIndex: 11,
  },
  {
    slug: "borscht",
    name: "Borscht",
    origin: { city: "Kyiv", country: "Ukraine", lat: 50.4501, lng: 30.5234 },
    history:
      "Ukrainian beet-soup tradition dating to the 14th century; UNESCO inscribed it on the Intangible Cultural Heritage list in 2022.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🥣",
    dayIndex: 12,
  },
  {
    slug: "goulash",
    name: "Goulash",
    origin: {
      city: "Budapest",
      country: "Hungary",
      lat: 47.4979,
      lng: 19.0402,
    },
    history:
      "Cattle-herder dish (gulyás) from the Hungarian Plain; paprika joined the canonical recipe after Ottoman trade routes brought capsicum to Europe.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🍲",
    dayIndex: 13,
  },
  {
    slug: "fish-and-chips",
    name: "Fish &amp; Chips",
    origin: {
      city: "London",
      country: "United Kingdom",
      lat: 51.5074,
      lng: -0.1278,
    },
    history:
      "Joseph Malin opened the first chippy in London's East End in 1860; the dish fed wartime Britain and was famously not rationed.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🍟",
    dayIndex: 14,
  },
  {
    slug: "peking-duck",
    name: "Peking Duck",
    origin: { city: "Beijing", country: "China", lat: 39.9042, lng: 116.4074 },
    history:
      "Imperial dish since the Yuan dynasty (14th century); the Quanjude restaurant codified the modern hung-roast technique in 1864.",
    cuisineFamily: "chinese",
    imageUrl: "placeholder:🦆",
    dayIndex: 15,
  },
  {
    slug: "mapo-tofu",
    name: "Mapo Tofu",
    origin: { city: "Chengdu", country: "China", lat: 30.5728, lng: 104.0668 },
    history:
      "Created in the 1860s by an elderly woman known as Pock-Marked Grandma (Mapo) in a small Chengdu eatery; its mala numbing-spice profile is a Sichuan signature.",
    cuisineFamily: "chinese",
    imageUrl: "placeholder:🌶️",
    dayIndex: 16,
  },
  {
    slug: "ceviche",
    name: "Ceviche",
    origin: { city: "Lima", country: "Peru", lat: -12.0464, lng: -77.0428 },
    history:
      "Pre-Columbian Moche people cured fish in fermented banana-passionfruit juice; modern lime-cured ceviche emerged after Spanish citrus arrived in the 16th century.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🐟",
    dayIndex: 17,
  },
  {
    slug: "feijoada",
    name: "Feijoada",
    origin: {
      city: "Rio de Janeiro",
      country: "Brazil",
      lat: -22.9068,
      lng: -43.1729,
    },
    history:
      "Black-bean and pork stew that grew out of Portuguese cozido cooking adapted by enslaved kitchens; it is Brazil's de-facto national dish.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🫘",
    dayIndex: 18,
  },
  {
    slug: "empanadas",
    name: "Empanadas",
    origin: {
      city: "Buenos Aires",
      country: "Argentina",
      lat: -34.6037,
      lng: -58.3816,
    },
    history:
      "Galician immigrants brought their savory hand-pies to the Río de la Plata in the 1800s; each Argentine province now has its own filling and crimp.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🥟",
    dayIndex: 19,
  },
  {
    slug: "jollof-rice",
    name: "Jollof Rice",
    origin: { city: "Dakar", country: "Senegal", lat: 14.7167, lng: -17.4677 },
    history:
      "Wolof origins in the Senegambian region; thiéboudienne (the riziform ancestor) is recognized by UNESCO as Senegalese intangible heritage.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🍚",
    dayIndex: 20,
  },
  {
    slug: "tagine",
    name: "Lamb Tagine",
    origin: {
      city: "Marrakech",
      country: "Morocco",
      lat: 31.6295,
      lng: -7.9811,
    },
    history:
      "The conical clay tagine pot circulates moisture so meat braises tenderly over coals; the Marrakech medina is a contemporary capital of the technique.",
    cuisineFamily: "mediterranean",
    imageUrl: "placeholder:🥘",
    dayIndex: 21,
  },
  {
    slug: "kibbeh",
    name: "Kibbeh",
    origin: { city: "Aleppo", country: "Syria", lat: 36.2021, lng: 37.1343 },
    history:
      "Aleppine cuisine has dozens of kibbeh forms — fried, baked, raw — many predating the Ottoman era; each city in the Levant has its signature.",
    cuisineFamily: "mediterranean",
    imageUrl: "placeholder:🥩",
    dayIndex: 22,
  },
  {
    slug: "falafel",
    name: "Falafel",
    origin: { city: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
    history:
      "Coptic Egyptians adopted fava-bean fritters during Lent; the Levantine chickpea version spread north in the 19th century and became Israel's most contested street food.",
    cuisineFamily: "mediterranean",
    imageUrl: "placeholder:🧆",
    dayIndex: 23,
  },
  {
    slug: "doner-kebab",
    name: "Döner Kebab",
    origin: { city: "Bursa", country: "Turkey", lat: 40.1885, lng: 29.061 },
    history:
      "İskender Efendi popularised the vertical-spit kebab in 1860s Bursa; the Berlin-style sandwich form was invented by Turkish guest workers in 1972.",
    cuisineFamily: "mediterranean",
    imageUrl: "placeholder:🥙",
    dayIndex: 24,
  },
  {
    slug: "souvlaki",
    name: "Souvlaki",
    origin: { city: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275 },
    history:
      "Charcoal-grilled meat skewers documented in 17th-century BCE Mycenaean records; Athens taverna culture made it the country's de-facto fast food.",
    cuisineFamily: "mediterranean",
    imageUrl: "placeholder:🍢",
    dayIndex: 25,
  },
  {
    slug: "paella",
    name: "Paella",
    origin: { city: "Valencia", country: "Spain", lat: 39.4699, lng: -0.3763 },
    history:
      "Originated in Albufera marshland kitchens around Valencia in the 18th century; the canonical Valencian recipe uses rabbit, chicken, and runner beans — never seafood.",
    cuisineFamily: "mediterranean",
    imageUrl: "placeholder:🥘",
    dayIndex: 26,
  },
  {
    slug: "risotto-alla-milanese",
    name: "Risotto alla Milanese",
    origin: { city: "Milan", country: "Italy", lat: 45.4642, lng: 9.19 },
    history:
      "Saffron-tinted risotto first appears in a 1574 Milanese chronicle of a duomo glass-painter's wedding banquet; it is Lombardy's signature primo.",
    cuisineFamily: "italian",
    imageUrl: "placeholder:🍚",
    dayIndex: 27,
  },
  {
    slug: "lasagna-bolognese",
    name: "Lasagne alla Bolognese",
    origin: { city: "Bologna", country: "Italy", lat: 44.4949, lng: 11.3426 },
    history:
      "Bologna's Camera di Commercio deposited the official ragù recipe in 1982; the dish itself dates to medieval cookbooks of the Emilian aristocracy.",
    cuisineFamily: "italian",
    imageUrl: "placeholder:🍝",
    dayIndex: 28,
  },
  {
    slug: "carbonara",
    name: "Spaghetti alla Carbonara",
    origin: { city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
    history:
      "First documented in 1944 in postwar Rome — guanciale, eggs, pecorino, and black pepper, possibly riffing on US Army C-rations.",
    cuisineFamily: "italian",
    imageUrl: "placeholder:🍝",
    dayIndex: 29,
  },
  {
    slug: "bratwurst",
    name: "Nürnberger Bratwurst",
    origin: {
      city: "Nuremberg",
      country: "Germany",
      lat: 49.4521,
      lng: 11.0767,
    },
    history:
      "Documented since 1313 in Nuremberg city ordinances regulating sausage size and ingredient purity; PGI-protected since 2003.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🌭",
    dayIndex: 30,
  },
  {
    slug: "wiener-schnitzel",
    name: "Wiener Schnitzel",
    origin: { city: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738 },
    history:
      "Pounded breaded veal cutlet; legally only Wiener Schnitzel when made of veal in Austria, otherwise it is Wiener Schnitzel vom Schwein.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🍖",
    dayIndex: 31,
  },
  {
    slug: "smorrebrod",
    name: "Smørrebrød",
    origin: {
      city: "Copenhagen",
      country: "Denmark",
      lat: 55.6761,
      lng: 12.5683,
    },
    history:
      "Open-faced rye sandwich tradition codified by Copenhagen's Ida Davidsen restaurant in the 1880s; over 250 named compositions in the Danish canon.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🍞",
    dayIndex: 32,
  },
  {
    slug: "poutine",
    name: "Poutine",
    origin: { city: "Warwick", country: "Canada", lat: 45.9551, lng: -71.9819 },
    history:
      "Invented in 1957 by Fernand Lachance in Warwick, Quebec; the cheese-curd-on-fries with gravy is an UNESCO-acknowledged French-Canadian icon.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🍟",
    dayIndex: 33,
  },
  {
    slug: "jerk-chicken",
    name: "Jerk Chicken",
    origin: {
      city: "Boston Bay",
      country: "Jamaica",
      lat: 18.1781,
      lng: -76.4115,
    },
    history:
      "Maroon descendants of enslaved Africans developed pimento-wood smoking in Portland Parish; Boston Bay still hosts the original roadside jerk pits.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🍗",
    dayIndex: 34,
  },
  {
    slug: "ramen-sapporo",
    name: "Sapporo Miso Ramen",
    origin: { city: "Sapporo", country: "Japan", lat: 43.0621, lng: 141.3544 },
    history:
      "Aji-no-Sanpei chef Morito Omiya invented the miso-ramen variant in 1955; Sapporo's Susukino Ramen Yokocho became the dish's holy alley.",
    cuisineFamily: "japanese",
    imageUrl: "placeholder:🍜",
    dayIndex: 35,
  },
  {
    slug: "tonkatsu",
    name: "Tonkatsu",
    origin: { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
    history:
      "Renpaitei restaurant in Ginza began serving the panko-breaded pork cutlet in 1899 as part of the yōshoku Western-influenced cuisine wave.",
    cuisineFamily: "japanese",
    imageUrl: "placeholder:🍱",
    dayIndex: 36,
  },
  {
    slug: "bulgogi",
    name: "Bulgogi",
    origin: {
      city: "Seoul",
      country: "South Korea",
      lat: 37.5665,
      lng: 126.978,
    },
    history:
      "Marinated grilled beef tracing to Goguryeo-era maekjeok; Seoul's modern soy-sesame marinade dates to the early 20th century.",
    cuisineFamily: "korean",
    imageUrl: "placeholder:🥩",
    dayIndex: 37,
  },
  {
    slug: "shakshuka",
    name: "Shakshuka",
    origin: { city: "Tunis", country: "Tunisia", lat: 36.8065, lng: 10.1815 },
    history:
      "Eggs poached in spiced tomato-pepper stew; Tunisian Jews carried the recipe to Israel in the 1950s where it became a brunch icon.",
    cuisineFamily: "mediterranean",
    imageUrl: "placeholder:🍳",
    dayIndex: 38,
  },
  {
    slug: "pad-see-ew",
    name: "Pad See Ew",
    origin: {
      city: "Bangkok",
      country: "Thailand",
      lat: 13.7563,
      lng: 100.5018,
    },
    history:
      "Thai-Chinese stir-fry of wide rice noodles with dark soy and Chinese broccoli; the dish reflects 19th-century Teochew migration to Bangkok.",
    cuisineFamily: "thai",
    imageUrl: "placeholder:🍜",
    dayIndex: 39,
  },
  {
    slug: "char-kway-teow",
    name: "Char Kway Teow",
    origin: {
      city: "George Town",
      country: "Malaysia",
      lat: 5.4145,
      lng: 100.3292,
    },
    history:
      "Penang hawker classic of flat rice noodles wok-tossed with cockles and Chinese sausage; Hokkien dock-workers' dinner adapted into Malaysia's signature dish.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🍝",
    dayIndex: 40,
  },
  {
    slug: "banh-mi",
    name: "Bánh Mì",
    origin: {
      city: "Ho Chi Minh City",
      country: "Vietnam",
      lat: 10.8231,
      lng: 106.6297,
    },
    history:
      "Saigon street vendors fused French baguettes with Vietnamese cured meats and pickled daikon in the 1950s.",
    cuisineFamily: "vietnamese",
    imageUrl: "placeholder:🥖",
    dayIndex: 41,
  },
  {
    slug: "ramen-hakata",
    name: "Hakata Tonkotsu Ramen",
    origin: { city: "Fukuoka", country: "Japan", lat: 33.5904, lng: 130.4017 },
    history:
      "Pork-bone broth boiled until milky white; the Hakata yatai food-stall tradition gave rise to the kaedama (extra-noodle) refill culture.",
    cuisineFamily: "japanese",
    imageUrl: "placeholder:🍜",
    dayIndex: 42,
  },
  {
    slug: "doro-wat",
    name: "Doro Wat",
    origin: {
      city: "Addis Ababa",
      country: "Ethiopia",
      lat: 9.032,
      lng: 38.7469,
    },
    history:
      "Spiced chicken stew slow-cooked with berbere and niter kibbeh; served on injera and considered Ethiopia's celebratory national dish.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🍲",
    dayIndex: 43,
  },
  {
    slug: "chicken-adobo",
    name: "Chicken Adobo",
    origin: {
      city: "Manila",
      country: "Philippines",
      lat: 14.5995,
      lng: 120.9842,
    },
    history:
      "Vinegar-and-soy braise with ancient pre-colonial roots; the name was given by Spanish chroniclers in the 1600s but the technique predates them.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🍗",
    dayIndex: 44,
  },
  {
    slug: "nasi-goreng",
    name: "Nasi Goreng",
    origin: {
      city: "Jakarta",
      country: "Indonesia",
      lat: -6.2088,
      lng: 106.8456,
    },
    history:
      "Indonesian leftover-rice fry-up shaped by Hokkien Chinese stir-fry technique; named the second most-delicious food in CNN's 2017 World's 50 Best Foods reader poll.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🍚",
    dayIndex: 45,
  },
  {
    slug: "mole-poblano",
    name: "Mole Poblano",
    origin: { city: "Puebla", country: "Mexico", lat: 19.0414, lng: -98.2063 },
    history:
      "Convent kitchens of Puebla developed the chocolate-chile mole legend in the 17th century; recipes typically run 25–30 ingredients.",
    cuisineFamily: "mexican",
    imageUrl: "placeholder:🍫",
    dayIndex: 46,
  },
  {
    slug: "khinkali",
    name: "Khinkali",
    origin: { city: "Tbilisi", country: "Georgia", lat: 41.7151, lng: 44.8271 },
    history:
      "Pleated soup-dumpling from the highland Georgian regions of Pshavi and Khevsureti; the topknot is held while you sip the broth, then discarded.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🥟",
    dayIndex: 47,
  },
  {
    slug: "apple-pie",
    name: "Apple Pie",
    origin: {
      city: "Amsterdam",
      country: "Netherlands",
      lat: 52.3676,
      lng: 4.9041,
    },
    history:
      "Dutch appeltaart recipes appear in 1514 cookbooks; English colonists carried the form to America where it became iconic two centuries later.",
    cuisineFamily: "comfort-classic",
    imageUrl: "placeholder:🥧",
    dayIndex: 48,
  },
  {
    slug: "tom-kha-gai",
    name: "Tom Kha Gai",
    origin: {
      city: "Chiang Mai",
      country: "Thailand",
      lat: 18.7883,
      lng: 98.9853,
    },
    history:
      "Northern-Thai chicken soup of coconut milk, galangal, and lime leaf; tom kha is one of three canonical Thai soups (with tom yum and tom som).",
    cuisineFamily: "thai",
    imageUrl: "placeholder:🍲",
    dayIndex: 49,
  },
];
