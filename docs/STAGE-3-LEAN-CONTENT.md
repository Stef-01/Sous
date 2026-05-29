# Stage 3 — Lean Vibe-Coded System + Content Tab

> **Authored:** 2026-05-01
> **Status:** Active
> **Sequence:** Stage 0.9 (NEXT-20D) → **Stage 1 prototype complete** → **Stage 3 (this doc)** → Stage 2 (production hardening, deferred)
> **Why before Stage 2:** Stefan's directive — push the vibe-coded prototype as far as it can credibly go before paying the production-tax of Clerk + Neon + R2 + Sentry + Redis. Surface area first, infra second.

---

## 1. The Lean-Vibe Posture

The prototype already runs end-to-end with **zero backend infra**:

- All persistence is `localStorage` (cook sessions, XP, achievements, bookmarks, preferences, taste blend, mistake suppression, substitution memory, share log, friends-last-seen, craving history).
- All AI calls have a `mock` provider fallback (`src/lib/ai/providers/mock.ts`) so the app is fully demoable with no API keys.
- All content is static JSON (`meals.json`, `sides.json`, `pairings.json`, `friend-cooks.ts`, etc.) loaded at build time.
- Auth is bypassed with a mock user. Clerk + middleware are wired but not enforced.

Stage 3 keeps this posture and grows the **user-facing surface** instead of the **infra surface**. The next time we touch infra (Stage 2) we will have a richer product to wrap, not just the core loop.

### What ships fully working in Stage 3

| Surface                                                           | State                | Persistence                                                      |
| ----------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------- |
| Today tab (full core loop)                                        | Real                 | localStorage                                                     |
| Path tab (skill tree, scrapbook, achievements, weekly challenges) | Real                 | localStorage                                                     |
| Guided cook flow (Mission → Grab → Cook → Win)                    | Real                 | localStorage + Zustand                                           |
| Plate evaluation (Evaluate A)                                     | Real                 | Pure compute                                                     |
| Reflect on meal (Evaluate B)                                      | Real                 | localStorage + AI w/ mock fallback                               |
| Pairing engine (6 scorers)                                        | Real                 | Static JSON + on-demand                                          |
| Coach quiz + vibe prompt                                          | Real                 | localStorage                                                     |
| Cuisine mastery + XP / levels                                     | Real                 | localStorage                                                     |
| Games arcade (4 games)                                            | Real                 | localStorage                                                     |
| Recipe overlays (personal notes per step)                         | Real                 | localStorage                                                     |
| Friends strip (mock + own cooks)                                  | Real-on-mock         | Static + localStorage                                            |
| **Content tab — bookmarks, navigation, filters, deep routes**     | **Real**             | **localStorage + sessionStorage**                                |
| **Content tab — articles, reels, research, experts, forum**       | **Placeholder copy** | **Static JSON, fictional authors, marked `isPlaceholder: true`** |

### What stays a Stage-2 placeholder

| Concern                            | Why deferred to Stage 2                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------- |
| Clerk auth enforcement             | No login wall in prototype; mock user is fine for demo.                                  |
| Neon Postgres                      | Static JSON + localStorage cover every Stage-3 surface.                                  |
| Cloudflare R2 image storage        | `/public/food_images/*.png` covers article/reel posters.                                 |
| Upstash Redis (rate-limit + cache) | Mock AI fallback already eliminates abuse path.                                          |
| Sentry + Vercel Analytics          | Stub events exist; real telemetry waits for real users.                                  |
| PWA / installability               | App runs fine in a browser tab; standalone is post-launch polish.                        |
| Multi-language i18n                | English-only prototype is acceptable to validate the loop.                               |
| Real video transcoding for Reels   | Placeholder is poster image + simulated player chrome.                                   |
| Real forum moderation              | Forum threads are static; commenting is mock-write on save.                              |
| Clinician-verified content         | Authors are fictional and clearly marked; replacement is a Stage-2 editorial workstream. |

---

## 2. Content Tab — Spec

### 2.1 Naming + tab-bar position

- The third tab is renamed **Content** (was "Community"). Internally the route remains `/community/*` to preserve existing imports and avoid a Next.js rewrite cascade — the user-facing label is what changes.
- The tab is **always visible** (we drop the 30-day unlock gate). Path is already always-visible per CLAUDE.md rule 11; Content joins it as the third permanent destination.
- Tab order: **Today · Path · Content**.

### 2.2 Inspiration

