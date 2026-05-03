# Founder-unlock runbook (W26 deliverable)

> Stage 3 of the build is complete. This runbook is the explicit
> handoff from autonomous build mode to founder-action mode. Each
> section names exactly what Stefan needs to do, the env vars or
> config edits, and the estimated time to live.
>
> Every item below is **founder-gated** per CLAUDE.md rule 12. The
> agent can't make these happen — they need an account, a credential,
> or a real human decision. The agent has shipped the autonomous-prep
> stub for each one (see `STAGE-1-2-6MO-TIMELINE.md` §0.5), so each
> unlock is one config edit + smoke test rather than a week of work.

## Priority order (recommended)

1. **Neon Postgres** (W14) — unlocks every persistence layer.
2. **Cloudflare R2** (W15) — unlocks faster image loading + room for
   user uploads.
3. **Upstash Redis** (W16) — unlocks rate limiting + pairing-engine
   cache.
4. **Clerk auth** (W13) — unlocks per-user data + cross-device sync.
5. **Sentry + Vercel Analytics** (W17) — unlocks error visibility +
   funnel telemetry.
6. **Stanford permission docs (formal)** (W19) — unlocks volume on
   the Content tab beyond the current 18 items.
7. **Beta cohort recruitment** (W21 + W24) — unlocks real-user
   feedback loops.
8. **Food-advertising counsel** (W23 sign-off) — unlocks the
   SAFE-phrasings linter to fail-mode in CI.

## 1. Neon Postgres (W14)

**What you do:**

- Create a Neon project at https://neon.tech.
- Copy the pooled connection string.
- Add to Vercel project env (and `.env.local` for dev):
  `DATABASE_URL=postgres://...`

**What's already shipped (autonomous-prep):**

- Full Drizzle schema in `src/lib/db/schema.ts` covering 7 core
  tables + 3 Parent Mode tables (`parent_profile`,
  `kid_friendliness_label`, `kids_ate_it_log`) + `recipe_overlay`.
- `drizzle.config.ts` ready.
- `pnpm db:push` script in `package.json`.
- `useDbOrLocalStorage` write-through abstraction pattern documented
  in the schema file's header.

**Smoke test after unlock:**

```
pnpm db:push    # creates the schema
pnpm dev        # boot
```

Then complete a cook in the dev preview; it should write to both
localStorage and Postgres. Inspect via `pnpm db:studio`.

**Estimated landing:** 1 day (schema push + write-through wiring on
~6 hooks).

## 2. Cloudflare R2 (W15)

**What you do:**

- Create an R2 bucket at https://cloudflare.com/products/r2.
- Upload the contents of `public/food_images/` to the bucket
  (matching the relative paths exactly).
- Configure a public worker URL or custom domain.
- Add to env: `R2_BASE_URL=https://images.sous.app`
  (or whatever the public URL is).

**What's already shipped:**

- `src/lib/image/image-src.ts` with `imageSrc(localPath)` helper
  that flips between `R2_BASE_URL/...` and `/public/...` based on
  env. All Image components in the app already use this helper.
- `src/lib/image/image-src.test.ts` covers the env flip.

**Smoke test after unlock:**

```
NEXT_PUBLIC_R2_BASE_URL=https://images.sous.app pnpm dev
```

Open `/community` — the article hero images should now load from
R2 (check the network tab).

**Estimated landing:** 1 day (bucket setup + image upload script
exists at `scripts/content/save-stanford-image.ts` for new items).

## 3. Upstash Redis (W16)

**What you do:**

- Create an Upstash Redis database at https://upstash.com.
- Copy the REST URL + token.
- Add to env:
  `UPSTASH_REDIS_REST_URL=...`
  `UPSTASH_REDIS_REST_TOKEN=...`

**What's already shipped:**

- Rate-limit middleware shell in `src/lib/observability/`.
- In-memory LRU fallback when env unset (so the dev experience is
  unchanged with no creds).

**Smoke test after unlock:**

- Hit the same tRPC endpoint 100 times in 60s; the 11th-onward
  should rate-limit (429).

**Estimated landing:** 1 day.

## 4. Clerk auth (W13)

**What you do:**

