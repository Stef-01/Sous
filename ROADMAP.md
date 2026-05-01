# Sous — Prototype Roadmap

> **Updated:** 2026-05-01
> **Related docs:** `planning.md`, `documentation.md`, `CLAUDE.md`, `docs/STAGE-3-LEAN-CONTENT.md`, **`docs/STAGE-1-2-6MO-TIMELINE.md`**, **`docs/PARENT-MODE-PLAN.md`**, **`docs/PARENT-MODE-RESEARCH.md`**, **`docs/REELS-V2-PLAN.md`** (TikTok-style infinite vertical feed design), **`docs/POLISH-CHECKLIST.md`** (recurring nav/scaling/minimalism/animation passes + Duolingo deep-dive), **`docs/CONTENT-POPULATION-PHASE.md`** (Stanford-attributed content swap workflow + sprinkle schedule W3/W11/W17/W19/W22a), **`docs/adr/0001-nutrition-data-source.md`** (USDA build decision + free-public-good pricing posture), `docs/NEXT-20-PHASES.md`, `docs/NEXT-20B-PHASES.md`, `docs/NEXT-20C-PHASES.md`, `docs/NEXT-20D-PHASES.md`, `docs/PATH-OVERLAP-RCA.md`

---

## ACTIVE WORKSTREAM: STAGE 1+2 6-MONTH PLAN — IN PROGRESS

> Authored 2026-05-01. The full 26-week plan is in `docs/STAGE-1-2-6MO-TIMELINE.md`. Headline: ship Parent Mode (research-backed, FDA-claim-safe) AND complete production hardening (Clerk, Neon, R2, Redis, Sentry, perf, a11y) by 2026-10-30. Stage 1 prototype is complete; Stage 3 Content tab is complete; this plan integrates remaining production-hardening work with the new Parent Mode feature workstream.
>
> Five phases: A (foundation, weeks 1–8), B (Parent Mode UX, weeks 9–12), C (production hardening, weeks 13–18), D (polish + content + closed beta + legal review, weeks 19–24), E (launch prep + buffer, weeks 25–26).
>
> See `docs/PARENT-MODE-RESEARCH.md` for the research that grounds the feature design and `docs/PARENT-MODE-PLAN.md` for the surface-by-surface design with prerequisites.

---

## STAGE 3: LEAN VIBE-CODED + CONTENT TAB — COMPLETE

> Pushed before Stage 2 (production hardening). Per Stefan's directive, grow user-facing surface as far as the lean prototype credibly can before paying the production-tax of Clerk + Neon + R2 + Sentry + Redis. Full spec in `docs/STAGE-3-LEAN-CONTENT.md`.

### Lean-vibe posture (zero new infra)

- All persistence remains `localStorage` + static JSON.
- All AI keeps its mock-provider fallback.
- Auth still bypassed with the mock user.
- Stage-2 concerns (Clerk, Neon, R2, Redis, Sentry, PWA, i18n, real video transcoding, content moderation, clinician verification) are explicitly deferred and called out in the Stage-3 doc.

### What shipped

- **Tab bar restructure** — third tab renamed `Content` (route id `community` preserved for compat), always-visible. Tab order is now Today · Path · Content.
- **Content home** (`/community`) — header, bookmark launcher, category filter strip (`For You · Reels · Articles · Research · Experts · Forum`), 3-card featured hero carousel, horizontal Reels rail, 2-column Articles grid, Research Spotlight stack, Expert Voices avatar row, Forum thread list, sample-content disclaimer.
- **Reel player sheet** — full-screen vertical sheet with simulated player chrome (poster image, progress bar, play overlay, like/save/share rail). Honest about the lack of real video. Like + view-count state persists locally via `useReelEngagement`.
- **Detail routes** — `/community/article/[slug]`, `/community/research/[slug]`, `/community/expert/[slug]`, `/community/forum/[id]`, `/community/reels`, `/community/saved`. Each has matching back nav, bookmark toggle, and disclaimer footer.
- **Forum reply box** — `useForumDrafts` writes mock-replies to localStorage; replies render in-thread with a "(local draft)" tag so the prototype is never confused with a server-backed forum.
- **Saved page** — bookmarked articles, reels, briefs, and threads in one surface, with empty state.
- **Sample content seed** — 6 articles, 8 reels, 6 research briefs, 4 expert profiles, 5 forum threads. Every item carries `isPlaceholder: true`. All authors are fictional. Affiliations carry the `(sample)` suffix. No new images invented — only `/public/food_images/*.png` already in repo.
- **New hooks** — `useContentBookmarks` (kind:id keyed, 100-cap), `useContentFilter` (sessionStorage), `useReelEngagement`, `useForumDrafts`.
- **CLAUDE.md updated** — rule 5 superseded note, rule 11 extended with Content tab + sample-content guardrails.

### What did not move

- Production hardening — Stage 2 still untouched.
- Recipe data, pairing engine, Today/Path surfaces — unchanged.
- AI router and mock fallback — unchanged.

---

## STAGE 0.9: NEXT-20D HABIT + TRUST + POLISH — COMPLETE

A fourth 20-phase sprint focused on turning the app into a habit: surfacing
the user's own cooking rhythm, strengthening the social loop, tightening
craving search, and sharpening guided-cook trust with zero new UI clutter.
All phases shipped 2026-04-17. See `docs/NEXT-20D-PHASES.md` for the full
plan.

