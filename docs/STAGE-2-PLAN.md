# STAGE 2 — Lean Vibe-Coded System + Content Tab

> **Status:** PLANNED. Entered after Stage 1 prototype is complete.
> **Updated:** 2026-05-01
> **Related docs:** `ROADMAP.md` (stage summary), `STRATEGY.md` (moats + decision log), `CLAUDE.md` + `claude.md` (conventions), `PRD.md` (product vision), `docs/NEXT-20-PHASES.md` … `NEXT-20D-PHASES.md` (Stage 0.5–0.9 sprint history).

---

## Why This Stage Exists

Stage 1 proved the cook loop end-to-end on `localStorage` + static JSON + AI-with-mock-fallback. Stage 3 is production hardening — Clerk, Neon, Cloudflare R2, Upstash Redis, Sentry, GitHub Actions, WCAG 2.1 AA, PWA, multi-language. Both are well-defined.

Stage 2 sits between, and exists to deliver two things at once:

1. **A frozen, audited lean architecture** that's safe to vibe-code on top of for the next 3–6 months without dragging in DB / auth / cloud-storage debt. The architecture exists today — Stage 2 codifies it as the load-bearing pattern, with an explicit "real vs placeholder" inventory and a set of templates for common extensions.
2. **The one major surface the prototype is missing** — a place users come back to when they're _not_ actively cooking. Flo proved this works for behavioral apps. Done right, the Content tab strengthens the existing moats (behavioral, content, network) without competing with the cook loop. Done wrong, it turns Sous into a content product, which `STRATEGY.md` explicitly warns against.

This doc is the detailed plan referenced from `ROADMAP.md` Stage 2.

---

## Strategic Frame

`STRATEGY.md §1.1`: **"Cooking is the content. The guided cook flow is the engagement loop, not reading recipes. Sous measures success in meals cooked, not recipes saved."**

The Content tab must therefore obey two hard rules:

- **It does not measure success in reads or watch-time.** The Content tab's KPI is _secondary cook starts_ — cooks initiated from a Content card (Today's Read → "cook this dish," Reel → "try this technique," Clinician POV → "see the lower-GI version of your usual rice"). If a session ends inside Content with no cook started, that's a failure mode to monitor, not an engagement win.
- **No infinite scroll, no algorithmic feed, no notifications baiting return.** Content surfaces are short, daily-rotating, and finite per visit. The user gets the day's update and leaves. Same daily-finite pattern as Flo's Insights, Headspace's Daily Meditation, Duolingo's lesson cap.

With those guardrails, the Content tab compounds three of the four moats from `STRATEGY.md §2`:

| Moat                                | How Content tab strengthens it                                                                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Behavioral (habit)                  | A second daily return reason on rest days. Streak-adjacent without being streak-breaking.                                                                                      |
| Content (guided cook quality)       | Editorial scaffolding around the cook flow: myths debunked, technique reels, clinician context. Hard to replicate without a domain team.                                       |
| Network (cook together)             | Forums + reel sharing create user-to-user surface area without becoming a social network. Per `STRATEGY.md §3`, every social feature must be additive — Content respects that. |
| Engine (deterministic intelligence) | Unaffected. Content is human-authored.                                                                                                                                         |

---

## Part A — Lean Vibe-Coded System Audit

### A1. What "vibe-codeable" means in this codebase

A surface is **vibe-codeable** if an extension can be shipped by editing 1–3 files using existing patterns, with no infra changes, no env-var additions, and no risk to other features. Concretely:

- Data lives in JSON or a typed TypeScript file under `src/data/` or `src/lib/db/seed/`
- Storage is `localStorage` (via an existing hook pattern) or in-memory
- AI calls go through `src/lib/ai/provider.ts` and always have a mock-provider fallback
- New routes drop into the existing App Router structure (`src/app/(group)/route/page.tsx`)
- New components follow the kebab-case file / PascalCase component convention from `claude.md`
- Tests are co-located `*.test.ts` files and run under existing `pnpm test`

When all five conditions hold, a feature can ship via a single Claude Code task without surprise dependencies. This is the architectural surface area Stage 2 freezes.

### A2. Inventory — Real (works end-to-end, vibe-safe to extend)

