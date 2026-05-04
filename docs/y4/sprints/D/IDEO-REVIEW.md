# Y4 Sprint D (W13-W16) — iOS Capacitor + push-key + native plugins

> **Plan ref:** `docs/YEAR-4-VIBECODE-PLAN.md` Sprint D
> **Date closed:** 2026-08-23
> **Bi-weekly IDEOs:** #7 (W13+W14) + #8 (W15+W16) absorbed.

## Build state at review

- Latest commit on main: `a46ee18` (W15 haptics + camera).
- Test count: **2425** (was 2386 at Sprint C close — **+39 this sprint**).
- Four-gate green: lint ok, typecheck ok, test ok, build ok.

## What landed in Sprint D

| Week | Output                                                                                        |
| ---- | --------------------------------------------------------------------------------------------- |
| W13  | `src/lib/native/platform.ts` — Capacitor + UA-fallback platform detection + feature matrix.   |
| W14  | `src/lib/push/key-registry.ts` — VAPID + APNs + FCM presence-check + selectPushChannel.       |
| W15  | `haptics.ts` (5-intent → pattern resolver) + `camera-permission.ts` (platform-specific copy). |
| W16  | Sprint D close + retro (this doc).                                                            |

## Founder-key contract

| Substrate      | Founder key / asset                                       | Sprint that lights it up   |
| -------------- | --------------------------------------------------------- | -------------------------- |
| iOS shell      | Apple Developer membership + Xcode build + TestFlight     | Sprint D in production app |
| APNs           | `APNS_TEAM_ID` + `APNS_KEY_ID` + `APNS_PRIVATE_KEY` (.p8) | Sprint F (delivery)        |
| VAPID          | `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY`                  | Sprint F (web fallback)    |
| Camera capture | (Capacitor plugin — bundled with shell)                   | Sprint D in production app |

## Cross-cutting wins

1. **Forward-compatible call sites.** Every haptic / camera / push call now goes through a pure planner that decides the dispatch path. Web build → noop / web-vibrate. Native build → real plugin call. Same call site code.
2. **Privacy-respecting prompts.** The W15 camera prompt copy says "on-device first; nothing leaves until you confirm." Aligns with the Sous strategy of camera-as-fluency-tool not surveillance-tool.
3. **Three-channel push contract resolved up front.** Sprint F doesn't need to learn about APNs vs FCM vs VAPID — W14 already encapsulates the per-channel presence check + the rationale string.

## RCA tally

0 RCAs on main this sprint. Streak at **~111 weeks**.

Mid-sprint catches:

- W13: First detector returned `"electron"` from Capacitor's `getPlatform()` and propagated it as `AppPlatform`. Tightened the union to `web|ios|android` only and folded unknowns to `web`.
- W14: First `selectPushChannel` returned `null` for unconfigured channels. Switched to always returning a channel + a `ready` flag so callers don't have to null-check.

## Acceptance for Sprint-D close

- [x] Native platform detector shipped (W13).
- [x] Push key registry shipped (W14).
- [x] Haptics + camera-permission helpers shipped (W15).
- [x] Sprint D close doc filed (W16, this doc).
- [x] All four gates green throughout.

## Carry-forward into Sprint E

- Sprint E (W17-W20) ships **Android Capacitor scaffold + FCM substrate + adaptive-icon helper + cross-platform device-info reporter**. The W13 detector + W14 registry stay unchanged; W15 haptics + camera planners get Android-side coverage tests in W17.
