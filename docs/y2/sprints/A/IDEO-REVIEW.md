# Y2 Sprint A (W1-W5) — Founder-unlock substrate close

> **Plan ref:** `docs/YEAR-2-VIBECODE-PLAN.md` Sprint A
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #1 (W2) + #2 (W4) absorbed into this
> sprint close.

## Build state at review

- Latest commit on main: `dd2da09` (Y2 W4 photo-pipeline gallery wire-up).
- Test count: **1121** (was 1073 at Y1 close — **+48 over the sprint**).
- Four-gate green: pnpm lint ✓, pnpm typecheck ✓, pnpm test ✓, pnpm build ✓.

## What landed in Sprint A

| Week | Commit     | Output                                                                                                                                                    |
| ---- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W1   | 6c2bd6f    | Auth-flag substrate — pure helpers + 9 tests + tRPC server.ts refactor                                                                                    |
| W2   | bd85293    | Y2 Drizzle schema additions — users, user_recipes, recipe_score_breakdowns (V3 dep), pods + members + weeks + submissions, notifications + 9 parity tests |
| W3   | e3f1a8f    | R2 photo pipeline pure substrate — runtime flag, content-type allowlist, size bounds, key composition, public URL resolver + 30 tests                     |
| W4   | dd2da09    | Pod gallery wire-up to the photo-pipeline resolver                                                                                                        |
| W5   | (this doc) | Sprint A close + IDEO                                                                                                                                     |

4 production commits + 1 docs commit (this).

## Founder-unlock contract status

| Slot                 | Substrate shipped                               | Founder action waiting                                                               |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| Clerk auth           | ✓ W1 (auth-flag, MOCK_USER_ID, server.ts wired) | `CLERK_SECRET_KEY` env                                                               |
| Postgres             | ✓ W2 (8 tables, parity tests)                   | `DATABASE_URL` + `pnpm db:push`                                                      |
| R2                   | ✓ W3 (helpers + W4 gallery wire)                | 4 R2 env vars                                                                        |
| Cook deeplink author | (Y1 W51 + Y2 W4 gallery)                        | n/a — works today; cross-device user-recipe resolution lands when Postgres lights up |

Each slot's swap from stub → real is one config edit. The
vibecode V1 path stays identical to Y1 today; the runtime
checks the flag before attempting the real call, falls back
to the stub when keys are absent.

## Surface scoreboard delta

| Surface                  | Y1 close | Sprint-A close | Delta                                                |
| ------------------------ | -------- | -------------- | ---------------------------------------------------- |
| `/community/pod` gallery | 4.00     | 4.00           | – (no UX change today; R2-day shifts to public URLs) |
| (no surface changes)     | –        | –              | –                                                    |

Sprint A is intentionally infra — no surface adds. Score-≥-4
count: **29 of 31** (unchanged from Y1 close).

## Cross-cutting wins

1. **The auth-flag pattern locks in.** isAuthEnabled() +
   MOCK_USER_ID becomes the canonical contract every Y2
   gated-feature check imports. Y1's inline-`process.env`
   readers across the trpc server are now extracted + tested.
2. **Y2 schema parity tests pin every Y1 Zod source.** When
   Drizzle migrations land (post-DATABASE_URL), shape drift
   between client + server surfaces as a unit-test failure.
3. **Stub-mode-V1 substrate-first generalises.** Three sprints
   (Y1 W22 voice, Y1 W50 autogen, Y1 W46 pod, Y2 A) all use the
   same shape: env-var flag → real call vs deterministic stub.
   Pattern documented as Y2 process commitment #9.

## RCA tally

1 minor: W3 photo-pipeline test for emoji-only filename
expected "untitled" but the helper kept the surviving extension
("jpg"). Not a bug — the helper's behaviour is correct (extension
hints are useful even when the basename strips). Test updated
to reflect the actual contract + a separate test added for
all-empty fallback. Caught at first test run, never landed.

**0 RCAs landed on main this sprint.**

## Carry-forward into Sprint B

- Sprint B (W6-W10) ships **Pairing-engine V3 — per-dimension
  scores**. The W2 `recipe_score_breakdowns` table is the
  V3 dependency; substrate already in place.
- Y1 W51 sharing button + Y2 W4 gallery resolver mean the
  cook-deeplink path is fully ready for cross-device
  resolution on Postgres-day.

## Acceptance for Sprint-A close

- [x] Auth-flag substrate shipped + tested (W1).
- [x] Y2 Drizzle tables defined + Zod-parity tested (W2).
- [x] R2 photo pipeline pure helpers shipped + tested (W3).
- [x] Pod gallery routed through the pipeline resolver (W4).
- [x] All four gates green throughout.
- [x] Founder-unlock-runbook updated (Y1 W52 commit).

## Retrospective

Sprint A closed exactly as planned: four substrate commits,
zero surface regressions, zero RCAs on main. The substrate-
first discipline that produced 0 RCAs across H2 of Y1 carries
forward cleanly. Sprint B opens with the V3 per-dimension
trainer — the W2 recipe_score_breakdowns table is the load-
bearing dependency, already shipped + parity-tested. Bi-weekly
IDEO cadence kicks in officially at Sprint B (the first
real-feature sprint); this Sprint A close absorbs both bi-
weekly IDEOs since the four weeks were single-line substrate
commits.
