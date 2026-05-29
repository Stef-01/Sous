# Sprint E (W21-W25) — IDEO Design Review

> Closes Sprint E per `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md`.
> Sprint focused on **voice-cook live integration** (Sprint-D
> carry-forward) + **MVP 3 visual mode** + **recipe authoring
> stack** + **library-research policy adoption** (mid-sprint
> directive change).

## Review date

2026-05-02

## Build state at review

- Latest commit on main: `6b5b07c` (W24 useRecipeDrafts).
- Test count: **661** (was 604 at Sprint-D close — **+57 over the
  sprint** from visual-mode pref + recipe-draft helpers + recipe-
  drafts persistence).
- Four-gate green: pnpm lint ✓, pnpm typecheck ✓, pnpm test ✓,
  pnpm build ✓.

## What landed in Sprint E

| Week | Commit(s) | Output                                                                                                                                                                                                            |
| ---- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W21  | `c646d43` | Live voice-cook integration on cook step page — `useVoiceCook` consumed, onAction routes to handleNext / handleBack / speakStep, "Voice" listening pill in header. End-to-end voice cook live for the first time. |
| W22  | `c69a91e` | MVP 3: Visual mode toggle + persisted preference. Eye-icon section in profile settings sheet, 13 tests.                                                                                                           |
| Mid  | `055700a` | **Library-research policy** + master pick table for every feature. Principle 8 added to operating principles (search before you build). 9 ecosystem categories researched via real WebSearch.                     |
| W23  | `d78d0b6` | react-hook-form adopted (~9KB / 50KB H1 budget) + 5 pure draft helpers (defaultRecipeDraft, nextIngredientId, append/remove/reorder steps, commitDraft) + 24 tests.                                               |
| W24  | `6b5b07c` | useRecipeDrafts persistence hook + 5 pure helpers (parseStoredRecipeDrafts with partial-recovery, upsertRecipe, removeRecipeById, safeSerialiseRecipe, roundTripRecipe) + 20 tests.                               |

12 commits across the sprint (5 production + 7 docs/policy/test).

## Surface scoreboard delta

| Surface                | Sprint-D close | Sprint-E close | Delta                                                                             |
| ---------------------- | -------------- | -------------- | --------------------------------------------------------------------------------- |
| `/today`               | 4.00           | 4.00           | –                                                                                 |
| `/cook/[slug]`         | 4.00           | **4.25**       | +0.25 (now has voice integration; "Voice" listening pill is the new affordance)   |
| `/cook/combined`       | 3.25           | 3.25           | – (still W11-only refactor; visual sub-component extractions queued for Sprint F) |
| Profile Settings sheet | 4.00           | 4.00           | – (gained Visual Mode section without disturbing density)                         |
| All other surfaces     | unchanged      | unchanged      | –                                                                                 |

## Cross-cutting wins

1. **Voice-cook is end-to-end live.** 5 weeks of infrastructure
   (W12-W15 hooks + W18 done-intent + W19 coordinator + W21
   page integration) now meets a real surface. A user can flip
   the toggle in settings, open a cook flow, and navigate by
   voice. The Google-Maps-style guided cooking vision is
   technically achievable today; what remains is content
   polish (per-step images for visual mode) and animation aids
   (W28+).

2. **Library-research policy is now codified, not aspirational.**
   The master pick table covers every upcoming feature
   category with an explicit adoption decision (adopted /
   queued / not-adopted-with-reason). Principle 8 makes
   "search before you build" load-bearing alongside the existing
   AUTO-BUILD-vs-FOUNDER-GATED rule (CLAUDE.md rule 12).

3. **Recipe-authoring stack is fully scaffolded for W25 page work.**
   Schema (W17) + pure draft helpers (W23) + persistence (W24)
   - form library (react-hook-form via the master pick table)
     are all ready. The W25 page surface is now a
     one-day component-build, not a multi-week expedition.

4. **The "fresh-default factory" pattern from W15 RCA propagated.**
   useVisualModePref (W22), useRecipeDrafts (W24) all use the
   same factory shape. The codebase is converging on a small set
   of recurring patterns that any new storage-backed hook
   inherits without thinking about it.

## RCA tally

0 RCA-worthy moments this sprint — first sprint with no Loop-2
finds. Reasons:

- Sprint E was mostly storage / persistence / configuration work
  where contracts can be designed correctly upfront.
- The W15 / W22 patterns transferred cleanly to W24 (factory
  default, object-shape gate, partial-recovery on invalid entries).
- The library-policy doc adoption forced explicit consideration
  of bundle weight + maintainer activity per feature, catching
  potential issues at planning time rather than at test time.

## Carry-forward into Sprint F (W26 close + W27-W31 pairing-engine V2)

Sprint F per the 12-month plan is **pairing-engine V2** (per-user
weight vector trained client-side). W26 is the H1 retrospective.

**Mandatory carry-forward:**

1. **Recipe authoring page surface (W25 was supposed to ship this;
   slipped).** The infrastructure is fully ready — schema +
   helpers + persistence + form library. The remaining work is
   a single client component that wires `useForm` + `useFieldArray`
   - the save/cancel actions. Estimated: 1 day in W26 or W27.

2. **`/cook/combined` density wave 2** (visual sub-component
   extractions: dual-track step-progress strip, parallel-hint
   banner). Sprint-A through Sprint-E all carry-forwarded;
   pinned for Sprint F.

3. **`pnpm typecheck` in CI / pre-commit hook** (carried from
   Sprint C). One-line Husky integration.

4. **Quarterly library-research refresh** — W26 is the first
   quarterly checkpoint per the policy doc. Re-run searches for
   any category whose pick is queued (timer-hook, dnd-kit,
   fuzzball/Fuse, USDA wrapper).

**Queued (in the 12-month plan):**

- W27-W31: pairing-engine V2 with per-user weight vector.
- W22 visual mode → W26+ step-card visual variant (large image,
  shrunken instruction). Currently the toggle exists but the
  page doesn't read it yet — same shape as voice-cook before W21.
- MVP 4 of cook-nav initiative (W28): SVG attention pointers.

## Acceptance for Sprint-E close

- [x] Every Sprint-D IDEO carry-forward addressed (voice-cook
      live integration shipped W21, top mandatory item; recipe
      authoring scaffolded W23-W24; pnpm typecheck still pending
      → CI wiring deferred to Sprint F).
- [x] No regression in any score-≥-4 surface from Sprint-D close.
- [x] Test count monotonic (604 → 661, +57).
- [x] All four gates green throughout the sprint.
- [x] 0 RCA-worthy moments (first sprint with this).
- [x] Library-research policy documented + applied to W23 adoption.
