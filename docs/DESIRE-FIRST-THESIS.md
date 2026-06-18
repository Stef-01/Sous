# The Desire-First Thesis — Sous as a Craving Engine

> Contrarian bet: **a food/health app wins by manufacturing DESIRE for food that
> is both genuinely good for you and extremely tasty — not by policing calories,
> manufacturing guilt, or restricting.** Every other diet app is a subtractive
> ledger (what you did wrong, what you can't have). Sous is an additive engine of
> _wanting_: it shows you, at the right moment, the one dish you'll crave and can
> feel great about — and removes every gram of friction between that craving and
> the first bite.

This doc is the strategy + an exhaustive feature catalog + a phased execution
plan with "how to code it at each level of the pipeline."

---

## 1. Why desire, not discipline

The entire diet-app category is built on **restriction psychology** — logging,
deficits, red/green scores, streaks-as-guilt (MyFitnessPal, Noom, Yuka). It
treats eating as a problem to be controlled. It works for a motivated minority
for a few weeks, then the guilt-loop burns people out. The category's churn is
its tell.

The contrarian move: **healthy eating fails on the _wanting_ step, not the
_knowing_ step.** People already know salmon beats a drive-thru. They don't
_want_ the salmon in the moment of decision — the drive-thru is more vivid, more
available, more anticipated. So the leverage isn't more information or more
guilt; it's **making the good food the most desired, most vivid, most
frictionless option at the moment of craving.** Win the craving and the behavior
follows for free.

Sous is uniquely positioned for this: it already has a _craving_ search ("What
are you craving?"), a pairing engine that surfaces dishes that are good AND
tasty, real food photography, and a companion (Dobe) that can express wanting.
We are one design pivot away from being a **craving engine**, not a tracker.

## 2. The behavioral science (the grounding)

- **Wanting ≠ liking (Berridge & Robinson).** The brain's "wanting" system
  (mesolimbic dopamine, incentive salience) is _separable_ from "liking"
  (hedonic pleasure). You can engineer _wanting_ with cues even before any
  consumption. **Implication:** our job is to attach incentive salience to good
  food via vivid, well-timed cues — a craved dish on the lock screen _is_ a
  wanting-cue.
- **Cue-induced craving.** Food cues (images, smells, context) reliably spike
  craving and approach behavior. Vivid food imagery is the most available cue we
  can deploy on a phone. **Implication:** the dish photo is the product, not
  decoration.
- **Anticipation > consumption (the dopamine ramp).** Dopamine peaks on
  _anticipation_ of reward, not receipt. The look-forward-to-it window is where
  desire lives. **Implication:** surface the dish _before_ the hunger window, and
  let the user anticipate (a "tonight you're making…" ramp).
- **Fogg Behavior Model: B = MAT** (Motivation × Ability × Trigger). Behavior
  happens when a **trigger** lands on someone with enough **motivation** and
  **ability**. Diet apps over-index on motivation (willpower) and ignore the
  other two. **Implication:** raise _ability_ (one-tap from craving→cook,
  pre-gathered ingredients) and engineer _triggers_ at peak-motivation moments
  (hunger windows), and you need far less willpower.
- **Vicarious eating / "food porn."** Looking at appetizing food activates
  reward and salivation; done right it builds appetite _for that specific dish_.
  Done in a feed, it's doomscroll; done as a single, well-timed, _cookable_ image
  with a one-tap path, it's a conversion.
- **Variable reward + the Zeigarnik effect.** A rotating, slightly-unpredictable
  gallery of crave-worthy dishes keeps attention (variable reward); an
  _unfinished intention_ ("you said you'd make this") nags pleasantly (Zeigarnik)
  toward completion.

**The ethical frame (non-negotiable).** This is desire engineering pointed at
_genuinely good food the user already wants to eat more of_ — never dark-pattern
manipulation toward junk or overconsumption. We surface the healthy-and-tasty
intersection, time cues to real hunger windows (not 2am binge-baiting), and every
craving has a one-tap path to actually cooking it. Desire **in service of the
user's own stated goals.** If it ever feels like a casino, we've failed.

## 3. The design principle

> **Make the good thing the most-wanted thing, and make wanting it one tap from
> doing it.** Every surface answers: "what would make them crave _this_ dish
> right now, and what's the shortest path from that craving to the first bite?"

Three levers, in order:

1. **Vividness** — the most appetizing possible image/motion of the dish, on the
   surfaces people already look at (lock screen, home screen, desktop, the app).
2. **Timing** — deliver the cue in the _anticipation window_ before a hunger
   window, personalized to the user's rhythms (the W2 time-of-day reranker
   already knows daypart/season).
3. **Frictionlessness** — from "I want that" to "I'm cooking it" in one tap:
   ingredients pre-checked against the pantry, the guided cook one tap away.

---

## 4. The feature catalog

Each feature: **what it is · the desire mechanism · feasibility tag · how to code
it at each pipeline level.** Feasibility tags: **[PWA-now]** buildable in our
Next.js PWA today · **[native]** needs a real iOS/Android shell (Capacitor/RN) ·
**[extension]** browser extension · **[desktop]** a small Electron/menubar app.

### Tier 1 — The founder's three (the spine)

**4.1 Lock-screen / home-screen craving widget** · _cue-induced craving at glance
frequency (people see their lock screen 80–150×/day)._ · **[native]** (true iOS
WidgetKit / Android widget) with a **[PWA-now]** approximation.

- _Data level:_ a `cravingForNow(user, daypart, season, pantry)` selector reusing
  the pairing engine + W2 context reranker → returns the single most crave-worthy
  good dish + its hero image. Pure, testable.
- _API level:_ `/api/widget/today` returns `{ dish, imageUrl, deepLink }`
  (cacheable, no auth in the trusted-cohort phase).
- _PWA-now:_ an installable PWA + a "Today's craving" route that iOS can save to
  home screen; push a daily image via the Web Push you'd build in 4.2.
- _Native:_ a thin Capacitor/Expo shell with a WidgetKit/Glance widget that polls
  `/api/widget/today` and deep-links `sous://cook/<slug>`.

**4.2 Hunger-window push notifications with the dish image** · _a trigger (Fogg)
delivered at peak motivation, carrying the vivid cue._ · **[PWA-now]** (Web Push
works on installed PWAs incl. iOS 16.4+) → richer **[native]**.

- _Data level:_ `hungerWindows(user)` derived from cook-session + diary timestamps
  (we already compute cooked-today / cooks-this-week for the Dobe mood — same
  source). Returns the 1–3 daily anticipation windows (e.g. 16:30 for dinner).
- _Scheduling level:_ a cron/edge job (`/api/cron/craving-push`) that, per user,
  picks `cravingForNow` and sends a Web Push with the hero image + "Tonight:
  Honey-Glazed Salmon — 15 min. Tap to gather." deep-linking to the mission.
- _Client level:_ `usePushSubscription()` (service worker + VAPID keys) — the
  service-worker scaffold is the only new infra; reuse the existing tRPC for the
  subscription store (founder-gated on VAPID + a server, like the recipes path).

**4.3 Dynamic wallpaper that becomes tonight's craved dish** · _ambient,
ever-present anticipation cue; the dish "rests" in your environment until you
want it._ · **[native]** for true auto-set wallpaper; **[PWA-now]** as a
downloadable/"set as wallpaper" beautiful craving card.

- _Honesty:_ a web app **cannot** silently change the OS wallpaper — that's a
  hard platform boundary. The web-feasible version is a one-tap _generated
  wallpaper image_ (the dish, plated, with a tasteful "tonight" caption sized to
  the user's device) the user saves/sets; the native version (a Shortcuts
  automation or a companion app) can auto-rotate it.
- _Data level:_ a `wallpaperFor(dish, device)` renderer → an OG-image-style
  endpoint `/api/wallpaper/[slug]?w=1179&h=2556` (Next.js `ImageResponse`)
  composing the hero photo + minimal type. Pure + cacheable.
- _PWA-now:_ "Set as wallpaper" → download the generated image; plus an iOS
  **Shortcuts** recipe we publish that pulls `/api/wallpaper/today` daily and
  sets it (no app needed — a clever PWA-adjacent hack).
- _Native:_ a tiny companion app with a wallpaper-rotation permission.

### Tier 2 — Ambient desire surfaces

**4.4 Desktop menubar / gallery widget** · _a rotating gallery of crave-worthy
dishes idling on your computer; glanceable wanting during the workday slump._ ·
**[desktop]** (Electron/Tauri menubar) + **[PWA-now]** a `/gallery` fullscreen
rotating route you can pin as a browser tab or a macOS Stage-Manager window.

- _Data level:_ `gallerySequence(user)` → an ordered, shuffled (seeded) list of
  good+tasty dishes weighted by craving fit + novelty.
- _PWA-now:_ a `/gallery` route — full-bleed dish photos cross-fading on a timer
  (reusing the motion tokens), each tappable → cook. Pin it as a tab/PWA window.
- _Desktop:_ a Tauri menubar app (~tiny) that loads `/gallery` and rotates in the
  tray, with a global hotkey to "cook the one I'm looking at."

**4.5 The Doberman _craves_ the dish (companion-led wanting)** · _social/parasocial
proof — your companion wanting it makes you want it; the pet already reacts to
real cooking._ · **[PWA-now]** (we own the Dobe system).

- _Data level:_ extend `mascotMood` with a `craving` state keyed to
  `cravingForNow`; Dobe looks longingly at a thought-bubble of tonight's dish on
  the Today header / pet room.
- _UI level:_ a tasteful "Dobe's craving Honey-Glazed Salmon 🐟" beat on Today,
  one tap → mission. Reuses the win-screen reaction + speech-bubble pattern.

**4.6 Anticipation ramp ("tonight you're making…")** · _the dopamine ramp — pre-load
the evening's dish in the morning so the user anticipates it all day._ ·
**[PWA-now]**.

- _Data level:_ a once-daily `tonightsPick(user)` stamped at first-open; surfaced
  as a calm Today banner + the 16:30 push.

**4.7 "Make it irresistible" plating + the 3-second hero loop** · _vividness — a
2–3s looping cinemagraph (steam rising, glaze dripping) beats a still by an order
of magnitude on craving._ · **[PWA-now]** (short looping mp4/webp on the hero).

- _Asset level:_ where we have step video/burst frames (the export folders have
  16–27 shot sequences — a Ken-Burns/crossfade loop is generatable from stills),
  a `HeroLoop` component (reduced-motion → still).

**4.8 Hunger-aware reordering of the deck** · _timing + ability — at 5pm the deck
leads with fast, savory dinners; at 3pm, a snack/smoothie._ · **[PWA-now]** (extend
the W2 context reranker).

### Tier 3 — Craving capture & social desire

**4.9 "Crave-it" save → it finds you later** · _Zeigarnik — an open loop that the
push/widget closes._ · **[PWA-now]**. Tapping a heart on any dish schedules a
future craving-cue for it.

**4.10 Photo-of-the-real-thing import → "make this crave-able"** · _user shoots a
dish they crave; vision identifies it; we surface the good-and-tasty version._ ·
**[PWA-now]** (the Vision pipeline exists).

**4.11 Friend's plate as a craving cue** · _social proof — "Alex made this
tonight" with the photo is a stronger want-cue than an ad._ · **[PWA-now]** (the
Friends strip + gift links exist; make them image-forward + one-tap-cook).

