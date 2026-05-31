# 04 — Test Coverage & Quality Review

**Reviewer role:** QA Lead
**Date:** 2026-05-31
**Scope:** Unit (Vitest) + E2E (Playwright) coverage and quality across ~490 source modules / ~128K LOC.
**Method:** Static read/grep only. `pnpm test` / `pnpm build` deliberately NOT run (central health run in progress).

---

## Verdict (TL;DR)

**Coverage is deep where it's cheap and shallow where it's risky.** The pure-logic layer (`src/lib/engine`, most of `src/lib/*`) is genuinely well-tested with high-quality behavioral tests. But the strategy is **"extract helpers, test helpers"** taken to its limit, which leaves three structural holes:

1. **Zero React rendering tests.** `@testing-library/react` is a dependency but is imported in **0** test files; `render()` and `renderHook()` appear **0** times. The Vitest environment is `node` and there is **no jsdom/happy-dom installed**. Every component's JSX, conditional rendering, event wiring, and a11y attributes are unverified except by the 9 Playwright specs.
2. **The Win screen — the "W" in Mission→Grab→Cook→Win — is never reached by any test.** The core-loop E2E stops at "advance one cook step" and the code comment says full win is "covered elsewhere." It is not. No e2e asserts completion, stars, or the win payoff.
3. **The two highest-leverage pure modules that the test suite _should_ love are untested:** `src/lib/ai/craving-parser.ts` (`buildFallbackIntent`, ~100 lines of deterministic heuristics that drive the DEFAULT no-API-key experience) and the engine's daily tie-break rotation in `ranker.ts`.

**Rough coverage estimate (modules with an adjacent test / total source modules):** ~198 / 490 ≈ **40% of modules have _some_ adjacent test.** This is an estimate and overstates true coverage because (a) Vitest's `coverage.include` is scoped to `src/lib/engine/**` only, so line/branch coverage is not even measured for the other ~85% of the tree, and (b) many "component test" files only test an extracted helper, not the component. There are **no coverage thresholds / gates** anywhere.

**Test quality where tests exist: GOOD.** No snapshot tests (0). Almost no mocking (2 `vi.mock`, 7 `vi.spyOn` total). No `expect(true)`-style tautologies. No live network in tests. Boundary cases, idempotency, and defensive paths are tested thoughtfully.

---

## 1. Coverage Map

### Well-tested subsystems (near 1:1 source:test)

| Area                                                                                                                                                                 | Src     | Tests   | Notes                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- | ------------------------------------------------------------ |
| `src/lib/engine` (incl. scorers, trainers)                                                                                                                           | 37      | 32      | Core pairing/ranking, trainers, novelty, plate eval — strong |
| `src/lib/cook`, `pod`, `voice`                                                                                                                                       | 10 each | 10 each | 1:1                                                          |
| `src/lib/charity`, `eco`, `games`, `vocabulary`, `push`, `native`, `agentic`, `cohort`, `intelligence`, `household`, `pantry`, `parent-mode`, `storage`, `telemetry` | —       | —       | ~1:1, pure logic well covered                                |
| `src/lib/recipe-authoring`                                                                                                                                           | 9       | 8       | Strong                                                       |
| `src/data/*` selected fixtures (coach-quiz, compass, big-batch, glossary, dish-shape, nutrition thresholds, eat-out)                                                 | —       | 7       | Good fixture validation                                      |

### Untested / high-risk subsystems

