# DOGE — Technical Implementation Plan

### Forking Sous into a Doberman virtual-pet game (a clean-room port of Tamaweb's mechanics)

> Source of inspiration: **[autosam/Tamaweb](https://github.com/autosam/Tamaweb)** ·
> live: [tamawebgame.github.io](https://tamawebgame.github.io/) ·
> [itch devlogs](https://samandev.itch.io/tamaweb)
>
> **Status:** plan only. No code in this document is copied from Tamaweb.

---

## 0. TL;DR

**Doge** is a virtual-pet game where you raise a pixel **Doberman** from puppy to
elder — fed, walked, washed, played with, evolved — built by **forking the Sous
repo** (which we own) and promoting its already-existing Doberman Tamagotchi from
a nutrition easter-egg to the home screen. The "reskin the Tamagotchi to a
Doberman" step is **~70% already done**: Sous ships a hand-pixelled Doberman with
moods, poses, idle animations, earned cosmetics, accessory loot, an evolving room
with seasons + day/night, a Fetch mini-game, an XP/level economy, streak freezes,
PWA + offline, and Web Push. The work is (a) **port Tamaweb's deeper care loop +
mini-games as a clean-room reimplementation**, and (b) **keep 100% of Sous's
cooking/nutrition** — because Sous's unique twist is that _feeding the pet is real
cooking_, which is a moat Tamaweb does not have.

**The single most important constraint** (Section 1): Tamaweb is **CC BY-NC-SA
4.0**. We must **not** copy its code or sprites — we reimplement its _mechanics_
(which are not copyrightable) using Sous's own art. This keeps Doge free of the
viral ShareAlike/NonCommercial license.

---

## 1. The legal spine — why this is a CLEAN-ROOM port (read first)

Tamaweb's license is **Creative Commons Attribution-NonCommercial-ShareAlike 4.0
International (CC BY-NC-SA 4.0)**. The implications, and the mandate they create:

| If we…                                                                          | Consequence                                                                                                                                          | Verdict        |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Copy Tamaweb **source files / sprites / audio**                                 | Doge becomes a _derivative work_ → must be CC BY-NC-SA → forced **NonCommercial forever** + **ShareAlike** (must open-source under the same license) | **PROHIBITED** |
| Reimplement Tamaweb's **game mechanics / systems / feature ideas** from scratch | Game _mechanics and rules are not copyrightable_ (only the specific code + art expression is) — no derivative-work trigger                           | **ALLOWED**    |
| Use **Sous's own pixel Doberman + Sous's code**                                 | We own it                                                                                                                                            | **ALLOWED**    |

**Mandate:** Doge is a **clean-room reimplementation**. Engineers building it
must work only from _this plan's prose descriptions of the mechanics_ and from
the Sous codebase — **never** from Tamaweb's source. We render with **Sous's own
hand-authored pixel art** (the `pixel-doberman.tsx` system), not Tamaweb's
sprites. As a courtesy (not a legal requirement, since no IP is copied) the About
sheet credits Tamaweb as inspiration.

> Aside: Sous already brands itself "a free public-good cooking app — no ads, no
> paid tier," so the NC spirit is moot for us, but the **ShareAlike** clause
> (forced open-sourcing under CC) is the real trap, and clean-room avoids it
> entirely.

---

## 2. The head start — what Sous already gives us (inventory)

Doge is not a green-field build. The Doberman Tamagotchi already lives in Sous.
Real files and what they already do:

| Tamaweb concept                    | Already in Sous                                                                   | File                                                                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| The pixel pet sprite               | Hand-pixelled Doberman, SVG-from-charmap, mood-composed                           | `src/components/nutrition/pixel-doberman.tsx` (`buildHeroMap`, `PixelDobermanHero`)                                   |
| Animation / idle life              | Blink, ear-flick, play-bow pose, breathing                                        | `pet-sheet.tsx` (idle effects)                                                                                        |
| Pet stats / mood                   | `computePetState` → mood + 5 hearts + fullness/strength bars + "need"             | `src/lib/nutrition/pet-state.ts`                                                                                      |
| Cosmetics (earned)                 | Chef's toque + red/gold collar by Path level                                      | `pixel-doberman.tsx` `cosmeticsForLevel`                                                                              |
| **Accessory loot (random reward)** | Catalog + drop-roll + store + 5 pixel accessories + wardrobe                      | `src/lib/nutrition/pet-accessories.ts`, `use-pet-accessories.ts`, `pet-sheet.tsx` wardrobe _(in-flight, this branch)_ |
| The world / room                   | Evolving pixel room: wall, curtained window, **seasons + day/night**, lamp, shelf | `src/components/nutrition/pet-room.tsx`                                                                               |
| Full-screen pet view               | The Tamagotchi sheet (hero + room + stats + mini-game)                            | `src/components/nutrition/pet-sheet.tsx`                                                                              |
| Header companion                   | Mini Doberman that reacts to cooks                                                | `src/components/today/mascot.tsx`, `mascot-mood.ts`                                                                   |
| A mini-game                        | **Fetch / Treat-Toss** (tap → toss → catch → "good fetch!")                       | `pet-sheet.tsx`                                                                                                       |
| Mini-game arcade                   | 4 cooking games: Speed Chop, Flavor Pairs, Cuisine Compass, What's Cooking        | `src/app/games/*`                                                                                                     |
| XP / leveling economy              | XP awards + levels gate cosmetics                                                 | `src/lib/hooks/use-xp-system.ts`                                                                                      |
| Streak + **streak freeze**         | Logging streak, earned freezes (Tamaweb "don't punish a miss")                    | `use-streak-freezes` (consumed in `pet-sheet.tsx`), `use-rest-days.ts`                                                |
| Day-night / weather signal         | `daypart` + season; live **Open-Meteo weather** opt-in                            | `pet-room.tsx`, `src/lib/weather/use-weather.ts`                                                                      |
| Persistence                        | localStorage everywhere + a Supabase write-through pattern (`diary-sync`)         | repo-wide                                                                                                             |
| PWA + offline                      | Manifest + hand-rolled service worker (cache-first shell, offline page)           | `public/manifest.json`, `public/sw.js`                                                                                |
| Push notifications                 | Full Web Push path (dormant until VAPID, now wired)                               | `sw.js`, `src/app/api/push/*`, `use-push-subscription.ts`                                                             |
| Deterministic, tested engine       | Pure selectors + 4,100+ co-located tests                                          | `src/lib/engine/*`                                                                                                    |

**Conclusion:** the prototype already contains a working Doberman virtual pet
with a world, an art system, an economy, save/offline, and one mini-game. Doge =
_depth_ on top of this, not a rebuild.

---

## 3. Tamaweb feature map → Doge port (the gap)

Each Tamaweb system, the Doge equivalent, whether Sous already has scaffolding,
and the build classification (AUTO-BUILD = repo + npm only; FOUNDER-GATED = needs
an account/asset/server, per Sous rule 12).

| #    | Tamaweb system                                                     | Doge port                                                                                                                     | Sous scaffold?                                                                            | Class                                                 |
| ---- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 3.1  | Care stats (hunger, energy, hygiene, fun) that **decay over time** | Doberman **needs** that decay between sessions; refilled by real actions                                                      | mood/needs exist (`pet-state`) but are _snapshot_ not _decaying_ — **add the decay loop** | AUTO                                                  |
| 3.2  | Feed meals + snacks                                                | **Feeding = real cooking/logging** (the moat) + quick "snack" via the diary                                                   | nutrition diary, cook sessions                                                            | AUTO                                                  |
| 3.3  | Bath / hygiene                                                     | **Bath-time** mini-interaction (scrub the muddy Doberman)                                                                     | new                                                                                       | AUTO                                                  |
| 3.4  | Toilet / poop + cleaning                                           | **Walkies**: poop appears, tap to scoop; ignore → hygiene drops                                                               | new                                                                                       | AUTO                                                  |
| 3.5  | Sleep + day-night                                                  | **Sleep**: dims the room at night, pet sleeps, energy recovers                                                                | `daypart`/night room + `asleep` mood exist                                                | AUTO                                                  |
| 3.6  | Mini-games: Mimic, Catch, Leaves, cooking-photo                    | **Fetch** (have it) + **"Dobe Says"** (Mimic) + **"Treat Catch"** (Catch) + **"Shake-Off"** (Leaves) + cooking games (have 4) | Fetch + 4 cooking games                                                                   | AUTO                                                  |
| 3.7  | Evolution baby→elder, 300+ characters                              | **Doberman life stages** (puppy → adolescent → adult → veteran) driven by care quality                                        | `cosmeticsForLevel` + size-by-level exist; **add stages + stage sprites**                 | AUTO                                                  |
| 3.8  | Room customization                                                 | **Den décor**: unlockable wallpaper/rug/bed/bowl via play, swappable                                                          | room exists, single scene — **make it composable + swappable**                            | AUTO                                                  |
| 3.9  | Dynamic weather                                                    | **Weather in the den window** (rain on glass, snow)                                                                           | weather signal + window exist — **render the weather in the scene**                       | AUTO                                                  |
| 3.10 | Currency / items / shop                                            | **Kibble** soft-currency earned by play/cooking; spent on décor + treats                                                      | XP economy exists — **add a non-cash currency + a shop**                                  | AUTO                                                  |
| 3.11 | Missions / quests                                                  | **Daily quests** ("walk the dog", "cook a protein", "win a mini-game")                                                        | weekly-challenge + quest-pool patterns exist                                              | AUTO                                                  |
| 3.12 | Achievements                                                       | Doberman **badges** (milestones, evolution, mini-game records)                                                                | milestones engine exists                                                                  | AUTO                                                  |
| 3.13 | Skills / teaching                                                  | **Tricks** the Doberman learns (sit/shake/roll) → new idle animations + bonuses                                               | new (reuses the animation system)                                                         | AUTO                                                  |
| 3.14 | Adventures                                                         | **Walkies / park adventures** — a short seeded "encounter" loop (find a bone, meet a friend)                                  | seeded-event patterns exist (`daily-novelty`)                                             | AUTO                                                  |
| 3.15 | Family tree / generations                                          | **Lineage**: when a Doberman retires, a pup inherits some traits                                                              | new (deterministic trait carry-over)                                                      | AUTO                                                  |
| 3.16 | Hubchi (online pet socializing)                                    | **Dog park** — see friends' Dobermans (reuse the Friends strip + cook gifts)                                                  | Friends strip + gifting + Supabase Realtime _stub_ exist                                  | FOUNDER-GATED (realtime server)                       |
| 3.17 | Camera cooking game (3 photos → stir)                              | Sous already has the **real Vision pipeline** (photograph a dish → cook it) — strictly better                                 | Vision API path exists                                                                    | AUTO (vision is founder-gated for live keys, stubbed) |

---

## 4. Architecture

### 4.1 The core idea: a deterministic "pet brain" + a thin React shell

Mirror Sous's house style: **pure, testable, clock-injected engine** + a thin
client. Tamaweb runs a `requestAnimationFrame` game loop mutating a live `Pet`
object; Doge instead models the pet as **state-at-a-timestamp**, computed purely
from `(lastState, now, events)`. This is more robust for a PWA that is backgrounded
for hours and fits Sous's existing `computePetState` philosophy.

```
src/lib/doge/
  pet-needs.ts        // pure: decayNeeds(state, elapsedMs) → needs; the decay curves
  pet-lifecycle.ts    // pure: stageFor(careScore, ageDays) → "pup"|"teen"|"adult"|"veteran"
  pet-economy.ts      // pure: kibble earn/spend; the shop catalog
  pet-quests.ts       // pure: daily-quest generation (seeded) + completion check
  pet-events.ts       // the append-only event log (fed / walked / washed / played / slept)
  doge-state.ts       // composeDoge(events, now, prefs) → the full live DogeState  ← the spine
```

`composeDoge` is the single entry the UI reads. Every action (feed, walk, wash,
play, sleep) appends an **event** (timestamp + kind), and `composeDoge` folds the
event log + elapsed time into the live state. Pure → golden-tested → identical on
every surface (home, header mascot, widget, wallpaper).

### 4.2 Time model (the load-bearing decision)

- **Needs decay on wall-clock**, computed lazily on open: `elapsedMs = now - lastSeenAt`. No background timer; the PWA can sleep.
- **Caps + grace:** decay is clamped so a few days away never "kills" the pet (Sous is a wellbeing product — _no death/guilt_; the worst state is "needs you," recoverable in one cook). This is a deliberate departure from classic Tamagotchi permadeath.
- **Day/night** from the device clock (already in `pet-room.tsx` via `daypart`).
- **Seed** = date-derived (the `dateSeed` helper already used by `cravingForNow`) for daily quests + adventure encounters.

### 4.3 Rendering: extend the existing pixel system, do not add a canvas

Tamaweb uses a 2D canvas + sprite atlas (`Object2d.js`, `Drawer.js`). Doge stays
on Sous's **charmap → SVG `<rect>`** approach (`pixel-doberman.tsx`):
crisp at any DPR, no asset pipeline, diff-able, already themed. We extend it:

- **Life-stage maps:** new `HERO_BODY_*` charmaps per stage (pup = smaller head-to-body ratio; veteran = grey muzzle pixels). `buildHeroMap` gains a `stage` arg.
- **Action poses:** `eat`, `wash`, `sleep`, `sit`, `shake` poses (new charmaps) — same stamp pipeline as the existing `stand`/`bow`.
- **Scene props:** poop, mud, food bowl, leaves/snow, toys — small charmaps stamped into `pet-room.tsx`'s grid.
- **CSS-keyframe motion** (already the pattern: `pet-breathe`, `fetch-ball`) for jumps/wags — **all reduced-motion-gated** (a documented Sous rule; the lint rule + the recent reduced-motion sweep enforce it).

### 4.4 Persistence + offline

- Event log + needs snapshot + economy + wardrobe in **localStorage** (the Sous default), one namespaced key each, with the defensive-parse pattern (`parseStoredOutcomes`-style).
- **Cross-device** = the existing **diary-sync write-through** pattern (localStorage-first, Supabase mirror when `POSTGRES_URL`/Supabase env present) — one adapter, already proven.
- **Offline** = the existing `public/sw.js` shell cache (Doge is fully playable offline; only the dog-park social needs network).

---

## 5. The reskin: Tamagotchi → Doberman (the art + lifecycle system)

The Doberman already exists; this section is about **depth**, not replacement.

### 5.1 Life stages (replaces Tamaweb's 300-character evolution with a tasteful 4)

`pet-lifecycle.ts` (pure): `stageFor({ ageDays, careScore })` →
`"pup" | "teen" | "adult" | "veteran"`. Ambition without bloat: **4 stages × a few
care-branched variants** (e.g., a well-cared adult is sleek; a neglected one is
scruffy — recoverable), each a charmap variant of the existing hero. Care quality
(rolling average of needs satisfaction) gates the _quality_ of the next stage, not
a 300-deep tree — keeps the art hand-authorable + on-brand.

- **Age** ticks on real days the app is opened (gentle; pausing is fine).
- **"Graduation" moment** at each stage transition = a celebration screen (reuse the win-screen confetti) + a badge + sometimes a guaranteed accessory drop.
- **Lineage (3.15):** at veteran retirement, the player keeps the den + a "family tree" entry; a new pup inherits one trait (coat sheen / favorite cuisine) via a pure `inheritTraits(parent, seed)`.

### 5.2 Animation vocabulary

Extend the idle set (blink/ear-flick/bow already there) with action animations
keyed to care events: `eat` (head dips to bowl), `wash` (suds + shake), `sleep`
(curled, zzz), `play` (the Fetch jump exists), `trick` (sit/shake/roll). Each is a
pose charmap + an optional CSS keyframe, reduced-motion-gated.

---

## 6. Care systems (the daily loop) — and how the real-nutrition tie is preserved

This is Doge's heart **and** where Sous's moat survives. Tamaguro-style "feed a
sprite a sprite-burger" is replaced by **feeding = the real Sous cooking/nutrition
engine**. Two cleanly separated layers (Sous already practices this separation —
Fetch awards zero XP so play can't game the economy):

- **Real layer (the moat):** the Doberman's _fullness/strength/health hearts_
  come from `computePetState`, which reads the **real nutrition diary + targets +
  deficits + streak**. Cooking a real meal that closes a real deficit is what
  truly nourishes the pet. _This never changes — it's the unique value._
- **Game layer (the fun):** _decaying needs_ — **Hunger, Energy, Hygiene, Fun** —
  that refill from **game actions** and decay on the clock. These drive the
  toy/play/clean loop and the kibble economy, but **never** feed back into the
  real nutrition signal (a hard wall, enforced by keeping them in separate
  modules with no import edge from `pet-state.ts` → `pet-needs.ts`).

| Need    | Decays           | Refilled by                                                | Sprite cue            |
| ------- | ---------------- | ---------------------------------------------------------- | --------------------- |
| Hunger  | slow             | logging/cooking a meal (real) **or** a treat from the shop | bowl, "feed me" droop |
| Energy  | over the day     | **sleep** (night) / a nap                                  | yawn, slower idle     |
| Hygiene | after walks/play | **bath** mini-interaction; scooping poop                   | mud pixels, flies     |
| Fun     | steady           | any **mini-game** / a trick / a walk                       | bouncy idle, toys out |

**Care actions (each appends an event):**

- **Feed** → opens the existing cook/log flow (real) or instant-uses a shop treat.
- **Walkies** → a short seeded encounter (3.14) + may drop poop to scoop (3.4) + raises Fun, lowers Hygiene.
- **Bath** → a scrub mini-interaction (drag-to-scrub or tap-to-suds) → Hygiene full.
- **Sleep** → toggles night; Energy recovers while "asleep" (the mood already exists).
- **Play** → any mini-game (Section 7).

**No death, ever.** Needs floor at "needs you," never zero-out the pet. The
worst-case screen is an invitation to cook, consistent with Sous being a
wellbeing app, not a guilt machine.

---

## 7. Mini-games (the "Game Center")

A unified **Arcade** surface (extends the existing `/games` hub) hosting both the
pet games (port targets) and the 4 existing cooking games. Each pet game is a
small self-contained component + a pure scoring core (Sous's game pattern) and
awards **kibble** (soft currency) + **Fun**, never real-nutrition XP.

| Doge game                                                    | Ported from        | Mechanic                                                                          | Reuse                                            |
| ------------------------------------------------------------ | ------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Fetch**                                                    | Tamaweb _Catch_    | tap to toss, the Doberman fetches; combo for a treat                              | **already built** (`pet-sheet.tsx`) — promote it |
| **Treat Catch**                                              | Tamaweb _Catch_    | treats fall, swipe the dog to catch, miss = lose a life                           | new; reuses the fetch-ball CSS arc               |
| **Dobe Says**                                                | Tamaweb _Mimic_    | Simon-style: the dog flashes a paw/bark sequence, repeat it; lengthens each round | new; pure sequence core, trivially tested        |
| **Shake-Off**                                                | Tamaweb _Leaves_   | leaves/snow pile on the dog, shake (tap/drag) to clear before the timer           | new; reuses the season props                     |
| **Tug-of-War**                                               | (original)         | rhythmic tap to out-pull the dog on a rope                                        | new                                              |
| Speed Chop / Flavor Pairs / Cuisine Compass / What's Cooking | — (Sous originals) | the cooking arcade                                                                | **already built** (`/games/*`)                   |

**Camera-cooking note (3.17):** Tamaweb's "take 3 photos → stir" is a _toy_. Sous
already has the **real** thing — photograph a dish, the Vision pipeline identifies
it, you actually cook it, the dog eats it. We surface that as the headline "cook
for your dog" action; the toy version is unnecessary.

Each game ships with: a pure scoring/sequence core + unit test, a reduced-motion
path (Sous rule), a best-score `MetaPill`, and a kibble payout curve.

---

## 8. Evolution / lifecycle / generations — see §5.1 (the pure `pet-lifecycle.ts`).

## 9. World — the den

- **Composable den** (`pet-room.tsx` → a layered scene): swappable **floor / wall / bed / bowl / window** slots, each an unlockable charmap prop bought with kibble or earned at stage-ups. Today's room is the default skin.
- **Weather in the window (3.9):** render the real `useWeather` snapshot — raindrops on the pane, drifting snow, a sun glow — all reduced-motion-gated; falls back to the current static window when weather is off.
- **Day/night (3.5):** already driven by `daypart`; sleep dims it.
- **Adventures / Walkies (3.14):** a seeded short loop — leave the den, a 2–3 beat encounter (sniff a bush, find a bone = kibble, meet a neighbor dog), back home. Pure, seeded by the date so it's a "daily walk."

## 10. Social — the Dog Park (FOUNDER-GATED)

Tamaweb's "Hubchi." Reuse Sous's **Friends strip + recipe-gifting + the
Supabase-Realtime adapter stub**. Local-first MVP: a deterministic "park" of
seeded neighbor Dobermans you can wave at / gift a treat to. The live multiplayer
(see real friends' dogs in real time) is the **one** founder-gated piece — it
needs the Supabase Realtime server flipped on (the adapter + env contract already
exist per Sous's W17 plan). Ships dormant; one config edit lights it up.

## 11. Persistence / save / offline — see §4.4 (localStorage + diary-sync mirror + existing `sw.js`).

## 12. Preserving ALL Sous functionality (non-negotiable)

Doge is a **superset**, not a replacement. Everything Sous does today stays and is
_reframed_ as the dog's world:

- **Cooking / guided cook / pairing deck** → "cook for your dog" (the dog eats what you cook; real nutrition still drives the real hearts).
- **Nutrition / diary / targets** → the dog's true health.
- **Path / skill tree / streaks / XP** → the dog's training + lifelong record.
- **Content tab** → the "dog & you" magazine.
- **Sous Everywhere (widget/wallpaper/push)** → the dog on your lock screen ("your Doberman misses you — dinnertime").
- **Hunger/weather/crave-it deck** → the dog craves dinner at dinnertime, comfort food when it's cold.

Concretely: **fork, don't gut.** Keep the three product tabs; **promote the pet to
the Today hero** (the dog is the first thing you see), with cooking one tap below.
A feature flag `SOUS_DOGE_MODE` lets the same codebase render either "Sous (cooking
first)" or "Doge (dog first)" — so the fork can converge back or A/B.

## 13. Phasing (sequenced; AUTO-BUILD first, per rule 12)

**Phase 0 — Fork + foundation (1 sprint).** Fork the repo to `doge`; land the
in-flight **accessory loot** branch (catalog + drop + wardrobe + pixel accessories
— already written, needs visual QA + the win-screen drop moment); add the
`SOUS_DOGE_MODE` flag; promote the pet to a first-class route.

**Phase 1 — The care loop (AUTO).** `pet-needs.ts` decay engine + `doge-state.ts`
spine (+ golden tests); Feed/Walk/Bath/Sleep actions + event log; the no-death
grace caps; sprite action poses.

**Phase 2 — Mini-games (AUTO).** Promote Fetch; build Dobe Says, Treat Catch,
Shake-Off; the unified Arcade; kibble economy (`pet-economy.ts`) + the shop.

**Phase 3 — Lifecycle + den (AUTO).** Life stages + graduation moments + badges;
composable den + weather-in-window; daily quests + adventures.

**Phase 4 — Lineage + polish (AUTO).** Family tree / generations; tricks/skills;
the adversarial review + reduced-motion + a11y sweep (the Sous QA ritual).

**Phase 5 — Dog Park (FOUNDER-GATED).** Live social via Supabase Realtime (the
adapter is stubbed now; this is the only credential-gated week).

## 14. File-by-file map (new + touched)

```
NEW
  src/lib/doge/pet-needs.ts (+test)        decay curves, refill, grace caps
  src/lib/doge/doge-state.ts (+test)       composeDoge — the spine
  src/lib/doge/pet-lifecycle.ts (+test)    stages, graduation, inheritTraits
  src/lib/doge/pet-economy.ts (+test)      kibble earn/spend + shop catalog
  src/lib/doge/pet-quests.ts (+test)       seeded daily quests
  src/lib/doge/pet-events.ts               event log (append-only, defensive parse)
  src/lib/hooks/use-doge.ts                the React binding over composeDoge
  src/components/doge/care-bar.tsx         the 4 decaying-need bars
  src/components/doge/care-actions.tsx     Feed / Walk / Bath / Sleep / Play
  src/components/doge/arcade.tsx           the Game Center hub
  src/components/doge/games/dobe-says.tsx  Mimic port (+ pure core/test)
  src/components/doge/games/treat-catch.tsx
  src/components/doge/games/shake-off.tsx
  src/components/doge/den.tsx              composable room (wraps pet-room)
  src/components/doge/shop.tsx             kibble shop (décor + treats)
  src/app/(doge)/doge/page.tsx             the pet-first home (flagged)
  docs/DOGE-GAME-PLAN.md                   this plan

EXTEND (Sous files we already know)
  pixel-doberman.tsx     + stage charmaps, action poses, scene props (eat/wash/sleep/sit)
  pet-room.tsx           + composable slots + weather rendering
  pet-sheet.tsx          + care actions, promote Fetch, wire needs
  pet-state.ts           UNCHANGED (the real-nutrition wall — do not couple to needs)
  win-screen.tsx         + the accessory-drop moment + stage graduations
  use-xp-system.ts       reuse for the real economy; kibble is separate
```

## 15. Testing

Match Sous's bar (4,100+ tests, golden + co-located): **pure cores fully unit-
tested** (`pet-needs` decay determinism + grace caps; `doge-state` fold;
`pet-lifecycle` stage thresholds; each mini-game's scoring/sequence core;
`pet-economy` earn/spend invariants; `inheritTraits` determinism). **Playwright**
over the care loop (feed → needs rise → decay over injected time) and one full
mini-game. **Reduced-motion + a11y** regression guards on every new animated
surface (the documented Sous gotcha — the global CSS rule does not stop framer/CSS
JS motion; gate each).

## 16. Risks + open founder decisions

1. **License (settled):** clean-room only — no Tamaweb code/art. Credit as inspiration. _(Section 1.)_
2. **No death (recommended):** keep Sous's wellbeing ethos — needs floor, never kill the pet. Confirm this vs. classic-Tamagotchi tension.
3. **Fork vs. mode:** ship as a flagged `SOUS_DOGE_MODE` in one repo (recommended — converge/A-B) **or** a hard fork. Founder call.
4. **Art scope:** 4 life-stages × a few care variants (hand-authorable) vs. Tamaweb's 300 (untenable for pixel art we draw ourselves). Recommend the tasteful 4.
5. **Currency:** kibble is **earned, never bought** (matches Sous "no paid tier"). Confirm no IAP.
6. **Founder-gated:** only the live **Dog Park** (Supabase Realtime) and live AI/Vision keys; everything else is AUTO-BUILD now.
7. **In-flight branch:** the accessory-loot work on this branch is the literal Phase-0 seed — finish its visual QA + win-screen drop first.

```

> Sources: [autosam/Tamaweb](https://github.com/autosam/Tamaweb) ·
> [Tamaweb site](https://tamawebgame.github.io/) ·
> [devlog: content update 6](https://samandev.itch.io/tamaweb/devlog/763430/content-update-6)
```