- **P1** — `deriveCookRhythm` + ambient "Tuesday nights: you usually cook" line on Today, silent until the user has at least 4 completed cooks across 2+ distinct weeks.
- **P2** — Ingredient-reuse hint on `QuestCard`: `matchIngredientReuse` finds one shared named ingredient between today's top pick and a cook from the last 7 days, rendered as a single warm line ("reuses cilantro from Friday's tacos").
- **P3** — "You made this before" recall chip on Mission screen when the user is re-cooking a past dish, using `useCookSessions` last-completed timestamp.
- **P4** — Streak-aware welcome line on Today: copy adapts to 0 / 1–2 / 3+ day streak, stays quiet and returnable.
- **P5** — Post-cook invite sheet: single `sms:` deep-link on the Win screen (one-time prompt per unique cook), wired through `useInvitePrompts`.
- **P6** — `FriendsStrip` "new since last visit" dot: `useFriendsLastSeen` stamps a mount-time snapshot and only flags friend tiles whose approximate post time is newer than the last visit.
- **P7** — Gift page CTA polish: stars moved up to the header row beside the sender, primary CTA re-worded to "Cook this too."
- **P8** — `CameraInput` 6-second fallback: if recognition hangs, a "Didn't work — try typing instead" button surfaces and closes the camera.
- **P9** — `TextPrompt` empty-state starter chips swap from single words to evocative compound queries ("Chicken pasta", "Quick rice bowl").
- **P10** — Local result cap (6) with "Show N more" expanders on both literal and semantic match lists to keep the results sheet scannable.
- **P11** — Pre-cook `CookWatchlist`: collapsed chip at the top of the Grab phase listing all unsuppressed mistake warnings for the dish, per-dish scoped via `useMistakeSuppression`.
- **P12** — Step re-read via tap: double-tap the current instruction in `StepCard` to re-trigger text-to-speech without leaving the step.
- **P13** — Substitution memory: new `useSubstitutionMemory` hook (90-day per-dish/per-ingredient TTL) + "Saved as my swap" button in the AI substitute panel and "last time: X" hint in `IngredientList`.
- **P14** — Win-screen low-star feedback: 1- or 2-star ratings reveal 3 deterministic chips ("too salty", "too dry", "instructions unclear") that write back onto the cook session record.
- **P15** — Landing lazy-load: `AppPreviewSection`, `ScreenshotCarousel`, and `TrustStrip` moved behind `next/dynamic` (ssr: false) to shrink the LCP-blocking bundle on `/`.
- **P16** — A11y sweep on sprint surfaces (`FilterDropdown`, `MistakeChip` dismiss, `IngredientList` station toggle, `CookWatchlist`): visible focus rings + bare-icon-button `aria-label`s.
- **P17** — Reduced-motion sweep: `useReducedMotion` gates WinScreen confetti and simplifies `PreferenceStrip` expand/chevron animation for users with `prefers-reduced-motion`.
- **P18** — New-hook unit tests: `use-substitution-memory.test.ts` (6) + `use-mistake-suppression.test.ts` (6) cover versioned storage keys, TTL expiry, malformed-entry rejection, and key format stability.
- **P19–P20** — Lint, 222 vitest tests green (26 files), production build clean, changes committed to main.

---

## STAGE 0.8: NEXT-20C MEMORY + RELATIONSHIPS + PERFORMANCE — COMPLETE

A third 20-phase sprint focused on making the app remember the user, surface
preference-aware moments, and coalesce multi-dish prep without adding UI
clutter. All phases shipped 2026-04-17. See `docs/NEXT-20C-PHASES.md` for the
full plan.

- **P1** — `PreferenceStrip` on Path renders a single collapsed "What Sous has learned" line backed by `derivePreferenceObservations` over the user's completed cook sessions; auto-suppresses after three views and only appears once real data exists.
- **P2** — `buildPairingRationale` + new "Because you cooked X" ambient line on `QuestCard` ties today's suggestion to a recent cook via shared taxonomy axes (cuisine / protein / technique / flavor), with 3 new unit tests.
- **P3** — `RepeatCookChip` upgraded to distinguish "recent" (≤14 days) and "revive" (21–90 days) loved dishes and drop a gentle, non-guilting nudge; 8 new unit tests over `pickRepeatCandidate`.
- **P4** — Preference-decay halo on skill-tree nodes: `preference-decay.ts` (`computeFreshness`) decays 10% per 30 days with a 0.15 floor; `SkillNode` paints a warm radial halo whose opacity tracks freshness; `useSkillProgress` now stamps `lastCookedAt` on every recorded cook.
- **P7** — `FriendsStrip` tiles become tap-through routes to the read-only `/gift/<slug>` gift page, turning the social strip into a zero-friction inspiration surface.
- **P8** — `useShareLog` + imperative `logShare` persist share events in `localStorage`; `WinScreen` logs every successful gift; new `CooksSharedLine` on Path renders a single-line tally ("3 meals shared — Alex cooked one of them.") silent until the user has shared at least once.
- **P10** — `useCravingHistory` remembers the user's last 5 craving queries for 30 days (MRU, case-insensitive dedup); `TextPrompt` now shows a one-tap "Recent" chip row on focus when the input is empty.
- **P11** — Live filter application in craving results: `TextPrompt` consumes `useQuestFilters` so cook-time and cuisine filters active on `QuestCard` also filter the local search results, with a clearable "Filters on: ≤30 min · Indian" pill at the top of the results.
- **P12** — Why-this-match tap-to-expand on semantic matches: `find-closest-dishes` now returns a `matched` axes breakdown, `TextPrompt` renders an inline "Why?" expander listing the exact axes that hit (name / form / cuisine / protein / sauce / flavor / technique).
- **P13** — Pre-cook prep-list coalescing: new `coalescePrepList` utility (5 unit tests) merges ingredients across all dishes in a combined cook, groups them by inferred station (cutting-board / stove / oven / blender / other), and `IngredientList` gains a "By dish / By station" toggle that keeps existing checked state intact via `prepSourceIds`.
- **P15** — Mistake-chip dismissible with memory: new `useMistakeSuppression` hook (180-day per-dish suppression map) + `X` dismiss button on `MistakeChip`; `StepCard` threads `dishSlug` + `stepNumber` so suppressions are scoped, not global.
- **P19–P20** — Lint, 194 vitest tests green (21 files), production build clean, changes committed to main.

