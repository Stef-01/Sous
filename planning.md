# Sous — Forward Build Plan

> **Last updated:** 2026-04-05
> **Related docs:** `documentation.md` (what's built), `CLAUDE.md` (conventions), `PIPELINE.md` (pairing data), `PRD.md` (product vision), `data-structure.md` (data schemas)

---

## 0. Current state summary

The app is ~70% feature-complete for V1. The core Today experience works end-to-end:

- Craving input (text + camera) -> AI parsing -> Deterministic pairing engine -> 3 ranked results
- Swipeable quest card stack with drag interactions
- Full Guided Cook flow (Mission -> Grab -> Cook -> Win) with timers, hacks, mistake warnings, cuisine facts
- Evaluate mode (ADA plate visualization) with confidence-first appraisal
- Save/share pairings, heatmap visualizer
- 93 mains, 203 sides, 924 engine-scored pairings
- tRPC API with working pairing, recognition, and cook endpoints
- Database schema defined (7 tables in Drizzle) but not yet seeded
- Auth integrated (Clerk), state management working (Zustand)

**What's NOT built:** Path tab, Community tab, cook session persistence, scrapbook/favorites browsing, coach quiz, journey tracking.

See `documentation.md` for complete inventory.

---

## 1. Global sequencing rules

1. Do not introduce any required backend, auth, or cloud database dependency before Phase 2.
2. Do not introduce AI-dependent user-critical flows before deterministic alternatives work.
3. Do not add Path tab content before Today is production-stable.
4. Do not add Community tab in the prototype.
5. Every phase must leave the app in a shippable, coherent state.
6. Every phase must preserve the core promise: discover a main -> build a better plate -> optionally evaluate -> cook something tonight.
7. If a feature can be done deterministically, do it deterministically first.
8. Every screen gets one dominant CTA only.
9. If a feature does not help the user cook, learn, or return, it is not phase-critical.
10. **No invented recipes or images.** Never generate new dish entries or images outside the existing dataset (`sides.json`, `meals.json`). When adding guided cook instructions, only add step-by-step cook flows for dishes that already exist in the side/meal catalog. New recipe research must source from real, reputable online sites and be added to the existing data layer first.
11. Before planning or implementing any new feature, consult STRATEGY.md to verify alignment with the strategic thesis, compounding moats, and feature prioritization matrix. Update STRATEGY.md's decision log for significant decisions.

---

## 2. Evaluate model: two distinct surfaces

The product has two evaluation moments. They are different surfaces with different purposes.

### Evaluate A — Pre-cook plate evaluation (EXISTS)

**Location:** Results view, after pairing results are shown.
**Purpose:** Assess the proposed main + sides before cooking. Teach one quick insight. Optionally suggest one better swap.
**Status:** Built and working (`src/lib/plateAppraisal.ts`, plate UI in `src/components/results/`).

Rules:

- Optional, skippable, no blocking modals
- No grading language
- Max one suggestion
- Confidence-first: always names what's already working before suggesting changes

### Evaluate B — Post-cook reflection (NOT YET BUILT)

**Location:** Win screen after completing Guided Cook.
**Purpose:** Reflect on the completed result. Save the meal memory. Later: gentle skill and plating improvement.

Rules:

- Optional, supportive, never judgmental
- Early version is manual and static (photo + note + rating + save)
- Later version can include photo-informed reflection (Phase 5)

Entry points:

- `Reflect on this meal` button on Win screen
- `Add photo + note` quick action

Allowed outputs by phase:

- **Phase 2-3:** Photo, note, rating, save to scrapbook
- **Phase 5:** Plating ratio suggestions, one tiny improvement for next time, cooking craft suggestion

Not allowed early:

- Automatic critique
- Multimodal AI dependence
- "You did this wrong" language

---

## 3. Phase 1 — Production polish and Today stability

### Objective

Make the Today page production-ready. Fix remaining rough edges, ensure the core flow is bulletproof.

### Scope

- [ ] Fix remaining visual micro-refinements (button alignment, badge overflow — in progress)
- [ ] Ensure scrollbar hiding works across all browsers (Windows Chrome, Safari, Firefox)
- [ ] Expand quest card pool beyond 5 hardcoded dishes — connect to actual side dish data
- [ ] Connect quest card "Start cooking" to real Guided Cook route with data
- [ ] Connect quest card heart button to actual save functionality (localStorage)
- [ ] Replace friends strip mock data with a deterministic rotation or hide until social features exist
- [ ] Error states for all async paths (pairing failure, recognition failure, network timeout)
- [ ] Loading skeletons for search popout content
- [ ] Verify phone frame works at common mobile viewport sizes
- [ ] Run `pnpm lint && pnpm test` — fix any failures

### Definition of done

A user can: open the app -> see quest cards -> tap "I'm craving" -> type or photograph a dish -> see 3 paired sides -> optionally evaluate -> tap "Cook this" -> complete full Guided Cook -> land on Win screen. No dead ends, no broken states.

---

## 4. Phase 2 — Cook session tracking and Evaluate B shell

### Objective

Turn completed cooks into persistent records. Ship the manual version of post-cook reflection.

### Why this phase exists

The biggest gap between "demo" and "product" is that nothing persists. A user completes a guided cook and there's no record of it. Without persistence, there's no reason to return.

### Scope

- [ ] Seed the database or implement localStorage-based session storage as interim
- [ ] Implement `cook.start` — creates a session when user enters Guided Cook
- [ ] Implement `cook.complete` — marks session done, stores rating/note/photo metadata
- [ ] Win screen: wire up photo capture, note input, and star rating to session completion
- [ ] Win screen: add "Reflect on this meal" optional action (Evaluate B manual shell)
- [ ] Evaluate B manual: photo + note + rating + "Save to scrapbook" button
- [ ] Track `completedCooks` count locally (localStorage until auth is active)
- [ ] Show completion toast or subtle celebration after saving

### State model

```typescript
type CookSessionRecord = {
  sessionId: string;
  recipeSlug: string;
  mainDishInput: string;
  sideIds: string[];
  startedAt: string;
  completedAt?: string;
  note?: string;
  photoUri?: string;
  rating?: number; // 1-5
  favorite: boolean;
};
```

### Definition of done

A user can complete a Guided Cook, optionally add a photo and note, save it, and the record persists across page reloads.

---

## 5. Phase 3 — Scrapbook, favorites, and minimal Path

### Objective

Turn saved cooks into visible momentum and replay value. Ship the Path tab.

### Why this phase exists

Once cooking sessions persist, the next highest-leverage feature is letting users see their history and replay winners. This creates return behavior before any AI enhancement.

### Scope

#### Scrapbook and favorites

- [ ] Scrapbook data model: completed cook sessions + saved pairings merged
- [ ] Favorites: toggle on any completed cook or saved pairing
- [ ] Recent cooks list (last 20)

#### Path tab

- [ ] `src/app/(path)/page.tsx` — Path home with 3 blocks max:
  1. Current journey summary (cooks this week/month)
  2. Weekly goal card (simple "Cook 3 times this week" target)
  3. Next unlock preview ("2 more cooks to unlock skill badges")
- [ ] `src/app/(path)/scrapbook/page.tsx` — Grid of saved meals with photos/notes
- [ ] `src/app/(path)/favorites/page.tsx` — Filtered view of favorited items
- [ ] Scrapbook entry card component showing dish name, photo thumbnail, date, rating
- [ ] Replay flow: tapping a scrapbook entry re-opens the pairer with the original main

#### Progressive unlock

- [ ] Enforce Path tab visibility: hidden until `completedCooks >= 3`
- [ ] Show "Path unlocked!" celebration on the 3rd completion
- [ ] Community tab remains hidden/stubbed (unlocks after 30 days, not in prototype scope)

### Component tree

```
src/components/path/
  path-home.tsx              # 3-block layout
  journey-summary.tsx        # Cook count + cuisine diversity
  weekly-goal-card.tsx       # Simple progress bar
  next-unlock-card.tsx       # Milestone preview
  scrapbook-grid.tsx         # Grid of entries
  scrapbook-entry-card.tsx   # Individual entry
  favorites-list.tsx         # Filtered favorites
```

### Path home hard rules

- Only 3 main blocks visible at once
- No charts, no dashboards, no analytics feel
- "Journey" tone, not "performance" tone

### Definition of done

A user who has completed 3+ cooks can tap the Path tab, see their cooking journey, browse saved meals in a scrapbook, favorite winners, and replay a past meal.

---

## 6. Phase 4 — Deterministic Evaluate A upgrade and plate-learning loop

### Objective

Make the pre-cook evaluation genuinely useful as a teaching tool without adding AI.

### Why this phase exists

Evaluate A already works but the appraisal is basic. This phase sharpens it into a real learning moment that users notice and remember.

### Scope

- [x] Upgraded deterministic evaluation engine in `src/lib/engine/`
  - Category coverage detection (vegetables, protein, carbs)
  - Signal classification: protein_light, veg_light, carb_heavy, freshness_missing, texture_contrast_missing, balanced
  - "Already working" list (what's good about the plate)
  - "One best move" recommendation (swap, add, or keep as-is)
- [x] Confidence-first appraisal copy: always lead with strengths
- [x] "Finish my plate" shortcut when one category is obviously missing
- [x] Compact visual balance state (not a dashboard — just clear iconography)
- [x] Keep Evaluate A explicitly optional and visually secondary to cooking

### Evaluation schema

```typescript
type PlateEvaluation = {
  status: "balanced" | "good_start" | "needs_improvement";
  categoryCoverage: { vegetables: boolean; protein: boolean; carbs: boolean };
  alreadyWorking: string[];
  oneBestMove?: {
    type: "swap_side" | "add_category" | "keep_as_is";
    message: string;
    targetSideId?: string;
    replacementSideId?: string;
  };
  appraisal: string; // 5-10 words max
};
```

### UI hard rules

- Evaluate sheet opens over pairer context, not a new page
- Only one main CTA
- Must always include a no-friction exit
- No charts, no dashboards, no numbers-heavy summaries

### Definition of done

Balanced plates show a positive appraisal. Missing-category plates show one best move. Evaluate can be skipped at any time. Swap suggestion updates plate correctly. No network or AI required.

---

## 7. Phase 5 — Bounded AI enhancement

### Objective

Introduce AI only where it enhances an already-working deterministic product.

### Why this phase exists

At this point the app has: a stable pairer, a real cooking loop, evaluation, memory, and Path. AI can enhance clarity and warmth without being a crutch.

### Scope

#### AI provider abstraction

- [x] `src/lib/ai/contracts.ts` — Provider interface with typed inputs/outputs
- [x] `src/lib/ai/providers/mock.ts` — Deterministic fallback for every AI surface
- [x] Keep existing `src/lib/ai/food-recognition.ts` (OpenAI Vision) and `src/lib/ai/craving-parser.ts` (Claude)

#### Bounded AI surfaces

- [x] Pairing explanation rewrite — Claude generates a warmer "why this works" sentence
- [x] Guided Cook Q&A — user can ask a bounded question about the current step (context-limited to recipe + neighbors)
- [x] Substitution suggestions — "I don't have X, what can I use?" from approved substitution list
- [x] Win screen encouragement — Claude generates a short celebratory message personalized to what was cooked
- [x] Evaluate A confidence summary — Claude rewrites the deterministic appraisal into natural language

#### Prompt discipline

Every AI call must receive:

- Current route context
- Current meal and side IDs
- Evaluation state if relevant
- Current recipe step and neighbors if relevant
- Allowed substitutions if relevant
- Required response schema (Zod)

#### Provider contract

```typescript
export interface AIProvider {
  explainPairing(input: ExplainPairingInput): Promise<ExplainPairingResult>;
  answerCookQuestion(input: CookQuestionInput): Promise<CookQuestionResult>;
  suggestSubstitution(input: SubstitutionInput): Promise<SubstitutionResult>;
  generateWinMessage(input: WinMessageInput): Promise<WinMessageResult>;
  rewriteAppraisal(input: AppraisalInput): Promise<AppraisalResult>;
}
```

### Hard rules

- If AI is unavailable, mock/fallback responses keep every flow working
- AI outputs must validate against Zod schema
- Invalid outputs must not break UI
- No AI feature becomes a required route gate
- No open-ended chatbot — all AI is bounded to specific UI triggers

### Definition of done

AI improves clarity and warmth in 5 bounded places. The app remains fully usable if all AI calls fail.

---

## 8. Phase 6 — Evaluate B intelligence and post-cook reflection

### Objective

Add thoughtful post-cook reflection. This is the most complex layer and easiest to overbuild.

### Sub-phases

#### 6A: Manual Evaluate B (pairs with Phase 2 shell)

- Photo capture on Win screen
- Note input
- Save to scrapbook
- Optional 1-5 rating

#### 6B: Photo-informed reflection (requires Phase 5 AI)

- After saving a photo, optionally see 1-2 supportive suggestions:
  - Plating ratio ideas ("More color contrast next time")
  - One cooking skill improvement ("Caramelize onions 5 more minutes")
  - One finishing improvement ("A squeeze of lemon wakes everything up")

### Hard rules

- Evaluate B is always optional
- The user can always just save and leave
- Max 2 next-time suggestions
- Strengths always shown before suggestions
- Never use failure language
- Tone is always `encouraging`

### Reflection schema

```typescript
type PostCookReflection = {
  strengths: string[];
  nextTimeSuggestions: Array<{
    type: "plating" | "ratio" | "technique" | "finish";
    message: string;
  }>;
  tone: "encouraging";
};
```

### Definition of done

A user can photograph their finished meal, save it, and optionally receive 1-2 kind suggestions. AI suggestions are bounded and non-judgmental. No critique is required for completion.

---

## 9. Features explicitly deferred or rejected

### Rejected from AI feedback

| Suggestion                                  | Verdict              | Reason                                                                                                                                                                                 |
| ------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Meal readiness screen                       | REJECTED             | Sous pairs sides with mains the user already has. Users aren't discovering mains — they know what they're cooking. A "can you make this tonight?" gate adds friction to the core loop. |
| `src/lib/pairing/` refactor                 | REJECTED             | Code already uses `src/lib/engine/` which is well-structured with 6 scorers, ranker, explainer, and tests. Renaming would break imports for no benefit.                                |
| "Gemma" AI provider                         | CORRECTED            | Sous uses Claude (Anthropic) and OpenAI Vision, not Google Gemma. All AI feedback references to "Gemma" should read "Claude."                                                          |
| Retrieval-backed AI (local embeddings, RAG) | DEFERRED             | With 203 sides and static recipe data, simple DB queries outperform local embeddings. RAG is premature engineering for V1. Reconsider only if content scales to 1000+ items.           |
| PairerState / MealReadinessState models     | REJECTED             | Duplicate what already exists in `useTodayStore` and `useCookStore` Zustand stores.                                                                                                    |
| Community tab                               | DEFERRED             | Per CLAUDE.md rules: Community reveals after 30 days. Not in prototype scope.                                                                                                          |
| "Order missing ingredients" flow            | DEFERRED             | Delivery integration is a separate product concern. Placeholder button exists in fallback actions.                                                                                     |
| Coach quiz and vibe prompts                 | DEFERRED to Phase 5+ | tRPC stubs exist. Ship when AI provider abstraction is ready.                                                                                                                          |

### Accepted from AI feedback

| Suggestion                                                          | Integrated into | Rationale                                                                                   |
| ------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------- |
| Two-surface Evaluate model (A pre-cook, B post-cook)                | §2, §6, §8      | Clean delineation. Evaluate A already exists; Evaluate B is a natural Win screen extension. |
| Phase sequencing discipline (no backend early, deterministic first) | §1 rules        | Sound engineering principle that matches existing architecture.                             |
| AI provider abstraction with mock/fallback                          | §7              | Critical for resilience. Every AI surface must work without AI.                             |
| Scrapbook + favorites + Path as momentum layer                      | §5              | Fills the biggest gap: nothing persists after a cook. Creates return behavior.              |
| PlateEvaluation schema with categoryCoverage and oneBestMove        | §6              | Stronger than current basic appraisal. Upgrades the existing evaluate without adding AI.    |
| Prompt discipline (context-bounded, schema-validated)               | §7              | Prevents AI sprawl. Every call gets minimal required context + Zod schema.                  |
| "One CTA per screen" as standing policy                             | §1 rule 8       | Already in CLAUDE.md, reinforced as a sequencing rule.                                      |
| PostCookReflection schema (strengths before suggestions)            | §8              | Good UX pattern: lead with what worked, then one kind suggestion.                           |

---

## 10. Sprint-level implementation order

This maps phases to concrete sprint work. Each sprint leaves the app shippable.

### Sprint 1: Production polish (Phase 1)

- Fix remaining visual micro-refinements
- Connect quest cards to real data and routes
- Error states and loading skeletons
- Run lint + test, fix failures

### Sprint 2: Persistence (Phase 2)

- Cook session storage (localStorage or DB)
- Win screen save flow (photo, note, rating)
- Evaluate B manual shell
- Completion counter

### Sprint 3: Path and memory (Phase 3)

- Scrapbook data model
- Favorites toggle
- Path tab with 3-block layout
- Progressive unlock at 3 cooks
- Replay flow from scrapbook

### Sprint 4: Smarter evaluation (Phase 4)

- Category coverage detection
- Signal classification
- Confidence-first appraisal copy
- "Finish my plate" shortcut
- One-swap recommendation

### Sprint 5: Bounded AI (Phase 5)

- AI provider abstraction + mock provider
- 5 bounded AI surfaces (explain, Q&A, substitute, win message, appraisal rewrite)
- Schema validation on all AI outputs
- Graceful fallback when AI unavailable

### Sprint 6: Reflection intelligence (Phase 6)

- Evaluate B photo-informed suggestions
- Post-cook reflection UI
- Strengths-before-suggestions pattern
- Scrapbook integration with reflection data

---

## 10b. Future development phases (post-V1)

These phases represent the next evolution of Sous. Each is self-contained and leaves the app shippable.

### Phase 7 — Multi-Side Selection & Reroll Per Side

#### Objective

Let users select which sides to cook (1, 2, or all 3) and reroll individual sides while keeping the ones they want.

#### Scope

- [ ] Redesign `result-stack.tsx` to show all 3 sides as selectable cards with checkboxes
- [ ] Add per-side reroll icon (🔄) on each individual side card
- [ ] Reroll replaces only that side with the next-best candidate from the engine
- [ ] User can select 1, 2, or all 3 sides to cook
- [ ] Selected sides pass into guided cook flow as a multi-dish cook
- [ ] "Cook selected" button replaces current single-side "Cook this" flow
- [ ] Side selection state managed in `useTodayStore`

#### Definition of done

A user can see 3 side suggestions, reroll any individual side, select 1-3 sides, and proceed to cook all selected sides.

---

### Phase 8 — Intelligent Multi-Component Cook Sequencing

#### Objective

When cooking multiple sides + a main, intelligently sequence all steps so everything finishes together and nothing sits cold.

#### Scope

- [ ] `src/lib/engine/cook-sequencer.ts` — Sequencing engine that takes multiple dishes and interleaves steps
- [ ] Uses `prepTimeMinutes` and `cookTimeMinutes` from each dish to compute optimal start order
- [ ] Generates a unified step list: e.g., "Start potato in oven" → "Prep asparagus" → "Cook steak" → "Everything done"
- [ ] Timeline view component showing parallel cooking tracks with progress
- [ ] Smart step transitions: "While [dish A] bakes, start [dish B]"
- [ ] Timer integration: floating timers for each dish track independently
- [ ] Handles temperature dependencies: hot items cook last, cold items prep first
- [ ] Modified `cook/[slug]/page.tsx` to support multi-dish cook sessions

#### Sequencing rules

1. Cold dishes (salads, dressings) prep first, serve last
2. Longest-cooking items start first (oven → stovetop → assembly)
3. Quick-cook items (steaks, stir-fry) start last so they're hot when served
4. Interleave idle time (baking, simmering) with active prep of other dishes
5. Never leave a user idle — always suggest the next useful action

#### Definition of done

A user cooking steak + sweet potato + asparagus gets a unified step sequence where the potato goes in the oven first, asparagus cooks mid-way, steak cooks last, and everything finishes within 2 minutes of each other.

---

### Phase 9 — Agentic Sous Assistant

#### Objective

An AI-powered assistant that helps users build their personal recipe collection from real-world inspiration.

#### Scope

- [ ] Sous Assistant modal/sheet accessible from scrapbook and main navigation
- [ ] Custom recipe creation: manually enter name, ingredients, steps, tags
- [ ] Save custom recipes to scrapbook alongside completed cooks
- [ ] Image upload: user photographs favorite restaurant dishes or food photos
- [ ] Agentic processing: assistant analyzes uploaded images, identifies dishes
- [ ] Internet search: finds healthy recreations and balanced plate ideas with optimal sides
- [ ] Results delivered as new recipe cards in scrapbook (async — may take minutes/hours)
- [ ] Uses existing AI provider abstraction (`src/lib/ai/`) with new agent methods
- [ ] Background job pattern: upload → queue → process → notify
- [ ] Status tracking: "Processing your dishes..." with progress indicator

#### Agent capabilities

1. **Image analysis** — Identify dish from photo using Vision API
2. **Recipe search** — Find healthy recreations via web search
3. **Plate balancing** — Suggest optimal sides using the existing pairing engine
4. **Nutritional optimization** — Favor balanced macros and whole ingredients
5. **Personalization** — Factor in user's cooking history and cuisine preferences

#### Hard rules

- Agent is bounded — only responds to explicit upload triggers, never proactive
- All recipes go through the same Quest shell (Mission → Grab → Cook → Win)
- Custom recipes are clearly labeled as "Custom" vs engine-generated
- User always reviews and approves agent suggestions before they're saved

#### Definition of done

A user can upload 3 photos of restaurant dishes, and within a few hours, find healthy recreation recipes in their scrapbook with balanced side suggestions.

---

### Phase 10 — Instacart Integration

#### Objective

Let users order missing ingredients directly from the Grab screen with one tap.

#### Scope

- [ ] At ingredient selection phase (Grab screen), track which items are unchecked (missing)
- [ ] "Order with Instacart" button appears when any ingredients are unchecked
- [ ] Shows estimated delivery time next to button (placeholder: random 25-45 min)
- [ ] Button shows count of missing ingredients: "Order 4 items · ~35 min"
- [ ] V1: Placeholder button that shows a "Coming soon" toast
- [ ] V2: Deep link to Instacart with pre-populated cart (requires Instacart API partnership)
- [ ] Missing ingredients list auto-computed from unchecked items in the ingredient list
- [ ] Instacart branding and styling per their partner guidelines
- [ ] Modified `ingredient-list.tsx` to include the order button below the ingredient list

#### Integration architecture

```
User unchecks ingredients → Missing list computed →
  "Order with Instacart" button shows →
    V1: Toast "Coming soon — order manually for now"
    V2: Deep link to Instacart with items + quantities
```

#### Definition of done

A user on the Grab screen who hasn't checked off 4 ingredients sees an "Order with Instacart · ~35 min" button. Pressing it shows a placeholder toast in V1, or opens Instacart with the correct items in V2.

---

### Phase 11 — Advanced Path & Skill Progression

#### Objective

Make the skill tree a living progression system that rewards consistent cooking and drives mastery.

#### Scope

- [ ] Link skill tree progression to actual cook sessions (auto-detect cuisine match)
- [ ] XP system: earn XP per cook, level up with milestones
- [ ] Cuisine mastery badges: complete all associated dishes in a cuisine family
- [ ] Weekly skill challenges: "This week: master a Japanese side" with bonus XP
- [ ] Skill tree state syncs with cook session history automatically
- [ ] Streak-based XP multipliers (2x on 7-day streak, 3x on 14-day)
- [ ] Achievement system: "First Italian dish", "5 cuisines explored", "30-day streak"
- [ ] Path notifications: "You unlocked Thai Balance!" celebration screen
- [ ] Skill recommendations: suggest next skill based on user's cooking patterns

#### Definition of done

A user who completes 2 Caesar Salad cooks sees Knife Basics skill progress to "completed", Heat Control unlocks as "available", and their XP increases. Weekly challenges appear and award bonus XP.

---

## Phase 13 — Chef Skill Tree Curriculum

**Objective:** Research real culinary school curricula and build a comprehensive skill tree that takes users from complete beginner to chef-level competency. The tree should feel like a legitimate cooking education, not gamified fluff.

**Research requirements:**

- Study curricula from: Le Cordon Bleu, CIA (Culinary Institute of America), Johnson & Wales, ICE (Institute of Culinary Education), community college culinary programs
- Identify universally accepted foundational skills that every chef learns
- Map the progression from basic to advanced
- Ensure skills are practical and achievable in a home kitchen

**Skill tree structure (approximately 30 nodes across 4 tiers):**

### Tier 1: Foundation (Skills 1-8) — "Home Cook Basics"

Current skill tree content lives here. Basic skills every home cook should master:

- Knife skills (cuts, grip, safety)
- Heat control (sauteing, boiling, simmering)
- Seasoning fundamentals (salt, acid, fat, heat)
- Mise en place (prep organization)
- Basic stock and broth
- Egg cookery (scramble, fry, boil, poach)
- Rice and grain cooking
- Basic salad and vinaigrette

### Tier 2: Intermediate (Skills 9-16) — "Confident Cook"

- Sauce mother sauces (bechamel, veloute, espagnole, hollandaise, tomato)
- Braising and stewing
- Roasting and baking fundamentals
- Pasta from scratch
- Bread basics (yeast doughs, quick breads)
- Fish and seafood handling
- Vegetable techniques (blanching, roasting, grilling, pickling)
- Flavor building (layers, umami, maillard reaction)

### Tier 3: Advanced (Skills 17-24) — "Skilled Cook"

- Butchery basics (breaking down chicken, portioning fish)
- Emulsions and foams
- Fermentation (kimchi, sauerkraut, yogurt)
- Pastry fundamentals (pate brisee, choux, puff)
- Wok skills and high-heat cooking
- Smoking and curing
- Menu composition and balance
- Plating and presentation

### Tier 4: Chef Level (Skills 25-30) — "Home Chef"

- Sous vide and precision cooking
- Advanced pastry (laminated doughs, tempering chocolate)
- Regional cuisine deep dives (mastering one cuisine family)
- Recipe development (creating your own dishes)
- Cooking for groups (scaling, timing, service)
- Kitchen management (efficiency, waste reduction, pantry strategy)

**Implementation notes:**

- Each skill node has 2-4 practice dishes that teach the skill
- Completing all practice dishes for a node = skill mastered
- Skills unlock sequentially within a tier, but Tier 2 unlocks after completing 5/8 Tier 1 skills
- The skill tree data lives in src/data/skill-tree.ts
- This is a PROTOTYPE — start with Tier 1 fully fleshed out, Tier 2 partially, and Tiers 3-4 as locked previews that show what's coming
- All practice dishes must already exist in the meals/sides database or be added with real recipes from reputable sources

**Status:** Research phase — curriculum study needed before implementation

---

## 11. Standing UI rules (apply to ALL future work)

1. One primary CTA per screen — no two equally-weighted buttons
2. No more than one hero card above the fold on Today
3. Max 3 secondary action chips visible at once
4. Path metrics capped to 3 blocks
5. Today never becomes a dashboard
6. Social proof stays below the fold in prototype
7. Any new feature must prove it helps the user cook tonight, or it belongs elsewhere
8. New features escalate through: hidden logic → optional chip → secondary sheet → primary surface

---

## 12. Architecture reference (preserved)

The following sections from the original planning document remain valid architecture reference. They describe the target system design and are implemented as described in `documentation.md`.

### Tech stack

See `CLAUDE.md` § Tech stack — Next.js 15, React 19, Tailwind 4, Zustand, TanStack Query, tRPC, Drizzle, Neon Postgres, Clerk, OpenAI Vision, Anthropic Claude, Cloudflare R2, Upstash Redis, Vitest, Playwright.

### Database schema

See `documentation.md` §2.11 and `src/lib/db/schema.ts` — 7 tables: sideDishes, cookSteps, ingredients, users, cookSessions, savedRecipes, quizResponses.

### Pairing engine

See `documentation.md` §2.3 — Two-tier system with Python engine scores and TypeScript deterministic scorers.

### API design

See `documentation.md` §4 — tRPC router with 12 endpoints (6 fully implemented, 6 stubbed).

### Component architecture

See `documentation.md` §2 — 51 component files across today, guided-cook, results, search, layout, shared, heatmap, states, and ui directories.

### Data pipeline

See `PIPELINE.md` — Python engine → pairings.json → pairings.ts → sideBridge.ts → pairing engine → API.

### Content seed structure

See `data-structure.md` — 93 meals, 203 sides, 11 cuisines, guided cook step data.

### Performance targets

| Metric                   | Target          |
| ------------------------ | --------------- |
| First Contentful Paint   | < 1.2s          |
| Time to Interactive      | < 2.0s          |
| Pairing engine response  | < 200ms         |
| AI recognition response  | < 3s            |
| Cook step transition     | < 100ms         |
| Lighthouse Performance   | > 90            |
| Bundle size (initial JS) | < 150KB gzipped |

### Testing strategy

**Unit (Vitest):** Pairing engine scorers, ranker, explainer, craving parser, progressive unlock logic, preference vector math.

**Integration (tRPC test client):** pairing.suggest end-to-end, cook.start → complete → stats update, coach.quiz → preference change → re-ranked results.

**E2E (Playwright):** Text craving → results → select → guided cook → complete → win. Photo capture → correction → results. Three cooks → Path tab appears.

## Phase 14 — Cooking Games Arcade

**Objective:** Create a beautiful, artsy game selection menu and multiple mini-games that make cooking knowledge fun, social, and addictive. Games should teach food literacy while feeling like a treat, not homework. The arcade should feel like opening a beautifully illustrated children's book — warm, inviting, handcrafted.

**Entry point:** "Play a game" chip on Today page → opens the Games Arcade screen

### 14.1 Game Menu Design — "The Kitchen Shelf"

The game selection screen should feel like looking at a cozy kitchen shelf with illustrated game "boxes" arranged artfully. Not a grid of cards — an actual shelf with personality.

**Visual concept:**

- Warm cream/paper texture background (matches Sous brand)
- Each game appears as a hand-illustrated "recipe card" or "cookbook" on the shelf
- Subtle parallax tilt when scrolling — cards shift slightly like physical objects
- Each game card shows: illustrated icon, game name, "Best: [score]" in handwritten font, play count
- Tap a card → it lifts off the shelf with a satisfying scale animation → game loads
- Background music: optional gentle kitchen ambience (utensils clinking, soft humming) — toggle off with one tap

**Navigation:** Single scrollable shelf. Max 6-8 games visible. No tabs, no categories, no filters. Just pick one and play.

### 14.2 Game 1: "What's Cooking?" — The Food Guessing Game

**Concept:** You're given cryptic, poetic clues about a dish that start obscure and get progressively easier. Guess the dish before running out of clues.

**Mechanics:**

- 5 clues per round, revealed one at a time
- Clue 1: Very abstract/poetic ("I was born in fire and cooled by the sea")
- Clue 2: Cultural/historical ("Fishermen in Naples made me famous 200 years ago")
- Clue 3: Ingredient hint ("My foundation is flour, water, and patience")
- Clue 4: More specific ("I come in thin crust and deep dish varieties")
- Clue 5: Almost giving it away ("Mozzarella is my best friend")
- Answer: Pizza

**Scoring:**

- Guess after clue 1: 500 points (genius!)
- Guess after clue 2: 400 points
- Guess after clue 3: 300 points
- Guess after clue 4: 200 points
- Guess after clue 5: 100 points
- Wrong guess: lose one clue (auto-reveals next)

**UI:**

- Beautiful illustrated card that "unfolds" to reveal each clue
- Handwritten-style clue text on parchment/paper texture
- Type-ahead guess input with fuzzy matching (pizza, piza, pitza all match)
- Correct guess: confetti + the dish illustration appears in full color
- Streak counter: how many in a row you've guessed correctly

**Content:** 100+ dishes from the Sous database, each with 5 hand-crafted clues. Clues emphasize culture, history, and sensory description — teaching food literacy naturally.

### 14.3 Game 2: "Flavor Pairs" — The Matching Game

**Concept:** Match ingredients that pair well together. Think memory card game meets food science.

**Mechanics:**

- 12 cards face-down (6 pairs)
- Each card shows an ingredient with a cute illustration
- Flip two cards: if they're a great flavor pair (tomato + basil, chocolate + sea salt, lemon + butter), they stay face-up with a sparkle animation
- If they don't pair, they flip back with a gentle wobble
- Complete all 6 pairs to win
- Timer running — faster = more points

**Difficulty levels:**

- Easy: Classic obvious pairs (peanut butter + jelly, chips + salsa)
- Medium: Culinary pairs (miso + caramel, fig + prosciutto)
- Hard: Unexpected science-backed pairs (strawberry + balsamic, watermelon + feta, chocolate + chili)

**UI:**

- Cards have watercolor-style ingredient illustrations
- Matched pairs glow with a warm golden border
- Background: wooden cutting board texture
- Sound: satisfying "clink" when a pair matches, like wine glasses toasting

### 14.4 Game 3: "Speed Chop" — The Ingredient Sorting Game

**Concept:** Ingredients fly across the screen and you swipe them into the right category before time runs out. Think Fruit Ninja meets food education.

**Mechanics:**

- Ingredients float up from the bottom of the screen
- Swipe left for one category, right for the other
- Round 1: "Fruit vs Vegetable" (is a tomato a fruit? yes!)
- Round 2: "Protein vs Carb"
- Round 3: "Grows above ground vs below ground"
- Round 4: "Needs refrigeration vs pantry stable"
- Gets faster as you progress
- 3 lives — wrong swipe loses a life

**UI:**

- Ingredients are cute illustrated characters with tiny faces (kawaii style)
- Correct swipe: ingredient bounces happily into a basket
- Wrong swipe: ingredient makes a sad face and drops
- Streak multiplier visual: flames around the score counter
- Background: kitchen counter with two baskets

### 14.5 Game 4: "Plate It Up" — The Plating Composition Game

**Concept:** Drag and drop dish components onto a plate to create the most visually balanced arrangement. Teaches plating principles through play.

**Mechanics:**

- Given a main dish + 2-3 sides + a garnish
- Drag them onto an empty plate
- AI scores your plating on: balance, color distribution, negative space, garnish placement
- Three-star rating system
- "Chef's version" revealed after you plate — see how a pro would do it

**UI:**

- Clean white plate in center of screen
- Components in a tray at the bottom
- Drag with satisfying physics (slight bounce, shadow under dragged item)
- Scoring appears as a gentle watercolor wash over the plate (gold for great, silver for good, bronze for okay)

### 14.6 Game 5: "Cuisine Compass" — The Geography Game

**Concept:** A dish appears and you tap the region of the world it comes from on a stylized map.

**Mechanics:**

- Illustrated world map (not realistic — artistic, warm, with food icons in each region)
- Dish name + photo appears at top
- Tap the region you think it's from
- Closer to the exact country = more points
- After answering: a fun fact about that dish's origin appears
- 10 rounds per game

**UI:**

- Hand-drawn map with warm colors (not Google Maps — think illustrated atlas)
- Correct: region glows green, dotted line connects dish to origin with a little airplane animation
- Wrong: gentle pulse on the correct region to show you where it actually comes from
- Score based on distance: "You were 2 countries away!"

### 14.7 Implementation Plan

**Phase 14A (MVP — build first):**

- Game menu shelf UI (the selection screen)
- "What's Cooking?" (text-based, needs only clue data + fuzzy matching)
- "Flavor Pairs" (card flip mechanics + pair data)

**Phase 14B (second wave):**

- "Speed Chop" (gesture-based, needs ingredient categorization data)
- "Cuisine Compass" (needs illustrated map component + dish origin data)

**Phase 14C (polish):**

- "Plate It Up" (drag-and-drop, needs plating scoring system)
- Leaderboards (personal best, friends if social features active)
- Daily game rotation: one game highlighted each day with bonus XP

**Technical notes:**

- All games render in React with Framer Motion for animations
- No external game engine needed — these are UI-driven mini-games
- Game data (clues, pairs, categories, origins) lives in src/data/games/
- Each game is a separate route: /games/whats-cooking, /games/flavor-pairs, etc.
- Scores saved to localStorage (same as cook sessions)
- Games should load instantly — no heavy assets, use CSS/SVG illustrations

**Strategy alignment:**

- Games strengthen the behavioral moat (another reason to open the app daily)
- "What's Cooking?" and "Cuisine Compass" build food literacy (content moat)
- "Flavor Pairs" teaches the pairing principles the engine uses (engine moat)
- All games are solo-first but shareable (screenshot your score)
- Games are bite-sized (2-5 minutes) — they fill the "not cooking tonight but still engaging" gap
- NO games require cooking — they're for days when you just want to play

## Phase 15 — Recipe Data Pipeline and Storage Architecture

**Objective:** Populate all 178 missing guided cook flows using automated browser-based research, and design a recipe storage architecture that supports future user modifications while preserving originals.

**The Problem:** 178 out of 203 side dishes have no guided cook steps. Tapping "Start cooking" on these dishes hits a dead end. This is the single biggest gap in the prototype.

**Solution: Three-layer recipe architecture**

### 15.1 Storage Architecture — "Base + Overlay" Pattern

Inspired by how Docker layers and git commits work. Three layers, from bottom to top:

**Layer 1: Curated Base (immutable)**
- Location: `src/data/sides.json`, `src/data/meals.json`, `src/data/guided-cook-steps.ts`
- Contents: The original researched recipes from reputable sources
- Rule: NEVER modified by users. This is the source of truth.
- Updated only by the recipe-research skill or manual curation by the developer.

**Layer 2: User Overlay (mutable, per-user)**
- Location: localStorage key `sous-recipe-overrides`
- Contents: User modifications stored as diffs against the base layer
- Structure: `{ [dishId]: { steps?: StepOverride[], notes?: string, substitutions?: Sub[] } }`
- When a user tweaks a step (e.g., changes "3 minutes" to "5 minutes" because their stove runs cool), only the diff is stored
- When rendering a recipe, the overlay is merged on top of the base at read time

**Layer 3: User Originals (mutable, per-user)**
- Location: localStorage key `sous-user-recipes`
- Contents: Completely new recipes created by users (Phase 9 — Agentic Assistant)
- These go through the same Quest shell (Mission → Grab → Cook → Win) but are flagged as "Your recipe"

**Merge logic (at render time):**
```
finalRecipe = deepMerge(baseRecipe, userOverlay[dishId] ?? {})
```
If the user has overrides, they see their version. If not, they see the original. A "Reset to original" button restores the base version by clearing the overlay.

### 15.2 UI Design — Invisible by Default

The storage architecture must be invisible to the user in normal use. No "edit recipe" buttons cluttering the cook flow. Modifications happen through natural interactions:

**During Guided Cook:**
- Long-press a step → "Adjust this step" appears. User can change time or add a personal note. Saved as an overlay.
- "This worked better at [X] minutes" prompt on the win screen → overlay saved.

**On the Win Screen (Evaluate B):**
- "Next time, I'd change..." free text → parsed and saved as overlay suggestions
- Rating + notes already saved → these inform future recommendations

**In the Scrapbook (replay):**
- "Your version" badge appears if overlays exist for this dish
- "Reset to original" available but not prominent

**What this is NOT:**
- No recipe editor screen
- No settings page for recipe preferences
- No version history UI
- No diff viewer
- Modifications are captured through cooking, not through editing

### 15.3 Recipe Research Pipeline

**Skill:** `.claude/skills/recipe-research/SKILL.md` — a reusable Claude skill that:
1. Identifies dishes missing guided cook steps
2. Searches the web for the best-rated version from Serious Eats, ATK, NYT Cooking, Bon Appetit
3. Translates the recipe into Sous guided cook format (steps, timers, mistake warnings, hack chips, cuisine facts)
4. Validates against quality standards (4-12 steps, 2+ timers, 1+ mistake warning, specific temps/times)
5. Commits in batches of 5 dishes

**Scheduled task:** `recipe-research-populate` runs daily at 9am, using this skill to fill gaps.

**Quality standards per dish:**
- 4-12 guided cook steps (simple sides: 4-6, complex: 8-12)
- At least 2 timer triggers with exact minutes
- At least 1 mistake warning (the real common failure point)
- At least 1 hack chip (genuinely useful pro tip)
- Specific temperatures ("medium-high heat, about 375°F")
- Specific times with sensory cues ("sauté 3-4 minutes until golden and fragrant")
- Source attribution in a `sourceUrl` field (credit the original recipe)

### 15.4 Data Model Changes

Add to the side dish type:
```typescript
interface GuidedCookStep {
  step: number;
  phase: "prep" | "cook" | "finish";
  instruction: string;
  duration: number; // minutes
  timerTrigger: boolean;
  timerMinutes?: number;
  mistakeWarning: string | null;
  hackChip: string | null;
  cuisineFact: string | null;
}

interface RecipeSource {
  url: string;
  siteName: string;
  author?: string;
  dateAccessed: string;
}

// Added to each side/meal:
guidedCookSteps: GuidedCookStep[];
recipeSource?: RecipeSource;

// User overlay (localStorage):
interface RecipeOverride {
  dishId: string;
  stepOverrides: { [stepNumber: number]: Partial<GuidedCookStep> };
  personalNotes: string;
  substitutions: { original: string; replacement: string; reason: string }[];
  lastModified: string;
}
```

### 15.5 Implementation Order

1. **Phase 15A — Fill the gaps (immediate):** Run the recipe-research skill on all 178 missing dishes. Target: 100% coverage within 2 weeks via daily scheduled runs.
2. **Phase 15B — Source attribution:** Add `recipeSource` field to every dish with a populated cook flow. Credit where the recipe came from.
3. **Phase 15C — Overlay infrastructure (later):** Build the merge logic, localStorage overlay store, and "Adjust this step" long-press interaction. Only build when the base layer is 100% populated.
4. **Phase 15D — Scrapbook integration (later):** "Your version" badge, "Reset to original" button. Only build after overlays are working.

### 15.6 Strategy Alignment

This architecture follows the strategy principles:
- **Zero friction:** Modifications happen through cooking, not editing. No new screens.
- **Compounding:** Every cook potentially improves the recipe for next time. User overlays compound over dozens of cooks.
- **Minimalism:** The overlay system is invisible until the user naturally wants to change something. No UI clutter.
- **Data moat:** User overlays are non-portable. Your personalized recipe adjustments don't transfer to a competitor.

---

## FEEDBACK — Skill Tree Fixes Needed (from user screenshot Apr 8 2026)

1. **Path tab must be unlocked from the start** — no gate requiring completed cooks. Remove the progressive unlock entirely for the Path tab. It should always be visible and navigable from day one.

2. **Prerequisite enforcement on skill tree** — even if a later skill shows as "unlocked" in the data, it must render as LOCKED in the UI if prerequisite skills above it are not completed. The skill tree must enforce strict top-down progression: you cannot start Tier 2 skills until the required Tier 1 skills are done. Check src/data/skill-tree.ts prerequisite logic and src/lib/hooks/use-skill-progress.ts status computation.

3. **Visual state clarity** — each skill node should have exactly one of these states with clear visual distinction:
   - Completed (green checkmark, filled green circle)
   - In Progress (pulsing/active border, partially filled)
   - Available (outlined circle, ready to tap)
   - Locked (gray, lock icon, slightly transparent) — even if data says "unlocked", show locked if prerequisites aren't met

## Standing Design Decisions (Do Not Revert)

These are locked decisions made after deliberate product review. Do not change any of these without explicit user approval. They exist because earlier implementations were reverted or drifted — this section prevents that.

### Navigation & Tab Bar

- Tab bar always shows **Today + Path** (Community hidden until a later phase)
- Path tab is visible from day one — progressive unlock was removed intentionally (curiosity > gatekeeping)
- `pathUnlocked` is hardcoded to `true` in the Path layout — no cook count gate

### Today Page

- Friends social meals section is present on the Today page, positioned **below the fold** (users scroll to see it)
- Coach quiz runs on **first visit only** — not on every load

### Skill Tree (src/data/skill-tree.ts)

- **42 nodes total**: 9 Foundation + 10 Intermediate + 10 Advanced + 5 Pre-Mastery + 8 Cuisine Mastery
- **Kitchen Sanitation is NOT in the tree** — removed intentionally; it's boring and doesn't belong in a cooking app
- **Knife Skills** is the entry point (no prerequisites)
- **8 Cuisine Mastery paths** (Italian, Japanese, French, Mexican, Indian, Thai, Chinese, Mediterranean) render as a separate 2-column grid below the sequential tree, under "CUISINE MASTERY — Choose Your Path"
- Cuisine mastery paths are parallel (independent) — users can work multiple cuisines at once

### Mission Screen (src/components/guided-cook/mission-screen.tsx)

- Hero image is capped at **`h-[160px]`** (not aspect-ratio-based) so it doesn't push the CTA off-screen
- CTA button has **`mt-auto`** — it is pinned to the bottom of the flex container
- Outer container uses **`min-h-[calc(100dvh-160px)] flex flex-col`** — ensures CTA is visible without scrolling on 375×667px
- Description text uses **`line-clamp-3`** to prevent long descriptions from pushing CTA below fold

### No-Scroll Navigation Principle

- Every primary CTA must be visible without scrolling on a **375px × 667px** viewport (iPhone SE / iPhone 8)
- The pattern: `flex flex-col` container + `mt-auto` on the CTA + `min-h-[calc(100dvh-Npx)]` where N accounts for header + padding + tab bar
- Violating this is a UX failure — users who can't see how to proceed will not cook

### Images

- All hero image URLs are `null` — gradient + emoji fallback is the intentional visual style
- Do not add external image URLs or attempt to load remote images
