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

| Principle                              | Sous Application                                                                          | Resulting Moat                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Create a monopoly in a small market    | Cooking-anxious adults aged 22-35 who want to cook but feel overwhelmed by choice         | Own the niche before expanding; no one else targets this segment with this approach     |
| Be 10x better, not 10% better          | 60-second craving-to-plate vs. 20-minute recipe search and meal planning                  | Order-of-magnitude reduction in decision friction                                       |
| Start with a small market and dominate | Side dish pairing for home dinners only. Not lunch, not baking, not meal prep.            | Deep expertise in one vertical before horizontal expansion                              |
| Proprietary technology                 | Deterministic pairing engine with 6 weighted scorers, not generic AI recommendations      | No one can replicate the scoring logic without rebuilding the domain model from scratch |
| Network effects                        | Cook together features, group challenges, shared scrapbooks compound with each user added | Each new user makes the platform more valuable for existing users                       |
| Durability (last mover advantage)      | Preference memory + cooking history = switching cost that grows every week                | After 50 cooks, leaving Sous means abandoning a personalized cooking intelligence       |

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

| Feature                          | Category   | Impact    | Effort    |
| -------------------------------- | ---------- | --------- | --------- |
| Streak system                    | Engagement | Very High | Medium    |
| Daily quest card personalization | Automation | Very High | Low       |
| Cook Together mode               | Network    | High      | High      |
| Group challenges                 | Network    | High      | Medium    |
| Cuisine mastery badges           | Engagement | Medium    | Low       |
| Recipe gifting                   | Network    | High      | Low       |
| Context-aware recommendations    | Automation | High      | Medium    |
| Household mode                   | Network    | Very High | Very High |
| Ingredient intelligence          | Automation | Medium    | High      |
| Cook replay with improvement     | Engagement | Medium    | Low       |
| Proactive push notifications     | Automation | High      | Medium    |
| Weekly cooking digest            | Automation | Medium    | Low       |

_Priority order: ship high-impact/low-effort first, then high-impact/medium-effort. Defer high-effort features until user base validates the thesis._

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

| Date     | Decision                                   | Rationale                                                                                                           |
| -------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Apr 2026 | Defer auth to production launch            | Focus prototype on functionality. Auth adds friction without validating the cooking loop.                           |
| Apr 2026 | 203 sides is sufficient for V1             | Combinatorial variety (93 mains x 203 sides x context) creates perceived variety far beyond raw catalog size.       |
| Apr 2026 | No open-ended AI chatbot                   | Bounded AI surfaces are controllable and testable. Open-ended chat creates unpredictable experiences and liability. |
| Apr 2026 | Social features gated behind 30-day unlock | Solo cooking habit must be established before social features are introduced. Social without solo habit = churn.    |

---

## 11. Market Research — Minimalist Integration Candidates

> **GATE:** No feature from this section should be built unless it (a) requires zero new screens, (b) adds no more than one new UI element to an existing screen, and (c) directly increases cooks-per-week. If it fails any of these, move it to Section 12.

This section tracks ideas from other apps that could be feasibly integrated into Sous without compromising the minimalism mandate. Each entry has cleared the gate above before being listed here.

### 11.1 Duolingo — Streak Freeze

**What it does in the source app:** Users earn a "streak freeze" that automatically activates on a day they miss their streak, protecting their progress without intervention.

**How it adapts to Sous:** A streak freeze token appears on the Today screen only when the user is at risk (streak ≥ 7 days, no cook logged by 8pm). Displayed as a small snowflake icon beside the streak counter. Earned by completing any challenge or 3-cook week. One free freeze per 30-day period for all users regardless.

**Why it passes the gate:** No new screen. One new icon on an existing element (streak counter). Directly reduces streak-break churn, which is the primary driver of habit discontinuation.

**Estimated effort:** Low

**Moat strengthened:** Behavioral Moat (§2.3) — extends the loss-aversion psychology of the streak system and keeps the compounding habit loop intact longer.

---

### 11.2 Duolingo — Celebratory XP / Micro-feedback on Cook Completion

**What it does in the source app:** On lesson completion, Duolingo shows a burst of XP earned, a brief confetti animation, and a streak increment — all in 2 seconds before moving forward.

**How it adapts to Sous:** Enhance the existing win screen with a 1.5-second "cook credit" burst: show the XP equivalent (cook points earned), streak increment animation, and cuisine mastery progress tick — all in sequence before the win screen settles. No new screen; the win screen already exists.