---

## STAGE 0.7: PATH MODAL OVERLAP RCA + REMEDIATION — COMPLETE

A targeted hotfix sprint triggered by a screenshot showing the Sprint 20B
P16 hover-tooltip fix had not actually resolved the overlap. Full RCA in
`docs/PATH-OVERLAP-RCA.md`. Shipped 2026-04-17.

- **Phase 0** — Written RCA mapping every observed symptom (header clip, floating tooltip, label overlap, FAB overlap, default scrollbar, whitespace) to root cause before touching code.
- **Phase 1** — `TrainingHoverPanel` component deleted outright; removed from `SkillNodeComponent` + `MasteryCuisineCard`; `.skill-hover-preview` block removed from `globals.css`. Native `title` attribute retained on every node for hover information without any overlay.
- **Phase 2** — `.app-header` carries `padding-top: env(safe-area-inset-top, 0px)` so notch/status-bar regions never clip header content on iOS standalone PWA or phone-frame emulators.
- **Phase 3** — `html { scrollbar-gutter: stable }` plus a soft `rgba(15,23,42,0.10)` webkit/firefox scrollbar so the 15-17 px layout shift and competing-with-chrome visuals are gone.
- **Phase 4** — Badges entry point moved OUT of a floating FAB and INTO the `PathHeader` as an inline chip next to Streak + Trophy. `AchievementsLauncher` is now headless by default and exposes an imperative `open()` handle via `useImperativeHandle` / `openRef`. Eliminates the entire class of FAB-over-content overlaps.
- **Phase 5** — Live-browser visual verification at 390×844 via the Cursor IDE browser MCP. Scrolled every tier of the skill tree and confirmed no overlays, no clipping, no visible default scrollbar.
- **Phase 6** — Lint, 180 vitest tests, production build all green.
- **Phase 7** — This commit + ROADMAP update.

---

## STAGE 0.6: NEXT-20B DECLUTTER + SEMANTIC CRAVING + LANDING POLISH — COMPLETE

A second 20-phase sprint focused on simplifying the Today home, upgrading craving search with rule-based semantic matching, enriching the marketing landing with phone-frame mockups and a screenshot carousel, and rectifying visual bugs on the Path screen. All phases shipped 2026-04-16. See `docs/NEXT-20B-PHASES.md` for the full plan.

- **P1–P2** — `MoreOptionsSheet` bottom drawer consolidates TonightChip (commit pill) + CookForTwoChip + quick-helper actions; Today page no longer carries "Make something in 15 minutes" or FallbackActions in the primary view.
- **P3–P4** — `FriendsStrip` upgraded from a plain list into a social-feed-style row with meal photos, friend avatars, and time-ago labels; seeded by mock `friend-cooks.ts` data layered with the user's own completed cooks.
- **P5–P8** — Reusable `FilterDropdown` primitive replaces the single "Under 20 min" toggle with two minimalist pill-dropdowns (cook time + cuisine) on `QuestCard`. `useQuestFilters` hook persists state in `sessionStorage`.
- **P9–P12** — Rule-based semantic craving matcher (`dish-taxonomy.ts` + `find-closest-dishes.ts`) scores dishes across protein / sauce / technique / flavor / form / cuisine / dairy axes. Wired into `TextPrompt` under a "Closest to what you're craving" section with one-line reasons. 8 unit tests.
- **P13–P15** — Landing: new `AppPreviewSection` (three phone frames rendering real Today/Path/Win mockups using live app components), `ScreenshotCarousel` (horizontal bleed of real food photos with dish-captions), `TrustStrip` (dotted editorial row — "no logins", "no ads", "on-device", "under 10s").
- **P16** — Training hover tooltip on Path skill nodes gated to `@media (hover: hover) and (pointer: fine)` so it never triggers on touch devices; new `.skill-hover-preview` class in `globals.css` replaces the Tailwind stack that allowed overlap.
- **P17** — `PathHeader` tightened: single-caption XP bar, 36px level badge, compact title + streak + skills trophy row; removed redundant "X/Y XP to level N+1" sub-caption and stray `ChevronRight`.
- **P18** — Badges FAB: 44×44 minimum tap target, larger shadow, stronger focus ring, safe-area-aware bottom offset (`calc(5.25rem + env(safe-area-inset-bottom))`), z-index raised above tab bar but below modals.
- **P19–P20** — Lint, 180 vitest tests green, production build clean, changes committed to main.

---

## STAGE 0.5: NEXT-20 INTUITION + BEAUTY BUILD — COMPLETE

A focused 20-phase pass on making the app more intuitive, accessible, and visually engaging, with a middle-aged-to-senior user in mind. All phases shipped between 2026-04-15 and 2026-04-16. See `docs/NEXT-20-PHASES.md` for the full plan.

