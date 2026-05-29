# Parent Mode — Research Synthesis

> **Authored:** 2026-05-01
> **Status:** Research complete, design pending (see `PARENT-MODE-PLAN.md`)
> **Sources:** Four parallel research passes covering child-food sensory science, pediatric micronutrient guidelines, competitor family-meal apps, and FDA/FTC nutrition-claim regulation. Citations inline.
> **Karpathy guard:** This document is the "Think Before Coding" output. We do not start implementation until the assumptions, tradeoffs, and prerequisite signals here are agreed.

---

## 1. Why this matters

Parents cooking for kids are the highest-friction, highest-engagement audience for a cooking app. They cook more often, repeat more, and pay more — but the existing market splits into two unhelpful camps: kid-targeted apps (Yumble, Kids Eat in Color) that give kids food adults don't want, and generic recipe apps (Yummly, Mealime) that don't actually solve the "what do I make tonight that the 6-year-old will eat without me cooking twice" problem.

Sous's wedge: **ONE meal that pleases adults AND kids**, surfaced by a Parent Mode toggle that subtly rebalances recommendations and adds a thin nutrition-information layer — without bloating the UI or making medical claims.

---

## 2. What makes food kid-appetizing (research-grounded)

### 2.1 Sensory drivers (most → least predictive)

