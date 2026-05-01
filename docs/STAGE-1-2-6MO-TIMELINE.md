# Stage 1 + 2 — 6-Month Vibe-Coded Timeline (Pre-Production)

> **Authored:** 2026-05-01
> **Window:** 2026-05-04 (Week 1, Mon) → 2026-10-30 (Week 26, Fri). Six calendar months, 26 working weeks.
> **Reads from:** [`PARENT-MODE-RESEARCH.md`](./PARENT-MODE-RESEARCH.md), [`PARENT-MODE-PLAN.md`](./PARENT-MODE-PLAN.md), [`STAGE-3-LEAN-CONTENT.md`](./STAGE-3-LEAN-CONTENT.md), [`ROADMAP.md`](../ROADMAP.md)
> **Karpathy guard:** Each week states a single deliverable, the prerequisites it depends on, and a verifiable acceptance line. No speculative work. If a week is blocked, we re-plan rather than spin.
> **Convention:** "DOD" = Definition of Done. Every week ends with `pnpm lint && pnpm test && pnpm build` clean and a commit on main.

---

## 0. Where we start (state of repo at week 0)

- **Stage 1 prototype**: COMPLETE (Today + Path tabs + full guided cook + 222 unit tests + 14 E2E tests, see [`ROADMAP.md`](../ROADMAP.md)).
- **Stage 0.5–0.9 sprints**: COMPLETE (NEXT-20A through NEXT-20D, intuition + decluttering + memory + habit/trust/polish).
- **Stage 3 Content tab**: COMPLETE (lean vibe-coded magazine surface; Today · Path · Content always visible).
- **Stage 2 production hardening**: NOT STARTED (Clerk, Neon, R2, Sentry, Redis, PWA, i18n).
- **Parent Mode**: NOT STARTED (research + plan complete; implementation begins this timeline).

The 6 months ahead = Parent Mode + production hardening + a small reserve of polish/buffer for the inevitable surprise.

---

## 1. The four phases

```
Month 1–2  ┐
           ├─ Phase A: Foundation (data, profile, scoring primitives)
Weeks 1–8  ┘

Month 3    ┐
           ├─ Phase B: Parent Mode UX (the visible features)
Weeks 9–12 ┘

Month 4    ┐
           ├─ Phase C: Production hardening — auth, DB, infra, perf
Weeks 13–18┘

Month 5    ┐
           ├─ Phase D: Polish + content + closed beta + legal review
Weeks 19–24┘

Month 6    ┐
           ├─ Phase E: Launch prep + reserve buffer
Weeks 25–26┘
```

**Why this order?** The research → data → scoring → UX → infra → polish chain matches the Karpathy "verifiable goals" model: each phase makes the next phase safe. We build the kid-friendliness scoring primitives first because the UX work is meaningless without them. We delay auth/DB until after the user-facing feature lands so we can validate UX with localStorage before paying the production tax.

**Parallelism note:** Phases A & C have parallelizable strands. Where this matters, the week notes flag it.

---

## 2. Phase A — Foundation (Weeks 1–8)

> Goal: have all data, scoring, and profile primitives in place so Phase B can be pure UX.

### Week 1 (May 4–8) — Kick-off + nutrition data decision

- **Deliverable:** A signed-off resolution to research §7 question 1 (build vs. buy nutrition data) and a written ADR in `docs/adr/0001-nutrition-data-source.md`.
- **Activities:**
  - Re-read all three planning docs as a team.
  - Spike: import 5 representative recipes from `meals.json` against USDA FoodData Central. Time the per-recipe mapping. Spike Edamam + Spoonacular trial APIs alongside.
  - Decide. Document the decision and tradeoffs.
- **Prereq:** None.
- **DOD:** ADR committed, decision is binding for Phase A.

### Week 2 (May 11–15) — Nutrition schema + DRI/DV tables

- **Deliverable:** `src/types/nutrition.ts`, `src/data/nutrition/dri-pediatric.ts`, `src/data/nutrition/fda-dv.ts`, `src/data/nutrition/claim-thresholds.ts` shipped + 100% covered by unit tests.
- **Activities:**
  - Encode the 11 priority nutrients from research §3.2 into a typed table.
  - Encode the FDA Daily Values (children 4+) per research §3.3.
  - Encode the threshold lookup (high-in / good-source / low-in).
  - Write a `computeNutrientClaim(perServing, nutrient): ClaimTier` pure function with vitest cases for boundary conditions.
