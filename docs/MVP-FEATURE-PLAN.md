# Sous — MVP Feature Plan (Supabase-backed, security & AI last)

> **Authored:** 2026-05-31 · **Companion to** `docs/PRODUCTION-READINESS-PLAN.md`
> (infra view) and `docs/SUPABASE-SETUP.md` (live backend).
>
> This plan sequences the **user-facing key features** onto the live
> Supabase backend, **MVP-first by core functionality** — progress,
> saved items, custom recipes — and **defers auth, security hardening,
> and AI to the final stages**, exactly as directed. The goal of every
> stage before Stage I is: _the feature works for a real user on a real
> device, persisted to Supabase, cross-session_ — without yet standing up
> login or production-grade security.

---

## 0. Principles (what makes this the MVP path)

1. **The backend already exists.** All 22 tables are live, seeded, and
   indexed (`docs/SUPABASE-SETUP.md`). Almost every stage below is
   🟢 AUTO-BUILD: wire an existing localStorage hook to its waiting table.
2. **Identity without login (MVP).** Per-user features need an owner, but
   login is deferred. Stage A introduces a **device-scoped anonymous id**
   (a localStorage UUID sent to the server) used as `user_id`. Real
   accounts (Supabase Auth) arrive in **Stage I** and _upgrade_ the
   device user in place. → no login friction during the MVP, no data loss
   at account time.
3. **Write-through, offline-first.** Every hook keeps `localStorage` as the
   optimistic cache and writes through to Supabase via tRPC; reads hydrate
   from Supabase on mount and fall back to local when offline. This is the
   contract already modeled in `src/lib/db/source-selector.ts`. The kitchen
   never sees a spinner or a 500 because the network blipped.
4. **Security is a named, deferred debt — not an omission.** During MVP the
   server trusts the device id and writes via the RLS-bypassing service
   role. That means the tRPC endpoints are the trust boundary, not the DB.
   **Stage I** closes this with Supabase Auth + per-user RLS
   (`auth.uid()::text = user_id`). This is an explicit, bounded trade.
5. **AI is the last layer.** Every indicative/AI surface stays on its mock
   provider until **Stage J**, when tokens + cost guardrails are wired.

**Legend:** 🟢 AUTO-BUILD · 🔴 FOUNDER-GATED.

---

## Stage 0 — Live connection ✅ DONE (2026-05-31)

The deployed app now actually talks to Supabase.

- **Fixed the env-var mismatch** (`src/lib/db/connection.ts`): the app read
  only `DATABASE_URL`, but the Vercel↔Supabase integration injects
  `POSTGRES_URL` / `POSTGRES_PRISMA_URL`. All four read sites
  (`db/index.ts`, `trpc/server.ts`, `routers/cook.ts`, `source-selector.ts`,
  `seed/run-seed.ts`) now accept either — so the integration "just works"
  with no manual env edit.
- **Added `GET /api/health`** — reports `{ mode: "supabase" | "local",
db, sideDishes, meals }` so the live wiring is verifiable in one curl.

**Verify after redeploy:**

```bash
curl -s https://<your-vercel-app>/api/health
# expect: {"mode":"supabase","db":"ok","sideDishes":205,"meals":76}
# "mode":"local" ⇒ connection string still not visible to the app
```

> Diagnostic that motivated this: Postgres logs showed only
> dashboard/management/PostgREST connections — **zero app connections** —
> and every user table was empty, confirming the app was running static.

---

## Stage A — Device identity (foundation) 🟢

**Goal:** every device has a stable owner id, so per-user data has a home —
no login.

### Tasks

- `useDeviceId()` hook — `crypto.randomUUID()` persisted in localStorage
  (reuse the pattern already in `src/lib/hooks/use-cook-store.ts`).
- Send it on every tRPC call (header `x-sous-device-id`); in
  `createTRPCContext` set `ctx.userId = deviceId` whenever
  `SOUS_AUTH_ENABLED !== "true"` (replaces the single shared
  `MOCK_USER_ID`, so devices no longer collide).
