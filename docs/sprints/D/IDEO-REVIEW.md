# Sprint D (W16-W20) — IDEO Design Review

> Closes Sprint D per `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md`.
> Sprint focused on **Stage-5 W2 recipe authoring loop** + the
> opening MVPs of the new **Google-Maps-style guided cook
> navigation** initiative (added to the plan in `fff4104`).

## Review date

2026-05-02

## Build state at review

- Latest commit on main: `f0033de` (W19 close doc).
- Test count: **604** (was 533 at Sprint-C close — **+71 over the
  sprint** from voice-cook pref + UserRecipe schema + Done<X>
  intent + useVoiceCook coordinator suites).
- Four-gate green: pnpm lint ✓, pnpm typecheck ✓, pnpm test ✓,
  pnpm build ✓.

## What landed in Sprint D

| Week | Commit(s)             | Output                                                                                                                                                                                            |
| ---- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W16  | `d8c652e` + `35bca1f` | Voice Cook toggle in profile settings sheet — first user-visible voice-cook UI. CLAUDE.md rule 3 respected (single Settings sheet, no new tab).                                                   |
| W17  | `d965683`             | UserRecipe Zod schema + parseUserRecipeJson + slugifyTitle. 32 tests. Versioning header for future migrations. Mirrors seed Dish shape so authored recipes flow through the existing Quest shell. |
| Plan | `fff4104`             | 12-month plan extended with the Google-Maps-style cook-nav initiative. 6 MVPs distributed W18-W52, MVP-6 (video loops) marked founder-gated.                                                      |
| W18  | `33223a3` + `89dae99` | MVP 1: 'Done <X>' voice intent with negation guards + extractDoneContext helper. 21 new tests. Pattern surfaced: regex alternation order matters (longer first).                                  |
| W19  | `5ed6e01` + `f0033de` | MVP 2: useVoiceCook coordinator hook + routeIntent pure helper. 17 new tests. Single-import surface for cook step pages.                                                                          |

## Surface scoreboard delta

Sprint D didn't introduce new user-facing routes (focused on
hooks + schema + the settings toggle). The settings sheet got a
new section but stays at 4.0 IDEO score — the section was added
without disturbing the others.

## RCA tally

Sprint D caught 1 RCA-worthy moment (W18 regex alternation order).
Lower count than Sprint C's 5 — partly because Sprint D was more
schema-and-helper work where contracts can be designed correctly
upfront, partly because the 3-loop protocol is now sufficiently
ingrained that obvious bugs are caught at architecture time, not
at test time.

## Cross-cutting wins

1. **The Google-Maps-style cook-nav initiative is now scaffolded
   end-to-end.** Six MVPs across the timeline; MVPs 1+2 shipped
   in Sprint D, MVPs 3-5 distributed across Sprints E-G, MVP 6
   founder-gated. The user can already cook a recipe by saying
   "next" / "done chopping onions" / "set a 5-minute timer" —
   what's missing is the page-side integration to wire it.

2. **Schema-first authoring.** UserRecipe ships with versioning
   header + Zod validation + JSON round-trip + 50-ingredient /
   50-step caps from the W17 stress catalog. The schema is wire-
   compatible with the seed Dish shape, so authored recipes can
   cook through the same Mission → Grab → Cook → Win flow.

3. **The `freshDefaultPref()` factory pattern from W15 is now
   codebase-standard for storage-backed parsers.** Future
   localStorage hooks should use the same shape.

## Carry-forward into Sprint E (W21-W25: household memory)

Sprint E in the 12-month plan is **household memory** (per-member
preferences, "who's at the table" picker, weekly rhythm widget).
Carry-forward below should slip into early-Sprint-E days OR get
explicit deferral markers.

**Mandatory:**

1. **Live cook-step-page integration of useVoiceCook** — the
   coordinator hook is ready; nothing imports it yet. The cook
   step page needs `useVoiceCook({ onAction })` + `speakStep` on
   step-index change + a "Voice on" indicator when listening.
   This is the bridge between "MVP 2 shipped" and "users can
   actually use voice cook" — must land early in Sprint E.

2. **Recipe authoring UI** (originally planned W17-W19; slipped
   because Sprint C's voice-cook integration took W16 + W17 had
   the schema only). The remaining authoring UI (ingredient list
   builder, step builder, share affordance) is queued for Sprint
   E days that don't conflict with household-memory work.

3. **`pnpm typecheck` in CI / pre-commit hook.** Carried forward
   from Sprint C; still not wired.

**Queued (in the 12-month plan):**

- MVP 3 (W22): Visual mode toggle + step images.
- Stanford content runs.
- Sprint-E itself: household-member shape + onboarding (W21),
  "who's at the table tonight" picker (W22), per-member like
  memory (W23), weekly rhythm widget (W24), Sprint-E IDEO close
  (W25).

## Acceptance for Sprint-D close

- [x] Every score ≤ 2 from Sprint-C IDEO carry-forward addressed
      (Sprint-C had no ≤ 2 surfaces by close).
- [x] No regression in any screen scored ≥ 4 at Sprint-C close.
- [x] Test count monotonic-non-decreasing (533 → 604, +71).
- [x] Build green throughout the sprint.
- [x] All RCA-worthy moments documented with fix + test in same
      commit.
- [x] 12-month plan updated with the new cook-nav initiative.
- [x] Top mandatory carry-forward items locked into Sprint-E plan.

Sprint E opens with **live cook-step-page integration of
`useVoiceCook`** so the four shipped voice hooks finally meet a
real user-facing surface, then proceeds with the originally-
planned household memory work.