- **Phase 1** — Readable-by-default typography pass (css variables for body/caption/cook sizes, cook-prose class).
- **Phase 2** — Tap target + contrast audit via a shared `IconButton` primitive (all icon controls ≥44×44).
- **Phase 3** — Plain-language cook step glossary (`cook-glossary.ts`, `Glossify` component, inline tooltips).
- **Phase 4** — Path ambient hero with time-of-day gradient and warm headline copy.
- **Phase 5** — Living skill tree with stroke-draw connectors and bloom animations on mastery.
- **Phase 6** — Cuisine constellation SVG on Path (quiet celebration of culinary reach).
- **Phase 7** — Journey montage strip (horizontal scroll of recent cook polaroids).
- **Phase 8** — "Tonight" commitment chip on Today (localStorage, auto-expiring).
- **Phase 9** — "Plan my cook" chip on Mission (eat-by time → start-cooking-at time).
- **Phase 10** — Pantry-aware ranking in QuestCard (`computePantryFit`, "already have most of this" chip).
- **Phase 11** — Quick-win "Under 20 min" filter + "Welcome back" path hero for returning users.
- **Phase 12** — Read-aloud step player with graceful fallback when speech synthesis is unavailable.
- **Phase 13** — Big-hands mode (session-scoped, `data-big-hands` CSS variables, edge-tap auto-nudge).
- **Phase 14** — Timer stack timeline on `/cook/combined` (multi-timer `useCookStore`, `TimerStack` pills).
- **Phase 15** — Repeat-cook shortcut on Today (shows last ≥4-star cook within 14 days).
- **Phase 16** — Rest-day grace (1-per-week cap, preserves streak, dotted-outline visual state).
- **Phase 17** — Kitchen confidence dial on Path (derived gauge, 4 tiers, no number).
- **Phase 18** — Recipe gift link (`/gift/<slug>?from=<name>&stars=<n>` read-only preview, no signup wall).
- **Phase 19** — Household taste blend ("Cook for two" chip + single slider, blends preference vector).
- **Phase 20** — Final audit + polish (full lint + 172 tests + prod build green; Playwright smokes for read-aloud, Tonight round-trip, and rest-day streak invariant).

Remaining deferred items (require live environment): Lighthouse runs for `/today`, `/path`, `/cook/[slug]`; manual 375×667 viewport pass; visual regression screenshot baseline in `docs/screenshots/2026-04-phase-20/`.

---

## STAGE 1: PROTOTYPE BUILD

The goal is a working, demoable prototype. No auth enforcement, no production infra, no payment. Everything persists in localStorage. The full core loop — craving → pairing → evaluate → guided cook → win → scrapbook → path — must work end-to-end.

---

### What's Already Built

These features exist as real, substantial code — not stubs.

#### Core Experience (Today Tab)

- **Today page** (`src/app/(today)/page.tsx`) — full state machine: idle → loading → results | camera → recognition → correction. Working.
- **Quest card stack** (`src/components/today/quest-card.tsx`) — swipeable Tinder-style cards, drag overlays, heart/X buttons. Pool draws from all 76 meals + 119 guided-cook sides with smart scoring, daily rotation, and preference matching. Working.
- **Bird mascot + craving trigger** (`src/components/today/bird-mascot.tsx`) — speech bubble "I'm craving…" interaction. Working.
- **Search popout** (`src/components/today/search-popout.tsx`) — bottom sheet for text/camera input. Working.
- **Text prompt** (`src/components/today/text-prompt.tsx`) — freeform craving input. Working.
- **Camera input** (`src/components/today/camera-input.tsx`) — photo capture flow. Working.
- **Correction chips** (`src/components/today/correction-chips.tsx`) — dish confirmation after photo recognition. Working.
- **Result stack** (`src/components/today/result-stack.tsx`) — 3 ranked side dish cards. Working.
- **Quick actions** (`src/components/today/quick-actions.tsx`) — rescue fridge / play game / personalize. Working.
- **Friends strip** (`src/components/today/friends-strip.tsx`) — shows user's recent completed cooks as scrollable cards. Uses real cook session data. Hidden when no cooks. Working.
- **Streak counter** (`src/components/today/streak-counter.tsx`) — working, reads from localStorage.

#### Pairing Engine

- **6 scorer modules** (`src/lib/engine/scorers/`) — cuisine-fit, flavor-contrast, nutrition-balance, prep-burden, temperature, preference. All implemented.
- **Ranker** (`src/lib/engine/ranker.ts`) — weighted aggregation. Working.
- **Explainer** (`src/lib/engine/explainer.ts`) — plain-language "why this works" strings. Working.
- **Pairing engine orchestrator** (`src/lib/engine/pairing-engine.ts`) — with unit tests. Working.
- **Pre-computed pairings** (`src/data/pairings.json`) — 924 engine-scored pairs (14 Indian mains × 66 sides). Working.
- **93 mains** (`src/data/meals.json`), **203 sides** (`src/data/sides.json`) — loaded at build time.
- **tRPC `pairing.suggest` and `pairing.explain`** — fully implemented.

#### AI Integration

- **Food photo recognition** (`src/lib/ai/food-recognition.ts`) — OpenAI gpt-4o Vision → structured dish output. Working.
- **Craving text parser** (`src/lib/ai/craving-parser.ts`) — Claude → CravingIntent (dish, cuisine, effort, health, mood). Working.
- **AI provider abstraction** (`src/lib/ai/contracts.ts`, `src/lib/ai/provider.ts`) — typed interface, mock + Claude providers. All 6 surfaces defined.
- **Mock provider** (`src/lib/ai/providers/mock.ts`) — deterministic fallback for all AI surfaces. Working.
- **Claude provider** (`src/lib/ai/providers/claude.ts`) — real AI calls. Working.
- **AI tRPC router** (`src/lib/trpc/routers/ai.ts`) — 6 endpoints: `explainPairing`, `askCookQuestion`, `suggestSubstitution`, `generateWinMessage`, `rewriteAppraisal`, `generateReflection`. All live.
- **tRPC `recognition.identify`** — fully implemented.

