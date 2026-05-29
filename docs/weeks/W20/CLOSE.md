# W20 close — Sprint D close-out

**Sprint:** D (Stage-5 Sprint D)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H1 Sprint D W20
**Date closed:** 2026-05-02
**Scope:** Sprint-D close-out + Sprint-D IDEO review.

## Sprint-D summary

| Week | Commit                | Output                                       |
| ---- | --------------------- | -------------------------------------------- |
| W16  | `d8c652e` + `35bca1f` | Voice Cook toggle + close doc                |
| W17  | `d965683`             | UserRecipe Zod schema (32 tests)             |
| Plan | `fff4104`             | Cook-nav initiative added (6 MVPs, W18→W52+) |
| W18  | `33223a3` + `89dae99` | MVP 1: Done<X> intent (21 tests)             |
| W19  | `5ed6e01` + `f0033de` | MVP 2: useVoiceCook coordinator (17 tests)   |

10 production commits + 4 docs commits across the sprint.

## Test count delta

533 → 604 (**+71**). Monotonic-non-decreasing throughout the
sprint. Largest single contribution: W17 UserRecipe schema (+32).

## RCA tally

1 RCA caught + fixed inside the same commit cycle (W18 regex
alternation order — pattern documented). Lower than Sprint C's
5 because Sprint D was more schema-and-helper work where
contracts can be designed right upfront.

## Acceptance

- [x] Every Sprint-C IDEO carry-forward addressed or explicitly
      redeferred with reason.
- [x] No regression in any score-≥-4 surface from Sprint-C close.
- [x] Test count monotonic (533 → 604).
- [x] All four gates green throughout: lint, typecheck, test, build.
- [x] 12-month plan updated with the new cook-nav initiative
      distributed across W18-W52+.
- [x] Sprint-D IDEO review doc shipped at
      `docs/sprints/D/IDEO-REVIEW.md`.

## Top-5 carry-forward into Sprint E

1. Live cook-step-page integration of `useVoiceCook`. Highest
   priority — the four voice hooks need a user-facing surface.
2. Recipe authoring UI (ingredient list builder, step builder,
   share affordance). Slipped from Sprint D because Sprint C's
   carry-forward took W16.
3. `pnpm typecheck` in CI / pre-commit hook (carried from Sprint C).
4. MVP 3 of the cook-nav initiative (W22 in plan): visual mode
   toggle + step images.
5. Sprint-E original plan: household-member shape + onboarding
   (W21), "who's at the table tonight" picker (W22), per-member
   like memory (W23), weekly rhythm widget (W24).

## Retrospective (1 paragraph)

Sprint D's load-bearing decision was extending the 12-month plan
mid-sprint with the Google-Maps-style cook-nav initiative — a
plan-level change driven by Stefan's directive that surfaced a
real product capability the prior plan had no slot for. The
6-MVP staging across W18-W52+ is the right shape: each MVP ships
value at its own rung (voice-only at W19, visuals at W22,
attention aids at W28, animation at W36), with the genuinely-
hard MVP-6 (real video loops) explicitly marked founder-gated
rather than buried as if it were vibecode-able. The single risk
heading into Sprint E is that 4 voice hooks + 1 coordinator hook
exist without ANY user-facing consumer — that's 5 weeks of work
sitting on the shelf. Sprint-E W21 should land the cook-step-page
integration before any new feature work.
