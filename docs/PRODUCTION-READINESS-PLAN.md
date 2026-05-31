# Sous — Production-Readiness Plan (Supabase-native, AI-last)

> **Authored:** 2026-05-31 · **Owner:** founder (Stefan) + autonomous agent
> **Supersedes** the Neon assumption in `docs/FOUNDER-UNLOCK-RUNBOOK.md`
> (W14): Sous now runs on a dedicated **Supabase** project — see
> `docs/SUPABASE-SETUP.md`. This plan takes the app from "lean prototype
> on localStorage + mock AI" to **production-ready for real users**, with
> Supabase's full platform (Postgres, Auth, Storage, Realtime, Edge
> Functions, pg_cron) carrying the backend.
>
> **Guiding principle (per the brief):** ship every _deterministic, live_
> capability first; add the _indicative / AI-integrated_ surfaces **last**,
> in a single final stage, only once the AI tokens + connectors are wired.
> The app must be fully usable — sign up, cook, save, share, get nudged —
> before a single LLM call goes real.

---

## 0. How to read this plan

Every deliverable is tagged per **CLAUDE.md rule 12**:

- 🟢 **AUTO-BUILD** — everything needed is in this repo + npm + Supabase
  MCP. The agent can ship it with no external account.
- 🔴 **FOUNDER-GATED** — needs an external account, a paid connector, a
  credential, real users, or human/legal sign-off. The agent ships the
  stub + env-var contract; the founder supplies the key; integration is
  one config edit.

Stages are sequenced so **AUTO-BUILD leads** and each founder-gated unlock
is surfaced up front (below) so it can be procured in parallel rather than
discovered mid-stage. **No stage depends on AI except the last.**

### 0.1 Founder-gated credential checklist (procure in this order)

| #      | Credential / account                                          | Unlocks                                     | Stage | Founder effort      | Cost      |
| ------ | ------------------------------------------------------------- | ------------------------------------------- | ----- | ------------------- | --------- |
| 1      | **Supabase DB password** (already have the project)           | DB go-live                                  | 1     | 2 min (paste)       | $0        |
| 2      | **Vercel project** + env vars                                 | Hosting                                     | 1     | 30 min              | $0–20/mo  |
| 3      | **Supabase Auth providers** (Google + Apple OAuth client IDs) | Real sign-in                                | 2     | 1–2 h               | $0        |
| 4      | _(optional)_ custom domain                                    | Branding, email                             | 2/8   | 1 h                 | ~$12/yr   |
| 5      | **Resend / SMTP** (or Supabase default email)                 | Auth + nudge email                          | 2/5   | 30 min              | $0–20/mo  |
| 6      | **VAPID key pair** (`web-push generate-vapid-keys`)           | Web push                                    | 5     | 5 min               | $0        |
| 7      | **Stripe Connect** account + curated 501(c)(3) list + KYC     | Charity tooling                             | 6     | 1–2 wk              | rev-share |
| 8      | **Sentry DSN**                                                | Error visibility                            | 7     | 15 min              | $0        |
| 9      | _(optional)_ **Upstash Redis**                                | Distributed rate-limit                      | 7     | 15 min              | $0        |
| 10     | Beta cohort (10 → 50 households)                              | Real feedback                               | 8     | 2–3 wk              | $0        |
| 11     | Food-advertising counsel sign-off                             | Claim-safety CI gate                        | 8     | $5–15k              | legal     |
| 12     | Stanford permission expansion (optional)                      | Content volume                              | 8     | Stanford turnaround | $0        |
| **13** | **`ANTHROPIC_API_KEY`**                                       | Craving parse, coach, autogen, voice, viral | **9** | 10 min              | usage     |
| **14** | **`OPENAI_API_KEY`**                                          | Food-photo recognition (Vision)             | **9** | 10 min              | usage     |
| **15** | **`SOUS_SEARCH_API_KEY`** (Tavily/Brave)                      | Viral-recipe web search                     | **9** | 15 min              | usage     |

