/**
 * Ingest Chef Tu David Phu's published recipes into the Sous catalog.
 *
 * Partner chef (co-launch): Tu David Phu — Oakland Vietnamese-American chef,
 * Top Chef S15, SF Chronicle Rising Star, author of "The Memory of Taste"
 * (Soleil Ho, Ten Speed Press). Recipes here are drawn ONLY from his FREE,
 * publicly-published recipe library at https://cheftu.com/recipelibrary —
 * NOT from the copyrighted cookbook.
 *
 * Rule 7 + copyright handling:
 *   - Every dish is a real, attributed recipe from his public library (the
 *     `source` field links the exact page). Nothing here is invented.
 *   - Descriptions are ORIGINAL (our own neutral wording describing well-known
 *     dishes) — his headnotes / stories / step prose are NOT reproduced.
 *   - His PHOTOS are copyrighted: we do NOT download them or set them as
 *     heroImageUrl. Each dish uses the app's gradient+emoji fallback
 *     (heroImageUrl/imageUrl = null) until the partner photoshoot. The exact
 *     source-image URLs are recorded SEPARATELY in
 *     src/data/chef-tu-image-references.json purely as reshoot reference for
 *     the photo team (linked, never copied into the repo or shipped).
 *
 * All ids are namespaced `tu-` so they never collide with the existing catalog
 * (which already has generic `pho`, `banh-mi`, `bun-bo-hue`, `goi-ga`,
 * `soondubu-jjigae`, `vietnamese-coffee`, etc.) and so the partnership content
 * is filterable.
 *
 *   node scripts/ingest-chef-tu.mjs            # write
 *   node scripts/ingest-chef-tu.mjs --dry-run  # report only
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = "Tu David Phu · cheftu.com recipe library";
const url = (slug) => `https://cheftu.com/recipelibrary/${slug}`;

// ── MEALS (mains) ─────────────────────────────────────────────────────────
// id, name, cuisine, aliases, description (original), sidePool, slug, img, time, servings
const MEALS = [
  {
    id: "tu-pho-dac-biet",
    name: "Phở Đặc Biệt (Special Beef Pho)",
    cuisine: "Vietnamese",
    aliases: ["pho dac biet", "special beef pho", "pho", "beef pho"],
    description:
      "The 'house special' beef pho: a clear bone broth simmered for hours with charred onion, ginger, star anise and cinnamon, ladled over rice noodles with brisket, tendon, tripe and beef balls, finished with herbs, lime and chili.",
    sidePool: [
      "tu-nuoc-cham",
      "spring-rolls",
      "summer-rolls",
      "goi-cuon",
      "tu-goi-ga",
      "tu-ca-tai-chanh",
    ],
    slug: "phodacbiet",
    img: "https://i.imgur.com/6hFOojG.jpg",
    time: 780,
    servings: 6,
  },
  {
    id: "tu-pho-ga",
    name: "Phở Gà (Chicken Pho)",
    cuisine: "Vietnamese",
    aliases: ["pho ga", "chicken pho"],
    description:
      "A lighter, gingery chicken pho — whole chicken poached into a clean stock with charred aromatics, served over rice noodles with poached chicken, scallion and herbs.",
    sidePool: [
      "tu-nuoc-cham",
      "spring-rolls",
      "summer-rolls",
      "goi-cuon",
      "tu-goi-ga",
      "tu-rau-muong",
    ],
    slug: "phoga",
    img: "https://i.imgur.com/f4VbmoZ.jpeg",
    time: 160,
    servings: 4,
  },
  {
    id: "tu-turkey-pho",
    name: "Phở Gà Tây (Turkey Pho)",
    cuisine: "Vietnamese",
    aliases: ["turkey pho", "pho ga tay", "leftover turkey pho"],
    description:
      "A thrifty post-holiday pho that turns a leftover turkey carcass into a fragrant five-spice broth over rice noodles with shredded turkey and herbs.",
    sidePool: [
      "tu-nuoc-cham",
      "spring-rolls",
      "summer-rolls",
      "tu-goi-ga",
      "tu-rau-muong",
      "goi-cuon",
    ],
    slug: "turkeypho",
    img: "https://i.imgur.com/hj6HSMS.jpg",
    time: 210,
    servings: 6,
  },
  {
    id: "tu-soondubu-jjigae",
    name: "Soondubu Jjigae (Spicy Seafood Tofu Stew)",
    cuisine: "Korean",
    aliases: [
      "soondubu",
      "sundubu jjigae",
      "spicy tofu stew",
      "korean tofu stew",
    ],
    description:
      "A bubbling Korean stew of silken tofu, shrimp, squid, mussels and clams in a fiery gochugaru-and-fish-sauce broth, served piping hot with rice.",
    sidePool: [
      "tu-steamed-jasmine-rice",
      "tu-rau-muong",
      "tu-goi-ga",
      "smashed-cucumber-salad",
      "pickled-radish",
    ],
    slug: "soondubu",
    img: "https://i.imgur.com/MUxoiWl.jpg",
    time: 125,
    servings: 6,
  },
  {
    id: "tu-bun-rieu",
    name: "Bún Riêu (Crab & Tomato Noodle Soup)",
    cuisine: "Vietnamese",
    aliases: ["bun rieu", "crab noodle soup", "tomato crab soup"],
    description:
      "A tangy tomato-and-crab noodle soup built on a pork-rib broth with riêu crab-and-egg dumplings, fermented shrimp paste and fresh tomato, served over rice vermicelli.",
    sidePool: [
      "tu-nuoc-cham",
      "spring-rolls",
      "summer-rolls",
      "tu-rau-muong",
      "tu-goi-ga",
      "goi-cuon",
    ],
    slug: "bunrieu",
    img: "https://i.imgur.com/QjiMfZY.jpeg",
    time: 270,
    servings: 8,
  },
  {
    id: "tu-banh-canh-gio-heo-tom",
    name: "Bánh Canh Giò Heo Tôm (Pork & Shrimp Tapioca Noodle Soup)",
    cuisine: "Vietnamese",
    aliases: [
      "banh canh",
      "pork shrimp tapioca noodle soup",
      "banh canh gio heo",
    ],
    description:
      "Chewy hand-cut tapioca noodles in a shallot-forward pork broth with tender pork shank, ribs, shrimp and squid — a thick, comforting Central Vietnamese soup.",
    sidePool: [
      "tu-nuoc-cham",
      "tu-rau-muong",
      "spring-rolls",
      "tu-goi-ga",
      "summer-rolls",
    ],
    slug: "banhcanhgioheotom",
    img: "https://i.imgur.com/SDZVDd3.jpeg",
    time: 240,
    servings: 6,
  },
  {
    id: "tu-mi-hoanh-thanh",
    name: "Mì Hoành Thánh (Combination Wonton Egg Noodle Soup)",
    cuisine: "Vietnamese",
    aliases: ["mi hoanh thanh", "wonton egg noodle soup", "wonton mi"],
    description:
      "A Chinese-Vietnamese egg-noodle soup in a double pork-and-chicken stock, loaded with pork-and-shrimp wontons, char siu and gai lan.",
    sidePool: [
      "tu-nuoc-cham",
      "tu-rau-muong",
      "tu-garlic-noodles",
      "tu-goi-ga",
      "spring-rolls",
    ],
    slug: "hoanhthanhsup",
    img: "https://i.imgur.com/6avOzqX.jpeg",
    time: 135,
    servings: 4,
  },
  {
    id: "tu-bun-bo-hue",
    name: "Bún Bò Huế (Spicy Beef & Pork Noodle Soup)",
    cuisine: "Vietnamese",
    aliases: ["bun bo hue", "spicy beef noodle soup", "hue beef noodle"],
    description:
      "The bold, lemongrass-and-chili noodle soup of Huế — a rich beef-and-pork-knuckle broth with shrimp paste and annatto, served over thick round rice noodles with beef shank, tendon and herbs.",
    sidePool: [
      "tu-nuoc-cham",
      "spring-rolls",
      "summer-rolls",
      "tu-rau-muong",
      "tu-goi-ga",
      "goi-cuon",
    ],
    slug: "bunbohue",
    img: "https://i.imgur.com/JwZh56P.jpeg",
    time: 450,
    servings: 6,
  },
  {
    id: "tu-mi-xao-gion",
    name: "Mì Xào Giòn (Crispy Bird's Nest Noodles)",
    cuisine: "Vietnamese",
    aliases: ["mi xao gion", "crispy birds nest", "crispy fried noodles"],
    description:
      "A crispy 'bird's nest' of fried egg noodles topped with a glossy stir-fry of shrimp, mushrooms, broccoli and carrot in an oyster-hoisin gravy that softens the noodles as you eat.",
    sidePool: [
      "tu-rau-muong",
      "tu-goi-ga",
      "tu-ca-tai-chanh",
      "spring-rolls",
      "tu-nuoc-cham",
    ],
    slug: "crispybirdsnest",
    img: "https://i.imgur.com/Y87KMdO.jpeg",
    time: 25,
    servings: 4,
  },
  {
    id: "tu-bun-ga-nuong",
    name: "Bún Gà Nướng (Grilled Lemongrass Chicken Vermicelli)",
    cuisine: "Vietnamese",
    aliases: [
      "bun ga nuong",
      "grilled lemongrass chicken vermicelli",
      "grilled chicken noodle bowl",
    ],
    description:
      "A fresh rice-vermicelli bowl topped with smoky lemongrass-marinated grilled chicken, herbs, pickles and peanuts, dressed at the table with nước chấm.",
    sidePool: [
      "tu-nuoc-cham",
      "spring-rolls",
      "summer-rolls",
      "tu-goi-ga",
      "tu-rau-muong",
      "goi-cuon",
    ],
    slug: "bunganuong",
    img: "https://i.imgur.com/1VmgbNo.jpg",
    time: 75,
    servings: 4,
  },
  {
    id: "tu-bun-nem-nuong",
    name: "Bún Nem Nướng (Grilled Pork Sausage Vermicelli)",
    cuisine: "Vietnamese",
    aliases: [
      "bun nem nuong",
      "grilled pork sausage vermicelli",
      "nem nuong noodle bowl",
    ],
    description:
      "Springy grilled pork-sausage patties over rice vermicelli with fresh herbs, pickled carrot and daikon, peanuts and nước chấm.",
    sidePool: [
      "tu-nuoc-cham",
      "spring-rolls",
      "summer-rolls",
      "tu-goi-ga",
      "goi-cuon",
      "tu-rau-muong",
    ],
    slug: "bunnemnuong",
    img: "https://i.imgur.com/Ej39KIJ.jpg",
    time: 90,
    servings: 4,
  },
  {
    id: "tu-com-ga-hai-nam",
    name: "Cơm Gà Hải Nam (Hainanese Chicken & Rice)",
    cuisine: "Vietnamese",
    aliases: ["com ga hai nam", "hainanese chicken rice", "chicken and rice"],
    description:
      "Silky poached chicken with rice cooked in the chicken stock, served with a spicy ginger dipping sauce, cucumber and tomato — the Viet diaspora take on Hainanese chicken rice.",
    sidePool: [
      "tu-canh-cu-cai",
      "tu-rau-muong",
      "tu-nuoc-cham",
      "tu-goi-ga",
      "smashed-cucumber-salad",
    ],
    slug: "comgahainam",
    img: "https://i.imgur.com/CkZjP0G.jpg",
    time: 60,
    servings: 4,
  },
  {
    id: "tu-com-suon",
    name: "Cơm Sườn (Grilled Pork Chop Rice Plate)",
    cuisine: "Vietnamese",
    aliases: [
      "com suon",
      "pork chop rice",
      "com tam suon",
      "broken rice pork chop",
    ],
    description:
      "A Saigon-style rice plate of marinated fried pork chop over rice, served with pickles, scallion oil and nước chấm.",
    sidePool: [
      "tu-canh-cu-cai",
      "tu-rau-muong",
      "tu-nuoc-cham",
      "tu-cha-trung-hap",
      "tu-goi-ga",
    ],
    slug: "comsuonchein",
    img: "https://i.imgur.com/28r6I09.jpg",
    time: 535,
    servings: 4,
  },
  {
    id: "tu-thit-kho-trung",
    name: "Thịt Kho Trứng (Braised Pork Belly & Eggs)",
    cuisine: "Vietnamese",
    aliases: [
      "thit kho trung",
      "braised pork and eggs",
      "caramelized pork belly",
      "thit kho",
    ],
    description:
      "Pork belly and soft eggs braised in caramel and coconut water until glossy and tender — Vietnamese 'soul food', traditionally eaten through Tết, served with steamed rice.",
    sidePool: [
      "tu-steamed-jasmine-rice",
      "tu-rau-muong",
      "tu-canh-cu-cai",
      "tu-nuoc-cham",
      "smashed-cucumber-salad",
    ],
    slug: "thitkhotrung",
    img: "https://i.imgur.com/paDsJSA.jpg",
    time: 90,
    servings: 6,
  },
  {
    id: "tu-char-siu-banh-mi",
    name: "Char Siu Bánh Mì (Char Siu Pork Banh Mi)",
    cuisine: "Vietnamese",
    aliases: ["char siu banh mi", "bbq pork banh mi", "banh mi"],
    description:
      "A crackly baguette layered with char-siu-marinated pork and creamy chicken-liver pâté, pickled carrot and daikon, cucumber, cilantro and chili.",
    sidePool: [
      "tu-garlic-noodles",
      "tu-goi-ga",
      "tu-ca-tai-chanh",
      "spring-rolls",
      "tu-rau-muong",
    ],
    slug: "charsiubanhmi",
    img: "https://i.imgur.com/awDtAmi.jpeg",
    time: 70,
    servings: 4,
  },
  {
    id: "tu-banh-mi-trung-op-la",
    name: "Bánh Mì Trứng Ốp La (Fried Egg Banh Mi)",
    cuisine: "Vietnamese",
    aliases: ["banh mi trung", "fried egg banh mi", "egg banh mi"],
    description:
      "A quick breakfast banh mi of crispy fried eggs with runny yolks, pâté and Kewpie mayo, pickles, cucumber and cilantro in a warm roll.",
    sidePool: [
      "tu-garlic-noodles",
      "tu-goi-ga",
      "tu-ca-tai-chanh",
      "spring-rolls",
      "tu-bac-xiu",
    ],
    slug: "banhmitrung",
    img: "https://i.imgur.com/oE05IQP.jpg",
    time: 10,
    servings: 2,
  },
  {
    id: "tu-ga-kho-gung",
    name: "Gà Kho Gừng (Caramelized Ginger Chicken)",
    cuisine: "Vietnamese",
    aliases: ["ga kho gung", "ginger chicken", "caramelized ginger chicken"],
    description:
      "Chicken braised with plenty of ginger, shallot and lemongrass in a salty-sweet caramel and coconut water until sticky and deeply savory — a clay-pot home classic for rice.",
    sidePool: [
      "tu-steamed-jasmine-rice",
      "tu-rau-muong",
      "tu-canh-cu-cai",
      "tu-nuoc-cham",
      "tu-goi-ga",
    ],
    slug: "gingerchicken",
    img: "https://i.imgur.com/QE9nIT9.jpeg",
    time: 60,
    servings: 4,
  },
  {
    id: "tu-ga-chien",
    name: "Gà Chiên (Vietnamese Fried Chicken)",
    cuisine: "Vietnamese",
    aliases: [
      "ga chien",
      "vietnamese fried chicken",
      "salt and chili fried chicken",
    ],
    description:
      "Shatter-crisp fried chicken marinated with garlic, ginger and lemongrass and tossed in salt and chili — the Viet answer to fried chicken.",
    sidePool: [
      "tu-steamed-jasmine-rice",
      "tu-goi-ga",
      "tu-rau-muong",
      "tu-nuoc-cham",
      "smashed-cucumber-salad",
    ],
    slug: "vietnamesefriedchicken",
    img: "https://i.imgur.com/WQ1Mgi3.jpeg",
    time: 120,
    servings: 4,
  },
  {
    id: "tu-thit-heo-quay",
    name: "Thịt Heo Quay (Crispy Roast Pork Belly)",
    cuisine: "Vietnamese",
    aliases: [
      "thit heo quay",
      "crispy pork belly",
      "roast pork belly",
      "heo quay",
    ],
    description:
      "Roast pork belly with shatteringly crisp crackling and lemongrass-scented meat — a celebratory dish for weddings and holidays, sliced for rice or banh mi.",
    sidePool: [
      "tu-steamed-jasmine-rice",
      "tu-rau-muong",
      "tu-canh-cu-cai",
      "tu-nuoc-cham",
      "tu-goi-ga",
    ],
    slug: "thitheoquay",
    img: "https://i.imgur.com/uTyWgj7.jpg",
    time: 180,
    servings: 4,
  },
];

// ── SIDES (accompaniments, condiments, salads, sweets, drinks) ────────────
const SIDES = [
  {
    id: "tu-nuoc-cham",
    name: "Nước Chấm (Seasoned Fish Sauce)",
    cuisine: "Vietnamese",
    description:
      "The essential Vietnamese table sauce — fish sauce balanced with lime, sugar, garlic and chili, used as a dip and dressing for nearly everything.",
    tags: ["condiment", "sauce", "vietnamese"],
    pairingReason:
      "the bright salty-sweet-sour dip that ties a Vietnamese plate together",
    nutritionCategory: "vegetable",
    slug: "nuoccham",
    img: "https://i.imgur.com/3S239dq.jpg",
    time: 14,
    servings: 4,
  },
  {
    id: "tu-steamed-jasmine-rice",
    name: "Cơm (Steamed Jasmine Rice)",
    cuisine: "Vietnamese",
    description:
      "Properly washed and steamed medium-grain rice — the foundation of the Vietnamese table, fluffy and separate.",
    tags: ["rice", "staple", "vietnamese"],
    pairingReason:
      "the neutral, fluffy base for braises, grills and stir-fries",
    nutritionCategory: "carb",
    slug: "howtocookrice",
    img: "https://i.imgur.com/LBF9srd.jpg",
    time: 35,
    servings: 4,
  },
  {
    id: "tu-garlic-noodles",
    name: "Mì Xào Tỏi (Vietnamese Garlic Noodles)",
    cuisine: "Vietnamese",
    description:
      "Buttery egg noodles tossed with toasted garlic, fish sauce and oyster sauce — a Viet-American steakhouse side that goes with almost anything.",
    tags: ["noodles", "garlic", "vietnamese"],
    pairingReason: "buttery garlic noodles round out grilled and roasted mains",
    nutritionCategory: "carb",
    slug: "garlicnoodles",
    img: "https://i.imgur.com/cAWQa4T.jpg",
    time: 30,
    servings: 4,
  },
  {
    id: "tu-rau-muong",
    name: "Rau Muống Xào (Stir-Fried Water Spinach)",
    cuisine: "Vietnamese",
    description:
      "Water spinach flash-stir-fried with garlic, fish sauce and dried shrimp until just tender and glossy — a crunchy green for any rice meal.",
    tags: ["vegetable", "stir-fry", "vietnamese"],
    pairingReason:
      "garlicky greens to cut through rich braises and fried mains",
    nutritionCategory: "vegetable",
    slug: "raumuong",
    img: "https://i.imgur.com/PJBXYlG.jpg",
    time: 45,
    servings: 6,
  },
  {
    id: "tu-canh-cu-cai",
    name: "Canh Củ Cải (Daikon & Pork Rib Soup)",
    cuisine: "Vietnamese",
    description:
      "A clean, gently sweet broth of daikon and carrot simmered with pork ribs and dried shrimp — the everyday 'canh' soup that accompanies a rice meal.",
    tags: ["soup", "light", "vietnamese"],
    pairingReason: "a light, clean soup to balance a rice-and-protein plate",
    nutritionCategory: "vegetable",
    slug: "canhcucai",
    img: "https://i.imgur.com/MGYJYRG.jpg",
    time: 50,
    servings: 4,
  },
  {
    id: "tu-goi-ga",
    name: "Gỏi Gà (Vietnamese Chicken & Cabbage Salad)",
    cuisine: "Vietnamese",
    description:
      "A crunchy shredded-cabbage and poached-chicken salad with mint, cilantro, red onion and peanuts in a tangy fish-sauce dressing.",
    tags: ["salad", "chicken", "vietnamese"],
    pairingReason: "a crisp, herby salad to lighten a rich main",
    nutritionCategory: "vegetable",
    slug: "goiga",
    img: "https://i.imgur.com/DblW0IK.jpg",
    time: 65,
    servings: 4,
  },
  {
    id: "tu-ca-tai-chanh",
    name: "Cá Tái Chanh (Vietnamese Ceviche)",
    cuisine: "Vietnamese",
    description:
      "Fresh raw fish 'cooked' in lime and fish sauce with ginger, scallion, chili and sesame — a bright, citrusy seafood starter.",
    tags: ["seafood", "ceviche", "appetizer", "vietnamese"],
    pairingReason: "a bright, citrusy seafood starter before a heavier main",
    nutritionCategory: "protein",
    slug: "vietnameseceviche",
    img: "https://i.imgur.com/31xPSOO.jpg",
    time: 40,
    servings: 4,
  },
  {
    id: "tu-banh-tom",
    name: "Bánh Tôm (Shrimp & Sweet Potato Fritter)",
    cuisine: "Vietnamese",
    description:
      "Crisp turmeric fritters of whole shrimp and matchstick sweet potato, eaten with herbs and nước chấm — a Hanoi street snack.",
    tags: ["fritter", "shrimp", "appetizer", "vietnamese"],
    pairingReason: "a crunchy fried starter to share before the meal",
    nutritionCategory: "protein",
    slug: "banhtom",
    img: "https://i.imgur.com/6JI5rMV.jpg",
    time: 105,
    servings: 4,
  },
  {
    id: "tu-cha-trung-hap",
    name: "Chả Trứng Hấp (Steamed Egg & Pork Terrine)",
    cuisine: "Vietnamese",
    description:
      "A steamed savory custard of ground pork, egg, glass noodles and wood-ear mushroom, sliced into the rice plate — a com tam classic.",
    tags: ["egg", "pork", "vietnamese"],
    pairingReason: "a soft, savory terrine that completes a broken-rice plate",
    nutritionCategory: "protein",
    slug: "chatrunghap",
    img: "https://i.imgur.com/R0k0IgE.jpg",
    time: 75,
    servings: 4,
  },
  {
    id: "tu-cha-gio-khoai-mon",
    name: "Chả Giò Khoai Môn (Taro Egg Rolls)",
    cuisine: "Vietnamese",
    description:
      "Crackly fried egg rolls stuffed with pork, taro, glass noodles and carrot, cut and eaten with herbs and nước chấm.",
    tags: ["egg-roll", "fried", "appetizer", "vietnamese"],
    pairingReason: "crisp fried rolls to share, dipped in nước chấm",
    nutritionCategory: "protein",
    slug: "taroeggroll",
    img: "https://i.imgur.com/54LAiMo.jpg",
    time: 180,
    servings: 4,
  },
  {
    id: "tu-vietnamese-coffee-tiramisu",
    name: "Bánh Kem Vị Cafe (Vietnamese Coffee Tiramisu)",
    cuisine: "Vietnamese",
    description:
      "A diaspora tiramisu built on strong Vietnamese phin coffee and condensed milk with mascarpone cream and ladyfingers.",
    tags: ["dessert", "coffee", "vietnamese"],
    pairingReason: "a coffee-soaked dessert to close a Vietnamese meal",
    nutritionCategory: "carb",
    slug: "vietnamesecoffeetiramisu",
    img: "https://i.imgur.com/rhAAL6b.jpg",
    time: 60,
    servings: 6,
  },
  {
    id: "tu-banh-chuoi-nuong",
    name: "Bánh Chuối Nướng (Banana Bread Pudding)",
    cuisine: "Vietnamese",
    description:
      "A baked banana pudding of caramelized lady-finger bananas, croissant or bread, coconut milk and condensed milk — a frugal, fragrant family dessert.",
    tags: ["dessert", "banana", "vietnamese"],
    pairingReason: "a warm, custardy dessert that uses up ripe bananas",
    nutritionCategory: "carb",
    slug: "banhchouinuong",
    img: "https://i.imgur.com/vrXh4qB.jpeg",
    time: 90,
    servings: 8,
  },
  {
    id: "tu-bac-xiu",
    name: "Bạc Xỉu (Saigon-Style Milk Coffee)",
    cuisine: "Vietnamese",
    description:
      "The gentler, milkier cousin of cà phê sữa — lots of condensed milk and whole milk with a splash of strong coffee over ice.",
    tags: ["drink", "coffee", "vietnamese"],
    pairingReason:
      "a sweet iced milk-coffee to sip alongside or after the meal",
    nutritionCategory: "dairy",
    slug: "saigonstylecoffee",
    img: "https://i.imgur.com/sZKd1ss.jpg",
    time: 15,
    servings: 1,
  },
  {
    id: "tu-brown-sugar-boba-coffee",
    name: "Brown Sugar Boba Coffee",
    cuisine: "Vietnamese",
    description:
      "Espresso over chewy brown-sugar boba pearls with milk and cream — a café-style iced coffee with tapioca.",
    tags: ["drink", "coffee", "boba"],
    pairingReason: "a sweet, chewy iced coffee treat",
    nutritionCategory: "dairy",
    slug: "brownsugarbobacoffee",
    img: "https://i.imgur.com/wIOwJ39.jpg",
    time: 8,
    servings: 1,
  },
];

// ── write ─────────────────────────────────────────────────────────────────
const dry = process.argv.includes("--dry-run");
const mealsPath = path.join(ROOT, "src/data/meals.json");
const sidesPath = path.join(ROOT, "src/data/sides.json");
const meals = JSON.parse(fs.readFileSync(mealsPath, "utf8"));
const sides = JSON.parse(fs.readFileSync(sidesPath, "utf8"));
const existing = new Set([
  ...meals.map((m) => m.id),
  ...sides.map((s) => s.id),
]);

const collisions = [...MEALS, ...SIDES]
  .map((d) => d.id)
  .filter((id) => existing.has(id));
if (collisions.length) {
  console.error("ABORT — id collisions:", collisions.join(", "));
  process.exit(1);
}

const imageRefs = [];
const newMeals = MEALS.map((d) => {
  imageRefs.push({
    id: d.id,
    name: d.name,
    kind: "meal",
    sourcePageUrl: url(d.slug),
    sourceImageUrl: d.img,
    totalTimeMinutes: d.time,
    servings: d.servings,
    status: "reshoot-needed",
  });
  return {
    id: d.id,
    name: d.name,
    aliases: d.aliases,
    heroImageUrl: null,
    sidePool: d.sidePool,
    cuisine: d.cuisine,
    description: d.description,
    nourishVerified: false,
    source: { creator: "Tu David Phu", url: url(d.slug) },
  };
});
const newSides = SIDES.map((d) => {
  imageRefs.push({
    id: d.id,
    name: d.name,
    kind: "side",
    sourcePageUrl: url(d.slug),
    sourceImageUrl: d.img,
    totalTimeMinutes: d.time,
    servings: d.servings,
    status: "reshoot-needed",
  });
  return {
    id: d.id,
    name: d.name,
    imageUrl: null,
    tags: d.tags,
    description: d.description,
    pairingReason: d.pairingReason,
    nutritionCategory: d.nutritionCategory,
    nourishVerified: false,
    source: { creator: "Tu David Phu", url: url(d.slug) },
  };
});

console.log(
  `Chef Tu ingest — ${newMeals.length} meals + ${newSides.length} sides (${imageRefs.length} image refs). dry-run=${dry}`,
);
if (dry) process.exit(0);

fs.writeFileSync(
  mealsPath,
  JSON.stringify([...meals, ...newMeals], null, 2) + "\n",
);
fs.writeFileSync(
  sidesPath,
  JSON.stringify([...sides, ...newSides], null, 2) + "\n",
);
fs.writeFileSync(
  path.join(ROOT, "src/data/chef-tu-image-references.json"),
  JSON.stringify(
    {
      _README:
        "PLACEHOLDER / RESHOOT REFERENCE ONLY. These are the source image URLs from Chef Tu David Phu's public recipe pages (cheftu.com), recorded so the partner photoshoot team knows what each dish looks like. They are COPYRIGHTED — not downloaded into the repo and NOT used by the app (every dish ships with heroImageUrl=null → gradient+emoji fallback until the aesthetic plate photoshoot replaces them with original /food_images/*.png).",
      creator: "Tu David Phu",
      library: "https://cheftu.com/recipelibrary",
      count: imageRefs.length,
      references: imageRefs,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `wrote meals.json (${meals.length + newMeals.length}), sides.json (${sides.length + newSides.length}), chef-tu-image-references.json`,
);
