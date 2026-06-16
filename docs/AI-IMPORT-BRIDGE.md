# AI Paste-Bridge Import

A **bring-your-own-LLM** ingestion path. Instead of integrating an LLM API
(founder-gated — needs a key + cost controls, see CLAUDE.md rule 12), Sous lets
users run a provided prompt in the assistant they already pay for
(ChatGPT/Claude), then **paste the structured JSON back**. Sous validates and
ingests it. No API call, no key, no cost — and it's the exact AUTO-BUILD prep
that makes real LLM integration a one-config swap later.

## The flow (user)

1. Open **Import** (Pantry page header, or "Import a day from ChatGPT" on the
   Nutrition tab).
2. Pick a kind — **Pantry**, **Groceries**, or **Food log** — and tap **Copy
   prompt**.
3. Paste the prompt into ChatGPT/Claude, then add your raw input where it says
   (a typed list, a pasted receipt, "what I ate today…").
4. Copy the assistant's JSON reply and paste it into Sous.
5. Preview the parsed rows → **Import**.

## What lands where

| Kind        | Destination                                                 |
| ----------- | ----------------------------------------------------------- |
| `pantry`    | Pantry inventory (qty-aware) + the engine pantry name-set   |
| `groceries` | Same inventory (a shop you just did = things you now have)  |
| `nutrition` | The nutrition diary (`diaryLogBranded`), one entry per food |

Pantry/groceries write both the quantity-aware inventory
(`use-pantry-inventory`, `sous-pantry-inventory-v1`) **and** mirror normalized
names into `use-pantry` so the recommender's pantry-fit scoring sees them.
Nutrition entries become `BrandedFood`s with `provenance: "third-party"`,
`confidence: "approximated"` — honest about being estimates.

## The contract

The schema lives in `src/types/import-bridge.ts` (zod, source of truth). One
discriminated union on `kind` so a single paste box routes itself. Numbers are
coerced (LLMs quote them); unknown keys are stripped (format drift shouldn't
fail an import).

**Full nutrition (calories + protein/carbs/fat) is required on every row of
every kind** — pantry and groceries carry per-serving macros too, not just the
amount. fiber/sugar/sodium/saturated-fat are optional extras.

```jsonc
// pantry | groceries — nutrition is PER TYPICAL SERVING of the item
{ "kind": "pantry", "items": [
  { "name": "olive oil", "quantity": 1, "unit": "bottle", "category": "oils",
    "calories": 120, "protein_g": 0, "carbs_g": 0, "fat_g": 14 }
] }

// nutrition — values PER the servings eaten
{ "kind": "nutrition", "date": "today", "entries": [
  { "name": "burrito", "servings": 1, "calories": 650, "protein_g": 35,
    "carbs_g": 70, "fat_g": 24, "fiber_g": 9, "sodium_mg": 980,
    "mealType": "lunch" }
] }
```

The prompts in `src/data/import-prompts.ts` restate this shape as plain text
(the user pastes it into a _different_ app, so it must be self-contained). Keep
the prompts and the zod schema in lock-step — if you add a field, add it to
both, plus a parse/apply test.

## Code map

| File                                        | Role                                                       |
| ------------------------------------------- | ---------------------------------------------------------- |
| `src/types/import-bridge.ts`                | zod schemas + inferred types (the contract)                |
| `src/data/import-prompts.ts`                | the copy-paste prompts per kind                            |
| `src/lib/import/parse-import.ts`            | pasted text → validated payload (Result + friendly errors) |
| `src/lib/import/apply-import.ts`            | pure transforms → inventory drafts / branded-food logs     |
| `src/lib/hooks/use-pantry-inventory.ts`     | quantity-aware inventory store (shared)                    |
| `src/components/import/ai-import-sheet.tsx` | the paste UI (tabs, copy, paste, preview, import)          |

`parse-import` and `apply-import` are pure and unit-tested
(`parse-import.test.ts`, `apply-import.test.ts`).

## When real LLM integration arrives

The schema, parser, and apply transforms are reusable as-is. Swap the
copy-prompt + paste-textarea step for a server action that calls the model with
the same prompt and feeds the response straight into `parseImportText` →
`toInventoryDrafts` / `toFoodLogs`. The ingestion half doesn't change.
