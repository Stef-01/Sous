# 07 — Build Health, Dependencies, Tooling & Repo Hygiene

**Reviewer role:** Developer Experience / Release Engineering
**Date:** 2026-05-31
**Scope:** Build/CI health, dependency hygiene, package-manager integrity, tooling enforcement, repo organization & onboarding cost.
**Method:** Read of pre-run health-check logs (`/tmp/sous-*.log`), `package.json`, all tooling configs, `.gitignore`, `git ls-files`, `git worktree list`, `npm outdated`, `npm audit`. No builds/tests were re-run.

---

## TL;DR — Build Health Verdict

**The build is GREEN.** All four gates pass cleanly:

| Gate                                                 | Result  | Notes                                                                  |
| ---------------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| `typecheck` (`tsc --noEmit`)                         | ✅ PASS | No output = no errors. `strict: true`.                                 |
| `lint` (`eslint . && prettier --check .`)            | ✅ PASS | 0 errors, **2 warnings** (unused vars). Prettier clean.                |
| `test` (`vitest run`)                                | ✅ PASS | **3030 tests / 199 files, 12.18s.** Zero failures.                     |
| `build` (`validate:data && typecheck && next build`) | ✅ PASS | Data integrity passes (0 orphans). Compiled in 24.2s, 41 static pages. |

There is **nothing blocking a deploy from a code-correctness standpoint.** The risk in this repo is not the code — it is **release-engineering fragility** (dual lockfiles, no CI, a 1.2 GB stranded worktree) and **onboarding drag** (200+ loose/overlapping docs, broken README setup step, doc/reality drift). These are the things that will silently break a deploy or burn a new contributor's (or AI agent's) first day.

---

## Severity-Ranked Findings

### 🔴 CRITICAL

#### C1. Dual lockfiles: `package-lock.json` AND `pnpm-lock.yaml` both committed → deploy roulette

Both are tracked by git:

- `package-lock.json` — 231 KB, **last committed 2026-04-04** (`c78484e "Rebrand app to Sous"`), mtime frozen at May 1. This is the **npm era**, now stale.
- `pnpm-lock.yaml` — 252 KB, **last committed 2026-05-04** (`dcced3e`), **regenerated today (mtime May 31 01:06)**. This is the live, authoritative lockfile.

Every signal says **pnpm is authoritative**: all scripts call `pnpm` (`"build": "pnpm validate:data && pnpm typecheck && next build"`), CLAUDE.md mandates pnpm, the pnpm lock is fresh. The `package-lock.json` is a stale orphan from before the npm→pnpm migration.

**Why this is Critical:** Vercel's install step auto-detects the package manager by lockfile. With **both** present, the resolution is ambiguous/order-dependent — Vercel may run `npm ci` against a **7-week-stale** `package-lock.json` that does not reflect current `package.json` (e.g. it predates several dependency bumps), producing a different dependency tree in production than every developer has locally. This is a classic "works on my machine, breaks in prod" trap, and it's invisible until a deploy resolves the wrong tree.

Compounding it: **there is no `packageManager` field** in `package.json` to pin the tool/version (e.g. `"packageManager": "pnpm@9.x"`), so corepack/Vercel have no authoritative declaration to fall back on.

**Remediation (do all three):**

1. `git rm package-lock.json` — delete the stale npm lockfile.
2. Add `"packageManager": "pnpm@<version>"` to `package.json` (matching the version that generated the current `pnpm-lock.yaml`).
3. Add `package-lock.json` and `yarn.lock` to `.gitignore` so a stray `npm install` can't re-commit one.

> NOTE: This review intentionally ran `npm outdated`/`npm audit` (read-only) for analysis only. Do **not** run `npm install`/`npm ci` in this repo — it would regenerate the stale lockfile and reintroduce the conflict. Use `pnpm` exclusively.

---

#### C2. No CI/CD whatsoever — `verify` is local-only, nothing gates `main` or deploys

There is **no `.github/workflows/` directory** (confirmed absent; the only `workflows/*.yml` hits are inside `node_modules`). The excellent `verify` script (`typecheck && lint && test && build`) exists **only as a local convenience** — nothing runs it on push or PR.