#### Guided Cook Flow

- `**/cook/[slug]**` — full 4-phase flow: Mission → Grab → Cook → Win.
- **Mission screen** (`src/components/guided-cook/mission-screen.tsx`) — dish overview, what you'll learn. Working.
- **Ingredient list** (`src/components/guided-cook/ingredient-list.tsx`) — checkable list, "I don't have this" fires `ai.suggestSubstitution`. Working.
- **Step card** (`src/components/guided-cook/step-card.tsx`) — one instruction per screen, expandable chips, Cook Q&A button wired to `ai.askCookQuestion`. Working.
- **Cook timer** (`src/components/guided-cook/cook-timer.tsx`) — countdown with controls. Working.
- **Chips** — `timer-chip.tsx`, `mistake-chip.tsx`, `hack-chip.tsx`, `fact-chip.tsx` — all working.
- **Win screen** (`src/components/guided-cook/win-screen.tsx`) — celebration, star rating, note input, photo add, save button, "Reflect" toggle. AI win message via `ai.generateWinMessage` with mock fallback. Working.
- **Combined mains + sides cook** (`/cook/combined`) — multi-dish cook flow, cook order by total time. Working.
- **tRPC `cook.getSteps`** — fully implemented (static data fallback, DB-optional). Working.
- **tRPC `cook.start` / `cook.complete`** — implemented with DB + localStorage fallback. Working.
- **Cook store** (`src/lib/hooks/use-cook-store.ts`) — Zustand session state. Working.

#### Cook Session Persistence

- `**useCookSessions` hook (`src/lib/hooks/use-cook-sessions.ts`) — localStorage-based sessions, stats, streak, cuisine tracking, favorites toggle, completion → pathJustUnlocked trigger. Fully working without a database.
- `**useUnlockStatus` hook (`src/lib/hooks/use-unlock-status.ts`) — reads completedCooks, enforces Path unlock at 3 cooks, Community always deferred. Working.

#### Evaluate A (Pre-Cook Plate Evaluation)

- **Plate evaluation engine** (`src/lib/plateAppraisal.ts`, `src/lib/engine/plate-evaluation.ts`) — category coverage (veg/protein/carbs), signal classification, confidence-first appraisal, one-best-move recommendation. Working.
- **Evaluate sheet UI** (`src/components/results/EvaluateSheet.tsx`) — ADA plate visualization, balance indicators, swap suggestion. Working.
- `**ai.rewriteAppraisal` — warmer natural-language version of deterministic appraisal. Wired.

#### Results, Search, Save, Share

- **Full results UI** (`src/components/results/`) — HeroDish, SideDishCard (desktop + mobile), DishDetailModal, HoverCard, InlinePlate, PlateMethodModal, SharePlateModal, RerollButton, BalanceIndicator. All working.
- **Fuzzy search** (`src/lib/fuzzySearch.ts`) — Fuse.js against 93 mains. Working.
- **SearchDropdown + SuggestionChips** — typeahead with cuisine badges, quick-start chips. Working.
- **Save pairings** (`src/hooks/useSavedPairings.ts`) — localStorage, max 20, auto-eviction. Working.
- **SavedPairingsModal** (`src/components/layout/SavedPairingsModal.tsx`) — browse saved pairings. Working.
- **PNG plate export + native share** — html-to-image, clipboard fallback. Working.

#### Path Tab

- **Path home** (`src/app/(path)/path/page.tsx`) — skill tree, journey summary, weekly goal card, path header with XP/level/streak. Working.
- **Skill tree** (`src/components/path/skill-tree.tsx`, `skill-node.tsx`, `skill-connector.tsx`) — Duolingo-style nodes with Foundation → Intermediate → Cuisine Specializations tiers. Working.
- **Skill detail sheet** (`src/components/path/skill-detail-sheet.tsx`) — node info + "Start cooking" CTA. Working.
- **Journey summary** (`src/components/path/journey-summary.tsx`) — cooks this week/month, cuisine diversity. Working.
- **Weekly goal card** (`src/components/path/weekly-goal-card.tsx`) — "Cook 3 times this week" progress bar. Working.
- **Skill tree data** (`src/data/skill-tree.ts`) + **skill progress hook** (`src/lib/hooks/use-skill-progress.ts`) — XP, levels, node unlock status derived from cook sessions. Working.
- **Scrapbook page** (`src/app/(path)/path/scrapbook/page.tsx`) — grid of completed cooks with ScrapbookEntryCard, replay and favorite controls. Working.
- **Favorites page** (`src/app/(path)/path/favorites/page.tsx`) — filtered view of favorited sessions. Working.
- **Scrapbook entry card** (`src/components/path/scrapbook-entry-card.tsx`) — dish name, cuisine, date, rating, photo, replay/favorite buttons. Working.
- **Replay from scrapbook** — tapping a scrapbook entry navigates to `/cook/[slug]`. Working.

#### Infrastructure

