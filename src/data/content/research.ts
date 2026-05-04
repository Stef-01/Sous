/**
 * Research Spotlight briefs — sample plain-language summaries for the
 * Content tab. Lab names, paper titles, and findings are fictional
 * placeholders that paraphrase well-established consensus directions
 * (fiber and gut health, Mediterranean diet and cardiovascular risk,
 * fermented foods and inflammation, etc.).
 *
 * No real DOI, study, or author is referenced. Replacing this seed
 * with real research dissemination is a Stage-2 editorial workstream.
 */

import type { ResearchBrief } from "@/types/content";
import { STANFORD_RESEARCH_BRIEFS } from "./stanford";

const PLACEHOLDER_RESEARCH_BRIEFS: ResearchBrief[] = [
  {
    id: "rsrch-fiber-gut",
    category: "research",
    isPlaceholder: true,
    slug: "fiber-and-gut-microbiome",
    title: "Daily beans, measurably calmer gut",
    paperTitle:
      "Pulse intake and gut microbial diversity: a 12-week feeding trial (sample)",
    labName: "Bay Area Microbiome Initiative (sample)",
    takeaway:
      "Adding a daily serving of beans for 12 weeks shifted gut microbial diversity in directions associated with lower systemic inflammation.",
    body: [
      "A 12-week feeding trial randomized 84 adults to either continue their habitual diet or add one half-cup serving of cooked pulses (beans, lentils, chickpeas) daily.",
      "By week 12, the intervention arm showed a measurable rise in microbial alpha-diversity and an increase in short-chain fatty acid producers — both markers consistently associated with lower systemic inflammation in observational work.",
      "There was no change in body weight, no requirement to change anything else about the diet, and no compliance penalty. Participants self-reported the intervention as easy.",
    ],
    whyItMatters:
      "If you can change one thing this month, a daily serving of beans is among the highest-leverage moves available. It is cheap, it travels across cuisines, and the body responds.",
    coverImageUrl: "/food_images/masoor_dal.png",
    audience: "parent",
    createdAt: "2026-04-30T09:00:00.000Z",
  },
  {
    id: "rsrch-med-diet",
    category: "research",
    isPlaceholder: true,
    slug: "mediterranean-pattern-cardiovascular",
    title: "Mediterranean pattern, again",
    paperTitle:
      "Adherence to Mediterranean dietary pattern and 5-year cardiovascular events (sample)",
    labName: "Pacific Coast Cardiology Cohort (sample)",
    takeaway:
      "In a 5-year follow-up of 6,200 adults at moderate cardiovascular risk, higher adherence to a Mediterranean dietary pattern was associated with a meaningful reduction in major cardiovascular events.",
    body: [
      "This was an observational analysis with all the usual caveats, but the magnitude and direction of the effect lined up with a now-substantial literature on the Mediterranean pattern.",
      "The pattern is not exotic: olive oil as the primary fat, fish two to three times a week, beans and lentils regularly, vegetables in volume, whole grains, modest dairy, modest meat, and very little ultra-processed food.",
      "What the analysis did not show was any threshold effect — the relationship was approximately linear. Every step toward the pattern was associated with some reduction in event rate.",
    ],
    whyItMatters:
      "The most overstudied dietary pattern in the world keeps producing the same answer. You don't have to be in Crete to eat this way.",
    coverImageUrl: "/food_images/grilled_salmon.png",
    createdAt: "2026-04-28T09:00:00.000Z",
  },
  {
    id: "rsrch-ferment-inflammation",
    category: "research",
    isPlaceholder: true,
    slug: "fermented-foods-and-inflammation",
    title: "A daily fermented food, six weeks, lower inflammation",
    paperTitle:
      "Fermented food intake and inflammatory markers: a 6-week dietary intervention (sample)",
    labName: "Stanford Lifestyle Medicine Working Group (sample)",
    takeaway:
      "Adding one daily serving of a fermented food (yogurt, kefir, kimchi, sauerkraut) for six weeks lowered several inflammatory markers in healthy adults.",
    body: [
      "The intervention was deliberately small: one serving per day, no other dietary instruction. Participants chose their preferred fermented food.",
      "By week 6, multiple inflammatory cytokines had decreased, and microbial diversity had increased modestly. The effect was robust across food choices, suggesting the mechanism is not specific to any one organism.",
      "This adds to a growing literature pointing at fermentation as a low-effort, high-leverage daily move.",
    ],
    whyItMatters:
      "A spoonful of yogurt with dinner. A side of kimchi with rice. A daily glass of kefir. Pick the one you'll actually eat — the body will use it.",
    coverImageUrl: "/food_images/cucumber_raita.png",
    createdAt: "2026-04-24T09:00:00.000Z",
  },
  {
    id: "rsrch-cooking-frequency",
    category: "research",
    isPlaceholder: true,
    slug: "home-cooking-frequency-and-diet-quality",
    title: "How often you cook predicts your diet better than what you cook",
    paperTitle:
      "Home cooking frequency and dietary quality scores in a U.S. adult cohort (sample)",
    labName: "National Eating Habits Cohort (sample)",
    takeaway:
      "Adults who cooked dinner at home five or more nights per week had higher overall diet-quality scores than less-frequent home cooks — independent of cuisine or budget.",
    body: [
      "The analysis controlled for income, household size, and food-environment access. The effect persisted: frequency of home cooking was the strongest single behavioural predictor of diet quality in the dataset.",
      "Notably, what people cooked mattered less than the fact that they cooked. Home cooking pulled diet quality up across cuisines, including ones often coded as 'unhealthy' in popular media.",
    ],
    whyItMatters:
      "Cooking at all is the intervention. Don't optimize the recipe at the cost of skipping the cook.",
    coverImageUrl: "/food_images/chicken_biryani.png",
    createdAt: "2026-04-20T09:00:00.000Z",
  },
  {
    id: "rsrch-time-restricted",
    category: "research",
    isPlaceholder: true,
    slug: "time-restricted-eating-mixed-evidence",
    title: "Time-restricted eating: smaller effect than the headlines",
    paperTitle:
      "10-hour time-restricted eating window vs. ad libitum: a 12-week trial (sample)",
    labName: "Pacific Coast Metabolic Lab (sample)",
    takeaway:
      "Restricting eating to a 10-hour window for 12 weeks produced a modest weight reduction in healthy adults — about 1.5 kg on average — without changes in metabolic markers beyond what the weight loss alone would explain.",
    body: [
      "Time-restricted eating remains a useful tool for some people, particularly those who struggle with late-evening grazing.",
      "What this trial did not show was a magic-bullet metabolic effect independent of caloric reduction. The weight came off because total intake came down. Once that's controlled for, the marginal effect of the eating window itself was small.",
      "The honest summary: it's a behavioural lever, not a metabolic miracle. Use it if it helps you eat less without misery.",
    ],
    whyItMatters:
      "Most popular dietary protocols look smaller in trials than in marketing. This one is real, just smaller than the hype.",
    coverImageUrl: "/food_images/oats_idli.png",
    createdAt: "2026-04-18T09:00:00.000Z",
  },
  {
    id: "rsrch-sodium-context",
    category: "research",
    isPlaceholder: true,
    slug: "sodium-the-context-matters",
    title: "Sodium: the context matters more than the number",
    paperTitle:
      "Dietary sodium, potassium, and blood pressure interaction in a global cohort (sample)",
    labName: "Global Cardiovascular Risk Network (sample)",
    takeaway:
      "Across a 22-country cohort, the blood-pressure effect of sodium was substantially modified by potassium intake. Low-sodium guidance is most effective when paired with potassium-rich food increases.",
    body: [
      "The analysis pooled data from 22 countries and confirmed the long-suspected interaction: sodium and potassium are not independent dietary signals.",
      "Where potassium intake was high — typical of cuisines heavy on beans, vegetables, and fruit — the blood-pressure response to high sodium was attenuated. Where potassium intake was low, the response was steeper.",
      "This does not mean salt doesn't matter. It means the most useful clinical advice combines sodium reduction with potassium addition, rather than focusing on one in isolation.",
    ],
    whyItMatters:
      "If you're trying to lower your blood pressure, don't only count salt. Add the beans, the leafy greens, the sweet potato. The two work together.",
    coverImageUrl: "/food_images/sambar.png",
    createdAt: "2026-04-15T09:00:00.000Z",
  },
];

/** Real Stanford-attributed briefs prepended; placeholders follow. */
export const RESEARCH_BRIEFS: ResearchBrief[] = [
  ...STANFORD_RESEARCH_BRIEFS,
  ...PLACEHOLDER_RESEARCH_BRIEFS,
];

export function getResearchBriefBySlug(
  slug: string,
): ResearchBrief | undefined {
  return RESEARCH_BRIEFS.find((r) => r.slug === slug);
}
