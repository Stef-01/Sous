# Sous — Critical Analysis: Executive Summary

**Date:** 2026-05-31
**Method:** 7 parallel specialist review agents (architecture, security, product/strategy, test, UX/design, data/engine, build/devex), each producing a standalone report in this folder. Findings below are synthesized, de-duplicated, and cross-verified between agents.
**Ground-truth health snapshot (this commit):** `typecheck` ✓ · `lint` ✓ (0 errors, 2 cosmetic warnings) · `vitest` ✓ **3030 tests / 199 files pass (12s)** · `next build` ✓ (41 prerendered routes, ~24s).

> Tooling note: this analysis was produced alongside a setup of Garry Tan's **gstack** (55 Claude Code engineering-role skills, installed to `~/.claude/skills/gstack`) and Andrej Karpathy's **autoresearch** loop (ported to Apple Silicon / MPS and run to a real baseline — see `~/code/karpathy-autoresearch/SETUP-NOTES-APPLE-SILICON.md`). The review methodology mirrors gstack's `/review`, `/cso`, and `/plan-*-review` roles applied across the whole codebase.

---

## The one-paragraph verdict

**Sous is an impressively engineered application that has lost the plot.** The code itself is healthy on the axes that usually rot at this scale — zero `any`/`@ts-ignore` in production, no circular dependencies across ~688 files, 3030 green tests, a clean build. But green CI is hiding three deeper problems that no test will ever catch: **(1)** the product has become the exact thing its own constitution forbids — a 43-route feature kitchen-sink (map game, cooking pods, eco dashboard, charity payments, planner, eat-out, content magazine) instead of "one screen, one action, one win"; **(2)** the project no longer knows which product it is — `STRATEGY.md` describes _Sous_ (a habit app for anxious home cooks) while `PRD.md` describes _NOURISH_ (a Stanford diabetes/ADA-plate clinical tool), and the build faithfully shipped _neither_; and **(3)** it is demo-grade masquerading as launch-ready — auth is bypassed at three layers, AI endpoints are public and unthrottled, rate-limiting is documented but does not exist, and the one genuinely defensible asset (the pairing engine + guided-cook content) is starved at **9% meal coverage** while energy went to off-thesis surfaces. The "BOIL THE OCEAN + always commit" ethos in `CLAUDE.md` has overridden the five simplicity rules in the _same file_, and the rule-8 strategy gate that was supposed to prevent this has been dead since April.

---

## Six cross-cutting themes

1. **Green CI masks the real risks.** 3030 passing tests, clean typecheck/lint/build. Yet beneath it: ~3,536 LOC of fully-built, fully-tested, **zero-importer** subsystems (`lib/push`, `native`, `notify`, `editorial`); the entire `src/lib/ai/` layer untested; no React rendering tests at all; the Win screen never reached by any test. "Tested" and "wired/working" have drifted apart. _(Reports 01, 04)_

2. **The simplicity constitution was overridden by the build-everything ethos.** `CLAUDE.md` spends 5 of 11 critical rules defending minimalism (rules 1, 2, 3, 6, 10). The shipped app violates the spirit of all five by accretion. The override came from the same file's "BOIL THE OCEAN" directive plus a `daily-feature-ideas-*.md` FOMO loop. _(Reports 03, 05)_

3. **Product identity fork.** Two constitutions, two users, two north-star metrics, one codebase — and the build matches neither. "NOURISH" appears **0×** in source (only as CSS color tokens). The pitch deck would describe a clinical tool; the demo shows a cooking arcade. _(Report 03)_

4. **Demo-grade, not launch-grade — and the gap is entirely unwired.** Auth bypassed (`proxy.ts` no-op middleware + hard-coded `MOCK_USER_ID` + `protectedProcedure` used by zero procedures); no per-user authorization; public unbounded AI/Vision endpoints; rate-limiting and "AI cost tracking" are fictional (no `@upstash/*` dependency, no limiter code); `next@16.1.6` carries HIGH-severity advisories including a middleware/proxy-bypass that undermines the very layer auth will depend on. The `FOUNDER-UNLOCK-RUNBOOK` must **not** be executed before these close. _(Report 02)_

