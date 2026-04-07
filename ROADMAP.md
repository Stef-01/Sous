# Sous — Prototype Roadmap

> **Updated:** 2026-04-05
> **Related docs:** `planning.md` (phase-by-phase detail), `documentation.md` (built system inventory), `CLAUDE.md` (conventions)

---

## STAGE 1: PROTOTYPE BUILD

The goal is a working, demoable prototype. No auth enforcement, no production infra, no payment. Everything persists in localStorage. The full core loop — craving → pairing → evaluate → guided cook → win → scrapbook → path — must work end-to-end.

---

### What's Already Built

These features exist as real, substantial code — not stubs.

#### Core Experience (Today Tab)
- **Today page** (`src/app/(today)/page.tsx`) — full state machine: idle → loading → results | camera → recognition → correction. Working.
- **Quest card stack** (`src/components/today/quest-card.tsx`) — swipeable Tinder-style cards, drag overlays, heart/X buttons. Working, but pool is **5 hardcoded dishes** (not connected to real data).
- **Bird mascot + craving trigger** (`src/components/today/bird-mascot.tsx`) — speech bubble "I'm craving…" interaction. Working.
- **Search popout** (`src/components/today/search-popout.tsx`) — bottom sheet for text/camera input. Working.
- **Text prompt** (`src/components/today/text-prompt.tsx`) — freeform craving input. Working.
- **Camera input** (`src/components/today/camera-input.tsx`) — photo capture flow. Working.
- **Correction chips** (`src/components/today/correction-chips.tsx`) — dish confirmation after photo recognition. Working.
- **Result stack** (`src/components/today/result-stack.tsx`) — 3 ranked side dish cards. Working.
- **Fallback actions** (`src/components/today/fallback-actions.tsx`) — rescue fridge / play game / order out. Working.
- **Friends strip** (`src/components/today/friends-strip.tsx`) — social proof row. Working, but uses **mock data**.
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
- **`/cook/[slug]`** — full 4-phase flow: Mission → Grab → Cook → Win.
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
- **`useCookSessions` hook** (`src/lib/hooks/use-cook-sessions.ts`) — localStorage-based sessions, stats, streak, cuisine tracking, favorites toggle, completion → pathJustUnlocked trigger. Fully working without a database.
- **`useUnlockStatus` hook** (`src/lib/hooks/use-unlock-status.ts`) — reads completedCooks, enforces Path unlock at 3 cooks, Community always deferred. Working.

#### Evaluate A (Pre-Cook Plate Evaluation)
- **Plate evaluation engine** (`src/lib/plateAppraisal.ts`, `src/lib/engine/plate-evaluation.ts`) — category coverage (veg/protein/carbs), signal classification, confidence-first appraisal, one-best-move recommendation. Working.
- **Evaluate sheet UI** (`src/components/results/EvaluateSheet.tsx`) — ADA plate visualization, balance indicators, swap suggestion. Working.
- **`ai.rewriteAppraisal`** — warmer natural-language version of deterministic appraisal. Wired.

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
- **Navbar** (`src/components/layout/Navbar.tsx`) — working.

---

### What Remains for the Prototype

These are the specific gaps between the current state and a fully demoable prototype.

#### Sprint 1: Polish and Connect (Phase 1 remaining)

- [ ] **Quest card pool** — Replace the 5 hardcoded dishes in `quest-card.tsx` with a real rotating selection drawn from `src/data/sides.json`. Each card should navigate to a real `/cook/[slug]` route with data.
- [ ] **Quest card save button** — Wire the heart button on quest cards to `useSavedPairings` or `useCookSessions` so it actually persists.
- [ ] **Friends strip** — Either replace mock data with a deterministic rotation from cook sessions, or hide the strip entirely until social features exist. Don't show fake user avatars.
- [ ] **Error states** — Add user-visible error UI for: pairing failure, recognition failure, network timeout, and empty search results. Currently most failures fail silently.
- [ ] **Loading skeletons** — Add shimmer placeholders inside the search popout while pairing results load.
- [ ] **Cross-browser scrollbar hiding** — Verify the DeviceFrame inner scroll works on Windows Chrome, Safari, and Firefox. The current CSS may only hide scrollbars on WebKit.
- [ ] **`pnpm lint && pnpm test`** — Fix any outstanding failures before demo.

#### Sprint 2: Post-Cook Reflection (Phase 6A)