- `user.ensure` mutation — upsert the `users` row on first write (already
  done inside `cookSession.complete`; extract to a shared helper).

### Acceptance

- Two browsers get two distinct `users` rows; data never bleeds across
  devices.
- `GET /api/health` unaffected; existing flows unchanged.

---

## Stage B — Progress / journey (the core loop) 🟢

**Goal:** completed cooks, streaks, and the journey scrapbook persist to
Supabase — the heart of the product and the start of the data moat
(`STRATEGY.md` §2.1).

### What's ready

- Table `cook_sessions`; tRPC `cookSession.complete` + `cookSession.history`
  (already built); hook `use-cook-sessions.ts` (currently localStorage).

### Tasks

- Wire the **Win screen** completion → `cookSession.complete` (the mutation
  exists; nothing calls it yet). Persist `status`, `rating`, `personalNote`,
  optional photo (Stage H), `mainDishInput`.
- Make `use-cook-sessions.ts` write-through: optimistic local update +
  server persist; hydrate history from `cookSession.history` on mount.
- Persist derived progress on `users`: `completed_cooks` (already bumped),
  `current_streak`, `longest_streak`; streak/“rest-day” logic
  (`use-streak-freeze.ts`) reads/writes server-side.
- Server-back the journey surfaces that read sessions: `/path/scrapbook`,
  `/path/recap`, "you made this before" (`dish-recall-line.tsx`),
  cook-rhythm line, ingredient-reuse hint.

### Acceptance

- Complete a cook → `cook_sessions` row; reload + second device → it’s in
  the scrapbook and history; streak increments; `completed_cooks` matches
  count.

---

## Stage C — Saved items 🟢

**Goal:** saved side dishes **and** Content-tab bookmarks persist and sync.

### What's ready

- Table `saved_recipes` (sides); hooks `use-saved-dishes.ts` +
  `use-content-bookmarks.ts` (both localStorage).

### Tasks

- 🟢 Migration: add `content_bookmarks` table (`user_id`, `kind`
  ∈ article/reel/research/expert/forum, `item_id`, `saved_at`,
  unique `(user_id, kind, item_id)`) — the bookmark surface is polymorphic,
  so it needs its own table alongside `saved_recipes`.
- tRPC `saved.toggleDish` / `saved.listDishes` → `saved_recipes`;
  `saved.toggleBookmark` / `saved.listBookmarks` → `content_bookmarks`.
- Make both hooks write-through; the **Saved page** (`/community/saved`,
  `/path/favorites`) reads from Supabase.

### Acceptance

- Save a side + bookmark an article → rows in the two tables; the Saved
  page shows both on a second device; un-saving removes them.

---

## Stage D — Custom recipes 🟢

**Goal:** user-authored recipes persist, sync, and **cook through the same
Mission→Grab→Cook→Win quest shell** as seed recipes (CLAUDE.md rule 4).

### What's ready

- Table `user_recipes` (full recipe + `source` ∈ user/community/nourish-
  verified + steps/ingredients as JSONB); builder routes
  `/path/recipes/new`, `/path/recipes/quick-add`, `/path/recipes/[id]/edit`.

### Tasks

- tRPC `recipes.create / update / get / listMine` → `user_recipes` (Zod
  via the existing `userRecipeSchema`); write-through from the builder.
- **Cook path resolves user recipes:** extend `cook.getSteps` (and the
  combined-cook path) to look up `user_recipes` by id when the slug isn’t
  in the seed catalog, adapting its JSONB steps/ingredients to the same
  `StaticDishData` shape the quest shell renders.
- Recipe list (`/path/recipes`) + detail read from Supabase; `source` tag
  drives the filter chip; cross-device share resolves a `nourish-verified`
  recipe by id (the deep-link gap noted in `FOUNDER-UNLOCK-RUNBOOK.md` §13).

### Acceptance

