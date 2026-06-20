# Doge Pet Dashboard — Plan (nutrition system _attached_ to the dog game)

> **Founder intent (2026-06-20, with reference mockup):** the **Doge game's main
> page** becomes a pet-care dashboard where the dog's **health stats ARE the real
> nutrition system** — Energy · Mood · Hydration · Sleep · Protein · Fiber ·
> Vitamins · Movement — with care actions (Log Meal · Play · Walk · Water · Sleep
> · Check Stats), XP/level, currency, a recent-activity feed, inventory, and the
> daily streak. The pet comes **off the home page**. Plan first, build after.

## The key insight: ~70% of this already exists

We are **promoting + expanding**, not building from scratch:

- **`src/components/nutrition/pet-sheet.tsx`** already renders the full screen —
  room scene, hero sprite, **health-stat bars (Energy · Mood · Hydration ·
  Protein · Fiber)**, **action buttons (Log meal · Fetch · Water · Cook · Stats)
  that do real things** (Water logs a glass, Log Meal focuses the real field),
  recent activity, inventory, streak, and Path XP/level. It opens today as a
  _sheet_ from the Nutrition header.
- **`src/lib/nutrition/pet-screen-data.ts`** already has the pure selectors:
  `vitaminCoverage`, `fiberCoverage`, `activityFeed`, `xpToLevel` — all reading
  the SAME nutrition sources (NUTRIENT_DISPLAY FDA DVs, the coverage-gated dish
  registry, the Path XP curve).
- **`src/lib/nutrition/pet-state.ts`** → `computePetState` (mood/hearts/fullness/
  strength) and **`pixel-doberman.tsx`** (the dog) already exist.
- **`use-hydration.ts`** tracks water; **gold-ledger.ts** is the coin economy.

So the work is: **(1)** promote the sheet to a full **/doge** page, **(2)** add
the 3 missing stats (Sleep · Vitamins · Movement) + 2 actions (Walk · Sleep),
**(3)** wire currency/day/gems, **(4)** polish to the reference's art, **(5)**
move the pet off the home page.

## The 8 health stats → their real nutrition signal

Every bar reads the shared aggregate (`aggregateDay`) + personal targets — one
source of truth with the Nutrition page (rule 7: never invented).

| Stat          | Source                            | Status                                     |
| ------------- | --------------------------------- | ------------------------------------------ |
| **Energy**    | calories ÷ target (fullness)      | ✅ exists (`computePetState`)              |
| **Mood**      | overall hearts (how well you ate) | ✅ exists                                  |
| **Hydration** | water glasses ÷ goal              | ✅ exists (`use-hydration`)                |
| **Protein**   | protein_g ÷ target (strength)     | ✅ exists                                  |
| **Fiber**     | fiber_g ÷ DV (28 g)               | ✅ exists (`fiberCoverage`)                |
| **Vitamins**  | avg vitamin DV coverage           | ✅ exists (`vitaminCoverage`) — surface it |
| **Sleep**     | hours slept ÷ goal                | 🟡 NEW — needs a simple sleep logger       |
| **Movement**  | a walk/activity logged ÷ goal     | 🟡 NEW — needs a simple walk logger        |

Sleep + Movement are **AUTO-BUILD** (a tiny localStorage logger each, exactly
like `use-hydration` — no external device/account needed). They're optional to
log; un-logged → the bar sits low + the action invites you. _(If you'd rather not
track sleep/steps at all, we map those two bars to nutrition-only signals or drop
them — see fork #2.)_

## The 6 care actions → real effects

| Button          | Effect                                                      |
| --------------- | ----------------------------------------------------------- |
| **Log Meal**    | opens the real diary log (focuses the field / `/nutrition`) |
| **Play**        | the Fetch mini-game (already built) — fun, never games XP   |
| **Walk**        | logs a walk → Movement bar + XP                             |
| **Water**       | logs a glass → Hydration bar (already built)                |
| **Sleep**       | logs the night's sleep → Sleep bar                          |
| **Check Stats** | opens the full `/nutrition` dashboard                       |

Each real log feeds the **Recent Activity** feed (Meal Logged +20, Water +15,
Walk +25, Sleep +20 — points = the Path XP it already awards) and the **Daily
Streak**.

## Currency / level / day

- **Coins** = the Doge gold economy (`gold-ledger.ts`) — already earned by
  cooking + check-in.
- **Level + XP** = the Path XP curve (`xpToLevel`) — already wired.
- **Day N** = days since first launch (a one-line localStorage stamp).
- **Gems** = a premium currency. _Fork #3:_ introduce now (rare earn) or defer.

## Inventory

The cook→feed servings already grant into the Doge inventory (P3). The dashboard
shows the pantry/feed items (bowl, ball, bone, treats, the dishes you cooked) — a
grid like the reference, reading the existing grant store.

## Two build tracks (rule 12 classification)

1. **AUTO-BUILD — the functional nutrition-attached dashboard.** Promote PetSheet
   → full `/doge` page; add Sleep/Vitamins/Movement bars + Walk/Sleep loggers +
   actions; wire coins/day/activity/inventory/streak; remove the home-page pet.
   All from existing systems + a couple of tiny new local stores. Tested + shippable.
2. **ART-POLISH — the reference's pixel-art fidelity.** The mockup is a richly
   rendered scene (detailed Doberman, cozy lamp-lit room, beveled wood UI panels,
   colored stat bars with up-arrows, icon tiles). Our current `pixel-doberman` is
   a clean charmap sprite. Matching the mockup exactly is an **iterative art track**
   (richer room art, panel chrome, the play-bow Doberman) — done in recursive
   passes against the preview, not a one-shot. The functional dashboard ships
   first; the art is layered on.

## Recursive build steps (after the forks are locked)

1. **Promote** PetSheet to a full-screen route component (`/doge` or `/doge` →
   this; keep the sheet entry from Nutrition too, sharing the component).
2. **Stat model v2** — extend `pet-screen-data.ts` to the full 8-stat array
   (add Sleep/Movement/Vitamins), pure + tested.
3. **New loggers** — `use-sleep.ts` + `use-movement.ts` (localStorage, mirror
   `use-hydration`), with the Walk/Sleep actions.
4. **Dashboard shell** — the reference layout: header (Dobe/level/XP · coins/gems/
   day · settings), left HEALTH STATS panel (8 bars + status line), center stage
   (the dog + room), right RECENT ACTIVITY, bottom action row + inventory + streak.
5. **Wire actions** — each button → a real log → activity feed + XP + streak.
6. **Currency/day** — coins (gold-ledger), Day N stamp, gems (per fork #3).
7. **Move off home** — revert the `today-nutrition-glance` Dobe avatar (keep the
   metrics glance; the dog lives in the game now).
8. **Tamaweb decision** (fork #1) — replace / keep-as-Play-minigame / both.
9. **Art-polish passes** — recursive fidelity to the mockup.
10. **Verify** — tests (stat model, loggers), build, screenshots vs the mockup.

## Open forks (need your call before building)

1. **The Tamaweb game's role.** This custom dashboard is the bespoke ("Track B")
   direction. Does it **replace** the Tamaweb iframe as `/doge`, sit **alongside**
   it (Tamaweb becomes the "Play" minigame), or keep Tamaweb at `/doge` and put
   this at a new route?
2. **Sleep + Movement tracking.** Build the two tiny loggers (recommended — full
   8-stat parity with the mockup), or map those bars to nutrition-only signals /
   drop them?
3. **Gems.** Introduce the second currency now, or defer (coins only for v1)?
