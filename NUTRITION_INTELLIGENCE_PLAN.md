# Sous Nutrition Intelligence System — 3-Month Build Plan

> **Proposed start:** Phase 7 (post-V1 core)
> **Scope:** Intelligent nutrient-aware preference memory, context-sensitive meal recommendations, and absorption-optimised pairings
> **Author notes:** Critically appraised against Sous architecture. See §9 for risks.

---

## The Idea

Users type natural-language nutrition goals into the home page chat (e.g. "I want more iron because of periods" or "I love mango desserts on hot days"). The system remembers these intents, understands nutrient science (absorption enhancers, inhibitors, chelation), reads the user's context (time, weather), and proactively surfaces meal ideas that fulfil the stated goals.

This is Duolingo for _nutritional fluency_ — not a calorie tracker, not a medical app. It's a personal cooking companion that remembers you.

---

## Critical Appraisal

### What's strong

- **Genuine user value** — period-related iron needs, hot-weather hydration, seasonal cravings are real, underserved, non-trivial. No mainstream cooking app handles this.
- **Aligns with existing architecture** — the preference vector in the pairing engine already has hooks for health orientation. Claude already does craving parsing. The coach already captures vibe. This extends those systems rather than replacing them.
- **Non-invasive** — it's additive. Users who ignore the chat still get the core experience. No settings, no onboarding screens.
- **Differentiating** — nutrient-absorption pairing (iron + vitamin C, calcium blocking iron) is scientifically grounded and genuinely useful. No other consumer app does this at pairing time.

### What's risky

- **Medical proximity** — "I need more iron due to periods" edges toward health advice. Must not become medical recommendation. Hard disclaimers and bounded scope required.
- **Context APIs** — weather and time-of-day data require external dependencies (weather API, device time). Adds infrastructure surface.
- **Memory staleness** — user preferences change. "I wanted mango in July" shouldn't show up in January. Need decay logic.
- **Accuracy of nutrition science** — chelation interactions are real but complex. Getting them wrong erodes trust. Must source from authoritative databases, not generate.
- **Scope creep** — this could expand indefinitely. Must stay bounded to: remember preference → surface relevant pairing → explain why. No meal planning, no deficiency diagnosis.

### What to cut

- No calorie counting, no macro targets
- No medical deficiency diagnosis
- No meal planning calendars
- No push notifications (Phase 1 constraint)
- No wearable/health data integration (too complex, too regulated)

---

## System Architecture

```
User chat input
      │
      ▼
Claude (structured extraction)
  ─ nutrient_goals: string[]          e.g. ["iron", "vitamin-c"]
  ─ flavor_preferences: string[]      e.g. ["sweet", "tropical", "mango"]
  ─ context_triggers: ContextTrigger[]  e.g. [{type:"weather", value:"hot"}]
  ─ time_preferences: TimePref[]      e.g. [{time:"midday", season:"summer"}]
  ─ exclusions: string[]             e.g. ["dairy with iron meals"]
      │
      ▼
NutritionMemoryStore (localStorage → DB in Phase 2)
  ─ preferences: PreferenceRecord[]
  ─ Each record: { id, raw, parsed, createdAt, lastTriggeredAt, weight }
      │
      ▼
ContextEvaluator (runs at pairing time)
  ─ Reads: current time, weather (if permission granted), recent cooks
  ─ Scores each preference record by context match
  ─ Returns: active_preferences[]
      │
      ▼
NutrientAwarePairingEngine (extends existing pairing engine)
  ─ New scorer: nutrient_alignment (boosts sides that fulfill active goals)
  ─ New scorer: absorption_compatibility (penalises known inhibitor combos)
  ─ New scorer: context_relevance (boosts hydrating sides on hot days, etc.)
      │
      ▼
Results with nutrient callout chips
  ─ "High iron" badge on relevant sides
  ─ "Pairs well with your iron goal" explanation
  ─ "Avoid with this meal: dairy" warning chip
```

---

## Nutrient Science Data Model

```typescript
interface NutrientInteraction {
  nutrient: string; // "iron"
  enhancers: string[]; // ["vitamin-c", "folate"] — boosts absorption
  inhibitors: string[]; // ["calcium", "tannins", "phytates"]
  bestFoods: string[]; // ["lentils", "spinach", "red-meat"]
  note: string; // "Vitamin C converts Fe3+ to Fe2+ (more absorbable)"
}

interface AbsorptionRule {
  nutrientA: string;
  nutrientB: string;
  effect: "enhance" | "inhibit";
  mechanism: string; // brief scientific note, shown in UI
  severity: "high" | "medium" | "low";
}
```

### Seed data (Month 1 priority pairs)

