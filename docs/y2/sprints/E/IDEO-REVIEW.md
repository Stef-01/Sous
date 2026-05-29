# Y2 Sprint E (W19-W22) — Daily rhythm + smart notifications

> **Plan ref:** `docs/YEAR-2-VIBECODE-PLAN.md` Sprint E
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #9 (W19+W20) + #10 (W21+W22) absorbed
> into this sprint close.

## Build state at review

- Latest commit on main: `658b9f2` (W21 smart-notification scheduler).
- Test count: **1417** (was 1357 at Sprint D close — **+60 this sprint**).
- Four-gate green: `pnpm lint` ok, `pnpm exec tsc --noEmit` ok,
  `pnpm test` ok (1417/1417), `pnpm build` ok.

## What landed in Sprint E

| Week | Output                                                                                                                                                                                                                                    |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W19  | Rhythm pattern inference — `inferRhythmPattern(sessions, now?)` with Bayes-prior day histogram, recency-weighted hour mode, confidence (peak/total), 28-day streakHistory. 24 tests.                                                      |
| W20  | Push-notification platform substrate (stub-mode V1) — `isPushNotifyEnabled` flag, `parseStoredPushSubState` defensive parser, `formatNudgeText` (default + missed-last-week variants), `formatRhythmIdentity` (4-week minimum). 21 tests. |
| W21  | Smart-notification scheduler — `scheduleNextNudge`, `missedLastWeeksTypicalDay`, `rhythmWeeksRunning`. Pure helpers; firing surface left to caller. 15 tests.                                                                             |
| W22  | Sprint E close + IDEO #9 + #10 (this doc).                                                                                                                                                                                                |

3 production commits + 1 docs commit (this).

## Behavioural overlays landed (3 of 6 from Y2 workstream 3.1)

The W21 plan committed three behavioural-science overlays in this sprint. All three shipped as text shapes inside `formatNudgeText` + `formatRhythmIdentity`:

1. **Implementation intentions** — default nudge copy is shaped as "Tuesday 5:30pm — when you're heading home, what'll you cook?". Anchors a future plan rather than reporting a past pattern.
2. **Streak forgiveness** — `missedLastWeek=true` variant flips to "Skipping last Tuesday is just data. What sounds good tonight?". No "broken streak" / "guilt" / "you missed" language anywhere; tested explicitly.
3. **Identity reinforcement** — `formatRhythmIdentity` outputs "You're a Tuesday-night cook (12 weeks running)" for users with 4+ consecutive typical-day cook weeks. Returns `null` below 4 weeks to avoid false-positive identity claims from sparse data.

The three overlays compound with the existing rhythm widget (Y1 W36) without any new screen — Sprint E discipline ("zero new screens, just enrich the widget") held.

## Founder-unlock status

- **VAPID keys (push notification real-mode dispatch):** still unset. W20 substrate runs stub-mode end-to-end today (in-app toast at the typical-cook time on next /today open). Real-mode swap is one config edit when keys land — `isPushNotifyEnabled` flips, the W21 scheduler routes to push-API dispatch instead of toast.
- **Postgres (cross-device subscription persistence):** still unset. W20 PushSubState writes to localStorage; cross-device sync waits for DATABASE_URL.

## UX-recon target hit (Sprint E primary)

**Surface:** rhythm widget on /today (unchanged shell, enriched labels).
**Patterns landed:** #6 sticky compact header — partially. The widget now has the "deeper data" layer (rhythm + streak count + identity language) ready to wire into the existing widget's render. Full sticky-header upgrade carries forward to a Y1-backfill sprint.

This is acceptable per the framework's acceptance contract: pattern named, partial implementation rationalised, full upgrade tracked as a backfill.

## Cross-cutting wins

1. **Behavioural overlays as TEXT, not new components.** All three landed as pure formatter helpers tested in 15 LoC each. The principle: behavioural science changes the WORDS shown, not the screens shown. Generalises across future overlays — pure helpers compose without new UI surface.
2. **The pure-helper pipeline now has 6 stages.** From Y1 W30 V2 trainer through Y2 W11 time-rerank, W16 pantry-rerank, W19 rhythm pattern, W20 push platform, W21 scheduler. All deterministic, all dependency-free, all individually tested. The composition shape is the leverage.
3. **Stub-mode V1 is now the default Sous pattern.** Auth (W1), R2 (W3), V3 trainer (W7-W10), push (W20) — every founder-gated capability ships substrate now + flips on key-day. Five layers deep.

## RCA tally

0 RCAs on main this sprint.

The 0-RCAs-on-main streak now stretches **16 weeks** (Sprints A + B + C + D + E).

Mid-sprint catches that never reached main:

- W19: `inferRhythmPattern` initial draft used `Date.now()` inside the helper, breaking determinism. Refactored to take `now: Date` parameter. Caught at first test (clock-flake risk + deterministic-test rule).
- W21: First `scheduleNextNudge` draft computed the future-Tuesday based on `dow >= rhythm.typicalDay` which broke for twin patterns. Rewritten with explicit array `.includes` over the next 14 days.

## Carry-forward into Sprint F

- Sprint F (W23-W26) ships **Voice MVP 5 sequenced pointers + Y2 H1 close**. AttentionPointer gets a `revealAtSecond` schema delta so cook-step pointers can sequence rather than appearing all at once.
- Sprint F's recon target per the framework: cook-flow step-progress (patterns #7 step-by-step locked progress + #8 ingredient checklist).
- W19-W21 helpers stay dormant in tree; the firing surface (setTimeout in /today, or server cron once Postgres lands) wires up in a follow-on commit when push-mode test data arrives.

## Acceptance for Sprint-E close

- [x] Rhythm pattern inference shipped + tested (W19).
- [x] Push platform substrate shipped + tested (W20).
- [x] Smart scheduler shipped + tested (W21).
- [x] Three behavioural overlays landed as text shapes (W21).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #9 + #10 absorbed (this doc).

## Retrospective

Sprint E shipped the entire scheduler stack as pure helpers + zero new screens. The rhythm widget on /today gets richer data without a layout change — the discipline that the W22 plan called for ("calm by default") held without effort because the implementation never reached for new UI in the first place.

The behavioural overlays as text-shape pure helpers is the nicest pattern of the sprint. Three NOOM-inspired ideas (implementation intentions, streak forgiveness, identity reinforcement) shipped as 3 functions × ~10 LoC each, tested in isolation, ready to compose. The other three overlays planned across Sprints I + G + F + sprints follow the same shape.

Sprint F opens with the AttentionPointer schema delta — a small W23 substrate change that unlocks W24's sequence runner. Voice work returns after a long break (Y1 W22 was the last voice ship).