**Why it passes the gate:** No new screen. The win screen is an existing screen being enriched, not expanded. The animation sequence is additive, not structural. Directly reinforces the reward phase of the habit loop.

**Estimated effort:** Low

**Moat strengthened:** Behavioral Moat (§2.3) — amplifies the dopamine signal at the exact moment of completion.

---

### 11.3 Headspace — Session Completion Ring (Weekly Progress Visualization)

**What it does in the source app:** A subtle circular ring on the home screen fills as the user completes sessions toward their weekly goal. No numbers, no labels — just a visual fill that communicates progress at a glance.

**How it adapts to Sous:** A thin circular progress arc wraps the outside of the daily quest card (or the avatar/icon at the top of Today tab). Fills as the user completes cooks toward their weekly goal (default: 3 cooks/week). No numbers displayed unless tapped. Resets each Monday.

**Why it passes the gate:** No new screen. One new visual element on the Today screen (the arc). Communicates progress without adding cognitive load or requiring interaction. Directly motivates return cooks to fill the ring.

**Estimated effort:** Low

**Moat strengthened:** Behavioral Moat (§2.3) — creates a visual investment signal on the home screen that pulls users back to complete the week.

---

### 11.4 Pestle — Focused Step Dimming in Cook Mode

**What it does in the source app:** During cook mode, the active step is bright and full-opacity. All surrounding steps are dimmed to near-invisible. The user sees only one step at a time, with the next step barely visible as a preview at the bottom edge.

**How it adapts to Sous:** In the Guided Cook flow (StepCard), dim all non-active steps to ~20% opacity while the current step is full opacity. The next step peeks in at 40% opacity at the bottom of the card, creating forward momentum without distraction. No structural changes — purely a CSS/animation layer over existing StepCard behavior.

**Why it passes the gate:** No new screen. No new UI element — modifies the opacity of existing elements. Reduces cognitive load mid-cook, which directly improves guided cook completion rate (a leading indicator for the content moat).

**Estimated effort:** Low

**Moat strengthened:** Content Moat (§2.2) — improves guided cook completion rate, which is the primary health indicator for this moat.

---

### 11.5 Mela — URL-to-Recipe Import for Catalog Expansion

**What it does in the source app:** Paste any recipe URL and Mela parses the ingredients, steps, and metadata into a clean, structured card. No manual entry required.

**How it adapts to Sous:** A "suggest a dish" input field in the Path tab (not Today tab — this is a power user action) accepts a URL or dish name. The input triggers the AI parser to extract the dish and flag it for the catalog review queue. The user sees a confirmation: "Thanks — we'll review and add this dish." No new screen; the Path tab already exists.

**Why it passes the gate:** No new screen. One new input element on the existing Path tab (not Today tab, which remains untouched). Does not affect the core Today flow. Directly feeds catalog growth, which extends guided cook coverage and strengthens the content moat.

**Estimated effort:** Medium

**Moat strengthened:** Content Moat (§2.2) — accelerates catalog depth through community suggestion without requiring editorial effort per dish.

---

### 11.6 Yummly — "What I Have" Ingredient Signal

**What it does in the source app:** Users can tag ingredients they have on hand; Yummly filters and re-ranks recipes accordingly.

**How it adapts to Sous:** A single-line "I have…" chip below the craving input on the Today screen. Optional, pre-collapsed (shows as a `+` icon). User types one or two ingredients (e.g., "lemon, chicken") and the pairing engine boosts sides that use those ingredients. No filter panel, no ingredient database to manage — the engine uses the typed signal as a scoring hint, not a hard filter.

**Why it passes the gate:** No new screen. One collapsible chip below the existing craving input. Zero UI clutter when unused. Directly increases recommendation relevance, which increases recommendation acceptance rate and reduces friction to starting a cook.

**Estimated effort:** Medium

**Moat strengthened:** Engine Moat (§2.4) — adds a real-time ingredient signal to the scoring system, making the deterministic pairing engine more contextually intelligent without changing its architecture.

---

### 11.7 Noom — Positive Framing on Nutrition Feedback

**What it does in the source app:** Instead of showing calories as a number to minimize, Noom frames food choices in terms of density, color coding (green/yellow/orange), and behavioral language ("this is a great choice for how you feel tonight").

**How it adapts to Sous:** The nutrition summary on the win screen and result card replaces numeric density with a plain-language frame: "Light on prep, rich in flavor — a good call tonight." or "High-energy plate — good match for a busy week." No calorie counts, no macros. Behavioral copy generated by the AI coach based on the dish's nutritional metadata.