- **tRPC v11** (`src/lib/trpc/`) — full router, TanStack Query client. Working.
- **Drizzle ORM schema** (`src/lib/db/schema.ts`) — 7 tables: sideDishes, cookSteps, ingredients, users, cookSessions, savedRecipes, quizResponses. Defined, **not seeded**.
- **Zustand state** — `useTodayStore`, `useCookStore`. Working.
- **Framer Motion** — animations throughout. Working.
- **DeviceFrame** (`src/components/shared/device-frame.tsx`) — phone mockup, fixed elements scoped inside frame. Working.
- **Tab bar** (`src/components/shared/tab-bar.tsx`) — progressive visibility (Today always, Path after 3 cooks, Community hidden). Working.
- **Heatmap** (`src/components/heatmap/HeatmapModal.tsx`) — 35+ mains × 148+ sides compatibility matrix. Working.
- **Vercel Analytics** (`src/lib/analytics.ts`) — integrated (stub events).
- **Spin wheel** (`src/components/layout/SpinWheel.tsx`), **About modal**, **Bread quiz** (`src/components/shared/bread-quiz.tsx`) — working.
- **Coach quiz** (`src/components/shared/coach-quiz.tsx`) — this-or-that preference quiz, updates preference vector for quest card ranking and pairing scoring. Working.
- **Navbar** (`src/components/layout/Navbar.tsx`) — working.

#### Cook Sequencer Engine (Phase 8)

- **Cook sequencer** (`src/lib/engine/cook-sequencer.ts`) — Interleaves steps from multiple dishes in combined cooks. Classifies passive steps (bake, simmer) to identify parallel cooking opportunities. Working.
- **Sequencer integration** — Combined cook page (`/cook/combined`) displays parallel cooking hints and sequencer-estimated total time. Working.
- **Unit tests** — 9 tests covering single dish, multi-dish sorting, parallel hints, and interleaving.

#### Instacart Integration (Phase 10 — V1 Placeholder)

- **Instacart button** on Grab screen (`ingredient-list.tsx`) — Shows "Order N items with Instacart" when ingredients are unchecked. V1 shows a "Coming soon" toast. Working.

#### XP & Leveling System (Phase 11)

- **XP system hook** (`src/lib/hooks/use-xp-system.ts`) — Tracks XP events, computes levels (1 per 100 XP), level titles, streak-based multipliers (2x at 7 days, 3x at 14 days). Persists in localStorage. Working.
- **XP awards** — Cook complete (+25), rate dish (+5), add note (+5), add photo (+10), weekly challenge (+50), game win (+15).
- **Level-up toast** (`src/components/shared/level-up-toast.tsx`) — Celebratory notification on level up. Working.
- **Integrated** into both single-dish and combined cook flows.

#### Achievement System

- **Achievement definitions** (`src/data/achievements.ts`) — Milestones based on cooks completed, cuisines explored, streaks, skills, ratings, photos, XP, and levels. Working.
- **Achievement hook** (`src/lib/hooks/use-achievements.ts`) — Tracks unlocked achievements against user stats, persists in localStorage. Uses Set-based O(1) lookups. Working.
- **Achievement toast** (`src/components/shared/achievement-toast.tsx`) — Notification on achievement unlock. Working.
- **Achievements grid** (`src/components/path/achievements-grid.tsx`) — Displayed on Path page showing unlocked and locked achievements.

#### Weekly Challenges

- **Weekly challenges** (`src/data/weekly-challenges.ts`) — Rotating pool of challenges (cook count, cuisine-specific, unique dishes, rate dishes, streak days) with bonus XP. Deterministically selected per calendar week. Working.
- **Weekly goal card** updated to display the current dynamic challenge with progress tracking.

#### Games Arcade (Phase 14)

- **Arcade menu** (`/games`) — "Kitchen Arcade" with 4 game cards, high scores, and play counts. Working.
- **What's Cooking?** (`/games/whats-cooking`) — 5-clue food guessing game with fuzzy matching, scoring, streaks. 20 dishes with hand-crafted clues. Working.
- **Flavor Pairs** (`/games/flavor-pairs`) — Memory-style matching game with easy/medium/hard difficulty, timer, and "why they pair" educational hints. Working.
- **Speed Chop** (`/games/speed-chop`) — Ingredient sorting game with categories, lives, streaks, fun facts, increasing difficulty. Working.
- **Cuisine Compass** (`/games/cuisine-compass`) — Geography game: identify dish origins on a region map. 8 rounds per game with fun facts. Working.
- **Game scores hook** (`src/lib/hooks/use-game-scores.ts`) — Persists best scores and play counts per game in localStorage. Working.
- **Today page integration** — "Play a game" button navigates to `/games`.

#### Recipe Overlay Infrastructure (Phase 15C)

- **Recipe overlays hook** (`src/lib/hooks/use-recipe-overlays.ts`) — "Base + Overlay" pattern for user recipe modifications. Stores step overrides, personal notes, and substitutions in localStorage. Working.
- `**mergeStepWithOverlay` utility — Merges base step data with user overlay at read time.
- **Personal step notes** — Step card allows users to add notes to individual cooking steps via overlay system. Working.

#### Cuisine Mastery & Streak Progression

- **Cuisine mastery** integrated into skill tree — 8 cuisine paths (Italian, Japanese, French, Mexican, Indian, Thai, Chinese, Mediterranean) as parallel progression tracks.
- **Streak multipliers** — XP system applies 2x multiplier at 7-day streak, 3x at 14-day streak.

#### Source Attribution

- **Recipe source tracking** — Guided cook steps include source attribution metadata for proper recipe crediting.

#### Testing

- **Unit tests** — 7 test files, 102 tests covering pairing engine, plate evaluation, ranker, normalization, cook sessions, coach quiz, and cook sequencer.
- **E2E smoke tests** (`e2e/core-loop.spec.ts`) — 5 Playwright scenarios covering Today page, search flow, full cook loop, quest card save, and Path tab unlock.
- **E2E games arcade tests** (`e2e/games-arcade.spec.ts`) — 5 tests covering arcade menu and all 4 game initial screens.
- **E2E path features tests** (`e2e/path-features.spec.ts`) — 4 tests covering achievements section, weekly challenge card, scrapbook, and favorites pages.
- **Playwright config** — Chromium + Mobile Safari, auto-starts dev server, HTML reporter.