**4.12 Scent/sound/ASMR micro-cues** · _multisensory craving — a 1s sizzle on the
mission screen, a sizzle haptic._ · **[PWA-now]** (Web Audio + the haptics
system), opt-in, reduced-motion/sound-safe.

**4.13 The "5pm slump" rescue** · _a single timed push at the documented
willpower-low window with the easiest crave-worthy dinner._ · **[PWA-now]** (4.2).

**4.14 Calendar / weather-aware craving** · _rainy Tuesday → soup; Friday → the
fun thing._ · **[PWA-now]** (the weather adapter stub + W2 season/daypart exist).

**4.15 "Crave streak" framed as joy, not guilt** · _variable reward without the
diet-app shame — celebrate wanting-and-cooking-good-food, never punish a miss._ ·
**[PWA-now]** (reframe the existing streak copy).

**4.16 Generative "your perfect plate" craving card** · _a shareable, beautiful,
personalized card of the dish that closes your day's nutrition gap AND looks
incredible._ · **[PWA-now]** (the deficiency-fill engine + the wallpaper renderer
4.3).

**4.17 Apple Watch / glance complication** · _highest-frequency cue surface._ ·
**[native]**.

**4.18 "Set the table" pre-commitment** · _a tiny 7pm "you're 1 tap from dinner"
that you scheduled this morning — a Ulysses contract with yourself._ ·
**[PWA-now]**.