**Why it passes the gate:** No new screen. No new UI element — replaces existing text copy on existing screens. Improves the emotional quality of the win screen without adding information density.

**Estimated effort:** Low

**Moat strengthened:** Behavioral Moat (§2.3) — reinforces positive identity formation ("I'm someone who makes good food choices") which is a stronger retention signal than nutritional tracking.

---

### 11.8 Centr — Progressive Difficulty Surfacing

**What it does in the source app:** Centr introduces harder workouts only after a user has completed foundational sessions. The program adapts to your history, not your self-reported fitness level.

**How it adapts to Sous:** The pairing engine uses cook count as an implicit skill signal. New users (0–5 cooks) only receive sides with prep time ≤ 15 min and skill level "Easy." After 10 cooks, "Medium" sides begin appearing. After 25, "Advanced" sides surface occasionally. No skill level selector, no prompt — the engine reads cook history. The result card shows a subtle "new challenge" tag when a side is above the user's typical skill band, framing it as exciting rather than intimidating.

**Why it passes the gate:** No new screen. The "new challenge" tag is one small label on the existing result card, already used for other metadata. The difficulty progression logic lives entirely in the engine, invisible to the user. Directly increases long-term engagement by preventing skill stagnation.

**Estimated effort:** Medium

**Moat strengthened:** Data Moat (§2.1) and Engine Moat (§2.4) — cook history drives skill inference, deepening the preference vector while the engine uses it to deliver progressively engaging recommendations.

---

## 12. Ambitious Ideas Parking Lot

> **Review cadence:** Review this section monthly. Present top 3 candidates to founder for go/no-go decision.

This section tracks bigger, riskier, or more complex ideas from competitor research and market observation. These are ideas that could be transformative but require careful evaluation — either because they demand significant engineering, risk scope creep, or could compromise the minimalism philosophy if executed carelessly. Nothing here is built without explicit founder approval.

---

### 12.1 AR Overlay for Plating Guidance

**Source/inspiration:** Cooking competition shows, augmented reality food apps (e.g., SideChef AR experiments).

**What it does:** Uses the device camera to overlay plating guides onto the user's actual plate — showing where to place components, sauce drizzle paths, and garnish positioning in real-time.

**Why it's ambitious:** Requires ARKit/ARCore integration, significant computer vision work to detect plate edges and food placement, and a new AR camera screen. Adds a new device permission (camera during plating, distinct from photo upload). High chance of feeling gimmicky if execution is imperfect.

**Potential upside:** Could become a genuine differentiator and viral moment — users sharing AR plating reels would be organic marketing. Creates a "pro cook" aspiration signal that strengthens the mastery identity.

**Prerequisites:** Guided cook completion rate must be above 70%. AR content library (plating guides per dish) must be authored. Native app (React Native or Swift/Kotlin) likely required — web AR is too unreliable.

**Risk assessment:** High effort for uncertain payoff. Risk of distraction from the core cook loop. If the AR is buggy or awkward, it actively hurts the "cooking confidence" brand promise. Plating is also a late-stage concern — most users aren't ready to care about plating until cook 20+.

**Status:** PARKED

---

### 12.2 Voice-Guided Cooking (Hands-Free Mode)

**Source/inspiration:** Alexa/Google Home cooking skills, SideChef voice mode.

**What it does:** Text-to-speech reads out each step as the user advances through the guided cook flow, hands-free. User can say "next step," "repeat that," or "set a timer" without touching the device.

**Why it's ambitious:** Requires speech synthesis integration (likely Web Speech API or a TTS provider), speech recognition for voice commands, microphone permissions, and UX design for a fundamentally different interaction modality. Significant accessibility and localization complexity.

**Potential upside:** Genuinely hands-free cooking is the highest-fidelity guided cook experience possible. Users with phones propped up, hands covered in dough, would find this transformative. Strong differentiation from recipe apps that require constant phone touching.

**Prerequisites:** Core guided cook flow must be stable and proven. Need to test speech recognition reliability in kitchen environments (background noise, steam, music). Minimum viable version could be TTS-only (no voice commands) to test adoption before adding speech recognition.

**Risk assessment:** Medium-high. TTS-only is achievable in a sprint. Full voice command mode is a significant investment. The risk is investing in a feature that users want conceptually but don't actually use in practice (the "smart speaker cooking skill" graveyard is large).

**Status:** PARKED

---

### 12.3 AI-Generated Weekly Meal Plans