| Nutrient        | Key Enhancers               | Key Inhibitors                                             | Mechanism note                             |
| --------------- | --------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| Iron (non-haem) | Vitamin C, citric acid      | Calcium, tannins (tea/coffee), phytates (unleavened bread) | Vit C reduces Fe³⁺ → Fe²⁺ for absorption   |
| Calcium         | Vitamin D, magnesium        | Oxalates (raw spinach, beets), phytates                    | Fat-soluble D needed for active transport  |
| Zinc            | Animal protein, citric acid | Phytates, high iron supplementation                        | Competitive absorption at same transporter |
| Magnesium       | Vitamin D, B6               | Excess calcium, alcohol                                    | Required cofactor for ATP synthesis        |
| Vitamin D       | Dietary fat                 | —                                                          | Fat-soluble, requires fat at same meal     |
| Folate          | Vitamin C                   | Alcohol, heat (cooking destroys)                           | Heat-labile — prefer raw or lightly cooked |
| Omega-3         | —                           | Omega-6 excess                                             | Ratio matters more than absolute amount    |

---

## Preference Memory Model

```typescript
interface PreferenceRecord {
  id: string;
  rawInput: string; // "I want more iron because of periods"
  parsed: ParsedPreference;
  createdAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
  weight: number; // 0–1, decays over time
  expiresAt?: string; // optional explicit expiry
  tags: string[]; // ["menstrual-health", "iron", "energy"]
}

interface ParsedPreference {
  nutrientGoals: NutrientGoal[];
  flavorSignals: string[];
  contextTriggers: ContextTrigger[];
  exclusions: string[];
  tone: "health" | "pleasure" | "comfort" | "energy";
}

interface NutrientGoal {
  nutrient: string;
  priority: "high" | "medium";
  reason?: string; // "periods" — kept for personalised copy
}

interface ContextTrigger {
  type: "time_of_day" | "weather" | "season" | "day_of_week";
  value: string; // "hot", "midday", "summer", "weekend"
  threshold?: number; // e.g. tempCelsius > 28 for "hot"
}
```

---

## Phase 1 — Memory Foundation (Weeks 1–4)

### Goal

Ship the preference chat input and persistent memory store. No AI inference yet — just capture and store.

### What to build

#### 1. `NutritionChatInput` component

- Lives on Today page, below the craving text input
- Collapsed by default — single "Tell me what you need" chip
- Expands to a textarea on tap
- Placeholder: _"I want more iron... I love mango in hot weather..."_
- Sends to Claude for structured extraction on submit
- Shows a "Saved ✓" confirmation chip

#### 2. `useNutritionMemory` hook

- localStorage-backed (same pattern as useCookSessions)
- CRUD for PreferenceRecord[]
- Weight decay: reduce weight by 10% per 30 days (min 0.1)
- Export: `activePreferences`, `addPreference`, `removePreference`, `allPreferences`

#### 3. Claude extraction endpoint

- New tRPC procedure: `nutrition.parsePreference`
- Input: raw text
- Output: `ParsedPreference` (Zod-validated)
- Deterministic fallback: simple keyword matching (iron → iron goal, mango → flavor:tropical)

#### 4. Preferences panel

- Accessible from Path tab → "My preferences"
- Shows saved preference chips with delete button
- No editing — delete and re-enter (simpler, less error-prone)

### Definition of done

User types "I want more iron" → it's stored as a preference record with parsed nutrient goals → visible in preferences panel → persists on reload.

---

## Phase 2 — Absorption-Aware Pairing (Weeks 5–8)

### Goal

Make the pairing engine nutrient-intelligent. Boost sides that help active goals; warn about inhibitors.

### What to build

#### 1. Nutrient interaction database

- Static JSON: `src/data/nutrient-interactions.json`
- Seeded with the 7 interaction pairs above
- Each side dish in `sides.json` gets a `nutrients` array (e.g. `["iron", "vitamin-c"]`)
- New field: `absorptionNotes` on side dish records

#### 2. New pairing scorers

```typescript
// src/lib/engine/scorers/nutrient-alignment.ts
// Boosts score when side's nutrients match active preference goals
export function scoreNutrientAlignment(side, activeGoals): number;

// src/lib/engine/scorers/absorption-compatibility.ts
// Penalises pairings where main + side create known inhibitor combos
export function scoreAbsorptionCompatibility(main, side, interactions): number;
```

#### 3. Nutrient callout chips in results

- `NutrientBadge` component: "High iron", "Vitamin C boost", "Avoid with iron" (red)
- Show on side dish cards when a nutrient preference is active
- Only show the most relevant badge per card (no clutter)

#### 4. Absorption warning system