Given the project's stated workflow ("always commit directly to main and push"), this means **every push goes straight to `main` with zero automated gate.** The 3030-test suite, the typecheck, the data-integrity validator, and the custom reduced-motion ESLint rule are all only as good as whoever remembers to run them. One forgotten `pnpm verify` and a red `main` (or a broken Vercel deploy) ships.

**Why Critical:** "commit straight to main, no CI" is the single highest-probability path to a broken production deploy in this repo. The tooling to prevent it already exists — it just isn't wired to anything.

**Remediation:** Add `.github/workflows/ci.yml` that runs on push + PR:

```yaml
- pnpm install --frozen-lockfile # also catches lockfile drift
- pnpm verify # typecheck + lint + test + build
```

Wire Vercel to require the check (or at minimum block-on-failure). Frozen-lockfile install will _also_ surface C1 the moment a stale `package-lock.json` is around. This is a ~30-line file and the biggest single deploy-safety win available.

---

### 🟠 HIGH

#### H1. Stranded git worktree consuming 1.2 GB, with a full duplicate `docs/` and `node_modules/`

`git worktree list` shows a second worktree:

```
/Users/.../Sous/.claude/worktrees/vibrant-neumann-6cff74  d82d100 [claude/vibrant-neumann-6cff74]
```

- It sits at commit **`d82d100` — identical to `main`** (`git rev-list --count main...branch` = `0  0`, zero divergence). **No unmerged work is at risk.** It is pure dead weight.
- It carries a **full duplicate `docs/` tree** (this is the "docs duplicated in a worktree" another reviewer flagged — it is a worktree artifact, _not_ a real second copy of docs) **and its own 671 MB `node_modules/`**.
- Total footprint: **1.2 GB.** Combined with main's 690 MB `node_modules`, the working directory carries **~1.9 GB**, most of it redundant.

The worktree path _is_ gitignored (`.gitignore` line 48: `.claude/worktrees/`) and excluded from lint/eslint, so it doesn't pollute git or CI — but it's a local-disk and tooling-confusion hazard (grep/find/IDE indexers will traverse it; the earlier `find` for workflows surfaced its `node_modules`).

CLAUDE.md's own operational guardrail #1 ("Minimize worktree sprawl... The only real risk is work stranded in worktrees") is being violated by this exact artifact.

**Remediation:** `git worktree remove .claude/worktrees/vibrant-neumann-6cff74` (safe — zero divergence from main), then `git worktree prune`. Reclaims ~1.2 GB instantly.

#### H2. Known security vulnerabilities in the dependency tree (7 total: 4 high, 3 moderate)

`npm audit` reports:

- **`picomatch` (HIGH ×2)** — Method Injection in POSIX character classes (`GHSA-3v7f-55p6-f55p`) + ReDoS via extglob quantifiers (`GHSA-c2c7-rcm5-vvqj`). Transitive (via `tinyglobby` etc.). **Fix available via `npm audit fix` (non-breaking).**
- **`postcss` < 8.5.10 (MODERATE)** — XSS via unescaped `</style>` in stringify output (`GHSA-qx2v-qp2m-jg93`). Pulled in transitively, including under `next`. Fix requires bumping `next` to 16.2.6, which `npm audit fix --force` flags as outside the stated range.

**Why High:** these are real CVEs in the active tree, and one is a ReDoS that can be reachable from glob/build paths. None is exploitable from end-user input in an obvious way (build-time/dev tooling mostly), which keeps it at High rather than Critical.

**Remediation:** With pnpm (the authoritative manager), bump the offenders: `pnpm update picomatch postcss` (or add `pnpm.overrides` to force `postcss >= 8.5.10` and a patched `picomatch`). Bumping `next` 16.1.6 → 16.2.6 (a patch within the same major) clears the postcss path and is low-risk — see D-block below.

#### H3. README's documented setup step is broken — `.env.example` does not exist

`README.md` instructs new contributors:

```bash
cp .env.example .env.local
```

But **`.env.example` is not tracked and does not exist** in the repo. Worse, `.gitignore` line 37 is `.env*` — which **ignores `.env.example` itself**, so even if someone creates it, `git add` silently drops it. The README then renders a full table of env vars (`DATABASE_URL`, `ANTHROPIC_API_KEY`, etc.) referencing a file that can never be committed under the current ignore rule.

