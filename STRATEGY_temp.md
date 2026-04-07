
# Sous — Strategic Design Document

> **Living document** — updated as features ship and strategy evolves.
> **Last updated:** 2026-04-06 | V1 Prototype Stage

---

## 1. Strategic Thesis

Sous is not a recipe app. Recipe apps compete on database size, and database size is a commodity. Sous competes on cooking confidence — the gap between wanting to cook and actually doing it tonight. This is a behavioral product, not a content product.

**The thesis:** if you reduce the distance between craving and cooking to under 60 seconds of decision-making, and then make the cooking itself guided and rewarding, you create a habit loop that compounds. Every completed cook teaches the engine more about the user, makes recommendations sharper, and raises the switching cost.

### 1.1 The Contrarian Bet

Every food app in the market is trying to be a bigger database, a better search engine, or a social feed. Sous does the opposite:

- **Less choice, not more.** Three side dish recommendations, not three hundred. Decision fatigue kills cooking motivation. Sous is opinionated.
- **No browsing.** There is no recipe browse page, no category grid, no infinite scroll. You tell Sous what you're craving, and it builds your plate. The absence of browsing is the product.
- **Cooking is the content.** The guided cook flow is the engagement loop, not reading recipes. Sous measures success in meals cooked, not recipes saved.
- **Intelligence over inventory.** 203 sides paired intelligently will outperform 200,000 recipes dumped in a search bar. The engine's understanding of flavor contrast, nutritional balance, and prep burden is the moat, not the catalog size.

### 1.2 Peter Thiel's Framework Applied

| Principle | Sous Application | Resulting Moat |
|---|---|---|
| Create a monopoly in a small market | Cooking-anxious adults aged 22-35 who want to cook but feel overwhelmed by choice | Own the niche before expanding; no one else targets this segment with this approach |
| Be 10x better, not 10% better | 60-second craving-to-plate vs. 20-minute recipe search and meal planning | Order-of-magnitude reduction in decision friction |
| Start with a small market and dominate | Side dish pairing for home dinners only. Not lunch, not baking, not meal prep. | Deep expertise in one vertical before horizontal expansion |
| Proprietary technology | Deterministic pairing engine with 6 weighted scorers, not generic AI recommendations | No one can replicate the scoring logic without rebuilding the domain model from scratch |
| Network effects | Cook together features, group challenges, shared scrapbooks compound with each user added | Each new user makes the platform more valuable for existing users |
| Durability (last mover advantage) | Preference memory + cooking history = switching cost that grows every week | After 50 cooks, leaving Sous means abandoning a personalized cooking intelligence |

---

## 2. Compounding Moats

A moat is only valuable if it deepens over time. Every feature in Sous should be evaluated on one question: does this get stronger the more the user cooks?

### 2.1 Data Moat: Preference Memory

Every cook teaches Sous something. After 10 cooks, Sous knows your cuisine comfort zone. After 30, it knows your flavor profile, your prep tolerance, your nutritional patterns. After 100, it can predict what you'll crave on a Tuesday night in winter.

- **Mechanism:** Preference vectors built from cook completions, ratings, favorites, quiz responses, and nutrition chat inputs. Weighted with 10% decay per 30 days so stale preferences fade.
- **Compounding:** Recommendations get measurably better. Users who've done 20+ cooks should see noticeably sharper results than day-one users.
- **Switching cost:** This data is non-portable. Leaving Sous means starting from zero on any competitor.

### 2.2 Content Moat: Guided Cook Quality

Recipe databases are commodities. Guided cook flows are not. Sous's guided cook steps include timer triggers, mistake warnings, hack chips, and cuisine facts. This is editorial content, not scraped data. Each dish's cook flow is authored, tested, and tuned.

- **Compounding:** As the library grows, coverage across cuisines and skill levels becomes comprehensive. At 500+ guided cooks, this library becomes genuinely hard to replicate.
- **Defense:** Competitors can copy the UI pattern but not 500 hand-authored cook flows with domain-specific mistake warnings.