5. **The actual moat is starved.** The defensible asset is the curated pairing engine + guided-cook content. Reality: **7/76 meals (9.2%)** and 126/205 sides have a real Mission→Grab→Cook→Win flow; **52.7% of catalog entities dead-end** at "Cook steps coming soon." Two of six engine dimensions (prep-burden, nutrition) are fed hard-coded constants, so they contribute zero ranking signal. The compounding asset was frozen while pods/eco/charity/maps were built. _(Reports 03, 06)_

6. **Release-engineering fragility & doc drift.** Dual lockfiles (`package-lock.json` stale 7 weeks + authoritative `pnpm-lock.yaml`, no `packageManager` field) → "works locally, breaks in prod." **No CI** (`verify` is local-only; workflow is commit-straight-to-main). A **1.2 GB stranded git worktree**. `CLAUDE.md` says Next 15 / Neon / Upstash / R2; reality is Next 16 / Supabase / none-of-those-installed. _(Report 07)_

---

## Consolidated findings register

Severity = combined likelihood × blast radius. "Report" links to the detail file in this folder.

### 🔴 Critical — fix before any external demo or launch

| #   | Finding                                                                                                                                                                                                                  | Evidence                                                                                                                          | Report |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------ |
| C1  | **Auth fully bypassed at 3 layers; no per-user authz.** Open API the moment a DB write lands under the shared mock identity (IDOR).                                                                                      | `src/proxy.ts:10` no-op; `src/lib/trpc/server.ts:41` hard-codes `MOCK_USER_ID`; `protectedProcedure` (`:53`) used by 0 procedures | 02     |
| C2  | **Public, unthrottled, unbounded AI/Vision/craving endpoints.** Anonymous cost-DoS / quota exhaustion once keys are live. Rate limiting & cost tracking are documented but **do not exist** (no `@upstash/*` installed). | `ai.ts` (7 procs), `recognition.ts:7` (`imageBase64` uncapped), `pairing.ts:128`                                                  | 02     |
| C3  | **Product identity fork: Sous (STRATEGY.md) vs NOURISH (PRD.md).** Build matches neither; un-pitchable as a coherent product.                                                                                            | "NOURISH" 0× in source; PRD clinical product unbuilt                                                                              | 03     |
| C4  | **Live Stripe charge path in a no-auth, no-users prototype.** Off-thesis financial/regulatory surface. _(Caveat: verify whether live keys are wired; the code path itself POSTs to `api.stripe.com`.)_                   | `src/lib/charity/stripe-charge.ts`                                                                                                | 03     |
| C5  | **~3,536 LOC of dead, unwired-but-tested subsystems** + ~1,965 LOC orphaned engine modules. Green tests render them invisible as non-load-bearing.                                                                       | `lib/push` (1313), `native` (967), `notify` (701), `editorial` (555); engine `v3-eval`/`v4-trainer`/`grocery-aisle`               | 01     |
| C6  | **Dual lockfiles + no CI.** Highest-probability path to a broken production deploy.                                                                                                                                      | `package-lock.json` (stale 2026-04-04) + `pnpm-lock.yaml`; no `.github/workflows/`                                                | 07     |

### 🟠 High

