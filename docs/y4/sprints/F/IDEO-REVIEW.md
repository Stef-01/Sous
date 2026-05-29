# Y4 Sprint F (W21-W24) — Push scheduling + delivery log + quiet hours

> **Plan ref:** `docs/YEAR-4-VIBECODE-PLAN.md` Sprint F
> **Date closed:** 2026-10-18
> **Bi-weekly IDEOs:** #11 (W21+W22) + #12 (W23+W24) absorbed.

## Build state at review

- Latest commit on main: `c2a5ebf` (post-rebase recovery + W23).
- Test count: **2512** (was 2463 at Sprint E close — **+49 this sprint**).
- Four-gate green: lint ok (0 errors), typecheck ok, test ok (2512/2512), build ok.

## What landed in Sprint F

| Week | Output                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------ |
| W21  | `schedule-planner.ts` — 5-intent → scheduledFor + retry plan with rhythm-window clamping. 10 tests.          |
| W22  | `delivery-log.ts` — per-attempt aggregator with channel/intent/outcome rollups + success rate. 10 tests.     |
| W23  | `quiet-hours.ts` — gate decision combining opt-out + quiet-window + urgent bypass. 15 tests + recovery work. |
| W24  | Sprint F close + retro (this doc).                                                                           |

## Push delivery pipeline (Sprint A-F view)

The full pipeline now consists of:

1. **Y2 W22 notification queue** — generates payloads (rhythm, pod, viral, charity, cook).
2. **Y4 W14 key-registry** — picks the right channel (VAPID / APNs / FCM) for the platform + checks key presence.
3. **Y4 W17 device-tokens** — resolves user → list of (channel, token) pairs; stale-pruned + deduped.
4. **Y4 W21 schedule-planner** — picks scheduledFor + retry policy per intent, rhythm-bound.
5. **Y4 W23 quiet-hours gate** — final go/no-go before dispatch with opt-out + quiet-window suppression.
6. **Y4 W22 delivery-log** — writes one entry per attempt; the dashboard reads aggregate + success rate.

Every step is a pure helper. The actual transport call is the only impure boundary, and Sprint F lays the contract for that call so the wire-up at the founder-key flip is mechanical.

## Cross-cutting wins

1. **Substrate compounds.** The 5 push helpers (W14 + W17 + W19 + W21 + W22 + W23) compose into a complete dispatch pipeline. None of them know about the others' implementation; each is gated by its own pure contract.
2. **Privacy-first defaults.** Quiet hours default to 22:00–07:00 local; rhythm-nudge auto-clamps into the user's cooking-active window; per-intent opt-outs available. No user has to think about quiet hours unless they want to override.
3. **Recovery discipline held.** A truncated external commit landed on main; the four-gate audit caught it on the next rebase, the recovery was surgical (4 files restored from prior version + 3 new files reduced-motion-gated), and the streak continued.

## RCA tally

0 RCAs on main this sprint. The post-rebase fix was a recovery
of an external commit's breakage, not an RCA from autonomous
work — the four-gate process caught the issue the moment it
landed in our branch and produced a clean fix in one commit.

Streak at **~119 weeks**.

Mid-sprint catches:

- W21: First `viral-recipe-saved` plan didn't clamp into rhythm window when the 5m debounce pushed past 22:00. Added the clamp to all rhythm-bound intents uniformly.
- W22: First `byOutcome` rollup omitted zero-count outcomes. Switched to fixed five-bucket return so the dashboard never has to handle "missing outcome" states.
- W23: First `gateDelivery` returned `{ deliver: true }` for opted-out-all when the intent matched a urgent set. Reordered checks so opt-out-all always wins.

## Acceptance for Sprint-F close

- [x] Schedule planner shipped (W21).
- [x] Delivery log shipped (W22).
- [x] Quiet-hours gate shipped (W23).
- [x] Sprint F close doc filed (W24, this doc).
- [x] All four gates green throughout (post-rebase recovery applied).

## Carry-forward into Sprint G

- Sprint G (W25-W28) ships **V3 trainer feedback log + cohort schema + retune contract + drift dashboard**. The W22 delivery-log pattern (rolling-window aggregator + per-dimension rollups) translates directly to the trainer-feedback aggregate. The Y4 dashboard pattern (W3 LLM-spend + W7 charity + W22 delivery) gets its fourth instance with W27.