### 2.3 Behavioral Moat: The Habit Loop

Sous's core loop — crave, pair, cook, win, reflect — is designed as a habit loop, not a utility flow:

- **Cue:** The daily quest card. A new recommendation appears each day, personalized to your history. This is the trigger.
- **Routine:** The guided cook. Low cognitive load, high engagement. Timers tick, steps advance, hacks surprise.
- **Reward:** The win screen. AI-personalized celebration, streak tracking, scrapbook save. The dopamine hit of completion.
- **Investment:** The rating, the note, the photo. Each reflection deepens the preference model and raises switching cost.

This is the Duolingo model applied to cooking. The streak counter is not decoration — it's the compounding engine.

### 2.4 Engine Moat: Deterministic Intelligence

The pairing engine uses 6 weighted scorers: cuisine fit, flavor contrast, nutritional balance, prep burden, temperature complement, and user preference. This is not a black-box AI recommendation — it's a transparent, deterministic system that produces explainable results.

- **Why this matters:** Users trust recommendations they can understand. "This pairs well because the acidity cuts through the richness" is more compelling than "Other users liked this."
- **Compounding:** As scorer weights are tuned by user feedback data, the engine improves without requiring new AI models or infrastructure.

---

## 3. Network Effects and Social Dynamics

Cooking is inherently social. People cook for others, learn from others, and are motivated by others. Sous should harness this without becoming a social media platform.

### 3.1 Cook Together Mode

**Concept:** Users can start a synchronized cook session with friends. Both follow the same guided cook flow, see each other's progress, and land on a shared win screen.

- Shared quest cards: send a recipe to a friend with one tap
- Synchronized timers: both cooks see the same step progression
- Shared win screen: side-by-side completion with combined scrapbook entry
- No video, no chat, no social overhead — just parallel cooking with presence

**Network effect:** Every friend you bring into Sous becomes a cooking partner. The more friends on the platform, the more likely you are to cook tonight because someone invited you.

### 3.2 Group Challenges

**Concept:** Weekly cooking challenges that groups of friends can join together. Leaderboard is visible only within your group, not globally.

- "This week: cook something from a cuisine you've never tried"
- "Challenge: 3 home-cooked meals this week"
- Group streak: the whole group maintains a streak together, creating social accountability
- Gentle nudges: "Sarah just completed her Mediterranean quest — you're up!"

**In-group effect:** Small group dynamics (3-8 people) create stronger accountability than public leaderboards. The shame of breaking your friend group's streak is a more powerful motivator than competing with strangers.

### 3.3 Recipe Gifting

**Concept:** A user who completes a cook can "gift" the recipe to someone who doesn't have Sous. The recipient gets a beautiful, shareable cook card with a link to try Sous.

- Organic acquisition: every completed cook is a potential referral
- The gift is the guided cook itself, not just a recipe link
- Recipients see: "Stefan cooked this and rated it 5 stars. Try it yourself."

**Viral coefficient:** If 10% of gift recipients sign up, and active users gift once per week, the viral coefficient compounds meaningfully.

### 3.4 Household Mode

**Concept:** Multiple users in the same household share a kitchen but have separate taste profiles. Sous can recommend plates that satisfy multiple preference vectors simultaneously.

- "Tonight's sides work for both of you: Stefan likes bold flavors, Alex prefers lighter options"
- Shared grocery context: sides that use overlapping ingredients score higher
- Separate scrapbooks, shared cook history

**Moat:** Household-level intelligence is extremely hard to replicate and creates multi-user lock-in.

---

## 4. Addictive Features and Engagement Loops

The goal is not screen time. The goal is cooking frequency. Every addictive feature must drive the user to cook more often, not just open the app more often.

### 4.1 The Streak System

Borrowed from Duolingo, adapted for cooking. A streak counts consecutive days (or weeks) with at least one completed cook.