| #   | Finding                                                                                                                                                                                                                                                | Evidence                                                 | Report |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ------ |
| H1  | **The rule-8 strategy gate is dead.** Decision log frozen at April 2026; `pod/eco/charity/parent-mode/eat-out/cohort/leaderboard` → 0 matches in STRATEGY.md, yet all shipped through "Year 5."                                                        | STRATEGY.md decision log                                 | 03     |
| H2  | **Today page fails the Sous Test by accretion.** Up to 13 stacked sections; ~9 conditional chips render _above_ the QuestCard hero, burying the one primary action for an engaged user.                                                                | `app/(today)/today/page.tsx`, `today/*`                  | 03, 05 |
| H3  | **Rule 10 (no-scroll) hard breach.** Card stack `minHeight: 460` pushes the discoverable "Start cooking" CTA below the fold at 375×667 — the code's own comment admits it.                                                                             | `quest-card.tsx:811-812`                                 | 05     |
| H4  | **`src/lib/ai/` entirely untested** (incl. `buildFallbackIntent`, the default no-API-key search path); **zero React rendering tests** (RTL imported in 0 files, `*.test.tsx` excluded from the Vitest glob); **Win screen never reached by any test**. | `src/lib/ai/*`, vitest config                            | 04     |
| H5  | **Moat starved:** 9.2% meal guided-cook coverage; 2/6 engine dimensions fed dead constants (prep-burden const 0.8, nutrition null).                                                                                                                    | `validate-guided-cook` coverage; live engine inputs      | 06, 03 |
| H6  | **Inverted data architecture.** 48/50 pages are `'use client'`; 25-table Drizzle schema referenced twice behind a `DATABASE_URL` check that's never true; primary persistence is localStorage across 39 ad-hoc hooks.                                  | `src/app/**`, `src/lib/db`                               | 01     |
| H7  | **Rule 3 breach:** Profile sheet has grown to 8 sections / 7 toggles (Eco, Preferences editor, Voice, Visual, Demo reset…) with no written rule-3 amendment.                                                                                           | owl→Profile sheet                                        | 05     |
| H8  | **Reduced-motion is partially fake.** 47 files call `useReducedMotion()` then `void` it while running unconditional Framer motion that bypasses the CSS `prefers-reduced-motion` gate. "100% cleared" claim is misleading.                             | `cook-again-chip.tsx`, `result-stack.tsx`, `tab-bar.tsx` | 05     |
| H9  | **`next@16.1.6` HIGH advisories** (middleware/proxy bypass, Server-Actions CSRF, SSRF, DoS) + 7 known CVEs in `picomatch`/`postcss`.                                                                                                                   | `npm audit`                                              | 02, 07 |
| H10 | **1.2 GB stranded worktree** (`.claude/worktrees/vibrant-neumann-6cff74`) duplicating `docs/` + 671 MB `node_modules` (0 divergence — safe to remove).                                                                                                 | `git worktree list`                                      | 07     |

### 🟡 Medium (selected)

- **`src/data/guided-cook-steps.ts` is 16,655 lines** (95% of `src/data`) — merge-conflict & review-blindness hazard; split behind its existing accessor. _(01, 06)_
- **Seasonal scorer reads wall-clock** (`seasonal.ts:17` `new Date()`) → score breakdown non-reproducible across season boundaries (bounded ±0.014). A real correctness nit in a "deterministic" engine. _(06, 04)_
- **Result pattern used in 1/37 engine modules** despite being the documented convention; **71 `eslint-disable react-hooks/set-state-in-effect`** suppressing the localStorage hydrate-in-effect anti-pattern wholesale. _(01)_
- **`validate-guided-cook.ts` only checks orphan keys, not step structure** — an empty/malformed `steps[]` passes the build and dead-ends Cook at runtime; no Zod schema for steps. _(04, 06)_
- **Doc/reality drift:** Next 15→**16.1.6**, Neon→**Supabase**, Upstash Redis + Cloudflare R2 + Sentry documented but **not installed/inert**. _(07)_
- **No coverage thresholds**; tRPC routers + `/api` handlers untested; **knip configured but not enforced**. _(04, 07)_
- **Planning theater:** 124–175 tracked markdown docs incl. a fictional Year-1→7 timeline + "retrospectives" all authored within a single ~3-month git window; no canonical index. _(03, 07)_
- **God-components & forks:** `quest-card.tsx` (1321), `win-screen.tsx` (1137, 13 `useState`), two parallel cook pages (`[slug]` 819 + `combined` 1132, 22 shared imports). _(01)_
- **AA contrast failures** on 10–11px subtext at `/70`–`/80` opacity (~2.9:1); **design-system token layer (`styles/tokens.ts`) is dead code** (0 consumers). _(05)_

---

## Cross-agent reconciliations (where first-pass findings were corrected)

Rigor note — three findings were revised after a second agent verified them, which is exactly why independent verification matters:

1. **"Engine scores only 14 of 93 mains / uses `Math.random`"** (raised by the strategy agent) → the data/engine agent traced this to **dead legacy code** (`pairingEngine.ts`, no front-end consumer). The **live** engine (`pairing-engine.ts` → `ranker.ts`, used by Today) is **deterministic** and was empirically confirmed byte-identical across two same-process calls; 956/956 pairing references resolve (100% integrity). The dead module should be deleted, but the live path is sound.
2. **"Duplicated docs"** (strategy agent) → confirmed by devex agent as the **1.2 GB stranded worktree** (H10), not a source-tree duplication.
3. **"Today fails the Sous Test"** → reconciled: it **passes cold-start** (clean hero) but **degrades toward failure** as conditional chips accrete for an engaged user. Both agents agree on the mechanism (accretion), differ only on framing.