| Area                                                                                                                                                              | Src files | Tests          | Severity     | Why it matters                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`src/lib/ai`** (craving-parser, food-recognition, provider, providers/claude, providers/mock, autogen-provider, contracts)                                      | 7         | **0**          | **Critical** | The heuristic fallback in `craving-parser.ts` is the DEFAULT path (no API key) and drives every search. Provider fallback chain (`provider.ts`) is the resilience contract CLAUDE.md leans on ("works fully offline").                        |
| **`src/components/guided-cook`** (step-card, cook-timer, timer-stack, mission-screen, win-screen, ingredient-list, mistake-chip, hack-chip, phase-indicator, +17) | 26        | **0**          | **High**     | This is the entire Cook flow UI (rule 4: every recipe renders through this shell). Zero unit tests; only partially exercised by 1 e2e that never reaches Win.                                                                                 |
| **`src/components` (root + most subdirs)**                                                                                                                        | 136 tsx   | 12 helper-only | **High**     | `content/` (14 src, 1 helper test), `path/` (19, 1), `community/` (5, 1), `results/EvaluateSheet.tsx` (1, 0), `agentic/`, `charity/`, `marketing/`, `recipe-authoring/`, `telemetry/`, `ui/` — all near-zero. No rendering coverage anywhere. |
| **`src/lib/utils`** (cn, dish-emoji, motion, scrapbook-evaluator, share-card)                                                                                     | 5         | **0**          | **Medium**   | `scrapbook-evaluator.ts` and `share-card.ts` contain real branching logic; pure and trivially testable but untested.                                                                                                                          |
| **`src/lib/trpc/routers`** (cook, ai, pairing, recipe-autogen, recognition, index)                                                                                | 8         | **0**          | **Medium**   | `cook.ts` has DB→static-data fallback (`console.warn` path from qa-loop-3) that is never asserted. API boundary.                                                                                                                              |
| **`src/app/api`** (search, heatmap, trpc)                                                                                                                         | 3 routes  | 0              | **Medium**   | `/api/search` is a real user path; no route handler test.                                                                                                                                                                                     |
| `src/lib/observability/sentry-init.ts`, `src/lib/analytics/events.ts`                                                                                             | 2         | 0              | Low          | Thin wrappers; lower risk.                                                                                                                                                                                                                    |

### Engine source files with NO adjacent test (12)

`preference-decay.ts`, `dish-taxonomy.ts`, `explainer.ts`, `grocery-aisle.ts`, `parent-mode/rebalance.ts`, `data/cuisine-matrix.ts`, and **6 of 9 scorers**: `cuisine-fit.ts`, `prep-burden.ts`, `temperature.ts`, `nutrition-balance.ts`, `flavor-contrast.ts`, `preference.ts`.

> The scorers are the _primitives_ of the recommendation engine. They are tested only transitively through `pairing-engine.test.ts` (which uses real scorers) and `ranker.test.ts` (which uses constant stubs). A regression in, say, `flavor-contrast.ts` weighting would only be caught if it happened to flip a top-3 ordering in the handful of fixture cases — individual scorer behavior (monotonicity, clamping to [0,1], symmetric/contrast logic) is unasserted. **Medium-High.**

---

## 2. Test Quality (sampled ~15 files)

Sampled: `use-pantry.test.ts`, `week-calendar.test.ts`, `today-planned-slot.test.ts`, `source-selector.test.ts`, `ranker.test.ts`, `pairing-engine.test.ts`, `use-cook-store.test.ts`, `use-spice-tolerance.test.ts`, `v3-eval.test.ts`, `cook-deeplink.test.ts`, `photo-pipeline.test.ts`, plus scans across all 198.

**Strengths (genuinely good):**

- **Behavioral, not implementation-coupled.** Tests assert outputs/contracts (e.g. `summariseSlotMap({}) → {filled:0,total:21}`, `pickCurrentMeal` hour boundaries, `normalizePantryName` idempotency). This honors CLAUDE.md's "test behavior, not implementation."
- **No snapshot reliance.** 0 `toMatchSnapshot`/`toMatchInlineSnapshot` — no brittle implementation snapshots.
- **Minimal mocking.** Only 2 files use `vi.mock`, 7 use `vi.fn`/`spyOn`. The suite tests real code paths rather than mock-shaped illusions. No over-mocking.
- **No tautologies / can't-fail tests.** 0 `expect(true).toBe(true)`. The 71 `toBeDefined()/toBeTruthy()` occurrences are secondary assertions, not the sole assertion in their tests.
- **No live network / external deps.** The 14 files matching `http`/`fetch` are all URL-string assertions (`cook-deeplink.test.ts`) or env-var values (`photo-pipeline.test.ts` `R2_PUBLIC_DOMAIN`), not real calls. Zero flakiness from network.
- **Zustand store tested via `getState()`** (`use-cook-store.test.ts`) — clean, no DOM needed.