- [ ] **Evaluate B reflection UI** — The Win screen has a `showReflection` toggle state, but the actual reflection panel needs to be built: strengths display, next-time suggestions, "Save to scrapbook" CTA. Wire to `ai.generateReflection` (mock fallback already exists).
- [ ] **Win screen → scrapbook save** — Verify the full save path: rate → note → photo → `completeSession()` → scrapbook entry appears. Confirm `pathJustUnlocked` banner fires on the 3rd completion.
- [ ] **Journey tRPC endpoints** — `journey.recent` and `journey.stats` are still stubbed. Either implement them (reading from localStorage via ctx, or removing the stubs in favor of direct hook usage in Path components).

#### Sprint 3: Coach Persona (Phase 5 deferred items)

- [ ] **Coach quiz** (`src/lib/trpc/routers/coach.ts`) — `coach.quiz` tRPC endpoint is stubbed. Build the this-or-that preference quiz UI (`src/components/shared/bread-quiz.tsx` exists as a shell). Wire responses to update the preference vector in `useTodayStore` to influence future pairings.
- [ ] **Coach vibe prompt** — `coach.vibePrompt` is stubbed. Low priority — can stay deferred until after core demo.

#### Sprint 4: Data Expansion

- [ ] **Scored pairings beyond Indian cuisine** — Currently only 14 Indian mains have Python engine scores in `pairings.json`. The TypeScript engine handles all other mains. Run the Python engine against the remaining 79 mains and update `pairings.json`. This significantly improves pairing quality for the demo.
- [ ] **Guided cook steps coverage** — `guided-cook-steps.ts` has static cook data for a subset of dishes. Audit which dishes in `sides.json` are missing cook steps, and fill gaps for the most common quest card candidates (at minimum, cover the dishes shown in quest cards).

#### Sprint 5: Testing

- [ ] **Unit tests** — Only `pairing-engine.test.ts` exists. Add tests for: `plate-evaluation.ts`, `useCookSessions` logic, craving parser output validation, unlock status logic.
- [ ] **E2E smoke test (Playwright)** — Write one end-to-end test covering the full core loop: type craving → see results → tap "Cook this" → complete guided cook → Win screen. This is the demo flow and must not break.

---

### Explicitly Deferred from Prototype

These are intentionally out of scope for Stage 1:

| Feature | Reason |
|---------|--------|
| Community tab | Unlocks after 30 days. Always hidden in prototype. |
| Clerk auth enforcement | Auth is integrated but not required. No login wall. |
| Real database (Neon Postgres) | Everything uses localStorage. DB schema is defined and ready. |
| Cloudflare R2 image storage | Images use Unsplash URLs. |
| Upstash Redis cache/rate limiting | Not needed at prototype scale. |
| Instacart integration | Placeholder button exists in fallback actions. V1 shows a "coming soon" toast. |
| Multi-side selection + per-side reroll | Phase 7 in planning.md — post-V1. |
| Intelligent cook sequencer | Phase 8 — post-V1. |
| Agentic recipe assistant | Phase 9 — post-V1. |
| Advanced skill progression / XP system | Phase 11 — post-V1. Skill tree nodes exist but XP is local-only. |

---

## STAGE 2: PRODUCTION LAUNCH

These are the concerns that must be resolved before Sous goes live for real users. None of these are needed for a demo or prototype.

---

### Auth (Clerk)
- [ ] Enable Clerk auth fully — `src/components/auth-provider.tsx` and `src/middleware.ts` exist but auth is not enforced on any route.
- [ ] Add login/signup flow with social providers (Google, Apple).
- [ ] Associate cook sessions with Clerk user IDs (currently local sessions use `local-${Date.now()}`).
- [ ] `cook.start` / `cook.complete` already write to DB when `ctx.userId` is present — just need auth enforced.
- [ ] Migrate localStorage sessions to DB on first login ("import your history" flow).

### Real Database (Neon Postgres + Drizzle)
- [ ] Provision a Neon Postgres database and set `DATABASE_URL`.
- [ ] Run `pnpm db:push` to apply the 7-table Drizzle schema.
- [ ] Run `pnpm db:seed` to seed the side dish and meal catalog.
- [ ] Fill in the 6 stubbed tRPC endpoints: `journey.recent`, `journey.stats`, `coach.quiz`, `coach.vibePrompt`, `content.getSideDish`, `content.search`.
- [ ] Replace localStorage-only session hooks with server-backed equivalents (localStorage can remain as optimistic cache).

### Performance
- [ ] Lazy-load the pairing engine and data files (currently bundled at build time).
- [ ] Add ISR or edge caching for the `pairing.suggest` endpoint.
- [ ] Optimize Framer Motion bundle — tree-shake unused features.
- [ ] Image optimization — switch from Unsplash URLs to Next.js `<Image>` with blur placeholders.
- [ ] Audit and reduce initial JS bundle to under 150KB gzipped (current target from `planning.md`).
- [ ] Lighthouse score ≥ 90 on mobile.