**Why High:** this is the literal first command a new contributor (or an AI agent reading the README) runs, and it fails with `cp: .env.example: No such file or directory`. First-run friction on the documented golden path.

**Remediation:** Create `.env.example` with all documented keys (empty values / placeholders) and **un-ignore it**: change `.gitignore` `.env*` to `.env*` + an explicit negation `!.env.example`. Then `git add -f .env.example`.

---

### 🟡 MEDIUM

#### M1. Doc/reality drift: CLAUDE.md tech stack is materially stale vs `package.json`

The "Tech stack" section of CLAUDE.md (lines 29–39) no longer matches reality:

| CLAUDE.md says                            | Reality (`package.json` / source)                                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 15**                            | **`next@16.1.6`** — a full major version ahead                                                                                           |
| PostgreSQL **(Neon)**                     | `@supabase/supabase-js@2.106` + `postgres@3.4` + `drizzle.config.ts` points at **Supabase** migrations. Neon is not used.                |
| **Upstash Redis** (cache + rate limiting) | **Not installed.** No `@upstash/*`, no `ioredis`, no `@vercel/kv` in deps; no source imports.                                            |
| Cloudflare **R2** (images)                | **Not installed.** No `@aws-sdk/*`/R2 client. Images use `images.unsplash.com` + `img.clerk.com` remote patterns + local `food_images/`. |
| Clerk auth                                | Present (`@clerk/nextjs@6.39`) but **bypassed with a mock user** (per CLAUDE.md rule 11).                                                |

Additional stack members present in reality but absent from the CLAUDE.md stack list: `maplibre-gl` (Cuisine Compass map), `@dnd-kit/*`, `vaul`, `fuse.js`, `framer-motion`, React Compiler (`babel-plugin-react-compiler` + `reactCompiler: true` in `next.config.ts`).

**Sentry** is a special case: CLAUDE.md lists it, and there IS a deliberate **stub** at `src/lib/observability/sentry-init.ts` — but it explicitly does **not** import `@sentry/nextjs` (the SDK is not installed; the file documents this as founder-gated W17 prep). That is correct and intentional per CLAUDE.md rule 12; it's listed here only so the reader knows Sentry is _wired-but-inert_, not actually integrated.

**Why Medium:** stack drift misleads any new contributor or AI agent about how data, caching, and storage actually work — e.g. someone could waste hours wiring Upstash because the canonical doc says it's the cache layer. Not a deploy risk, but a direct onboarding-cost and trust hit on the project's most-read doc.

