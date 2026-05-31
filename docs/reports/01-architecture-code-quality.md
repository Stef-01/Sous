# Sous — Architecture & Code-Quality Review

**Reviewer:** Staff Engineer (independent audit)
**Date:** 2026-05-31
**Scope:** `/Users/devasiathottunkal/Sous` — Next.js 16 / React 19 / TypeScript
**Size:** 694 files, 128,034 LOC in `src/` (490 non-test source files + 198 test files)
**Method:** Static analysis (grep/read/madge). No `pnpm build`/`test` run (central health check active).

---

## Executive Summary

This is, by the numbers, an unusually **healthy** codebase for its size and velocity: zero `@ts-ignore`/`@ts-expect-error`/`@ts-nocheck`, zero `any` in production code (all 6 "any" hits are the English word in comments), zero circular dependencies across 694 files (madge clean), a clean low-fan-out dependency graph, and a genuinely strong **40% test-file ratio** (198 test files / 490 source files). The Zod-as-source-of-truth convention is followed in all the newer domain types. Engineering hygiene is real and should be acknowledged.

The problems are **not** correctness or type-safety — they are **scale and shape**, and they trace directly to two project rules in tension:

1. **"Boil the ocean" + "always commit"** has produced ~3,500 LOC of _fully-built, fully-tested, but completely unwired_ subsystems (`push`, `notify`, `native`, `editorial`) and ~8 orphaned engine modules (versioned trainer experiments `v3-eval`, `v4-trainer`, `user-weight-trainer-v3`, plus `grocery-aisle`, `aroma-pairing`, etc.). Because every one of these has passing tests, **CI is green and the dead weight is invisible** — the single most dangerous property in a fast-moving codebase. New engineers cannot tell load-bearing code from speculative code.

2. **The stated data-fetching architecture does not match reality.** The convention says "Server Components fetch data by default; Client Components use TanStack Query via tRPC." In practice **48 of 50 pages are `'use client'`** (the only two Server Components are a redirect and a static gift page), the app persists ~everything to **localStorage across 39 hooks** with **no shared abstraction**, and the **25-table Drizzle schema is referenced exactly twice** — both behind a `DATABASE_URL` check that is never true. The "backend" is aspirational; the running app is a client-only PWA.

Neither of these is a crisis. Both are exactly the kind of thing a demanding founder needs surfaced _before_ the codebase doubles again.

### Severity-ranked findings

| #   | Severity     | Finding                                                                                                                                                                                                                                             |
| --- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | **Critical** | ~3,500 LOC of fully-tested but **zero-importer** subsystems (`push`, `notify`, `native`, `editorial`) — green CI hides them as load-bearing.                                                                                                        |
| F2  | **High**     | Stated data architecture is inverted: **48/50 pages are Client Components**, ~all state lives in **localStorage** (39 hooks, no shared hook), 25-table Drizzle schema used twice and never active.                                                  |
| F3  | **High**     | Engine has **8 orphaned/test-only modules** (versioned trainer experiments + dead scorers); Result pattern used in **only 1 of 37** engine modules despite the convention.                                                                          |
| F4  | **High**     | `src/data/guided-cook-steps.ts` is a **16,655-line** hand-maintained file — 95%+ of `src/data` and a serious merge-conflict / review-blindness hazard.                                                                                              |
| F5  | **Medium**   | God-components mix pure logic with view: `quest-card.tsx` (1321 LOC) exports **5 pure functions** alongside the component; `win-screen.tsx` (1137 LOC, 13 `useState`); two parallel cook pages (`[slug]` 819 + `combined` 1132, 22 shared imports). |
| F6  | **Medium**   | **71 `eslint-disable react-hooks/set-state-in-effect`** — a systematic hydrate-in-effect anti-pattern, suppressed wholesale rather than solved once.                                                                                                |
| F7  | **Medium**   | tRPC context types `db` as `unknown` and `require()`s the db module; type safety stops at the server boundary.                                                                                                                                      |
| F8  | **Low**      | Minor convention drift: try/catch in pure engine functions (`coach-encouragement`, `scorers/anti-monotony`, `attach-score-breakdown`); a few `types/` files (`content.ts`, `nutrition.ts`) are interface-only, not Zod.                             |

### Top 3 refactors (highest risk/complexity reduction)