- Daily streak: cook something every day (hardcore mode)
- Weekly streak: cook at least 3 times per week (default, sustainable)
- Streak freeze: one free pass per week, earned by completing a challenge
- Streak recovery: miss a day? Complete a 2-cook day to recover

**Psychology:** Loss aversion is the most powerful motivator. Once a user has a 14-day streak, the cost of breaking it exceeds the effort of cooking one more meal.

### 4.2 Progressive Unlock

New users see only the Today tab. Path unlocks after 3 cooks. Community after 30 days. This is not a paywall — it's earned progression.

- Unlock celebrations: confetti, achievement badge, encouraging coach message
- Each unlock feels like a level-up, not a feature gate
- Creates curiosity: "What's behind the Path tab?" drives early engagement
- Prevents overwhelm: new users aren't bombarded with features

### 4.3 Cuisine Mastery Badges

**Concept:** Track expertise across cuisine families. Cook 5 Italian dishes? You're an Italian apprentice. 20? Italian sous chef.

- Visual skill tree on the Path tab
- Each cuisine family has 4 tiers: Curious, Apprentice, Sous Chef, Chef de Cuisine
- Badges visible in scrapbook and shareable
- Unlocking a new tier reveals cuisine-specific hack chips in guided cook

**Compounding:** Mastery progress is visible, tangible, and non-transferable. It's your cooking resume.

### 4.4 The Daily Quest Card

Each day, Sous presents one featured recommendation based on your history, the season, and what you haven't tried recently. This is not a notification — it's a curated suggestion that feels personal.

- "You haven't cooked Thai in 3 weeks. Tonight: pad kra pao with cucumber salad."
- "It's getting colder — try this warming stew with roasted root vegetables."
- Novelty rotation: tie-breaking logic ensures you're gently pushed outside your comfort zone

**Why it works:** Decision fatigue is the #1 barrier to home cooking. The daily quest removes the hardest part: deciding what to cook.

### 4.5 Cook Replay

**Concept:** From the scrapbook, users can replay any past cook with one tap. Same guided flow, same sides, but with an "improve on last time" prompt.

- "Last time you rated this 3 stars and noted the rice was overcooked. This time, we've added an extra timer alert."
- Creates a natural improvement loop: cook, reflect, cook again, improve
- Drives repeat engagement with existing content

---

## 5. Intuitiveness and Low-Friction Design

The best feature is the one the user doesn't notice. Sous should feel like it reads your mind, not like it requires your input.

### 5.1 Core Design Principles

- **60-second rule:** From app open to cooking decision, the maximum acceptable time is 60 seconds. Every screen, every interaction, every animation is optimized against this clock.
- **One action per screen:** Every screen has exactly one dominant action. Users should never wonder what to do next. The primary CTA is visually obvious and the only thing that demands attention.
- **No dead ends:** Every screen has a clear forward path. If something fails (AI timeout, no results), there's always a graceful fallback that keeps the user moving.
- **Progressive disclosure:** Information appears only when it's needed. Nutritional details are hidden until the user asks. Hack chips appear mid-cook, not before. Complexity is layered, never dumped.
- **Muscle memory:** Consistent interaction patterns. Swipe always means next. Tap always means select. Long press always means save. Once learned, these patterns transfer across every screen.

### 5.2 Input Minimization

Every piece of information Sous needs from the user should be inferred before it's asked.

- **Craving input:** Two words or a photo. That's it. The AI parser extracts cuisine, effort tolerance, and health orientation from minimal input.
- **Preference learning:** Don't ask what the user likes. Watch what they cook, what they rate highly, what they skip. The preference vector builds silently.
- **Context inference:** Time of day, season, and weather inform recommendations without the user setting preferences. A 10pm craving gets lighter suggestions than a 6pm one.
- **Smart defaults:** Every decision has a sensible default. The recommended side is pre-selected. The cook flow starts automatically. The rating defaults to the average of past ratings for that cuisine.

### 5.3 Forgiveness Patterns

Users make mistakes. Sous should make recovery effortless.

