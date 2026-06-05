# Sous — 20-Week Autonomous Moat-Deepening Plan

> **Authored:** 2026-06-05 · **Window:** W1–W20 (next 20 weeks)
> **Grounds in:** `STRATEGY.md` (thesis + compounding moats §2, feature matrix §7, North Star §8), `ROADMAP.md` (build state), `docs/PRODUCTION-READINESS-PLAN.md` (Supabase-native staging), `docs/CULINARY-THERAPEUTICS-PLAN.md` (dormant behind gates), `docs/NEXT-20E-PHASES.md` (voice pilot, Feature B unbuilt).
> **Supersedes nothing** — this is the AUTO-BUILD track that runs while the founder-gated rails (below) get credentials. It picks up at the true frontier: Parent Mode (Phase A+B) shipped, Supabase Stage 0 live, therapeutics dormant, design-system enforcement begun.

---

## 0. The load-bearing rule (CLAUDE.md rule 12)

Every week below is classified **AUTO-BUILD** (everything needed lives in this repo + npm + the lean stack: localStorage / static JSON / mock-AI / Supabase-ready abstractions) or **FOUNDER-GATED** (needs an external account, paid service, human counsel, real users, or third-party permission). **AUTO-BUILD weeks are sequenced first.** No week here is scheduled as autonomous if it actually needs a credential — instead, the founder-gated integrations get their **autonomous prep** (the abstraction, the schema, the adapter stub, the env-var contract) so that when the founder wires a key, integration is **one config edit away**.

### Founder-gated dependencies (surfaced up front — act on these in parallel)