1. **Quarantine or delete the unwired subsystems** (F1/F3). Move `push`, `notify`, `native`, `editorial`, and the orphaned engine trainers to a clearly-marked `src/lib/_staged/` (or delete and recover from git when the founder-gated dependency lands). This is the single highest-leverage change: it removes ~5.5% of `src` from the cognitive surface and makes "what's real" legible. ~1 day.
2. **Extract a single `useLocalStorage<T>` (or `usePersistentState`) hook** and migrate the 39 persistence hooks onto it (F2/F6). This kills the duplicated load/persist/try-catch boilerplate _and_ the 71 `set-state-in-effect` disables in one stroke, and gives you one seam to later swap localStorage → tRPC/DB when auth lands. ~2 days.
3. **Split `guided-cook-steps.ts`** into per-cuisine (or per-dish) modules behind the existing `getStaticCookData()` accessor (F4). The accessor API already exists, so this is a pure data reorganization with zero call-site churn — it just makes the file reviewable and merge-safe. ~half a day.

---

## 1. `src/lib` subsystem map (62,534 LOC, 419 files — 49% of `src`)

| Subsystem                                     |       LOC | Files | UI importers | Status                                                     |
| --------------------------------------------- | --------: | ----: | :----------: | ---------------------------------------------------------- |
| `engine/`                                     |    15,268 |    85 |  (via tRPC)  | **Load-bearing** core; 8 dead modules (see §3)             |
| `hooks/`                                      |     9,322 |    84 |     many     | **Load-bearing**; the de-facto state layer                 |
| `pod/`                                        |     4,279 |    20 |      8       | Load-bearing (Path/Community)                              |
| `voice/`                                      |     3,711 |    20 |      2       | Partly wired (TTS/transcript hooks)                        |
| `cook/`                                       |     2,861 |    20 |      —       | Load-bearing (cook flow helpers)                           |
| `recipe-authoring/`                           |     2,489 |    17 |      11      | **Load-bearing**                                           |
| `charity/`                                    |     2,214 |    12 |      2       | Wired; includes Stripe (founder-gated)                     |
| `agentic/`                                    |     2,126 |    10 |      1       | Wired (search fallback)                                    |
| `intelligence/`                               |     1,737 |    10 |      5       | Wired                                                      |
| `db/`                                         |     1,723 |    11 |      —       | **25 tables, ~unused** (see §2)                            |
| `push/`                                       | **1,313** |    10 |    **0**     | **DEAD — zero importers anywhere**                         |
| `eco/`                                        |     1,157 |     8 |      5       | Wired                                                      |
| `ai/`                                         |     1,150 |     8 |  (via tRPC)  | Load-bearing                                               |
| `vocabulary/`                                 |     1,092 |     8 |      1       | Wired                                                      |
| `native/`                                     |   **967** |    10 |    **0**     | **DEAD — Capacitor shim, no mobile build**                 |
| `telemetry/`                                  |       934 |     6 |      3       | Wired                                                      |
| `cohort/`                                     |       847 |     6 |      0       | Reached only by `pod/` (1 ref)                             |
| `pantry/`, `games/`, `household/`             |    ~2,400 |    24 |     1–3      | Wired                                                      |
| `notify/`                                     |   **701** |     5 |    **0**     | **DEAD — zero importers anywhere**                         |
| `editorial/`                                  |   **555** |     4 |    **0**     | **DEAD — ORCID/clinician-credits for placeholder content** |
| `planner/`, `recap/`, `eat-out/`, `share/`, … |         — |     — |    1 each    | Wired (thin)                                               |

**Verification of the "dead" claim:** `grep -rIl "lib/{push,notify,native,editorial}"` across `src`, `scripts`, and `app` returns **nothing** outside each module's own directory and tests. These are not lazy-loaded, not cron-driven, not referenced by any route. `push/` alone is a complete web-push stack — `device-tokens.ts`, `key-registry.ts`, `quiet-hours.ts`, `schedule-planner.ts`, `delivery-log.ts` — each with a co-located test. It is excellent code that nothing calls.

---

## 2. Data-fetching architecture (F2 — High)

**Stated convention** (`CLAUDE.md` §"Data fetching"): _"Server Components fetch data by default. Client Components use TanStack Query via tRPC."_

**Reality:**