### Caching and Rate Limiting (Upstash Redis)
- [ ] Add Upstash Redis for rate limiting on AI endpoints (`recognition.identify`, `pairing.suggest`).
- [ ] Cache pairing results per main dish slug to reduce AI API costs on repeat queries.
- [ ] Cache food recognition results by image hash to avoid re-querying Vision API for the same photo.

### Image Pipeline (Cloudflare R2)
- [ ] Stand up a Cloudflare R2 bucket for food images.
- [ ] Replace Unsplash URLs with R2-hosted, culturally reviewed photography.
- [ ] Build an image upload pipeline for Win screen photos (currently `photoUri` in cook sessions is a local blob URL that doesn't persist across devices).

### Error Monitoring (Sentry)
- [ ] Add Sentry for both client and server-side error capture.
- [ ] Set up alert rules for: AI API failures, pairing engine errors, database query failures.
- [ ] Add source maps for production stack traces.

### Analytics
- [ ] Expand Vercel Analytics stub (`src/lib/analytics.ts`) with real event tracking: search submitted, pairing viewed, cook started, cook completed, evaluate opened, plate shared.
- [ ] Set up a funnel view: search → results → cook → win.
- [ ] Track feature discovery rates (how many users find Evaluate, Path, scrapbook).

### SEO
- [ ] Add `og:image` and `twitter:card` meta tags to the Today page (shareable plate preview image).
- [ ] Add structured data (Schema.org Recipe) for guided cook pages.
- [ ] Generate a sitemap for `/cook/[slug]` routes.
- [ ] Ensure all pages have unique, descriptive `<title>` and `<meta description>` tags.

### Security
- [ ] Enforce Clerk auth on all mutation tRPC endpoints in production (`publicProcedure` → `protectedProcedure` where appropriate).
- [ ] Add input sanitization and output validation on all AI endpoints (Zod schemas are defined — enforce them at the route boundary).
- [ ] Rate limit camera/recognition endpoint per user to prevent Vision API abuse.
- [ ] Review and restrict CORS policy on the tRPC API route.
- [ ] Add Content-Security-Policy headers.
- [ ] Rotate any API keys currently in `.env.local` and store in Vercel Environment Variables.

### CI/CD Pipeline
- [ ] Set up GitHub Actions: lint + test on every PR.
- [ ] Block merges to `main` if `pnpm lint` or `pnpm test` fail.
- [ ] Add Playwright E2E smoke tests to CI (requires running Vercel preview URL).
- [ ] Add automated Lighthouse CI check on PRs touching Today page or Guided Cook.
- [ ] Configure preview deployments on Vercel for all PRs.

### Accessibility
- [ ] Full WCAG 2.1 AA audit on core flows (search, results, guided cook, evaluate).
- [ ] Keyboard navigation for the quest card stack and search popout.
- [ ] Screen reader labels on all icon-only buttons.
- [ ] Verify `prefers-reduced-motion` is respected everywhere (hook exists in `src/hooks/useReducedMotion.ts`).
- [ ] Color contrast audit — the cream/stone palette needs verification at small text sizes.

### Additional Production Concerns
- [ ] **PWA / installability** — Add a web app manifest, service worker, and offline fallback for the core Today page.
- [ ] **Multi-language** — Spanish, Hindi, Tagalog are the highest-priority candidates per the PRD (Stanford patient demographics).
- [ ] **Legal disclaimers** — "Not medical advice" notice, Privacy Policy, Terms of Service pages.
- [ ] **Data retention policy** — Define and implement a policy for cook session data (user deletion, data export).
- [ ] **Clinical partner flow** (from PRD) — Clinician referral links, curated starter packs per cuisine, anonymous patient exploration tracking (opt-in).

---

## Summary

| | Stage 1 (Prototype) | Stage 2 (Production) |
|---|---|---|
| **Auth** | None (anonymous) | Clerk, enforced |
| **Data** | localStorage + static JSON | Neon Postgres, seeded |
| **AI** | Working (mock fallback) | Rate-limited, cached, monitored |
| **Images** | Unsplash URLs | Cloudflare R2 |
| **Testing** | Engine unit tests + 1 E2E smoke test | Full CI pipeline, Playwright suite |
| **Errors** | Console.warn fallbacks | Sentry, alert rules |
| **Analytics** | Vercel Analytics (basic) | Full funnel tracking |
| **Deploy** | Vercel (already live) | Vercel + hardened config |
