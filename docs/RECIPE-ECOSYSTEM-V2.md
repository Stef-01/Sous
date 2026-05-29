# Recipe Ecosystem V2 — Design Brief

> Status: design brief, not yet built. Captures Stefan's
> 2026-05-02 directives on **recipe storage modernisation,
> source tagging + admin approval, reel-to-cook integration,
> agentic autogen, and sharing.** Companion to
> `docs/COOKING-POD-CHALLENGE.md`.
>
> Implementation slot: **Sprint K (W47-W51)** — replaces the
> current Sprint J "2nd-pass polish" entries. Polish carries
> forward into Year-2.

## TL;DR

Five Stefan-mandated upgrades to the recipe ecosystem, all
shipped under CLAUDE.md rule 6 (simplicity-first):

1. **Source tagging.** Three tags — `user` / `community` /
   `nourish-verified` — filterable on `/path/recipes` and the
   templates row. Behind-the-scenes admin approval queue
   promotes community submissions to Nourish-verified.
2. **Reel-to-cook integration.** Tap a reel → "Cook this"
   button → `/cook/<slug>`. One-tap. The reel surface already
   exists at `/community/reels`.
3. **Agentic autogen.** New low-friction "quick add" flow.
   User types a free-text description ("chana masala — bloom
   spices, sauté onion, add tomatoes, simmer chickpeas"), the
   LLM (Vercel AI SDK already in deps) returns a structured
   first-draft recipe. User edits to taste. The autogen
   creates the **option of a frictionless first draft** —
   editing is up to the user.
4. **Sharing.** After saving, "Share" copies a deeplink to the
   recipe (and the cook flow). For user recipes, deeplink
   resolves through the local-recipe adapter on the
   recipient's device when auth lands.
5. **All strictly minimalist.** No new top-level surfaces; the
   work composes into existing /path/recipes, /community/reels,
   and a single new "quick add" page.

## Source tagging — three categories

| Tag                | Source                                                    | Display badge          |
| ------------------ | --------------------------------------------------------- | ---------------------- |
| `user`             | This user authored it via /path/recipes/new               | (no badge — it's mine) |
| `community`        | Authored by another user; awaiting admin approval         | "Community"            |
| `nourish-verified` | Seed catalog OR community recipe approved by Stefan/admin | "Nourish ✓"            |

Schema delta on `userRecipeSchema`:

```ts
source: z.enum(["user", "community", "nourish-verified"]).default("user"),
nourishApprovedAt: z.string().datetime().nullable().optional(),
nourishApprovedBy: z.string().nullable().optional(),
authorDisplayName: z.string().max(40).nullable().optional(),
```

**Seed catalog dishes** are implicitly `nourish-verified`. The user-recipe → cook adapter (W31) flips the tag onto each adapted item so the cook step page can render the badge uniformly across sources.

### Filter UI

Single chip row above `/path/recipes`:

```
[ All ] [ Mine ] [ Community ] [ Nourish ✓ ]
```

Default: `All`. Selection persists in localStorage so the user's preferred filter survives navigation.

The same chip row applies to the W43 templates picker (`Start from a template`). Users hunting for healthy starting points filter to `Nourish ✓`; those hunting for novelty filter to `Community`.

### Admin approval flow (Stefan-only V1)

Admin status is a localStorage flag (`sous-is-admin`) until auth lands. When set, an `Admin` tile appears in `/community` with:

- **Approval queue** — list of `community` recipes awaiting review
- **Recipe preview** — full RecipeForm rendered read-only
- **Verify button** — flips `source` to `nourish-verified`, stamps `nourishApprovedAt` + `nourishApprovedBy`
- **Reject button** — flips `source` to `user` (kept private to the original author) with a reason note

V1 vibecode constraint: state lives on the admin's device. Production needs server-side moderation queue + Postgres + auth. **Founder-unlock-runbook entry filed in W51.**

### Why three tags, not five

Considered:

- `seed` (separate from `nourish-verified`) — rejected because the user doesn't care; the seed catalog is implicitly Sous-curated.
- `friend` (recipes shared by pod members) — rejected because the pod-challenge surface is the right place for that, not the My Recipes list.
- `private` (locked by the user) — rejected because every user recipe is private by default until shared.

Three is the right depth. Filtering is fast, mental model is small.

## Reel-to-cook integration

`/community/reels` already shows reel cards (Stage-3 content magazine surface). Each reel that points to a recipe gets a **"Cook this"** affordance.

### Schema addition on reel content

```ts
ReelItem: {
  // existing fields...
  recipeSlug?: string;  // optional — null for non-recipe reels
}
```

When `recipeSlug` is set:

- A `Cook this` button appears on the reel card
- One tap → `router.push("/cook/<slug>")`
- The cook page resolves via the existing user-recipe-or-seed-catalog dispatcher (W31)

For user-authored or community recipes, the deeplink works once the recipe lives on the recipient's device (mock V1) or the server (Y2). For Nourish-verified recipes, it works immediately via the seed catalog.

### Why this is one-tap not two

A two-tap flow ("View recipe" → "Cook this") would be the conventional choice. Stefan's directive to make it minimalist + frictionless drives the one-tap design: the reel IS the recipe ad; the next tap is the action. No intermediate detail page.

If the user wants to read the recipe details before cooking, the cook page's Mission screen IS the detail page (description, ingredients, time, hero image). No detour needed.

### Failure modes (and mitigations)

- **Recipe doesn't exist anymore** — cook page handles via W31's null-fallback path; user sees the "Cook steps coming soon" empty state.
- **Reel auto-plays then user taps Cook** — fine; the cook page loads independently.
- **Reel has dietary content the user can't eat** — the household-memory filter (W37) doesn't apply to direct-cook navigation, but the Mission screen surfaces the dish's dietary flags so the user can back out.

## Agentic recipe autogen — frictionless first draft

The current `/path/recipes/new` form is good for users who know what they're building. It's frustrating for "I have an idea, just write it down."

### The flow

1. New page: `/path/recipes/quick-add`
2. Single textarea: "Describe the recipe in plain text"
3. Sample prompt:
   ```
   Chana masala. Bloom whole spices in oil — cumin, coriander,
   bay. Sauté red onion until golden. Add ginger-garlic paste,
   then chopped tomatoes. Simmer 10 minutes. Add chickpeas + a
   little water. Simmer 15 more. Finish with garam masala,
   lime, cilantro.
   ```
4. **"Generate first draft"** button → LLM call with structured output schema
5. LLM returns a fully-populated `RecipeDraft` (title, dishName, cuisineFamily, ingredients with parsed quantities, steps with reasonable timer/mistake/cuisineFact defaults)
6. User lands on the existing `/path/recipes/new` form pre-populated with the draft
7. User edits any field, then saves as usual

### LLM contract (Vercel AI SDK)

```ts
const recipeDraftSchema = z.object({
  title: z.string(),
  dishName: z.string(),
  cuisineFamily: z.string(),
  description: z.string(),
  prepTimeMinutes: z.number().int().min(0).max(480),
  cookTimeMinutes: z.number().int().min(0).max(480),
  serves: z.number().int().min(1).max(20),
  flavorProfile: z.array(z.string()).max(10),
  ingredients: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.string(),
        isOptional: z.boolean(),
      }),
    )
    .min(1)
    .max(50),
  steps: z
    .array(
      z.object({
        instruction: z.string().max(3000),
        timerSeconds: z.number().int().nullable(),
        donenessCue: z.string().nullable(),
        mistakeWarning: z.string().nullable(),
      }),
    )
    .min(1)
    .max(50),
});

const result = await generateObject({
  model: anthropic("claude-sonnet-4-5"),
  schema: recipeDraftSchema,
  system: AUTOGEN_SYSTEM_PROMPT,
  prompt: userInput,
});
```

The system prompt is hand-tuned to:

- Always default `cuisineFamily` to one of the 11 known values
- Always estimate prep + cook times conservatively
- Always parse quantities ("2 cans" not "two cans")
- Never invent ingredients not implied by the user's text
- Always populate `donenessCue` for cook-step instructions where it's natural ("until golden", "when fragrant")
- Number steps 1..N

### Vibecode V1 constraint

The LLM call is **founder-gated** for production (Anthropic API key + cost). For vibecode V1:

- Ship the prompt builder (pure helper, testable)
- Ship the response parser (pure helper, testable)
- Ship the `/path/recipes/quick-add` page UI
- The actual LLM call routes through a tRPC procedure `recipe.autogen.draft`
- That procedure has a **stub mode** (returns a hardcoded chana-masala draft) when no API key is configured
- Real LLM call lands when the founder configures `ANTHROPIC_API_KEY`

This matches the existing pattern for AI-gated work (e.g. craving-parser already ships a stub).

### Why "first draft only", not "iterative agent"

A multi-turn agent ("I'd suggest adding X, want me to refine?") is more powerful but introduces:

- Cost variance (LLM calls per recipe)
- Conversation surface (UI complexity)
- Failure-mode surface (mid-conversation timeouts)

The single-turn "describe → draft" loop is the minimum viable: the user has agency to edit afterwards in the existing form. Iterative refinement can be a V2 once usage validates the demand.

### Why the user gets the option, not the requirement

Some users LIKE the form-first authoring. The autogen is **opt-in via the new page** — the existing /path/recipes/new is unchanged. Users who want the form just use it; users who want the shortcut go through quick-add. Both paths converge on the same RecipeForm so editing experience is identical.

## Sharing

After saving a recipe (user or community-promoted), the win-of-authoring screen shows a **Share** button. One tap → copies a deeplink to clipboard:

```
https://sous.app/cook/chana-masala?author=stefan
```

For Nourish-verified recipes, the slug resolves directly via the seed catalog on any device. For user recipes pre-server, the recipient lands on a "this recipe lives on Stefan's device" placeholder — production link works post-Y2-W1 (auth + Postgres). The author param surfaces who shared it.

### Sharing tiers

- **Direct cook link** — `https://sous.app/cook/<slug>` — opens the cook flow.
- **Recipe detail link** — `https://sous.app/recipes/<slug>` — read-only view (Y2; vibecode V1 just opens cook flow).
- **Pod challenge submission link** — `https://sous.app/pod/<id>/week/<week>` — joins the conversation around a specific week's challenge (Y2).

V1 ships only the direct cook link (existing route).

## Build sequence — Sprint K W47-W51

### W47 — Source tagging schema + filter UI

- `userRecipeSchema` adds `source` / `nourishApprovedAt` / `nourishApprovedBy` / `authorDisplayName` fields.
- Pure migrate-stored-recipes helper (defaults `source: "user"` on legacy records).
- Filter chip row component, persisted via a new `useRecipeFilter` hook.
- `/path/recipes` + `templates` row consume the filter.
- User-recipe-adapter and trpc cook router emit `source: "nourish-verified"` for seed dishes.
- Tests: 20+ (schema migration, filter persistence, chip UI states, seed-catalog tagging).

**Acceptance:** filter chip persists across navigation; seed dishes show "Nourish ✓" badge; user authored shows no badge; mock community recipes show "Community".

### W48 — Admin approval flow (mock single-device)

- `useIsAdmin()` hook reads the `sous-is-admin` localStorage flag.
- `/community/admin` page (gated on admin flag).
- Approval queue: lists `community`-tagged recipes with read-only RecipeForm preview + Verify/Reject actions.
- "Verify" stamps `source = nourish-verified` + timestamps. "Reject" reverts to `source = user`.
- Tests: 10+ (admin gate, queue rendering, stamp logic, reject reversion).

**Acceptance:** non-admin users see no admin tile; admin sees the queue; verify-then-back-to-list shows the recipe with Nourish ✓ badge.

### W49 — Reel-to-cook integration

- `ReelItem` schema gains `recipeSlug?: string`.
- `/community/reels` reel card gains a `Cook this` button when `recipeSlug` is set.
- Mock data updated so the existing reels link to seed-catalog recipes.
- Tests: 8+ (button presence/absence by data, navigation target, missing-slug fallback).

**Acceptance:** reels with recipe slugs show the button; tap navigates to `/cook/<slug>`; reels without don't show it.

### W50 — Agentic autogen — substrate + UI

- `src/lib/recipe-authoring/autogen-prompt.ts` — pure prompt builder. Takes user text, returns the system prompt + user prompt + structured-output schema.
- `src/lib/recipe-authoring/autogen-parser.ts` — pure response parser. Validates LLM output against the schema, returns a `RecipeDraft`.
- `src/lib/trpc/routers/recipeAutogen.ts` — `autogen.draft` procedure. Stub mode when no `ANTHROPIC_API_KEY`; real call when configured.
- `/path/recipes/quick-add` page — textarea + "Generate first draft" button + redirect-to-edit on success.
- Tests: 25+ (prompt builder structure, parser validation, schema-error handling, stub-mode determinism).

**Acceptance:** quick-add page renders; stub-mode generates a hardcoded chana-masala first draft; real-mode call is contract-tested with mock fetch; user lands on the editable form pre-populated.

### W51 — Sharing + IDEO Sprint-K close

- "Share" button on the recipe save success toast.
- Clipboard write of the cook deeplink.
- Founder-unlock-runbook updates: `auth + Postgres → community recipes are server-side`, `R2 → photo storage`, `Anthropic API key → autogen production`, `admin role → server-side moderation`.
- Sprint K IDEO close doc.

**Acceptance:** Share button copies the deeplink; toast confirms; runbook entries filed; close doc shipped.

## What we're NOT shipping in Sprint K (deferred)

- Real cross-device sharing (Y2 W1: needs auth + Postgres for the user recipes; Nourish-verified work today via seed catalog)
- Iterative agentic refinement ("can you make this dairy-free?") — V2 once usage validates demand
- Recipe detail page (`/recipes/<slug>`) read-only view — Y2 W2
- Public author profiles (Y2 W3+)
- Recipe ratings / reviews (Y2 W4+)
- Recipe import from URL (Y2 — paste a Bon Appétit URL → autogen creates the draft)

## Open questions for Stefan

1. **Admin role multiplicity** — V1 single-admin (Stefan-only) is documented above; should it be multi-admin from V1 or wait for the auth landing to scale?
2. **Autogen LLM choice** — Anthropic claude-sonnet-4-5 is the default. Cost-vs-quality could justify openai gpt-4o-mini for cost-sensitive paths. Defer until usage data.
3. **Community recipe visibility** — should `community` recipes (un-verified) be findable by anyone, or only the author + admin until verified? Recommended: only author + admin sees pre-verification (avoids low-quality flooding).
4. **Reel recipe-source restriction** — should reels only link to `nourish-verified` recipes, or any recipe? Recommended: any recipe; the source tag handles trust signalling.

## Companion docs

- `docs/COOKING-POD-CHALLENGE.md` — pod challenge V2 (Sprint I W45-W46).
- `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` — 12-month plan with Sprint K (W47-W51) updated.
- `docs/FOUNDER-UNLOCK-RUNBOOK.md` — backend / Anthropic / R2 / auth integration plan for Year-2.