- **Prereq:** Week 1 ADR.
- **DOD:** Tables + threshold function + 12+ vitest tests green.

### Week 3 (May 18–22) — Per-recipe nutrition population (wave 1)

- **Deliverable:** Per-serving nutrition data attached to the top-30 quest-card-eligible meals in `meals.json` (or a sibling `nutrition.json` keyed by slug).
- **Activities:**
  - Run the chosen pipeline (USDA mapping or API ingest) over 30 meals.
  - Spot-check against published nutrition labels for 5 known dishes.
  - Add a `nutrition-coverage.test.ts` that fails the build if a quest-eligible meal lacks nutrition data once `nutritionRequired: true` flag flips.
- **Prereq:** Week 2 schema.
- **DOD:** 30 meals have nutrition; coverage test green; sample comparisons within ±15 % of label.

### Week 4 (May 25–29) — Safe phrasings + nutrient spotlight engine

- **Deliverable:** `src/data/nutrition/safe-phrasings.ts` + `src/lib/engine/parent-mode/nutrient-spotlight.ts` shipped + tested.
- **Activities:**
  - Encode the 12 SAFE phrasings from research §4.4 as templates keyed by (nutrient, claim tier).
  - Add the verbatim FDA-authorized health claims to a separate `verbatim-health-claims.ts` (use only when explicitly opted into).
  - Build `pickSpotlight(perServing, ageBand): NutrientFlag | null` that returns the single best nutrient call-out by priority, or `null` if none qualify.
  - Vitest: cover all 11 nutrients × all 3 claim tiers + the null path.
- **Prereq:** Week 2 thresholds, week 3 nutrition data.
- **DOD:** 33+ vitest tests green; manual sweep confirms no UNSAFE phrasing slips through.

### Week 5 (June 1–5) — Kid-friendliness label schema + first labels (wave 1)

- **Deliverable:** `src/types/parent-mode.ts` + `src/data/meals/kid-friendliness/labels.json` populated for the top-30 quest-eligible meals using the 8-field schema from research §2.4.
- **Activities:**
  - Encode the schema (8 fields per meal).
  - Hand-label 30 meals (~30 sec/meal × 30 = 15 min, plus team review).
  - Use 3 internal labelers and reconcile disagreements; document the rubric so future labels are consistent.
- **Prereq:** Week 4 (parallel-safe).
- **DOD:** 30 labels committed; inter-labeler agreement κ ≥ 0.7 on a 5-meal pilot.

### Week 6 (June 8–12) — Kid-friendliness scorer + rebalancer

- **Deliverable:** `src/lib/engine/scorers/kid-friendliness.ts` (7th scorer) + `src/lib/engine/parent-mode/rebalance.ts` shipped + tested.
- **Activities:**
  - Implement the scorer using the formula in research §2.4 with default weights.
  - Slot it into the existing 6-scorer pipeline behind an `enableKidFriendliness` flag (off by default).
  - Tune weights against the 30 hand-labeled meals: top-12 ranked by score should pass an internal "everyone ate it" sanity check.
  - 8+ vitest cases covering boundary scores, missing labels (graceful degradation), and rebalancer arithmetic.
- **Prereq:** Weeks 3, 5.
- **DOD:** Scorer + rebalancer green; manual ranking review aligns with intuition on the 30-meal set.

### Week 7 (June 15–19) — `useParentMode` hook + coach-quiz integration

- **Deliverable:** `src/lib/hooks/use-parent-mode.ts` + an extended coach quiz capturing "Who's at the table?" + age band.
- **Activities:**
  - Hook with localStorage persistence, version-keyed.
  - Coach quiz extension reuses the existing this-or-that pattern; one new question + one optional follow-up. No new screen.
  - Vitest: hook initialization, toggle persistence, age-band default to `4-8` when skipped, version-key migration.
- **Prereq:** None (parallel-safe with weeks 5–6).
- **DOD:** Hook + quiz extension live; 6+ vitest tests green; coach quiz still completes in ≤ 5 questions.