- Misidentified photo? Correction chip appears inline, one tap to fix
- Wrong side dish selected? Swap button is always visible, never buried
- Accidentally skipped a cook step? Back button returns to previous step with no state loss
- Closed the app mid-cook? Session persists, resume exactly where you left off
- Changed your mind about the meal? "Start over" is always one tap away

### 5.4 Cognitive Load Reduction

- **Visual hierarchy:** Green for primary actions, gray for secondary, no competing colors. The eye naturally falls on the right button.
- **Information density:** Maximum 3 pieces of information visible at any time during guided cook. Step instruction, timer, and one contextual tip. Everything else is expandable.
- **Transition clarity:** Every screen transition includes a brief micro-animation that communicates progress. The user always knows where they are in the flow.
- **Error messaging:** No technical language. "We couldn't identify that dish" becomes "Hmm, let me try again. Can you type what you're craving?" Conversational, not clinical.

---

## 6. Automation and Contextual Intelligence

The most powerful features are the ones that work without the user doing anything. Sous should deliver value through understanding, not through input forms.

### 6.1 Zero-Input Personalization

**Principle:** Never ask the user to configure. Learn from behavior.

- Flavor profile: built from cook history, not a questionnaire. After 10 cooks, Sous knows you prefer acidic sides with rich mains.
- Skill calibration: inferred from which guided cook steps you skip (advanced) vs. which you expand for more detail (beginner). No skill level dropdown.
- Dietary patterns: detected from repeated side choices. If you consistently skip cheese-heavy sides, Sous infers lactose sensitivity without asking.
- Time sensitivity: if your cooks consistently start between 7-8pm, Sous learns your dinner window and weights prep time accordingly.

### 6.2 Context-Aware Recommendations

- **Time of day:** Morning opens get lighter, simpler suggestions. Evening gets full dinner plates. Late night gets comfort food.
- **Seasonal awareness:** Root vegetables and stews surface in winter. Light salads and grilled sides in summer. Transition seasons blend both.
- **Weather integration:** Optional, opt-in. On a cold rainy day, warming soups score higher. On a hot day, chilled cucumber sides surface. Uses Open-Meteo (free, no account required).
- **Cook history cadence:** If you cooked Italian 3 times this week, Sous gently nudges toward a different cuisine. Novelty is introduced automatically, not forced.

### 6.3 Automated Meal Memory

Every cook is automatically cataloged without the user doing anything beyond completing the flow.

- Cook completion auto-saves: date, time, recipe, sides chosen, duration
- Rating is prompted but optional — completion alone is valuable data
- Photos are prompted but not required — completion metadata feeds the preference engine regardless
- Weekly digest: auto-generated summary of what you cooked, your streak, and a suggested recipe for next week

### 6.4 Proactive Intelligence

**Concept:** Sous anticipates needs rather than reacting to requests.

- "You usually cook around 7pm. It's 6:30 — here's tonight's suggestion." (push notification, not in-app only)
- "You've cooked 4 times this week. One more and you hit your weekly goal." (gentle nudge, not nagging)
- "Last week you said the quinoa was undercooked. This time, we've added 3 extra minutes to that step." (learning from reflection)
- "Your friend group challenge ends tomorrow. You need one more cook to keep the streak." (social accountability)

### 6.5 Ingredient Intelligence (Future)

**Concept:** Sous learns what's likely in your kitchen based on what you've cooked recently.

- If you bought cilantro for last night's tacos, tonight's suggestions might include dishes that use remaining cilantro
- Ingredient overlap scoring: sides that share pantry staples with recent cooks score higher, reducing waste
- "You probably still have lemon from Tuesday's fish. Tonight's Greek salad uses it."

**Automation level:** Zero input. Inferred entirely from cook history and standard ingredient quantities.

---

## 7. Feature Prioritization Matrix

Every proposed feature is scored on two dimensions: impact on cooking frequency and implementation effort. Only high-impact features earn development time.

