# Multi-clinician server-shared recipes — technical plan (initial stage)

**Goal.** On the Vercel-deployed site, recipes authored by one testing-phase
clinician must be SAVED TO THE SERVER and VISIBLE to other clinicians — so the
cohort can see each other's recipes. Today it's localStorage-first; each
browser is a sealed island.

## 1. Current state (from the deep appraisal)

The **write half is ~80% real** — don't rebuild it:

- `recipes` tRPC router (`src/lib/trpc/routers/recipes.ts`) does a genuine
  Drizzle `insert…onConflictDoUpdate` into `user_recipes` (`upsert`), an
  owner-scoped `delete` (`remove`), and an owner-scoped `listMine`. Every
  procedure guards `if (!ctx.db || !ctx.userId) return …` and try/catches, so a
  missing DB never 500s.
- The write-through fires: `useRecipeDrafts.upsert` → `persistRecipeUpsert`
  (`src/lib/trpc/vanilla.ts`) → POST `/api/trpc`, carrying `x-sous-device-id`.
- DB connection is **Vercel-aware**: `getDatabaseUrl()`
  (`src/lib/db/connection.ts`) accepts `DATABASE_URL` **or** `POSTGRES_URL` **or**
  `POSTGRES_PRISMA_URL` (the Supabase integration injects `POSTGRES_URL`).
  `prepare:false` is set for the transaction pooler.
- The `user_recipes` table is provisioned
  (`supabase/migrations/20260531000001_init_sous_schema.sql`). RLS is on with
  deny-by-default policies, but the app's `postgres` role has BYPASSRLS, so the
  server writes are unaffected (RLS is **not** a blocker for this path).

**Three stacked blockers (each independently fatal):**

1. **No server READ path is wired anywhere.** `recipes.listMine` is defined but
   called from nowhere (repo-wide grep: one hit, the definition). `/path/recipes`
   reads only localStorage via `useRecipeDrafts`. Clinician B's browser never
   queries Clinician A's rows. **This is the dominant blocker.**
2. **Per-browser random identity.** With Clerk bypassed, `ctx.userId` =
   `x-sous-device-id`, which is a random `crypto.randomUUID()` per browser
   (`use-device-id.ts`). So each clinician writes under a different random
   `owner_id`, and `listMine`'s owner filter could never reunite them.
3. **No cross-owner / community list + localStorage-only moderation.**
   `listMine` is hard-filtered to the owner; the admin-approval flow
   (`admin-approval.ts`) is pure functions over the admin's own localStorage.

**Plus — schema drift:** `sourceTags`/`source_tags` exists in the Drizzle mirror
(`y2-tables.ts`) and the Zod schema but NOT in the provisioned SQL table, and
`recipes.upsert` doesn't write it. Harmless today (insert omits it) but a latent
sync bug.

## 2. Key insight for the initial stage

