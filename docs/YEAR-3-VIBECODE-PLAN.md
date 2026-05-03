# Year-3 Vibecode Plan — Sous

> **Filed:** 2026-05-03 (Y3 W1, immediately after Y2 close).
> **Coverage:** Y3 W1-W52, twelve sprints + close week.
> **Status at Y3 W1:** 2013 passing tests, 0 RCAs on main across
> 44+ weeks, 11 stub-mode-V1 substrates ready, recon-backfill
> queue 1 of 4 cleared.

---

## 0. Year-2 → Year-3 handoff (1 paragraph)

Y2 closed with the substrate for Y3 in better shape than Y1 closed for Y2 — by a wide margin. Eleven founder-unlock substrates wait for six unique config edits (Clerk + DB + R2 + VAPID + Anthropic + Tavily + Stripe). Six of six behavioural overlays from the Y2 plan landed plus three bonus patterns — all as pure text-formatter helpers with zero new screens. The UX-recon discipline triggered at Y2 W11 carried through to Y2 close with one full surface upgrade landed and three more queued for Y3 W1's polish week. Y3 opens with the polish-backfill clear-out, then pivots to the real-mode wire-up sprint that depends on founder-key delivery, then takes on the larger Stage-3 Content + native-app + voice-MVP-6 workstreams.

## 1. Year-3 thesis

**Y2 was substrate. Y3 is integration + reach.** The pure-helper pipeline + behavioural overlays + recon framework are in place; Y3 takes them off the shelf and into production. Three priorities ranked:

1. **Real-mode wire-up day.** When the founder delivers any single env-var, a slate of features lights up simultaneously. Y3 Sprint B is dedicated to making that wire-up day clean — testing the integrated paths end-to-end, surfacing dashboards, validating the founder-checklist runbooks built across Y2.

2. **Reach beyond web-only.** Y2 stayed in-browser. Y3 Sprint D ships the Capacitor wrappers + connects push to real APNs / FCM bridges. iOS App Store + Google Play submissions in the same sprint window so the back-and-forth review cycles overlap with continued surface work.

3. **Stage-3 Content + creator economy substrate.** Y2 left the Content tab as lean placeholder copy. Y3 Sprints C + L build the substrate for real editorial: schemas for clinician-published research, creator-verified recipes, multi-author attribution. The data layer ships now even if the editorial partnerships land mid-Y3.

Y3 is also where the founder-gated "real" surfaces start landing: ANTHROPIC_API_KEY in early Y3 unlocks four LLM-backed Y2 surfaces simultaneously. Y3 must absorb that gracefully without breaking the four-gate streak.

## 2. Founder-unlock dependencies (act on these in parallel)

Same shape as the Y2 plan — list every founder-action waiting and its impact when it lands. Y3 inherits Y2's full unlock contract; this section is the tracking dashboard.