> Items **1–2** unblock everything; **13–15** are intentionally last.

### 0.2 Platform decision — lean into Supabase

The repo already ships pre-built stubs for **Clerk** (auth), **Cloudflare
R2** (images), and **Upstash** (rate-limit). This plan **recommends
Supabase-native equivalents** instead, to consolidate on one platform,
cut the founder's account-sprawl, and get RLS-integrated auth + storage
for free:

| Concern       | Pre-built stub | **Recommended (this plan)**                  | Why                                                                                                                               |
| ------------- | -------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Auth          | Clerk          | **Supabase Auth (GoTrue)**                   | Native `auth.uid()` in RLS; one less vendor; the `users.id` column is `text` and accepts `auth.uid()::text` with no schema change |
| Image/media   | Cloudflare R2  | **Supabase Storage**                         | Part of the project already; RLS-scoped buckets; signed URLs                                                                      |
| Realtime      | —              | **Supabase Realtime**                        | Pods/leaderboard/reveal live updates                                                                                              |
| Jobs/webhooks | —              | **Edge Functions + pg_cron + pg_net**        | Stripe webhook, push delivery, streak/rotation cron                                                                               |
| Rate-limit    | Upstash        | **Postgres token-bucket** (Upstash optional) | One platform; Upstash remains a drop-in if scale demands                                                                          |

Each Supabase-native choice has the Clerk/R2/Upstash stub as a **documented
fallback** (`FOUNDER-UNLOCK-RUNBOOK.md`) if a future need (e.g. enterprise
SSO) argues for it. **Decision is reversible per surface.**

---

## Stage 0 — Foundation ✅ DONE (2026-05-31)

Shipped and verified (`docs/SUPABASE-SETUP.md`, commit `018b7f8`):

- Dedicated Supabase project (`bkkjtmvyayieyeeshbim`, us-east-1).
- 22 tables via `supabase/migrations/`; RLS on every table (content
  public-read, user-data deny-by-default); FK covering indexes.
- Seeded 205 sides / 76 meals / 445 cook steps / 964 ingredients.
- Drizzle on `postgres-js` (pooler-safe); `cook.getSteps` reads,
  `cookSession.complete/history` writes; graceful local fallback.
- Security + performance advisors clean; build + 3030 tests green.

**Remaining to "live":** Stage 1.

---

## Stage 1 — Go-live & deploy 🟢 mostly AUTO-BUILD

**Goal:** the seeded Supabase DB serves a deployed app to the public URL;
cooks persist server-side. No auth yet (mock user), no AI.

### Tasks