Modeled on the **Flo** period-tracker app's "Secrets" / "Insights" tab — a magazine-style content destination wrapping medically-credible health content in a soft, browseable layout. Adapted for food + cooking: replace cycle-tracking topics with nutrition science, dietary myth-busting, cuisine deep-dives, and TikTok-polish cooking reels.

### 2.3 Surfaces (single Content home page)

Vertical scroll, mobile-first, no-scroll rule for the primary CTA does **not** apply here — Content is a browse surface, not an action surface. Tab-bar remains visible.

1. **Header** — page title `Content`, subtitle line ("Cook smarter, eat better."), bookmark icon → routes to `/community/saved`.
2. **Category filter strip** — horizontal pills: `For You · Reels · Articles · Research · Experts · Forum`. Active pill state persists in `sessionStorage` via `useContentFilter`. Tapping a non-`For You` pill scrolls to that section / opens the dedicated subroute when applicable.
3. **Featured hero carousel** — 3 swipeable hero cards (full-bleed image, gradient overlay, title, kicker, byline). Auto-rotation **off** by default (respects `prefers-reduced-motion`).
4. **Reels rail** — horizontal-scroll TikTok-style portrait cards (`aspect-[9/16]`). Tapping a card opens the **Reel Player Sheet** (full-screen vertical sheet with simulated video player chrome — poster image, play overlay, like/save/share rail, caption, creator handle).
5. **Articles section** — 2-column staggered grid of article cards: cover image, category chip, title, author + read time.
6. **Research Spotlight** — single wide cards with paper-style typography: study title, lab/affiliation, plain-language takeaway, "Read brief" CTA.
7. **Expert Voices** — horizontal-scroll circular avatar row with name + credential; tap → expert profile page listing their articles.
8. **Forum** — most-recent thread list (3 visible, "See all" link): title, replies count, last-active relative time, top-tag chip.
9. **Footer disclaimer** — small print: "Sample editorial content for prototype. Not medical advice. Always consult your clinician."

### 2.4 Detail routes

| Route                        | Purpose                                                           |
| ---------------------------- | ----------------------------------------------------------------- |
| `/community`                 | Home (above)                                                      |
| `/community/saved`           | Bookmarked articles + reels + briefs                              |
| `/community/article/[slug]`  | Article reading view (long-form, hero image, body, related, save) |
| `/community/reels`           | Full-screen vertical reel feed (snap-scroll)                      |
| `/community/research/[slug]` | Research brief reading view                                       |
| `/community/expert/[slug]`   | Expert profile + their content                                    |
| `/community/forum/[id]`      | Thread view (op + replies, mock-write reply box)                  |

All detail routes share a thin back-button header pattern matching `/community/page.tsx` stub style.

### 2.5 Hooks (new)

| Hook                  | Purpose                                                                         | Storage                                  |
| --------------------- | ------------------------------------------------------------------------------- | ---------------------------------------- |
| `useContentBookmarks` | Toggle + read saved content (articles, reels, research, threads). 100-item cap. | `localStorage:sous-content-bookmarks-v1` |
| `useContentFilter`    | Active category pill on Content home.                                           | `sessionStorage:sous-content-filter`     |
| `useReelEngagement`   | Per-reel like/save state + view-count increment (local-only).                   | `localStorage:sous-reel-engagement-v1`   |
| `useForumDrafts`      | Local replies to forum threads (mock-write, never sent).                        | `localStorage:sous-forum-drafts-v1`      |

### 2.6 Schema overview (`src/types/content.ts`)

```ts
type ContentCategory = "reels" | "articles" | "research" | "experts" | "forum";

interface BaseContentItem {
  id: string;
  category: ContentCategory;
  title: string;
  createdAt: string; // ISO
  updatedAt?: string;
  isPlaceholder: true; // explicit so we never confuse seed for real
}

interface Article extends BaseContentItem {
  category: "articles";
  slug: string;
  kicker: string; // short pre-title eyebrow ("Myth-busting")
  excerpt: string;
  coverImageUrl: string; // /food_images/*.png
  body: string[]; // paragraphs
  authorId: string; // → expert
  readMinutes: number;
  tags: string[];
  featured?: boolean;
}

interface Reel extends BaseContentItem {
  category: "reels";
  posterImageUrl: string;
  caption: string;
  creatorHandle: string; // @cookwithpriya
  creatorName: string;
  durationSeconds: number;
  likes: number;
  technique?: string; // ladder to skill-tree node
  dishSlug?: string; // ladder to /cook/[slug]
}

interface ResearchBrief extends BaseContentItem {
  category: "research";
  slug: string;
  labName: string; // "Stanford Lifestyle Medicine (sample)"
  paperTitle: string; // sample, not real DOI
  takeaway: string; // one-sentence plain English
  body: string[];
  whyItMatters: string;
  coverImageUrl: string;
}

interface ExpertVoice extends BaseContentItem {
  category: "experts";
  slug: string;
  name: string; // fictional
  credential: string; // "RD, MS"
  affiliation: string; // "(sample affiliation)"
  bio: string;
  avatarUrl: string; // food image fallback or placeholder
  articleIds: string[];
}

interface ForumThread extends BaseContentItem {
  category: "forum";
  authorHandle: string;
  body: string;
  replies: ForumReply[];
  topTag: string;
  lastActiveAt: string;
}

interface ForumReply {
  id: string;
  authorHandle: string;
  body: string;
  createdAt: string;
}
```

