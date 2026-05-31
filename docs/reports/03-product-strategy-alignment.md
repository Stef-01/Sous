# Sous — Product & Strategy Alignment Review

> **Reviewer role:** Product strategist / CEO-reviewer (adversarial)
> **Date:** 2026-05-31
> **Scope:** Does what was BUILT match what the product SAYS it is?
> **Verdict:** **No.** Sous has become the exact thing its founding documents swore it would never be — a feature kitchen-sink — and along the way it quietly forked into _two different products_ that don't agree on what the app is for.

---

## 0. The Central Tension (read this first)

Sous's own constitution (`CLAUDE.md`) defines the product as **"radical simplicity: one screen, one action, one win. Duolingo for cooking confidence, not another recipe database."** Five of its eleven critical rules exist to _defend that minimalism_ — the Sous Test (rule 1), one-primary-action (rule 2), no-settings (rule 3), simplicity-first/"when in doubt remove it" (rule 6), no-scroll navigation (rule 10).

The shipped app is **43 page routes, ~688 TS/TSX source files, and 38 feature modules under `src/lib`**, including a MapLibre geography game, a peer-to-peer charity-donation system wired to the live Stripe charges API, an eco-carbon dashboard, a meal planner, an "Eat Out" restaurant recommender, a Spotify-Wrapped annual recap, cooking pods with a cross-pod leaderboard and cohort matcher, a recipe-authoring CRUD suite, and a Reels/articles/forum content magazine.

That is not "Duolingo for cooking confidence." That is a recipe-and-lifestyle super-app. **The marginal-cost-of-completeness directive in `CLAUDE.md` ("Boil the ocean") has overridden the product-discipline rules in the same file, and nothing in the strategy layer caught it.** The thing built to be 10x better by doing _less_ is now 10x more sprawling than the competitors it was defined against.

And there is a deeper, more disqualifying problem underneath the sprawl: **the project no longer knows which product it is.** `STRATEGY.md` describes Sous (a behavioral cooking-habit app for "cooking-anxious adults 22–35"). `PRD.md` describes **NOURISH** (a clinical diabetes/pre-diabetes diet-education adjunct for Stanford Endocrinology, ages 25–70, North-star = "plate explorations per patient"). These are not two phases of one product. They are two different companies, two different users, two different north-star metrics, sharing one codebase. The build followed _neither_ faithfully — it shipped the Sous gamification fantasy and left the PRD's clinical product almost entirely unbuilt.

---

## 1. Scope Sprawl — Quantified

| Metric                               | Count                                       | Note                                                                                                                                                                                                                 |
| ------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page routes (`page.tsx`)             | **43**                                      | A "one screen, one action" product.                                                                                                                                                                                  |
| Route directories (ex-API)           | 52                                          |                                                                                                                                                                                                                      |
| `/path` sub-routes alone             | **18**                                      | The "progression" tab is now its own app: eco, charity-spend, llm-spend, pantry, pantry/scan, plan, plan/week, recap, recipes (+ new/edit/quick-add/[id]), household, shopping-list, cuisines, scrapbook, favorites. |
| `src/lib` feature modules            | **38**                                      | Includes `charity`, `eco`, `pod`, `cohort`, `voice`, `agentic`, `native`, `eat-out`, `recap`, `planner`, `parent-mode`, `recipe-authoring`.                                                                          |
| Total `.ts`/`.tsx` in `src`          | **~688**                                    |                                                                                                                                                                                                                      |
| `maplibre-gl` dependency             | `^5.24.0`                                   | A WebGL mapping engine shipped to run a dish-origin trivia game.                                                                                                                                                     |
| Planning/retro `.md` files (`docs/`) | **124**                                     | Plus a full duplicate set stranded in `.claude/worktrees/`.                                                                                                                                                          |
| Git commits                          | 569 over **~3 months** (Feb 5 – May 4 2026) | …spanning fictional "Year 1" through "Year 7" plans.                                                                                                                                                                 |

**The Today page** — the single surface that must pass the Sous Test — renders, in `src/app/(today)/today/page.tsx`, a vertical stack of **eleven** distinct conditional surfaces around the one hero (`QuestCard`):

`CravingSearchBar` → `CookRhythmLine` → `TonightChip` → `RepeatCookChip` → `TodayPlannedSlot` → `CookAgainChip` → `DailyNoveltyChip` → `WhosAtTable` → `WeeklyRhythmWidget` → `EcoProgressChip` → **`QuestCard`** → `More options` → `FriendsStrip`.

Each is individually defended in a code comment as "quiet," "ambient," "renders nothing on cold-start." That defense is the tell. **Every one passed an individual minimalism check; the _sum_ is precisely the information-dense home screen rule 6 forbids.** The architecture has no governor on aggregate density — only per-element politeness. A returning power user with cooks logged sees a scrolling feed of chips, not "one screen, one action, one win." This is a textbook violation of the Sous Test by accretion.

