# 20-week autonomous moat retro

> Closed: 2026-07-08
> Plan: `docs/20-WEEK-AUTONOMOUS-MOAT-PLAN.md`
> Status: autonomous track complete; founder-gated unlocks remain explicit.

## Executive summary

The 20-week AUTO-BUILD track did what it was meant to do: deepen the app
without waiting on accounts, credentials, legal review, clinical sign-off, or
real beta cohorts. The strongest outcome is not any single feature. It is the
operating pattern now visible across the repo: deterministic core first,
mock/stub/live gate second, then a narrow user-facing surface only when the core
earns it.

The lean key-less app remains fully functional. The founder-gated rails are now
identified, contract-tested, and ready to turn on by configuration plus a smoke
test instead of a rebuild.

## What materially improved

| Area                   | Outcome                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Engine and data        | Context, pantry, preference, novelty, and time/season signals moved deeper into tested helpers instead of ad hoc UI copy.     |
| Content and cook depth | Guided-cook coverage, ingredient rows, quantity display, and cooking handoff details became more precise and less decorative. |
| Habit loop             | Saved, shared, repeated, and group cooking loops now preserve source metadata and keep working without server state.          |
| Craft floor            | Shared card/kicker primitives, spacing tokens, ingredient icons, and motion contracts reduced one-off styling drift.          |
| Network prep           | Cook Together, pod challenges, gifting, realtime stubs, and founder-gates now have deterministic local contracts.             |
| Reliability            | Typecheck, lint, full Vitest, production build, and targeted Playwright smokes are the default close gate.                    |

## Founder-gated punch list

| Gate               | Current repo status                                                                                                  | Founder action                                                                                                                          | First smoke after unlock                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Auth               | Mock user remains default; W19 gate requires both Clerk env vars before reporting live.                              | Add `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`; decide whether Clerk or Supabase Auth is the first production provider. | Sign in, complete one cook, confirm per-user session identity persists.                           |
| Database           | Supabase direction is documented; local-first stores still keep the demo shippable.                                  | Add production `DATABASE_URL`, run schema migration/seed, confirm RLS posture before exposing anon writes.                              | Complete cook on one device, reload another device, confirm diary/session continuity.             |
| Storage            | R2 and Supabase Storage are both recognized by the W19 storage gate; local fallback remains default.                 | Add either full R2 env or Supabase Storage env and upload/serve the existing image catalog.                                             | Upload or resolve a win photo and confirm public URL rendering on `/path` and gift/cook surfaces. |
| Realtime           | Cook Together deterministic local adapter exists; W19 gate only reports live with Supabase env plus realtime opt-in. | Add Supabase public env and set `SOUS_REALTIME_ENABLED=true` after the live channel implementation is selected.                         | Join the same cook session in two browsers and confirm presence + step progress converge.         |
| Charity payments   | Stripe charge helper is idempotent and verified-founder gated; default mode is no-money stub.                        | Add Stripe key, complete charity/KYC decisions, verify nonprofit records.                                                               | Run a test-mode pledge charge and confirm idempotency on retry.                                   |
| AI providers       | Mock/heuristic surfaces stay default; W19 cost guard parses daily/monthly micro-USD budgets.                         | Add `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`, set budget env, decide per-surface rollout order.                                          | Trigger one real call, confirm telemetry logs cost and budget guard blocks over-limit calls.      |
| Legal and clinical | Therapeutics remain educational and gated; deferred ledger lists public-launch compliance work.                      | Get food-advertising counsel and clinician sign-off before public health-claim positioning.                                             | Re-run copy/claim checks and manually review condition-aware surfaces.                            |
| Beta cohort        | Analytics taxonomy and local loops exist; real retention needs households.                                           | Recruit first 10 households and run structured cook/interview loop.                                                                     | Track cooks/user/week, acceptance rate, completion rate, and qualitative friction.                |

## W20 regression record

This close slice should be considered valid only when these commands are green:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e` or a documented scoped Playwright substitute when the full
  matrix is too slow for the current slice
- `git diff --check`

## Carry-forward

1. Run a real founder-unlock rehearsal once credentials exist. The first unlock
   should be auth + database, because most other real-mode paths need user
   identity.
2. Keep the rule-12 pattern: no fake live feature should ship to users without
   the external dependency actually present.
3. Convert the founder-gate status contract into an internal settings/debug
   panel only if the founder needs live visibility. Do not add user-facing
   setup UI to the core app.
4. Leave the main product bias unchanged: fewer choices, faster cook decision,
   guided cooking as the content.

## Decision

The 20-week track is complete. The next autonomous work should not start by
adding another broad feature lane. It should either harden the founder-unlock
path with real credentials or take one high-friction user journey and reduce
steps without widening scope.