Referential integrity, image provenance, and **Rule 7 (no invented recipes/images)** were all verified **clean** (0 missing/orphan images; compass dishes + Stanford content carry real source attribution).

---

## What to actually do — prioritized

**If you fix only five things (in order):**

1. **Make the founder call: Sous _or_ NOURISH.** Everything downstream — cut-list, metric, roadmap — depends on this one decision. Right now the project is paying to build two products and shipping a third. _(C3, H1)_
2. **Wire auth before any external exposure, or gate the demo to read-only.** Restore `clerkMiddleware`, move user routes to `protectedProcedure`, add owner checks. Do **not** run the FOUNDER-UNLOCK-RUNBOOK first. _(C1)_
3. **Cap and throttle the AI surface.** Add real rate limiting (install the `@upstash/*` the docs already claim), input-length caps on free-text + `imageBase64`, and per-key cost ceilings — _before_ live keys. Remove or feature-flag the live Stripe path. _(C2, C4)_
4. **Quarantine the dead weight & fix the deploy path.** Delete the npm lockfile + pin `packageManager`; add a 30-line CI running `pnpm install --frozen-lockfile && pnpm verify`; move the 3,536 LOC of unwired subsystems + orphaned engine modules to `_staged/` (or delete) and make `knip` a failing gate; `git worktree remove` the 1.2 GB stray. _(C5, C6, H10)_
5. **Feed the moat.** Push guided-cook coverage from 9% toward the strategy's stated threshold; un-stub the prep-burden + nutrition engine inputs so all 6 dimensions actually discriminate. _(H5)_

**30/60/90 framing:**

- **30 days (stop the bleeding):** decisions #1–#4 above + revive the rule-8 gate (one decision log, kill the daily-FOMO loop). Collapse 124+ planning docs to three (one strategy, one real-calendar roadmap, one decision log).
- **60 days (re-earn the thesis):** move the Today chip cluster below the hero + cap card height (one edit closes H2 + H3); make reduced-motion real; add the 5 missing high-value tests (AI fallback, engine determinism w/ injected clock, Win-screen e2e, guided-cook structural validation, first RTL render).
- **90 days (compound):** subtract the off-thesis arcade (map game + `maplibre-gl`, eco dashboard, eat-out, charity) per the decision in #1; invest the reclaimed surface area into content + engine depth.

---

## What is genuinely strong — defend these

- **The Guided-Cook flow** (`step-card`, `win-screen`, `ingredient-list`) is a clean, model-quality Mission→Grab→Cook→Win machine with textbook rule-2 button hierarchy and a correct `min-h-[calc(100dvh-160px)]` + `mt-auto` no-scroll pattern. Rule 4 (quest-shell consistency) is fully honored.
- **Engineering fundamentals:** no `any`/`@ts-ignore`, no circular deps, clean import graph, 40% test-file ratio with near-zero mocking and zero snapshot/tautological tests — high-quality _where tests exist_.
- **The live recommendation engine is deterministic and referentially clean** (100% pairing integrity, build-gated orphan check).
- **Security honesty:** no hardcoded secrets, no SQL injection, no XSS sink, all `NEXT_PUBLIC_` vars legitimately public, env files gitignored — this is an honest demo build, not a sloppy one.

---

## Detail reports in this folder

| File                               | Dimension                   | Headline                                                                                  |
| ---------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------- |
| `01-architecture-code-quality.md`  | Architecture & code quality | Healthy core; ~3,536 LOC dead unwired subsystems hidden by green tests                    |
| `02-security-review.md`            | Security (OWASP + STRIDE)   | Auth bypassed at 3 layers; AI endpoints open; rate-limiting fictional; Next 16 advisories |
| `03-product-strategy-alignment.md` | Product & strategy          | Sous-vs-NOURISH identity fork; dead strategy gate; off-thesis sprawl                      |
| `04-test-coverage-quality.md`      | Tests                       | Deep where cheap, shallow where risky; AI + Win screen + rendering untested               |
| `05-ux-design-simplicity.md`       | UX & design rules           | Rule 10 & rule 3 breached; Today degrades by accretion; reduced-motion partly fake        |
| `06-data-integrity-engine.md`      | Data & engine               | Catalog clean & deterministic; 9.2% meal cook-flow coverage; 2 dead engine dimensions     |
| `07-build-devex-dependencies.md`   | Build & DevEx               | Build green; dual lockfiles + no CI + 1.2 GB stray worktree; doc/reality drift            |