- Create a Clerk app at https://clerk.com.
- Copy the publishable + secret keys.
- Add to env:
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...`
  `CLERK_SECRET_KEY=...`
- In `src/components/auth-provider.tsx`, swap the mock provider for
  the real `<ClerkProvider>` (one-line edit).
- In `src/middleware.ts`, flip from no-op to `clerkMiddleware()`.
- In tRPC procedures, swap `publicProcedure` → `protectedProcedure`
  on the routes that should require auth.

**What's already shipped:**

- `src/components/auth-provider.tsx` with mock-provider stub.
- `src/middleware.ts` skeleton.
- `protectedProcedure` factory in tRPC router.

**Smoke test after unlock:**

- Sign up via the new Clerk-rendered sign-up screen.
- Confirm a cook saved while signed-in writes to the user's record
  in Postgres.

**Estimated landing:** 1 day.

## 5. Sentry + Vercel Analytics (W17)

**What you do:**

- Create a Sentry project at https://sentry.io.
- Copy the DSN.
- Add to env: `SENTRY_DSN=...`
- In `src/lib/observability/sentry-init.ts`, swap the no-op shell
  for the real `Sentry.init({...})` call (6-line body swap).
- Enable Vercel Analytics on the project (one-click in Vercel).

**What's already shipped:**

- Sentry init shell in `src/lib/observability/sentry-init.ts`.
- Typed analytics event taxonomy in `src/lib/analytics/events.ts`
  (19 SousEvent variants).
- All `track()` calls in the app are no-ops without env, become real
  Vercel Analytics calls when env is set.

**Smoke test after unlock:**

- Throw an intentional error in dev; it should appear in Sentry
  within ~30s.
- Complete a cook; the `cook.completed` event should appear in
  Vercel Analytics.

**Estimated landing:** 1 day.

## 6. Stanford permission docs — formal version (W19)

**What you do:**

- If Sous expands beyond the current scope (currently the team has
  permission for short attributed summaries from public Stanford
  pages — see `docs/content-sources/STANFORD-PERMISSION.md`), get a
  written permission expansion from Stanford Communications.
- Place the permission letter at
  `docs/content-sources/permission-letters/`.
- Update `STANFORD-PERMISSION.md` with the expanded scope.

**What's already shipped:**

- 18 Stanford articles + 1 research brief + 9 expert voices already
  live, all under the existing fair-use scope.
- Source ledger at `docs/content-sources/STANFORD-SOURCES.md`.
- Image-save script at `scripts/content/save-stanford-image.ts`
  (currently unused — text-only attribution).

**Estimated landing:** Depends on Stanford turnaround.

## 7. Beta cohort recruitment (W21 + W24)

**What you do (W21 — cohort 1, 10 households):**

- Recruit 10 families from your network. The bar is "willing to
  cook 3+ times in two weeks and answer a structured interview."
- Create a Calendly for 30-minute interviews.
- Send the invite email + the deep link to the app.

**What you do (W24 — cohort 2, 50 households):**

- Recruit 50 families more broadly (Stanford parent forums,
  pediatrician network).
- Use the cohort 1 fix list to pre-empt known issues.

**What's already shipped:**

- Telemetry funnel scaffold (will start collecting once Sentry +
  Vercel Analytics are unlocked).
- `BETA_OPEN` flag scaffold for invite-flow gating.

**Estimated landing:** 2-3 weeks per cohort.

## 8. Food-advertising counsel (W23 sign-off)

**What you do:**

- Engage food-advertising counsel for a 2-hour review of the
  nutrition-claim surfaces (price band: $5-15k).
- Counsel reviews `src/data/nutrition/safe-phrasings.ts` +
  `scripts/lint-safe-phrasings.ts`.
- Counsel signs off (or supplies redlines).
- Flip the linter from advisory mode to `--fail` mode in CI:
  edit `package.json` → `"lint:safe": "node scripts/lint-safe-phrasings.ts --fail"`.

**What's already shipped:**

- `scripts/lint-safe-phrasings.ts` runs in advisory mode (prints
  findings, exits 0).
- `src/data/nutrition/safe-phrasings.ts` locks 22 SAFE template
  phrasings + a forbidden-phrases list.

**Estimated landing:** 1 day post-counsel-signoff.

## What's NOT in this runbook

- `/cook/combined` density refactor — autonomous work, deferred to
  Stage 4 W1 with dedicated test scaffolding.
- Today/Cook/Win 2nd-pass tweaks — autonomous work, queued.
- Keyboard nav + screen-reader pass — autonomous work, queued.
- Type-ramp / spacing / motion easing token codification — captured
  in `docs/design-tokens.md`; Stage 4 W1 should encode them as
  Tailwind utilities.

These are all in Stage 4's autonomous backlog. Founder action is not
required.

---

## Year-2 unlock additions (filed 2026-05-03)

> Sprint A of Year 2 (W1-W5) ships the substrate for every
> Y2-gated feature. Each entry below has a stub-mode V1
> already shipped or queued; the unlock is one config edit
> when the founder provides the key/account.

### 9. Anthropic API key (Y2 W6+, W31, W35, W39)

**Surfaces unlocked:** Recipe autogen real LLM call (Y1 W50
already ships stub-mode); Pod V2 agentic recipe pick (Y2 I);
Voice conversational follow-ups (Y2 G); Viral recipe extractor
(Y2 J).

**What founder provides:** `ANTHROPIC_API_KEY` env var on Vercel.

**Estimated landing:** 1 hour post-key (config edit + per-feature
flag flip; tests already pin the contract via mock-fetch).

### 10. Web Push VAPID keys (Y2 W19-W22)

**Surface unlocked:** Daily-rhythm smart notifications (Y2 E).

**What founder provides:** VAPID public + private key pair
(generated via `web-push generate-vapid-keys`); set as
`VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` env vars; subject
email at `VAPID_SUBJECT`.

**Estimated landing:** 2 hours post-keys (service worker
registration ramp + permission UX validation).

### 11. Search API key — Tavily / Brave / SerpAPI (Y2 W39-W43)

**Surface unlocked:** Agentic viral recipe search (Y2 J). Stub
mode ships a curated 5-result fixture set.

**What founder provides:** API key for one of: Tavily (recommended
for clean structured-output), Brave Search (cheaper at scale),
or SerpAPI (most permissive ToS for recipe extraction). Single
env var: `SOUS_SEARCH_API_KEY` + `SOUS_SEARCH_PROVIDER`.

**Estimated landing:** 2 hours post-key (provider switch +
rate-limit telemetry).

### 12. Stripe Connect + curated 501c3 list (Y2 W48-W51)

**Surface unlocked:** Charity bake-sale tooling (Y2 L). V1
stub-mode logs the would-be charge and tracks honour-system
totals.

**What founder provides:**

1. Stripe Connect platform account.
2. Curated nonprofit list — start with 8-12 food-related 501(c)(3)s
   (e.g. World Central Kitchen, Feeding America, City Harvest,
   Food Bank For NYC, Trussell Trust UK, Soup Sisters Canada,
   Meals on Wheels, etc.). Each needs name + URL + IRS EIN +
   Stripe account ID for Connect transfers.
3. Tax-form collection process (W-9 from each nonprofit).

**Estimated landing:** 1 week post-account-setup (legal review +
nonprofit onboarding + Stripe Connect KYC).

### 13. Cook deeplink author resolution (Y2 W1-W4)

**Surface unlocked:** Y1 W51 cook-deeplink share button currently
works for Nourish-verified seed recipes (resolves on any device
via the seed catalog) and falls back to a "this recipe lives on
the sharer's device" placeholder for user recipes. The Y2 unlock
ships:

1. Cross-device user-recipe resolution via Postgres lookup.
2. Author display name validated against the authed user's
   profile (Clerk).
3. Public read endpoint at `/api/recipes/<id>` honouring source
   tag (Nourish-verified recipes are public; community pre-
   verification stays private).

**Estimated landing:** Sprint A W4 of Y2 (already in the Y2
plan).

### 14. Year-1 close artifacts (filed 2026-05-03)

The following autonomous-build artifacts are ready for Stefan's
review on Year-1 close:

- `docs/YEAR-1-RETROSPECTIVE.md` — full 52-week scorecard
  (lands W52).
- `docs/YEAR-2-VIBECODE-PLAN.md` — 12-sprint Year-2 plan filed
  2026-05-02.
- `docs/sprints/J/IDEO-REVIEW.md` — Sprint J close.

No founder action required for these — they're closing
docs, not unlock blockers.