- Author a recipe in the builder → `user_recipes` row; open it on another
  device; cook it end-to-end through the quest shell; edit persists.

---

## Stage E — Preferences & personalization 🟢

**Goal:** the engine’s per-user signal lives server-side, so recommendations
sharpen across devices.

### Tasks (each = wire an existing hook to its table)

- `users.preference_vector` + `quiz_responses` (coach quiz) write-through;
  the pairing engine reads the server vector.
- Household taste blend (single knob) → preference dampening, persisted.
- Parent Mode → `parent_profile` (`use-parent-mode.ts`); kids-ate-it →
  `kids_ate_it_log` (`use-kids-ate-it.ts`); exposure log
  (`use-exposure-log.ts`); recipe overlays → `recipe_overlay`
  (`use-recipe-overlays.ts`).

### Acceptance

- Take the coach quiz on device 1 → recommendations reflect it on device 2;
  Parent Mode age-band/spice settings sync.

---

## Stage F — Planning & rhythm 🟢

**Goal:** the weekly planner and the nudge queue become server-of-record.

### Tasks

- Weekly meal plan → `meal_plan_slots` (`use-meal-plan-week.ts`)
  write-through; `/path/plan` + `/path/plan/week` read from Supabase.
- `recipe_score_breakdowns` populated on each pick (feeds the future V3
  trainer; `FOUNDER-UNLOCK-RUNBOOK.md` §15) — accumulate now, evaluate later.
- `notifications` queue persisted (in-app delivery only for MVP; web push
  is Stage I/§5 of the production plan).

### Acceptance

- Plan a week on device 1 → it’s on device 2; picks write score-breakdown
  rows.

---

## Stage G — Social: cooking pods 🟢

**Goal:** the network-effect surface goes multi-device-real (live realtime
can follow in hardening).

### Tasks

- `pods, pod_members, pod_challenge_weeks, pod_submissions` write-through;
  invite-code join against Postgres; cross-pod leaderboard query
  (server-computed). Replaces the localStorage pod store.
- Friends strip on Today reads real connected-user cooks (visibility-gated).
- _(Realtime live reveal/leaderboard → Production plan Stage 4; MVP uses
  on-load refresh.)_

### Acceptance

- Two devices join a pod by code, both submit, both see the same roster +
  leaderboard on refresh.

---

## Stage H — Media (Supabase Storage) 🟢

**Goal:** real images + user cook photos.

### Tasks

- Buckets: `content-images` (public; migrate `public/food_images/*`),
  `cook-photos` (owner-scoped), `pod-photos` (pod-scoped). Flip
  `src/lib/image/image-src.ts` to Supabase Storage URLs (one helper edit;
  all `<Image>` already route through it).
- Win-screen + pod-submission photo upload (client resize → signed upload).

### Acceptance

- Content images load from Supabase Storage; a Win photo persists + reloads
  cross-device.

---

## Stage I — Accounts, security & hardening 🔴/🟢 (deferred to here on purpose)

**Goal:** turn the MVP into something safe to open to the public. _This is
where “security and everything else needed for the MVP stage” lives — the
very end, as directed._

### Tasks

- 🔴 **Supabase Auth** (email magic-link + Google/Apple). Anonymous device
  user **upgrades** to a real account in place (link `auth.uid()` → existing
  `users.id`), preserving all journey/saved/recipe data.
- 🟢 **Per-user RLS** — replace deny-by-default with owner policies:
  `using (auth.uid()::text = user_id) with check (...)` on every user-data
  table (+ the new `content_bookmarks`). The tRPC layer stops being the sole
  trust boundary.
- 🟢 **Rate limiting** (Postgres token-bucket; Upstash optional), input
  validation audit, CSP enforce, secret hygiene (service role server-only).
- 🔴 **Observability** — Sentry DSN + Vercel Analytics (stubs ready).
- 🟢 **Resilience** — Supabase PITR/backups posture, restore runbook,
  uptime + error alerts; advisors (security + performance) clean under
  real data; a11y + PWA + E2E (Playwright) + load test.

