# TASK.md — Cursor Sprint: Sous V1 Stabilization

> **CURSOR READ THIS FIRST.** This is your complete work plan. Execute autonomously. Do not ask for permission. Do not stop to confirm. Complete all phases, run all recursive loops, then commit and push.

---

## MANDATE

You are authorized to:

- Read and modify any file in this repo
- Install npm packages without asking
- Run pnpm build, pnpm test, pnpm lint, pnpm dev without asking
- Create, modify, delete files as needed
- Commit and push to main (NOT worktree branches)
- Make autonomous architectural decisions within the constraints below

You are NOT authorized to:

- Modify CLAUDE.md critical rules 1-11 (read-only governance)
- Delete recipe data files (sides.json, meals.json)
- Change the tech stack (Next.js 15, React 19, Tailwind 4)
- Add new AI providers or external services
- Add new auth flows (Clerk stays disabled per CLAUDE.md rule 11)

---

## CORE PRINCIPLES (non-negotiable)

1. **Simplicity First** — minimum code that solves the problem. If 50 lines works, don't write 200.
2. **Surgical Changes** — touch only what the task requires. No drive-by refactors.
3. **The Sous Test** — every Today-page change must pass: "If this is the only thing the user sees, does it make them cook?"
4. **No Scroll for CTA** — primary action must be visible on 375×667 viewport without scrolling. Use `mt-auto` to pin bottom.
5. **No Invented Recipes** — guided cook steps only for existing entries in sides.json/meals.json. Never fabricate dishes.
6. **One Primary Action** — each screen has exactly one dominant CTA.
7. **Think Before Coding** — state assumptions before writing code. If ambiguous, pick the simplest interpretation and document the choice.

---

## CURRENT STATE (Sous V1 Audit — April 13, 2026)

**Infrastructure:**

