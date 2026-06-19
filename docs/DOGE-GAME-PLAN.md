# DOGE — Technical Implementation Plan

### Forking Sous + copying Tamaweb wholesale into a Doberman pet game (prototype), then a bespoke rewrite before launch

> Inspiration + prototype source: **[autosam/Tamaweb](https://github.com/autosam/Tamaweb)** ·
> live: [tamawebgame.github.io](https://tamawebgame.github.io/) ·
> [itch devlogs](https://samandev.itch.io/tamaweb) ·
> License: **CC BY-NC-SA 4.0**

---

## 0. TL;DR

**Doge** is a Doberman virtual-pet game. The strategy is a deliberate **two
tracks**:

- **Track A — the prototype (now):** **copy Tamaweb completely** into a fork of
  the Sous repo, and the _only_ creative change is **reskinning Tamaweb's pet
  sprite to a Doberman**. We get Tamaweb's entire game — the care loop, 300-char
  evolution, mini-games, weather, day/night, shop, family trees, social hub — for
  free, validated and polished, in days not months. This is **legal**: Tamaweb is
  **CC BY-NC-SA 4.0**, which _expressly permits_ copying, modifying and sharing
  for **non-commercial** use, provided we **attribute** the author and keep the
  prototype under the **same license** (ShareAlike). Sous is already a free,
  no-ads, no-paid-tier public good, so NonCommercial costs us nothing for the
  prototype.
- **Track B — the bespoke build (before public / commercial launch):**
  _independently_ rebuild the game from scratch (original or clean-room) to shed
  the CC obligations, so the production app can be commercial and is fully ours.
  The prototype's only job is to **de-risk product decisions fast**; none of its
  copied code/art needs to survive into Track B.

The Sous side is the base app: **keep 100% of Sous's cooking/nutrition features**
(they become "feeding & caring for your dog" — the moat Tamaweb lacks) and embed
the copied Tamaweb game as the pet experience.

**The single rule that makes Track A safe (Section 1): comply with CC BY-NC-SA on
the prototype (attribute + ShareAlike license + non-commercial + no public
distribution beyond what the license allows), and gate the commercial launch
behind the Track-B bespoke rewrite.**

---

## 1. Licensing strategy — how to copy Tamaweb legally (read first)

Tamaweb is **Creative Commons Attribution-NonCommercial-ShareAlike 4.0
International (CC BY-NC-SA 4.0)**. Unlike a proprietary work, this license is an
_affirmative grant of permission to copy and adapt_ — we just have to honor three
conditions:

| Condition              | What it requires                                                        | How Doge complies (prototype)                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **BY** (Attribution)   | Credit the creator + the license + note changes                         | An "About / Credits" screen + a `NOTICE` file naming **autosam/Tamaweb**, linking the repo + the CC BY-NC-SA deed, and stating "the pet has been reskinned to a Doberman; ported into a Next.js shell" |
| **NC** (NonCommercial) | No primarily-commercial use                                             | The prototype is internal/free — no ads, no sale, no paid tier (already Sous's posture). Don't run it as a paid product.                                                                               |
| **SA** (ShareAlike)    | Derivatives shipped to others must be under CC BY-NC-SA (or compatible) | If the prototype repo is published, license **that repo** CC BY-NC-SA. Keep it private/internal otherwise.                                                                                             |

**Net:** copying Tamaweb's code + sprites + data into the prototype is **allowed**.
The two things to never forget:

1. **Attribution + ShareAlike are load-bearing** — add the `NOTICE` + license on
   day one, before any Tamaweb file lands.
2. **The CC license is "viral":** anything that incorporates Tamaweb's copied code
   is itself CC BY-NC-SA. That's fine for a non-commercial prototype, **fatal for
   a commercial launch** — which is exactly why **Track B (a clean rebuild) is a
   hard gate before going public/commercial** (Section 13, Phase 5).

> Engineering hygiene: keep all copied Tamaweb material under **one quarantined
> directory** (`vendor/tamaweb/`) with the `NOTICE` + `LICENSE` at its root, so
> Track B can delete that directory in one commit and prove nothing CC-licensed
> leaked into the bespoke build.

---

## 2. The Sous head start — what the base repo already gives us

Doge's _base_ is the Sous fork, which already ships a Doberman pet + a cooking
engine. Even though Track A copies Tamaweb's game for the pet mechanics, Sous
contributes the shell, the moat, and a ready Doberman art reference for the
reskin:

| Need                                               | Already in Sous                                           | File                                                            |
| -------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| **A Doberman pixel sprite to reskin Tamaweb with** | Hand-pixelled Doberman, mood/pose composed                | `src/components/nutrition/pixel-doberman.tsx`                   |
| Real-cooking "feeding" (the moat)                  | Guided cook + pairing deck + nutrition diary              | `src/lib/engine/*`, `src/app/cook/*`                            |
| Pet mood from real nutrition                       | `computePetState`                                         | `src/lib/nutrition/pet-state.ts`                                |
| Accessory loot + wardrobe                          | catalog + drop + 5 pixel accessories _(in-flight branch)_ | `pet-accessories.ts`, `use-pet-accessories.ts`, `pet-sheet.tsx` |
| An evolving room (seasons/day-night)               | `pet-room.tsx`                                            | `src/components/nutrition/pet-room.tsx`                         |
| A mini-game already done                           | Fetch / Treat-Toss                                        | `pet-sheet.tsx`                                                 |
| Cooking mini-games                                 | Speed Chop, Flavor Pairs, Cuisine Compass, What's Cooking | `src/app/games/*`                                               |
| XP / levels / streak freezes                       | economy + earned freezes                                  | `use-xp-system.ts`, `use-streak-freezes`                        |
| Live weather, day/night, push, PWA                 | Open-Meteo opt-in, `sw.js`, Web Push                      | `src/lib/weather/*`, `public/sw.js`, `src/app/api/push/*`       |
| Deterministic, tested engine + 4,100+ tests        | house style                                               | repo-wide                                                       |

So Doge = **Sous shell (cooking moat + Doberman art + PWA + push) + Tamaweb game
(copied, pet reskinned)**.

---

## 3. Tamaweb's systems — copied wholesale (what Track A inherits for free)

Because Track A copies the game, every Tamaweb system comes across as-is; the only
edits are the **Doberman reskin** and the **wiring into the Sous shell**.

| #    | Tamaweb system                                         | Lives in (Tamaweb source)                   | Doge change                                                                                                                |
| ---- | ------------------------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 3.1  | Pet stats/needs (hunger, energy, hygiene, fun) + decay | `Pet.js`, `Animal.js`                       | **none** (copy)                                                                                                            |
| 3.2  | Feeding (meals + snacks)                               | `Activities.js`, `Definitions.js`           | reskin food art; _also_ bridge to Sous's real cook flow (Section 6)                                                        |
| 3.3  | Bath / hygiene                                         | `Activities.js`                             | reskin                                                                                                                     |
| 3.4  | Toilet / poop + cleaning                               | `Pet.js`, `Scene.js`                        | reskin                                                                                                                     |
| 3.5  | Sleep + day/night                                      | `Scene.js`, `Main.js`                       | none                                                                                                                       |
| 3.6  | Mini-games (Mimic, Catch, Leaves, cooking-photo)       | `Activities.js`                             | reskin sprites; keep mechanics                                                                                             |
| 3.7  | Evolution baby→elder, 300+ chars                       | `PetDefinition.js`                          | **the reskin**: swap the pet's sprite frames to Doberman frames (Section 5)                                                |
| 3.8  | Room customization                                     | `Scene.js`, `Object2d.js`, `Definitions.js` | reskin props                                                                                                               |
| 3.9  | Dynamic weather                                        | `Scene.js`                                  | optionally feed Sous's real `useWeather` in                                                                                |
| 3.10 | Currency / items / shop                                | `Definitions.js`, `UiHelper.js`             | reskin; keep **earned-not-bought** (no IAP)                                                                                |
| 3.11 | Missions / quests                                      | `Missions.js`                               | none                                                                                                                       |
| 3.12 | Achievements                                           | `Definitions.js`                            | none                                                                                                                       |
| 3.13 | Skills / tricks                                        | `Pet.js`, `Activities.js`                   | reskin                                                                                                                     |
| 3.14 | Adventures                                             | `StoryGen.js`, `Missions.js`                | reskin                                                                                                                     |
| 3.15 | Family tree / generations                              | `Pet.js`, `PetDefinition.js`                | none                                                                                                                       |
| 3.16 | Hubchi (online social)                                 | networking modules                          | **disable for the prototype** (or keep if it points at Tamaweb's own server — likely founder-gated/ToS-bound; default OFF) |
| 3.17 | Camera-cooking toy                                     | `Activities.js`                             | replace with Sous's **real** Vision cook flow                                                                              |

---

## 4. Architecture — embedding the copied Tamaweb game in the Sous shell

Tamaweb is **vanilla JS + a 2D canvas renderer + sprite atlases + its own service
worker + its own localStorage save**, OOP-structured (`App.js`/`Main.js` loop,
`Object2d.js`/`Drawer.js` rendering, `Pet.js`/`Animal.js`/`PetDefinition.js` model,
`Activities.js`/`Missions.js`/`StoryGen.js` gameplay). Two integration options:

### Option A (recommended for speed): self-contained canvas mount

Copy Tamaweb's built game into **`public/tamaweb/`** (its JS, CSS, assets) and
mount it inside a Sous client route via a single canvas/`<div>` host that Tamaweb
attaches to. A thin `DogeGame` React wrapper (dynamic-imported, `ssr:false`)
boots Tamaweb's `App`/`Main` against that host on mount and tears it down on
unmount.

- **Pros:** fastest; minimal porting; Tamaweb's loop/render/save run untouched.
- **Cons:** Tamaweb owns its own DOM/canvas + its own service worker + its own
  save key — must be **sandboxed** so it doesn't fight Next's SW or routing
  (don't let Tamaweb register its SW; namespace its localStorage; scope its CSS).
- **Reskin** = swap the sprite-atlas PNGs (and the `PetDefinition` frame
  references) for Doberman atlases.

### Option B (cleaner, more work): port the JS modules into `src/lib/doge/`

Translate Tamaweb's classes into the Sous tree as **client-only TS modules**
(`Pet.ts`, `Scene.ts`, `Activities.ts`, …) driven by a single `<canvas>` React
component, with its save routed through Sous's localStorage + the `diary-sync`
write-through (so the dog syncs cross-device like the diary).

- **Pros:** one codebase, one SW, one save system, Sous-native testing; easier to
  feed Sous signals (real weather, real cooking) into the game.
- **Cons:** a real porting effort (JS → TS, globals → modules, its loop → a React-
  friendly RAF/`useEffect`).

**Recommendation:** **start with Option A** to validate the product in days, then
**incrementally migrate hot modules to Option B** where Sous integration matters
(feeding ↔ real cook flow; weather ↔ `useWeather`; save ↔ cross-device). Quarantine
all copied material in `public/tamaweb/` (Option A) or `vendor/tamaweb/` (Option B)
per Section 1.

### 4.1 Wiring Tamaweb (vanilla canvas) into Next.js 15 — the gotchas

- **Client-only:** `dynamic(() => import('…'), { ssr: false })`; canvas + `window`/
  `navigator` access must never run on the server.
- **Service worker:** Tamaweb ships its own `service-worker.js`. **Do not register
  it** — Sous already owns `public/sw.js`. Strip Tamaweb's SW registration so the
  two don't collide.
- **Save namespacing:** prefix Tamaweb's localStorage keys (e.g. `tw:`) so they
  can't clash with Sous keys, and so Track-B deletion is trivial.
- **Lifecycle:** start the game loop in `useEffect` on mount; **cancel the RAF +
  detach listeners on unmount** (route changes) to avoid leaks/double-loops.
- **Audio/haptics/camera:** route through Sous's existing sound/haptic/Vision
  systems or disable; respect Sous's reduced-motion + sound-safe settings.
- **Routing:** give the game its own route (e.g. `/doge`) inside the Sous
  `DeviceFrame`, reached as the pet-first home when `SOUS_DOGE_MODE` is on.

---

## 5. The reskin — Tamagotchi → Doberman (the one creative change in Track A)

"All you have to do is re-skin the Tamagotchi to be the Doberman." Concretely:

1. **Identify the pet's art** in `PetDefinition.js` + the sprite atlas(es) — the
   frame sets per life stage / animation (idle, eat, walk, sleep, play, sick, …).
2. **Author Doberman frames in the same atlas format + frame dimensions** so they
   drop in without touching the engine. Two ways to source them:
   - **Reuse Sous's pixel Doberman** (`pixel-doberman.tsx`): render its charmaps
     to PNG frames at the atlas's cell size — instant, on-brand, ours.
   - **Draw new Doberman frames** matching Tamaweb's animation set where Sous lacks
     a pose (eat/wash/sleep/sick) — same pixel scale.
3. **Swap the atlas + repoint `PetDefinition`** frame indices to the Doberman set.
   The 300-char evolution still works — each "character" becomes a Doberman
   variant (coat/markings/accessories), or collapse the tree to a tasteful set if
   300 Doberman frames is too much art for the prototype (a prototype can ship a
   subset; full set is a Track-B art task).
4. **Reskin secondary art** to taste (food, props, UI) — optional for the
   prototype; the pet swap is the must-have.

Everything else in Tamaweb (decay curves, mini-game logic, shop, missions, family
tree) renders the new Doberman without further change.

---

## 6. Preserving Sous's moat — feeding = real cooking

The one place we _add_ to copied Tamaweb rather than just reskin: **bridge
Tamaweb's "feed" action to Sous's real cook/nutrition engine** so Doge keeps the
thing Tamaweb can't do.

- Tamaweb "feed/snack" → also opens (or is satisfied by) **Sous's real cook/log
  flow**; logging a real meal that closes a real deficit raises the dog's
  _real-health_ hearts (`computePetState`), distinct from the game's hunger meter.
- Keep a **hard wall**: the copied game's stats are the _toy_ layer; Sous's
  nutrition truth is the _real_ layer. Surface both, never let the toy economy
  corrupt the real signal (Sous already practices this — Fetch awards no XP).
- The headline action becomes **"cook for your dog"** (photograph or pick a dish →
  guided cook → the Doberman eats it), which is Sous's Vision + pairing path —
  strictly better than Tamaweb's 3-photo toy (3.17).

(Mini-games, lifecycle, den, weather, social: **as copied** — Sections 3–4. The
deep designs from the prior clean-room draft become the Track-B spec.)

---

## 7. Preserving ALL Sous functionality (non-negotiable)

Doge is a **superset**. Everything Sous does stays, reframed as the dog's world:
cooking/deck → "cook for your dog"; nutrition/diary → the dog's true health;
Path/streaks/XP → training + record; Content → the "dog & you" magazine; **Sous
Everywhere** (widget/wallpaper/push) → the dog on your lock screen; the
hunger/weather/crave-it deck → the dog craves dinner at dinnertime. A flag
**`SOUS_DOGE_MODE`** renders either "Sous (cooking-first)" or "Doge (dog-first,
Tamaweb embedded)" from one codebase — so the prototype can A/B and converge.

---

## 8. Phasing (sequenced)

**Phase 0 — Legal + scaffold (day 1).** Fork Sous → `doge`. Add `NOTICE` + the
CC BY-NC-SA `LICENSE` for the quarantined Tamaweb dir. Land the in-flight
**accessory-loot** branch (Phase-0 seed). Add `SOUS_DOGE_MODE` + the `/doge` route.

**Phase 1 — Embed Tamaweb (Option A).** Copy Tamaweb's build into
`public/tamaweb/`; strip its SW; namespace its save; mount it via a client
`DogeGame` wrapper inside the Sous frame. Sandbox + lifecycle-clean it.

**Phase 2 — The Doberman reskin.** Swap the pet sprite atlas to Doberman frames
(reuse `pixel-doberman.tsx` rendered to PNG, + new poses). Repoint
`PetDefinition`. This is the whole "make it a doge game" deliverable.

**Phase 3 — Sous bridges (Option B, selective).** Feeding ↔ real cook flow;
weather ↔ `useWeather`; save ↔ cross-device `diary-sync`; disable Hubchi.

**Phase 4 — Product polish + QA.** Reduced-motion/sound-safe wiring; the
adversarial-review + a11y sweep (Sous ritual); prototype with real users.

**Phase 5 — Track B: the bespoke rebuild (HARD GATE before public/commercial).**
_Independently_ rebuild the validated game — original engine + art, or a clean-room
reimplementation (the prior draft of this plan is the spec) — and **delete the
`vendor/tamaweb/` quarantine**. This sheds NC + ShareAlike so the production app
can be commercial and fully owned. **No public commercial launch until this lands.**

---

## 9. Compliance checklist (do these before any Tamaweb file is copied)

- [ ] `NOTICE` crediting autosam/Tamaweb + the repo URL + "CC BY-NC-SA 4.0" + "changes: reskinned the pet to a Doberman; embedded in a Next.js shell".
- [ ] `LICENSE` (CC BY-NC-SA 4.0 text) at the quarantine dir root; the prototype repo licensed CC BY-NC-SA if published.
- [ ] An in-app **Credits** screen with the attribution + a link.
- [ ] All copied material under **one** quarantine dir (`public/tamaweb/` or `vendor/tamaweb/`).
- [ ] **No commercial use** of the prototype (no ads/sale/paid tier).
- [ ] Track B (bespoke rewrite) is a tracked, blocking pre-launch milestone.
- [ ] Tamaweb's own SW unregistered; its online/social (Hubchi) disabled unless explicitly permitted.

## 10. Risks + open founder decisions

1. **License (your call, settled):** copy under CC BY-NC-SA for the prototype; bespoke rebuild before public/commercial. Compliance checklist (§9) is mandatory.
2. **Integration:** Option A (embed `public/tamaweb/`, fast) → migrate to Option B (port to `src/lib/doge/`) where Sous integration matters. Recommend A-then-B.
3. **Reskin scope:** prototype can ship a _subset_ of the 300 evolutions as Doberman variants; the full set is a Track-B art task.
4. **No death / wellbeing:** Tamaweb may allow neglect-death; decide whether to soften it (Sous is a wellbeing product). Easy to clamp.
5. **Hubchi / online:** default OFF for the prototype (server + ToS + privacy); the Sous "Dog Park" via Supabase Realtime is the Track-B social path.
6. **Save collisions:** namespace Tamaweb's localStorage + don't register its SW (or you'll break Sous's offline/push).
7. **Track B is the real product:** treat Track A strictly as a throwaway prototype — don't let copied CC code accrete into shippable surfaces.

> Sources: [autosam/Tamaweb](https://github.com/autosam/Tamaweb) ·
> [Tamaweb site](https://tamawebgame.github.io/) ·
> [CC BY-NC-SA 4.0 deed](https://creativecommons.org/licenses/by-nc-sa/4.0/)