**Weaknesses / smells:**

- **Misleading "component test" counts.** Files like `components/today/today-planned-slot.test.ts`, `week-calendar.test.ts`, `quest-card.test.ts`, `result-stack.test.ts` import an **extracted helper** (`pickCurrentMeal`, `summariseSlotMap`, `computePantryFit`, `buildSideMetaLine`) — never the component. The rendering, prop wiring, and event handlers are untested. The "12 component tests" overstate UI coverage substantially.
- **Time-dependent logic mostly untested for time.** Only **2** of 198 test files use fake timers (`use-cook-store.test.ts`, `scorers/seasonal.test.ts`). Modules that read `new Date()` directly (notably `ranker.ts:getDayOfYear`, and `today-planned-slot` which is tested _because_ it takes an injected `Date` param) are the right pattern — but `ranker.ts` does NOT inject the clock, so its time behavior is structurally untestable (see §5 Determinism).
- **One pointless randomness injection (cosmetic).** `v3-eval.test.ts:175` seeds with `seededRng(2 + Math.random())` but the assertion (`scoreTrainerAgainstHeldOut(latent, latent, …) === 1`) is invariant to candidates, so the random seed neither helps nor flakes. Harmless but misleading; should be a fixed seed.
- `Math.random()` in 8 other test files is only for unique fixture IDs (`s-${Math.random()}`) — benign, IDs don't enter assertions.

---

## 3. E2E Coverage (9 specs)

| Spec                             | Blocks          | Covers                                                                                      |
| -------------------------------- | --------------- | ------------------------------------------------------------------------------------------- |
| `core-loop.spec.ts`              | 9               | Today loads, search→results, **partial** cook (1 step), quest save, fallback chip, Path nav |
| `all-routes-smoke.spec.ts`       | 2 (×~30 routes) | 200 + landmark + no console errors on every route — **excellent regression net**            |
| `no-scroll.spec.ts`              | 13              | Rule 10 (CTA above fold) across screens                                                     |
| `path-features.spec.ts`          | 6               | Path tab features                                                                           |
| `path-achievement-toast.spec.ts` | 3               | Achievement toast                                                                           |
| `phase-20-new-features.spec.ts`  | 5               | Recent features                                                                             |
| `games-arcade.spec.ts`           | 7               | Games hub start screens                                                                     |
| `startup-landing.spec.ts`        | 5               | Landing                                                                                     |
| `visual-documentation.spec.ts`   | 5               | Screenshot capture (gitignored)                                                             |

**Core quest flow (Mission→Grab→Cook→Win):** Covered through **Grab + first Cook step only.** Three explicit gaps:

1. **WIN is never reached (High).** `core-loop.spec.ts:118` comment: "full win is covered elsewhere." Grep across all specs for `win`/`star`/`nailed it`/`complete`/`Cook again`/`confetti` finds **no** assertion of the win screen. The product's entire payoff moment, plus win-screen logic (stars, save-to-scrapbook, "cook again", eco-savings line) is unverified end-to-end. `win-screen.tsx` also has no unit test.
2. **Photo / food-recognition entry path has NO e2e (High).** Sous has two front-door entry points — type a craving OR **photograph a dish** (CLAUDE.md AI notes: two-step vision pipeline + correction chip). The camera/recognition/correction-chip journey is **completely uncovered** by e2e (and the underlying `food-recognition.ts` has no unit test either). The only `photo`/`camera` grep hits are `photoUri: null` in localStorage seeds — false positives.
3. **Combined/multi-dish cook & timers (Medium).** The combined cook (`/cook/combined`) is smoke-loaded by all-routes but the multi-timer concurrency (`timer-stack.tsx`, `use-cook-store` timers) is never driven in a real browser. Timer completion → win is the brittlest real-world path and has no e2e.

Other journeys with **no e2e:** Content-tab article/reel/research reading flow (only smoke-loaded), Parent Mode toggle, Profile/Settings owl sheet, saved-recipe authoring (`/path/recipes/new`).

---