- Next.js 15 App Router, React 19, Tailwind 4, Zustand, TanStack Query, tRPC
- Static data layer (sides.json, meals.json, guided-cook-steps.ts)
- Drizzle + Neon configured in package.json but **no .env files exist** — runs entirely on static JSON
- tRPC has 8 routers: ai, coach, content, cook, index, journey, pairing, recognition
- AI layer: craving-parser, food-recognition, provider (bound to keys that don't exist in env)
- Engine: pairing-engine, plate-evaluation, ranker, explainer — with real tests

**Data:**

- 203 sides, 76 meals
- 97 guided cook entries, 85 match side IDs (41% coverage), 12 orphans (no matching side)
- All imageUrl fields are null — gradient+emoji fallback everywhere (intentional per CLAUDE.md rule 11)

**Routes (existing):**

- `(today)/page.tsx` — Today (home)
- `(path)/path/page.tsx` — Path tab
- `(path)/path/favorites/page.tsx`
- `(path)/path/scrapbook/page.tsx`
- `cook/[slug]/page.tsx` — Guided cook flow
- `cook/combined/page.tsx`
- `api/heatmap/*`, `api/search/*`, `api/trpc/*`

**Routes (missing):**

- `(community)/*` — does not exist (intentional for V1 per critical rule 5)

**Components:** 63 .tsx files across 10 directories (guided-cook, heatmap, layout, path, results, search, shared, states, today, ui)

**Tech debt flags:**

- Only 1 TODO in codebase (lib/trpc/server.ts: "Re-enable Clerk auth" — intentional)
- 1 file uses `any` type — should audit
- No E2E tests despite @playwright/test in node_modules
- No .env.example for onboarding

---

## PHASE 1 — BUILD & LINT HEALTH

Must pass before anything else.

### Steps

1. `pnpm install` (if node_modules is stale)
2. `pnpm build` — capture errors and warnings
3. `pnpm lint` — capture violations
4. `pnpm test` — capture failures
5. Fix every error surgically. Commit message names the line and reason.
6. Do NOT silence warnings with `eslint-disable` unless the warning is genuinely false-positive AND you add a comment explaining why.
7. Do NOT change test expectations to make them pass — fix the code.

### Acceptance

- `pnpm build` exits 0 with zero warnings
- `pnpm lint` exits 0 with zero warnings
- `pnpm test` exits 0, all tests pass
- Commit: `chore: fix build/lint/test health (Phase 1)`

---

## PHASE 2 — TYPE SAFETY AUDIT

### Steps

1. `grep -rn ": any\|as any\|<any>" src/` — find every occurrence
2. Replace each with a proper type. If genuinely unknown, use `unknown` and narrow with a type guard.
3. `pnpm tsc --noEmit --strict` — fix every error
4. Enable `"strict": true` in tsconfig.json if not already on
5. Ensure all Zod schemas in `src/types/` export inferred types

### Acceptance

- Zero `any` in src/
- `pnpm tsc --noEmit --strict` passes
- Commit: `chore: eliminate any types, enforce strict TS (Phase 2)`

---

## PHASE 3 — GUIDED COOK DATA INTEGRITY

### Problem

97 guided cook entries exist but only 85 match side IDs. 12 entries are orphans that never render.

### Steps

1. Write `src/lib/db/validate-guided-cook.ts`:
   - Load sides.json and guided-cook-steps.ts
   - Report orphans (in guided-cook but not in sides)
   - Report missing coverage (sides without guided cook)
   - Exit 1 if any orphans
2. Add to package.json: `"validate:data": "tsx src/lib/db/validate-guided-cook.ts"`
3. Run it. For each of the 12 orphans: match by fuzzy name to an existing side and rename the key, OR delete the orphan. DO NOT invent new sides (violates CLAUDE.md rule 7).
4. Re-run — must exit 0
5. Wire into pre-build: `"build": "pnpm validate:data && next build"`

### Acceptance

- Zero orphan guided cook entries
- `pnpm validate:data` exits 0
- `pnpm build` runs validation automatically
- Commit: `fix: eliminate guided cook orphans, enforce data integrity at build (Phase 3)`

---

## PHASE 4 — NO-SCROLL NAVIGATION ENFORCEMENT

### Problem

CLAUDE.md rule 10: primary CTA must be visible on 375×667 without scrolling.

### Steps

1. Visually verify CTA placement on 375×667 viewport for:
   - `/` (Today)
   - `/path`
   - `/path/favorites`
   - `/path/scrapbook`
   - `/cook/[slug]` (pick 3 different slugs)
   - `/cook/combined`
2. For failing screens: refactor with `flex flex-col min-h-screen` + `mt-auto` on CTA container. Reduce padding, shrink content above the fold.
3. Write `tests/e2e/no-scroll.spec.ts`:
   - Set viewport to 375×667
   - Visit each primary route
   - Assert primary CTA is in viewport
4. Configure Playwright: `playwright.config.ts` with "Mobile Safari" (iPhone SE) project
5. Add to package.json: `"test:e2e": "playwright test"`

### Acceptance

- All primary screens pass 375×667 viewport rule
- `pnpm test:e2e` passes
- Commit: `feat: enforce no-scroll CTA rule with E2E tests (Phase 4)`

---

## PHASE 5 — COMPONENT CONSOLIDATION

### Steps

1. `npx knip` (install if not present — finds unused exports, files, dependencies)
2. For each flagged unused component: delete if genuinely dead, keep if feature-gated (add comment)
3. For each flagged unused dependency: remove from package.json
4. Iterate until knip output is only documented exceptions
5. Document exceptions in `knip.config.ts`

### Acceptance

- `npx knip` output is empty or only documented exceptions
- Bundle size reduced (compare pnpm build output)
- Commit: `chore: remove dead code, consolidate components (Phase 5)`

---

## PHASE 6 — 5 RECURSIVE QA LOOPS

Each loop must complete fully before the next starts. Commit after each.

### Loop 1: Feature Completeness Walk-Through

For each CLAUDE.md rule (1-11), verify in code:

- **Rule 1 (Sous Test):** Walk every component in `components/today/` — does it drive the user to cook? List each, pass/fail
- **Rule 2 (One Primary Action):** Walk every page, count dominant CTAs per screen. Must be exactly 1
- **Rule 3 (No settings pages):** Grep for `/settings`, settings components. Must be zero
- **Rule 4 (Quest shell consistency):** Every recipe render path uses Mission → Grab → Cook → Win
- **Rule 5 (Progressive interface):** Verify auth/state logic gating Path and Community
- **Rule 6 (Simplicity-first UI):** Audit decorative badges, labels, metadata — each must earn its pixel space
- **Rule 7 (No invented recipes):** Re-verify guided-cook-steps.ts has no entries outside sides.json/meals.json
- **Rule 10 (No-scroll nav):** Verified in Phase 4 (cross-reference)
- **Rule 11 (Current feature state):** Path always visible, friends below fold, coach quiz on first visit, 8 cuisines in skill tree (no kitchen sanitation), all images null, Clerk disabled

For each violation: fix it. For each pass: note it.

Output: `docs/qa-loop-1-report.md`
Commit: `test: QA Loop 1 - feature completeness (Phase 6.1)`

### Loop 2: Edge Case Testing

**Today page:**

- Empty state (no meals)
- Error state (API failure)
- Loading state (slow network)
- Very long meal name (text overflow?)
- Quest card with null imageUrl (does fallback render?)

**Search:**

- Empty query
- Only whitespace
- Special chars (emoji, accents, SQL-injection)
- 0 results
- 500+ results
- Very long query (1000+ chars)

**Guided cook flow:**

- Side with 1 step
- Side with 20+ steps
- Timer with 0 seconds
- Timer with 3600+ seconds
- Navigate away mid-cook and return
- Refresh mid-cook

**Path tab:**

- Zero cooks completed
- 100+ cooks completed
- Skill tree all unlocked / none unlocked

**Coach quiz:**

- Skip every question
- Answer every question the same
- Rapid-click through

Add tests for each edge case. Document in `docs/qa-loop-2-report.md`.
Commit: `test: QA Loop 2 - edge case coverage (Phase 6.2)`

### Loop 3: Error Identification + RCA

1. Run `pnpm dev`
2. Open DevTools Console
3. Navigate every route, interact with every CTA, complete every flow
4. Log every console.error, console.warn, React warning, hydration mismatch
5. For each: RCA (what triggered it, what code path, minimal fix)
6. Fix each at root cause (not by suppressing)

Output: `docs/qa-loop-3-report.md` with error → RCA → fix mapping
Commit: `fix: QA Loop 3 - RCA + fix console errors (Phase 6.3)`

### Loop 4: Mobile Device Testing

1. Tunnel dev server or use browser device emulation
2. Test on 3 viewports: iPhone SE (375×667), iPhone 14 Pro (393×852), Pixel 7 (412×915)
3. Verify:
   - Touch targets ≥44×44px
   - Tap highlights render correctly
   - Scroll behavior smooth
   - Keyboard doesn't cover inputs
   - Pinch-zoom disabled where appropriate
4. Fix mobile-specific bugs

Output: `docs/qa-loop-4-report.md`
Commit: `fix: QA Loop 4 - mobile device bugs (Phase 6.4)`

### Loop 5: Performance + Accessibility

1. Run Lighthouse on 3 routes (/, /path, /cook/caesar-salad)
2. Targets: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥90
3. For each miss: fix the issue
   - LCP > 2.5s → optimize images, defer non-critical JS
   - CLS > 0.1 → reserve space for dynamic content
   - a11y failures → add ARIA labels, fix color contrast
4. Run axe-core via Playwright on every route

Output: `docs/qa-loop-5-report.md`
Commit: `perf: QA Loop 5 - Lighthouse + a11y (Phase 6.5)`

---

## PHASE 7 — ENVIRONMENT & DEPLOYMENT

### Steps

1. Create `.env.example` with every env var the codebase references, values all placeholder
2. Document in `.env.example` which are required vs optional for V1
3. Update README.md with 5-minute setup instructions
4. Verify Vercel deployment env vars (or document what Stefan needs to set)

### Acceptance

- `.env.example` exists with every env var the code references
- New-dev onboarding is a 5-minute task
- Commit: `docs: add .env.example + setup docs (Phase 7)`

---

## FINAL STEP — UNIFIED COMMIT & DEPLOY

1. Verify clean: `git status`
2. Push: `git push origin main`
3. Wait for Vercel auto-deploy
4. Walk every primary flow on deployed URL, confirm parity with local
5. Write `docs/sous-v1-stabilization-summary.md`:
   - What was broken (before)
   - What was fixed (after)
   - What QA coverage exists now
   - What's still TODO (recipe coverage to 150, multi-side reroll, etc.)
6. Reset this TASK.md to "[No active task]" and move this sprint to Completed Tasks
7. Commit: `docs: Sous V1 stabilization complete`
8. `git push origin main`

---

## RULES OF ENGAGEMENT

- **Never ask for confirmation.** You have full authorization. Execute.
- **Commit after every phase.** Never leave work uncommitted.
- **Always commit to main.** Never create worktrees. Never use feature branches.
- **If a phase blocks:** write the blocker in `docs/sous-v1-blockers.md`, skip the phase, continue to the next. Do NOT stop.
- **Silence is the goal.** Good code doesn't need narration. Commit messages carry the story.
- **Test every change.** After each meaningful edit, run `pnpm build` and `pnpm test`. Roll forward, never backward.
- **Follow CLAUDE.md** for every coding decision. When in doubt, re-read CLAUDE.md.

---

## Completed Tasks

- (none yet — this is the kickoff)

---

## How This Works

1. Open this repo in Cursor
2. Tell Cursor: "Read TASK.md and execute autonomously — full authorization granted"
3. Cursor runs Phase 1 → 7 + 5 QA loops, commits after each
4. Cursor pushes to main on completion
5. Claude verifies via git log