### Week 8 (June 22–26) — `useSpiceTolerance` + `useKidsAteIt` + `useExposureLog`

- **Deliverable:** All three hooks shipped + tested. Plumbing only — no UI yet.
- **Activities:**
  - `useSpiceTolerance`: 1–5 household default in localStorage.
  - `useKidsAteIt`: append-only log per cook session; query helpers for "recent yesses by attribute cluster" used by rebalancer.
  - `useExposureLog`: per-ingredient counter; 4–6-exposure threshold flag.
  - Wire `useKidsAteIt` into rebalancer as a second-order signal (boost dishes whose attribute clusters recently scored "Yes").
- **Prereq:** Week 6 rebalancer.
- **DOD:** 18+ vitest tests across the three hooks; no visible UI yet.

> **End-of-Phase-A gate:** All Phase B UX tasks have working backends. We are now safe to add visible product surface.

---

## 3. Phase B — Parent Mode UX (Weeks 9–12)

> Goal: ship the user-visible Parent Mode in 4 weeks. One surface per week.

### Week 9 (June 29 – July 3) — Toggle chip + QuestCard kid hint

- **Deliverable:** `parent-toggle-chip.tsx` near the Today header + `kid-friendly-hint.tsx` ambient line on QuestCards.
- **Activities:**
  - Toggle UI matches existing Today header chip patterns.
  - Hint line renders only when `kidScore ≥ 0.65`; copy passes the SAFE cheatsheet.
  - Hidden when Parent Mode is off — zero footprint for non-parent users.
  - Snapshot test on Today page render with PM on/off.
- **Prereq:** Weeks 6, 7.
- **DOD:** Toggle works end-to-end; hint shows on hand-picked dishes; 375×667 audit clean.

### Week 10 (July 6–10) — Spice slider + component split toggle

- **Deliverable:** `spice-slider.tsx` inline on heat-bearing steps + `component-split-toggle.tsx` on `deconstructable: true` final-assembly steps.
- **Activities:**
  - Spice slider: deterministic find-replace transform on chili amounts in step text. Tested across 10 recipes.
  - Component split: branches the final step into 2-column adult/kid layout; both fit on 375×667.
  - Both wired to localStorage household defaults via `useSpiceTolerance`.
- **Prereq:** Week 8 hook.
- **DOD:** Both surfaces functional in guided cook; visual regression on 5 representative recipes.

### Week 11 (July 13–17) — Make-it-kid-friendly chip + AI swap suggestor

- **Deliverable:** `kid-swap-chip.tsx` on QuestCards + `ai.suggestKidSwaps` endpoint + deterministic-first lookup.
- **Activities:**
  - Build the deterministic swap lookup table covering the 60 labeled meals.
  - Wire the AI fallback through the existing AI provider abstraction with mock-provider deterministic responses.
  - Bottom sheet UI for the 2–3 swap chips; tap to apply (writes to recipe overlay).
  - Latency budget: deterministic ≤ 100 ms, AI fallback ≤ 2.5 s p95.
- **Prereq:** Week 5 labels, week 6 scorer.
- **DOD:** Chip works on 60-meal set; 3+ vitest cases on the lookup; manual smoke on 10 dishes.

### Week 12 (July 20–24) — Win screen kids-ate-it + lunchbox + nutrient spotlight + Content parent track

- **Deliverable:** `kids-ate-it-prompt.tsx`, `lunchbox-suggest-chip.tsx`, `nutrient-spotlight-line.tsx`, `nutrient-info-tooltip.tsx`, `content/parent-track.tsx` all live.
- **Activities:**
  - Win screen: kids-ate-it 2-tap, lunchbox chip with bottom sheet copy.
  - Nutrient spotlight: line renders only when a nutrient qualifies; tooltip carries source attribution + standard disclaimer.
  - Content tab: additive `audience: 'parent' | 'general'` tag on existing items + ranking pass when PM on.
  - **End-of-week internal demo to 5 parents.** Capture qualitative feedback and a SUS-style score.
- **Prereq:** Weeks 4, 8, plus existing Stage-3 Content infrastructure.
- **DOD:** All five components live; demo conducted; SUS ≥ 70.

> **End-of-Phase-B gate:** Parent Mode V1 is fully usable on a localStorage prototype. We pause user-facing work and turn to production hardening.

