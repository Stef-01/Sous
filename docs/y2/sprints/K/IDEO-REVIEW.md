# Y2 Sprint K (W44-W47) — Per-cuisine vocabulary dictionary

> **Plan ref:** `docs/YEAR-2-VIBECODE-PLAN.md` Sprint K
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #21 (W44+W45) + #22 (W46+W47) absorbed
> into this sprint close.

## Build state at review

- Latest commit on main: `6b7b1f4` (W45+W46 vocab matcher + sub-to-pantry).
- Test count: **1900** (was 1826 at Sprint J close — **+74 this sprint**, round milestone hit).
- Four-gate green: lint ok, typecheck ok, test ok (1900/1900), build ok.

## What landed in Sprint K

| Week | Output                                                                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| W44  | Vocabulary substrate — Zod schema + 15-term seed catalog + 5 pure lookup helpers (32 tests). Across 8 cuisine families with regional names + substitutions.  |
| W45  | Glossify matcher data layer — pluralAlternatives + findVocabularyMatches with multi-word + regional alias + longer-match-wins overlap resolution (27 tests). |
| W46  | Substitution → pantry helper — parses free-text swap fields, cuts at preposition boundaries, no-double-write pantry application (15 tests).                  |
| W47  | Sprint K close + IDEOs #21 + #22 (this doc).                                                                                                                 |

3 production commits + 1 docs commit (this).

## Cross-cutting wins

1. **Vocabulary substrate is testable end-to-end without UI.** The schema validates the data file, the lookup helpers find entries by term/alias/cuisine, the matcher finds spans inside arbitrary text, and the substitution-to-pantry helper writes idempotently. The Glossify component (W45 plan) and the substitution popup (W46 plan) hang off these layers as thin render glue.

2. **Plural-tolerance shipped as a 25-line pure helper.** "tagines" matches "tagine"; "berry" → "berries"; "key" → "keys" (vowel+y rule). The same pattern can be reused by the Sprint J search ranker for query-side stemming.

3. **The 1900-test round milestone hit at W45.** Pure-helper discipline keeps adding test surface without test-infrastructure complexity. From 1073 at Y1 close → 1900 at W45 = **+827 tests across Y2 H1 + first half of H2**.

## UX-recon target hit (Sprint K primary)

**Surface:** cuisine cards on the Path tab (planned per the framework — patterns #2 + #10).
**Status:** **Substrate ready, surface deferred.** The W44 listByCuisine + listCuisines helpers feed the cuisine-card grid; the W45 matcher feeds the Glossify popup. The actual visual cards (eyebrow + made-it ring) are deferred to a backfill commit alongside the Pod-gallery #10 ring already on the carry-forward list.

Recon discipline maintained: pattern named, deferral rationalised. Backfill list now includes:

- Pod gallery made-it ring (#10) from Sprint I
- Search results page eyebrow + filter chips (#2 + #9) from Sprint J
- Cuisine cards eyebrow + made-it ring (#2 + #10) from Sprint K

These three are the most natural set to backfill in a single dedicated polish week between Sprint L and Y2 close — same pattern shape, same component reuse.

## RCA tally

0 RCAs on main this sprint.

The 0-RCAs-on-main streak now stretches **40 weeks** (Sprints A through K).

Mid-sprint catches that never reached main:

- W44: vocab seed had three entries with regional aliases that exactly matched their canonical term ("tadka" / "garam masala" / "wok hei"). Caught by the seed-data sanity test ("regional aliases don't repeat the canonical term"). Three small JSON edits and the test went green.

## Founder-unlock status

- **No new founder-unlocks** required by Sprint K. The vocabulary substrate is fully self-contained.
- All prior H1 + H2 substrates unchanged.

## Carry-forward into Sprint L

- Sprint L (W48-W51) ships **charity bake-sale tooling** — the most founder-gated sprint of Y2. Stripe Connect + nonprofit partnerships needed for real mode; substrate-first pattern again.
- Recon target per the framework: patterns #1 + #4 (hero card + save corner) on bake-sale recipe cards.
- Three backfill items (made-it ring on Pod + cuisine cards, search results page) carry forward to a polish week before Y2 close.

## Acceptance for Sprint-K close

- [x] Vocabulary substrate (schema + seed + lookup) shipped + tested (W44).
- [x] Matcher (Glossify integration data layer) shipped + tested (W45).
- [x] Substitution → pantry helper shipped + tested (W46).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #21 + #22 absorbed (this doc).

## Retrospective

Sprint K was the smallest in scope across Y2's H2 — a single domain (vocabulary) with three thin pure-helper layers stacked. 74 new tests, zero RCAs, hitting 1900 tests cleanly. The interesting move was the seed-data sanity tests — they catch human authoring errors at boot, which is exactly the failure mode you want a curated catalogue to expose loudly.

Sprint L opens with charity bake-sale tooling — different domain (financial), substantially more founder-gating, but the same stub-mode-V1 pattern that's now proven across 7+ founder-unlock substrates this year.
