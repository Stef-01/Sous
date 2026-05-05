# Intelligence Layer — Comprehensive Plan

> **Filed:** 2026-05-04
> **Theme:** Y5 anchor work. Each swipe builds an editable preference profile the user owns. Profile drives recommendations everywhere (QuestCard, ResultStack, search, Eat Out). An agentic recipe finder fills the long tail (cravings the local catalog can't satisfy). A clear Verified-vs-Unverified taxonomy keeps the trust signal honest.
> **Substrate-status:** Pure helpers + Zod schema + tests landed in this commit. UI wire-up + agent-flow + Eat Out land in Y5 Sprints C–E + J per the updated Y5 plan.

## Single-sentence framing

The Intelligence Layer turns implicit user signals (swipes, cooks, rerolls, time-of-day) into an _editable_ preference profile that shapes every recommendation surface; an agentic fallback fills the long tail with clearly-labeled Unverified results.

## Architecture

```
        ┌──────────────────────────────────────────────────────────┐
        │                  USER ACTIONS                            │
        │  swipe-right · swipe-left · cooked · rerolled · saved    │
        │  skipped · search-issued · time-of-day · day-of-week     │
        └──────────────────────────────────────────────────────────┘
                                │
                                ▼
        ┌──────────────────────────────────────────────────────────┐
        │            SIGNAL AGGREGATOR (pure)                      │
        │  per-tag weight updates  ·  decay over time              │
        │  anti-monotony guard      ·  cold-start floor            │
        └──────────────────────────────────────────────────────────┘
                                │
                                ▼
        ┌──────────────────────────────────────────────────────────┐
        │            PREFERENCE PROFILE                            │
        │  inferredTags  +  manualTags  +  timeOfDayPatterns       │
        │  (localStorage; Postgres-mirrored at Y4 Sprint C flip)   │
        └──────────────────────────────────────────────────────────┘
              │                       │                     │
              ▼                       ▼                     ▼
        ┌──────────┐            ┌──────────┐         ┌────────────┐
        │  Quest   │            │  Result  │         │  Eat Out   │
        │  Card    │            │  Stack   │         │  surface   │
        └──────────┘            └──────────┘         └────────────┘
              ▲                       ▲                     ▲
              │                       │                     │
              └───────────┬───────────┴─────────────────────┘
                          │
                          ▼
              ┌──────────────────────┐
              │  PROFILE EDITOR UI   │
              │  (user reads+edits)  │
              └──────────────────────┘
                          │
                          ▼
        ┌──────────────────────────────────────────────────────────┐
        │            MERGE: manualTags overrides inferredTags      │
        │       (user is always source of truth — ML is hint)      │
        └──────────────────────────────────────────────────────────┘
```

## Component 1 — Signal events

Every user action that hints at preference fires one signal. Signals are typed, weighted, and time-stamped. The aggregator decays them over a rolling 90-day window.

```ts
type SignalKind =
  | "swipe-right" // strong positive (+1.0)
  | "swipe-left" // strong negative (-0.6)
  | "cooked" // very strong positive (+1.5)
  | "rerolled" // mild negative (-0.3)
  | "saved" // moderate positive (+0.8)
  | "skipped" // mild negative (-0.2)
  | "search-issued" // weak positive (+0.4 on the search term itself)
  | "search-result-tapped"; // moderate positive (+0.6)

interface PreferenceSignal {
  id: string;
  kind: SignalKind;
  /** What the signal is about — cuisine slug + flavor tags + protein. */
  facets: SignalFacets;
  /** ISO timestamp. */
  capturedAt: string;
  /** Time-of-day bucket at capture. */
  timeOfDay: "morning" | "lunch" | "afternoon" | "dinner" | "late-night";
  /** Day-of-week (Mon-Sun) at capture. */
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

interface SignalFacets {
  cuisine: string; // "indian"
  flavors: string[]; // ["spicy", "tangy"]
  proteins: string[]; // ["chicken"]
  dishClass: string; // "curry" / "bowl" / "noodle" / etc.
  ingredients: string[]; // for fine-grained matching
}
```

The aggregator computes the **per-tag weight** as the time-decayed sum of signal weights against that tag, divided by the total signal volume. The result is in [-1, 1] where:

- > 0.6 → strong like
- 0.2 .. 0.6 → mild like
- -0.2 .. 0.2 → neutral
- -0.6 .. -0.2 → mild dislike
- < -0.6 → hard dislike

## Component 2 — PreferenceProfile schema

```ts
interface PreferenceProfile {
  schemaVersion: 1;

  // ─── Inferred from signals ──────────────────────────────────
  inferredTags: {
    cuisines: Record<string, number>; // "indian": 0.78
    flavors: Record<string, number>; // "spicy": 0.65
    proteins: Record<string, number>; // "chicken": 0.40
    dishClasses: Record<string, number>;
  };

  // ─── Manual edits — user is source of truth ─────────────────
  manualTags: {
    likes: string[]; // ["thai", "tangy", "weeknight"]
    dislikes: string[]; // ["beef", "cilantro", "fennel"]
    /** Tags the user explicitly *removed* from inference — even
     *  if signals later suggest them, they stay suppressed. */
    suppressed: string[];
  };

  // ─── Time-of-day patterns ───────────────────────────────────
  timeOfDayPatterns: {
    morning: { topTags: string[]; confidence: number };
    lunch: { topTags: string[]; confidence: number };
    afternoon: { topTags: string[]; confidence: number };
    dinner: { topTags: string[]; confidence: number };
    "late-night": { topTags: string[]; confidence: number };
  };

  // ─── Diagnostic ─────────────────────────────────────────────
  signalCount: number;
  updatedAt: string;
}
```

### Cold-start + confidence

| Signal volume | Confidence  | What user sees                                                                       |
| ------------- | ----------- | ------------------------------------------------------------------------------------ |
| 0             | none        | Uniform recommendations, generic copy                                                |
| 1–4           | weak        | Recommendations slightly biased; profile editor shows "Keep swiping to learn more"   |
| 5–19          | medium      | Visible bias; profile editor shows top 3 inferred tags with low-confidence pill      |
| 20–49         | strong      | Profile editor shows the full inferred set; recommendations are clearly personalised |
| 50+           | very strong | Time-of-day patterns surface in the editor                                           |

Decay: each signal's contribution multiplies by `exp(-age_days / 60)`. Older than ~120 days → effectively zero contribution.

### Merge rule (manual overrides inferred)

```
finalLikeWeight(tag) =
  if tag in manualTags.dislikes  -> -1.0  (hard suppress)
  elif tag in manualTags.suppressed -> 0  (don't infer)
  elif tag in manualTags.likes    -> max(0.7, inferredTags[tag])  (boost)
  else                            -> inferredTags[tag] ?? 0
```

The user is always the source of truth. The ML output is a _hint_ the user can edit at any time, never a verdict.

## Component 3 — Time-of-day classifier

```
05:00 – 11:00  →  morning
11:00 – 14:00  →  lunch
14:00 – 17:00  →  afternoon
17:00 – 21:00  →  dinner
21:00 – 05:00  →  late-night
```

The aggregator partitions signals into these 5 buckets and computes per-bucket top tags. The profile editor surfaces these patterns once a bucket has ≥5 signals (otherwise the bucket displays "Learning…").

Example state for an active user:

```
Morning   → fresh · light · fruity · oats · yogurt   (12 signals)
Lunch     → bowl · grain · veg-forward                (8 signals)
Afternoon → snack · sweet                             (3 signals — Learning…)
Dinner    → hearty · meaty · cozy · indian · italian (28 signals)
Late-night → dessert · pasta                          (6 signals)
```

This state powers the `Today` page's time-aware suggestions: at 7am the engine biases toward `morning` patterns; at 7pm toward `dinner`.

## Component 4 — Profile Editor UI

Surface: existing Profile & Settings sheet (the one opened by tapping the owl mascot). New `Preferences` section.

```
┌─────────────────────────────────────────────────┐
│  ← Profile & Settings              [done]      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Parent Mode                          [○ off]  │
│  Eco Mode                             [● on ]  │
│                                                 │
│  ─────────────────────────────────              │
│                                                 │
│  Your kitchen                                   │
│                                                 │
│  Cuisines you love                              │
│   [italian]  [thai]  [japanese]  [+ add]        │
│                                                 │
│  Flavors you love                               │
│   [spicy]  [tangy]  [umami]  [+ add]            │
│                                                 │
│  Things you don't eat                           │
│   [beef]  [cilantro]  [+ add]                   │
│                                                 │
│  ─────────────────────────────────              │
│                                                 │
│  When you cook (learned)                        │
│                                                 │
│   Morning   →  fresh, light, fruity             │
│   Lunch     →  bowls, veg-forward               │
│   Dinner    →  hearty, meaty, cozy              │
│                                                 │
│  ─────────────────────────────────              │
│                                                 │
│  Reset learned preferences   [reset]            │
│                                                 │
└─────────────────────────────────────────────────┘
```

Tag interactions:

- **Tap a tag** → small detail sheet: "Where this came from" (inferred from N swipes since DATE) + remove + suppress (don't infer this in future).
- **+ add** → text input with autocomplete from the catalog vocabulary; on submit, adds to `manualTags.likes` (or `dislikes` for the dislike row).
- **Reset learned** → clears `inferredTags` (manual tags preserved).

Tags from `manualTags.likes` show solid; inferred-only tags show with a small `· learned` suffix in faint type.

## Component 5 — Verified vs Unverified taxonomy

Every recipe in the system is tagged with a source:

```ts
type RecipeSource =
  | "nourish-verified" // catalog seed, clinician-approved (Y5 E)
  | "nourish-curated" // catalog seed, no clinician layer
  | "user-authored" // saved from /path/recipes/new
  | "agent-found"; // Anthropic+Tavily agent fetched

interface RecipeProvenance {
  source: RecipeSource;
  sourceUrl?: string; // for agent-found
  sourceTitle?: string;
  fetchedAt?: string;
  agentNote?: string; // agent's brief safety/health appraisal
}
```

UI surfacing:

- Default search results list: only `nourish-verified` + `nourish-curated` show on the first page.
- A small `See more (incl. agent-found)` chip at the bottom expands to include `agent-found` + `user-authored`.
- Every non-Verified card carries an explicit pill in the top-right corner: `Unverified · agent-found` (gold) or `Unverified · user` (neutral).
- Tapping the pill opens an info sheet: "Why this is marked unverified" with the source URL + agent note.

The user is never confused about which results carry the Nourish quality stamp.

## Component 6 — Agentic recipe flow

When the local catalog returns 0 results for a craving search:

```
┌──────────────────────────────────────────────────┐
│  No matches in our kitchen yet for                │
│  "Pear, Smoked Ham, and Arugula Open Faced       │
│   Sandwich"                                       │
│                                                   │
│  ╭──────────────────────────────────╮             │
│  │  ✨ Send agent to find this      │             │
│  │  We'll search the web, appraise, │             │
│  │  and bring you the cleanest      │             │
│  │  recipe we find.                 │             │
│  ╰──────────────────────────────────╯             │
└──────────────────────────────────────────────────┘
```

Tap → loading state → agent returns 1–3 candidates with provenance:

```
┌──────────────────────────────────────────────────┐
│ [photo from sourceUrl]                            │
│                                                   │
│  Pear, Ham + Arugula Open Sandwich                │
│  via bonappetit.com                               │
│  [Unverified · agent-found]                       │
│                                                   │
│  Agent note: Plant-forward, 380 kcal/serving;    │
│  swap ham for prosciutto for lower sodium.        │
│                                                   │
│  [Cook anyway] [Save] [Try another]               │
└──────────────────────────────────────────────────┘
```

Cooking an Unverified recipe still feeds the user's preference signals — at a **discounted weight** (×0.5) since the agent's tagging may be coarser than the catalog's.

### Agent backend (founder-gated, ANTHROPIC_API_KEY)

Stub mode V1 returns canned fixtures matching common queries. Real mode flips when `ANTHROPIC_API_KEY` is set:

```
1. Tavily web search for `${query} recipe healthy`
2. Top 3 URLs scraped (title + structured data)
3. Anthropic Claude 4.x:
   - parse ingredient list
   - estimate prep time, cook time, calories
   - generate 1-line health appraisal
   - flag any obvious safety concerns (raw eggs / undercooked /
     allergen heavy)
4. Return structured RecipeProvenance + ScoreBreakdown
```

The substrate already lives in `src/lib/ai/autogen-provider.ts` (Y2 W3 stub-mode V1). The agentic recipe-search flow is one new wrapper around it.

## Component 7 — "Eat Out" agentic mode

Surface: new entry in the Today More-Options sheet's "Quick helpers" section. Route: `/eat-out`.

### Layout — Michelin-Guide-creative

```
┌─────────────────────────────────────────────────┐
│  ← Eat Out                                      │
│                                                 │
│  ╭───────────────────────────────────────────╮  │
│  │  🔍  I'm craving…                         │  │
│  ╰───────────────────────────────────────────╯  │
│                                                 │
│  [Eat in] [Pickup] [Delivery]                   │
│                                                 │
│  ╔═════════════════════════════════════════╗    │
│  ║                                         ║    │
│  ║          [hero dish photo]              ║    │
│  ║                                         ║    │
│  ║  Spiced Lamb Shawarma                   ║    │
│  ║  Light · 540 kcal · 12 min away         ║    │
│  ║                                         ║    │
│  ║  [swipe →]                              ║    │
│  ╚═════════════════════════════════════════╝    │
│                                                 │
│  ╔═════════════════════════════════════════╗    │
│  ║          [next dish photo]              ║    │
│  ║  Heirloom Tomato Tartine                ║    │
│  ╚═════════════════════════════════════════╝    │
│                                                 │
└─────────────────────────────────────────────────┘
```

Card stack — each card is a single dish from a single venue:

- **Front:** dish photo (hero) + dish name + 1-line health/timing.
- **Swipe right** (or tap) → reveals venue: name + cuisine + distance + ratings + Yelp/Google link + delivery options.
- **Swipe left** → next card.

Filter tabs at the top (Eat in / Pickup / Delivery) determine which venue capabilities the agent filters for.

### Agentic search

`I'm craving shawarma` → agent:

1. Geo: user's coarse location (city/zip; never precise).
2. Search Yelp (Y7 founder-gated) + Google Places (Y7 founder-gated) for `shawarma near {city}`.
3. For each top-5 venue, fetch top dish + photo.
4. Anthropic appraises health: rank by sodium / portion / fresh-vegetable presence (using the same Y4 W1 ScoreBreakdown extension shape).
5. Return ranked dish-cards.

Cold-start (no agent flip): pre-seeded fixture data for 8 dishes in 4 venues so the demo + new-user flow has something to render.

## Component 8 — Demo seeds for intelligence layer

For the demo flow:

1. **PreferenceProfile pre-populated** with `signalCount: 47` so the editor shows full inferred tags + emerging time-of-day patterns:
   - cuisines: `italian: 0.78, thai: 0.62, japanese: 0.51, indian: 0.45`
   - flavors: `spicy: 0.71, tangy: 0.59, umami: 0.48`
   - proteins: `chicken: 0.42, plant-protein: 0.55`
   - manualTags.likes: `["weeknight", "one-pan"]`
   - manualTags.dislikes: `["beef", "cilantro"]`
   - timeOfDayPatterns:
     - morning: `["fresh", "fruity", "oats"]` (10 signals)
     - dinner: `["hearty", "italian", "comfort"]` (22 signals)

2. **Eat Out fixtures** with 8 dishes across 4 venues so the swipe-stack has volume:
   - Spiced Lamb Shawarma — Sami's Mediterranean (12 min, $12)
   - Heirloom Tomato Tartine — Tartine Bakery (8 min, $9)
   - Charred Eggplant Bowl — Souvla (15 min, $14)
   - … (5 more)

## Y5 sprint allocation

Updated from the original 12-sprint Y5 plan. The intelligence layer occupies Sprints C–E (foundation → editor → agent), then Sprint J adds Eat Out:

| Sprint      | Theme                                               | Output                                                                                                                                          |
| ----------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| C (W9–W12)  | Intelligence-layer foundation                       | PreferenceProfile schema · signal aggregator · time-of-day classifier · localStorage hook (✓ substrate landed in this commit)                   |
| D (W13–W16) | Profile editor UI + manual-edit reconciliation      | Profile sheet `Preferences` section · tag chips · "Where this came from" detail · reset/suppress flows                                          |
| E (W17–W20) | Verified/Unverified taxonomy + agentic recipe agent | RecipeProvenance type · search-result filter UI · "Send agent" CTA · Anthropic+Tavily wrapper (stub V1, real-mode-flips on `ANTHROPIC_API_KEY`) |
| J (W37–W40) | Eat Out agentic mode                                | `/eat-out` route · dish-first card stack · venue-reveal swipe · agent search wrapper for venue queries                                          |

## What pushes to Y7 (founder/external-gated)

- Real Yelp / Google Places API integration for Eat Out dish + venue lookup
- Real local-venue carbon scoring (needs venue-level ingredient sourcing data)
- Cohort-data tuning of the signal weights (need real production data to fit)
- Multi-region support for Eat Out (USA-only at Y5 launch)

These belong in the new `YEAR-7-VIBECODE-PLAN.md` since they're external-dependency or cohort-data gated.

## What this commit ships

- `src/types/preference-profile.ts` — Zod schema + types
- `src/lib/intelligence/time-of-day.ts` + tests — pure classifier
- `src/lib/intelligence/signal-aggregator.ts` + tests — pure aggregator (signal → tag-weight)
- `src/lib/intelligence/manual-edit-merge.ts` + tests — merge rule
- `src/lib/intelligence/recipe-source-taxonomy.ts` + tests — verified/unverified

UI wire-up + agent flow + Eat Out scaffolding land in Y5 Sprints D / E / J per the updated plan.

## In one paragraph

Each user action emits a typed signal. Signals decay over a 90-day window into per-tag weights that form an editable preference profile. The user reads + edits the profile in a new `Preferences` section of the existing settings sheet — manual tags always override learned signals because the user is the source of truth, ML is the hint. Time-of-day patterns surface once a bucket has 5+ signals so users see "fresh in the morning, hearty at night" insights. When the catalog can't satisfy a craving, an agentic fallback fetches recipes from the web and tags them clearly Unverified — never confused with the catalog's Nourish-Verified set. Late in Y5, an Eat Out agentic mode brings the same intelligence to a Michelin-Guide-creative dish-first venue surface for moments when cooking in isn't the answer.