**4.19 Live Activity / Dynamic Island cook timer** · _keeps the in-progress cook
(and its reward) salient on the lock screen._ · **[native]**.

**4.20 Ambient TV / cast gallery** · _the `/gallery` cast to a TV during the
"what's for dinner" argument._ · **[desktop]/[native]** (Chromecast/AirPlay of
`/gallery`).

---

## 5. Execution plan — phased by what the web can do today

**Phase A — Web/PWA desire layer (AUTO-BUILD now, no founder gate for the core):**

1. `cravingForNow` selector + `/api/widget/today` + `/api/wallpaper/[slug]`
   (the `ImageResponse` renderer) — the shared craving brain. _(rule 12: pure +
   API, fully autonomous.)_
2. The `/gallery` rotating full-bleed route (desktop-pinnable, cast-able).
3. The Dobe-craves beat (4.5) + the anticipation ramp banner (4.6) on Today.
4. "Set as wallpaper" download + a published iOS Shortcut that pulls
   `/api/wallpaper/today` daily (the no-native wallpaper hack).
5. Hero loop (4.7) where shot-sequences exist.

\*\*Phase B — Push (AUTO-BUILD the client + scheduler; FOUNDER-GATED on VAPID keys

- a server):\*\*

6. Service worker + `usePushSubscription` + the subscription store (reuse the
   tRPC/Supabase write-through pattern). Dormant until VAPID + `POSTGRES_URL`,
   exactly like the recipes path.