| Feature | Category | Impact | Effort |
|---|---|---|---|
| Streak system | Engagement | Very High | Medium |
| Daily quest card personalization | Automation | Very High | Low |
| Cook Together mode | Network | High | High |
| Group challenges | Network | High | Medium |
| Cuisine mastery badges | Engagement | Medium | Low |
| Recipe gifting | Network | High | Low |
| Context-aware recommendations | Automation | High | Medium |
| Household mode | Network | Very High | Very High |
| Ingredient intelligence | Automation | Medium | High |
| Cook replay with improvement | Engagement | Medium | Low |
| Proactive push notifications | Automation | High | Medium |
| Weekly cooking digest | Automation | Medium | Low |

*Priority order: ship high-impact/low-effort first, then high-impact/medium-effort. Defer high-effort features until user base validates the thesis.*

---

## 8. Measurement Framework

Strategy without measurement is storytelling. Every moat and feature must have a leading indicator.

### 8.1 North Star Metric

**Cooks completed per user per week.** Not DAU, not session time, not recipes viewed. Cooks completed. If this number goes up, everything else follows.

### 8.2 Moat Health Indicators

- **Data moat:** Average preference vector richness (number of meaningful signals) per user at 30 days
- **Content moat:** Guided cook completion rate (% of users who finish the full flow once started)
- **Behavioral moat:** Week-4 retention rate (% of users who cook in their 4th week)
- **Engine moat:** Recommendation acceptance rate (% of suggested sides that users actually cook)
- **Network moat:** Viral coefficient (new users acquired per existing user per month)

### 8.3 Anti-Metrics

Metrics to actively avoid optimizing for:

- Time in app (we want fast decisions, not browsing)
- Recipes saved (saving is not cooking)
- Feature usage breadth (depth of cooking habit matters more than feature exploration)
- Social interactions per session (we're not building a social network)

---

## 9. Strategic Risks and Mitigations

### 9.1 Risk: Limited Catalog Feels Restrictive

**Scenario:** Users hit the edges of 203 sides and feel constrained.
**Mitigation:** Intelligence compensates for inventory. The same 203 sides, paired differently based on context and preference, create combinatorial variety. 93 mains x 203 sides x contextual scoring = functionally infinite combinations. Expand catalog steadily but don't rush breadth over depth.

### 9.2 Risk: Social Features Distract from Core

**Scenario:** Cook Together and challenges become the product, and the core solo cooking loop atrophies.
**Mitigation:** Social features are always additive, never required. Every flow works perfectly as a solo experience. Social layers are gated behind the 30-day Community unlock to ensure the solo habit is established first.

### 9.3 Risk: AI Dependency

**Scenario:** AI providers change pricing, quality degrades, or API goes down.
**Mitigation:** Every AI-enhanced feature has a deterministic fallback that already works. The pairing engine is fully deterministic. AI adds warmth and nuance but never gates functionality. This is an architectural principle, not a nice-to-have.

### 9.4 Risk: Habit Formation Fails

**Scenario:** Users try Sous, cook once or twice, and don't return.
**Mitigation:** The first 3 cooks are the critical window. Progressive unlock creates curiosity-driven return visits. The daily quest card provides a low-friction re-entry point. Push notifications at the user's learned dinner time create an external trigger. If week-1 retention is below 40%, the onboarding flow needs redesign before any new features are built.

---

## 10. Decision Log

Strategic decisions made, with rationale. Append new decisions as they arise.

| Date | Decision | Rationale |
|---|---|---|
| Apr 2026 | Defer auth to production launch | Focus prototype on functionality. Auth adds friction without validating the cooking loop. |
| Apr 2026 | 203 sides is sufficient for V1 | Combinatorial variety (93 mains x 203 sides x context) creates perceived variety far beyond raw catalog size. |
| Apr 2026 | No open-ended AI chatbot | Bounded AI surfaces are controllable and testable. Open-ended chat creates unpredictable experiences and liability. |
| Apr 2026 | Social features gated behind 30-day unlock | Solo cooking habit must be established before social features are introduced. Social without solo habit = churn. |

---