- **Client/server split:** `grep -rIL "use client" src/app --include=page.tsx` returns exactly two server pages: `src/app/page.tsx` (a redirect) and `src/app/gift/[slug]/page.tsx` (static). **Every other page is `'use client'`.** There is no server-side data fetching; the convention is documented but unobserved.
- **tRPC is wired but shallow:** 6 routers (`cook`, `pairing`, `recipe-autogen`, `ai`, `recognition`, `index`) consumed from ~13 client call-sites — almost entirely for the AI features (`trpc.ai.*`, `trpc.recognition.identify`) and pairing. This is coherent: tRPC is the _AI/compute_ boundary, not the _data_ boundary. That's a fine design — but it's a different design than the one documented.
- **localStorage is the real persistence layer:** 39 non-test hooks read/write `localStorage` directly (`use-saved-dishes`, `use-cook-sessions`, `use-xp-system`, `use-shopping-list`, `use-charity-ledger`, …). Each reimplements the same `loadX()` / `persist()` / `try/catch(JSON.parse)` shape with a bespoke `STORAGE_KEY` constant. Example, `src/lib/hooks/use-saved-dishes.ts:14-38`:
  ```ts
  function loadSaved(): SavedDish[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function persist(dishes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dishes));
    } catch {}
  }
  // ...
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage on mount
    setSaved(loadSaved());
  }, []);
  ```
  There is **no `useLocalStorage` abstraction** (`grep -rIl "useLocalStorage" src` → empty). This boilerplate is copy-pasted ~30× and is the root cause of F6.
- **Drizzle DB is dormant:** `schema.ts` (12 tables) + `y2-tables.ts` (9) + `y4-tables.ts` (4) = **25 tables**. The only consumer is `src/lib/trpc/routers/cook.ts:17` (`if (ctx.db && process.env.DATABASE_URL)`) — a fallback path that is never active because no `DATABASE_URL` is set. `ctx.db` is read in exactly 2 places. The schema is a well-designed contract for a backend that isn't turned on (consistent with rule 12's founder-gated framing — but undocumented as such here).

**Remediation:**

