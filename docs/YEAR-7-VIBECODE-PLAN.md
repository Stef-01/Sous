# Year-7 Vibecode Plan — Sous (human-workstream year)

> **Filed:** 2026-05-04 (alongside the Y5 intelligence-layer pivot).
> **Period covered:** Y7 W1-W52.
> **Theme:** **Human-workstream year.** The substrate-first discipline of Y2-Y5 leaves Y7 with one job: line up the human-dependent inputs (clinician approvals, translator hires, real-cohort data tuning, third-party API agreements) so the substrate flips into real production at scale.
>
> **Why Y7 (not Y6):** Y6 is the founder-key-flip year — the 11 founder unlocks from Y4 W30 light up across the year as Stefan provisions Anthropic, Stripe, Postgres, R2, native distribution, push, etc. Y6 is also when Sous ships V1 of creator economy + cohort-aware push notifications. **Y7 is everything that needs a human counterparty (translator, clinician, sponsor, vendor) and can't be unblocked by a config edit.**

## Single-sentence framing

Y7 = the year human counterparties enter the loop: clinician-approved editorial content goes live, translators publish bilingual launch, real cohort data tunes the V4 trainer + push delivery + pantry vision thresholds, Yelp/Google Places APIs go live for Eat Out, creator economy V1 launches.

## Sprint structure (12 sprints × 4 weeks + 4 polish weeks)

| Sprint | Weeks   | Theme                                       | Pushed-from       |
| ------ | ------- | ------------------------------------------- | ----------------- |
| A      | W1-W4   | Editorial real-content workstream — phase 1 | Y5 E (prior plan) |
| B      | W5-W8   | Editorial real-content workstream — phase 2 | Y5 E (prior plan) |
| C      | W9-W12  | Editorial publishing flow + content QA      | Y5 E (prior plan) |
| D      | W13-W16 | Bilingual translator engagement             | Y5 D (prior plan) |
| E      | W17-W20 | Bilingual catalog filling — phase 1         | Y5 D (prior plan) |
| F      | W21-W24 | Bilingual launch (es-MX, then es-US)        | Y5 D (prior plan) |
| G      | W25-W28 | Pantry vision real-mode tuning              | Y5 I (prior plan) |
| H      | W29-W32 | V4 trainer real-cohort retune               | Y5 L follow-on    |
| I      | W33-W36 | Push notification quality real-tuning       | Y5 J (prior plan) |
| J      | W37-W40 | Creator economy V1 — onboarding flow        | Y5 G (prior plan) |
| K      | W41-W44 | Eat Out wire-up (Yelp + Google Places APIs) | Y5 J wire-up      |
| L      | W45-W48 | Creator economy V1 — payouts + dashboard    | Y5 G (prior plan) |
| M      | W49-W52 | Year close + Y8 plan                        | New               |

## Sprint detail

### A–C — Editorial real-content workstream (W1–W12)

**Founder-gated dependency:** Stanford clinician hires (or partner credentials), permission letters from each cited source, content QA review.

**What's already substrate (Y4 W29-W30):**

- `PublicationQueueEntry` schema with status state machine
- `validateEditorialCompleteness` requires `sourceUrl + sourceTitle + permissionEvidence + ≥1 ClinicianCredit` per entry
- `transitionPublicationStatus` blocks `draft → published` (must pass review); blocks `ready-to-publish → published` when incomplete
- `filterReadyContent({mode: 'production'})` — switching the Content tab to real content is a **one-line** change

**What Y7 ships:**

- Sprint A: outreach to ≥3 Stanford clinicians (Maya Lin, Dipti Kothari, Kalyana Sundaram per the Y3 sample bylines were placeholders — real outreach goes through Stanford comms office).
- Sprint A: permission letter templates + first 5 articles drafted + clinician sign-off on first article.
- Sprint B: 10 more articles drafted; queue populated with `ready-to-publish` entries; complete `permissionEvidence` for each.
- Sprint C: content QA pass (allergens, cultural sensitivity, dietary inclusivity); flip Content tab `mode: "production"`; add 8 research briefs + 4 expert profiles.
- End of Sprint C: ~25 published articles, 8 research briefs, 4 expert profiles. The Content tab transitions from placeholder magazine → real Stanford-attributed library.

### D–F — Bilingual launch (W13–W24)

**Founder-gated dependency:** translator hires (es-MX first; es-US for the US Spanish market; et al per the Y3 plan).

**What's already substrate (Y5 D pushed-out — was the prior plan):**

- i18n message catalog scaffold (en-US default).
- Per-locale rendering tests confirm the catalog covers every visible string.
- Translator-handoff format (CSV/JSON export with context strings) ready.

**What Y7 ships:**