#### Performance Optimizations

- **Dynamic imports** — BreadQuiz and CoachQuiz lazy-loaded via `next/dynamic` to reduce initial bundle.
- **React.memo** — Applied to AchievementsGrid, WeeklyGoalCard, JourneySummary, SkillTree, LevelUpToast to prevent unnecessary re-renders.
- **Memoization** — Set-based achievement lookups (O(1) vs O(n)), memoized recentEvents in XP system.

---

### What Remains for the Prototype

> **Last audit:** 2026-04-15. Sprints 1-6 complete. Phases 8, 10, 11, 14, 15C implemented.

#### Sprint 1: Polish and Connect (Phase 1 remaining) — COMPLETE

- **Quest card pool** — `buildQuestDishes()` draws from all 76 meals + 119 guided-cook sides with smart scoring, daily rotation, preference matching, and novelty bonus. 80/20 meal:side ratio.
- **Quest card save button** — Heart wired to `useSavedDishes` (localStorage, max 50, toast notification).
- **Friends strip** — Replaced mock data with real cook session history via `FriendsStrip({ sessions })`. Hidden when no completed cooks.
- **Error states** — Pairing failure, recognition failure, network timeout, empty results all have user-visible UI with retry actions.
- **Loading skeletons** — Shimmer placeholders in search popout during pairing load.
- **Cross-browser scrollbar hiding** — CSS covers IE/Edge (`-ms-overflow-style`), Firefox (`scrollbar-width`), and WebKit (`::-webkit-scrollbar`).
- `**pnpm lint && pnpm test` — 102 unit tests passing; full lint + Prettier clean.

#### Sprint 2: Post-Cook Reflection (Phase 6A) — COMPLETE

- **Evaluate B reflection UI** — "Reflect on this meal" expandable panel on Win screen with strengths + suggestions, wired to `ai.generateReflection` with mock fallback.
- **Win screen → scrapbook save** — Full save path works: rate → note → photo → `completeSession()` → scrapbook entry. `pathJustUnlocked` fires on 3rd completion.
- **Journey tRPC endpoints** — `journey.recent` and `journey.stats` fully implemented (accept localStorage sessions, compute weekly frequency).

#### Sprint 3: Coach Persona (Phase 5 deferred items) — COMPLETE

- **Coach quiz** — Full this-or-that quiz UI (`coach-quiz.tsx`) + `coach.quiz` tRPC endpoint. Results update preference vector → influences quest card ranking and pairing scoring.
- **Coach vibe prompt** — `coach.vibePrompt` endpoint returns daily rotating questions with result cards.

#### Sprint 4: Data Expansion — PARTIAL

- **Scored pairings beyond Indian cuisine** — Still only 14 Indian mains in `pairings.json`. TypeScript engine covers all 76 mains. Python engine run needed for quality upgrade.
- **Guided cook steps coverage** — 126 entries (119 sides + 7 meals), 58% side coverage. Quest cards prioritize dishes with guided cook data.

#### Sprint 5: Testing — COMPLETE

- **Unit tests** — 7 test files, 102 tests: pairing-engine, plate-evaluation, ranker, normalize, cook-sessions, coach-quiz, cook-sequencer.
- **E2E smoke test (Playwright)** — 5 scenarios: Today page render, search flow, full core loop, quest card save, Path tab unlock.

#### Sprint 6: Phase 7 (Multi-Side Selection) — COMPLETE

- **Multi-side selection** — Result stack shows selectable checkboxes on all 3 sides, "Cook N selected sides" CTA.
- **Per-side reroll** — Swap button on each side card via `pairing.rerollSide` tRPC endpoint. Excludes previously seen IDs.

---

### Explicitly Deferred from Prototype

These are intentionally out of scope for Stage 1:

| Feature                                    | Status                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| Community tab                              | Unlocks after 30 days. Always hidden in prototype.                                    |
| Clerk auth enforcement                     | Auth is integrated but not required. No login wall.                                   |
| Real database (Neon Postgres)              | Everything uses localStorage. DB schema is defined and ready.                         |
| Cloudflare R2 image storage                | Images use Unsplash URLs.                                                             |
| Upstash Redis cache/rate limiting          | Not needed at prototype scale.                                                        |
| ~~Instacart integration~~                  | **DONE (V1)** — Placeholder button with "Coming soon" toast on Grab screen.           |
| ~~Multi-side selection + per-side reroll~~ | **DONE** — Sprint 6. Full multi-side selection and per-side reroll working.           |
| ~~Intelligent cook sequencer~~             | **DONE** — Phase 8 implemented. Parallel hints in combined cook flow.                 |
| Agentic recipe assistant                   | Phase 9 — post-V1.                                                                    |
| ~~Advanced skill progression / XP system~~ | **DONE** — Phase 11. XP, levels, achievements, weekly challenges, streak multipliers. |
| ~~Games Arcade~~                           | **DONE** — Phase 14. 4 mini-games with scoring and XP integration.                    |
| ~~Recipe overlay infrastructure~~          | **DONE** — Phase 15C. Base + Overlay pattern with personal step notes.                |

---

## STAGE 2: PRODUCTION LAUNCH

These are the concerns that must be resolved before Sous goes live for real users. None of these are needed for a demo or prototype.

---

### Auth (Clerk)

- Enable Clerk auth fully — `src/components/auth-provider.tsx` and `src/middleware.ts` exist but auth is not enforced on any route.
- Add login/signup flow with social providers (Google, Apple).
- Associate cook sessions with Clerk user IDs (currently local sessions use `local-${Date.now()}`).
- `cook.start` / `cook.complete` already write to DB when `ctx.userId` is present — just need auth enforced.
- Migrate localStorage sessions to DB on first login ("import your history" flow).