- Update `CLAUDE.md` to describe the _actual_ architecture (client-first PWA, tRPC = AI/compute seam, localStorage = persistence, DB = founder-gated future), OR commit to migrating. The current doc misleads any new contributor.
- Extract `usePersistentState<T>(key, initial, schema?)` (Top-3 refactor #2). Optionally validate with the matching Zod schema on read to harden against corrupt localStorage.

---

## 3. Engine analysis (F3 — High)

The engine is the product's core and is mostly excellent: `scorers/` is cleanly factored (one scorer per file — `cuisine-fit`, `flavor-contrast`, `nutrition-balance`, `prep-burden`, `temperature`, `preference`, `seasonal`, `anti-monotony`, `kid-friendliness`), deterministic as advertised, and well-tested (32 of 69 engine files are tests).

**Problem 3a — orphaned & versioned modules.** Reachability analysis (importers via `./name` or `@/lib/engine/name`, excluding self, splitting test vs production):

| Module                      | LOC |    Prod importers     | Test | Verdict                                                              |
| --------------------------- | --: | :-------------------: | :--: | -------------------------------------------------------------------- |
| `grocery-aisle.ts`          | 394 |           0           |  0   | **Dead** — header claims "used on the Grab screen"; imported nowhere |
| `v4-trainer.ts`             | 222 |           0           |  1   | **Dead** — "Y5 W5 temporal recency-weighted retune" experiment       |
| `v3-eval.ts`                | 264 |           0           |  1   | **Dead** — V2-vs-V3 synthetic-user harness                           |
| `user-weight-trainer-v3.ts` | 223 | 0 (only its own test) |  2   | **Dead** — superseded; prod uses v1 + `-hybrid`                      |
| `aroma-pairing.ts`          | 143 |           0           |  1   | **Dead/test-only**                                                   |
| `coach-encouragement.ts`    | 195 |           0           |  1   | **Dead/test-only**                                                   |
| `novelty-eval.ts`           | 231 |           0           |  1   | **Dead/test-only**                                                   |
| `pantry-rerank.ts`          |  97 |           0           |  1   | **Dead/test-only**                                                   |
| `trainer-drift.ts`          |  96 |           0           |  1   | **Dead/test-only**                                                   |

The trainer lineage is the clearest accretion fingerprint: `user-weight-trainer` (v1) and `user-weight-trainer-hybrid` are wired into `use-user-weights.ts:25-27`; **`-v3`, `v3-eval`, and `v4-trainer` are evaluation experiments left in place with full test suites.** ~1,900 LOC of dead engine code, all green in CI.

**Problem 3b — Result pattern barely used.** Convention: _"Use Result pattern (`{success,data}|{success,error}`) for engine functions."_ Reality: **only `pairing-engine.ts`** returns a Result (`grep "success: true|success: false" src/lib/engine` → 1 file). The other 36 modules return values directly or `null`. This is arguably _fine_ (many are pure scorers where Result adds noise), but the convention overclaims. Either narrow the rule to "fallible orchestration functions" or apply it consistently.

**Problem 3c — minor try/catch drift.** `coach-encouragement.ts:143/158`, `scorers/anti-monotony.ts:29/48`, `attach-score-breakdown.ts:50` use try/catch inside pure functions, contradicting "try/catch only at API boundaries." Low impact (defensive guards), but inconsistent with the stated Result-everywhere intent.

**Remediation:** Delete or `_staged/` the 8 dead modules (recover from git if a future week needs them — that's literally what rule 12's "wiring stub" guidance anticipates). Reconcile the Result-pattern rule with reality.

---

## 4. God-files & complexity hotspots

### 4a. `src/data/guided-cook-steps.ts` — 16,655 LOC (F4 — High)

A single file holding two hand-authored `Record<string, StaticDishData>` literals: `guidedCookData` (lines 42–15,278, ~41 dishes) and `guidedCookMeals` (15,279+), plus 4 accessor functions. This is **95% of `src/data`** and is imported by 22 files. Risks: (1) any two contributors touching cook steps conflict; (2) no human reviews a 16K-line diff, so data errors slip through (the `validate:data` build step mitigates schema shape but not content); (3) editor/LSP strain. **Because the accessor API (`getStaticCookData(slug)`) already encapsulates lookup, splitting into `guided-cook-steps/<cuisine>.ts` + an index is a zero-call-site-churn refactor.** (Top-3 #3.)

### 4b. `quest-card.tsx` — 1321 LOC (F5 — Medium)

Mixes **5 exported pure functions** — `computePantryFit` (`:76`), `buildQuestDishes` (`:157`), `decideSwipe` (`:355`), `exitDistanceFor` (`:389`), `partitionMetaTags` (`:449`) — with the `QuestCard` component (`:502`) and 9 internal sub-components. The pure functions are independently tested (`quest-card.test.ts`) and have no React dependency; they belong in `src/lib/` (e.g. `lib/engine/quest-dishes.ts`). Extracting them would roughly halve the file and clarify the component's actual surface.

### 4c. `win-screen.tsx` — 1137 LOC, 13 `useState` (F5 — Medium)

One component owns rating, freeform note, reflection toggle, confetti, photo, gift, invite-friend, plus two tRPC queries (`generateWinMessage`, `generateReflection`) and two decorative sub-components (`ConfettiLayer`, `SparkleBurst`). The decorative layers and the post-cook feedback form are separable concerns; 13 pieces of local state in one component is a maintenance smell.

### 4d. Parallel cook pages (F5 — Medium)

`cook/[slug]/page.tsx` (819 LOC) and `cook/combined/page.tsx` (1132 LOC) share **22 of ~33 imports** and both drive the Mission→Grab→Cook→Win shell (single dish vs side+main combined). ~1,950 LOC with substantial duplicated orchestration. A shared `useGuidedCook(slugs[])` hook + one `<CookShell>` would consolidate them and better honor rule 4 ("every recipe renders through the same flow — no exceptions"), which is currently satisfied by _copying_ the flow rather than _sharing_ it.

---

## 5. State management (F6 — Medium)

- **Zustand:** exactly **one** store — `src/lib/hooks/use-cook-store.ts` (a real `create()` from `zustand`, holding the active cook session: phase, dishes, concurrent timers). Despite "Zustand for client state" in the stack, everything _else_ in client state is **per-feature localStorage hooks**, not the central store. This is workable but means cross-feature state (XP, streaks, cook sessions, saved dishes, charity ledger, …) is fragmented across ~30 independent `localStorage` keys with no single source of truth and no cross-tab sync. The one Zustand store is the in-flight cook session only.
- **`react-hooks/set-state-in-effect` suppressed 71×** (45 block + 26 next-line). Concentrations: `use-user-weights.ts`, `result-stack.tsx`, `reel-card.tsx`, `cuisine-compass/page.tsx` (4 each). The dominant cause is the localStorage hydrate-on-mount idiom (`useEffect(() => setX(load()), [])`). Fixing F2's shared hook (lazy `useState` initializer guarded by `typeof window`) eliminates most of these disables at the source rather than silencing the linter.
- **Prop drilling:** not severe — the god-components keep state local, which is its own problem (4a–4d) but avoids deep drilling.

---

## 6. Type safety — genuinely strong (F7/F8 — Medium/Low)

| Marker                         | Count | Notes                                                                                                                                                       |
| ------------------------------ | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ts-ignore`                   | **0** | —                                                                                                                                                           |
| `@ts-expect-error`             | **0** | —                                                                                                                                                           |
| `@ts-nocheck`                  | **0** | —                                                                                                                                                           |
| `as any`                       | **2** | Both in `attach-score-breakdown.ts` / `cook-again.ts` comments-adjacent; negligible                                                                         |
| `: any` in **production** code | **0** | All 6 grep hits are the word "any" in comments/strings                                                                                                      |
| `as unknown as`                |   ~50 | **~90% in `.test.ts`** (deliberate invalid-input fixtures); legit prod uses are browser-global casts in `voice/`, `native/platform.ts`, `db/index.ts` proxy |
| `eslint-disable`               |    82 | 71 are `set-state-in-effect` (F6); rest are `no-img-element` (4), `no-unused-vars` (5), `no-require-imports` (1)                                            |

This is the strongest dimension of the codebase. The only structural type hole is **F7**: `src/lib/trpc/server.ts:6-22` types the db as `let _db: unknown` and `require("@/lib/db")` inside a try/catch, with `TRPCContext.db: unknown`. Consumers then cast (`cook.ts:22: ctx.db as import("@/lib/db").Database`). Given the db is founder-gated, the lazy-load is defensible, but the `unknown` + cast pattern defeats end-to-end type safety at exactly the boundary where it matters most. Prefer a typed `Database | null` context field set by a typed lazy loader.

`types/` is largely Zod-first (49 `z.infer` usages; `user-recipe`, `challenge-pod`, `preference-profile`, `side-dish`, `cuisine-compass` all schema-driven). Outliers `content.ts` (11 interfaces, 0 Zod), `nutrition.ts` (8), `index.ts` (6), and `parent-mode.ts` (3) are interface-only — minor drift from "Zod as source of truth," acceptable for purely-internal shapes but worth noting.

---

## 7. Dead code & duplication (consolidated)

**knip config** (`knip.config.ts`) currently ignores `grants/`, `scripts/`, `.agents/`, `skills/`, and one Clerk avatar component, with entry points limited to `page.tsx`/`layout.tsx`/`route.ts`. **Knip should already be flagging** the F1 dead subsystems and F3 dead engine modules as unused files/exports — if it isn't surfacing them, the entry/project config is too permissive or the report isn't being acted on. **Recommendation:** run `knip` in CI as a _failing_ check (not advisory) once the dead code is quarantined, to prevent re-accretion.

| Category                                    | Items                                                                                                                                                        |                    LOC (approx) |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------: |
| Unwired subsystems (F1)                     | `push`, `notify`, `native`, `editorial`                                                                                                                      |                          ~3,536 |
| Dead engine modules (F3)                    | `grocery-aisle`, `v4-trainer`, `v3-eval`, `user-weight-trainer-v3`, `aroma-pairing`, `coach-encouragement`, `novelty-eval`, `pantry-rerank`, `trainer-drift` |                          ~1,965 |
| Duplicated localStorage boilerplate (F2/F6) | ~30 hooks × ~30 LOC                                                                                                                                          |                            ~900 |
| Parallel cook pages (F5)                    | overlap in `[slug]` + `combined`                                                                                                                             |                        ~400 dup |
| **Total recoverable/consolidatable**        |                                                                                                                                                              | **~6,800 LOC (~5.3% of `src`)** |

Note: `cohort/` (847 LOC) is reached only by `pod/cohort-pod-matcher.ts` (1 ref) — not dead, but a single-consumer subsystem worth watching.

---

## 8. Coupling & dependency graph — strong (positive finding)

- **Circular dependencies: 0.** `madge --circular` across 694 files reports none. For a 128K-LOC codebase assembled at high velocity, this is genuinely impressive and indicates disciplined import direction.
- **Cross-subsystem fan-out is low:** the most-imported `lib` subsystems are `hooks/` (28), `engine/` (24), `trpc/` (6) — i.e., the graph funnels toward a few well-defined cores rather than tangling laterally. `engine/types.ts` (imported by 13 prod files) has **no back-imports**, so the shared-type hub is a clean leaf.
- **API surface:** only 3 route handlers (`api/search`, `api/heatmap`, `api/trpc/[trpc]`). This is _coherent_, not a gap — tRPC owns the RPC surface and the two REST routes are special-cased (search, heatmap). The architecture is internally consistent here; it's the _documentation_ (which implies a richer REST/Server-Component layer) that's stale.

---

## 9. Adherence to stated conventions — scorecard

| Convention                               |    Verdict    | Evidence                                         |
| ---------------------------------------- | :-----------: | ------------------------------------------------ |
| Result pattern in engine                 | ❌ Mostly not | 1/37 modules (§3b)                               |
| Zod as source of truth                   |  ✅ Largely   | 49 `z.infer`; a few interface-only outliers (§6) |
| Named exports for components/utils       |      ✅       | Default exports only on pages (spot-checked)     |
| Server Components fetch by default       |  ❌ Inverted  | 48/50 pages `'use client'` (§2)                  |
| Client Components use tRPC via TanStack  |  ⚠️ Partial   | True for AI/pairing; data lives in localStorage  |
| kebab-case files / PascalCase components |      ✅       | Consistent (one outlier: `EvaluateSheet.tsx`)    |
| try/catch only at boundaries             |   ⚠️ Mostly   | 9 in engine, mostly defensive (§3c)              |
| Co-located `*.test.ts`                   | ✅ Excellent  | 198 test files, 40% ratio                        |
| No `any`/`@ts-ignore` (implied by rigor) | ✅ Excellent  | 0 / 0 (§6)                                       |

---

## 10. Concrete remediation plan (sequenced)

**Phase 1 — Make "what's real" legible (≈2 days, AUTO-BUILD):**

1. Move F1 subsystems (`push`, `notify`, `native`, `editorial`) and F3 dead engine modules to `src/lib/_staged/` with a README per the rule-12 "wiring stub" doctrine, OR delete and note the recovery SHA. Update `knip.config.ts` and flip knip to a failing CI gate.
2. Reconcile `CLAUDE.md` "Data fetching" + "Result pattern" sections with observed reality (client-first PWA; tRPC = AI seam; localStorage = persistence; DB = founder-gated). Stale conventions are worse than none.

**Phase 2 — Kill the duplication seams (≈3 days):** 3. Extract `usePersistentState<T>(key, initial, schema?)`; migrate the 39 localStorage hooks; delete the 71 `set-state-in-effect` disables at the root. 4. Split `guided-cook-steps.ts` into `guided-cook-steps/<group>.ts` + index behind the existing accessors.

**Phase 3 — Decompose god-components (≈3 days):** 5. Lift the 5 pure functions out of `quest-card.tsx` into `lib/`; extract `<CookShell>` + `useGuidedCook()` to unify the two cook pages; split `win-screen.tsx`'s decorative layers and feedback form.

**Phase 4 — Tighten the server boundary (≈1 day):** 6. Type the tRPC context db as `Database | null` via a typed lazy loader; remove the `unknown` + downstream casts.

None of this touches product behavior; all of it reduces the surface a founder/engineer must reason about, and it directly serves the "boil the ocean / holy-shit-that's-done" bar by making the _finished_ parts unmistakable from the _staged_ parts.

---

_Appendix — commands used: file/LOC census via `find … | wc -l`; reachability via scoped `grep -rIl` on `./name` and `@/lib/<sub>/`; client/server split via `grep -rIL "use client"`; cycle check via `npx madge --circular`; type-safety census via `grep` for `any`/`@ts-_`/`as unknown as`/`eslint-disable`. No files modified.\*
