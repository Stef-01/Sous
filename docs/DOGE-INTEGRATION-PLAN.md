# Doge Overhaul — Integration Plan

> **Status: SHIPPED (2026-06-20).** P0–P5 built, tested (36 doge tests), and
> verified in-preview; P6 (mood mirror) intentionally deferred per the
> guided-cook-deprioritized directive (the `sous:setMood` verb is wired as a
> no-op for forward-compat). Reskin the embedded Tamaweb pet to a Doberman and
> wire Sous's cook loop into the pet game across four pillars (visual · economy ·
> feed · fun-facts), all riding one typed postMessage bridge.
>
> **Shipped commits:** P0 branding (`64b7b27`) · P1 bridge + logo (`ce43b05`) ·
> P2 Doberman reskin (`cfb8783`) · P3 cook→feed (`6f11a5a`) · P4 economy
> (`6d4bf02`) · P5 fun facts (`b7f6b35`) · promo-nag suppression (`fec1c0c`).
> A receiver bug (the game's `App` is a lexical global, not `window.App`) made
> the whole bridge inert until P3 fixed it to bare `App`.
>
> **Ground truth:** every seam below was read in the real vendored source, not
> guessed. Key confirmations: `Pet.js:25-26` renders `spriteSkin ?? sprite`;
> `spriteSkin` is serializable (`PetDefinition.js:382`); `gold:15` default
> (`PetDefinition.js:293`) is whitelisted into the save (`:390`);
> `App.loadingEnded` flips at `App.js:443`; the **only** existing message channel
> is a `BroadcastChannel('sw-messages')` (`Main.js:112`) — so the cross-frame
> `window` `'message'` listener every pillar needs is genuinely greenfield;
> exactly 5 user-visible `Tamaweb` literals exist (`App.js:3188/8171/8812`,
> `index.html:43`, `manifest.webmanifest:2-4`).
>
> **IP:** Doberman atlases are originally authored from `pixel-doberman.tsx`,
> never derived from Tamaweb art. All game-side logic lives in one Sous-authored
> receiver. No Tamaweb code is copied; the roster/GrowthChart are never edited;
> upstream attribution is preserved. See `docs/TAMAWEB-PERMISSION.md`.

---

## 0. The shape of the whole thing

```
┌──────────────────────── Sous (React parent, Next.js) ────────────────────────┐
│                                                                                │
│  cook complete ─┐                                                              │
│  check-in       ├─▶ window CustomEvents ──▶  DogeBridge (one client module)    │
│  manual log     │                              ├─ gold-economy   (pillar 2)    │
│  win-screen     ┘                              ├─ dish-to-food   (pillar 3)    │
│                                                ├─ fun-fact pick  (pillar 4)    │
│  /doge route  ◀── mounts ──▶  iframe  ◀────────┤  origin + nonce, outbox queue │
│  (page.tsx)                                    └─ postMessage(channel:'doge')  │
└───────────────────────────────────────────────────────────│───────────────────┘
                                                             │  ONE typed bus
┌──────────────────── Doge game (vendored, in iframe) ───────▼───────────────────┐
│  public/tamaweb/src/sous-bridge.js  (NEW, single Sous-authored receiver)        │
│    window 'message' → origin + nonce + channel check → dispatch by verb:        │
│      sous:gold:credit  → Activities.task_winMoneyFromArcade / gold+=  + save()  │
│      doge:grantDish    → register def + addNumToObject(inv.food) + save()       │
│      doge:say          → App.pet.say(text, ms)   (re-resolve App.pet each call) │
│      sous:setMood      → map onto App.pet.stats (forward-compat, pillar 1)      │
│    posts back: doge:ready / doge:ack / doge:granted / doge:said                 │
│  spriteSkin reskin (pillar 1) is pure in-bundle, needs NO bridge.               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**One bridge, four verbs.** Every pillar except the pure visual reskin is a
message on the same bus. This is deliberate: a single receiver, a single
origin+nonce guard, a single boot handshake, a single outbox. The pillars do not
each invent their own channel.

---

## 1. CENTRAL ARCHITECTURE — the Sous ↔ Doge postMessage bridge

Everything downstream rides this. It is specified first because the economy,
feed, and fun-facts pillars are all just verbs on it, and the visual pillar must
be forward-compatible with its `sous:setMood` verb.

### 1.1 Why postMessage, not reach-into-globals

The iframe is **same-origin** (`/tamaweb/` is served under the Sous origin), so
`iframe.contentWindow.App.pet.say(...)` is technically reachable. We reject that
approach because:

- **`App.pet` is reassigned** on hatch/age-up (`App.js` ~335/356/2284). A cached
  parent reference goes stale; a message receiver re-resolves `window.App.pet` on
  every call.
- **The game boots async.** `App.loadingEnded` flips at `App.js:443`. A direct
  call from the parent races the boot; a handshake (`doge:ready`) makes readiness
  explicit.
- **One guarded surface.** A message bus gives a single origin+nonce checkpoint
  instead of N ad-hoc global pokes.
- **Removability / IP.** All game-side logic lives in one new Sous-authored file
  (`sous-bridge.js`); we never edit `App.js`/`Definitions.js`/`PetDefinition.js`/
  `GrowthChart.js` logic. (Two tiny additive render branches in `App.js` are the
  _only_ exception, gated entirely on a `customImage` field that native foods
  never have — §4.3.)

### 1.2 The single message protocol

New file **`src/lib/doge/bridge-protocol.ts`** — the typed source of truth for
every message, imported by the parent bridge and mirrored (as plain JS shape
comments) in the receiver. Every message carries `channel:"sous-doge"`, `v:1`,
and for parent→game a `nonce`.

```ts
// src/lib/doge/bridge-protocol.ts
export const DOGE_CHANNEL = "sous-doge" as const;
export const DOGE_PROTOCOL_V = 1 as const;

export type DogeMood = "asleep" | "hungry" | "peckish" | "content" | "thriving"; // == PetMood

// ---- parent → game ----
export type SousToDoge =
  | { channel: typeof DOGE_CHANNEL; v: 1; type: "sous:hello"; nonce: string }
  | {
      channel: typeof DOGE_CHANNEL;
      v: 1;
      type: "sous:gold:credit";
      nonce: string;
      txnId: string;
      amount: number;
      reason: GoldReason;
      juice: boolean;
      label?: string;
    }
  | {
      channel: typeof DOGE_CHANNEL;
      v: 1;
      type: "doge:grantDish";
      nonce: string;
      txnId: string;
      def: DogeFoodDef;
    }
  | {
      channel: typeof DOGE_CHANNEL;
      v: 1;
      type: "doge:say";
      nonce: string;
      sayId: string;
      text: string;
      ms?: number;
    }
  | {
      channel: typeof DOGE_CHANNEL;
      v: 1;
      type: "sous:setMood";
      nonce: string;
      mood: DogeMood;
    }; // pillar 1 forward-compat; receiver may no-op in v1

// ---- game → parent ----
export type DogeToSous =
  | { channel: typeof DOGE_CHANNEL; v: 1; type: "doge:ready" }
  | {
      channel: typeof DOGE_CHANNEL;
      v: 1;
      type: "doge:ack";
      txnId: string;
      credited: number;
    }
  | {
      channel: typeof DOGE_CHANNEL;
      v: 1;
      type: "doge:granted";
      txnId: string;
      id: string;
    }
  | { channel: typeof DOGE_CHANNEL; v: 1; type: "doge:said"; sayId: string };

export type GoldReason = "cook_complete" | "checkin" | "log_meal";
```

**Verb table (the complete bus):**

| Verb               | Dir | Pillar | Effect in game                                                      | Ack            |
| ------------------ | --- | ------ | ------------------------------------------------------------------- | -------------- |
| `doge:ready`       | g→p | bridge | announces boot; re-fires on hatch/age-up                            | —              |
| `sous:hello`       | p→g | bridge | delivers the session nonce                                          | —              |
| `sous:gold:credit` | p→g | 2      | `task_winMoneyFromArcade` (juice) or `gold+=` then `save()`         | `doge:ack`     |
| `doge:grantDish`   | p→g | 3      | register def if absent + `addNumToObject(inv.food,id,1)` + `save()` | `doge:granted` |
| `doge:say`         | p→g | 4      | `App.pet.say(text, ms)` (suppressed if scripted/asleep)             | `doge:said`    |
| `sous:setMood`     | p→g | 1      | map mood→`App.pet.stats`; v1 may no-op                              | —              |

### 1.3 Handshake + nonce (anti-forgery)

Same-origin is necessary but not sufficient: a hostile page could embed `/doge`
in _its own_ iframe and `postMessage` a forged credit. So:

1. Game boots → receiver waits for `App.loadingEnded` (`App.js:443`) → posts
   `{type:"doge:ready"}` to `window.parent`.
2. Parent bridge (mounted in `page.tsx`) mints a `crypto.randomUUID()` **per
   mount** and replies `{type:"sous:hello", nonce}`.
3. Every later parent→game message carries that nonce; the receiver **drops any
   message whose nonce ≠ the one from hello**. `doge:ready` re-fires on
   hatch/age-up — harmless, the parent just re-sends `hello` and flushes the
   outbox.

Both ends additionally hard-check `event.origin === location.origin` and
`data.channel === "sous-doge"` (ignore everything else, including the game's own
`BroadcastChannel` traffic and third-party library noise).

### 1.4 The outbox (deferred delivery — the load-bearing reliability property)

A cook almost always completes on a **cook page, not `/doge`** — the iframe
usually isn't mounted. So the bridge never assumes the game is alive:

- Each parent→game side-effecting message (`gold:credit`, `grantDish`) is
  recorded in a **localStorage outbox** keyed by `txnId` **before** it is posted.
- The message is posted opportunistically if the iframe is mounted and
  `doge:ready` was seen.
- On the matching ack (`doge:ack` / `doge:granted`), the txn moves from `outbox`
  → `settled`.
- On every fresh `doge:ready`, the bridge **re-flushes the whole outbox**. A cook
  done while the game was closed pays out / grants the next time the user opens
  `/doge`, and never twice (the `txnId` dedupes).

`doge:say` is **fire-and-forget** (no outbox): a missed fun fact is not worth
persisting; it simply isn't shown.

### 1.5 The receiver (`public/tamaweb/src/sous-bridge.js`)

New, Sous-authored, ~70 lines, loaded by one `<script>` tag in `index.html`
**after `Main.js`** (so `App`, `Activities`, `Pet.prototype.say` all exist).
Because `index.html` loads non-module scripts, the receiver sees `window.App` /
`window.Activities` directly. Shape:

- `window.addEventListener("message", onMsg)`; once `window.App?.loadingEnded`,
  post `doge:ready`.
- `onMsg(e)`: return unless `e.origin === location.origin` **and**
  `e.data?.channel === "sous-doge"`.
  - `sous:hello` → store `nonce`.
  - else require `e.data.nonce === storedNonce` (drop otherwise) **and**
    `window.App?.loadingEnded && window.App.pet` (else ignore — the parent
    retries on next `doge:ready`).
  - dispatch by `type` to the four verb handlers, each re-resolving
    `window.App.pet` fresh.
  - defensive clamps: gold `0 < amount ≤ 200`; say `text.replace(/[<>]/g,"")` to
    dodge the raw-HTML branch of `displayMessageBubble` (`App.js:7585`).
  - belt-and-suspenders in-memory `Set` of seen `txnId`s on top of the parent
    ledger.

### 1.6 The parent bridge (`src/lib/doge/sous-bridge.ts`) + mount

`SousBridge(iframeRef)` owns: nonce minting, the `message` listener
(origin-checked), the outbox flush on `doge:ready`, and the four `post*` methods
(`postGold`, `postGrantDish`, `postSay`, `postMood`). It is instantiated **once**
in `src/app/doge/page.tsx`, which also injects the
`<script src="/tamaweb/src/sous-bridge.js">` tag into the iframe document on load
and tears both down on unmount.

Crucially, the bridge **hangs off existing global window events**
(`sous-stats-updated`, the diary change event, a new lightweight
`sous:cook-completed` CustomEvent) — so the cook pages need only one-line
additions, and the bridge is cleanly removable.

---

## 2. PILLAR 1 — Doberman visual reskin (pure in-bundle, no bridge)

**Mechanism: per-stage `spriteSkin` pointed at originally-authored Doberman
atlases generated from `pixel-doberman.tsx`.** Confirmed seams: `Pet.js:25-26`
renders `spriteSkin ?? sprite`; `spriteSkin` is serializable
(`PetDefinition.js:382`); life-stage geometry derives from the **real** `sprite`
(`getLifeStage`), never the skin — so growth and geometry are never broken by the
reskin.

We reject recolor (`recolorImage` is exact-hex, can't carve dog ears/snout) and
roster/GrowthChart edits (churn + CC-BY-NC-SA art risk). We touch **zero**
entries in `CharacterDefinitions.js` / `GrowthChart.js`.

### 2.1 The atlas contract

One PNG per stage = a 4×4 grid of `cellSize`×`cellSize` crisp cells, no padding,
cells 1-based left→right top→bottom. `cellSize` by stage (verified against the
real PNGs): baby 16 (64×64, offsetY 8), child/teen 24 (96×96, offsetY 4),
adult/elder 32 (128×128, offsetY 0). The renderer (`Drawer.draw`) splits each
cell into upper 4/5 + lower 1/5 for the breathing squash → **keep feet in the
bottom ~1/5, body centered.**

The animation table is **shared by all characters** (lives on `PetDefinition`,
not per-character), so a replacement atlas must honor exact pose-per-cell:

| cell(s)        | states                     | Doberman pose                                            |
| -------------- | -------------------------- | -------------------------------------------------------- |
| 1–2            | idle                       | stand, ears up                                           |
| 2–4            | cheering/jumping           | happy/jump, tongue (mood `thriving`)                     |
| 3–4            | open_mouth                 | mouth open (pre-eat)                                     |
| 4–7            | uncomfortable/angry/refuse | sad/sick (mood `hungry` + game's `sickness_overlay.png`) |
| 7–8            | shocked                    | startled                                                 |
| 8–9            | blush                      | content + blush                                          |
| 9–10           | idle_side                  | side profile                                             |
| 10–12          | moving/talking             | 2-frame walk, side                                       |
| 12–14          | kissing                    | head tilt (content)                                      |
| 14–16          | sitting/eating             | sit + head-dip eat                                       |
| 16 (→17 wraps) | sleeping                   | lying, eyes closed (mood `asleep`)                       |

"sick" needs no new art — it's the `hungry` mood plus the game's existing
`sickness_overlay.png` (drawn by `Pet.js`). Rule 7: reuse the asset that exists.

### 2.2 Asset pipeline (AUTO-BUILD)

`pixel-doberman.tsx` is the single in-repo IP-clean source (`buildHeroMap`,
`COLORS`, `HERO_*` char-stamps). We add 5 small pose builders to it —
`HERO_BODY_WALK_A/B`, `HERO_BODY_SIT`, `HERO_BODY_SLEEP`, `HERO_BODY_EAT`,
`HERO_PUP_BODY_STAND` + a `lifeStageScale` flag — widening the `pose` union from
`"stand"|"bow"` to add `walk-a|walk-b|sit|sleep|eat|pup`. This is additive
(existing callers default to `stand`/`bow`, untouched per rule 3) and **upgrades
the Sous header/win-screen pet for free**.

`scripts/gen-doge-atlas.ts` (run via `pnpm gen:doge-atlas`, `tsx`) imports those
builders, maps mood+pose onto each cell via a `CELL_TO_POSE` table, renders each
char-grid cell to SVG `<rect>`s, composites a 4×4 SVG at the stage's `cellSize`,
and rasterizes with **`@resvg/resvg-js`** (one new dev dep — pure, no native
toolchain, crisp/no-AA) to
`public/tamaweb/resources/img/doge/doge_{baby,child,teen,adult,elder}.png` + a
`doge-atlas.manifest.json` (stage→path→cellSize). Pup vs adult silhouettes come
from **parameterizing the builder per stage**, not hand-drawing 5 dogs.

### 2.3 Wiring the skin into the game (≤6 lines, no roster edits)

- `PetDefinition.prepareSprite()` (called on construct, loadStats, **and**
  ageUp) — after deriving `lifeStage`, set
  `this.spriteSkin = DOGE_SKIN_BY_STAGE[this.lifeStage]` from the manifest. This
  makes the skin **follow evolution automatically** across all 5 stages with zero
  `ageUp`/`getPossibleEvolutions` changes, and auto-adopts the Doberman skin on
  any existing/imported save (overwritten every load).
- `App.js` preload list (`~236-247`) — append the 5 `doge/*.png` paths so
  `getPreloadedResource(spriteSkin)` resolves (un-preloaded skin renders blank).
- Starter (`App.js:337`) — **leave `randomFromArray(PET_BABY_CHARACTERS)`
  as-is**; all underlying babies render the same Doberman skin per stage.

### 2.4 Forward-compat with the bridge

The pure reskin needs no messaging. But the receiver implements `sous:setMood` so
a later step can drive the in-iframe pet's _expression_ from Sous's
`computePetState` — mapping `DogeMood` onto `App.pet.stats` (hunger/fun). The
mood vocabulary is **identical** to `PetMood` (`pet-state.ts:11`) so the header
pet and game pet always read the same.

---

## 3. PILLAR 2 — Earn-money economy (engage + cook → gold)

**Doge gold is a toy currency.** Earned by engaging with Sous (especially real
cooks), spent only inside the game. The data flow is strictly one-way:
`Sous event → compute gold → postMessage → game`. Gold never re-enters Sous.

### 3.1 THE WALL — toy economy ≠ real nutrition (load-bearing)

The economy modules (`gold-economy.ts`, `gold-ledger.ts`, the gold path in
`sous-bridge.ts`) **import nothing** from `use-xp-system`, `use-nutrition-diary`,
`pet-state`, or `use-cook-sessions` internals. They read event payloads + the
gold ledger and write only a `postMessage`. Concretely the bridge MUST NOT:
write/read `sous-nutrition-diary-v1`, `sous-xp-system`, `sous-cook-stats`,
`computePetState`, or the Doberman _mood_; let a gold value flow into any Sous
store; gate any nutrition/health/XP outcome on gold or vice-versa. The pet's
**mood stays a pure function of the diary** (`computePetState`), wholly
independent of gold. Gold is a downstream, write-only sink — enforced
structurally by the import boundary and asserted in tests.

### 3.2 Earn table (tuned, non-exploitable) — `src/lib/doge/gold-economy.ts` (pure)

| Event           | Trigger                                       | Gold                       | Cap / anti-exploit                     | Idempotency key            |
| --------------- | --------------------------------------------- | -------------------------- | -------------------------------------- | -------------------------- |
| Real cook       | `completeSession` (last step of `handleNext`) | 25 + streak bonus          | first 3 cooks/day full; 4th+ → flat 5  | cook `sessionId`           |
| Combined plate  | last-dish branch                              | 25 + 5/extra dish, max +15 | one cook vs the 3/day window           | plate `sessionId`          |
| Daily check-in  | first `/today` mount/day                      | 10                         | once per `YYYY-MM-DD`                  | `checkin:<date>`           |
| Manual meal log | non-`auto` `DiaryEntry` commit                | 3                          | max 4/day; `auto:true` cook-logs pay 0 | `log:<date>:<n>`           |
| Mini-game win   | already in-game                               | game-native                | game's own                             | n/a (never crosses bridge) |

Streak bonus (computed from `completeSession`'s returned `newStreak`, **not** read
from `sous-xp-system`): ≥7 → +10, ≥14 → +20 (additive, can't blow the cap).
Global `MAX_GOLD_PER_DAY = 110`, clamped by the ledger. Normal day ≈ 35 gold
(1 check-in + 1 cook); power day ≈ 95 < cap. Cooking _more times one day_ never
meaningfully out-earns cooking _once a day for several days_ — a daily habit, not
a binge.

`goldForCook({dishCount, streak, cooksAlreadyPaidToday})`, `goldForCheckin()`,
`goldForLog(manualLogsToday)`, `clampToDailyCap(proposed, alreadyToday)` — all
pure, no `Math.random` (engine determinism rule).

### 3.3 Idempotency ledger — `src/lib/doge/gold-ledger.ts` (localStorage `sous-doge-gold-ledger`)

```ts
interface GoldLedger {
  paid: Record<string, number>; // txnId → gold (credit-once memory)
  byDay: Record<string, number>; // date → total proposed (cap)
  cooksPaidByDay: Record<string, number>;
  manualLogsByDay: Record<string, number>;
  outbox: Array<{ txnId; amount; reason; juice; label? }>; // unacked (shared with §1.4)
}
```

Cook flow: receive event → if `paid[sessionId]` exists, **stop** (hard dedupe) →
`amount = clampToDailyCap(goldForCook(...), byDay[today])` → push to outbox, bump
`byDay`/`cooksPaidByDay`, persist → post `sous:gold:credit` → on `doge:ack`, move
outbox→`paid`. The idempotency key **is the cook sessionId**, so a cook pays
exactly once even if `/doge` is opened days later.

### 3.4 Game-side credit (receiver verb `sous:gold:credit`)

Mirrors every in-game earn site: `juice:true` (default for a cook) →
`Activities.task_winMoneyFromArcade({amount, hasWon:true})` (money-bag animation,
already does `gold +=`); `juice:false` → `App.pet.stats.gold += amount;
App.save()`. `App.save()` is called explicitly (autosave is on a 6s timer). Then
post `doge:ack`. `App.pet` read fresh each message.

### 3.5 No cook-page edits for gold

The bridge listens to the **existing** `sous-stats-updated` window event
(dispatched by `completeSession`, `use-cook-sessions.ts:300`), reads the freshest
completed session, and credits. Check-in is the bridge's own per-day ledger
check; manual log subscribes to the diary's existing change event and credits
only when the newest entry is **not** `auto:true`.

---

## 4. PILLAR 3 — Cook → Feed inventory (cook one pho → feed the dog one pho)

A real cook grants **one feedable serving of that exact dish** into
`App.pet.inventory.food`; the feed chip shows the **actual
`/food_images/<dish>.png`** hero; eating bumps hunger and persists. Verified
seams: `Pet.feed(spriteCell, value, type, forced, onEndFn)` (`Pet.js:551`),
`App.addNumToObject(App.pet.inventory.food, id, ±1)` (`App.js:4261/4264`), feed
call `App.js:4296`, `inventory.food` serialized (`PetDefinition.js:338`).

### 4.1 The dish→food adapter — `src/lib/doge/dish-to-food.ts` (pure, rule-7 gated)

Reads **only** `meals.json` / `sides.json` (the only legal ids — rule 7) to build
a `DogeFoodDef`:

```ts
export interface DogeFoodDef {
  id: string; // = dish id (inventory key), e.g. "pho"
  name: string; // real dish name
  customImage: string | null; // "/food_images/pho.png" or null → fallback sprite
  spriteFallback: number; // a REAL existing foods_on.png cell (per-cuisine)
  hunger_replenish: number; // gameplay band, NOT a nutrition claim (§4.2)
  fun_replenish: number;
  health_replenish: number;
  cuisine: string;
  cookableOnly: true;
  unbuyable: true;
  sous: true; // provenance; hidden from buy menu
}
export function dishToFood(slug: string): DogeFoodDef | null; // null for off-catalog / custom-* / unknown
```

**Rule-7 guard:** off-catalog/user-created/unknown slugs return `null` and grant
nothing (the cook still completes normally). We never fabricate a dish, name, or
image.

### 4.2 Image + values are art-honest (rule 7)

- **Hero exists** → chip uses `customImage`. `<c-sprite>` with
  `naturalWidth === width === 24, index === 0` yields x=y=0 → renders the
  **whole** PNG. Real cooked pho, verbatim, no atlas, no invented art.
- **No hero** → `customImage:null` → `spriteFallback`, a **real existing**
  `foods_on.png` cell per cuisine. Never generate a sprite.
- **Hunger/health are a deterministic gameplay band, NOT a nutrition claim** —
  `replenishBand`: meal `{40,8,6}`, side `{18,4,3}`. They are never surfaced as a
  fact, so rule 7's "facts must be sourced" doesn't bind them.

### 4.3 The two render patches (the only `App.js` logic edits in the whole overhaul)

Native food defs have no image field; both render sites read `sprite` (an atlas
cell). To show the real hero:

- **Menu chip:** add `App.getFoodCSpriteForDef(foodDef)` that emits
  `<c-sprite naturalWidth=24 width=24 index=0 src="${customImage}">` when
  `customImage` is set, else falls back to `getFoodCSprite(foodDef.sprite)`.
- **In-scene eating chip:** extend the `uiFood` write so that when `customImage`
  is present it sets `uiFood.src = customImage; uiFood.naturalWidth = 24;
uiFood.index = 0`.

Both are `if (foodDef.customImage)` branches — **every native food is
byte-identical** because no native def has that field.

### 4.4 Grant flow (receiver verb `doge:grantDish`) + queue

The def **travels in the message**. The receiver registers
`App.definitions.food[def.id]` if absent, grants via
`addNumToObject(inv.food, id, 1)`, `App.save()`, posts `doge:granted`. Because
`App.definitions.food` rebuilds fresh each boot, the parent **re-posts the full
grant queue on every `doge:ready`** (register-if-absent is idempotent).

React side: `grantDishToDoge(slug)` runs `dishToFood`, pushes to localStorage
queue `sous-doge-grant-queue-v1` (durable), and opportunistically posts if
mounted. Cook-page edits are **one line each**: `grantDishToDoge(slug)` after
`diaryLogCook` in `cook/[slug]`, and
`for (const od of orderedDishes) grantDishToDoge(od.dish.slug)` in `cook/combined`.

---

## 5. PILLAR 4 — Fun facts (the dog tells you nutrition + food-history)

The Doberman speaks a short, **sourced** fact — context-triggered after a cook
("cooked pho → a pho fact") and periodically while `/doge` is open. Seam:
`App.pet.say(text, ms)` (`Pet.js:1647`) via the `doge:say` verb.

**Verified caveat:** `cuisineFact` is typed but **every value is `null`**. The
dataset is therefore **fully self-contained** — do not wire `cuisineFact`.

### 5.1 Dataset — `src/data/pet-fun-facts.ts` (two pools, every fact sourced)

```ts
export interface PetFunFact {
  id: string;
  kind: "nutrition" | "history";
  text: string; // ≤160 chars, OUR own short wording, plain text (no HTML)
  sources: { label: string; url: string }[]; // ≥1 real reachable page
  dishSlugs?: string[]; // EXACT meals.json/sides.json ids (rule 7)
  cuisines?: string[];
  nutrient?: string;
  ingredient?: string;
}
```

- **Nutrition pool** re-words the takeaways of `NUTRITION_EVIDENCE[]` (iron+vitC,
  turmeric+pepper, tomato-lycopene, tea-iron, fat-soluble, soak-beans,
  vitD-calcium) **carrying the same citations**.
- **History pool** concentrates on the catalog's heavy cuisines (Vietnamese,
  Indian, Filipino, …): pho, butter-chicken, adobo, pad-thai, pizza-margherita,
  ramen, kimchi. Each `dishSlugs` id is grepped against the catalog **in the
  test**.

Target ~14 nutrition + ~16 history.

### 5.2 Scheduler — `src/lib/doge/fun-fact-scheduler.ts` (pure core)

`pickFact(ctx, roll)` with priority ladder: **dish match** → **need match**
(`PetState.need.key`) → **cuisine match** → **generic**. Exhausted tier resets.
`roll∈[0,1)` injected for determinism. Dedup memory in localStorage
`sous-doge-fact-seen`.

Two triggers: **(A) context** — win-screen dispatches
`CustomEvent('sous:cook-completed', {detail:{slug, cuisineFamily}})`; the bridge
picks an unseen dish/cuisine fact and posts `doge:say`. **(B) periodic** — while
`/doge` is open, a jittered 4–7 min timer posts a need-aware fact, with a 90s
cooldown.

### 5.3 Receiver verb `doge:say`

Re-resolve `App.pet`; strip `[<>]`; **suppress** if `pet.isDuringScriptedState()`
or `pet.stats.is_sleeping`; call `pet.say(text, ms)`; post `doge:said`. Rule 13:
the fact is the whole bubble — source behind a tap. Do **not** route facts through
`StoryGen`.

---

## 6. Sequenced phase plan

Each phase is independently shippable, ends green (`pnpm lint && pnpm test &&
pnpm build`), and commits to main.

| Phase                          | Scope                                                                                                                                     | Gate / done                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **P0 — Branding + safety**     | Swap the 5 `Tamaweb` literals → `Doge`.                                                                                                   | `/doge` title/install say "Doge"; attribution intact. |
| **P1 — The bridge**            | `bridge-protocol.ts`, `sous-bridge.ts`, `sous-bridge.js` + `<script>` tag, handshake + nonce + outbox, mount in `page.tsx`.               | Console shows handshake; foreign-origin ignored.      |
| **P2 — Visual reskin**         | Pose builders in `pixel-doberman.tsx`; `gen-doge-atlas.ts` + test + `@resvg/resvg-js`; 5 PNGs + manifest; `prepareSprite` hook + preload. | All 5 stages render a Doberman through ageUp.         |
| **P3 — Feed**                  | `dish-to-food.ts` + test; `grantDishToDoge` + queue; `doge:grantDish` verb; 2 `App.js` patches; cook one-liners.                          | Cook pho → `/doge` shows ★ PHO ×1 → feed → hunger up. |
| **P4 — Economy**               | `gold-economy.ts` + ledger + test; `sous:gold:credit`; wire events.                                                                       | Cook → coins land; caps + dedupe; wall test passes.   |
| **P5 — Fun facts**             | `pet-fun-facts.ts` + test; `fun-fact-scheduler.ts` + test; `doge:say`; win-screen event; timer.                                           | Cook pho → dog says a pho fact; dedupe holds.         |
| **P6 — Mood (forward-compat)** | Implement `sous:setMood` end-to-end. Optional, deferred per guided-cook directive (verb stays wired).                                     | In-iframe mood mirrors header pet.                    |

**Why this order:** P1 first (highest-risk dependency); P2 independent of the bus
(most visible win); P3→P4→P5 escalate from most-game-coupled to least; P6 polish.

---

## 7. File-by-file change map

### New — Sous (React/TS)

- `src/lib/doge/bridge-protocol.ts` — typed message contract.
- `src/lib/doge/sous-bridge.ts` — parent bridge: nonce, listener, outbox, `post*`.
- `src/lib/doge/gold-economy.ts` + `gold-economy.test.ts` — pure earn table.
- `src/lib/doge/gold-ledger.ts` — idempotency/cap/outbox ledger.
- `src/lib/doge/dish-to-food.ts` + `dish-to-food.test.ts` — slug→food adapter.
- `src/lib/doge/fun-fact-scheduler.ts` + `fun-fact-scheduler.test.ts` — `pickFact`.
- `src/data/pet-fun-facts.ts` + `pet-fun-facts.test.ts` — sourced two-pool dataset.
- `scripts/gen-doge-atlas.ts` + `gen-doge-atlas.test.ts` — atlas renderer.

### New — game (Sous-authored, IP-isolated)

- `public/tamaweb/src/sous-bridge.js` — the single receiver, all four verbs.
- `public/tamaweb/resources/img/doge/doge_{baby,child,teen,adult,elder}.png` +
  `doge-atlas.manifest.json` — generated assets.

### Touched — Sous (surgical)

- `src/app/doge/page.tsx` — inject `<script>`, mount `SousBridge`, drain queue,
  periodic fact timer, listeners; teardown on unmount.
- `src/app/cook/[slug]/page.tsx` — one line: `grantDishToDoge(slug)`.
- `src/app/cook/combined/page.tsx` — one line: loop `grantDishToDoge`.
- `src/components/guided-cook/win-screen.tsx` — one `useEffect` dispatching
  `sous:cook-completed`.
- `src/components/nutrition/pixel-doberman.tsx` — 5 additive pose builders.
- `package.json` — `@resvg/resvg-js` devDep + `gen:doge-atlas` script.

### Touched — game (minimal, additive)

- `public/tamaweb/index.html` — `<script src="src/sous-bridge.js">`; `<title>` → Doge.
- `public/tamaweb/manifest.webmanifest` — name/short_name/id → Doge.
- `public/tamaweb/src/PetDefinition.js` — ~3 lines: `spriteSkin` from manifest.
- `public/tamaweb/src/App.js` — 3 `Tamaweb` strings → Doge; preload append;
  `getFoodCSpriteForDef` + `uiFood` `customImage` branch.

**Never touched:** `CharacterDefinitions.js`, `GrowthChart.js`, `Definitions.js`
data, the ~300-character roster, the growth DAG. Upstream attribution preserved.

---

## 8. The wall + rule-7 + IP (compliance, restated)

- **Rule 7:** feed grants only real catalog ids; chip art is the dish's own PNG or
  a reused _existing_ native sprite — never invented. Replenish values are
  gameplay points, never shown as nutrition. Facts are our own short wording with
  real citations, every `dishSlugs` id CI-validated.
- **The wall:** gold modules import nothing from nutrition/XP/diary/session
  stores (CI-asserted); gold is a one-way sink; the pet's _mood_ stays a pure
  function of the diary.
- **Reduced motion:** the bridge adds no Sous-side motion; honors
  `useReducedMotion()`.
- **IP:** Doberman atlases originally authored from `pixel-doberman.tsx`; all
  game-side logic in one Sous-authored receiver; no Tamaweb code copied; the
  "Tamaweb" name appears in no user-facing string.

---

## 9. Open decisions

1. **One parent module or two?** Recommendation: **one** `SousBridge` class +
   separate pure logic modules.
2. **Always-mounted bridge vs `/doge`-only?** Recommendation: `/doge`-mounted for
   v1 (outbox covers correctness).
3. **Mood pillar (P6) timing.** Defer the expansion per the
   guided-cook-deprioritized directive; keep the verb wired.
4. **Pin a deterministic Doberman identity?** Leave random; flag optional.
5. **`doge:fed` echo.** Document the hook, don't build the consumer yet.
6. **Manual-log gold double-count risk.** Key off `auto`; `log:<date>:<n>` ledger
   guard already in schema.
7. **Combined-plate semantics.** 3 foods, **one** gold txn, **one** fact.