### Real Database (Neon Postgres + Drizzle)

- Provision a Neon Postgres database and set `DATABASE_URL`.
- Run `pnpm db:push` to apply the 7-table Drizzle schema.
- Run `pnpm db:seed` to seed the side dish and meal catalog.
- Fill in the 6 stubbed tRPC endpoints: `journey.recent`, `journey.stats`, `coach.quiz`, `coach.vibePrompt`, `content.getSideDish`, `content.search`.
- Replace localStorage-only session hooks with server-backed equivalents (localStorage can remain as optimistic cache).

### Performance

- Lazy-load the pairing engine and data files (currently bundled at build time).
- Add ISR or edge caching for the `pairing.suggest` endpoint.
- Optimize Framer Motion bundle — tree-shake unused features.
- Image optimization — switch from Unsplash URLs to Next.js `<Image>` with blur placeholders.
- Audit and reduce initial JS bundle to under 150KB gzipped (current target from `planning.md`).
- Lighthouse score ≥ 90 on mobile.

### Caching and Rate Limiting (Upstash Redis)

- Add Upstash Redis for rate limiting on AI endpoints (`recognition.identify`, `pairing.suggest`).
- Cache pairing results per main dish slug to reduce AI API costs on repeat queries.
- Cache food recognition results by image hash to avoid re-querying Vision API for the same photo.

### Image Pipeline (Cloudflare R2)

- Stand up a Cloudflare R2 bucket for food images.
- Replace Unsplash URLs with R2-hosted, culturally reviewed photography.
- Build an image upload pipeline for Win screen photos (currently `photoUri` in cook sessions is a local blob URL that doesn't persist across devices).

### Error Monitoring (Sentry)

- Add Sentry for both client and server-side error capture.
- Set up alert rules for: AI API failures, pairing engine errors, database query failures.
- Add source maps for production stack traces.

### Analytics

- Expand Vercel Analytics stub (`src/lib/analytics.ts`) with real event tracking: search submitted, pairing viewed, cook started, cook completed, evaluate opened, plate shared.
- Set up a funnel view: search → results → cook → win.
- Track feature discovery rates (how many users find Evaluate, Path, scrapbook).

### SEO

- Add `og:image` and `twitter:card` meta tags to the Today page (shareable plate preview image).
- Add structured data (Schema.org Recipe) for guided cook pages.
- Generate a sitemap for `/cook/[slug]` routes.
- Ensure all pages have unique, descriptive `<title>` and `<meta description>` tags.

### Security

- Enforce Clerk auth on all mutation tRPC endpoints in production (`publicProcedure` → `protectedProcedure` where appropriate).
- Add input sanitization and output validation on all AI endpoints (Zod schemas are defined — enforce them at the route boundary).
- Rate limit camera/recognition endpoint per user to prevent Vision API abuse.
- Review and restrict CORS policy on the tRPC API route.
- Add Content-Security-Policy headers.
- Rotate any API keys currently in `.env.local` and store in Vercel Environment Variables.

### CI/CD Pipeline

- Set up GitHub Actions: lint + test on every PR.
- Block merges to `main` if `pnpm lint` or `pnpm test` fail.
- Add Playwright E2E smoke tests to CI (requires running Vercel preview URL).
- Add automated Lighthouse CI check on PRs touching Today page or Guided Cook.
- Configure preview deployments on Vercel for all PRs.

### Accessibility

- Full WCAG 2.1 AA audit on core flows (search, results, guided cook, evaluate).
- Keyboard navigation for the quest card stack and search popout.
- Screen reader labels on all icon-only buttons.
- Verify `prefers-reduced-motion` is respected everywhere (hook exists in `src/hooks/useReducedMotion.ts`).
- Color contrast audit — the cream/stone palette needs verification at small text sizes.

### Additional Production Concerns

- **PWA / installability** — Add a web app manifest, service worker, and offline fallback for the core Today page.
- **Multi-language** — Spanish, Hindi, Tagalog are the highest-priority candidates per the PRD (Stanford patient demographics).
- **Legal disclaimers** — "Not medical advice" notice, Privacy Policy, Terms of Service pages.
- **Data retention policy** — Define and implement a policy for cook session data (user deletion, data export).
- **Clinical partner flow** (from PRD) — Clinician referral links, curated starter packs per cuisine, anonymous patient exploration tracking (opt-in).

---

## Summary

|                  | Stage 1 (Prototype)                                       | Stage 2 (Production)               |
| ---------------- | --------------------------------------------------------- | ---------------------------------- |
| **Auth**         | None (anonymous)                                          | Clerk, enforced                    |
| **Data**         | localStorage + static JSON                                | Neon Postgres, seeded              |
| **AI**           | Working (mock fallback)                                   | Rate-limited, cached, monitored    |
| **Images**       | Unsplash URLs                                             | Cloudflare R2                      |
| **Testing**      | 102 unit tests + 14 E2E tests (core loop, games, path)    | Full CI pipeline, Playwright suite |
| **Errors**       | Console.warn fallbacks                                    | Sentry, alert rules                |
| **Analytics**    | Vercel Analytics (basic)                                  | Full funnel tracking               |
| **Deploy**       | Vercel (already live)                                     | Vercel + hardened config           |
| **Gamification** | XP, levels, achievements, weekly challenges, 4 mini-games | Leaderboards, social sharing       |
| **Recipes**      | 126 guided cook flows, overlay system, personal notes     | Full 203 coverage, cloud sync      |