---

## 2. Has Sous become a recipe-database / kitchen-sink? — **Yes, decisively**

The contrarian bet in `STRATEGY.md §1.1` is explicit: _"No browsing. There is no recipe browse page, no category grid... The absence of browsing is the product."_ and _"Intelligence over inventory."_

Reality:

- **`/sides` is a browse page.** `/path/recipes` is a full recipe-CRUD product (`new`, `quick-add`, `[id]`, `[id]/edit`) — i.e., users now _author and edit recipes_, the exact "recipe editor screen" the Base+Overlay decision (`STRATEGY.md` decision log) was created to avoid.
- **`/community` is a content magazine** — reels, articles, research, experts, forum, saved, admin, leaderboard, pods. This is a social/content feed, the precise category §3 ("without becoming a social media platform") and the anti-metrics in §8.3 ("we're not building a social network") warned against.
- **`/eat-out`** turns the cook-tonight product into a restaurant-discovery product — the opposite of cooking.
- **The 8-cuisine mastery grid + games arcade + leaderboards** are gamification surface area that exists to drive _app opens_, which §8.1 explicitly rejects in favor of _cooks completed_.

The strategy document literally lists "Social Recipe Marketplace," "Gamified Cooking Tournaments," and "AI-Generated Weekly Meal Plans" in its **PARKED** section (§12) as things _not_ to build without consumer PMF. The build shipped functional analogues of all three (recipe authoring, cross-pod leaderboard, `/path/plan/week`) — **with zero users and no PMF signal**, because there is no auth, no database, and no analytics. The parking lot was ignored.

---

## 3. The Strategic Moat — claimed vs. compounded

`STRATEGY.md §2` names four moats, all of which compound on **one behavior: completed cooks**.

1. **Data moat** — preference memory from cook completions.
2. **Content moat** — hand-authored guided-cook quality.
3. **Behavioral moat** — the crave→cook→win habit loop.
4. **Engine moat** — the deterministic 6-scorer pairing engine.

**Verdict: the build scatters energy _away_ from every one of these.**

- The **content moat** is the most under-invested area relative to its strategic weight. `ROADMAP.md` admits guided-cook coverage is **126 flows (~58% of sides), and scored pairings still cover only 14 Indian mains** out of 93 — _the Python scoring engine the entire "intelligence over inventory" thesis rests on has not been run on 85% of the catalog._ This is the single highest-leverage moat and it has been frozen for the duration while pods, eco, charity, and maps were built. The strategy says 500+ authored cook flows is where the content moat becomes "genuinely hard to replicate." The team is at 126 and pointed elsewhere.
- The **data moat** can't compound: there is no auth and no DB (`localStorage` only), so no cross-device, cross-session preference accumulation actually persists for a real user base. The moat is architecturally stubbed while _adjacent_ surfaces (cohort segmentation, retention analytics dashboards) were built to _analyze_ data that doesn't exist yet.
- The **behavioral moat** is actively _diluted_ — every new tab and chip is a competing call-to-action that pulls attention off the cook loop, the exact failure mode §9.2 ("Social Features Distract from Core") predicted.

The moats are real and well-chosen. The build does not deepen them; it builds a ring of shallow, unrelated surfaces around them.

---

## 4. Feature-Prioritization Discipline (rule 8) — **the gate is not being applied**

`CLAUDE.md` rule 8 mandates consulting `STRATEGY.md` before any feature, and updating its decision log on significant decisions.

**Hard evidence the gate is dead:**

- `STRATEGY.md` header reads **"Last updated: 2026-04-06 | V1 Prototype Stage."** Its decision log's last entry is **April 2026.**
- A grep of `STRATEGY.md` for the features that dominate the build — `cooking pod`, `eco mode`, `charity`, `parent mode`, `eat out`, `annual recap`, `cohort`, `leaderboard` — returns **0 matches.**
- Yet git shows all of these shipped (Y2 through Y5, "cursor at Y5 W28+"), with commit subjects like `feat(Y5 G): Pod challenges 2.0 — themes + cohort matcher + cross-pod leaderboard`.

So: **roughly two "years" of feature development happened entirely outside the strategy document that rule 8 makes load-bearing.** The decision log — the one artifact designed to enforce prioritization — was abandoned at the exact moment the sprawl began. Features were governed instead by `daily-feature-ideas-*.md` digests scraped from competitor blog posts ("Honeydew pitches Instagram import," "Snapshot Recipes shipped ingredient scanning April 14"). That is **feature-of-the-day accretion driven by competitor FOMO**, which is precisely the dynamic the contrarian bet (§1.1) was written to resist.