- Sprint D: outreach + contract with 1 es-MX translator. Onboarding to the catalog format.
- Sprint E: full en-US → es-MX translation pass; cultural review; cuisine-name translation table (e.g. "Curry" doesn't translate cleanly to Spanish food vocabulary; "Asian Fusion" needs nuance). 50% catalog complete.
- Sprint F: 100% catalog complete; QA across 20 device-language permutations; ship es-MX as a beta locale; soft launch to ~500 users in the cohort.

### G — Pantry vision real-mode tuning (W25–W28)

**Founder-gated dependency:** `ANTHROPIC_API_KEY` flipped (Y4 Sprint A); production traffic accumulating real-cohort vision misclassifications.

**What's already substrate:** Y3 W13 photo pipeline + ItemClass taxonomy + freshness helpers. Y4 W3 LLM cost telemetry tracks per-call costs. The vision call site is wired to real Anthropic in stub-mode-V1 mode.

**What Y7 ships:**

- Confidence-threshold tuning from real misses (which ItemClasses cluster around 0.4-0.6 confidence and need a correction-UI nudge).
- Per-region + per-cohort calibration (kitchens in different countries have different staple sets; the model's prior should adjust).
- Cost-cap throttling (if a user's vision-call rate exceeds N/day, fall back to text-only craving search until the next budget window).
- Internal dashboard at `/path/internal/vision-quality` aggregating false-positives/false-negatives by ItemClass.

### H — V4 trainer real-cohort retune (W29–W32)

**Founder-gated dependency:** ≥30 cooks-with-feedback per cohort segment (the Y4 W26 cohort minimum). Production traffic accumulating real signal.

**What Y7 ships:**

- First real cohort retune cycle; surface the drift report at `/path/internal/trainer-drift`.
- Per-cohort weight vector publishing (each segment's `pickSegmentWeights` resolves to a real-cohort-tuned vector instead of `DEFAULT_COHORT_WEIGHTS`).
- A/B test the V4 cohort weights vs the V3 personal-only weights for users with ≥10 cooks. Track CTR + reroll rate + cook-completion as success metrics.
- Quarterly retune cadence kicks off.

### I — Push notification quality real-tuning (W33–W36)

**Founder-gated dependency:** APNs/FCM/VAPID keys flipped (Y4 Sprint D-E-F); production push delivery data accumulating.

**What Y7 ships:**

- A/B test scheduling-window variations (rhythm-clamp vs explicit-time vs adaptive).
- Quiet-hours adoption rate analysis (who toggled, who left default, who set custom).
- CTR tuning per intent (rhythm-nudge, pod-reveal, viral-recipe-saved, charity-progress, cook-reminder).
- Per-platform-channel delivery success rate (APNs vs FCM vs VAPID) — flag if any channel underperforms on retry+success.
- Internal dashboard at `/path/internal/push-quality`.

### J + L — Creator economy V1 (W37–W40 + W45–W48)

**Founder-gated dependency:** Stripe Connect onboarding for creators (KYC + tax info); creator outreach.

**What's already substrate (Y5 G pushed-out):**

- Recipe-attribution + revenue-share contract types
- Per-creator metrics aggregator
- Y2 W49 charity-charge dispatcher (same rails as creator payouts)
- Y4 W5 charity-ledger pattern (per-event aggregator) translates directly to per-creator earnings

**What Y7 ships:**

- Sprint J: Stripe Connect onboarding flow at `/path/creator/onboarding`. KYC + tax form. Creator profile page with display name + bio + recipe count.
- Sprint J: outreach to first 10 creators (food bloggers / dietitians / chefs from the Stanford alum network + cookbook author cold-outreach).
- Sprint L: payout flow on the Y2 W49 Stripe rails. Monthly payout cycle. Creator dashboard at `/path/creator` showing earnings + cooks attributed.
- Sprint L: revenue-share contract: 70% to creator, 30% platform on user-paid content (subscription or one-off recipe purchase).

### K — Eat Out wire-up (Yelp + Google Places APIs)

**Founder-gated dependency:** Yelp Fusion API key + Google Places API billing setup.

**What's already substrate (Y5 J shipped):**

- `/eat-out` route with dish-first card stack
- 8-dish fixture data (4 venues, 2 dishes each)
- Agent search wrapper (stub mode returns fixtures matching query)
- Eat-in / Pickup / Delivery filter tabs

**What Y7 ships:**

- Yelp Fusion API integration: `searchVenues({query, location, radius})` → returns ranked venues.
- Google Places: dish photo lookup + opening hours + estimated wait time.
- Real-mode flip: stub-mode-V1 fixtures → real venue data within ~15 km of user.
- Cost-cap: per-user Yelp/Places call quota (e.g., 20 searches/day before throttle).
- Internal dashboard at `/path/internal/eat-out-spend` (Yelp+Places API cost tracking; pattern matches Y4 W3 LLM-spend dashboard).

### M — Year close + Y8 plan (W49–W52)

Standard year-close cadence: Y7 retro doc, Y8 plan filed, full 4-gate, IDEO #66 absorbed.

## What pushes to Y8

Two items push to **Y8** if they don't land in Y7:

- **Internationalisation beyond es-MX**: French (fr-FR or fr-CA), Mandarin (zh-CN), Hindi (hi-IN), Portuguese (pt-BR). Y8 sprint coverage depending on Y7 cohort growth.
- **Agentic chef-coach** (real-time multimodal coach during a cook session — voice + camera + step-tracking). Real Anthropic voice realtime API; substrate exists from Y2 voice-conversation stub.

## RCA discipline

All Y2-Y6 rules carry. Y7 specifically: **never let a human-workstream block the substrate's autonomous health**. If a clinician is slow to sign off → keep shipping substrate; the queue absorbs the slack via the W4 W30 status state machine. If a translator misses a deadline → soft-launch with what's done, ship a "more languages coming" placeholder.

## In one sentence

Y7 = human-workstream year: clinician-approved content goes live, bilingual launches, real-cohort tuning of V4 trainer + push + vision, creator economy V1, Eat Out gets real Yelp/Google data — all the work that _can't_ be unblocked by a config edit alone.