**Remediation:** Update CLAUDE.md "Tech stack" to: Next.js **16**, **Supabase** Postgres (not Neon), drop Upstash/R2 (or mark them "planned, not yet integrated" alongside Sentry's stub status), add maplibre/React Compiler. Five-minute edit; high leverage given how often this file is read.

#### M2. Repo-root sprawl — ~50 entries at root, 23 loose `.md`/`.py`/`.html`/`.xlsx` files, including committed junk

The repo root has **50 entries**; **23 of them are loose `.md`/`.py`/`.html`/`.xlsx` files** that compete with the four canonical docs (`README`, `CLAUDE.md`, `STRATEGY.md`, `ROADMAP.md`). Confirmed-tracked offenders that should not be at root (or in git at all):

- **`.~lock.NOURISH_Optimus_Template.xlsx#`** — a **LibreOffice lock file, committed to git.** Pure artifact; should never be tracked.
- **`NOURISH_Optimus_Template.xlsx`** (22 KB) and **`append_strategy.py`** (19 KB) — a spreadsheet template + a one-off Python script generating strategy docs. Not app code.
- **`STRATEGY_temp.md`** (23 KB) — a "temp" duplicate sitting next to the canonical `STRATEGY.md` (39 KB). Ambiguous which is authoritative.
- **`optimus-weekly-2026-04-19.html`** (66 KB), **`optimus-recursive-improvement-2026-04-19-BLOCKED.md`**, **`daily-brief-2026-04-20.md`**, **`daily-feature-ideas-*.md`** (+ `daily-briefings/`, `daily-feature-ideas/` dirs) — dated, generated brief/idea artifacts.
- Overlapping planning docs at root: `PRD.md`, `planning.md`, `documentation.md`, `data-structure.md`, `TASK.md`, `UPGRADE-PLAN.md`, `PIPELINE.md`, `COMBINED_COOK_PLAN.md`, `NUTRITION_INTELLIGENCE_PLAN.md`, `PhD-Research-AI-Setup-Guide.md` — much of this duplicates content now in `docs/`.

**Why Medium:** a new contributor opening the repo root cannot tell signal from noise. Committing editor lock files and `_temp` docs also signals loose hygiene that erodes trust in the canonical docs.

**Remediation:**

- `git rm '.~lock.NOURISH_Optimus_Template.xlsx#'` and add `.~lock.*#` + `*.xlsx` lock patterns to `.gitignore`.
- Move generated/dated artifacts (`optimus-*`, `daily-*`) into a `docs/archive/` (or delete — they're date-stamped and stale).
- Resolve `STRATEGY_temp.md` (merge into `STRATEGY.md` or delete).
- Decide root vs `docs/` for the planning `.md`s and move accordingly. Goal: root holds only `README`, `CLAUDE.md`, `STRATEGY.md`, `ROADMAP.md`, config files.

#### M3. `docs/` is 60+ files / **175 tracked `.md` total** with heavily overlapping roadmaps → discoverability collapse

`docs/` contains 44 top-level files plus subdirs: `weeks/` (23), `sprints/` (19), `y2/` (14), `y4/` (7), `y3/` (3), `adr/` (2), `PLANS/` (1), `reports/`, `screenshots/`, `content-sources/`, `y5/`. The **repo tracks 175 markdown files total.**

The roadmap/timeline docs alone overlap massively and have no obvious authority order:
`ROADMAP.md` (root) vs `STAGE-1-2-6MO-TIMELINE.md` vs `STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` / `-6MO.md` vs `YEAR-1`…`YEAR-7-VIBECODE-PLAN.md` vs `YEAR-1`…`YEAR-4-RETROSPECTIVE.md` vs `NEXT-20`/`20B`/`20C`/`20D-PHASES.md` vs `docs/weeks/` vs `docs/sprints/`. That's **easily a dozen overlapping forward-looking plans.** CLAUDE.md rule 9 says "Consult ROADMAP.md for build sequencing" — but a reader has no way to know ROADMAP.md is canonical over the seven YEAR-N plans and four NEXT-20x docs.

**Why Medium:** the project's own rules require reading STRATEGY.md (rule 8) and ROADMAP.md (rule 9) before any feature work. With 175 markdown files and a dozen near-duplicate plans, the cost of "which doc is current?" is paid on _every_ feature kickoff, by both humans and AI agents. This is the single biggest onboarding tax in the repo.

**Remediation:** Add a `docs/README.md` index that declares the canonical hierarchy (ROADMAP = source of truth; YEAR-N plans = historical/aspirational; retrospectives = archive) and move superseded plans to `docs/archive/`. Don't delete history — just stop it from competing with the live docs. (The existing `docs/adr/` is the right pattern; extend it.)

#### M4. Build pipeline runs `typecheck` twice (once standalone, once inside `next build`)

`"build": "pnpm validate:data && pnpm typecheck && next build"`. Next 16 already runs TypeScript during `next build` (the build log shows `Running TypeScript ...`). So `tsc --noEmit` executes, then `next build` type-checks again. The explicit `pnpm typecheck` prefix is **redundant** for catching type errors.

There IS a defensible rationale: the standalone `tsc` covers files Next's build doesn't type-check on its own (test files, `eslint-rules/*.js`, `*.mts`) per the broad `tsconfig.json` `include`. But running it serially in front of every `next build` adds wall-clock time to the slowest, most-repeated command.

**Why Medium (efficiency, not correctness):** doubles type-check cost on every full build. Fine locally; wasteful in a CI matrix.

**Remediation:** Keep `validate:data` in `build` (it's unique and fast). Move standalone `typecheck` out of `build` and rely on it via `verify`/CI (which already runs `typecheck` separately). Net: `"build": "pnpm validate:data && next build"`, and let `verify`/CI own the standalone `tsc`. Putting `typecheck` _separate_ from build is the right instinct — it's just currently _both_ separate and inline.

#### M5. `knip` is configured but **not installed and not enforced anywhere** → dead-code detection is a no-op

`knip.config.ts` exists (a real, thoughtful config with ignores and entry points), but:

- **`knip` is not in `package.json`** (neither deps nor devDeps).
- **No `knip` binary** in `node_modules/.bin`.
- **No script** references it, and **no CI** runs it.

So the config is aspirational scaffolding — dead-code/unused-dependency detection is **not actually running**. (This dovetails with the two lint warnings about genuinely unused vars `mockSession` and `STORAGE_KEY` — exactly what knip would catch at the file level.)

**Why Medium:** a config file that does nothing is worse than none — it implies a guarantee (no dead code) that isn't enforced. Low blast radius, but misleading.

**Remediation:** Either (a) `pnpm add -D knip`, add `"knip": "knip"` to scripts, and run it in CI to make the config real; or (b) delete `knip.config.ts` until the team intends to enforce it. Don't leave dormant tooling configs.

---

### 🟢 LOW

#### L1. Two ESLint warnings (unused vars) — cosmetic, non-blocking

`src/lib/hooks/use-difficulty-progression.test.ts:53` (`mockSession`) and `use-difficulty-progression.ts:10` (`STORAGE_KEY`). 0 errors. **Remediation:** delete the two unused bindings (`lint:fix` won't auto-remove them; manual). Trivial.

#### L2. BABEL deopt warning on `src/data/guided-cook-steps.ts` (>500 KB) during lint

The lint log shows `[BABEL] ... deoptimised the styling ... exceeds the max of 500KB`. This is the largest tracked source file (588 KB) and it's a **data file masquerading as a `.ts` module** (126 guided-cook step entries). It compiles fine — the warning just notes Babel skips pretty-printing it. **Remediation (optional):** consider moving the payload to JSON (`sides.json`/`meals.json` are already the pattern per CLAUDE.md) so it's parsed as data, not transpiled as code. Not urgent.

#### L3. Committed binary artifacts inflate the tree (~24 MB packed)

`git count-objects` reports **size-pack 24.11 MiB** across 3118 objects. Largest tracked blobs include `audit-screenshots/*.png` (≈330 KB each ×~16) and a **duplicated `karpathy-tweet.png`** present in _both_ `skills/karpathy-llm-wiki/assets/` and `.agents/skills/karpathy-llm-wiki/assets/` (the `.agents` tree appears to mirror `skills/`). Repo is not yet bloated, but screenshots-in-git grows unbounded. **Remediation:** move `audit-screenshots/` and `docs/screenshots/` out of git (gitignore + store as CI artifacts or in R2 when it lands); de-dupe the `.agents` vs `skills` mirror.

#### L4. Dependency currency — one risky major drift, rest are healthy patch/minor lag

Full `npm outdated` table reviewed. The tree is **broadly current** (most deps are 1 patch/minor behind: react 19.2.3→.6, zod 3.25.76 stays on 3.x, trpc 11.16→11.17, etc.). The bumps that **matter**:

- **`next` 16.1.6 → 16.2.6** (patch-within-major): pulls the patched `postcss`, clears H2's moderate CVE, low risk. **Do this.** Note `eslint-config-next` is pinned to `16.1.6` and should move in lockstep.
- Large **major** jumps to leave alone for now (breaking, deliberate pins): `ai` 4→6, `@ai-sdk/*` 1→3, `drizzle-orm` 0.35→0.45, `drizzle-kit` 0.28→0.31, `zod` 3→4, `vitest` 2→4, `eslint` 9→10, `typescript` 5→6, `lucide-react` 0.460→1.17, `tailwind-merge` 2→3, `@vercel/analytics` 1→2. These are fine to defer but should be tracked; `ai`/`@ai-sdk` being 2 majors behind is the one to schedule first when AI work resumes.

These are **the documented npm versions as analyzed via `npm outdated` (read-only)**; apply updates with `pnpm`, not npm, to respect C1.

#### L5. `.gitignore` / config hygiene — minor gaps

Mostly good: `.next/`, `*.tsbuildinfo`, `.env*`, `.vercel`, `node_modules`, `.claude/worktrees/` are all ignored, and `tsconfig.tsbuildinfo` / `.next/` are confirmed **not** tracked. Gaps: (1) no ignore for `package-lock.json`/`yarn.lock` (see C1); (2) no ignore for `.~lock.*#` editor locks (see M2, one is committed); (3) `.cursorrules` (111 lines) + `CLAUDE.md` (385 lines) are **two separate agent-instruction files** that will drift — consider making `.cursorrules` a pointer to CLAUDE.md to keep a single source of truth.

---

## What's Solid (credit where due)

- **Test suite is exceptional for this stage:** 3030 tests across 199 files, all green, 12s. Engine, pods, voice, charity, parent-mode, telemetry all covered.
- **Custom ESLint rule (`sous/reduced-motion-gate`) is enforced at `error`** with a documented remediation history — genuinely good DX governance.
- **`validate:data` gate in `build`** catches orphaned guided-cook entries before deploy — a smart, cheap, domain-specific guardrail.
- **`tsconfig` is strict** (`strict: true`, `isolatedModules`, `noEmit`).
- **Playwright config is CI-aware** (retries/workers/forbidOnly keyed off `CI`, dedicated port 3333, production-server webServer to dodge `.next/dev/lock` conflicts) — thoughtful even though no CI invokes it yet.
- **Founder-gated stubs are disciplined:** `sentry-init.ts` deliberately avoids importing an uninstalled SDK and documents the exact swap — exactly what CLAUDE.md rule 12 prescribes.
- **`drizzle.config.ts`** documents the Supabase-migrations-are-canonical decision inline, preventing accidental `drizzle-kit push` drift.

---

## Priority Action Queue (highest-leverage first)

| #   | Action                                                                                  | Severity | Effort | Payoff                                           |
| --- | --------------------------------------------------------------------------------------- | -------- | ------ | ------------------------------------------------ |
| 1   | `git rm package-lock.json`; add `packageManager: pnpm@x`; gitignore `package-lock.json` | C1       | 5 min  | Removes #1 broken-deploy cause                   |
| 2   | Add `.github/workflows/ci.yml` running `pnpm install --frozen-lockfile && pnpm verify`  | C2       | 30 min | Gates every push; also catches lockfile drift    |
| 3   | `git worktree remove` the stranded `vibrant-neumann-6cff74` worktree                    | H1       | 1 min  | Reclaims 1.2 GB; ends worktree sprawl            |
| 4   | `pnpm update` `picomatch`/`postcss`; bump `next`→16.2.6 (+`eslint-config-next`)         | H2/L4    | 15 min | Clears 4 high + 3 moderate CVEs                  |
| 5   | Create `.env.example` + un-ignore it (`!.env.example`)                                  | H3       | 10 min | Fixes the README's first broken command          |
| 6   | Update CLAUDE.md tech stack (Next 16, Supabase, drop Upstash/R2)                        | M1       | 10 min | Stops misleading every contributor               |
| 7   | Root cleanup: rm `.~lock#`, `STRATEGY_temp.md`, archive `optimus-*`/`daily-*`           | M2       | 30 min | Root becomes navigable                           |
| 8   | Add `docs/README.md` index declaring canonical doc hierarchy; archive superseded plans  | M3       | 1 hr   | Kills the biggest onboarding tax                 |
| 9   | Drop `typecheck` from `build` (keep in `verify`/CI)                                     | M4       | 2 min  | Faster builds                                    |
| 10  | Install+wire `knip` in CI, or delete `knip.config.ts`                                   | M5       | 15 min | Make dead-code detection real or stop pretending |

**Bottom line:** the code is healthy and well-tested; the _release pipeline and repo organization_ are where the deploy risk and the new-contributor/AI-agent drag live. Items 1–3 (dual lockfile, no CI, stranded worktree) are the trio most likely to cause a silent broken deploy or a wasted first day — fix those first.