---

## 4. Phase C — Production hardening (Weeks 13–18)

> Goal: make Stage 2 real. Auth, DB, image hosting, monitoring, performance, security. The Parent Mode work is now de-risked product-wise; we wrap it with infra without changing the UX.

### Week 13 (July 27–31) — Clerk auth enforcement + middleware

- **Deliverable:** Clerk fully enforced on all mutation tRPC endpoints; middleware live; localStorage profile migrates on first login.
- **Activities:**
  - Flip `publicProcedure` → `protectedProcedure` on every mutation.
  - Build "Import your history" flow that copies localStorage cook sessions + Parent Mode profile to a Clerk user on first sign-in.
  - Reuse coach-quiz onboarding so the auth wall is felt-once, not every-session.
  - Smoke-test full cook loop with auth on.
- **Prereq:** Stage-2 readme already lists this as an unchecked item.
- **DOD:** Auth on; lint/test/build green; manual sign-up + cook loop working.

### Week 14 (August 3–7) — Neon Postgres + Drizzle migration

- **Deliverable:** Neon DB provisioned, Drizzle schema pushed, server-backed cook sessions live.
- **Activities:**
  - `pnpm db:push` against Neon. Verify all 7 existing tables.
  - Add three new tables: `parent_profile`, `kid_friendliness_label`, `kids_ate_it_log`.
  - Replace localStorage cook sessions with server-backed write-through (localStorage stays as optimistic cache).
  - Backfill seed data: `pnpm db:seed`.
  - Add `journey.recent`, `journey.stats`, `coach.quiz`, `coach.vibePrompt`, `content.getSideDish`, `content.search` to the tRPC router (currently stubbed).
- **Prereq:** Week 13 auth.
- **DOD:** DB live; cook sessions persist server-side; journey endpoints hit DB; existing UI unchanged.

### Week 15 (August 10–14) — Cloudflare R2 image pipeline

- **Deliverable:** R2 bucket live, food-images served via Next.js `<Image>` with R2 URLs, win-screen photo upload pipeline working.
- **Activities:**
  - Provision R2 bucket + CDN distribution.
  - Migrate `/public/food_images/*.png` → R2 with original filenames preserved. Update image refs in code via a `R2_BASE_URL` env var.
  - Build the win-screen photo upload route (currently uses local blob URL).
  - Add per-image blur placeholders.
- **Prereq:** Week 13 auth (for upload signing).
- **DOD:** R2 serving images; LCP improvement measurable on Today; upload roundtrip works.

### Week 16 (August 17–21) — Upstash Redis: rate limiting + caching

- **Deliverable:** Redis live, AI endpoints rate-limited per user, pairing results cached.
- **Activities:**
  - Provision Upstash Redis.
  - Rate-limit `recognition.identify`, `pairing.suggest`, `ai.suggestKidSwaps`, `ai.askCookQuestion` with sensible per-user buckets.
  - Cache pairing results per main-dish slug for 24 h.
  - Cache food-recognition results by image hash for 7 d.
- **Prereq:** Week 13 auth.
- **DOD:** Redis live; 429 responses on burst tests; cache hit-rate visible in logs.

### Week 17 (August 24–28) — Sentry + Vercel Analytics + funnels

- **Deliverable:** Sentry capturing client + server errors with source maps; Vercel Analytics expanded with real funnel events.
- **Activities:**
  - Sentry init for client + server; alert rules on AI failures, pairing engine errors, DB query failures.
  - Replace stub events in `src/lib/analytics.ts` with real ones: search submitted, pairing viewed, cook started, cook completed, kids-ate-it logged, parent-mode toggled.
  - Build a "Parent Mode funnel" view: toggle-on → first cook → first kids-ate-it → 4th cook (week-2 retention proxy).
- **Prereq:** Weeks 13–14.
- **DOD:** Sentry receiving events; analytics dashboard set up; funnel visible.

### Week 18 (August 31 – September 4) — Performance pass + Lighthouse + bundle audit