| Driver                   | Direction                                                                                   | Notes                                                                                                                                                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Texture**              | Reject: slimy, sticky, lumpy, mixed, stringy                                                | The single biggest rejection lever for ages 2–10. Predictable uniform texture wins. ([PMC8535628](https://pmc.ncbi.nlm.nih.gov/articles/PMC8535628/), [Tandfonline review](https://www.tandfonline.com/doi/full/10.1080/10408398.2022.2136619))                                                       |
| **Bitterness**           | Reject: cruciferous, bitter greens, raw onion, dark chocolate                               | Children are markedly more bitter-sensitive than adults; declines through mid-adolescence. 50% of 3-year-olds register as supertasters vs. 26% of 14–18-year-olds. ([PMC3087510](https://pmc.ncbi.nlm.nih.gov/articles/PMC3087510/), [PMC4654709](https://pmc.ncbi.nlm.nih.gov/articles/PMC4654709/)) |
| **Smell intensity**      | Reject: fermented, fishy/aged, sulfurous (broccoli, cabbage), funky cheeses                 | Olfactory sensitivity is higher in children than adults; lower odor liking is one of the strongest predictors of food neophobia. ([PMC11389506](https://pmc.ncbi.nlm.nih.gov/articles/PMC11389506/))                                                                                                  |
| **Visible green flecks** | Reject: chopped herbs, scallion, parsley garnish                                            | Top-three rejection trigger on otherwise-familiar food.                                                                                                                                                                                                                                               |
| **Plate composition**    | Prefer: separated components, 6+ colors, 7+ items                                           | Younger children prefer "deconstructed" plates and brighter, more-itemized layouts vs. adults who prefer 3 colors. ([Wansink/Cornell](https://news.cornell.edu/stories/2012/01/how-you-plate-food-kids-matters), [Futurity](https://www.futurity.org/food-plate-kids-1855912-2/))                     |
| **Sauce contact**        | Reject: sauces touching other food                                                          | Real and underestimated rejection trigger.                                                                                                                                                                                                                                                            |
| **Color**                | Prefer: red > orange > yellow > bright green; reject: dull, brown, atypical (purple carrot) | ([Poelman/ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0950329311000103))                                                                                                                                                                                                        |
| **Heat (capsaicin)**     | Tolerance develops ~5–8, with culture as dominant variable                                  | TRPV1 sensitivity is high in young kids. Most kids tolerate mild aromatics (paprika, cumin, cinnamon) by age 2–3. ([Stanford](https://thedishonscience.stanford.edu/articles/do-you-feel-the-burn-the-science-behind-your-spice-tolerance))                                                           |
| **Temperature**          | Prefer: warm > hot or cold                                                                  | Limited rigorous research; clinically observed.                                                                                                                                                                                                                                                       |

### 2.2 Behavioral / psychological

- **Neophobia peaks ages 2–6** and plateaus or declines after 7. Heritability ~78% in 4–7-year-olds. ([PMC9002550](https://pmc.ncbi.nlm.nih.gov/articles/PMC9002550/))
- **Repeated exposure** is the highest-leverage intervention. Birch's classic 8–15-exposure recommendation; newer data shows acceptance often plateaus by **4–6 exposures**. ([NCBI Bookshelf NBK582166](https://www.ncbi.nlm.nih.gov/books/NBK582166/), [PMC8143368](https://pmc.ncbi.nlm.nih.gov/articles/PMC8143368/))
- **Parental modeling**: meta-analysis r ≈ .12 between parent eating + child intake. Eating the same dish at the same table is the most-cited single lever. ([Springer](https://link.springer.com/article/10.1186/s12966-017-0501-3))
- **Autonomy / choice / deconstructed plates** significantly raise willingness to try.
- **Peer/social context**: simply telling a child "kids like this" measurably shifts taste perception. ([JNEB](<https://www.jneb.org/article/S1499-4046(16)00069-5/abstract>), [PMC5975094](https://pmc.ncbi.nlm.nih.gov/articles/PMC5975094/))

### 2.3 Same-meal patterns that work

These are the structural patterns where ONE recipe credibly serves both audiences — and the ones Parent Mode should boost:

1. **Build-your-own**: taco bar, grain bowl, mezze platter, ramen with toppings, pizza-night, congee with add-ins. Single base; adults add adult toppings; kids skip them. The most-validated "same dish" pattern.
2. **Components-on-the-side**: serve sauce/dressing/herbs/raw onion/chili oil separately. Saves the dish for both audiences.
3. **Gateway recipes**: familiar carrier (pasta, rice, tortilla, bread, potato, chicken) + one new ingredient. Familiarity is the on-ramp for novelty.
4. **Stealth-veg + visible exposure together**: blending veg into sauces increases short-term intake but does NOT build long-term liking; visible exposure is required for liking transfer. ([USU Extension](https://extension.usu.edu/nutrition/research/hidden-vegetables)) → Best practice: do BOTH (puréed in the sauce, visible on the side).
5. **Satter Division of Responsibility**: parent picks what/when/where, kid chooses how-much/whether. Predicts the same-dish-no-pressure family meal. ([Ellyn Satter Institute](https://www.ellynsatterinstitute.org/satter-feeding-dynamics-model/))

### 2.4 Recipe metadata fields that predict kid-acceptance

The eight fields below are the minimum viable schema for a kid-friendliness scorer. Each field maps directly to a sensory/behavioral driver above and is plausibly hand-labeled in 20–40 seconds per recipe.

| Field                  | Type    | Source signal                                                                               |
| ---------------------- | ------- | ------------------------------------------------------------------------------------------- |
| `bitter_load`          | 0–3     | cruciferous, bitter greens, citrus pith, dark chocolate count                               |
| `smell_intensity`      | 0–3     | fermented / aged / sulfurous / fishy ingredients                                            |
| `texture_risk`         | 0–3     | slimy / sticky / mixed-chunk / stringy presence                                             |
| `visible_green_flecks` | boolean | herbs/scallion garnish or chopped leafy greens through the dish                             |
| `deconstructable`      | boolean | sauce / spice / topping can be served on the side without breaking dish                     |
| `heat_level`           | 0–4     | 0 none, 1 paprika/cumin, 2 mild chili, 3 medium, 4 hot                                      |
| `familiarity_anchor`   | boolean | contains a kid-default carrier (pasta, rice, bread, tortilla, potato, chicken, cheese, egg) |
| `color_brightness`     | 0–3     | proportion of red/orange/yellow/bright-green vs. brown/dull plate                           |

Provisional scorer:

```
kidScore = familiarity_anchor * w1
        + deconstructable    * w2
        + color_brightness   * w3
        - bitter_load        * w4
        - smell_intensity    * w5
        - texture_risk       * w6
        - visible_green_flecks * w7
        - max(0, heat_level - 1) * w8
```

Tune `w1…w8` against a labeled set of ~50 recipes hand-classified as Parent Mode pass/fail.

---

## 3. Pediatric nutrition reference layer

### 3.1 Source hierarchy (which to cite for what)

| Use case                                                         | Best-defensible source                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| Quantitative recommended intake (mg/mcg) by age band             | National Academies **DRIs** (RDA / AI / UL)                         |
| %DV math on a serving                                            | **FDA 21 CFR 101.9** Daily Values (children 4+)                     |
| "Dietary pattern" framing ("kids under-consume X")               | **USDA/HHS Dietary Guidelines for Americans 2020–2025**             |
| Pediatric-clinical (iron screening, vit D for breastfed infants) | **AAP Bright Futures 3rd ed.** & AAP policy statements              |
| Front-of-pack & "high in / good source" language                 | **FDA nutrient content claim regs** + Dec 2024 "Healthy" final rule |

> **Critical**: Do **not** cite "FDA recommends X mg/day for children ages 4–8." The FDA does not set age-banded pediatric intakes. The National Academies do. Cite USDA Dietary Guidelines or NASEM DRIs instead.

### 3.2 Under-consumed nutrients (the only ones worth flagging)

DGA 2020–2025 explicitly names **calcium, vitamin D, potassium, fiber** as under-consumed nutrients of public-health concern. **Iron** is added for toddlers and adolescent girls. The full table below is what `nutrient-spotlight.ts` will key off; the "why-it-matters" column is the structure-function-safe phrasing.

| Nutrient         | 1–3      | 4–8      | 9–13             | 14–18 (M / F)    | "Why it matters" (structure/function only)                    |
| ---------------- | -------- | -------- | ---------------- | ---------------- | ------------------------------------------------------------- |
| Calcium          | 700 mg   | 1,000 mg | 1,300 mg         | 1,300 / 1,300 mg | Supports normal bone development.                             |
| Iron             | 7 mg     | 10 mg    | 8 mg             | 11 / 15 mg       | Helps the body carry oxygen and supports normal energy use.   |
| Vitamin D        | 600 IU   | 600 IU   | 600 IU           | 600 IU           | Helps the body absorb calcium for bones.                      |
| Vitamin A (RAE)  | 300 mcg  | 400 mcg  | 600 mcg          | 900 / 700 mcg    | Supports normal vision and skin.                              |
| Fiber            | 19 g     | 25 g     | 31 / 26 g        | 38 / 26 g        | Supports normal digestion.                                    |
| Potassium        | 2,000 mg | 2,300 mg | 2,500 / 2,300 mg | 3,000 / 2,300 mg | Helps muscles and the nervous system work normally.           |
| Omega-3 ALA (AI) | 0.7 g    | 0.9 g    | 1.2 / 1.0 g      | 1.6 / 1.1 g      | Supports normal brain and eye development.                    |
| Zinc             | 3 mg     | 5 mg     | 8 mg             | 11 / 9 mg        | Supports normal growth and immune function.                   |
| Magnesium        | 80 mg    | 130 mg   | 240 mg           | 410 / 360 mg     | Supports normal muscle and nerve function.                    |
| Vitamin B12      | 0.9 mcg  | 1.2 mcg  | 1.8 mcg          | 2.4 mcg          | Helps make red blood cells. (Flag for vegetarian/vegan kids.) |
| Choline (AI)     | 200 mg   | 250 mg   | 375 mg           | 550 / 400 mg     | Supports normal brain development.                            |

### 3.3 FDA nutrient-content thresholds (hard-codable)

Per Reference Amount Customarily Consumed (RACC) per labeled serving:

- **High in / Excellent source of / Rich in**: ≥ 20 % DV
- **Good source of / Contains / Provides**: 10–19 % DV
- **More / Added / Fortified / Enriched**: ≥ 10 % DV more than the reference food

Per-serving DVs to reference (children 4+, adult-aligned): Calcium 1,300 mg, Iron 18 mg, Vitamin D 20 mcg, Vitamin A 900 mcg RAE, Fiber 28 g, Potassium 4,700 mg, Vitamin B12 2.4 mcg, Zinc 11 mg, Magnesium 420 mg, Choline 550 mg.

### 3.4 Over-consumed nutrients (don't scold, substitute)

DGA 2020–2025 limits:

- **Added sugars**: < 10 % kcal/day from age 2 (~50 g on a 2,000 kcal diet); avoid entirely under 2.
- **Saturated fat**: < 10 % kcal/day from age 2 (~22 g on 2,000 kcal).
- **Sodium**: < 2,300 mg/day for ages 14+; lower for younger (CDRR ≈ 1,200 mg for 1–3, 1,500 mg for 4–8, 1,800 mg for 9–13).

UI pattern: lead with the positive substitute, never the warning. _"Lighter on added sugar than typical kids' breakfasts"_ > _"Warning: contains sugar."_ For a sodium-heavy meal: _"About a third of the day's sodium for a 9-year-old — pair with a low-salt side."_

---

## 4. Legal & liability framing

### 4.1 The FDA claim taxonomy in one paragraph

Three claim categories:

1. **Nutrient content claims** ("high in calcium," "good source of fiber," "low sodium") — **safe** if you stay within FDA-defined trigger words and thresholds. No notification required.
2. **Health claims** (food/nutrient → reduced disease risk) — **dangerous unless verbatim**. Only **12 FDA-authorized claims** exist (calcium ± vitamin D → osteoporosis, sodium → hypertension, saturated fat → CHD, fruits/veg → cancer, folate → neural tube defects, fiber → cancer/CHD, etc.). Use FDA model wording verbatim or skip.
3. **Structure/function claims** ("calcium builds strong bones") — **safe for conventional foods** without notification or disclaimer, but the moment "strong bones" becomes "prevents osteoporosis," you've crossed into an unauthorized disease claim and the recipe becomes a misbranded "drug" under 21 USC 343(r).

### 4.2 Jurisdiction

- **FDA** governs labeling. Recipe cards in an app are labeling-adjacent but primarily fall to the **FTC** under §§ 5 and 12 of the FTC Act, requiring all advertising claims be **truthful, non-misleading, and substantiated by competent and reliable scientific evidence** _before_ the claim is made. ([FTC Health Products Compliance Guidance, Dec 2022](https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance))
- **State AGs** (CA Prop 65, NY GBL §§ 349/350, MA Ch. 93A) are aggressive on "natural," "healthy," "wholesome," and pediatric-targeted claims. _HelloFresh_ paid $7.5M to LA/Santa Clara DAs in 2025.
- **CARU Guidelines** (BBB National Programs) apply to media directed at children under 13. No fines, but case decisions are public and FTC-referrable.

### 4.3 Pediatric specifics

- FDA's DV regime: **infants 0–12 mo**, **toddlers 1–3 yr**, and **children ≥ 4 yr (uses adult DV)**. There is **no FDA-authorized DV table for "ages 4–8"** — that comes from the IOM/NASEM DRIs.
- **Dec 2024 "Healthy" final rule** does not have a separate pediatric definition; same criteria apply. Compliance Feb 25, 2028. **Don't co-opt "Healthy" as a UI tag** unless the recipe meets the rule — it's a regulated term. Use generic alternatives ("kid-friendly," "balanced," "wholesome") for tags.

### 4.4 Safe-phrasings cheatsheet (UI copy guardrail)

**SAFE — use freely on a recipe card**

1. "Good source of calcium." _(if ≥ 10 % DV/RACC)_
2. "High in iron." _(if ≥ 20 % DV/RACC)_
3. "Low in sodium." _(if ≤ 140 mg/RACC)_
4. "Provides 25 % of the Daily Value of vitamin D per serving."
5. "Calcium and vitamin D help build strong bones." _(structure/function, no disclaimer required)_
6. "Iron supports healthy growth and development."
7. "Fiber supports healthy digestion."
8. "A kid-friendly way to add leafy greens to dinner."
9. "Made with vegetables from the food groups recommended for kids."
10. "Adequate calcium and vitamin D throughout life, as part of a well-balanced diet, may reduce the risk of osteoporosis." _(verbatim FDA-authorized health claim)_
11. "Diets low in sodium may reduce the risk of high blood pressure." _(verbatim FDA-authorized)_
12. "Whole grains are part of a balanced diet recommended by the Dietary Guidelines for Americans."

**UNSAFE — do not use**

1. ❌ "The FDA recommends 1,000 mg/day of calcium for children ages 4–8 for bone growth." — _FDA does not set pediatric DRIs. Misattributes the source._
2. ❌ "High in calcium — prevents osteoporosis in your child." — _Unauthorized disease claim; "prevents" is drug language._
3. ❌ "Boosts your child's immune system." — _Implied claim; "boost" is a regulatory red flag._
4. ❌ "Low sodium — protects against childhood hypertension." — _Pediatric disease claim beyond the authorized model wording._
5. ❌ "Helps your picky eater overcome ARFID." — _Disease/treatment claim._
6. ❌ "Pediatrician-recommended for ADHD kids." — _Implied medical endorsement + disease claim — CARU + FTC + state AG triple risk._
7. ❌ "A healthy recipe for your child" + stethoscope or heart icon — _Implied health claim; "healthy" is a regulated term post-2024._
8. ❌ "Reduces risk of childhood obesity." — _Disease claim._

### 4.5 Disclaimer pattern

A bare "Not medical advice" footer **does not cure** a misleading claim. Use it as belt-and-suspenders, not a shield. Recommended pattern (mirrors MyFitnessPal, Lose It, Mealime, Yummly):

> _Nutrition information is estimated and provided for educational purposes only. It is not medical or nutritional advice. Daily Values are based on a 2,000-calorie diet for adults and children 4 years and older; your child's needs may differ. Consult your pediatrician or a registered dietitian about your child's specific dietary needs, allergies, and any medical conditions._

Plus per-card: a small "i" tooltip linking to the methodology page (sources: USDA FoodData Central, NIH ODS fact sheets) — substantiation is the FTC's #1 defense.

### 4.6 Pre-launch action

Before the first paid user sees Parent Mode UI copy, run the final strings past food/advertising counsel (Keller & Heckman, Covington, Sidley, or Olsson Frank Weeda). A 2-hour review is the cheapest insurance available.

---

## 5. Competitor analysis (what to steal, what to skip)

### 5.1 The field

| App                                  | Positioning                         | Parent-relevant strength                                                  |
| ------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------- |
| Mealime                              | Quick weeknight + grocery list      | 5-question household setup; per-person serving slider                     |
| Yummly                               | Massive recipe aggregator           | Best allergen filter; lightweight "Yums" rating                           |
| Samsung Food (Whisk)                 | Cross-device recipe saver           | Shared household lists                                                    |
| Plan to Eat                          | Power-user weekly planner           | Drag-and-drop "use leftover"                                              |
| Plant Jammer                         | AI flavor/substitution graph        | Inline ingredient swaps                                                   |
| SideChef                             | Step-by-step guided cook with video | Hands-free voice-advance steps                                            |
| BigOven                              | Leftover search                     | 3-ingredient pantry search                                                |
| BBC Good Food                        | Editorial "family" collections      | Trusted curation but static                                               |
| Tasty                                | Reels-style cook videos             | Inspiration, not planning                                                 |
| PlateJoy (paid)                      | Quiz-driven personalized plans      | Per-person dietary profiles                                               |
| Eat This Much                        | Macro/calorie target                | Nutrition-first                                                           |
| Kids Eat in Color / KidStir / Yumble | Kid-nutrition + kid meal-kits       | Strong taxonomies for "exposure foods," "safe foods," texture progression |

### 5.2 White-space gaps (no one does these well)

1. **Per-recipe spice/heat slider** that remembers the household default — single biggest barrier for parents cooking adult recipes.
2. **"Make it kid-friendly" as a contextual recipe action** — auto-suggest 2–3 swaps (less spice, milder cheese, separate sauce). No app does this on existing recipes; everyone just tags or doesn't.
3. **Component split: adult plate vs kid plate from one base** — Yumble inspires the taxonomy but no recipe app implements it.
4. **"Did the kid eat it?" feedback loop** — solves the unreliable-crowdsourced-tag problem; Yummly's "Yums" pattern, narrowed.
5. **Lunchbox carry-forward** — "tomorrow's lunch from tonight's dinner." BigOven has leftover search; nobody frames it for kids.

### 5.3 Top 5 features to integrate into Sous

(All five plug into existing Sous surfaces — no new tabs, no settings page.)

| #   | Feature                                                                  | Why parents love it                                        | Where in Sous                                    | Cost |
| --- | ------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------ | ---- |
| 1   | **Household Spice Slider** (1–5) auto-adjusts spice in guided cook steps | Removes #1 parent friction                                 | Guided cook step renderer + localStorage         | S    |
| 2   | **"Make it Kid-Friendly" chip** on quest cards — one tap → 2–3 AI swaps  | Solves picky-eater problem without forking the recipe      | Today quest card action + guided cook overlay    | M    |
| 3   | **"Did the kids eat it?" two-tap** on the Win screen                     | Tunes future recommendations; replaces unreliable tags     | Win screen + recommendation engine signal        | S    |
| 4   | **Component split toggle** in guided cook last step                      | Eliminates the "cook two dinners" tax                      | Guided cook step renderer (final step branches)  | M    |
| 5   | **"Tomorrow's Lunchbox" one-tap** on the Win screen                      | Captures school-lunch jobs-to-be-done with zero new screen | Win screen + Content tab lunchbox article tie-in | S    |

---

## 6. Critical appraisal

### 6.1 What we are confident about

- **Texture, bitterness, smell intensity, visible green flecks** — load-bearing rejection drivers, well-replicated literature.
- **Repeated exposure (4–6×)** — load-bearing positive lever; basis for the "exposure tracker" feature in PARENT-MODE-PLAN.md.
- **FDA structure/function vs. disease claim line** — clear and bright. We can stay safely on one side.
- **Same-meal patterns** (build-your-own, components-on-side, gateway recipes) — the reason Parent Mode is feasible at all.
- **Top 5 features-to-steal** — every one is small surface-area, zero settings-screen, plugs into existing Sous flows.

### 6.2 What is uncertain or risky

- **Color preference data** (Wansink/Cornell) — Wansink has had retractions; the underlying claim is corroborated by other studies but cite cautiously.
- **Stealth-veg debate** — short-term acceptance ↑, long-term liking unchanged. We should support both modalities, not pick a side.
- **Hand-labeling 50 recipes** for the kid-friendliness scorer — feasible but tedious. Bias risk if labelled by one person.
- **AI-generated swap suggestions** ("make it kid-friendly" chip) — high latency, occasional wrong suggestions. Need a confidence threshold + mock fallback.
- **Per-recipe nutrition data** — USDA FoodData Central is the source, but ingredient-level → per-serving math is non-trivial. Whisk/Yummly lean on third-party APIs (Edamam, Spoonacular). We need to decide: build vs. buy.
- **Legal review cost** — $5–15k for a 2-hour senior food-advertising-counsel review of UI copy. Worth budgeting before launch.
- **Pediatric dietary needs are individual** — anything we surface must be framed as general guidance, never prescriptive. The disclaimer is mandatory.

### 6.3 What would change the plan

- If a partner clinic (Stanford Lifestyle Medicine, AAP local chapter, school district) wants to co-brand Parent Mode, the "(sample)" affiliation pattern from Stage-3 Content can be replaced with real attributions. This dramatically improves the trust story but introduces editorial workflow + IRB-style review.
- If Sous chooses to charge for Parent Mode (paid tier), the legal and editorial bar tightens. Free educational content has more latitude than paid health-adjacent product.
- If the U.S. market expands to UK/EU later, EFSA claims (EU Regulation 1924/2006) replace FDA. EU is **stricter** on health claims (Article 13/14 list is shorter and more conservative). Our schema should be region-aware from day 1.

---

## 7. Open questions (decide before building)

1. **Build vs. buy nutrition data**? Edamam ($), Spoonacular ($), or USDA FoodData Central + custom ingredient mapping (free but ~80 hours of engineering)?
2. **Age band UI**: do we ask the parent for their kid's age band once (1–3 / 4–8 / 9–13 / 14–18) and tailor the DV reference accordingly, or default to 4–8 silently?
3. **Allergen system** as a Parent Mode prerequisite, or post-V1?
4. **Stage 2 auth (Clerk) before or after** Parent Mode? Profile-on-localStorage works for the prototype, but household profiles really want server persistence.
5. **Editorial workflow**: do we partner with a real RD/MD for content review, or stick with "(sample)" disclaimers in V1?

These are the questions to resolve in the kick-off review for `PARENT-MODE-PLAN.md`.