**Source/inspiration:** Mealime, Eat This Much, Whisk.

**What it does:** Based on the user's cook history, preference vector, and stated goals, Sous generates a suggested 5-day dinner plan with a consolidated grocery list. One tap to add any planned dinner to the queue.

**Why it's ambitious:** Meal planning is a fundamentally different use case than tonight's dinner decision. It requires a planning screen, a grocery list view, a shopping integration layer, and a meal calendar — all of which conflict with the "no browsing, one screen" philosophy. High risk of turning Sous into a meal planning app, which is the exact commodity space Sous is trying to escape.

**Potential upside:** High retention signal — users who plan meals weekly cook more consistently. Grocery list generation is a frequently requested feature and a legitimate convenience. Could be the natural evolution for users who've established the cooking habit (50+ cooks).

**Prerequisites:** Strong preference vector (50+ cook history). Grocery integration or at minimum a clean export format. The feature must be initiated from Path tab, never surfacing on Today tab. Requires explicit product philosophy decision: are we okay becoming a planning tool for power users?

**Risk assessment:** Very high risk of scope creep. The planning interface, if built generously, becomes a competing product within the product. Must be ruthlessly constrained: one-week plan, no editing individual meals, no persistent grocery list beyond export.

**Status:** PARKED

---

### 12.4 Social Recipe Marketplace

**Source/inspiration:** Etsy model applied to recipes; Gumroad for creators.

**What it does:** Power users who have developed their own guided cook flows can publish them to the Sous marketplace. Other users can buy or tip for access. Creators earn revenue; Sous takes a platform cut.

**Why it's ambitious:** Requires creator accounts, payment processing, content moderation, intellectual property management, quality assurance for user-generated guided cooks, and a browse/discovery surface — all of which are high complexity and introduce marketplace dynamics that can harm brand trust if quality is uneven.

**Potential upside:** Creator economics could attract culinary talent to author guided cook content at scale, solving the catalog growth bottleneck without Sous editorial overhead. Could create a category of "Sous Creators" who build audiences within the platform.

**Prerequisites:** Minimum 10,000 active monthly users to make creator economics viable. Robust guided cook authoring tools (not yet built). Content moderation infrastructure. Legal framework for food safety liability.

**Risk assessment:** Extremely high complexity and risk. Marketplace dynamics are notoriously hard to balance. Low-quality user content could undermine the "every guided cook is tested and trusted" brand promise. Not appropriate until V3 or later.

**Status:** PARKED

---

### 12.5 Smart Kitchen Device Integration

**Source/inspiration:** BRAVA, June Oven, Breville smart appliances; integration with Alexa cooking timers.

**What it does:** Sous communicates with smart kitchen devices during a guided cook. When a step requires a timer, the oven preheats automatically. When water needs to boil, the smart induction burner activates. Cook flow and physical appliances are synchronized.

**Why it's ambitious:** Requires device-specific integrations (no universal standard), OAuth flows for each manufacturer, reliability requirements (a missed command could ruin a dish or cause a safety issue), and a market penetration assumption (most users don't own smart kitchen devices). The integration surface is fragmented and high-maintenance.

**Potential upside:** If smart kitchen adoption increases, this could be the defining "wow" moment that makes Sous feel like the future. Creates a premium tier justification and strong word-of-mouth.

**Prerequisites:** Smart kitchen device ownership above 15% of target user segment (currently much lower). Stable partnerships with at least 2-3 major device manufacturers. This is a V3+ consideration.

**Risk assessment:** High effort, low short-term reach. The reliability bar is extremely high — a bug that leaves an oven on is a serious liability. Not appropriate until the core app is mature and user base is large enough to justify manufacturer partnerships.

**Status:** PARKED

---

### 12.6 Computer Vision Real-Time Cooking Feedback

**Source/inspiration:** Computational gastronomy research; startup experiments in real-time food analysis (e.g., detecting browning, doneness).

**What it does:** The user points their camera at the pan during a cook step. Computer vision analyzes the image and provides feedback: "That looks well browned — move to the next step" or "Needs another 90 seconds — the edges aren't caramelized yet."

**Why it's ambitious:** Requires a custom fine-tuned vision model for each dish type, real-time video streaming or rapid image capture, significant compute cost per session, and UX design for a camera-during-cooking interaction pattern. The accuracy requirement is extremely high — bad advice during cooking is worse than no advice.

**Potential upside:** This would be a genuine 10x improvement over any text-based timer guidance. For novice cooks, visual confirmation that "yes, it looks right" could be transformative for confidence. No competitor has solved this well.