- **Deliverable:** Lighthouse mobile ≥ 90 on Today, Path, Content, Cook routes.
- **Activities:**
  - Tree-shake Framer Motion (reduce-motion paths already exist, prune dead variants).
  - Lazy-load pairing engine + nutrition data files behind dynamic imports.
  - Bundle audit; trim to ≤ 150 KB initial gzipped per `planning.md` target.
  - Add ISR or edge caching to `pairing.suggest`.
  - Lighthouse CI in GitHub Actions for PRs touching Today / Cook / Content.
- **Prereq:** Weeks 14–17.
- **DOD:** Lighthouse ≥ 90 on the 4 key routes; CI gate live.

> **End-of-Phase-C gate:** Production infra is real. We can take real users.

---

## 5. Phase D — Polish + content + closed beta + legal review (Weeks 19–24)

> Goal: turn the working product into a launchable one. Real content, real legal review, real user feedback.

### Week 19 (September 7–11) — Content tab editorial wave 1 (parent-relevant)

- **Deliverable:** Stage-3 Content tab gets 6 new parent-tagged articles, 4 new parent-tagged reels, 3 parent-tagged research briefs. All clearly attributed (still placeholder authors unless an editorial partner has signed).
- **Activities:**
  - Author drafts in `src/data/content/articles.ts` etc. (or migrate to a CMS if Phase B time saved permits).
  - Topics from research §2 and §3: "How to introduce bitter greens (4–6 exposures)," "What 'good source of calcium' actually means," "The build-your-own dinner that pleases everyone," etc.
  - All copy passes the SAFE phrasings cheatsheet.
- **Prereq:** Stage-3 infrastructure.
- **DOD:** 13 new content items live with `audience: 'parent'` tag; Content parent track shows them when PM on.

### Week 20 (September 14–18) — Kid-friendliness label expansion (wave 2)

- **Deliverable:** Kid-friendliness labels expanded from 30 → all quest-eligible meals (~75–90).
- **Activities:**
  - Internal labeling sprint with rubric established in Week 5.
  - Spot-check the 30 original labels for drift; update rubric.
  - Audit scorer ranking on the full set; tune weights if needed.
- **Prereq:** Week 5 schema.
- **DOD:** All quest-eligible meals labeled; coverage test passes; ranking sanity-checked.

### Week 21 (September 21–25) — Closed beta cohort 1 (10 households)

- **Deliverable:** 10 invited families using Sous with Parent Mode for ≥ 7 days.
- **Activities:**
  - Recruit via founder networks (CLAUDE.md bulletproof: ship the complete thing, including users).
  - Distribute via Vercel preview URL + Clerk invite-only.
  - Daily Slack/email check-ins; 1 structured interview at end of week.
  - Capture: cooks-completed, kids-ate-it Yes/No ratio, retention day-7, qualitative friction.
- **Prereq:** Phase C complete.
- **DOD:** Cohort 1 done; report written in `docs/beta-cohort-1.md` with prioritized fix list.

### Week 22 (September 28 – October 2) — Beta-driven fixes + accessibility + i18n scaffolding

- **Deliverable:** Top-5 beta fixes shipped; WCAG 2.1 AA audit passed on core flows; i18n scaffolding (Spanish first locale).
- **Activities:**
  - Fix top-5 beta-cohort-1 friction items.
  - Run WCAG 2.1 AA audit on Today, Cook, Win, Content, Path. Fix any AA-blocking findings.
  - Add `next-intl` (or similar) scaffolding; extract Today + Cook strings; ship Spanish translations.
- **Prereq:** Week 21.
- **DOD:** Beta fixes merged; audit report committed; Spanish locale switchable end-to-end on Today + Cook.

### Week 23 (October 5–9) — Legal review + safe-phrasings audit + disclaimer pass

- **Deliverable:** Food-advertising counsel sign-off on Parent Mode UI strings + disclaimer pattern.
- **Activities:**
  - Engage Keller & Heckman / Covington / Sidley / Olsson Frank Weeda for a 2-hour review.
  - Provide them: the SAFE/UNSAFE cheatsheet, the templated phrasings, the methodology page draft, the standard disclaimer.
  - Apply any redlines.
  - Lock down `safe-phrasings.ts` with a build-time linter that fails the build if a string outside the lock list ships.
- **Prereq:** Week 4 phrasings, Week 22 polish.
- **DOD:** Counsel sign-off in writing; phrasings locked; disclaimer live on every nutrient surface.