| #   | Slot                     | Y2 substrate ref | Founder action                            | Lights up                                            |
| --- | ------------------------ | ---------------- | ----------------------------------------- | ---------------------------------------------------- |
| 1   | Clerk auth               | Y2 W1            | `CLERK_SECRET_KEY`                        | Real auth + cross-device + PodMember persistence     |
| 2   | Postgres                 | Y2 W2            | `DATABASE_URL` + `pnpm db:push`           | All 8 Y2 tables migrate + V3 retune data accumulates |
| 3   | R2 photo storage         | Y2 W3+W4         | 4 R2 env vars                             | Pod gallery photos persist + cross-device            |
| 4   | V3 trainer real-mode     | Y2 W6-W10        | retune + flag flip                        | Per-dim trainer in production                        |
| 5   | Push notifications       | Y2 W20           | VAPID keys                                | OS-level push for the W21 scheduler                  |
| 6   | Voice conversational LLM | Y2 W28           | `ANTHROPIC_API_KEY`                       | 4 LLM-backed surfaces simultaneously                 |
| 7   | Voice-to-draft pipe      | Y2 W31-W33       | `ANTHROPIC_API_KEY`                       | (shared with #6)                                     |
| 8   | Pod agentic recipe pick  | Y2 W35           | `ANTHROPIC_API_KEY`                       | (shared with #6)                                     |
| 9   | Agentic web search       | Y2 W39           | `TAVILY_API_KEY` (or Brave / SerpAPI)     | Viral chip surfacing                                 |
| 10  | Viral recipe extraction  | Y2 W41           | `ANTHROPIC_API_KEY`                       | (shared with #6)                                     |
| 11  | Charity Stripe charges   | Y2 W49           | `STRIPE_SECRET_KEY` + verified nonprofits | Real bake-sale charges                               |
| 12  | Native app distribution  | Y3 W14 (planned) | Apple Developer + Play Console accounts   | iOS / Android wrappers                               |
| 13  | APNs / FCM bridges       | Y3 W15 (planned) | APNs auth-key + FCM sender ID             | Real OS-level push (vs in-app toast)                 |
| 14  | Editorial partnership    | Y3 W9-W11        | Clinician + creator outreach + agreements | Real Stage-3 Content tab editorial                   |

Y3-only additions (#12-#14) all founder-gated; Y3 substrate ships alongside.

## 3. Cross-cutting workstreams

### 3.1 Polish-week backfill (W1-W4)

The 3 remaining recon-backfill items from Y2 close, plus opportunistic wins:

- **W1 (in flight):** Cuisine fluency grid landed (`/path/cuisines`). Pattern #2 + #10. **Done.**
- **W2:** Pod gallery made-it ring wire-up. Pattern #10 — uses the Y3-W1 `MadeItRing` component on existing pod-home gallery cards.
- **W3:** Search results page (when agentic search activates). Pattern #2 + #9 — eyebrow caps + filter chip row.
- **W4:** Bake-sale recipe cards. Pattern #1 + #4 — hero card layout + save corner.

After W4, all 4 Y2 backfill items cleared. The framework's "1 surface upgrade per sprint" cadence resumes from Sprint B onward.

### 3.2 Real-mode wire-up day testing (W5-W8 Sprint B)

Sprint B is Y3's most integration-heavy sprint. The plan:

- **W5:** ANTHROPIC_API_KEY end-to-end test — once the key lands, confirm voice conversation + voice-to-draft + Pod agentic pick + viral extractor all fire correctly with the real LLM. Cost-tracking dashboard. Rate-limit handling.
- **W6:** STRIPE_SECRET_KEY end-to-end test — verified nonprofit + real charge + webhook reception + idempotency reattempt + refund path.
- **W7:** Postgres migration + schema-validator test — `pnpm db:push` against a real database + verify every Y2 schema table parses + indexes are in place + foreign-key constraints behave.
- **W8:** R2 + VAPID + Tavily + Clerk integration day. Each lights up the surface it powers; Sprint B closes with all 11 substrates flipped to real mode (or stub if the founder-key isn't ready yet).

### 3.3 Behavioural overlay continuation (continuous)

Y2 shipped 6 of 6 plus 3 bonus. Y3 doesn't add NEW overlays from a fresh research base; instead it tunes the 9 existing ones based on real-cohort signal. Specifically:

- **Implementation intentions** copy variants per cuisine / time-of-day.
- **Streak forgiveness** sensitivity tuning (when to fire vs not).
- **Peak-end** thresholds (5-point window may be too narrow / wide once we have variance data).

A/B test infrastructure ships as a Y3 H1 cross-cut — see 3.5 below.

### 3.4 Per-week 3-loop recursive testing (continuous)

Y2's pattern carries forward unchanged. Every per-feature week ends with:

- Loop 1 (stress test) — hostile inputs, persist regression cases.
- Loop 2 (RCA) — root-cause + fix in same commit if anything caught.
- Loop 3 (improvement) — one ergonomic / readability / a11y improvement adjacent to the week's work.

Y3 close target: **0 RCAs on main across full Y3** — extending the 44-week streak to 96 weeks.

### 3.5 A/B testing substrate (Sprint A — W4 stretch goal)

Behavioural overlay tuning needs A/B infrastructure. Y3 W4 ships a small substrate:

- `src/lib/experiment/assignment.ts` — pure helper for stable user-bucketing (hash-mod on userId + experiment key).
- `src/lib/experiment/track.ts` — per-event logger (stub mode: console; real mode: PostHog or similar).
- 16 tests covering bucket determinism + bucket distribution + opt-out.

### 3.6 Bi-weekly IDEO reviews (Stefan's directive carried forward)

26 IDEOs across Y3 (same cadence as Y2). Each fortnight checks:

- No score-≥-4 surface regressed
- RCAs across the 2-week window (target zero)
- Recon-backfill progress
- Founder-unlock onboarding ramp (which keys landed when, what surfaces lit up)

### 3.7 UX reconnaissance discipline (continuous)

Y2 W11 framework continues unchanged. Y3 carries the 12-pattern library + per-sprint mapping + IP-clean rule + acceptance contract. New patterns observed across Y3 → new entries in `docs/UX-RECON-FRAMEWORK.md`.

### 3.8 Library-research refresh (quarterly)

Y3 W13 / W26 / W39 / W52. Re-run searches for any queued category in `docs/LIBRARY-RECOMMENDATIONS.md` master pick table. Update adoption decisions.

### 3.9 Stanford content acquisition (continuous)

Y1 + Y2 cadence carries forward. 1-2 hours/week of content discovery + distillation. 30+ new items across Y3.

---

## 4. Sprint structure overview

12 sprints + close week. Each sprint 4-5 weeks; Sprint B (real-mode wire-up) widened to 4 weeks because of the integration-test breadth.

| Sprint | Weeks   | Theme                                     |
| ------ | ------- | ----------------------------------------- |
| A      | W1-W4   | Polish-backfill clear-out + A/B substrate |
| B      | W5-W8   | Real-mode wire-up sprint                  |
| C      | W9-W12  | Stage-3 Content editorial substrate       |
| D      | W13-W16 | iOS / Android Capacitor wrappers          |
| E      | W17-W20 | V3 trainer retune + V4 design             |
| F      | W21-W24 | Voice cook MVP 6 (video loops)            |
| G      | W25-W28 | Bilingual / multi-language UX             |
| H      | W29-W32 | Pod V3 multi-pod membership               |
| I      | W33-W36 | Recipe import V2 (any URL → draft)        |
| J      | W37-W40 | Charity bake-sale events surface          |
| K      | W41-W44 | Skill-tree depth (regional + technique)   |
| L      | W45-W48 | Annual recap + creator economy substrate  |
| —      | W49-W52 | Year-3 close + Y4 plan kickoff            |

---

## 5. Sprint A (W1-W4) — Polish-backfill clear-out + A/B substrate

> Sprint A is intentionally smaller than the surrounding Y3
> sprints. The goal is to land the 4 recon-backfill items
> opportunistically before Sprint B's wire-up sprint absorbs
> all the attention.

### W1 — Cuisine fluency grid (in flight, landing today)

- Surface: `/path/cuisines` with the new `MadeItRing` component + cuisine-stats helpers + W44 vocabulary catalog cuisines.
- Patterns landed: #2 + #10.
- 25 tests.

### W2 — Pod gallery made-it ring wire-up

- Surface: `src/components/community/pod-home-content.tsx`.
- Each member tile in the gallery gains a `MadeItRing` showing cooks-this-week against the pod's `cooksPerWeek` target.
- Replaces the existing photo thumbnail at the top-right corner of each tile — ring becomes the affordance for "this member is on track".
- Tests: 12 — Pod gallery snapshot rendering + ring count math.

### W3 — Search results page

- Activates only when `TAVILY_API_KEY` is set (or stub mode for testing).
- New surface: `/today/search` (popped from a search-overlay on Today).
- Filter chip row at top (cuisine / cook-time / dietary), eyebrow-cased category labels per result.
- Patterns landed: #2 + #9.
- Tests: 18 — chip toggle state, result list rendering, empty-state copy.

### W4 — Bake-sale recipe cards + A/B substrate

- Surface: bake-sale-mode flag on pod home reveals a curated recipe carousel; each card uses the hero-card pattern (large image + eyebrow + meta strip + save corner).
- Patterns landed: #1 + #4.
- A/B substrate: pure helpers for user-bucketing + event tracking. Stub mode (console) ships; real-mode wire to PostHog (or similar) is W5 founder-unlock-day work.
- Tests: 14 (cards) + 16 (A/B) = 30.

**Sprint A close:** all 4 Y2 recon-backfill items cleared + A/B infra ready.
**Cumulative tests:** 2013 + 25 + 12 + 18 + 14 + 16 ≈ **2098**.

---

## 6. Sprint B (W5-W8) — Real-mode wire-up sprint

> The most integration-heavy sprint of Y3. Each week tests one
> founder-unlock end-to-end. If a key isn't ready, that week's
> integration-test scaffolding stays in stub mode + the
> wire-up day shifts to whenever the key lands.

### W5 — ANTHROPIC_API_KEY end-to-end

- 4 LLM-backed surfaces light up: voice conversation (W28), voice-to-draft (W32), Pod agentic pick (W35), viral extractor (W41).
- Cost dashboard: `src/app/api/_internal/anthropic-spend/route.ts` reads daily Anthropic billing API + surfaces a quiet ops view.
- Rate-limit handling: per-user concurrent-request cap + exponential backoff on 429s.
- Tests: 22 — each of the 4 surfaces with mock-fetch + integration test against a sandbox key (skipped when key absent).

### W6 — STRIPE_SECRET_KEY end-to-end

- Real charge → webhook → status transition → idempotency reattempt path.
- Webhook handler: `src/app/api/charity/webhook/route.ts`.
- Refund path: admin-only API to reverse a charge (founder-gated by additional admin-token).
- Tests: 18.

### W7 — Postgres migration + schema-validator

- `pnpm db:push` against a real Neon DB.
- Boot-time validator: every Drizzle table's TypeScript shape matches its Zod schema (extension of the W2 parity tests but at runtime).
- All 8 Y2 tables + the new Y3 ones migrate.
- Tests: 14.

### W8 — R2 + VAPID + Tavily + Clerk

- One-day-per-key wire-up: each goes from stub to real mode + verifies the surfaces it powers.
- Sprint B close.
- Tests: 12.

**Sprint B close:** all 11 Y2 substrates + Y3 W4 A/B substrate flipped to real mode (modulo founder-key timing).
**Cumulative tests:** 2098 + 22 + 18 + 14 + 12 ≈ **2164**.

---

## 7. Sprint C (W9-W12) — Stage-3 Content editorial substrate

> Y2 left Content as lean placeholder copy. Sprint C builds the
> editorial workstream substrate. Real partnerships (clinicians,
> creators) are founder-gated; substrate-first lets editorial
> work onboard without engineering blocking.

### W9 — Author + verified-credential schema

- Schema add: `Author` (clinicianTitle, affiliation, EIN-shaped license #, profile URL, photo).
- Schema add: `EditorialContent` (bound to one or more Authors, contentType: research | recipe | column | guide).
- Tests: 18.

### W10 — Per-author content listing

- Surface: `/community/author/[id]` lists all content by author with verification badge.
- Tests: 14.

### W11 — Editorial workflow tooling

- Founder-only admin surface for staging + publishing editorial content with the verification chain.
- Tests: 16.

### W12 — Sprint C close + IDEOs

- Cumulative: 2164 + 18 + 14 + 16 ≈ **2212**.

---

## 8. Sprint D (W13-W16) — iOS / Android Capacitor wrappers

> Y2 was web-only. Y3 reaches mobile via Capacitor. This sprint
> is heavy on platform-specific config; substrate-first so the
> platform-specific bits aren't in the critical path of the
> shared web/mobile codebase.

### W13 — Capacitor scaffolding

- `pnpm add @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`.
- `npx cap init Sous io.sous.app`.
- Verify `next build && next export` produces a static-ish bundle that Capacitor can wrap (or pivot to per-platform config tweaks).

### W14 — iOS-specific surfaces

- Apple Developer account + provisioning + first TestFlight build.
- iOS-specific affordances: respect safe-area insets, native back-gesture support.

### W15 — Android-specific surfaces

- Play Console + signing key + first internal-track build.
- Android-specific: back-button handling, NFC stub for tap-to-share recipes.

### W16 — Sprint D close

- Cumulative: 2212 + ~20 = **2232**.

---

## 9. Sprint E (W17-W20) — V3 trainer retune + V4 design

> Y2 W9 eval showed V3 underperformed V2 by 4.5pp on synthetic
> data. By Y3 W17, real-cohort breakdown data has accumulated
> (Postgres-backed since Sprint B). Re-run the eval; tune; flip.

### W17 — Real-cohort eval re-run

- `runV3Eval` against actual user breakdowns from the past N months.
- Compare pre vs post hyperparameter tuning.

### W18 — V3 hyperparameter tune

- Adjust `V3_MAX_DELTA`, `V3_NOISE_FLOOR`, `V3_COLD_START_THRESHOLD` based on real-data variance.

### W19 — V4 design — embedding-distance trainer

- Schema + design doc for V4: per-side embedding from the LLM-extracted features → cosine-distance to user's accepted-cook centroid.

### W20 — Sprint E close

---

## 10. Sprint F (W21-W24) — Voice cook MVP 6 (video loops)

> The W23-W25 sequenced pointers were MVP 5. MVP 6 swaps the
> static image+pointer for short looping video clips per step.

### W21 — Video clip schema delta

- `GuidedCookStep.videoClip?: { src, durationSec, posterFrame }`.
- Backwards-compatible: steps without clips fall back to image+pointer.

### W22 — Video player component

- `<StepVideoLoop>` with reduced-motion gate, lazy-load via IntersectionObserver, mute-by-default.

### W23 — Asset pipeline

- Client-side video → upload to R2 + transcode (server-side ffmpeg or Mux integration).

### W24 — Sprint F close

---

## 11. Sprint G (W25-W28) — Bilingual / multi-language UX

> Y3 expansion target: Spanish + Hindi as second-language
> surfaces. The cuisine-vocabulary catalog already has
> regionalNames data — Sprint G makes that the bilingual seed.

### W25 — i18n substrate

- Translation key extraction from existing UI strings.
- `src/lib/i18n/dictionary.ts` keyed by (locale, key) → translated string.

### W26 — Spanish translation

- ~600 strings translated (founder-unlock: real translator hire).

### W27 — Hindi translation

- ~600 strings translated.

### W28 — Sprint G close

---

## 12. Sprint H (W29-W32) — Pod V3 multi-pod membership

### W29 — Schema delta

- A user can belong to multiple pods. Schema extension on PodMember to support per-(user, pod) preferences.

### W30 — Pod switcher UI

- Top-of-page pod-selector dropdown.

### W31 — Per-pod settings divergence

- Each pod has independent settings (challenge cadence, nonprofit, dietary union, etc).

### W32 — Sprint H close

---

## 13. Sprint I (W33-W36) — Recipe import V2 (any URL → draft)

### W33 — Universal-URL extractor

- Real-mode (post-Sprint B) Anthropic call against any URL → RecipeDraft.

### W34 — Attribution + ethics gate

- Same shape as Y2 W42 — source URL + creator credit + "View original" affordance always required.

### W35 — Import surface

- `/path/recipes/import` — paste URL, see preview, confirm + save.

### W36 — Sprint I close

---

## 14. Sprint J (W37-W40) — Charity bake-sale events surface

### W37 — Bake-sale calendar event

- Pod admin schedules a bake-sale (date + time + location).
- Surface on `/community/pod` with calendar-add affordance.

### W38 — Reminder notifications

- Push (or in-app toast in stub mode) at -7d, -1d, day-of.

### W39 — Post-event reflection card persistence

- Y2 W51 substrate's `formatReflectionCard` now writes to Postgres-backed pod history.

### W40 — Sprint J close

---

## 15. Sprint K (W41-W44) — Skill-tree depth

### W41 — Regional sub-cuisine schema

- "italian → southern italian / northern italian / sicilian"; same shape per cuisine. Substrate adds to the W44 vocabulary catalog.

### W42 — Technique skill nodes

- "knife skills → julienne / chiffonade / brunoise" etc.

### W43 — Tree visualisation

- `/path/skills` — visual tree with the W2 made-it ring at each node.

### W44 — Sprint K close

---

## 16. Sprint L (W45-W48) — Annual recap + creator economy substrate

### W45 — "Your 2027 in cooking" recap

- Year-end Spotify-Wrapped-shaped recap: cuisines tried, favourite cook, hours in the kitchen, charity raised, behavioural-overlay-derived "you're a Tuesday-night cook" identity reveal.
- Generated client-side from existing cook history.

### W46 — Creator economy substrate

- Schema for verified creators + their published recipes.
- Revenue-share substrate (Stripe Connect platform → creator subscription tiers).

### W47 — Creator profile surface

- Each creator gets a public profile page surfacing their recipes + bio.

### W48 — Sprint L close

---

## 17. W49-W52 — Year-3 close

- W49: polish + final-week IDEO.
- W50: Y3 retrospective (`docs/YEAR-3-RETROSPECTIVE.md`).
- W51: Y4 plan kickoff (`docs/YEAR-4-VIBECODE-PLAN.md`).
- W52: Year-3 close commit + final-month metrics.

**Test-count target:** ≥ 2400 by end-of-year-3 (Y2 closed at 1988; Y3 adds ~400+).

---

## 18. Cross-feature dependency graph (Y2 + Y3)

| Sprint dep       | Required by                                 | Why                                                |
| ---------------- | ------------------------------------------- | -------------------------------------------------- |
| Y2 A (auth)      | Y3 H (multi-pod), Y3 I (creator publish)    | Stable user identity across pods + creator linkage |
| Y2 A (Postgres)  | Y3 E (V3 retune), Y3 J (event persistence)  | Real-cohort data + persistent event records        |
| Y3 B (real-mode) | Y3 C (editorial), Y3 I (recipe import V2)   | Anthropic for content + URL extraction             |
| Y3 D (Capacitor) | Y3 F (video loops mobile)                   | Native video performance on iOS/Android            |
| Y3 G (i18n)      | Y3 K (cuisine depth international audience) | Translated regional sub-cuisine names              |

---

## 19. What this plan deliberately does NOT cover

The plan is deliberately bounded. Out-of-scope for Y3:

- **Real-time multiplayer cook flow** — too speculative; postpone to Y4 or later.
- **Image-generation pipeline integration** — handled by a separate workstream per CLAUDE.md rule 7 ("Do NOT generate new images — that is handled by a separate AI pipeline").
- **Hardware integrations** (smart kitchen scales, sous-vide controllers) — Y4+.
- **Offline-first cook mode** — partial via service worker but not a Y3 priority.

These appear in `docs/Y3-OUT-OF-SCOPE.md` for the founder's reference.

---

## 20. Acceptance for Y3 plan

- [x] Y2 → Y3 handoff documented.
- [x] Y3 thesis stated.
- [x] Founder-unlock dependencies enumerated.
- [x] Cross-cutting workstreams continued + new ones added.
- [x] 12 sprints + close week scoped.
- [x] Cross-feature dependency graph drawn.
- [x] Out-of-scope explicitly listed.

The plan is ready for execution starting Y3 W2 (W1 cuisine grid landed today as part of polish-backfill clear-out).
