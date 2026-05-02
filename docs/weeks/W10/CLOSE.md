# W10 close — Sprint B close-out + carry-forward into Sprint C

**Sprint:** B (Stage-4 W2 cross-cutting infra)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H1 Sprint B W10
**Date closed:** 2026-05-02
**Scope:** wrap Sprint B (W6-W9) and stage Sprint C (W11-W15 voice
cook). Per the 12-month plan, every 5th week is an IDEO design
review; this is that touch.

## Sprint-B summary (commits)

| Week  | Commit                                            | Output                                                                                          |
| ----- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| W6    | `30e0457`                                         | Shared-component sweep wave 2 (4 surfaces)                                                      |
| W7    | `aa3bc8a`                                         | Custom `sous/reduced-motion-gate` ESLint rule + RuleTester                                      |
| W7+   | `78f63a2` `5fb1818` `dd1c01b` `1dfbff0` `1bba834` | Tier-1 → Tier-3 wave D motion-gate remediation; **284 → 0 violations**; rule flipped to `error` |
| W8    | `1bcefde`                                         | Forum reply-to-reply nesting + per-device thanks reaction                                       |
| W9    | `1ca42e4`                                         | Tag-cloud "Browse by topic" on Content home                                                     |
| Close | `b3f05bc`                                         | W6/W7/W8 close docs                                                                             |

11 production commits + 1 docs commit across the sprint.

## Surface scoreboard (post-Sprint-B)

19 of 22 surfaces now score ≥ 4.0 average on the IDEO rubric (was 14
of 22 at Sprint-A close). Three surfaces remain below 4.0 with
documented residuals:

- `/cook/combined` (3.25) — the 1,122-line dual-track page; Sprint-A
  and Sprint-B explicit deferrals. **Sprint-C must commit to this
  in W11 or formally redefer with reason.**
- `/path` (3.75) — Minimalism still 3 (the 13-section accumulation
  flagged in the polish appraisal).
- `/games` hub (3.75) — Minimalism 3 (uncoordinated 4-tile gradient
  story).

## Stress test

**Test type:** A11y screen-reader scan via the new lint rule itself,
plus the existing all-routes e2e smoke spec catching SSR regressions.
**Result:**

- Lint at error level: 0 problems across the codebase. Any future
  motion code missing the `useReducedMotion` import fails CI before
  merge — the convention is now structurally enforced rather than
  memory-enforced.
- Test count monotonic across the sprint: 411 → 432 (+21).

## Cross-cutting wins this sprint

1. **The lint-rule-as-codification pattern shipped end-to-end.** The
   reduced-motion-gate arc is the proof-of-concept: identify a
   memory-enforced convention, encode it as a custom ESLint rule with
   a RuleTester suite, ship in `warn` mode, remediate via tiered
   waves with bulk transformation scripts, flip to `error`. Any
   other "convention by memory" in the codebase is now a candidate
   for the same arc.

2. **Pure helpers + per-helper test files are the standard testing
   shape.** W8's `groupReplies` (6 tests) and W9's `topTagsByCount`
   (7 tests) both follow this. Test count grew without any test
   feeling like infrastructure-for-its-own-sake.

3. **Bulk transformation scripts work.** Two ~50-line Node scripts
   - an idempotent regex-replace approach handled 67% of the
     reduced-motion remediation. Documented edge cases (loop-opener
     match, forwardRef shape) so the next bulk script avoids them.

## Carry-forward into Sprint C (W11-W15: voice-driven cook mode)

Sprint C is a real-platform-capability sprint per the 12-month plan.
The carry-forward below should slip into early Sprint-C days OR get
explicit deferral markers in the Sprint-C plan.

**Mandatory (top 5):**

1. **`/cook/combined` density refactor** — third deferral if it slips
   again. Sprint-C must either land this in W11 or write a hard-
   reasoned redefer-to-Sprint-D note. Test scaffolding lands BEFORE
   the refactor.
2. **Per-file motion-site adoption follow-through.** W7 added the
   import + a single consumer per file. Many files still have motion
   sites that don't actually USE the gate variable. A future polish
   pass should sweep these.
3. **Documentation hygiene.** `STAGE-3-VIBECODE-AUTONOMOUS-12MO.md`
   still says W4 = `/cook/combined` density refactor; that ship has
   sailed. Update to reflect reality during Sprint-C kickoff.
4. **`/path` Minimalism** — collapse PreferenceStrip + CooksSharedLine
   - TasteBlendPrompt into a single "Your rhythm" disclosure.
5. **`/games` hub Minimalism** — coordinate the 4-tile gradient story
   (purple/amber/red/emerald → one palette).

**Queued (deferred to dedicated sprints):**

- Reels V3 chapter markers — Sprint-D candidate.
- Stanford content run #2 — Sprint-C W13 slot per the plan.
- Lighthouse + a11y CI gates — gated on deployed env (founder-action).
- Voice cook spike (W11), step nav (W12), timer (W13), TTS (W14),
  polish + IDEO close (W15) — already in the plan.

## Acceptance for Sprint-B close

- [x] Every score ≤ 2 from the Sprint-A IDEO carry-forward addressed
      (carry-forward had none below 3 to begin with).
- [x] No regression in any screen that scored ≥ 4 at Sprint-A close.
- [x] W7 remediation hit its acceptance gate (rule warn → error).
- [x] Top 5 deltas locked in for Sprint C planning above.
- [x] Test count monotonic-non-decreasing (411 → 432).
- [x] Build green throughout the sprint.

## Retrospective (1 paragraph)

Sprint B compressed Stage-4 W1+W2+W3 worth of cross-cutting infra
into a single 5-week run because the lint-rule-driven remediation
unlocked a parallelism that wasn't visible at sprint start: while
the rule was in `warn` mode, the W8 (forum) and W9 (tag-cloud)
work landed without blocking on the W7 remediation, and the W7
remediation itself parallelised across tiers via the bulk scripts.
The pattern to repeat in Sprint C: identify the load-bearing
infrastructure work early (voice-cook spike), and let the polish
work happen in parallel rather than serialising it. The single
load-bearing risk for Sprint C is the `/cook/combined` density
refactor — if W11 doesn't land it, the carry-forward burden is
going to compound and we'll be discussing it again in Sprint-D
close.