### Week 24 (October 12–16) — Closed beta cohort 2 (50 households)

- **Deliverable:** 50 invited families, broader recruiting (still pre-public).
- **Activities:**
  - Open the invite list. Bring in 2–3 RDs for parallel professional review.
  - Larger sample → first quantitative read on success criteria from `PARENT-MODE-PLAN.md` §1.
  - Capture telemetry: kid-friendliness scorer accuracy (4★+ "everyone ate it" rate), cook-twice tax, parent-mode toggle retention, spice-slider engagement.
- **Prereq:** Weeks 21–23.
- **DOD:** Cohort 2 done; quantitative + qualitative report; go/no-go decision for public launch.

> **End-of-Phase-D gate:** Either we go to launch prep with green metrics, OR we extend Phase D for one cycle to fix what's red.

---

## 6. Phase E — Launch prep + buffer (Weeks 25–26)

> Goal: production polish, the genuine final-mile work, and a real reserve for the surprises.

### Week 25 (October 19–23) — Launch hardening + observability + pricing decision

- **Deliverable:** Production launch checklist green; pricing decision documented; landing page ready.
- **Activities:**
  - Sentry alert routing live (PagerDuty / Slack).
  - SLO/SLI definition: p95 latency on `pairing.suggest`, error rate on AI endpoints, kid-friendliness ranking accuracy.
  - Pricing decision: free vs. freemium vs. paid Parent Mode (PARENT-MODE-PLAN §10 deferred this; resolve here).
  - Landing page: rewrite hero copy to feature Parent Mode if launch positioning calls for it.
- **Prereq:** Phase D.
- **DOD:** Launch checklist green; pricing committed; landing copy live.

### Week 26 (October 26–30) — Buffer + final polish + retro

- **Deliverable:** Reserve. Catch up on anything that slipped. Run a Stage 1+2 retrospective.
- **Activities:**
  - Triage residual bug list; fix what's high-impact.
  - Doc sweep: ROADMAP, README, planning docs all reflect actual reality.
  - Retrospective: what went well, what slipped, what would we do differently for Stage 3+.
- **Prereq:** Phase E.
- **DOD:** Retrospective written; on-call rotation set; ready for public soft launch the following Monday.

---

## 7. Risk register + mitigations

| Risk                                                        | Probability | Impact | Mitigation                                                                                                                                                         |
| ----------------------------------------------------------- | ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nutrition data ingest takes 2× longer than estimated        | M           | M      | Weeks 1–3 are sequential because of this. Buffer in Week 26. If still slipping at Week 4, switch from USDA to a paid API.                                          |
| Kid-friendliness ranking accuracy is sub-target             | M           | H      | Cohort 1 (Week 21) is the early-warning signal. If the "everyone ate it" rate is < 50 %, extend Phase D and re-tune scorer weights against the larger labeled set. |
| Legal review surfaces blocking phrasings                    | L           | M      | Week 23 redlines absorbed in Week 23 itself; build-time phrasing linter prevents regressions.                                                                      |
| Clerk migration corrupts localStorage data                  | L           | H      | Build the migration as additive (write-through, not replace) in Week 13. Weekly backups of test localStorage to Neon during Phase C.                               |
| R2 image migration breaks public food images                | L           | M      | Keep `/public/food_images/` as fallback for one release; flip to R2 only after CDN is verified.                                                                    |
| Parent Mode adds visible UI clutter that violates Sous Test | M           | H      | Acceptance criteria in PARENT-MODE-PLAN §8 are the gate. 375×667 audit at every Phase B week's end.                                                                |
| Beta cohort 1 reveals fundamental UX flaw                   | L           | H      | If Week 21 reveals a structural problem, we extend Phase D by 2 weeks and shorten Phase E buffer. Better than launching broken.                                    |
| AI swap suggestor latency unacceptable                      | M           | M      | Deterministic-first lookup covers the 60-meal set; AI is fallback only. Worst case, ship without AI fallback.                                                      |
| Vibe coding fatigue / scope creep                           | H           | M      | Weekly DOD enforced; if a week slips, re-plan rather than spiral. Use the budget in Week 26.                                                                       |

---

## 8. Dependency map (what blocks what)