For the **visibility** requirement (see each other's recipes), the identity
fragmentation is NOT a blocker — a **cross-owner read that returns all cohort
recipes** works regardless of which random owner wrote each row. Identity is only
needed for **attribution** ("who made this"), which `authorDisplayName` (a name
the clinician types) already covers, and for **"delete mine"**, which the
owner-scoped `remove` already handles. So we do NOT need real Clerk auth for the
initial stage — we sidestep it with a trusted-cohort read + a typed author name.

## 3. The plan — staged, AUTO-BUILD first (rule 12)

### Stage 0 — AUTO-BUILD now (no founder creds needed; ships dormant)

| #   | Change                                                                                                                                                                            | File                                             | Status                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------- |
| 0a  | `source_tags` migration (fix the drift)                                                                                                                                           | `supabase/migrations/<ts>_add_source_tags.sql`   | **shipped this PR**               |
| 0b  | Write `sourceTags` in `recipes.upsert`                                                                                                                                            | `src/lib/trpc/routers/recipes.ts`                | **shipped this PR**               |
| 0c  | `recipes.listVisible` — cross-owner read (all cohort recipes), timestamps normalized to ISO so they match `userRecipeSchema`                                                      | `src/lib/trpc/routers/recipes.ts`                | **shipped this PR**               |
| 0d  | `useServerRecipes` hook — TanStack Query → `listVisible` + `health`; pure `mergeRecipeLists` (server wins on id; local-only kept; sorted). Dormant when DB absent.                | `src/lib/recipe-authoring/use-server-recipes.ts` | **✅ shipped + 4 tests**          |
| 0e  | Merge server recipes into `/path/recipes` so the "Community" filter shows peers' published recipes; offline health pill (R1) when published-but-no-DB.                            | `src/app/(path)/path/recipes/page.tsx`           | **✅ shipped**                    |
| 0g  | Real **"Publish to community"** action (was the mislabeled "Submit for Nourish verification") — sets `source="community"`, fires the write-through; copy fixed.                   | `…/recipes/[id]/edit/page.tsx`                   | **✅ shipped**                    |
| 0h  | **Privacy fix**: `listVisible` now returns ONLY `source ∈ {community, nourish-verified}` (never private `user` drafts), and drops the `ownerId`/device-id leak.                   | `src/lib/trpc/routers/recipes.ts`                | **✅ shipped**                    |
| 0f  | Capture the clinician's name once (`authorDisplayName`) and stamp it on every authored/imported recipe (today falls back to "A community cook").                                  | import sheet + `recipe-form`                     | NEXT (nice-to-have)               |
| 0A7 | A "From the community" section on the Content tab reading `listVisible` (the higher-fidelity "see it in Community"; `/path/recipes` Community filter already satisfies the core). | `src/app/(community)/community/page.tsx`         | NEXT (ties to community redesign) |

> **Status (2026-06-18):** the full **add → publish → (Community filter) see it**
> loop is wired + locally verified (publish flips source; the recipe shows under
> the Community filter; the offline pill flags that peer-sync needs the server).
>
> **Update (2026-06-18, founder connected Supabase):** cross-clinician sharing
> was STILL broken despite `POSTGRES_URL` being set — and silently. Root cause:
> the `source_tags` migration (Stage 1 below) was **never applied to the live
> DB**, so every `recipes.upsert` threw `42703: column "source_tags" does not
exist`, the three-layer error-swallow (router catch → fire-and-forget
> write-through → UI ignores `persisted`) hid it, and the live `user_recipes`
> table sat at **0 rows** while the UI said "published." Verified against the live
> Supabase project (`bkkjtmvyayieyeeshbim`). **Fixed:** applied
> `alter table public.user_recipes add column if not exists source_tags jsonb;`
> (the repo migration `20260617000001`) to the live DB, proved an insert+read
> round-trip, and **hardened the router so a configured-but-broken DB now throws
> loudly (→ reportError) instead of swallowing** — this class of drift will never
> be silent again. Cross-clinician sharing is now LIVE.

### Stage 1 — FOUNDER-GATED (one config edit, then 0a–0f light up)

- Wire the **Vercel ↔ Supabase (or Neon) integration** so `POSTGRES_URL` is set
  in the Vercel project env. With it present, `getDbSafe()` returns a live DB and
  every `recipes.*` procedure transacts. Without it, everything above is a safe
  no-op (writes vanish silently — see Risk R1). **This is the only blocker
  between "code complete" and "clinicians see each other's recipes."**
- Apply the `source_tags` migration to the live DB (`supabase db push` /
  Drizzle).

### Stage 2 — later (production hardening, founder-gated)

- Real auth (un-bypass Clerk) for durable per-clinician identity → replace the
  trusted-cohort read with `source`-gated visibility (only `community` /
  `nourish-verified` recipes are public) + server-side moderation (read the
  pending queue across owners, write approval stamps server-side).
- A public read endpoint `/api/recipes/<id>` honoring source tags (runbook item).

## 4. Stage-0d/0e/0f code spec (the read path)

```ts
// use-server-recipes.ts (sketch)
export function useServerRecipes() {
  // trpc.recipes.listVisible.useQuery() — returns cohort rows (or [] with no DB)
  // returns { serverRecipes: UserRecipe[], isLoading }
}

// In /path/recipes:
const { drafts } = useRecipeDrafts(); // local (mine, optimistic)
const { serverRecipes } = useServerRecipes(); // cohort (everyone's, server)
// merge: a Map by id; server row overrides a local copy of the same id;
// local-only ids (not yet synced) are kept; sort by updatedAt desc.
```

`authorDisplayName` capture: a one-time "What name should clinicians see?"
prompt (localStorage `sous-author-name`), stamped onto `draft.authorDisplayName`
at commit/import. Existing free-text field; no schema change.

## 5. Risks

- **R1 — silent local-only fallback (highest).** If `POSTGRES_URL` isn't set on
  Vercel, `getDbSafe()` → null, every procedure early-returns `{persisted:false}`,
  and the client `.catch(()=>{})` swallows it. The app looks fine while
  persisting nothing. **Mitigation:** add a dev/health surface — e.g. a
  `recipes.health` procedure returning `{ dbConnected: boolean }` and a small
  "server: connected/offline" indicator on `/path/recipes` during the testing
  phase, so a misconfigured deploy is obvious, not silent.
- **R2 — timestamp shape.** `db.select()` returns `Date` objects;
  `userRecipeSchema` wants ISO strings. `listVisible` must map them (done in 0c).
- **R3 — no privacy in the cohort read.** `listVisible` returns ALL recipes
  (acceptable for a closed trusted testing cohort; Stage 2 gates on `source`).
- **R4 — serverless cold start.** `postgres-js` pooled conn per cold lambda;
  `prepare:false` is correct for the Supabase pooler. Not a correctness blocker.

## 6. Verification (once Stage 1 lands)

1. Two browsers (= two clinicians, two device-ids). Clinician A imports a recipe.
2. `recipes.health` shows connected on both.
3. Clinician B's `/path/recipes` shows A's recipe with A's `authorDisplayName`.
4. B cooks A's recipe through the Quest shell. A deletes theirs; it disappears
   from B after refetch.

**Bottom line:** the write stack is real; the missing piece is the READ path +
trusted-cohort visibility + author attribution — all AUTO-BUILD. The only
founder-gated step is setting `POSTGRES_URL` on Vercel.