| Surface                                                                                  | Backing                                                                                                     |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Today page state machine (idle → loading → results \| camera → recognition → correction) | `src/app/(today)/page.tsx`, `useTodayStore` Zustand                                                         |
| Quest card stack + swipe + save                                                          | `quest-card.tsx`, `useSavedDishes` localStorage (max 50)                                                    |
| Pairing engine (6 scorers, deterministic, unit-tested)                                   | `src/lib/engine/`, 14 Indian mains pre-scored in `pairings.json`, TS-engine fallback for the other 62 mains |
| Guided cook flow Mission → Grab → Cook → Win                                             | `src/components/guided-cook/`, 126 of 203 sides have full step data                                         |
| Combined cook (multi-dish) with sequencer                                                | `/cook/combined`, `cook-sequencer.ts` (9 tests)                                                             |
| Cook session persistence                                                                 | `useCookSessions` localStorage                                                                              |
| Path tab — skill tree, scrapbook, favorites                                              | `src/app/(path)/`, `useSkillProgress`, `useAchievements`                                                    |
| XP / levels / weekly challenges / streak multipliers                                     | `useXPSystem`, `weekly-challenges.ts`, `achievements.ts`                                                    |
| 4 mini-games (What's Cooking, Flavor Pairs, Speed Chop, Cuisine Compass)                 | `src/app/games/`, `useGameScores`                                                                           |
| Plate evaluation (ADA visualization, confidence-first appraisal)                         | `plateAppraisal.ts`, `EvaluateSheet.tsx`                                                                    |
| Fuzzy search across 93 mains                                                             | `fuzzySearch.ts` (Fuse.js)                                                                                  |
| Coach quiz (this-or-that, updates preference vector)                                     | `coach-quiz.tsx`, persisted to localStorage                                                                 |
| Save pairings + PNG plate export + native share                                          | `useSavedPairings`, `html-to-image`                                                                         |
| Heatmap (35+ mains × 148+ sides matrix)                                                  | `HeatmapModal.tsx`                                                                                          |
| All 6 AI surfaces with mock fallback                                                     | `src/lib/ai/contracts.ts`, `providers/mock.ts`, `providers/claude.ts`                                       |
| Tonight chip, repeat-cook chip, rest-day grace, big-hands mode                           | Stage 0.5 / NEXT-20                                                                                         |
| Cuisine constellation, journey montage, weekly goal card                                 | Stage 0.5                                                                                                   |
| Substitution memory, mistake suppression, cook rhythm hints                              | Stage 0.8 / 0.9 (NEXT-20C/D)                                                                                |
| Read-aloud step player + double-tap re-read                                              | Stage 0.5 / 0.9                                                                                             |
| Recipe gift link (`/gift/[slug]`)                                                        | Stage 0.5                                                                                                   |
| Friends Strip rendering user's own completed cooks                                       | Real cook session data                                                                                      |
| Tab bar with progressive visibility                                                      | `tab-bar.tsx`, `useNavigation`, `useUnlockStatus`                                                           |
| 222 vitest tests + 14 Playwright E2E specs                                               | `pnpm test`, `pnpm test:e2e`                                                                                |

### A3. Inventory — Placeholder (looks real, isn't — handle with care)

| Surface                                    | What's faked                                                                | Risk if vibe-coded against                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Friends Strip "friend cooks"               | Mock entries in `friend-cooks.ts`                                           | Building social features assuming real friends exist will silently work in dev and break in prod  |
| Cook session userId                        | `"local-${Date.now()}"` (no Clerk)                                          | Any feature keyed on userId is single-device only                                                 |
| `cook.start` / `cook.complete` DB writes   | No-op without `DATABASE_URL`                                                | A new analytics surface reading from DB will return empty                                         |
| `journey.recent` / `journey.stats` tRPC    | Accepts localStorage sessions client-side                                   | Server-side cron / digest features are not possible without DB                                    |
| `coach.quiz` / `coach.vibePrompt`          | Mock data                                                                   | Quiz history is per-device only                                                                   |
| `content.getSideDish` / `content.search`   | Stubs returning JSON                                                        | Real DB-backed search needs Stage 3 work                                                          |
| Vercel Analytics events                    | Stubs (`src/lib/analytics.ts`)                                              | Funnel data is not actually being collected                                                       |
| Instacart button on Grab screen            | "Coming soon" toast                                                         | Cannot rely on order-tracking signals                                                             |
| Image URLs on meals / sides                | All `null` (gradient + emoji fallback, intentional per `CLAUDE.md` rule 11) | Do NOT generate images in-repo; separate AI pipeline owns this                                    |
| `photoUri` on cook sessions                | Local blob URL                                                              | Photos do not survive cache clear or device switch                                                |
| Clerk auth                                 | Bypassed via mock user object                                               | `protectedProcedure` / route guards are inert today                                               |
| 14 of 76 mains have engine-scored pairings | TS engine fallback for the other 62                                         | Quality is lower for fallback mains; do not benchmark engine quality against the full catalog yet |
| Sentry / Upstash Redis / Cloudflare R2     | None present                                                                | No error monitoring, no rate limiting, no image hosting                                           |
| CI/CD                                      | None configured                                                             | Tests run locally, not on PRs                                                                     |

### A4. Vibe-codeable patterns (use these templates)

1. **Add a static data entry.** Edit `src/data/<file>.ts` or `src/data/<file>.json`. Examples: `sides.json`, `meals.json`, `achievements.ts`, `weekly-challenges.ts`, `friend-cooks.ts`, `skill-tree.ts`.
2. **Add a new component.** New file under `src/components/<surface>/<kebab-name>.tsx`. Export named function. Use `cn()` for conditional classes. Import from the parent surface.
3. **Add a localStorage-backed hook.** New file under `src/lib/hooks/use-<thing>.ts`. Use the versioned-key pattern from `useSubstitutionMemory` (TTL + malformed-entry rejection). Co-locate `*.test.ts`.
4. **Add a tRPC endpoint with mock data.** Add procedure to existing router under `src/lib/trpc/routers/`. Define Zod input + output. Return mock fixtures that respect the schema. Existing stubs (`journey.recent`, `coach.vibePrompt`, `content.search`) are the reference.
5. **Add an AI surface.** Extend `src/lib/ai/contracts.ts`, then `providers/mock.ts`, then `providers/claude.ts`, then expose via `lib/trpc/routers/ai.ts`. All 6 existing surfaces follow this template — copy one verbatim and adapt.
6. **Add a new route.** Drop `src/app/(group)/<route>/page.tsx` (and optional `layout.tsx`). Use a route group `()` only if grouping multiple pages with shared layout.
7. **Add a guided cook flow.** Extend `src/data/guided-cook-steps.ts` keyed by a slug that ALREADY exists in `sides.json` or `meals.json`. Validator (`pnpm validate:data`) enforces this at build time. Never invent new dishes (`CLAUDE.md` rule 7).
8. **Add a mini-game.** New route under `src/app/games/<name>/`. Follow the four existing games' shape. Score persists via `useGameScores`.
9. **Add daily content.** New `daily-briefing-YYYY-MM-DD.md` or `daily-feature-ideas-YYYY-MM-DD.md` at repo root. Pure prose, no wiring needed.
10. **Add a Framer Motion section.** Use `motion.div` with `initial` + `whileInView` (NOT IntersectionObserver-gated opacity wrappers — see Final-Portfolio's Stage 0.7 RCA for why those break on direct-scroll-to). Gate animations with `useReducedMotion`.

### A5. Anti-patterns — DO NOT vibe-code these (defer to Stage 3)

1. **New Drizzle migrations.** Schema is defined but no DB is provisioned in dev. Touching schema without `DATABASE_URL` + `pnpm db:push` will produce non-functional code.
2. **Auth-gated features.** Clerk is bypassed. `protectedProcedure` is inert. Enabling auth needs careful migration of existing `local-*` sessions.
3. **Image generation.** Image pipeline lives outside this repo. Do not call DALL-E / Imagen in-repo. Use the gradient + emoji fallback for any new dish surface.
4. **Real-time / websocket features.** No Pusher / Ably / Liveblocks. Forum updates in Stage 2 are pull-based on page load only.
5. **Cross-device persistence.** localStorage is per-device. Do not promise users that bookmarks / favorites / streaks sync — they don't until Stage 3.
6. **Server-side image upload.** No R2 bucket, no upload route. Photo features stay as blob URLs.
7. **New external services.** No Sentry, Twilio, SendGrid, Stripe. Anything requiring an API key outside the existing AI provider stack should be deferred.
8. **Schema changes that invalidate existing localStorage keys.** The 20+ hooks in `src/lib/hooks/use-*.ts` have versioned keys; changing the shape without versioning the key trashes user data on next deploy.
9. **Removing intentional features from `CLAUDE.md` rule 11.** Path always-visible, Friends Strip below fold on Today, no kitchen sanitation in skill tree, all images null, Clerk disabled, etc. These are non-negotiable until the user explicitly approves.

### A6. Audit action items (Phase A1–A5)

- **A1.** Generate `docs/STAGE-2-AUDIT.md` walking every component under `src/components/today/` and `src/components/path/`, labeling each "real" or "placeholder" with one-line evidence. Cross-reference to the inventories above.
- **A2.** Add `src/data/PLACEHOLDERS.md` listing every mock data file with a 1-line description of what it fakes and what would replace it in Stage 3.
- **A3.** Add `pnpm audit:placeholders` script that greps for known placeholder markers (e.g. `// TODO(stage-3)`, `mock-friend`, `local-${Date.now()}`) and prints a report.
- **A4.** Update `CLAUDE.md` rule 11 to add the Content tab as always-visible (alongside Today + Path). One-line edit.
- **A5.** Update `claude.md` "Operational guardrails" to add: "If a feature requires DB / auth / R2 / Sentry / websocket, route it to the Stage 3 backlog — do not begin implementation in Stage 2."

---

## Part B — Content Tab MVP

### B1. Surfaces (in vertical order on `/content`)

1. **Today's Read (hero).** Single card, daily rotation. Selection logic ties to the user's most recent completed cook: "You cooked Chicken Biryani on Tuesday — here's an endocrinologist's note on basmati vs brown rice." Falls back to a default daily pick if no cook history. One card, one CTA ("Read · 2 min" or "Watch · 0:45").
2. **Reels rail.** Horizontal scroll, snap-to-tile, 5–7 tiles visible per swipe. Each tile is a 9:16 thumbnail with creator handle and duration. Tap → vertical full-screen player. TikTok-polish bar: smooth 60fps swipe between reels, autoplay on view, mute toggle persistent across reels, double-tap heart, captions on by default.
3. **Myths Dispelled.** 3-up grid of short article cards from health professionals. Card structure: struck-through old wisdom (red), green-check new evidence, byline + credential, source citation. Examples: "Carbs aren't evil — here's the GI breakdown." / "Olive oil at high heat: the truth." / "You don't need 30g protein every meal."
4. **Research Dissemination.** 3-up grid of research summaries from labs (Stanford Endocrinology + 2–3 others to start). Card structure: lab logo, paper title in plain English, 2-sentence dek, link to original paper. Translated for laypeople, not press-release prose.
5. **Clinician POV.** Long-form blog grid. Card structure: clinician headshot, name + credential, post title, 1-sentence dek, read-time. Detail page is reader-mode long-form (16px serif body, generous line-height, reading-progress bar at top). Length: 800–1500 words.
6. **Cooking Forum.** Thread list. Each row: title, body preview, replies count, time-ago, top reply quote. Tap → thread detail with 2-level reply nesting (no infinite trees). "New thread" CTA opens a simple compose sheet. V1 uses the mock user identity from `claude.md` rule 11 — no real auth, no anonymous handles.

### B2. Tab bar update

- `TabIcon` in `src/components/shared/tab-bar.tsx` adds an `id: "content"` case. Icon: a stack-of-cards or open-book glyph (24×24 stroke-2 lucide-style).
- `useNavigation` in `src/lib/hooks/use-navigation.ts` returns three tabs unconditionally: Today, Path, Content. Community stays out of the visible bar but the `(community)` route group remains for future use.
- No progressive unlock gate on Content. Per `STRATEGY.md` decision log entry on Path: "Curiosity about locked content is more motivating than being blocked from seeing it exists." Same logic applies.
- `CLAUDE.md` rule 11 gets one-line update: "Content tab is ALWAYS visible in the tab bar."

### B3. Routes

```
src/app/(content)/content/page.tsx                 # main grid: all six surfaces
src/app/(content)/content/reels/page.tsx           # full vertical reel feed
src/app/(content)/content/reels/[slug]/page.tsx    # deep-link to a single reel
src/app/(content)/content/article/[slug]/page.tsx  # myth / research / clinician detail
src/app/(content)/content/forum/page.tsx           # thread list
src/app/(content)/content/forum/[id]/page.tsx      # thread detail
src/app/(content)/content/forum/new/page.tsx       # compose
src/app/(content)/layout.tsx                       # tab-bar + content-specific chrome
```

No settings page (`CLAUDE.md` rule 3). Bookmarks live inline on each card, not in a separate screen.

### B4. Data model (Zod schemas in `src/types/content.ts`)

```ts
const Article = z.object({
  type: z.literal("article"),
  category: z.enum(["myth", "research", "clinician"]),
  slug: z.string(),
  title: z.string(),
  dek: z.string(),
  body: z.string(), // markdown
  author: z.string(),
  authorRole: z.string(), // "Endocrinologist, Stanford Medicine"
  authorAvatarUrl: z.string().nullable(),
  sourceUrl: z.string().url().nullable(),
  publishedAt: z.string(),
  readTimeMin: z.number(),
  tags: z.array(z.string()),
  relatedDishSlugs: z.array(z.string()), // wires "cook this" CTA
});

const Reel = z.object({
  type: z.literal("reel"),
  slug: z.string(),
  videoSrc: z.string().url(),
  posterSrc: z.string().url(),
  creator: z.string(),
  creatorHandle: z.string(),
  creatorAvatarUrl: z.string().nullable(),
  durationSec: z.number(),
  caption: z.string(),
  relatedDishSlug: z.string().nullable(),
  techniqueTags: z.array(z.string()), // "knife", "plating", "sear", "fold"
  publishedAt: z.string(),
});

const ForumReply = z.object({
  id: z.string(),
  authorMockId: z.string(),
  body: z.string(),
  createdAt: z.string(),
  childReplies: z.array(z.lazy(() => ForumReply)).max(20), // 1 level deep
});

const ForumThread = z.object({
  type: z.literal("thread"),
  id: z.string(),
  title: z.string(),
  body: z.string(),
  authorMockId: z.string(),
  createdAt: z.string(),
  tags: z.array(z.string()),
  replies: z.array(ForumReply),
});

export const ContentItem = z.discriminatedUnion("type", [
  Article,
  Reel,
  ForumThread,
]);
```

### B5. Components

```
src/components/content/
  todays-read-card.tsx     # hero, daily-rotating, ties to last cook
  content-rail.tsx         # horizontal snap-scroll primitive
  reel-tile.tsx            # 9:16 thumb + creator + duration
  reel-player.tsx          # full-screen vertical, swipe between, mute persist
  article-card.tsx         # myth / research / clinician shared shape
  myth-card.tsx            # specialization with strike-through + check pattern
  research-card.tsx        # lab-logo + dek + source paper link
  clinician-card.tsx       # headshot + credential + read-time
  forum-thread-row.tsx     # title + preview + replies + time-ago
  forum-thread-detail.tsx  # full thread + 2-level reply tree
  forum-reply.tsx          # single reply, recursive 1 level
  forum-compose-sheet.tsx  # new-thread bottom sheet
  bookmark-button.tsx      # one-tap save, persists in useBookmarks
  read-progress-bar.tsx    # top-of-article scroll indicator
```

Primitives reuse `IconButton` from Stage 0.5 (tap targets ≥44×44), `cn()` from `src/lib/utils/cn.ts`, motion patterns from existing components, `useReducedMotion` for animation gates.

### B6. Authored seed content (Phase B4)

Minimum to ship without Lorem ipsum (`CLAUDE.md` simplicity rule + STRATEGY.md cultural authenticity):

- **Articles: 12** (4 myths, 4 research summaries, 4 clinician POV). Author bylines real, content drafted from publicly available material with citation.
- **Reels: 15** (5 technique demos, 5 cooking creators, 5 "mistake of the day" tied to existing `mistake-chip` data). Use Creative Commons / Pexels / creator-permission sources; never hotlink-scrape.
- **Forum threads: 8** (seeded prompts: "Anyone else swap basmati for cauliflower rice?", "How do you make biryani for one?", "Best non-dairy substitute for ghee?" etc.). Each with 2–4 mock replies to demonstrate the 2-level nesting.

All content lives in `src/data/content/`:

```
src/data/content/
  articles.json           # 12 entries
  reels.json              # 15 entries (videoSrc + posterSrc URLs)
  forum-threads.json      # 8 entries with seeded replies
  authors.json            # author bylines + credentials + avatar paths
```

### B7. Hooks

```
src/lib/hooks/use-bookmarks.ts          # localStorage, max 30, MRU, versioned key
src/lib/hooks/use-content-read-state.ts # 90-day per-slug read marker
src/lib/hooks/use-todays-read.ts        # picks daily card based on last cook + rotation
src/lib/hooks/use-reel-prefs.ts         # mute state, autoplay-on-view toggle
```

All follow the pattern from `use-substitution-memory.ts` / `use-mistake-suppression.ts` (versioned storage key, TTL where relevant, malformed-entry rejection, unit-tested).

### B8. AI surface — "What should I read tonight?"

Add one AI surface following the existing 6-surface template:

- Contract in `src/lib/ai/contracts.ts`: `suggestContent({ lastCookSlug, recentTags, timeOfDay }) → { contentSlug, reason }`.
- Mock provider returns a deterministic pick from `articles.json` based on `relatedDishSlugs`.
- Claude provider can suggest from a larger semantic match across content tags + dish taxonomy.
- Exposed via `ai.suggestContent` tRPC procedure.
- Used to power the Today's Read hero card.

### B9. Phase plan (P1–P15)

| Phase | Deliverable                                                                                                                                                    | Acceptance                                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| P1    | Tab bar adds Content icon + label; `useNavigation` returns Today/Path/Content unconditionally; existing Today + Path tests still pass                          | `pnpm test` green; manual 375×667 viewport check                                |
| P2    | `(content)` route group + `content/page.tsx` skeleton; `(content)/layout.tsx` mounts existing tab bar                                                          | Route renders, no console errors                                                |
| P3    | Zod schemas + `src/data/content/*.json` seed files (12 articles + 15 reels + 8 threads + authors); validator script `pnpm validate:content` runs in `prebuild` | `pnpm validate:content` exits 0                                                 |
| P4    | `useBookmarks`, `useContentReadState`, `useReelPrefs` hooks with unit tests                                                                                    | New hook tests pass; existing 222 tests still green                             |
| P5    | `TodaysReadCard` hero + `use-todays-read.ts` selection logic + `ai.suggestContent` mock surface                                                                | Hero renders for the 3 main cases: first visit / has-history / no-AI-key        |
| P6    | `ContentRail` horizontal-snap primitive                                                                                                                        | Snap works on mobile + desktop; respects reduced motion                         |
| P7    | Reels rail rendering on `/content`; tiles tap-route to `/content/reels/[slug]`                                                                                 | First-paint render budget < 250ms on 3G                                         |
| P8    | `ReelPlayer` full-screen vertical with swipe-between + mute persist + double-tap heart + captions on                                                           | 60fps swipe verified on iOS Safari + Android Chrome; mute survives across reels |
| P9    | Article grid sections (Myths, Research, Clinician POV) + section header chrome                                                                                 | All 12 article cards render, links work                                         |
| P10   | Article detail page with reader-mode layout + read-progress bar + bookmark button                                                                              | Reads cleanly at 16/24/32px font scale; bookmark survives reload                |
| P11   | Forum thread list page                                                                                                                                         | All 8 seeded threads render with metadata                                       |
| P12   | Forum thread detail with 2-level reply nesting                                                                                                                 | Compose sheet works; reply persists in localStorage; deep-link works            |
| P13   | "Cook this" CTA on every Article + Reel that has `relatedDishSlug(s)` — routes to `/cook/[slug]`                                                               | Cook starts open the Mission screen in 1 tap                                    |
| P14   | A11y + reduced-motion sweep across all content surfaces; bare-icon-button `aria-label`s; reel captions on by default for screen-reader baseline                | axe-core run via Playwright reports 0 critical                                  |
| P15   | Lint + production build + ROADMAP/CLAUDE.md updates marking Stage 2 complete                                                                                   | `pnpm lint && pnpm build && pnpm test` all green; 240+ tests                    |

### B10. Acceptance criteria for Stage 2 (top-level)

- Audit doc shipped (`docs/STAGE-2-AUDIT.md`) with every Today/Path surface labeled real/placeholder.
- `pnpm audit:placeholders` script wired and passing.
- `CLAUDE.md` rule 11 updated; `claude.md` operational guardrails updated with the "defer infra to Stage 3" rule.
- Content tab live with all six surfaces functional and seeded with real authored content (no Lorem ipsum).
- Tab bar shows three tabs from day one.
- Cook loop unchanged: existing E2E specs for Today, search, full cook loop, Path unlock all pass.
- 240+ vitest tests green; lint + build clean.
- TikTok-polish target hit: 60fps reel swipe on iOS Safari + Android Chrome, autoplay on view, mute toggle persistent.
- Forum threads round-trip through localStorage on a single device.
- Bookmarks round-trip across reloads.
- No new env-var dependencies; no new external services; no Drizzle migrations; no Clerk enable.

---

## Part C — Stage 3 hand-off

These items naturally fall to Stage 3 (Production Launch) and SHOULD NOT be attempted in Stage 2:

- Forum posts persisting cross-device → needs Neon + `forum_threads` / `forum_replies` Drizzle tables + `protectedProcedure` writes.
- User-submitted reels → needs Cloudflare R2 + upload pipeline + content moderation.
- Real-time forum updates → needs Pusher / Ably / websocket-on-Vercel.
- Verified-clinician badges → needs Clerk auth + admin role + verification workflow.
- Content moderation (forum) → needs admin tools, abuse reporting, ban states.
- Forum search at scale → needs server-side index (Postgres FTS or Algolia).
- Real analytics on Content read-through → needs the Vercel Analytics stub replaced with real events.
- Content CMS for non-engineer authoring → needs admin UI; for Stage 2 the JSON-edit + PR loop is the authoring model.
- Push notifications for daily content → needs PWA + service worker + push subscription endpoint.

---

## Risk register

| Risk                                                 | Likelihood                        | Mitigation                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content tab becomes the product, cook loop atrophies | Medium                            | KPI is _secondary cook starts_, not reads or watch time. Monitor on a per-session basis. If a deploy drops cooks/week, roll back the Content surfaces in priority order: forum → research → myths → reels → today's read.                                                   |
| Reels can't hit TikTok-polish on the web             | Medium                            | Build P8 against a measured 60fps target on a 2-year-old Android. If we miss, the fallback is a poster-image-first design with tap-to-play (still useful, just not TikTok-grade).                                                                                           |
| Authoring throughput stalls without a CMS            | Medium                            | Stage 2 ships with 12+15+8 seed items. Beyond that, JSON-edit + PR loop sustains 5–10 items/week with one author. Real CMS is a Stage 3 concern.                                                                                                                            |
| Forum invites toxicity / moderation overhead         | Low-Medium                        | V1 uses mock identity, no DMs, no anonymous handles, no upvotes (only replies). Threading capped at 2 levels. Compose sheet is friction enough to discourage drive-by posts.                                                                                                |
| Content tab confuses positioning vs Path tab         | Medium                            | Path = _your_ cooking journey (skill tree, scrapbook, streak). Content = _the world's_ cooking knowledge (articles, reels, forum). Path is mirror; Content is window. Copy must reinforce this — every Content surface header uses third-person plural or specialist voice. |
| Vibe-coding the wrong layer                          | High pre-Stage-2 audit; Low after | Part A audit + anti-patterns list directly addresses this. Action items A1–A5 lock the guardrails.                                                                                                                                                                          |

---

## Open questions for the founder

1. **Content sourcing.** Who authors the first 12 articles? Options: (a) repurpose Stanford Medicine public content with attribution, (b) commission 4 short pieces from a freelance dietitian + endocrinologist, (c) AI-draft with human medical review. Recommendation: (c) for myths, (a)+(b) blend for research and clinician POV.
2. **Reel sourcing.** TikTok-polish reels are the highest-leverage surface but also the hardest to source legally. Options: (a) commission 15 short pieces from a single creator with rights buyout, (b) seek Creative Commons cooking reels (limited library), (c) auto-generate from completed cook session photo timelapses (works only after enough users). Recommendation: (a) for launch credibility, (c) as the long-term moat.
3. **Forum identity in V1.** Mock user works for round-trip demos but breaks any "real forum" promise. Confirm V1 is OK with a single-device mock identity, or whether we should pull-forward a lightweight Clerk anonymous-session into Stage 2.
4. **"Today's Read" frequency.** Default is one card per day with rotation. Should it refresh per session, per day, or only on a new cook? Recommendation: per day with manual refresh on a new cook completion.
5. **Forum spam in seed data.** The 8 seeded threads need realistic but anodyne content. Should we use real Reddit/r/cooking threads with attribution, or write fresh prompts? Recommendation: fresh prompts authored alongside the article content.