**Prerequisites:** A fine-tuned vision model trained on per-dish browning/cooking states. Extensive testing to get accuracy above a threshold where it's helpful rather than confusing. This is likely a 12-18 month research and development investment before any user-facing version is viable.

**Risk assessment:** Very high technical risk. Current general-purpose vision models are not reliable enough for real-time cooking feedback at the granularity required. Could become a major differentiator or a major engineering sinkhole with no return.

**Status:** PARKED

---

### 12.7 Seasonal Ingredient Sourcing Partnerships with Local Farms

**Source/inspiration:** CSA (Community Supported Agriculture) subscriptions; Farmbox Direct; Good Eggs.

**What it does:** Sous partners with local farm networks. When seasonal ingredients are available nearby, Sous surfaces dishes that use those ingredients and offers a direct-order link to the farm. The recommendation engine gains a "hyper-local seasonal" scoring signal.

**Why it's ambitious:** Requires building and maintaining a supplier network, geo-fenced inventory APIs from farms (which rarely exist), logistics coordination, and a commerce layer. Also has significant geographic coverage limitations — works in urban and suburban markets, not rural users.

**Potential upside:** Strong brand differentiation ("Sous connects you to your local food system"), revenue opportunity from referral fees, and a genuinely unique data signal for the recommendation engine. Appeals to a values-aligned segment of the target market.

**Prerequisites:** Geographic concentration of early user base (need density in specific markets to make farm partnerships viable). A commerce or affiliate infrastructure layer. Minimum viable version: curated seasonal ingredient spotlights that link to an existing marketplace (e.g., Instacart Local) without any direct farm relationship.

**Risk assessment:** High operational complexity that is not core to the product. Risk of over-rotating toward a food sourcing product. If pursued, must be treated as a partnership layer on top of the core app, never as a first-class feature that changes the recommendation interface.

**Status:** PARKED

---

### 12.8 Gamified Cooking Tournaments and Competitions

**Source/inspiration:** Duolingo leagues, Strava challenges, cooking competition format.

**What it does:** Time-limited cooking tournaments where users compete on a shared theme (e.g., "best use of fennel this week"). Entries are photos from the win screen. Judged by community vote or panel. Winners earn in-app recognition and badges.

**Why it's ambitious:** Requires a competition management system, voting UI, anti-fraud measures (vote manipulation), moderation for photo content, notification cadence for tournament lifecycle, and a public leaderboard or gallery — all of which add significant UI surface.

**Potential upside:** Could create viral content moments and drive press coverage. Power users who care about recognition would be deeply engaged. Natural content for the Community tab.

**Prerequisites:** Community tab live and active. Minimum 5,000 monthly active users to generate meaningful tournament participation. Content moderation capability (photos can be inappropriate).

**Risk assessment:** Medium. The risk is that competition culture attracts a different user type than the cooking-anxious beginner that Sous is built for. Competitive formats can be discouraging for new cooks. If pursued, restrict to opt-in friend group tournaments (same in-group dynamic as Group Challenges, §3.2) before any public competition surface.

**Status:** PARKED

---

### 12.9 White-Label Version for Cooking Schools and Corporate Wellness

**Source/inspiration:** B2B SaaS model; Calm for Business; corporate wellness platforms.

**What it does:** A configurable version of Sous that cooking schools can brand and use for student guided cook flows, or that corporate wellness programs can offer as a cooking benefit. Custom branding, curated recipe catalogs, admin dashboards.

**Why it's ambitious:** Requires a multi-tenant architecture, admin tooling, white-label design system, sales and support infrastructure, and a fundamentally different go-to-market motion (B2B sales vs. consumer growth). Significant distraction from the consumer product at early stage.

**Potential upside:** B2B contracts provide predictable revenue that subsidizes consumer growth. Cooking schools are natural advocates — their students become Sous users afterward. Corporate wellness is a large, underserved market.

**Prerequisites:** Consumer product proven with strong retention metrics. Clear product-market fit signals. Dedicated B2B product development capacity. This is a V3+ consideration after consumer traction is established.

**Risk assessment:** Very high risk of strategic distraction. B2B and B2C product requirements frequently conflict. Pursuing this before consumer PMF is a known startup failure mode.

**Status:** PARKED

---

### 12.10 Offline Mode with Full Guided Cook Capability

**Source/inspiration:** Duolingo offline lessons; Spotify offline playback; Headspace offline sessions.