| Gate                                                | Unlocks                                  | Autonomous prep that ships in this plan                                 |
| --------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL` + Vercel project                     | Supabase go-live (Prod-Readiness S1)     | adapters already on postgres-js; health endpoint; env contract (done)   |
| Supabase Auth (Google/Apple OAuth)                  | real accounts, per-user RLS              | W19 auth-adapter stub + env contract; mock-user stays default           |
| Supabase Storage / R2 bucket                        | persistent Win photos, hosted imagery    | W16 `next/image` + upload-adapter abstraction (mock-backed)             |
| Supabase Realtime (live project)                    | Cook Together presence, live leaderboard | W17 realtime-adapter stub + deterministic local core                    |
| Stripe Connect + charity KYC                        | payments, charity donations              | W19 payment-adapter stub + env contract                                 |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / search key | real AI surfaces                         | already abstracted (6 mock providers); W19 confirms cost-guard contract |
| Real users / beta cohorts (10 → 50 households)      | retention + funnel data                  | analytics events instrumented (mock sink) so funnel is wired on day one |
| Legal / food-advertising counsel                    | health claims, ToS/Privacy live          | therapeutics stays `isEducational`; W20 surfaces the punch-list         |
| Clinician (RD) sign-off + Stanford/CIA branding     | un-gate therapeutics G1/G4               | nothing here un-gates it; remains dormant per rule 11                   |

**None of the above blocks a single AUTO-BUILD week.** They are listed so they get acted on in parallel rather than discovered mid-execution.

---

## 1. Strategy alignment (why these 20 weeks, in this order)

- **North Star = cooks completed / user / week.** Every week must plausibly raise it. Engine sharpness (Phase 1) and habit depth (Phase 3) are the most direct levers, so they come first/early.
- **Sequenced by the §7 matrix:** high-impact/low-effort before high-effort. Context-aware recs, daily-quest sharpening, streak/celebration variants, gifting — all High/Very-High impact at Low/Medium effort — lead. High-effort network features (Cook Together) are prep-only and last.
- **Every week names the moat it deepens** (§2): Data, Content, Behavioral, Engine, Network. A week that deepens no moat doesn't ship.
- **Radical simplicity is invariant.** Rules 1–13 hold every week: one primary action per screen (rule 2), no settings pages (rule 3), no new Today element without one-out (rule 13), no invented recipes/images (rule 7), no-scroll CTA at 375×667 (rule 10).

---

## 2. Cross-cutting invariants (apply to EVERY week)

1. **Verify gate:** `pnpm typecheck && pnpm lint && pnpm test && pnpm build` green before any commit; ship-critical UI verified on a fresh server (HMR staleness is real; prod build is source of truth).
2. **Determinism first (§9.3):** every AI-enhanced surface keeps its working mock/deterministic fallback. No feature _gates_ on a live key.
3. **Commit to main + push** after every meaningful slice; messages end with the Co-Authored-By line.
4. **Test-as-you-go:** new engine logic ships with unit tests; new flows extend the Playwright smokes; new motion files pass `sous/reduced-motion-gate`; new labels pass `sous/prefer-sous-label`.
5. **Founder-gated code is flag-guarded + mock-backed** so the lean app stays byte-identical until a key lands.

---

## 3. The plan — 5 phases × 4 weeks

### PHASE 1 (W1–W4) — ENGINE × DATA moat: context intelligence

> The most direct North-Star lever: make the recommendation measurably sharper. All deterministic, zero founder gates.

- **W1 · Pantry-aware reranker** _(Data + Engine)_ — promote ingredient-overlap from a _hint_ (`matchIngredientReuse`) into the ranking itself: sides sharing pantry staples with recent cooks score higher (§6.5, §2.1). Deterministic scorer/post-rank reorder, weight below taste; zero-pantry users get byte-identical results. Unit + golden tests.
- **W2 · Context rerankers** _(Engine)_ — time-of-day + season reweighting (§6.2): lighter/simpler late-night, warming dishes in winter, all from the device clock + a deterministic season map. Weather stays an opt-in Open-Meteo _adapter stub_ (free, no account) — not required.
- **W3 · Explainable per-dimension "why"** _(Engine trust)_ — surface the 6-scorer breakdown behind the existing "Why?" expander (progressive disclosure, rule that it stays below the hero). "Acidity cuts the richness · uses your cilantro · 20 min" — transparent, not black-box (§2.4).
- **W4 · V3 preference-trainer hardening** _(Data)_ — finish the learned weight-vector from cook history (prepped per scout): cold-start = DEFAULT_WEIGHTS (invisible to new users), sharpens silently after ~5 cooks. Golden test: 0-history user is byte-identical to V2.

### PHASE 2 (W5–W8) — CONTENT moat: guided-cook depth + voice

- **W5–W6 · Guided-cook coverage growth** _(Content)_ — author Mission→Grab→Cook→Win flows for **existing catalog dishes** that lack them, raising side + meal coverage (currently 58% sides, 7/76 meals). **Rule 7 hard constraint:** only existing `sides.json`/`meals.json` entries; steps sourced from real reputable references with attribution; no invented dishes/images. Each flow carries timer triggers, mistake warnings, hack chips (the hard-to-replicate editorial asset, §2.2).
- **W7–W8 · Voice-cook pilot (NEXT-20E Feature B)** _(Content)_ — feature-flagged (`VOICE_COOK_ENABLED`) bounded-vocabulary commands ("next", "repeat", "timer") via the browser Speech API, with a hold-to-talk affordance and graceful manual-tap fallback (§12.2). Hands-free is genuine utility with wet hands; deterministic fallback means it never blocks. Tests + smoke.

### PHASE 3 (W9–W12) — BEHAVIORAL moat: habit-loop depth

- **W9 · Streak freeze, earned** _(Behavioral)_ — bank a freeze by completing a weekly challenge or an extra cook, not by paying (§11.2); shield glyph beside the streak. Strengthens loss-aversion without nagging.
- **W10 · Reward variability** _(Behavioral)_ — win-screen celebration variants by milestone (first new cuisine, 10th cook, first 5★) + optional dismissible micro-lesson after save (§11.3, §11.5). Same screens, varied reward → stronger dopamine loop.
- **W11 · Cook-replay-with-improvement** _(Behavioral + Content)_ — from the scrapbook, replay a past cook with a "last time you noted X" nudge and a tuned timer (§4.5). Turns existing content into a repeat-engagement loop.
- **W12 · Silent progressive difficulty** _(Data + Engine)_ — after ~10 cooks, gently bias the quest one level above comfort (§11.7). Zero UI; pure engine. Keeps the user growing → keeps the habit fresh.

### PHASE 4 (W13–W16) — CRAFT & RELIABILITY: design system + hardening

> Raises the floor so every moat surface feels designed, and locks quality with tests/perf. Continues the label-role enforcement already shipped.

- **W13 · Card + kicker primitives** _(Craft)_ — extract the now-consistent card system (radius tiers `--radius-lg` hero / `--radius-md` content, divide-y rows) into a small `<Card>`/`<SectionKicker>` primitive set; migrate the highest-traffic surfaces. Contextual (button≠card≠chip) — done by hand, screenshot-verified, not a blanket sweep.
- **W14 · Caption + spacing + motion consistency** _(Craft)_ — converge body-caption text onto `.sous-meta` where safe; spacing onto the `--space-*` scale on the flagged surfaces; audit motion durations/easings for one rhythm. Extend lint enforcement where a clean rule exists.
- **W15 · Test depth** _(Reliability)_ — extend Playwright to the full cook loop + combined cook + voice fallback; engine golden-set tests for the new rerankers; a11y regression guards (focus/scroll-lock/contrast) on new surfaces.
- **W16 · Performance pass** _(Reliability)_ — lazy-load the pairing engine + data files; bundle budget (<150KB gz target, `planning.md`); `next/image` abstraction (R2-ready) with blur placeholders; Lighthouse-ready. Prep only — real R2 swap is one founder edit.

### PHASE 5 (W17–W20) — NETWORK moat prep + founder-gated rails

> AUTO-BUILD the deterministic/local cores and the integration stubs, so the moment a credential lands, it's one edit.

- **W17 · Cook Together — local core + realtime stub** _(Network)_ — model shared cook state + presence as a deterministic local engine (two simulated cooks land on a shared win screen), behind a `realtime-adapter` whose live implementation is a Supabase-Realtime one-file swap (§3.1). No video/chat (on-thesis).
- **W18 · Group-challenge depth + gifting polish** _(Network)_ — group streak + in-group leaderboard logic (local/deterministic) and recipe-gifting refinement (§3.2, §3.3) — the viral loops that need no server. Viral-coefficient analytics events instrumented.
- **W19 · Founder-gated integration prep** _(Rails)_ — wire the adapter + env-var contract + flag for each gate (Auth, Storage, Realtime, Stripe/charity, AI cost-guard) so each is one config edit (rule 12). Every adapter mock-backed + tested; lean app stays byte-identical.
- **W20 · Hardening + retro** _(Reliability)_ — full regression (typecheck/lint/test/build/E2E); update `ROADMAP.md` + `STRATEGY.md` decision log; write the 20-week retro; emit the remaining founder-gate punch-list so go-live is a credential-wiring exercise, not a rebuild.

---

## 4. Definition of done (per week & overall)

- **Per week:** deliverable shipped + verify-gate green + tests added + committed to main + this doc's week row checked off with the commit SHA.
- **Overall:** the recommendation is demonstrably sharper (Phase 1), the content library is deeper (Phase 2), the habit loop is stickier (Phase 3), the craft floor is higher and locked by tests (Phase 4), and every founder-gated rail is one edit from live (Phase 5) — with the lean, key-less app still fully functional at every step (§9.3).

## 5. Progress log

| Week | Deliverable                              | Moat        | Status  | Commit    |
| ---- | ---------------------------------------- | ----------- | ------- | --------- |
| W1   | Pantry-aware reranker                    | Data×Engine | ✅ done | `252a51f` |
| W2   | Time/season context rerankers            | Engine      | —       | —         |
| W3   | Explainable per-dimension why            | Engine      | —       | —         |
| W4   | V3 preference-trainer hardening          | Data        | —       | —         |
| W5–6 | Guided-cook coverage growth              | Content     | —       | —         |
| W7–8 | Voice-cook pilot (Feature B)             | Content     | —       | —         |
| W9   | Streak freeze (earned)                   | Behavioral  | —       | —         |
| W10  | Win celebration variants + micro-lesson  | Behavioral  | —       | —         |
| W11  | Cook-replay-with-improvement             | Behavioral  | —       | —         |
| W12  | Silent progressive difficulty            | Data×Engine | —       | —         |
| W13  | Card + kicker primitives                 | Craft       | —       | —         |
| W14  | Caption/spacing/motion consistency       | Craft       | —       | —         |
| W15  | Test depth (E2E + golden + a11y)         | Reliability | —       | —         |
| W16  | Performance pass                         | Reliability | —       | —         |
| W17  | Cook Together local core + realtime stub | Network     | —       | —         |
| W18  | Group-challenge depth + gifting          | Network     | —       | —         |
| W19  | Founder-gated integration prep           | Rails       | —       | —         |
| W20  | Hardening + retro                        | Reliability | —       | —         |