## 4. Data Validation (`src/lib/db/validate-guided-cook.ts`, runs in build)

Runs via `pnpm validate:data` (part of `pnpm build`). **It is a useful guard but shallow.**

**What it does (good):** Detects _orphan_ guided-cook entries — keys in `guidedCookData`/`guidedCookMeals` that don't map to an `id` in `sides.json`/`meals.json`; prints coverage %; **exits 1 on orphans** (real build gate).

**What it does NOT do (gaps):**

- **No step-level structural validation.** It never inspects `steps[]`. A dish entry with `steps: []` (empty), non-sequential `stepNumber`, negative `timerSeconds`, or a missing `instruction` would pass the build and then **break the Cook flow at runtime** — violating rule 4 ("every recipe renders through the same shell"). Grep confirms zero references to `steps`, `stepNumber`, `timerSeconds`, or `instruction` in the script.
- **No runtime schema for the catalog.** `sides.json` (205 records, 272KB), `meals.json` (76 records), and `pairings.json` (234KB) are validated only by TypeScript _interfaces_ (`StaticDishData` etc.) at the static-`.ts` layer — there is **no Zod schema** for guided-cook steps (only `src/types/user-recipe.ts` exists, for user-authored recipes). The JSON catalog itself has **no dedicated schema test** asserting required fields, enum-valid `cuisineFamily`, non-negative times, or valid `flavorProfile` tags. Some tests import the JSON as fixtures but none validate every record.
- **Reverse direction unchecked.** It reports coverage % but doesn't _enforce_ that, e.g., a meal referenced as a quest has a guided cook entry — a meal with no steps can still be surfaced and then dead-end the cook.

**Severity: Medium-High** — the build gate gives false confidence; the most likely runtime crash (malformed/empty steps) is exactly what it doesn't check.

---

## 5. Vitest Config & Determinism

### Coverage config (`vitest.config.ts`)

```ts
test: {
  environment: "node",                    // ← no DOM; explains 0 render() tests
  include: ["src/**/*.test.ts", "eslint-rules/**/*.test.js"],  // ← NOTE: no *.test.tsx
  coverage: { provider: "v8", include: ["src/lib/engine/**"] },  // ← only engine measured
}
```

- **No coverage thresholds / gates.** `coverage` has no `thresholds` block — coverage is collected only when `--coverage` is passed, only for `src/lib/engine/**`, and never fails CI. **There is no enforcement that coverage doesn't regress anywhere.** (High — for a "boil the ocean / do it with tests" project, the absence of any gate is the single biggest process gap.)
- **`include` omits `*.test.tsx`.** The glob is `src/**/*.test.ts` (+ eslint rules). There are **0** `.test.tsx` files today, so nothing is silently skipped _right now_ — but the moment someone writes a `*.test.tsx` (the natural name for a rendering test), **Vitest will not run it.** This actively discourages/breaks the rendering-test gap above. (Medium — latent footgun.)
- `environment: "node"` + no jsdom dependency means rendering tests can't run even if written. Adding RTL tests requires installing `jsdom`/`happy-dom` and switching env (or a per-file `@vitest-environment jsdom` pragma).

### Determinism — the "no randomness in ranking" claim is NOT properly tested

CLAUDE.md: _"The engine is deterministic given the same inputs — no randomness in ranking. Novelty is introduced through daily rotation of tie-breaking logic."_

Reality (traced `suggestSides` → `rankCandidates`):

- `pairing-engine.ts:70` calls `rankCandidates`, which at `ranker.ts:59` calls `getDayOfYear()`, which at `ranker.ts:91-93` reads **`new Date()` directly** (not injected). The day-of-year feeds `hashTieBreaker` for tie-break ordering.
- So `suggestSides` has a **hidden wall-clock input.** It is deterministic _within a calendar day_ but **changes across days** by design.
- The one determinism test (`pairing-engine.test.ts:432`) calls `suggestSides` **twice in the same run** and asserts `toEqual`. This passes **trivially** — both calls see the same `new Date()`. It does **not** prove same-day stability against a fixed clock, and it **cannot** detect the cross-day rotation at all.
- `ranker.test.ts` has **zero** tests touching `dayOfYear`, the tie-break, or `Date` (grep confirms). The daily-rotation feature — the explicitly documented novelty mechanism — is **completely untested.**