_Credit where due:_ the daily-ideas digests are not mindless — the April 19 entry correctly **re-parks** AI weekly meal plans with a sharp rationale ("If we cave to this, we become a worse Mealime"). The discipline exists at the level of individual idea triage. It is absent at the level of _aggregate roadmap_, which is the level that matters. Saying no to one bad idea while saying yes to pods + charity + maps + eat-out is not discipline; it's noise.

---

## 5. Planning-Doc Inflation — **planning theater, not clarity**

124 markdown planning docs for a pre-auth, pre-DB, single-developer prototype is not strategic clarity. The structure reveals the problem:

- **Fictional time travel.** `STRATEGY.md` is dated "V1 Prototype Stage, April 2026." The same repo contains `YEAR-1` through `YEAR-7` vibecode plans and Year-1..5 retrospectives — **all authored inside the same 3-month git window (Feb–May 2026).** `YEAR-5-VIBECODE-PLAN.md` is "Filed 2026-11-29" (a date 6 months in the future of the last commit) and references "Sprint W51." The roadmap simulates a 7-year company in a quarter. Retrospectives are being written for years that, in real calendar time, never happened. This is elaborate world-building, and it manufactures false confidence: a "Year-3 retrospective" reads like validated learning but encodes zero real user feedback (there are no users).
- **Overlapping, redundant roadmaps.** `ROADMAP.md`, `planning.md`, `FUTURE-SPRINTS.md`, `NEXT-20`/`20B`/`20C`/`20D-PHASES`, `STAGE-1-2-6MO-TIMELINE`, `STAGE-3-VIBECODE-AUTONOMOUS-6MO` _and_ `-12MO`, plus `docs/y2..y5/sprints/` and `docs/weeks/W6..W51`. Multiple documents claim authority over "what's next" and contradict each other on staging (Stage 3 shipped "before Stage 2"; Years run in parallel with Stages).
- **Duplicated state.** The _entire_ `docs/` tree is mirrored inside `.claude/worktrees/vibrant-neumann-6cff74/` — including a second copy of every Year plan and a `daily-feature-ideas/` set — which is exactly the "work stranded in worktrees" the operational guardrails warn against.

The volume of planning is **inversely correlated** with the clarity of the answer to "what is this product and who is it for." More plans have produced less focus.

---

## 6. The Off-Thesis Features (ranked by strategic cost)

### 6.1 🔴 CRITICAL — Charity donations via live Stripe charges

`src/lib/charity/stripe-charge.ts` is a **real payments integration**: it POSTs to `https://api.stripe.com/v1/charges` with idempotency keys, form-encoding, and a per-pod weekly-charge dispatcher; `/path/charity-spend` is an internal founder dashboard for watching donations roll in. A cooking-habit prototype with no auth and no users has shipped a **money-movement system that charges users and disburses to nonprofits.** This is off-thesis (cooking confidence ≠ charitable giving), introduces real financial/regulatory/PCI surface, and contradicts the lean "zero new infra" posture stated all over `ROADMAP.md`. Highest strategic cost: it is the clearest single proof that "boil the ocean" has fully decoupled from product judgment.

### 6.2 🔴 CRITICAL — Product identity fork (Sous vs. NOURISH)

The PRD's actual product — ADA Plate Method, diabetes/glycemic indicators, clinician referral, "warm clinical not cold medical" — is **essentially unbuilt**: only 18 files in `src` even reference diabetes/glycemic/ADA, and the substantive ones are _placeholder content-magazine data_ (`articles.ts`, `experts.ts`). The word "NOURISH" appears **0 times** in source; "nourish-" survives only as CSS color-token names. Meanwhile the gamified Sous fantasy (XP, streaks, pods, badges, games) — which the PRD never mentions and whose tone ("Zero Guilt," clinical adjunct) it arguably contradicts — is fully built. **The team built the document it should have questioned and ignored the document a real clinical partner signed off on.** A CEO cannot pitch this: the deck says "Stanford diabetes tool," the demo shows a Duolingo cooking game with a charity leaderboard.

### 6.3 🟠 HIGH — Cuisine Compass (MapLibre map game)

A WebGL mapping engine (`maplibre-gl`) shipped to power dish-origin geography trivia. Pure engagement-for-engagement's-sake — it teaches nothing the pairing engine uses, drives app-opens not cooks (anti-metric §8.3), and adds a heavyweight bundle dependency to a product whose Stage-2 perf goal is "<150KB gzipped." The strategy parked "Gamified Cooking Tournaments" for far less.

### 6.4 🟠 HIGH — Cooking Pods + cohort matcher + cross-pod leaderboard