**What it does:** Users can download any guided cook flow for offline use. Full step-by-step flow, timers, hack chips, and mistake warnings work without an internet connection. Sync resumes when connectivity returns.

**Why it's ambitious:** Requires a service worker caching strategy, offline-first data architecture, conflict resolution for preference sync when reconnecting, and significant testing across network conditions. Also requires that all AI-dependent features (craving parsing, coach messages) degrade gracefully offline.

**Potential upside:** Removes a real-world barrier — kitchens often have poor WiFi, and users shouldn't need a connection to follow a recipe they've already loaded. Could be meaningful for rural users or those with data limits.

**Prerequisites:** Core guided cook flow must be fully stable online. Service worker infrastructure in place. All AI calls must have deterministic fallbacks (already an architectural principle per §9.3). Minimum viable version: cache the last 3 viewed guided cooks automatically.

**Risk assessment:** Low-medium. The minimum viable version (pre-cache recently viewed cooks) is achievable without a full offline-first rewrite. The risk is in the scope creep of trying to make the entire app offline-capable, which is a significant architectural investment. Start with guided cook caching only.

**Status:** UNDER CONSIDERATION

---

---

## 11. Market Research — Minimalist Integration Candidates

> **GATE:** No feature from this section should be built unless it (a) requires zero new screens, (b) adds no more than one new UI element to an existing screen, and (c) directly increases cooks-per-week. If it fails any of these criteria, move it to Section 12.

### 11.1 Pestle — Step-by-Step Read-Aloud

- **Source:** Pestle (iOS recipe app)
- **Sous adaptation:** Optional speaker icon on StepCard for text-to-speech. No new screen.
- **Effort:** Low | **Moat:** Content moat

### 11.2 Duolingo — Streak Freeze Earned Through Engagement

- **Source:** Duolingo
- **Sous adaptation:** Extra cook earns a streak freeze. Shield icon next to streak counter.
- **Effort:** Low | **Moat:** Behavioral moat

### 11.3 Headspace — Celebration Variants

- **Source:** Headspace
- **Sous adaptation:** Vary win screen by milestone (first new cuisine, 10th cook). Same screen, different content.
- **Effort:** Low | **Moat:** Behavioral moat

### 11.4 Yummly — Ingredient Substitution Nudge

- **Source:** Yummly
- **Sous adaptation:** Long-press ingredient on Grab screen for inline substitution. No modal.
- **Effort:** Low | **Moat:** Engine moat

### 11.5 Noom — Micro-Lesson After Completion

- **Source:** Noom
- **Sous adaptation:** Optional cuisine fact card after win screen. Dismissible, uses existing data.
- **Effort:** Low | **Moat:** Content moat

### 11.6 Mela — Recipe Scaling

- **Source:** Mela
- **Sous adaptation:** Serving stepper (1-4) on Grab screen. Quantities adjust.
- **Effort:** Medium | **Moat:** Content moat

### 11.7 Centr — Progressive Difficulty Bias

- **Source:** Centr
- **Sous adaptation:** After 10+ cooks, silently bias toward harder dishes. Zero UI change.
- **Effort:** Low | **Moat:** Data + Engine moat

---

## 12. Ambitious Ideas Parking Lot

> **Review cadence:** Monthly. Present top 3 to founder for go/no-go.

### 12.1 AR Plating Guidance — PARKED

Camera overlay for plating arrangement. High visual impact but gimmicky risk.

### 12.2 Voice-Guided Cooking — UNDER CONSIDERATION

Hands-free via Speech API. High utility but kitchen noise degrades recognition.

### 12.3 AI Weekly Meal Plans — PARKED

Conflicts with spontaneous cooking thesis. Revisit if research shows demand.

### 12.4 Social Recipe Marketplace — PARKED

Creator economy for guided cooks. Needs large user base and quality control.

### 12.5 Smart Kitchen Device Integration — PARKED

Send commands to connected devices. Tiny addressable market.

### 12.6 CV Real-Time Cook Feedback — PARKED

Revolutionary but tech not ready. Revisit 2027+.

### 12.7 Gamified Cooking Tournaments — PARKED

Conflicts with supportive tone for cooking-anxious users.

### 12.8 Offline Mode — UNDER CONSIDERATION

PWA offline for poor-signal kitchens. Feasible, high practical value.

### 12.9 White-Label B2B — PARKED

Cooking schools and corporate wellness. Revisit after consumer PMF.

### 12.10 Seasonal Sourcing Partnerships — PARKED

Local ingredient delivery. Logistics nightmare but completes cook loop.