> Full detail per credential: `docs/PRODUCTION-READINESS-PLAN.md` Stages
> 1–8 + `docs/FOUNDER-UNLOCK-RUNBOOK.md`.

### Acceptance

- A signed-in user’s anon data carries over; a second user cannot read/write
  their rows (RLS proven); advisors clean; error → Sentry; abuse → 429.

---

## Stage J — AI integration (FINAL) 🔴 tokens, then 🟢 wiring

**Goal:** the indicative surfaces go real — _last, once tokens + cost
controls are in place._ Nothing here runs until the keys land.

### Tasks

- 🔴 `ANTHROPIC_API_KEY` (craving parse, coach, recipe autogen, voice,
  viral search) · `OPENAI_API_KEY` (food-photo Vision) · `SOUS_SEARCH_API_KEY`.
- 🟢 Provider factories already flip mock→real on key presence
  (`src/lib/ai/provider.ts`). Route all calls through a Supabase **Edge
  Function proxy** (keys off-client) logging spend to `llm_call_entries`
  with per-user + global **budget caps that fall back to mock on cap-hit**
  (the app still cooks). Two-step Vision (recognize → correction chip).
- 🟢 Per-feature staged flag rollout (`SOUS_VOICE_LLM_ENABLED`,
  `SOUS_POD_AGENTIC_ENABLED`, autogen/viral real-mode); V3-trainer re-eval
  on accumulated `recipe_score_breakdowns`.

### Acceptance

- A real craving parse returns Zod-valid structure; spend logged + visible
  on `/path/llm-spend`; cap-hit → silent mock fallback; no key in any
  client bundle.

---

## Appendix — Feature → table → hook → endpoint map

| Stage | Feature           | Table(s)                                                                                           | Hook                                                                            | New tRPC              |
| ----- | ----------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------- |
| A     | Device identity   | `users`                                                                                            | `useDeviceId` (new)                                                             | `user.ensure`         |
| B     | Progress/journey  | `cook_sessions`                                                                                    | `use-cook-sessions`                                                             | `cookSession.*` ✅    |
| C     | Saved items       | `saved_recipes`, `content_bookmarks` (new)                                                         | `use-saved-dishes`, `use-content-bookmarks`                                     | `saved.*`             |
| D     | Custom recipes    | `user_recipes`                                                                                     | builder routes                                                                  | `recipes.*`           |
| E     | Preferences       | `users.preference_vector`, `quiz_responses`, `parent_profile`, `kids_ate_it_log`, `recipe_overlay` | `use-parent-mode`, `use-kids-ate-it`, `use-exposure-log`, `use-recipe-overlays` | `prefs.*`, `parent.*` |
| F     | Planning/rhythm   | `meal_plan_slots`, `recipe_score_breakdowns`, `notifications`                                      | `use-meal-plan-week`                                                            | `plan.*`              |
| G     | Pods              | `pods`, `pod_members`, `pod_challenge_weeks`, `pod_submissions`                                    | pod store                                                                       | `pod.*`               |
| H     | Media             | Storage buckets                                                                                    | `image-src`                                                                     | upload helpers        |
| I     | Accounts/security | Auth + RLS on all                                                                                  | auth provider                                                                   | `protectedProcedure`  |
| J     | AI                | `llm_call_entries`                                                                                 | AI provider factory                                                             | Edge proxy            |

### Sequencing

**A → B → C → D** is the MVP spine (device id → progress → saved → custom
recipes) and is **all 🟢 AUTO-BUILD on the existing backend** — buildable
now, no founder credential. E–H deepen core functionality. **I (security)
and J (AI) are intentionally last.** Each stage ships behind the
`DATABASE_URL`-presence gate / a `SOUS_*` flag, so any stage is
dark-launchable and reversible.

_Recommended first execution slice: Stage A + B (device id + the progress
write path wired into the Win screen) — that turns the empty user tables
into a live, compounding journey log._