### 2.7 Placeholder integrity

- Every seeded item carries `isPlaceholder: true`.
- Author names are **fictional** (not impersonating real public figures).
- Affiliations include the suffix `"(sample)"` so a casual reader is never deceived.
- Footer disclaimer on every detail page reiterates: "Sample editorial content. Not medical advice."
- The `body` paragraphs make no specific medical claims a non-clinician shouldn't make — they describe well-established consensus (e.g., fiber-rich beans support gut health) in plain language and explicitly avoid prescriptive advice.

### 2.8 Visual language

- Reuse existing tokens: `--nourish-cream` (bg), `--nourish-dark` (text), `--nourish-subtext` (caption), `--nourish-green` (accent), `--nourish-warm` (highlight).
- Cards: `bg-white rounded-2xl shadow-sm border border-neutral-100/80` — same vocabulary as `friends-strip.tsx`.
- Typography: `font-serif` for hero/article titles (DM Serif Display already loaded), `font-sans` body.
- Reel cards: `aspect-[9/16] w-[160px]` portrait, shadow-md, gradient bottom overlay with creator handle and play-overlay icon.
- All animations gated on `useReducedMotion` for the WCAG sweep done in P17 of Stage 0.9.

### 2.9 Out of scope for Stage 3

- Real video playback (we ship simulated player UI only).
- Server-side comment moderation, flagging, blocking.
- Content recommendation ML (the "For You" pill returns a deterministic ranked feed for now — featured items first, then by `createdAt`).
- Push notifications for new content.
- Editorial CMS — a future Stage 2 workstream.
- Real expert verification, credentialing, ID checks.

---

## 3. Acceptance criteria

- [x] Content tab pinned in tab bar, always visible, label `Content`.
- [x] `/community` home renders header, filter strip, hero carousel, reels rail, articles grid, research spotlight, expert row, forum list, disclaimer footer.
- [x] All detail routes load with back nav and matching visual vocabulary.
- [x] Bookmarks toggle on every saveable card and persist across reloads.
- [x] Reel player sheet opens, plays simulated UI, supports like/save/share, dismisses with swipe-down or close button.
- [x] Forum thread reply box accepts text, optimistically appends a local reply (mock-write).
- [x] No real recipe or food image is invented — reuses `/public/food_images/` already in repo.
- [x] All seed items carry `isPlaceholder: true`. Disclaimer footer present.
- [x] `pnpm lint && pnpm test && pnpm build` clean.
- [x] Committed + pushed to `main`.

---

## 4. Inventory delta vs Stage 1

| Stage 1 (prototype)                     | + Stage 3                                        |
| --------------------------------------- | ------------------------------------------------ |
| Today + Path tabs                       | + Content tab                                    |
| Cook loop + scrapbook                   | + magazine-style content browsing                |
| Friends strip (mock social)             | + Reels rail (mock TikTok), Forum (mock threads) |
| Coach + vibe prompt (in-app micro-copy) | + Articles + Research briefs (long-form copy)    |
| 4 mini-games                            | (unchanged)                                      |
| Achievements + XP                       | (unchanged)                                      |
| 126 guided cooks                        | (unchanged)                                      |

Stage 3 adds **one new tab**, **~8 new components**, **~5 new routes**, **4 new hooks**, **1 new typed content schema**, **5 seed JSON/TS files**, and **zero new infra dependencies**.

---

## 5. After Stage 3

Stage 2 (production hardening) becomes the next workstream and now has more product to wrap: auth, DB, image hosting, rate-limiting, analytics, Sentry, CI, accessibility audit, and editorial-CMS for the Content tab. Stage 3 explicitly leaves all of these as `TODO` markers in code where relevant; nothing in Stage 3 forecloses on those choices.
