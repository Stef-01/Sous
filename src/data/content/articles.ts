/**
 * Articles — sample editorial copy for the Content tab.
 *
 * Every article is fictional placeholder content authored by a fictional
 * sample expert (see ./experts.ts). Body copy intentionally sticks to
 * well-established consensus and avoids prescriptive medical claims.
 *
 * To replace this seed with real editorial content, swap the export
 * with a CMS-backed loader and keep the `Article` shape stable.
 */

import type { Article } from "@/types/content";

export const ARTICLES: Article[] = [
  {
    id: "art-myth-carbs",
    category: "articles",
    isPlaceholder: true,
    slug: "carbs-are-not-the-enemy",
    kicker: "Myth-busting",
    title: "Carbs are not the enemy",
    excerpt:
      "A 2,000-year tradition of rice doesn't suddenly become a metabolic problem because Instagram says so. Here's what the actual evidence says.",
    coverImageUrl: "/food_images/jeera_rice.png",
    body: [
      "Walk into most kitchens in the world and you'll find a starch on the counter — rice, roti, tortillas, bread, noodles, potatoes. These are not modern inventions and they are not why people are getting sick.",
      "When researchers compare populations who eat traditional whole-food diets — including the carbohydrate-heavy ones — what they consistently find is good metabolic health, low rates of cardiovascular disease, and long lifespans. The shift in disease burden tracks much more cleanly with ultra-processed food intake, sedentary lifestyles, and smoking than it does with carbohydrate share.",
      "The useful distinction isn't carb vs no-carb. It's whole vs processed. A bowl of jeera rice with dal is not the same nutritional event as a bag of crackers, even if a calorie-tracker app counts them the same.",
      "Practical move: keep the rice. Cook the beans. Eat the vegetables. The carbohydrate question takes care of itself.",
    ],
    authorId: "expert-maya-patel",
    readMinutes: 4,
    tags: ["myth-busting", "carbohydrates", "south-asian"],
    featured: true,
    createdAt: "2026-04-26T09:00:00.000Z",
  },
  {
    id: "art-spice-as-medicine",
    category: "articles",
    isPlaceholder: true,
    slug: "spice-as-medicine-without-the-supplement-shelf",
    kicker: "Nutrition science",
    title: "Spice as medicine, without the supplement shelf",
    excerpt:
      "Turmeric capsules are a multi-billion-dollar industry. The spice rack is cheaper, tastier, and probably better-absorbed.",
    coverImageUrl: "/food_images/butter_chicken.png",
    body: [
      "There is good evidence that compounds in common cooking spices — curcumin in turmeric, gingerols in ginger, capsaicin in chiles, allicin in garlic — exert measurable anti-inflammatory and antioxidant effects.",
      "There is also good evidence that the way spices are traditionally cooked — bloomed in fat, often with black pepper or onion — improves their bioavailability dramatically. A turmeric capsule taken on an empty stomach is barely absorbed. Turmeric in a tadka with ghee and pepper is a different story.",
      "None of this means spices cure anything. It means a culturally rooted home-cooked meal is doing real metabolic work that a supplement bottle keeps trying — and mostly failing — to replicate.",
      "Try this: keep five spices on the counter and use them daily. Cumin, coriander, turmeric, black pepper, and red chili powder will carry an enormous amount of cooking, and your body will get the compounds in the form it actually evolved to recognize.",
    ],
    authorId: "expert-maya-patel",
    readMinutes: 5,
    tags: ["spices", "anti-inflammatory", "indian"],
    createdAt: "2026-04-22T09:00:00.000Z",
  },
  {
    id: "art-blood-pressure-pantry",
    category: "articles",
    isPlaceholder: true,
    slug: "the-blood-pressure-pantry",
    kicker: "Clinician viewpoint",
    title: "The blood-pressure pantry",
    excerpt:
      "Cutting salt is the first thing patients hear. The second thing — and arguably the more useful one — is adding potassium.",
    coverImageUrl: "/food_images/grilled_salmon.png",
    body: [
      "When patients ask me what to eat for blood pressure, the conversation usually starts with sodium. That's reasonable, but it's only half the story.",
      "Potassium-rich foods — beans, leafy greens, sweet potatoes, salmon, yogurt, bananas, tomatoes — are some of the most consistent dietary signals we have for lower blood pressure across populations. Most adults consume about half the potassium their bodies were calibrated for.",
      "If you can't easily change a packaged-food-heavy environment, the next best move is to add. A daily serving of beans. A sweet potato instead of a baked potato. A salad with real leaves. Salmon or sardines twice a week.",
      "This is not a substitute for medication when medication is indicated. It is a steady, low-cost intervention that consistently makes the medication work better.",
    ],
    authorId: "expert-david-chen",
    readMinutes: 5,
    tags: ["cardiovascular", "potassium", "clinician"],
    featured: true,
    audience: "parent",
    createdAt: "2026-04-25T09:00:00.000Z",
  },
  {
    id: "art-protein-debate",
    category: "articles",
    isPlaceholder: true,
    slug: "the-protein-debate-is-mostly-noise",
    kicker: "Myth-busting",
    title: "The protein debate is mostly noise",
    excerpt:
      "If you eat real food at three meals a day, you are almost certainly hitting your protein target. The supplement aisle is selling you a problem you don't have.",
    coverImageUrl: "/food_images/chicken_tikka_masala.png",
    body: [
      "There is a small minority of people who genuinely struggle to hit a healthy protein intake — frail older adults, people recovering from illness, some athletes in heavy training blocks. For most others, the gap between perceived and actual intake is large.",
      "A typical home-cooked dinner with a protein source, a starch, and a vegetable side hits 25–40 grams of protein on its own. Add eggs or yogurt at breakfast, beans or lentils at lunch, and the average adult clears their target without a single scoop of powder.",
      "The exception worth taking seriously is distribution: spreading protein across the day — rather than dumping all of it at dinner — does seem to support muscle protein synthesis better, especially as we age.",
      "So: if you're worried about protein, don't reach for a shake. Reach for an egg at breakfast and a handful of beans at lunch. The rest takes care of itself.",
    ],
    authorId: "expert-jordan-rivera",
    readMinutes: 4,
    tags: ["protein", "myth-busting", "performance"],
    createdAt: "2026-04-20T09:00:00.000Z",
  },
  {
    id: "art-diabetes-mezze",
    category: "articles",
    isPlaceholder: true,
    slug: "diabetes-friendly-doesnt-have-to-be-bland",
    kicker: "Diabetes care",
    title: "Diabetes-friendly doesn't have to be bland",
    excerpt:
      "Mezze is one of the most blood-sugar-friendly ways to eat. Fiber, fat, and acid in every bite. Most clinicians don't say this loudly enough.",
    coverImageUrl: "/food_images/falafel_wrap.png",
    body: [
      "Patients with diabetes are often told what they can't eat. They are told much less often what cuisines have, by structure, been getting it right for centuries.",
      "Mezze — the Levantine practice of small dishes shared at the table — has the slow-glucose architecture built in. Beans and lentils for fiber. Olive oil for fat. Vinegar, lemon, and yogurt for acid. Fresh vegetables in volume. Small amounts of bread for context, not the centerpiece.",
      "This is not a diet plan. It is the way a large region of the world has been eating for a long time, and the metabolic outcomes track. The lesson is structural: protein + fiber + fat + acid in the same meal, with carbohydrate as a participant rather than the star.",
      "If you have diabetes or are at risk, a mezze-style meal is worth keeping in your weekly rotation. It tastes like a holiday and behaves like medicine.",
    ],
    authorId: "expert-leila-haddad",
    readMinutes: 5,
    tags: ["diabetes", "mediterranean", "fiber"],
    createdAt: "2026-04-18T09:00:00.000Z",
  },
  {
    id: "art-rest-day-fueling",
    category: "articles",
    isPlaceholder: true,
    slug: "rest-day-fueling-is-not-a-punishment",
    kicker: "Performance nutrition",
    title: "Rest-day fueling is not a punishment",
    excerpt:
      "The most common training-table mistake isn't undereating on hard days. It's overcorrecting on easy ones.",
    coverImageUrl: "/food_images/quinoa.png",
    body: [
      "The instinct to eat dramatically less on rest days is widespread and almost always counterproductive. The body's repair work — the actual adaptation to training — happens on the days you aren't training.",
      "A reasonable rest-day plate looks a lot like a training-day plate, just slightly smaller. Same protein. Same vegetable volume. A modest reduction in starch. Hydration matters, especially if the previous day was hard.",
      "The athletes I work with who recover fastest are the ones who treat rest days as recovery investment, not penance. Your tomorrow self will thank you.",
    ],
    authorId: "expert-jordan-rivera",
    readMinutes: 3,
    tags: ["recovery", "performance", "rest-day"],
    createdAt: "2026-04-16T09:00:00.000Z",
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id);
}

export function getFeaturedArticles(): Article[] {
  return ARTICLES.filter((a) => a.featured);
}