- 🔴 Paste `DATABASE_URL` (transaction-pooler string + DB password) into
  `.env.local` and Vercel env. _(checklist #1)_
- 🔴 Create the Vercel project, import the repo, set env (`DATABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_APP_URL`). _(checklist #2)_
- 🟢 Add a `src/lib/supabase/{server,client}.ts` factory (`@supabase/ssr`)
  wired to the env — the shared entry point for Auth/Storage/Realtime in
  later stages.
- 🟢 Add `/api/health` route that checks DB connectivity (`select 1`) and
  returns seeded row counts — a deploy smoke probe.
- 🟢 Configure Supabase **connection pooling** (Supavisor transaction mode,
  `prepare:false` already set) and confirm Vercel region ≈ `iad1`
  (us-east-1) for low DB latency.
- 🟢 Production build hardening: `next.config` headers (HSTS, CSP report-
  only, `X-Frame-Options`), `robots.txt`, `sitemap`, error/loading
  boundaries audited.

### Acceptance

- `GET /api/health` returns `{ db: "ok", sideDishes: 205, meals: 76 }`
  from the deployed URL.
- Completing a cook in prod inserts a `cook_sessions` row (verify via MCP
  `execute_sql` or Studio).
- Lighthouse PWA/perf baseline captured.

### Verify

```bash
curl -s https://<vercel-app>/api/health
pnpm build   # must pass before deploy
```

---

## Stage 2 — Identity & per-user data (Supabase Auth) 🟢/🔴

**Goal:** real accounts, cross-device sync, and per-user RLS. Replaces the
`mock-user-dev` path. **The data moat (`STRATEGY.md` §2.1) starts
compounding here** — every cook now attaches to a durable identity.

### Tasks

- 🔴 Enable Supabase Auth providers: email (magic-link or password) +
  Google + Apple OAuth (client IDs). _(checklist #3, #5)_
- 🟢 Replace the mock auth path:
  - `src/components/auth-provider.tsx` → Supabase session provider
    (`@supabase/ssr`), keeping the existing `isAuthEnabled()` flag so dev
    can still run mock-less-key.
  - `src/middleware.ts` → Supabase session refresh middleware.
  - `src/lib/auth/auth-flag.ts` + `trpc/server.ts` → derive `ctx.userId`
    from the Supabase session (`auth.uid()`), falling back to
    `MOCK_USER_ID` only when `SOUS_AUTH_ENABLED !== "true"`.
- 🟢 **RLS migration → per-user policies.** Today user-data tables are
  deny-by-default (server bypasses). Add owner policies so the anon/auth
  client can self-serve safely, e.g.:
  ```sql
  create policy "own rows" on public.cook_sessions
    for all to authenticated
    using (auth.uid()::text = user_id)
    with check (auth.uid()::text = user_id);
  ```
  Apply to `cook_sessions, saved_recipes, quiz_responses, parent_profile,
recipe_overlay, kids_ate_it_log, user_recipes, meal_plan_slots,
notifications, recipe_score_breakdowns`. (`users.id` stays `text`,
  populated with `auth.uid()::text` — no PK change.)
- 🟢 Sign-up/sign-in screens + account sheet (extends the existing owl
  Profile & Settings sheet — rule 3's permitted surface). Anonymous→named
  upgrade: migrate localStorage journey into the new user row on first
  sign-in.
- 🟢 Wire the remaining user-data **write-through hooks** to Supabase
  (cook-session already done): `useSavedRecipes`, `useQuizResponses`,
  preference vector + streak counters on `users`, `useParentMode` →
  `parent_profile`, `useKidsAteIt` → `kids_ate_it_log`, `useRecipeOverlays`
  → `recipe_overlay`. Each keeps localStorage as the offline write-through
  cache (`db/source-selector.ts` contract).
- 🟢 Auth-aware tRPC: convert per-user mutations from `publicProcedure` to
  `protectedProcedure`.

### Acceptance

- New user signs up (email + Google), lands on Today, completes a cook;
  the row is owned by their `auth.uid()` and visible cross-device.
- RLS proven: with a second user's anon JWT, `select * from cook_sessions`
  returns only their own rows (MCP test with temp JWT, then revert).
- Security advisor: 0 errors; no `rls_enabled_no_policy` on user tables.

### Verify

```bash
pnpm test src/lib/auth src/lib/hooks   # write-through + flag tests
# MCP: get_advisors(security) → clean
```

---

## Stage 3 — Media & Storage (Supabase Storage) 🟢

**Goal:** real images served from Supabase; users can attach cook photos.

### Tasks

- 🟢 Create buckets via migration: `content-images` (public, the
  `food_images/*` catalog), `cook-photos` (RLS: owner read/write),
  `pod-photos` (RLS: pod-member read, owner write).
- 🟢 Upload `public/food_images/*` to `content-images` (script:
  `scripts/storage/upload-content-images.ts` using the service role at
  deploy time, or the Storage API).
- 🟢 Flip `src/lib/image/image-src.ts` to resolve Supabase Storage public
  URLs when `NEXT_PUBLIC_SUPABASE_URL` is set (it already abstracts the
  base URL — one helper edit; all `<Image>` already route through it).
- 🟢 "Win" screen photo upload → `cook-photos` + `cook_sessions.completion_photo_url`;
  pod submission photo → `pod-photos`. Signed-URL reads; client-side
  resize/compress before upload.
- 🟢 Storage RLS policies + a Supabase **image transformation** preset for
  thumbnails (avoids shipping full-res to the feed).

### Acceptance

- Content images load from `…supabase.co/storage/v1/object/public/content-images/…`
  (network tab).
- A signed-in user uploads a Win photo; it persists and reloads
  cross-device; a different user cannot fetch its object.

> **R2 remains the documented fallback** (`FOUNDER-UNLOCK-RUNBOOK.md` §2)
> if egress cost ever favors Cloudflare — `image-src.ts` already supports
> the `R2_BASE_URL` flip.

---

## Stage 4 — Real-time social (Supabase Realtime) 🟢

**Goal:** the network-effect surfaces (`STRATEGY.md` §1.2) go live and
update in real time — pods, leaderboard, friends strip.

### Tasks

- 🟢 Move pods off localStorage onto the live tables (`pods, pod_members,
pod_challenge_weeks, pod_submissions`) with write-through; invite-code
  join flow against Postgres.
- 🟢 **Realtime subscriptions:**
  - Pod **reveal** at the configured hour → Postgres Changes on
    `pod_submissions` broadcast to members.
  - **Cross-pod leaderboard** → Realtime Broadcast channel, recomputed on
    submission insert (server-side, RLS-safe).
  - **Presence** for "who's cooking now" on the Today friends strip.
- 🟢 Friends social meals (Today, below the fold) backed by real
  `cook_sessions` of connected users (privacy-gated by RLS + an explicit
  follow/visibility model).
- 🟢 Enable Realtime only on the needed tables (publication scoping) to
  bound fan-out.

### Acceptance

- Two browsers in the same pod: user A submits → user B sees the reveal +
  leaderboard update within ~1s, no refresh.
- Realtime authorization verified: a non-member receives no pod events.

---

## Stage 5 — Background jobs & notifications (Edge Functions + pg_cron + Web Push) 🟢/🔴

**Goal:** the habit loop runs itself — scheduled nudges, streak upkeep,
weekly pod rotation — and reaches users via web push.

### Tasks

- 🔴 Generate **VAPID** key pair; set `VAPID_PUBLIC_KEY`,
  `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, subject email.
  _(checklist #6)_
- 🟢 **Edge Functions** (Deno):
  - `notify-dispatch` — drains `notifications` where `scheduled_for <= now()`
    and `status = 'pending'`, sends web push, marks delivered.
  - `pod-rotate` — weekly challenge rotation + reveal trigger.
  - `streak-maintenance` — nightly streak decrement/reset, rhythm
    recompute (`deriveCookRhythm`).
- 🟢 **pg_cron** schedules invoking the functions via **pg_net** (e.g.
  `notify-dispatch` every 5 min; `streak-maintenance` 03:10 local;
  `pod-rotate` Mondays).
- 🟢 Service-worker push registration + permission UX (`SOUS_PUSH_NOTIFY_ENABLED`
  flag already exists); subscription stored per user.
- 🟢 Wire `notifications` + `meal_plan_slots` write-through (the smart-
  notification queue + weekly planner).

### Acceptance

- A `notifications` row with `scheduled_for = now()+1min` delivers a push
  to a subscribed device and flips to `delivered`.
- `pod-rotate` advances the week key and reveals on schedule (fast-clock
  test).

> Email nudges reuse the Stage-2 email provider; push + email share the
> `notifications` queue.

---

## Stage 6 — Payments & charity (Stripe Connect + Edge webhook) 🔴-heavy

**Goal:** the charity bake-sale tooling (`SOUS_CHARITY_CHARGE_ENABLED`)
moves from honour-system stub to real, audited charges.

### Tasks

- 🔴 Stripe Connect platform account; curated 8–12 food 501(c)(3) list
  with EIN + Connect account IDs; W-9 collection; KYC. _(checklist #7 —
  the heaviest founder lift; start during Stage 2.)_
- 🟢 **Edge Function `stripe-webhook`** — verifies signature, writes
  `charity_charge_entries` on `charge.succeeded`/`refunded`
  (idempotent on `stripe_charge_id`, which is `unique`).
- 🟢 Stripe secret in **Supabase Vault**; checkout/session creation
  function; receipt + ledger UI on `/path/charity-spend`.
- 🟢 Reconciliation job (pg_cron) + honour-system → real-charge cutover
  behind the existing flag; admin export.

### Acceptance

- Test-mode `charge.succeeded` webhook writes exactly one ledger row;
  replay is idempotent; refund updates status.
- `/path/charity-spend` totals match Stripe dashboard in test mode.

---

## Stage 7 — Observability, security & resilience 🟢/🔴

**Goal:** production-grade visibility, abuse protection, and recoverability
**before** real users (and before AI spend).

### Tasks

- 🔴 **Sentry DSN** → swap `src/lib/observability/sentry-init.ts` stub for
  real init (server + edge + browser). _(checklist #8)_
- 🔴 Enable **Vercel Analytics**; the typed event taxonomy
  (`src/lib/analytics/events.ts`) goes live. _(checklist #2 follow-on)_
- 🟢 **Rate limiting** — Postgres token-bucket helper on tRPC mutations +
  Edge Functions (per-user + per-IP); `429` on abuse. Upstash optional
  drop-in (`FOUNDER-UNLOCK-RUNBOOK.md` §3) if scale demands. _(checklist
  #9 optional)_
- 🟢 **Security hardening:**
  - Supabase **leaked-password protection** + optional **MFA** (TOTP).
  - RLS audit pass; `get_advisors(security)` clean; Storage policies
    reviewed.
  - Secrets only in Vault / Vercel env; rotate the temp-seed era keys;
    confirm service-role key never ships to client.
  - CSP from report-only → enforce; dependency audit (`pnpm audit`),
    `knip` dead-code sweep.
- 🟢 **Resilience:** confirm Supabase **PITR/backups** posture (upgrade
  from free-tier daily to PITR on Pro before launch); documented restore
  runbook; `/api/health` wired to an uptime monitor + Sentry alert rules.
- 🟢 **Performance:** query-plan review on hot paths; add any missing
  composite indexes surfaced by `get_advisors(performance)` under real
  load; Next.js route-level caching where safe.

### Acceptance

- Forced error appears in Sentry < 30s; `cook.completed` appears in Vercel
  Analytics.
- 101 rapid mutations → `429` after the bucket drains.
- Advisors (security + performance) clean under representative data.

---

## Stage 8 — Beta, compliance & launch readiness 🟢/🔴

**Goal:** validated with real households, legally safe, and operationally
ready to open.

### Tasks

- 🟢 **PWA**: manifest, installable, offline shell for the cook flow
  (works on a phone in a kitchen with flaky wifi).
- 🟢 **Accessibility**: keyboard nav + screen-reader pass (queued in
  `FOUNDER-UNLOCK-RUNBOOK.md` "NOT in runbook"); reduced-motion gate
  (`docs/REDUCED-MOTION-GATE-TODO.md`); contrast/tap-target audit.
- 🟢 **E2E + load**: Playwright covering sign-up → craving → pair → cook →
  win → save → pod; `k6`/Artillery load test against staging (DB pool +
  Realtime fan-out headroom).
- 🟢 **No-scroll/nav invariants** (CLAUDE.md rule 10) re-verified on
  375×667 across every new surface.
- 🔴 **Closed beta**: cohort 1 (10 households) → fix list → cohort 2 (50).
  _(checklist #10)_
- 🔴 **Legal**: ToS + Privacy (Supabase data-processing posture, push +
  analytics disclosures); **food-advertising counsel** sign-off →
  flip `lint-safe-phrasings` to `--fail` in CI. _(checklist #11)_
- 🔴 **Content**: optional Stanford permission expansion for Content-tab
  volume. _(checklist #12)_

### Acceptance

- Beta cohort completes ≥ 3 cooks each; funnel + retention captured;
  P0/P1 bug list burned down.
- Legal sign-off filed; claim-safety CI gate enforced.

---

## Stage 9 — AI integration (FINAL) 🔴 tokens-gated, then 🟢 wiring

**Goal — the last stage, by design.** Everything above is live and
deterministic. Now the **indicative AI surfaces** flip from mock to real,
behind per-feature flags and cost guardrails. _Nothing here runs until the
keys land._

### Prerequisites (all founder-gated)

- 🔴 `ANTHROPIC_API_KEY` _(checklist #13)_ — craving parser, coach, recipe
  autogen, voice follow-ups, viral-recipe extractor.
- 🔴 `OPENAI_API_KEY` _(checklist #14)_ — food-photo recognition (Vision).
- 🔴 `SOUS_SEARCH_API_KEY` + `SOUS_SEARCH_PROVIDER` _(checklist #15)_ —
  agentic viral-recipe web search.

### Tasks

- 🟢 The provider factories already flip on key presence
  (`src/lib/ai/provider.ts`: key → `ClaudeAIProvider`, else mock; same for
  Vision + search). Wiring = set keys + flip per-feature flags:
  `SOUS_VOICE_LLM_ENABLED`, `SOUS_POD_AGENTIC_ENABLED`, recipe-autogen
  real mode, viral-search real mode.
- 🟢 **Route every LLM/Vision/search call through a Supabase Edge Function
  proxy** so keys never reach the client and all spend is logged to
  `llm_call_entries` (the cost telemetry table is already built) with
  per-user + global **budget caps** and **rate limits** (Stage 7 limiter).
- 🟢 **Two-step Vision pipeline** (CLAUDE.md AI notes): Vision identifies →
  correction-chip UI lets the user fix → never trust raw output. Structured
  craving parse via Zod (already contracted).
- 🟢 **Cost guardrails:** daily/user budget in `llm_call_entries`; degrade
  to mock provider on cap-hit (no hard failure — the app still cooks);
  surface spend on `/path/llm-spend`.
- 🟢 **Pairing-engine V3 trainer** re-eval now that real
  `recipe_score_breakdowns` data exists: run `runV3Eval` on the real
  cohort; flip `NEXT_PUBLIC_SOUS_V3_TRAINER_ENABLED` only if V3 beats V2 by
  ≥ 5pp (the gate in `FOUNDER-UNLOCK-RUNBOOK.md` §15).
- 🟢 Per-feature **staged rollout**: enable for internal → beta cohort →
  100% with the kill-switch flag at each step.

### Acceptance

- A craving typed in prod returns a real structured parse (Zod-valid);
  cost row written to `llm_call_entries`; spend visible on `/path/llm-spend`.
- Food photo recognized via Vision with the correction-chip fallback.
- Budget cap hit → silent fallback to mock; user still completes a cook.
- No API key is ever present in a client bundle (verified via build
  inspection).

---

## Appendix A — Environment variable matrix

| Variable                                                                                             | Stage | Class | Notes                                                      |
| ---------------------------------------------------------------------------------------------------- | ----- | ----- | ---------------------------------------------------------- |
| `DATABASE_URL`                                                                                       | 1     | 🔴    | Supabase pooler + DB password                              |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY`                                                             | 1     | 🟢    | already known (`SUPABASE-SETUP.md`)                        |
| `SUPABASE_SERVICE_ROLE_KEY`                                                                          | 1     | 🔴    | server-only (Edge Functions, deploy scripts); never client |
| `NEXT_PUBLIC_APP_URL` / `_SITE_URL`                                                                  | 1     | 🔴    | Vercel URL / domain                                        |
| `SOUS_AUTH_ENABLED`                                                                                  | 2     | 🟢    | `"true"` flips off mock user                               |
| Auth OAuth client IDs (Google/Apple)                                                                 | 2     | 🔴    | in Supabase Auth config                                    |
| Email/SMTP (`RESEND_API_KEY` or Supabase default)                                                    | 2/5   | 🔴    | auth + nudge email                                         |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `NEXT_PUBLIC_VAPID_PUBLIC_KEY`                            | 5     | 🔴    | web push                                                   |
| `SOUS_PUSH_NOTIFY_ENABLED`                                                                           | 5     | 🟢    | flag                                                       |
| `STRIPE_SECRET_KEY` (Vault) + webhook secret                                                         | 6     | 🔴    | charity                                                    |
| `SOUS_CHARITY_CHARGE_ENABLED`                                                                        | 6     | 🟢    | flag                                                       |
| `NEXT_PUBLIC_SENTRY_DSN`                                                                             | 7     | 🔴    | errors                                                     |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`                                                                    | 7     | 🔴    | funnel                                                     |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN`                                                                  | 7     | 🔴    | optional rate-limit                                        |
| `ANTHROPIC_API_KEY`                                                                                  | **9** | 🔴    | LLM features                                               |
| `OPENAI_API_KEY`                                                                                     | **9** | 🔴    | Vision                                                     |
| `SOUS_SEARCH_API_KEY` / `SOUS_SEARCH_PROVIDER`                                                       | **9** | 🔴    | viral search                                               |
| `SOUS_VOICE_LLM_ENABLED` / `SOUS_POD_AGENTIC_ENABLED` / `SOUS_V3_TRAINER_ENABLED` (+ `NEXT_PUBLIC_`) | 9     | 🟢    | per-feature flags                                          |

## Appendix B — Supabase feature utilization

| Supabase feature      | Used for                                                      | Stage |
| --------------------- | ------------------------------------------------------------- | ----- |
| Postgres + RLS        | All persistence; per-user isolation                           | 0,2   |
| Auth (GoTrue)         | Accounts, OAuth, sessions, `auth.uid()`                       | 2     |
| Storage               | Content images, cook/pod photos, transforms                   | 3     |
| Realtime              | Pod reveal, leaderboard, presence                             | 4     |
| Edge Functions (Deno) | notify-dispatch, pod-rotate, streak, stripe-webhook, AI proxy | 5,6,9 |
| pg_cron + pg_net      | Scheduled jobs                                                | 5,6   |
| Vault                 | Stripe + AI secrets server-side                               | 6,9   |
| PITR / backups        | Disaster recovery                                             | 7     |
| Advisors              | Security + perf gating each stage                             | all   |

## Appendix C — Sequencing, rollback, and definition of done

- **Critical path:** 1 → 2 → (3,4,5 parallelizable) → 7 → 8 → **9**.
  Stage 6 (charity) runs alongside 4–7; its KYC is the long pole, so the
  founder should start it during Stage 2.
- **Every stage is independently shippable + reversible:** each feature
  sits behind a `SOUS_*_ENABLED` flag or the `DATABASE_URL`-presence gate,
  so any stage can be dark-launched and rolled back by unsetting one var.
  Schema changes ship as additive Supabase migrations (never destructive;
  `drizzle-kit push` is not the prod path — see `drizzle.config.ts`).
- **Definition of "production-ready for users"** = Stages 1–8 live (real
  auth, data, media, realtime, nudges, payments-if-charity-on,
  observability, beta-validated, legally cleared). **Stage 9 (AI) is the
  enhancement layer** layered on top once tokens are funded — the product
  is a complete, habit-forming cooking app _without_ it, exactly as the
  brief requires.

---

_Cross-references: `docs/SUPABASE-SETUP.md` (current state),
`docs/FOUNDER-UNLOCK-RUNBOOK.md` (per-credential unlock detail + Clerk/R2/
Upstash fallbacks), `docs/STAGE-1-2-6MO-TIMELINE.md` (the 26-week
production-hardening calendar this plan re-sequences onto Supabase),
`STRATEGY.md` (moat rationale), `ROADMAP.md` (build log)._
