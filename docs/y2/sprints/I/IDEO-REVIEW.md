# Y2 Sprint I (W35-W38) — Pod V2 agentic recipe pick + voted twist

> **Plan ref:** `docs/YEAR-2-VIBECODE-PLAN.md` Sprint I
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #17 (W35+W36) + #18 (W37+W38) absorbed into
> this sprint close.

## Build state at review

- Latest commit on main: `a8e8247` (W37 twist-vote helpers).
- Test count: **1712** (was 1639 at Sprint H close — **+73 this sprint**).
- Four-gate green: lint ok, typecheck ok, test ok (1712/1712), build ok.

## What landed in Sprint I

| Week | Output                                                                                                                                |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------- |
| W35  | Agentic Pod recipe picker (33 tests). Stub-mode rotation + real-mode bounded LLM call with code-fence stripping + off-list rejection. |
| W36  | Pick-on-Monday automation trigger + race-safe token (16 tests). Cron-equivalent gate + override-window logic.                         |
| W37  | Voted twist + tiny goal + identity streak (24 tests). Vote tally with admin-order tie-break + streak detector.                        |
| W38  | Sprint I close + IDEOs #17 + #18 (this doc).                                                                                          |

3 production commits + 1 docs commit (this).

## Cross-cutting wins

1. **The Anthropic stub-mode-V1 pattern is now proven across THREE consumers.** W28 (conversation), W35 (pod pick), and the W32 voice-to-draft pipe all share the same shape: bounded prompt + structured-output validator + silent fallback. When Stefan sets ANTHROPIC_API_KEY, four LLM-backed surfaces light up simultaneously with one config edit.
2. **Race-condition handling moved from "we'll figure it out at deploy" to substrate.** W36's `weeklyPickToken` is the unique-constraint-friendly token the dispatcher uses to serialise concurrent admin views. Two admins opening pod home at the same instant generate identical tokens; first DB insert wins, second sees the constraint violation + re-reads the picked recipe. No application-level lock needed.
3. **All 6 behavioural overlays now have at least one consumer surface.** W37 lands the tiny-goals + identity overlays on Pod V2; the other 4 already shipped in Sprints C, E, F, G.

## UX-recon target hit (Sprint I primary)

**Surface:** Pod gallery + filter chips (planned per the framework — patterns #9 + #10).
**Status:** **Substrate ready, surface deferred.** The W37 streak detector + identity formatter are the load-bearing data layer for the made-it ring (#10) on the pod gallery. The actual visual ring rendering carries to a Sprint J or backfill commit.

Acceptable per the framework's contract. Recon target named, deferral rationalised.

## RCA tally

0 RCAs on main this sprint.

The 0-RCAs-on-main streak now stretches **32 weeks** (Sprints A through I).

Mid-sprint catches that never reached main:

- W35: agentic picker initial draft sorted candidates by id rather than slug — caught at first determinism test (different runs produced different ordering).
- W37: tally-tie-break test had wrong expectation (assumed first-vote-wins; actual logic is admin-proposal-order). Test corrected to match the spec.

## Founder-unlock status

- **ANTHROPIC_API_KEY:** still unset. W35 stub mode runs end-to-end today. Real mode lights up the pod-pick + W28 voice conversation + W32 voice-to-draft + (future Sprint J) agentic search all at once.
- **Postgres:** still unset. The W36 token + W37 vote-tally helpers are pure; the persistence layer (PodChallengeWeek table, votes table) waits for `DATABASE_URL`.

## Carry-forward into Sprint J

- Sprint J (W39-W43, 5 weeks — wider than usual) ships **agentic viral recipe search**. The most complex Y2 build per the plan's own warning.
- Recon target per the framework: patterns #2 + #9 (eyebrow + filter chips on the search results page).
- The Pod gallery #10 made-it-ring backfill carries forward.

## Acceptance for Sprint-I close

- [x] Agentic Pod picker substrate shipped + tested (W35).
- [x] Pick-on-Monday trigger + race-safe token shipped + tested (W36).
- [x] Voted twist tally + streak detector shipped + tested (W37).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #17 + #18 absorbed (this doc).

## Retrospective

Sprint I closes the Pod V2 substrate cleanly. Three pure helpers, 73 new tests, zero new screens — the discipline that earned the 32-week 0-RCAs-on-main streak holds. The most interesting move was W36's `weeklyPickToken`: race-condition handling pushed down into a pure helper that the DB layer enforces via unique constraint. No setTimeout-based locks, no Redis, no lockfiles — just data shape doing the work.

Sprint J opens with the agentic viral recipe search — the plan flags this as the most complex Y2 build because it intersects web search, ranking, attribution, dedup, cool-down, and ethics. Five weeks of careful pure-helper work before any UI.