**Severity: High.** Both halves of the documented contract are unverified: (a) within-day determinism (the test is tautological w.r.t. the clock), and (b) that rotation actually reorders ties across days. `getDayOfYear()` should accept an injectable `now`/`dayOfYear` so both can be tested with `setSystemTime` or a param.

---

## 6. Findings — Severity-Ranked

| #   | Severity        | Finding                                                                                                                                     | File(s)                                                                                                        | Remediation                                                                                                                                                                                                                            |
| --- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | **Critical**    | `src/lib/ai/craving-parser.ts` `buildFallbackIntent` (~100 lines, the default no-key path) has 0 tests; entire `src/lib/ai/` untested       | `src/lib/ai/*`                                                                                                 | Unit-test heuristic cuisine/effort/health/dietary/mood extraction with table-driven inputs; test `provider.ts` fallback (key set → Claude, unset → Mock).                                                                              |
| F2  | **High**        | Win screen never reached by any test; `win-screen.tsx` no unit test                                                                         | `e2e/core-loop.spec.ts:118`, `src/components/guided-cook/win-screen.tsx`                                       | Extend core-loop e2e through completion using a short single-dish recipe (fake timers / a no-timer dish) asserting stars + "cook again"; unit-test win-screen helpers (star calc, eco line).                                           |
| F3  | **High**        | Daily tie-break rotation untested; determinism test is tautological; `getDayOfYear` not injectable                                          | `src/lib/engine/ranker.ts:59,91`, `pairing-engine.test.ts:432`                                                 | Inject clock (`rankCandidates(..., { now })` or `dayOfYear` param); test (a) same day = stable order, (b) two different days = ties reorder, non-ties don't.                                                                           |
| F4  | **High**        | Zero React rendering tests; `node` env, no jsdom, RTL unused; `*.test.tsx` excluded from Vitest `include`                                   | `vitest.config.ts`, all `src/components/**`                                                                    | Install `jsdom`, add `*.test.tsx` to `include`, add RTL render tests for core Cook components (step-card, timer, ingredient-list, mission/win).                                                                                        |
| F5  | **High**        | Photo / food-recognition entry path (2nd front door) has no e2e and no unit test                                                            | `src/lib/ai/food-recognition.ts`, all e2e                                                                      | Unit-test `recognizeDish` (no-key fallback + parse); add e2e covering camera entry → correction chip → results.                                                                                                                        |
| F6  | **Medium-High** | `validate-guided-cook.ts` checks only orphan keys, never step structure/emptiness; no Zod schema for steps; catalog JSON has no schema test | `src/lib/db/validate-guided-cook.ts`, `src/data/{sides,meals,pairings}.json`                                   | Add a Zod schema for `StaticDishData`/`StaticCookStep` and validate every guided entry (non-empty steps, sequential `stepNumber`, `timerSeconds>=0`, non-empty `instruction`) in the build script + a unit test over the JSON catalog. |
| F7  | **Medium-High** | 6/9 engine scorers untested individually (only transitive)                                                                                  | `src/lib/engine/scorers/{cuisine-fit,prep-burden,temperature,nutrition-balance,flavor-contrast,preference}.ts` | Add focused unit tests asserting [0,1] clamping, monotonicity, and known contrast cases per scorer.                                                                                                                                    |
| F8  | **Medium**      | No coverage thresholds; coverage only measured for `src/lib/engine/**`                                                                      | `vitest.config.ts`                                                                                             | Broaden `coverage.include` to `src/lib/**` (+ key components) and add a `thresholds` floor (even a low ratcheting baseline) so coverage can't silently regress.                                                                        |
| F9  | **Medium**      | tRPC routers + `/api` route handlers untested (incl. `cook.ts` DB→static fallback)                                                          | `src/lib/trpc/routers/*`, `src/app/api/*`                                                                      | Test `cook.ts` fallback (DB throws → static data returned), and `/api/search` handler happy/empty/error paths.                                                                                                                         |
| F10 | **Medium**      | `*.test.tsx` silently excluded from Vitest `include` glob                                                                                   | `vitest.config.ts:7`                                                                                           | Change include to `src/**/*.test.{ts,tsx}` (prevents future rendering tests from being skipped).                                                                                                                                       |
| F11 | **Low**         | "Component test" counts misleading (test extracted helpers, not components)                                                                 | `src/components/**/*.test.ts`                                                                                  | Naming/expectation hygiene; addressed by F4 rendering tests.                                                                                                                                                                           |
| F12 | **Low**         | `v3-eval.test.ts:175` injects `Math.random()` into seed pointlessly                                                                         | `src/lib/engine/v3-eval.test.ts:175`                                                                           | Replace with a fixed seed for reproducibility.                                                                                                                                                                                         |

