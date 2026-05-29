# Y2 Sprint J (W39-W43) — Agentic viral recipe search

> **Plan ref:** `docs/YEAR-2-VIBECODE-PLAN.md` Sprint J
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #19 (W39+W40) + #20 (W41+W42+W43) absorbed
> into this sprint close (this is a 5-week sprint; the second
> bi-weekly covers 3 weeks).

## Build state at review

- Latest commit on main: `0458db2` (W42 viral chip gate).
- Test count: **1826** (was 1712 at Sprint I close — **+114 this sprint**).
- Four-gate green: lint ok, typecheck ok, test ok (1826/1826), build ok.

## What landed in Sprint J

| Week | Output                                                                                                                                                                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W39  | Search adapter substrate (36 tests). Provider priority (Tavily > Brave > SerpAPI > stub) + sanitiser + normaliser + 5-result deterministic stub fixture.                         |
| W40  | Virality classifier (27 tests). 5-rule scorer (recency/keyword/social/celebrity/engagement) with reason-trace + monotonicity tests.                                              |
| W41  | Recipe dedup hash + cool-down state machine (33 tests). Title noise stripping, cuisine + ingredient set hash, 7-day baseline → 14-day backoff at 2 dismissals → suppressed at 4. |
| W42  | Viral chip eligibility gate + ethics attribution (18 tests). 5-input composition + curiosity-styled copy + always-present 'View original' affordance.                            |
| W43  | Sprint J close + IDEOs #19 + #20 (this doc).                                                                                                                                     |

4 production commits + 1 docs commit (this).

## Cross-cutting wins

1. **Five layers of viral-search substrate, all pure helpers, all tested in isolation.** From W39 (search) → W40 (rank) → W41 (dedup + cool-down) → W42 (chip gate) → ethics. The dispatcher composes them; no integration-test scaffolding needed.

2. **Ethics shipped as code, not as a doc.** The W42 attribution helper _always_ emits the source URL + 'View original' affordance — the gate can't fire the chip without that payload populated. The "no claim Sous owns the recipe" rule is structurally enforced rather than relying on review discipline.

3. **Stub-mode-V1 across 4 founder-unlock providers.** Tavily / Brave / SerpAPI / Anthropic — config-edit day flips one (or all four) on. The pure pipeline doesn't change shape regardless of which providers are wired.

## UX-recon target hit (Sprint J primary)

**Surface:** viral-recipe search results page (planned per the framework — patterns #2 + #9: eyebrow + filter chips).
**Status:** **Substrate ready, surface deferred.** The W42 gate output (slug + copy + attribution + score + reasons[]) is the data layer for a results-page UI. The actual /today chip + Mission-screen attribution panel + (future) per-result detail view are deferred to a follow-on commit alongside ANTHROPIC_API_KEY founder-unlock.

Recon discipline maintained: pattern named, deferral rationalised. Carry-forward to backfill: pattern #10 (Pod gallery made-it-ring) from Sprint I + the patterns #2/#9 surface from this sprint.

## Behavioural overlay — variable reward, NOT FOMO

Per the W43 plan note: the viral chip is the variable-reward novelty surface. Tone discipline:

- "Did you hear about ${creator}'s viral ${dish}?" — curiosity prompt
- NEVER "everyone's making this except you" — no FOMO
- NEVER "you're missing out" — no loss aversion
- Always reset-friendly — 4 dismissals = suppressed indefinitely without guilt

The `formatViralChipCopy` helper enforces the curiosity-styled template; the test pins the language so future edits can't slip into FOMO shape.

## RCA tally

0 RCAs on main this sprint.

The 0-RCAs-on-main streak now stretches **36 weeks** (Sprints A through J).

Mid-sprint catches that never reached main:

- W39: search-adapter sanitiser initial draft used a regex that stripped Unicode letters too — caught at the "café au lait" test.
- W40: virality classifier engagement-pattern regex over-matched "Mango" (ate the M). Tightened with `\b\d+(?:\.\d+)?\s*[mkb]\s*` to require digit + magnitude unit. Caught at first integration with the "plain dish name → no engagement boost" test.
- W41: cool-down state machine initial draft mutated input state. Refactored to spread + return new object. Caught by the immutability test.

## Founder-unlock status

- **TAVILY_API_KEY / BRAVE_SEARCH_API_KEY / SERPAPI_API_KEY:** still unset. W39 stub fixture runs end-to-end today.
- **ANTHROPIC_API_KEY:** still unset. W41 recipe extractor would use this; the dedup + cool-down work is independent and runs today against any candidate stream.
- All other H1 substrates unchanged.

## Carry-forward into Sprint K

- Sprint K (W44-W47) ships **per-cuisine vocabulary dictionary**.
  Recon target per the framework: patterns #2 + #10 (eyebrow categorisation + made-it ring on the cuisine cards).
- The viral chip surface integration carries to a backfill week.
- The Pod gallery #10 made-it-ring backfill from Sprint I also rolls forward.

## Acceptance for Sprint-J close

- [x] Search adapter substrate shipped + tested (W39).
- [x] Virality classifier shipped + tested (W40).
- [x] Recipe dedup + cool-down shipped + tested (W41).
- [x] Viral chip gate + ethics attribution shipped + tested (W42).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #19 + #20 absorbed (this doc).

## Retrospective

Sprint J's headline was the plan's own warning: "the most complex Y2 build because it intersects web search, ranking, attribution, dedup, cool-down, and ethics." Five weeks of careful pure-helper work delivered 114 new tests with zero RCAs. Ethics shipped as code (the gate can't fire without the attribution payload populated) is the most satisfying piece — the discipline isn't a doc, it's a type signature.

Sprint K opens with the per-cuisine vocabulary dictionary — different shape (curated content + small UI surface) but same discipline. The data layer is straightforward; the recon target (cuisine cards with eyebrow + made-it ring) is the polish piece.
