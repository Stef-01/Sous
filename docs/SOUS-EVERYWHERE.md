# Sous Everywhere — the product ecosystem ledger

The in-app showcase (`/everywhere`, reached from the owl profile sheet) that
advertises every way Sous shows up in a user's life. Built from the
desire-first thesis (`docs/DESIRE-FIRST-THESIS.md` §4–6). This doc is the
**rule-12 ledger**: what's AUTO-BUILD and live now vs FOUNDER-GATED, and the
exact env contract so a gated surface lights up with one config edit.

## The shared craving brain

Everything pulls from one pure selector so the wallpaper, the widget feed, and
the gallery all agree within a day:

- `cravingForNow(ctx)` — `src/lib/engine/craving-for-now.ts`. Picks the single
  most crave-worthy **real** meal for `{ hour, month, seed }` (daypart
  eligibility from the authored `meals.json` `dayparts`, a hero-photo vividness
  bonus, a light seasonal-cuisine lean, and a date-seeded daily rotation).
  Clock injected, Result-typed, golden-tested. Never returns a slug absent from
  `meals.json` (rule 7).
- `gallerySequence(ctx)` — the whole daypart-eligible pool, photographed dishes
  first, seeded shuffle. Slugs only; routes resolve images.

## Surfaces

| Surface                                                                    | Status            | Gate / notes                                                                                                          |
| -------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| In-app showcase `/everywhere`                                              | **LIVE**          | repo only                                                                                                             |
| Dynamic wallpaper — `/api/wallpaper/[slug]` (`next/og`) + "Save wallpaper" | **LIVE**          | honest "you set it"; unknown slug 404s; no-photo branch is gradient + type only (rule 7)                              |
| Stable daily wallpaper — `/api/wallpaper/today` (302 → today's slug)       | **LIVE**          | the URL the iOS Shortcut polls                                                                                        |
| Rotating gallery `/everywhere/gallery`                                     | **LIVE**          | reduced-motion → manual advance                                                                                       |
| Widget feed — `/api/widget/today` JSON                                     | **LIVE**          | the one contract the native widget + watch poll; optional `?hour=&month=` for local clock                             |
| Today's craving (deep-link to `/today`)                                    | **LIVE**          | reuses the existing deck; does NOT touch the frozen Today/guided-cook surfaces                                        |
| iOS Shortcut auto-wallpaper                                                | **STUB**          | endpoint live; needs the published `.shortcut` asset + `NEXT_PUBLIC_SOUS_SHORTCUT_URL` (the row hides until set)      |
| Hunger-window push                                                         | **STUB**          | `usePushSubscription` + `NotifyMeRow` ship dormant; needs VAPID keys + a subscription store + a `sw.js` push listener |
| Native home/lock-screen widget                                             | **FOUNDER-GATED** | Apple/Google account + Capacitor/WidgetKit shell; consumes `/api/widget/today`                                        |
| Apple Watch glance                                                         | **FOUNDER-GATED** | native shell + watch target; same feed                                                                                |
| Desktop menubar gallery                                                    | **STUB**          | links to `/everywhere/gallery` now; a Tauri menubar is the native form later                                          |

## Honesty (the load-bearing platform truth)

A web app **cannot** silently set the OS wallpaper. So the button is literally
"Save wallpaper" (a download), the sub-line states the truth ("save it, then
pick it in Photos"), and the only "auto" path is a real user-installed iOS
Shortcut. Founder-gated tiles never render a fake working state — they read the
real push status and show "Notify me" (records intent locally; flips to a real
subscribe the moment VAPID lands).

## Env contract

| Var                             | Used by                               | Effect when set                                                            |
| ------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`  | `usePushSubscription` (client)        | push status flips `dormant → ready`; the Notify-me tap subscribes for real |
| `VAPID_PRIVATE_KEY`             | server dispatch (founder-gate commit) | enables server-side push send                                              |
| `SOUS_PUSH_NOTIFY_ENABLED`      | `src/lib/notify/push-flag.ts`         | master off-switch (`"false"` forces stub)                                  |
| `NEXT_PUBLIC_SOUS_SHORTCUT_URL` | `WallpaperPreview`                    | reveals the "auto-set daily" Shortcut row                                  |
| `NEXT_PUBLIC_SITE_URL`          | (already set)                         | absolute origin; the wallpaper route prefers the request origin            |

## iOS Shortcut recipe (auto-wallpaper)

The endpoint `/api/wallpaper/today?w=&h=&hour=18` is live, so auto-wallpaper is
usable **now** without any founder asset — the `/everywhere` "Auto-set it daily
(iOS)" disclosure walks any user through building the Shortcut, and copies the
device-sized daily link. The recipe:

1. Shortcuts app → **Automation** → ＋ → **Time of Day** (e.g. 7 AM, daily; "Run
   Immediately").
2. Add **Get Contents of URL** → paste the copied link
   (`https://<site>/api/wallpaper/today?w=<dpr-px-w>&h=<dpr-px-h>&hour=18`).
   `hour=18` pins the evening "tonight you're making" daypart regardless of when
   the automation runs (and side-steps the UTC-server-clock daypart skew —
   `/api/wallpaper/today` also accepts `?hour=&month=` for a true local clock).
3. Add **Set Wallpaper Photo** → use the result, Lock Screen.

**Founder one-tap upgrade:** export that Shortcut once, host the `.shortcut`
(iCloud link), set `NEXT_PUBLIC_SOUS_SHORTCUT_URL`, and the disclosure swaps the
manual recipe for a "Get the one-tap Shortcut" button — integration is one env
edit.

## Push — fully wired, one env edit from live

The whole Web Push path is built and ships DORMANT (stub mode until VAPID):

- `public/sw.js` now has `push` + `notificationclick` handlers (shows the
  craving notification, deep-links the cook on tap).
- `usePushSubscription().subscribe()` requests permission, registers the SW,
  creates a real `PushSubscription`, and POSTs it to `/api/push/subscribe`.
- `/api/push/subscribe` saves it (`src/lib/notify/push-store.ts` — an in-memory
  dev singleton; persistence is a one-impl swap to the diary-sync write-through).
- `/api/push/test` dispatches today's craving to every stored sub via `web-push`
  (returns **503** while VAPID is unset — the honest dormant response). The
  future `/api/cron/craving-push` is the same call on a Vercel-Cron schedule.

**To go live** (founder): add to `.env.local` (and the Vercel project env) — the
keys are generated, gitignored, and never committed:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public>
VAPID_PRIVATE_KEY=<private>
VAPID_SUBJECT=mailto:you@sous.app
```

Restart; the Notify-me tiles flip from "Soon" to "Enable" and subscribing
works. `npx web-push generate-vapid-keys --json` regenerates the pair.

## Deferred (the only remaining founder-gate)

- `/api/cron/craving-push` (Vercel Cron) — the scheduled hunger-window send (the
  `/api/push/test` dispatch on a cron trigger); needs the deploy + `CRON_SECRET`.
- Swap the in-memory `push-store` for the Supabase write-through (cross-device,
  survives restarts) — the seam is already there.