`STRATEGY.md §3` is emphatic that social must stay _in-group_ (3–8 people, no public leaderboards) and gated behind a 30-day solo-habit unlock. The build ships a **cross-pod leaderboard** (public competition) and a cohort matcher, with the unlock gate removed (rule 11). This is the §9.2 risk realized: social became a product surface before the solo habit was validated.

### 6.5 🟡 MEDIUM — Eco Mode + carbon dashboard, Eat Out, Annual Recap, Planner, Recipe authoring

Each is a coherent little product. None compounds a named moat. Collectively they are where the energy went that should have gone to guided-cook coverage and the pairing engine. Eat Out is the most thesis-contradicting of the group (it routes users _away_ from cooking).

---

## 7. What Actually Matters (the 1–2 things)

1. **Finish the content + engine moat.** Run the Python scorer across all 93 mains (kill the "14 Indian mains" embarrassment), and push guided-cook coverage from 126 toward the 500 the strategy says is the defensibility threshold. This is the _only_ work that compounds and the only work a competitor genuinely cannot copy. It has been starved for "years."
2. **Pick the product. Sous OR NOURISH.** Reconcile `STRATEGY.md` and `PRD.md` into one thesis with one user and one north-star metric, then delete the other. This is a founder decision, not an engineering one, and everything downstream (which features survive the cut) depends on it. Right now the most expensive liability in the repo is the _unanswered_ question of what is being built.

---

## 8. The Cut-List — 3 highest-leverage cuts

> Cutting here is not destruction; per the "always commit to main / revert handles mistakes" posture, these can be branched out and revived if a real user ever asks. No user has, because there are no users.

1. **CUT the charity + Stripe payments system** (`src/lib/charity/*`, `/path/charity-spend`, pod pledges). Highest risk-to-value ratio in the codebase — real financial surface, zero thesis alignment, and it presumes a paying user base that does not exist. Remove the live `api.stripe.com` wire-up immediately regardless of the broader decision.
2. **CUT the engagement-arcade sprawl** — Cuisine Compass + `maplibre-gl` dependency, the games arcade, eco dashboard, and Eat Out. These optimize the explicit anti-metric (app-opens over cooks) and consume bundle + maintenance budget. Removing `maplibre-gl` alone is a measurable perf win against the stated <150KB goal.
3. **CUT / freeze the social-content tab** (`/community` pods, cross-pod leaderboard, cohort matcher, reels/forum) until the solo cook habit is validated with real retention data — exactly the sequencing `STRATEGY.md §9.2` mandates and rule 11 overrode. Building social-graph mechanics with no users is the definition of premature.

**And one cut of process, not code:** collapse the 124 planning docs to **three** — one strategy (post-identity-decision), one roadmap (real calendar, AUTO-BUILD vs FOUNDER-GATED per rule 12), one decision log that is _actually maintained_. Delete the Year-1–7 fiction and the duplicated worktree tree. The planning corpus currently obscures more than it reveals.

---

## 9. Severity Summary

| #   | Finding                                                                               | Severity    | Strategic cost                                                        |
| --- | ------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------- |
| 1   | Product identity fork (Sous habit-app vs. NOURISH clinical tool); PRD product unbuilt | 🔴 Critical | Un-pitchable; no coherent thesis; wrong product may be 100% built     |
| 2   | Live Stripe charity-payments system in a no-auth prototype                            | 🔴 Critical | Financial/regulatory surface, zero thesis fit, lean-posture violation |
| 3   | Rule-8 strategy gate abandoned; decision log frozen Apr 2026 while ~2 "years" shipped | 🔴 Critical | No prioritization governor; competitor-FOMO drives the roadmap        |
| 4   | Today page fails the Sous Test by accretion (11 stacked surfaces)                     | 🟠 High     | Core surface no longer "one screen, one action"                       |
| 5   | Content + engine moat starved (14/93 scored mains, 126/~217 cook flows)               | 🟠 High     | The one defensible moat is the one being neglected                    |
| 6   | Social/leaderboard/maps shipped against explicit parked/anti-metric guidance          | 🟠 High     | Energy scattered; §9.2 distraction risk realized                      |
| 7   | 124 planning docs incl. fictional Year-1–7 timeline = planning theater                | 🟡 Medium   | False confidence; obscures the focus question                         |
| 8   | Recipe-authoring CRUD contradicts Base+Overlay "no editor" decision                   | 🟡 Medium   | Self-contradiction vs. own decision log                               |

---

_Bottom line: the engineering is competent and the per-feature craft is high — but craft has been pointed at the wrong target. Sous was supposed to win by being the most disciplined product in a crowded category. It is now one of the least disciplined. The fix is not more building; it is a founder decision about what this is, followed by aggressive subtraction back to the cook loop and the moat that compounds it._