7. `/api/cron/craving-push` (Vercel Cron) → hunger-window pushes with the dish
   image. _(FG: VAPID keys, a cron, a notification-icon asset.)_

**Phase C — Native shell (FOUNDER-GATED — needs an Apple/Google account + a
build):** 8. Capacitor/Expo wrapper → a real WidgetKit/Glance home-screen widget polling
`/api/widget/today`; Live Activities; auto-rotating wallpaper companion.

**Phase D — Desktop (AUTO-BUILD; ships independently):** 9. A Tauri menubar app loading `/gallery` with a global "cook this" hotkey.

**Sequencing logic (rule 12):** everything in Phase A + the Phase B _client_ is
autonomous and ships first; the founder-gated bits (VAPID, native account,
notification assets) are surfaced here so they're provisioned in parallel — the
moment they exist, the widget/push/wallpaper light up via one config edit.

## 6. How it's coded at each level of our pipeline

- **Engine (`src/lib/engine`)** — `cravingForNow` / `gallerySequence` /
  `hungerWindows` as pure, golden-tested selectors layered on the existing
  pairing + W2 context reranker. No new model; reuse the deterministic core.
- **Data/API (`src/app/api`)** — `widget/today`, `wallpaper/[slug]`
  (`ImageResponse`), `cron/craving-push`. Cacheable, trusted-cohort-open.
- **Client (`src/components`, `src/lib/hooks`)** — `/gallery` route, the Dobe
  craving beat, the anticipation banner, `usePushSubscription`, `HeroLoop`. All
  reduced-motion-safe via the motion tokens.
- **Service worker / PWA (`public/sw.js`, manifest)** — push receipt + the
  installable home-screen surface.
- **Persistence (tRPC + Supabase)** — the push-subscription store + a
  craving-event log (this dovetails with the moat data flywheel — every
  craving-cue → tap → cook is a high-signal accept/reject tuple).
- **Native/Desktop (separate shells)** — Capacitor widget + Tauri menubar,
  thin clients over the same APIs.

## 7. Why this also deepens the moat

