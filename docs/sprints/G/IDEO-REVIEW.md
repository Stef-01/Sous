# Sprint G (W32-W36) — IDEO Design Review

> Closes Sprint G per `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md`.
> Sprint focused on the **household memory** arc — the original
> Sprint E entry that slipped because voice-cook live integration
> took the bandwidth.

## Review date

2026-05-02

## Build state at review

- Latest commit on main: `0accfeb` (W36 weekly rhythm widget).
- Test count: **808** (was 738 at Sprint F close — **+70 over the
  sprint**).
- Four-gate green: pnpm lint ✓, pnpm typecheck ✓, pnpm test ✓,
  pnpm build ✓.

## What landed in Sprint G

| Week | Commit  | Output                                                                                    |
| ---- | ------- | ----------------------------------------------------------------------------------------- |
| W32  | 5272564 | Substrate: Zod schema + 22 helper tests + 11 parser tests + localStorage CRUD hook        |
| W33  | fc3a155 | Roster page at `/path/household` + Path quick-link tile + smoke spec coverage             |
| W34  | b03fe42 | Shared `MemberForm` + dietary flags + cuisine preferences + inline edit mode on each card |
| W35  | f9ee80c | "Who's at the table" picker on `/today` + 14 aggregator tests + 8 parser tests            |
| W36  | 0accfeb | Weekly rhythm widget on `/today` + 15 rhythm-calculator tests                             |

5 production commits + 0 close docs (commit messages carried the
per-week documentation; this doc is the canonical close).

## Surface scoreboard delta

| Surface            | Sprint-F close | Sprint-G close | Delta                                                                                                  |
| ------------------ | -------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| `/today`           | 4.10           | **4.25**       | +0.15 (WhosAtTable picker + WeeklyRhythmWidget; both quiet on cold-start, surface as data accumulates) |
| `/path`            | 4.00           | 4.00           | – (gained a 6th tile but accumulation flag still pinned; grid bumped to 3-col so layout stays clean)   |
| `/path/household`  | (n/a)          | **3.75**       | NEW (roster + add/edit/delete + per-member preferences)                                                |
| All other surfaces | unchanged      | unchanged      | –                                                                                                      |

Score-≥-4 count: **23 of 26** (was 22/25 at Sprint F close — one
new surface at 3.75, one existing surface bumped from 4.10 → 4.25).

## Cross-cutting wins

1. **Household memory is fully wired end-to-end.** Roster page
   for CRUD → picker on /today → aggregator computes binding
   constraints (dietary union, min spice, hasChild) → rhythm
   widget summarises 7-day cadence. The substrate (W32 schema +
   helpers + persistence hook) shipped before the surfaces, so
   each surface week was a wiring exercise rather than a
   discovery exercise — the Sprint F pattern carrying forward.

2. **Three quiet-on-cold-start surfaces.** WhosAtTable renders
   a CTA to /path/household when no members exist; WeeklyRhythm
   renders nothing below 2 cooks-this-week; per-member
   constraints render only when at least one member is selected.
   The /today surface stays empty for new users and earns its
   pixel space as the user invests in the loop. Matches CLAUDE.md
   rule 6 (simplicity-first UI) and the "no settings page"
   philosophy.

3. **Aggregation logic is fully pure-tested.** 14 tests on
   `aggregateTable` cover empty selection, missing ids,
   ordering invariance, dietary union dedup, cuisine union
   dedup, min-spice across selection, hasChild flag, count
   correctness. 15 tests on `computeWeeklyRhythm` cover the
   7-day rolling window, future-dated cooks excluded,
   malformed completedAt skipped, top-cuisine ordering with
   deterministic alphabetic tie-break. The display components
   are thin wrappers over these helpers.

4. **W15 RCA pattern propagated again.** Every storage-backed
   piece in Sprint G (useHouseholdMembers, useTonightTable)
   uses the same shape: freshDefault factory, schema-version
   check, object-shape gate, partial-recovery parser. Sprint E
   noted this pattern reaching propagation maturity; Sprint G
   confirms — new hooks inherit the pattern without thinking
   about it.

## RCA tally

0 RCA-worthy moments this sprint. Same Sprint-E shape: storage /
configuration / pure-aggregation work where contracts are
designed correctly upfront. The W22 / W30 lint-rule false-
positive pattern didn't recur this sprint — both new effects
in `useTonightTable` and `useHouseholdMembers` matched the
existing W15 pattern exactly so the eslint-disable scopes were
copy-paste-ready.

## Library adoptions during Sprint G

None. The household-memory work composed entirely of:

- `zod` (already in tree) for schema
- `framer-motion` (already in tree) for surface animations
- `lucide-react` (already in tree) for the Users / CalendarDays
  icons

Cumulative dep budget through H1+F+G: ~11KB / 50KB H1 ceiling.
~39KB headroom into H2.

## Carry-forward into Sprint H (W37-W41)

Sprint H per the 12-month plan focuses on **drag-to-reorder
recipe steps** (the W23 `reorderSteps` helper has been waiting
since Sprint E for a UI consumer) + **timer-voice command
wiring** (W21 deferred to "Sprint-E later weeks"; still queued).

Mandatory carry-forward into Sprint H:

1. **Pairing-engine integration of the table aggregate.** The
   W35 aggregator computes binding constraints; the pairing
   engine doesn't yet read them. A clean wire-up path:
   - Pass `aggregate.dietaryFlags` as a hard filter on the
     candidate list (requires adding `dietaryFlags` field to
     `SideDishCandidate`).
   - Bump the V2 trainer's `preference` weight when
     `aggregate.hasChild` is true (encodes "today's table is
     more constrained than yesterday's" softly).
2. **Real attention-pointer content** for top dishes (carried
   from Sprint F).
3. **Recipe-authoring schema migration** (`cuisineFact` +
   `imageUrl` on user steps; carried from Sprint F).
4. **`pnpm typecheck` in CI / pre-commit hook** (carried from
   Sprint C).

## Acceptance for Sprint-G close

- [x] Every Sprint-F IDEO carry-forward addressed or explicitly
      redeferred. Real attention-pointer content + recipe-
      authoring schema migration + pairing-engine V3 signal
      extensions all redeferred to Sprint H — Sprint G
      household-memory arc was the priority.
- [x] No regression in any score-≥-4 surface from Sprint-F close.
- [x] Test count monotonic (738 → 808, +70).
- [x] All four gates green throughout the sprint.
- [x] Three new household-memory surfaces shipped:
      `/path/household` roster, WhosAtTable picker, WeeklyRhythm
      widget.
- [x] Per-member preference profiles capture every signal the
      pairing engine needs (dietary flags, cuisine preferences,
      spice tolerance, ageBand).

## Retrospective (1 paragraph)

Sprint G shipped the original Sprint E entry on schedule, three
new household-memory surfaces, and zero RCAs across five weeks
of consecutive feature work — the Sprint F "wiring not
discovery" shape held all the way through. The substrate-first
discipline paid off again: by the time the picker shipped in
W35 the schema, helpers, persistence hook, form component, and
aggregator were all unit-tested, so the surface was a 100-line
file. The single deliberate scope choice this sprint: NOT
wiring the aggregator into the pairing engine yet. Doing so
requires adding `dietaryFlags` to the `SideDishCandidate`
shape, which propagates through the seed catalog + trainer +
display layer; that's a Sprint H lift sized for two days, not
the half-day that fits inside W36. Sprint H opens with that
wire-up + the Sprint F carry-forwards (real pointer content,
recipe-step schema migration, drag-to-reorder UI consumer).