```
Week 1 (ADR)
   └─ Week 2 (schema)
        └─ Week 3 (data)
             └─ Week 4 (spotlight engine) ──┐
        └─ Week 5 (labels) ──┐               │
             └─ Week 6 (scorer + rebalance) ─┤
                  └─ Week 8 (kid-ate-it/exposure hooks)
                       └─ Week 9 (toggle + hint)
                            └─ Week 10 (spice + split)
                                 └─ Week 11 (kid-swap chip)
                                      └─ Week 12 (win screen + content + spotlight UI)
                                           └─ Week 13 (Clerk)
                                                └─ Week 14 (Neon)
                                                     └─ Week 15 (R2)
                                                          └─ Week 16 (Redis)
                                                               └─ Week 17 (Sentry + analytics)
                                                                    └─ Week 18 (perf)
                                                                         └─ Week 19 (content wave)
                                                                              └─ Week 20 (label expansion)
                                                                                   └─ Week 21 (beta 1)
                                                                                        └─ Week 22 (fixes + a11y + i18n)
                                                                                             └─ Week 23 (legal)
                                                                                                  └─ Week 24 (beta 2)
                                                                                                       └─ Week 25 (launch hardening)
                                                                                                            └─ Week 26 (retro + reserve)

Week 7 (use-parent-mode + coach quiz) — parallel with Week 5–6, blocks Week 9.
```

Critical path: **Week 1 → 2 → 3 → 4 → 9 → 10 → 11 → 12 → 13 → 14 → 21 → 24 → 25**. Every other week is parallelizable around it.

---

## 9. What this plan deliberately does NOT promise

- **Native mobile apps** (iOS / Android). Sous remains a PWA-eligible web app for Stage 1+2. Native is Stage 3+ work.
- **Multi-child profiles.** Household-level Parent Mode only (PARENT-MODE-PLAN §1 non-goal).
- **Real-time chat with a dietitian.** Out of scope for this 6-month window.
- **Allergen filtering.** PM V1 ships without it; V1.1 (post-launch) adds it.
- **Internationalization beyond Spanish scaffold.** Hindi and Tagalog (per PRD) are Stage 3 work.
- **Public launch.** This timeline ends at "launch prep complete." Public soft launch is week 27, outside this plan.

---

## 10. Working agreements

- **One DOD per week.** No multi-week deliverables that hide slippage.
- **Lint + test + build green** at every commit. Hard gate.
- **Commit directly to main.** CLAUDE.md BULLETPROOF. No long-running feature branches.
- **Re-plan, don't spiral.** If a week slips, move the line. Fatigue is not an excuse to ship broken work; nor is it an excuse to spin.
- **The Sous Test is the truth.** Every visible feature must answer "does this make them cook?" Parent Mode features must additionally answer "does this make the kid eat?"
- **No invented recipes or images.** Recipe data and food images stay in the existing pipeline.
- **No new tabs.** Three tabs forever (Today · Path · Content).

---

## 11. Stage 3+ teaser (for context, not commitment)

After this 6-month window, the natural next workstreams (none of which are in scope here):

- **Native mobile** (React Native + Expo on top of the existing tRPC + Drizzle backend).
- **Allergen + restricted-diet system** (kosher, halal, vegan-with-B12-flag, gluten-free, IBS-friendly).
- **Real editorial CMS** for the Content tab (Sanity, Contentful, or in-house with Drizzle).
- **Clinician partner program** for verified content.
- **Multi-language expansion** (Hindi, Tagalog per PRD).
- **Subscription tier** (per Week 25 pricing decision).
- **Voice-first guided cook** (the SideChef pattern — already noted in research §5).

These are NOT promises. They are the surface of Stage 3+ that this plan deliberately leaves on the cutting-room floor to keep Stage 1+2 finishable.

---

## 12. Where to begin

If we agree this plan, **Week 1 starts Monday May 4, 2026**, with the nutrition-data ADR. Everything else cascades from that single decision.

The Karpathy guard: state the assumption (we will use either USDA FoodData Central or a paid API for nutrition data), surface the tradeoff (free + 80 hours engineering vs. paid + 1 hour engineering + ongoing cost), pick before coding (Week 1 ADR), execute (Week 2+).

That is the entire process applied to the entire timeline.