Every desire surface is also a **data-flywheel event** (see
`MOAT-APPRAISAL-2026-06.md` #1): cue shown → craved/ignored → tapped → cooked →
rated. A craving engine doesn't just drive behavior — it generates the exact
proprietary accept-rate dataset that makes the recommendations uncopiable with
scale. **Desire is the wedge _and_ the flywheel.**

---

## 8. Competitor teardown — guilt vs desire

**The Guilt Quadrant (what NOT to be):**

- **Noom** — markets "no dieting" but runs a red/orange/green food traffic-light
  that triggers avoidance even for balanced foods, plus mandatory daily logging.
- **MyFitnessPal** — pure calorie-policing; a 2019 study found ~75% of users with
  eating disorders felt it _contributed_ to their condition.
- **Yuka** — barcode → 0–100 score; one bad additive forces a red rating. The
  whole emotional payload is fear/avoidance — it makes you put food _down_. The
  exact inverse of desire-surfacing.
- **Duolingo** (the cautionary analog) — a beloved mascot weaponized into guilt
  ("don't let Duo down"). It works but it's _negative-affect_ engagement.
  **Sous's Doberman must be the photo-negative of sad-Duo: pull toward a craving
  with joy, never shame a skip.**

**The Desire Masters (what TO steal):**

- **Instagram / TikTok food** — ruthless at the ghrelin lever (tight-crop, motion,
  sizzle) but pointed at _anything_, including junk. **Sous's wedge: the same
  desire-craft, applied only to the healthy-AND-craveable intersection.**
- **KptnCook / HelloFresh** — prove appetite-grade _imagery_ (one curated hero,
  quality over catalog) is the conversion engine — validating craft over inventory.
- **Lock-screen / widget apps** (Widgetsmith, Photo Shuffle, iOS 17 interactive
  widgets) — masters of the glanceable, zero-open, ambient cue; iOS 17+ widgets
  can register a "Cook this" tap _without opening the app_. The delivery layer no
  food app uses well.

**The gap in one line:** everyone surfaces food _information_; nobody surfaces
food _desire_ toward healthy dishes. That whitespace is the thesis.

## 9. Two sharper science points that change the priority order

- **Imagery is a hormonal intervention, not decoration.** Schüssler et al. (2012)
  showed viewing food pictures raises blood **ghrelin** and subjective hunger —
  the hero photo _is_ the product. **The CLAUDE.md gap that only 35/76 meals have
  hero images is, under this thesis, the #1 desire investment** (within rule 7:
  surface + craft existing dishes; the new viral recipes correctly fall back to
  gradient+glyph until the image pipeline runs).
- **The Doberman is a _learnable_ craving cue — and that's the moat.** Cue-
  reactivity is conditionable: every pairing of a Sous cue with a genuinely-good
  dish the user then cooks trains the cue to pull harder. A brand-owned craving
  surface that _compounds with every cook_ is uncopiable by a calorie-tracker —
  and it dovetails with the data flywheel (each craving-cue → cook is a
  high-signal accept tuple).

## Sources

Berridge & Robinson incentive-sensitization (Am Psychol 2016); Berridge dopamine
& incentive salience (Psychopharmacology 2007); food-cue craving (PLOS One); VTA
dopamine & ghrelin/leptin cue firing (PMC4722241); Schüssler et al. food pictures
raise ghrelin (Obesity 2012); food photography & healthy eating (Frontiers in
Psychology 2021); Fogg Behavior Model B=MAP; reward anticipation & dopamine
(PMC5088360); Zeigarnik effect; Noom/MyFitnessPal disordered-eating critiques;
Yuka rating mechanic; KptnCook food photography; iOS lock-screen/interactive
widgets; Duolingo mascot/guilt engagement.

---

_Status: complete strategy + feature catalog + phased execution plan, with the
behavioral-science grounding, competitor teardown, and citations folded in. The
Phase A items (cravingForNow selector, /api/wallpaper + /api/widget endpoints,
the /gallery route, the Doberman craving beat, set-as-wallpaper export) are
AUTO-BUILD and queued; the native widget/push/wallpaper layer is the lead
FOUNDER-GATED dependency to provision in parallel (rule 12)._
