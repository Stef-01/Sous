# Y4 Sprint E (W17-W20) — Android Capacitor + device tokens + adaptive icon + device-info

> **Plan ref:** `docs/YEAR-4-VIBECODE-PLAN.md` Sprint E
> **Date closed:** 2026-09-20
> **Bi-weekly IDEOs:** #9 (W17+W18) + #10 (W19+W20) absorbed.

## Build state at review

- Latest commit on main: `a30a428` (W19 device-info reporter).
- Test count: **2463** (was 2425 at Sprint D close — **+38 this sprint**).
- Four-gate green throughout.

## What landed in Sprint E

| Week | Output                                                                                                |
| ---- | ----------------------------------------------------------------------------------------------------- |
| W17  | `device-tokens.ts` — per-device push token ledger with stale-pruning, dedup, and last-seen freshness. |
| W18  | `adaptive-icon.ts` — Capacitor adaptive-icon + splash-screen manifest derived from W3 brand tokens.   |
| W19  | `device-info.ts` — privacy-respecting device class / screen bucket / locale reporter with redaction.  |
| W20  | Sprint E close + retro (this doc).                                                                    |

## Privacy posture

The W19 reporter passes inputs in (no globals read) and buckets dims so no exact-pixel fingerprinting hits the analytics ledger. `redactForAnalytics` drops OS minor versions + collapses locale to language-only before forwarding to third-party consumers (BetterStack, PostHog, etc., when those land in Y5). Aligned with Sous's user-trust pillar.

## Cross-cutting wins

1. **Half of Y4 is now substrate-complete.** Sprints A through E ship 5 dashboards / hooks / contracts that all light up at the same key-flip moment. The Anthropic / Stripe / Postgres / R2 / VAPID / APNs / FCM founder unlocks compose linearly: each unlock turns on a layer the next one builds on.
2. **Per-device fan-out pattern resolved.** W17 device-tokens + W14 channel selection + Sprint F's W22 delivery-log make a complete fan-out unit. The Y2 W22 notification queue keeps its same surface — the only change at the Sprint F flip is "iterate device-tokens instead of single-token send".
3. **Brand consistency enforced via tokens.** W18 derives the icon + splash from the same `brand.cream / brand.green / brand.dark` tokens the Y3 W3 design system already uses. A future palette swap (dark mode, seasonal variants) propagates through icon / splash / web UI in one change.

## RCA tally

0 RCAs on main this sprint. Streak at **~115 weeks**.

Mid-sprint catches:

- W17: First `dedupeDeviceTokens` returned a Map iterator instead of a list. Caller-side `.length` access broke the `device-tokens.test.ts` assertion. Lifted to `Array.from(seen.values())`.
- W18: `clampSplashDuration(Number.NaN)` initially returned 0 (Math.min/Math.max coerced NaN). Added the `Number.isFinite` guard.

## Acceptance for Sprint-E close

- [x] Push device-token ledger shipped (W17).
- [x] Adaptive-icon + splash helper shipped (W18).
- [x] Cross-platform device-info reporter shipped (W19).
- [x] Sprint E close doc filed (W20, this doc).
- [x] All four gates green throughout.

## Carry-forward into Sprint F

- Sprint F (W21-W24) ships **push-notification scheduling helper + delivery-log substrate + quiet-hours + per-user opt-out**. The W14 channel selector + W17 device-tokens + W19 device-info all feed into the W22 delivery dispatcher.
