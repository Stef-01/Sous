# Dispatch Archive

## DSP-Sous-20260724-01 — archived 2026-08-10 as EXPIRED

Expired 2026-08-07 with zero progress: no STATUS.md was ever written and the only commit
after the dispatch was the dispatch itself (b4773e1). Re-dispatched as DSP-Sous-20260810-01
with the same task and a raised priority.

<details><summary>Original DISPATCH.md</summary>

```markdown
---
dispatch_id: DSP-Sous-20260724-01
repo: Sous
state: done
priority: P2
created: 2026-07-24
expires: 2026-08-07
estimated_scope: M
classification: AUTO-BUILD
requires_founder: []
task_type: feature
source_of_priority:
  - "docs/YEAR-5-VIBECODE-PLAN.md is the canonical active workstream; its cursor reads 'Sprints A-G + J + N are Shipped. Remaining: Sprint H (Retention analytics, W29-W32) -> I -> K -> L -> M'. Sprint H is the next unshipped sprint in sequence."
  - "The plan states 'every Y5 sprint is AUTO-BUILD on its own' and pins Sprint H as 'pure aggregator over cook_sessions. Stub fixtures drive tests.' — no founder key, no external API, no infra."
  - "Continuity: last shipped Y5 work is Sprint G (d82d100, pod challenges 2.0). Sprint A already shipped the sibling module src/lib/cohort/segmentation.ts, so Sprint H lands beside proven code."
  - "repo-dispatch-sync tier + momentum: Tier A, 84 commits/30d, 0 commits/7d, last commit 2026-07-14 — active repo that has gone quiet, which is exactly when the next sprint slips."
  - "No competing signal: no Sous mention in Granola meetings for 2026-07-10..2026-07-24, and no Sous-linked open task in the Airtable Task Registry. The plan document is therefore the highest-quality available priority signal."
depends_on: []
verify_commands:
  - pnpm typecheck
  - pnpm lint
  - pnpm test
  - pnpm build
---

# DISPATCH — Y5 Sprint H: D7/D30 retention aggregator + cohort retention curves

## Task

Ship **Y5 Sprint H (Retention analytics, W29-W32)** as specified in
[`docs/YEAR-5-VIBECODE-PLAN.md`](docs/YEAR-5-VIBECODE-PLAN.md). The sprint's stated output is a
**"D7/D30 retention aggregator + cohort retention curves"**, and the plan's per-sprint note pins the
shape precisely: *"pure aggregator over `cook_sessions`. Stub fixtures drive tests."*

This is substrate work, and the plan's own RCA discipline mandates **substrate-first (pure helpers +
storage + hooks before UI)**. Build the pure aggregator and its tests first; only then consider a
render surface.

**1. The aggregator.** Add `src/lib/cohort/retention.ts` beside the existing Sprint A/B modules
(`segmentation.ts`, `dashboard-summary.ts`, `snapshot-ledger.ts`) and follow their established
conventions exactly — exported interfaces for input/output, pure functions with no I/O, no `Date.now()`
inside the helpers (accept an explicit `now` or reference date as a parameter, the way
`isoWeekKey(date: Date)` and `rollupCohorts({...})` already do). The module needs to answer two
questions from a list of cook sessions plus each user's acquisition date:

- **D7 / D30 retention**: of the users acquired in cohort week W, what fraction had at least one cook
  session in the window `[acquisition + 1d, acquisition + 7d]` and `[acquisition + 1d, acquisition + 30d]`.
  Anchor the windows on each user's own acquisition timestamp, not on a calendar boundary.
- **Cohort retention curves**: for each acquisition cohort (reuse `isoWeekKey` from
  `segmentation.ts` — do not mint a second week-keying scheme), a series of retention values by
  day-offset bucket, suitable for plotting as a curve per cohort.

Reuse `EngagementTier` / `isoWeekKey` / the `UserCohortInput` shape from `segmentation.ts` wherever
they already fit rather than redefining parallel types. Export a summary function in the spirit of
`summariseCohortDashboard` so Sprint I can roll this into `/path/internal` later without a refactor.

**2. Handle the honest edge cases.** A cohort whose observation window has not fully elapsed cannot
report D30 — return an explicit "insufficient window" state rather than a misleading 0%. Same for
cohorts with too few users to be meaningful. The repo's existing habit is to be explicit about
unverified/insufficient data (see the Verified/Unverified taxonomy from Sprint C and the
`isPlaceholder` convention); match it. Silent zeros in a retention chart are a correctness bug.

**3. Tests with stub fixtures.** Add `src/lib/cohort/retention.test.ts` following the pattern in
`segmentation.test.ts` and `dashboard-summary.test.ts`. Drive everything from hand-written fixtures —
no reliance on real user data, no network. Cover at minimum: a user who cooks on day 3 (retained at
both D7 and D30), a user who cooks only on day 0 (acquisition-day activity does not count as
retention), a user who cooks on day 20 (D30 only), a cohort with an incomplete observation window,
an empty cohort, and week-boundary behaviour at an ISO year rollover.

**4. Read the real session shape first.** `src/lib/hooks/use-cook-sessions.ts` (and its test) is the
live source of cook-session records. Derive the aggregator's input type from what that hook actually
stores — do not invent field names.

**5. Surface (only if the substrate lands clean and budget remains).** The plan routes dashboard
roll-up to Sprint I, so do **not** build `/path/internal` here. If you have room, the most faithful
increment is extending the existing cohort dashboard surface that `summariseCohortDashboard` already
feeds. If in doubt, stop at substrate + tests and say so in STATUS.md — a clean pure-helper sprint is
a complete Sprint H by the plan's own substrate-first rule.

**6. Update the plan cursor.** Flip Sprint H's Status cell in the sprint table to `✓ Shipped` with the
commit SHA (matching how A-G/J/N are recorded), and update the `Current cursor` line so the next run
reads the correct remaining sequence (I → K → L → M).

## Context from Strategy & Brain

Cross-repo intelligence this scheduled run has that a fresh session would not:

- **The local mirror was 646 commits behind origin until this run.** `repo-dispatch-sync` fast-forwarded
  `Documents/GitHub/Sous` from `f08e230` (2026-05-29) to `bd19a99` (2026-07-14) on 2026-07-24. The
  2026-07-16 and 2026-07-19 runs both failed to dispatch Sous for this reason and the board carried it
  as a founder ask. **Before starting, run `git -C . pull --ff-only`** — if the mirror has drifted again,
  everything below may be stale.
- **A phantom dispatch exists in the record.** `DSP-Sous-20260716-01` was written to the dispatch board
  on 2026-07-16 but never reached origin (the push was rejected non-fast-forward). It was never real
  work; ignore it. This dispatch, `DSP-Sous-20260724-01`, is the first one that can actually land.
- **The Frontend Modernization workstream is closed, not paused.**
  `docs/FRONTEND-MODERNIZATION-PLAN.md` §8 records "implemented and verified 2026-07-13", and its four
  Follow-on Work items are each explicitly deferred (utility-route restyle is opportunistic-only;
  editorial content is blocked on Deferred Ledger L8; Community ranking waits for real engagement data;
  the food-first queue contract is already locked by `src/app/frontend-modernization.test.ts` and
  `e2e/frontend-modernization.spec.ts`). Do not reopen it — that is why this dispatch goes to Y5 instead.
- **`docs/QUICK-WINS-PUNCHLIST.md` is closed out too** — items 2 and 3 shipped (W51/W50), items 1 and 4
  are deliberate declines. Not a source of work.
- **Constraining rules from `claude.md`, quoted because they bind this task:** "**Always commit directly
  to main and push. Always.**" and "**Never create worktree branches. Never use feature branches.**"
  Also critical rule 9: "**Consult ROADMAP.md for build sequencing** — Don't duplicate work that's
  already done," and critical rule 8: consult `STRATEGY.md` before designing new features.
- **The plan's RCA discipline is non-negotiable for this repo:** "4-gate green before every commit
  (lint + typecheck + test + build)" and the standing streak target of **0 RCAs across Y2-Y5**. The
  4 gates are the `pnpm verify` script (`pnpm typecheck && pnpm lint && pnpm test && pnpm build`).

## Acceptance Criteria

- [ ] AC1: `src/lib/cohort/retention.ts` exists, exports typed D7/D30 and cohort-curve functions, and is
      pure — no `Date.now()`, no I/O, no React, no network inside the module.
- [ ] AC2: Retention windows are anchored per-user on acquisition date; a cook session on the
      acquisition day itself does not count as retention.
- [ ] AC3: Cohort keying reuses `isoWeekKey` from `src/lib/cohort/segmentation.ts` — no second
      week-keying implementation is introduced.
- [ ] AC4: Cohorts with an incomplete observation window or insufficient users return an explicit
      insufficient-data state, never a silent 0%.
- [ ] AC5: `src/lib/cohort/retention.test.ts` covers the six cases named in step 3 and passes.
- [ ] AC6: The aggregator's input type is derived from the real record shape in
      `src/lib/hooks/use-cook-sessions.ts`, not invented.
- [ ] AC7: All four gates pass: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.
- [ ] AC8: `docs/YEAR-5-VIBECODE-PLAN.md` Sprint H status and the `Current cursor` line are updated with
      the shipping commit SHA.
- [ ] AC9: Work is committed directly to `main` and pushed.

## Files Likely Touched

- `src/lib/cohort/retention.ts` — new. The Sprint H aggregator.
- `src/lib/cohort/retention.test.ts` — new. Fixture-driven unit tests.
- `src/lib/cohort/segmentation.ts` — read-only reference for `isoWeekKey`, `EngagementTier`,
  `UserCohortInput`. Import from it; avoid editing it.
- `src/lib/cohort/dashboard-summary.ts` — read-only reference for the summary-function convention
  Sprint I will consume.
- `src/lib/hooks/use-cook-sessions.ts` — read-only. Source of the real cook-session record shape.
- `docs/YEAR-5-VIBECODE-PLAN.md` — status cell + cursor line only.
- `STATUS.md` — new, written at the end per the dispatch protocol.

## Dependencies / Blockers

None. Sprint H is AUTO-BUILD by the plan's own statement, needs no founder key, no external API, and no
Stage-2 infrastructure. The one prerequisite — a current local mirror — was resolved by this run; re-verify
with `git pull --ff-only` before starting.

## Definition of Done

All ACs checked, `pnpm verify` green (the 4-gate), committed to main and pushed, `STATUS.md` written with
`dispatch_id: DSP-Sous-20260724-01`, an outcome, and the verify-command evidence.

## Out of Scope

Surgical Changes guard — do **not**:

- Build `/path/internal` or roll up the monitoring dashboards. That is Sprint I, a separate sprint.
- Reopen the Frontend Modernization plan, restyle utility routes, or touch the flat-surface / food-first
  queue contracts. That workstream is closed and regression-locked.
- Replace placeholder editorial content (Deferred Ledger L8) or touch sample-content guardrails.
- Add real analytics collection, telemetry, or any network call. Sprint H is a pure aggregator over data
  the app already stores.
- Refactor `segmentation.ts`, `dashboard-summary.ts`, or `snapshot-ledger.ts`. Read them, import from
  them, leave them alone.
- Wire Clerk / Neon / R2 / Redis / Sentry or any Stage-2 production-hardening concern.
```
</details>