- When a problematic pairing is selected (e.g. iron-rich steak + milk-based side), show a gentle warning chip: "Heads up: dairy reduces iron absorption"
- Tone: informational, never alarming
- One-tap dismiss, never blocking

### Definition of done

User with an iron preference gets sides boosted that contain vitamin C or iron. Selecting a steak + yogurt side combo shows the absorption warning. Balanced plate explanation references the nutrient goal.

---

## Phase 3 — Context Awareness (Weeks 9–12)

### Goal

Make recommendations sensitive to time of day, weather, and season.

### What to build

#### 1. Context evaluator

```typescript
// src/lib/engine/context-evaluator.ts
interface UserContext {
  timeOfDay: "morning" | "midday" | "afternoon" | "evening" | "night";
  tempCelsius?: number; // from weather API if permission granted
  season: "spring" | "summer" | "autumn" | "winter";
  dayOfWeek: string;
}

function evaluateContext(): UserContext;
function scoreContextMatch(
  preference: PreferenceRecord,
  ctx: UserContext,
): number;
```

#### 2. Weather integration (optional, permission-gated)

- Uses browser Geolocation API + Open-Meteo (free, no key required)
- Opt-in with clear "Enable weather-aware suggestions" prompt
- If denied: fall back to seasonal heuristics only
- Data never sent to any server — only used client-side for scoring

#### 3. Context-boosted Today page

- When active context matches a preference trigger, surface a "For you today" chip above the main craving input
- Example: It's midday, 32°C → "Hot day? Try a mango lassi side 🥭"
- Chip navigates to a contextual pairing with the suggestion pre-loaded
- Max 1 chip shown — never a carousel

#### 4. Preference weight decay + expiry

- Preferences with `expiresAt` set (e.g. "for summer") are hidden when out of season
- General preferences decay by 10% per 30 days, removed at weight < 0.05
- "Refresh" prompt shown in preferences panel when a preference is aging

### Definition of done

User with "mango on hot days" preference: on a 30°C midday, sees "Hot day? Try a mango side" suggestion chip on the Today page. Weather API is opt-in. On a cold day, chip is absent.

---

## Data Schema Extensions

### `sides.json` additions per dish

```json
{
  "nutrients": ["iron", "folate", "vitamin-c"],
  "absorptionNotes": "High vitamin C enhances iron absorption",
  "contextTags": ["hydrating", "cooling", "warming", "energising"],
  "seasonality": ["summer", "spring"]
}
```

### New tRPC procedures

```
nutrition.parsePreference(text) → ParsedPreference
nutrition.getActivePreferences(ctx) → PreferenceRecord[]
nutrition.getAbsorptionWarnings(mainId, sideIds) → Warning[]
```

---

## UI Rules for This System

1. **Never medical** — Use language like "supports", "helps with", "good source of". Never "treats", "cures", "deficiency".
2. **One callout per card** — If a dish has 3 relevant nutrients, show the one that matches the highest-priority active preference.
3. **Warnings are soft** — Absorption warnings use amber, never red. One sentence max. Always dismissible.
4. **Preferences are conversational** — No form fields, no dropdowns. The chat is the only input surface.
5. **Context is invisible infrastructure** — Users never see a "context settings" panel. It just works.
6. **Memory is visible and deletable** — Every saved preference can be reviewed in the preferences panel and deleted. No hidden profiles.

---

## Month-by-Month Summary

| Month                | Focus                    | User-visible outcome                                                 |
| -------------------- | ------------------------ | -------------------------------------------------------------------- |
| Month 1 (Weeks 1–4)  | Memory foundation        | "Tell me what you need" input → preferences saved + visible in panel |
| Month 2 (Weeks 5–8)  | Absorption-aware pairing | Pairing results show nutrient badges; inhibitor warnings appear      |
| Month 3 (Weeks 9–12) | Context awareness        | Hot-day / seasonal chips appear on Today page; weather opt-in        |

---

## Open Questions Before Starting

1. **Nutrient data source** — Should nutrient tags on sides come from a verified database (USDA FoodData Central, OpenFoodFacts) or manual annotation? Manual is faster but error-prone at scale.
2. **Medical disclaimer placement** — Where and how does the app disclaim that this is not medical advice? (Suggested: one-time onboarding card when first nutrition preference is saved.)
3. **Weather API** — Open-Meteo is free and privacy-respecting. Confirm acceptable.
4. **Preference scope** — Do we support macros (protein goals, carb limits) or only micronutrients in Phase 1? Recommend micronutrients only to contain scope.
5. **Cross-session context** — If a preference was entered on mobile and the user opens on desktop, should it sync? (Requires auth + DB, not just localStorage.)