---

## 7. The 5 Highest-Value MISSING Tests

1. **`craving-parser.test.ts` — heuristic fallback (`buildFallbackIntent`).** _(F1, Critical)_ This is the function that runs for every search when no `ANTHROPIC_API_KEY` is set — i.e. the default app behavior. Pure, deterministic, ~100 lines of regex branches across cuisine/effort/health/dietary/mood/moodCategory. A table-driven test ("chicken tikka masala" → indian, "lazy sunday salad" → minimal+health-forward, "my wife is celiac" → gluten-free, etc.) is the single biggest coverage win in the repo.

2. **Engine determinism + daily rotation test (clock-injected).** _(F3, High)_ Make `getDayOfYear` injectable, then assert: (a) `suggestSides` with a _fixed_ clock returns identical output across calls (real determinism, not same-run coincidence), and (b) ties reorder between two different `dayOfYear` values while strictly-ranked non-ties stay put. This is the only test that actually validates the documented "deterministic + daily novelty" contract.

3. **End-to-end WIN-screen completion in `core-loop.spec.ts`.** _(F2, High)_ Drive a short, no-timer (or fake-timer) single dish from craving all the way to the win screen; assert stars render, "Cook again" / save-to-scrapbook appears, and the session is recorded. Closes the only-untested quadrant of the product's defining Mission→Grab→Cook→**Win** loop.

4. **Guided-cook step structural validation (Zod + build gate + catalog test).** _(F6, Medium-High)_ A Zod schema for `StaticCookStep`/`StaticDishData` plus a unit test iterating every entry in `guidedCookData`/`guidedCookMeals` asserting non-empty `steps`, sequential `stepNumber`, `timerSeconds >= 0`, non-empty `instruction`. Wire the same check into `validate-guided-cook.ts` so a malformed recipe fails the build instead of dead-ending the Cook flow at runtime.

5. **First RTL rendering test for the Cook shell (`step-card` + `cook-timer`/`win-screen`).** _(F4/F5, High)_ Establish the rendering-test capability (install jsdom, add `*.test.tsx` to the Vitest include) and prove it on the highest-risk UI: render `StepCard` and assert the instruction, doneness cue, mistake/hack chips, and the accessible "Go to step N" control render and fire; render `WinScreen` with a fixture and assert star count. This unlocks the entire 136-component blind spot.

---

## Appendix — Counts (static)

- Source modules (ts/tsx, excl. tests/d.ts): **490** (lib: 246, components: 136 tsx, app: 59, rest data/types).
- Unit test files: **198** (all `.test.ts`; **0** `.test.tsx`).
- E2E specs: **9** (in `e2e/`; CLAUDE.md says `/tests/e2e/` — `tests/e2e/` is empty, actual dir is `e2e/`).
- Total unit-test LOC: ~31,258.
- `render()` / `renderHook()` / RTL imports: **0 / 0 / 0**.
- Snapshot tests: **0**. `vi.mock`: **2** files. `vi.fn`/`spyOn`: **7** files. `useFakeTimers`/`setSystemTime`: **2** files.
- Coverage thresholds: **none**. Coverage `include`: `src/lib/engine/**` only.
- Estimated module-level coverage ratio: **~40%** (≈198/490) — overstated; line/branch coverage unmeasured outside the engine.
