# Cooking Pod Challenge — Design Brief (V2)

> Status: design brief, not yet built. Brainstormed via the
> Karpathy "think before coding" process at the request of
> Stefan, 2026-05-02. **V2 reflects Stefan's six-question
> answers + a mechanic pivot from streaks to score-based
> cooking.**
>
> The implementation slot is **Sprint I W45-W46** (squeezed
> in; Sprint J polish stays). Sprint K (W47-W51) is now the
> Recipe Ecosystem V2 work — see
> `docs/RECIPE-ECOSYSTEM-V2.md`.

## Stefan's six-question answers (V2 anchor)

| Question                           | V1 design            | Stefan's V2 directive               |
| ---------------------------------- | -------------------- | ----------------------------------- |
| Sprint scope                       | Sprint K (W47-W51)   | **Squeeze into Sprint I** (W45-W46) |
| Vibecode-only V1 acceptable?       | Open                 | **Yes**                             |
| Reveal cadence                     | Sunday 9pm pod-local | **Sunday pod-local (kept)**         |
| Pod admin model                    | Single creator       | **Shared admin** (multi-admin)      |
| Recipe pool                        | Seed + user          | **Seed only**                       |
| Donate-a-Cook V1 honour-system OK? | Open                 | **Yes (kept)**                      |

Plus the load-bearing change: **drop the streak; use cook scores instead.**

## Mechanic pivot — from streak loss aversion to score-based cooking

V1 anchored on group streak loss aversion ("don't be the one who broke the chain"). Stefan's directive shifts the mechanic to **positive-reinforcement scoring** with structural protections:

- Each completed cook earns a **0-100 score** combining visual aesthetic + quality.
- **Hard cap: 2 cooks per member per day.** Prevents one person farming all the points.
- **Pod-consistency multiplier** rewards even distribution. A pod where all members cook ~equally gets full score; a pod where one person carries gets multiplied down.
- Pod's weekly score = `sum(member_scores) × consistency_multiplier`.

This trades anxiety (streak pain) for craft signal (better cooks score higher) + collective growth (consistency rewards everyone, not just the leader).

### Why this is structurally better

1. **Aligns with CLAUDE.md rule 1.** The Today screen exists to make the user cook. Score-based feedback directly rewards the cooking act, not its absence.
2. **Removes the failure mode where it becomes a chore.** No streak to break = no panic-cooking on Saturday night.
3. **Lets quality matter.** A rushed-but-edible cook still counts (it's a completed cook), but doesn't pull the same weight as a well-plated, well-cooked one. The user who cooks well gets recognition, the user who cooks badly still participates without shame.
4. **Caps farming via 2/day limit.** A motivated member can't grind 10 cooks in a single afternoon to dominate.
5. **Pod consistency multiplier creates positive peer pressure WITHOUT loss aversion.** Helping a teammate cook (sending them encouragement, suggesting easy weeknight options) is the natural play, not stress about your own chain.

### Per-cook score formula (V1 — pure, testable)

```
cook_score = (
  step_completion_score × 0.30 +
  self_rating_score     × 0.30 +
  aesthetic_score       × 0.40
) × 100   // scale 0-100
```

Where:

- **step_completion_score** ∈ [0, 1]: fraction of guided cook steps the user actually tapped through (vs skipping ahead). Already tracked by the cook store. Rewards the user for engaging with the guided flow rather than just snapping a photo of something they made off-app.
- **self_rating_score** ∈ [0, 1]: user's 1-5 star rating of their own cook, normalised. Already collected by the win screen. Self-rating gives the user agency — a 5-star self-rating signals "I'm proud of this cook" which is the right anchor.
- **aesthetic_score** ∈ [0, 1]: AI vision aesthetic score (V2 with OpenAI Vision; **V1 vibecode default = 0.5 placeholder**). When the AI lands, scores composition, plating, lighting heuristics. Doesn't judge correctness — that's what self-rating + step-completion handle.

**Bonus** (optional, additive):

- **+5** if the user submitted a non-empty caption ("what I'd do differently")
- **+5** if the user used a per-step image (visual-mode authored)

Capped at 100.

### Daily cap enforcement

```
daily_cooks(member, day) ≤ 2
```

The 3rd cook of the day still completes (user can still cook!) but doesn't add to the pod's weekly score. The win screen surfaces a small "you've earned today's pod max — cook for joy" message when the cap is hit. **No nag, no block on the cook itself.**

### Pod-consistency multiplier

```
individual_totals = [sum(m.scores_this_week) for m in active_members]

if len(active_members) < 2 or sum(individual_totals) === 0:
  consistency_multiplier = 1.0  // edge case: no penalty when there's nothing to compare
else:
  μ = mean(individual_totals)
  σ = std(individual_totals)
  cv = σ / μ                                // coefficient of variation
  consistency_multiplier = clamp(1 - cv * 0.5, 0.5, 1.0)

pod_weekly_score = sum(individual_totals) × consistency_multiplier
```

So:

- **Perfect even distribution** (cv = 0): multiplier 1.0, full score.
- **Moderate variance** (cv = 0.4): multiplier 0.8.
- **Wildly uneven** (one carrier, others zero): cv ≈ √(N-1)/N → multiplier 0.5 floor.

The 0.5 floor matters: even a wildly uneven pod still gets half their raw score. This is positive-sum, not zero-sum. The carrier isn't penalised personally — the pod just multiplies down. The carrier can lift the whole pod's score by inviting / encouraging the others.

### Vacation-mode interaction

Members in vacation mode (3 missed weeks) drop out of the `active_members` denominator for the week. So a 6-member pod with 2 vacationing has its consistency computed across the 4 active members. No silent penalty.

### Anti-gaming notes

- A pod can't game the multiplier by everyone scoring 0 — `sum(totals) === 0` short-circuits to 1.0 multiplier, which means the pod score is also 0. Correct outcome.
- Self-rating fraud (always rating 5 stars) is bounded by the 30% weight — even a gaming user can only push the score up by 30 points × 2 cooks/day = 60 per day, which gets multiplied down by consistency if they're the only carrier.
- Step-completion fraud requires actually opening the cook flow and tapping through, which is the desired behaviour anyway.

## Sunday-night pod-local gallery (kept from V1)

Sunday 9pm pod-local: photos drop simultaneously. Member completion list visible mid-week (binary, no day-of-cook info). Three reaction emoji per photo (👏 ❤️ 🔥), no comments. Same dramaturgy.

**New** — gallery shows individual scores + the pod's consistency multiplier + the weekly total. The number is the takeaway: "You guys cooked 287 points × 0.91 consistency = 261 this week."

The score is grounded in the photos — you can see who got the high aesthetic score (it's the pretty plate). This makes the score trustable and a fun comparison surface.

## Shared admin model

Multi-admin per pod (Stefan's directive). Any admin can:

- Pause the pod for a week ("vacation week")
- Configure dietary constraints
- Set the Sunday reveal time (default 9pm pod-local)
- Boot a member (with confirmation)
- Promote another member to admin

Single point of failure removed: if the founder leaves, the pod doesn't dissolve.

UI: small star icon on admin members in the gallery. "Admin" badge on the pod home for current user when applicable.

## Friction failure modes (V2 — same six modes, mechanic pivot updates the analysis)

1. **Invite friction kills adoption** — same mitigation as V1 (deeplinks + 6-digit fallback).
2. **Dietary mismatch** — same: pod creation captures union of all members' household-memory dietary flags from Sprint G/H. Weekly challenge filters via the union.
3. **Schedule anxiety** — V1 fix (binary completion, no day-of-cook) STILL APPLIES, plus the score model removes the streak pressure that drove the anxiety in the first place.
4. **End-of-week reveal** — same mitigation: client-side polling on `reveal_at` timestamp.
5. **Member dropout** — auto-pause "vacation mode" after 3 missed weeks, drops out of the consistency-multiplier denominator.
6. **Becoming a chore** — substantially mitigated by the pivot. Score-based + 2/day cap + admin pause week = no anxiety driver.

## Fraud detection — V1 unchanged

- Server timestamp on submit (when auth lands)
- Single submission per member per day (and 2/day cap)
- Perceptual hash dedupe across submissions
- EXIF date-taken sanity check
- Cook-session-time correlation

V2 (post-launch): OpenAI Vision dish recognition + cross-pod hash check.

## Social-good angle — Donate-a-Cook (V1 honour-system, kept)

Three opt-in tags at submit time:

- 🥡 **"Shared a portion"**
- 🍰 **"For the bake-sale"**
- 🤝 **"Cooked together"**

Aggregates per pod. Visible in the gallery sub-line. No payment integration in V1.

V2: Pod-Pledge-Cook (Stripe + curated nonprofit list). V3: Bake-sale tooling.

## Where it lives in the app (kept minimal per CLAUDE.md rule 6)

`/community/pod` — pod home with three states (no-pod CTA / mid-week / gallery reveal).

One tile in the Content tab home grid. NOT a separate top-level tab.

Win-screen integration: when the user is in a pod and the dish matches the week's challenge, the photo upload shows a "Submit to pod challenge" toggle. Score breakdown surfaces on the win screen after submit ("step completion: 92%, your rating: 5★, aesthetic: pending → score: 56/100").

**No new flow to learn for the user who's already cooking.**

## Build sequence — Sprint I W45-W46 (squeezed)

Two weeks. Vibecode V1 is single-device mock; multi-device public launch is Year-2 W1-W4.

### W45 — Schema + score helpers + per-cook score logic

- `ChallengePod`, `PodMember`, `PodAdmin[]`, `PodChallengeWeek`, `PodSubmission` Zod schemas (W17 pattern).
- localStorage-hook substrate `useCurrentPod` (single-pod-per-device V1).
- Pure helpers in `src/lib/pod/`:
  - `weekKey(date, podTimezone)` → "2026-W18"
  - `aggregateDietaryFromMembers(members)` (composes with W35 `aggregateTable`)
  - `computeCookScore({ stepCompletion, selfRating, aesthetic, captionLength, hasStepImage })` → 0-100
  - `computeConsistencyMultiplier(individualTotals)` → 0.5-1.0
  - `computePodWeeklyScore(submissions, members)` → { raw, multiplier, total }
  - `enforceDailyCap(submissions, dayKey, maxPerDay = 2)` (filters submissions past cap)
  - `shouldRevealGallery(weekStartedAt, revealAtHour, now, podTimezone)`
- Tests: 30+ for the score math (boundary conditions, monotonicity invariants, daily-cap enforcement, multiplier floor at 0.5, even-distribution → 1.0 multiplier, edge cases when sum is 0 or single-member).

**Acceptance:** all helpers unit-tested; types compile; no UI yet.

### W46 — Pod home + win-screen integration + Sprint I IDEO close

- `/community/pod` page (3 states: no-pod CTA, mid-week, gallery).
- Photos rendered in the gallery with score breakdown chips.
- Pod creation form (`/community/pod/create`) + invite-code (`/community/pod/join`).
- Win-screen `Submit to pod challenge` toggle when active.
- Score-breakdown chip on win screen post-submit.
- Sprint I IDEO close doc.

**Acceptance:** all three states render with mock fixtures; win-screen submit writes to local pod state; gallery shows 4-photo grid with scores; admin pause/vacation flow works; localStorage round-trip of a 6-member pod with 5 weeks of submissions.

## What we're NOT shipping in Sprint I (deferred)

- Real multi-device backend (Y2 W1-W4: Postgres + Clerk + R2)
- AI vision aesthetic scoring (Y2 W5+: OpenAI Vision integration; V1 default 0.5 placeholder)
- Pod-Pledge-Cook financial donation (Y2 W6+: Stripe + nonprofit list)
- Workplace pods (Y2 W7+)
- City-level aggregate (Y2 W8+)
- AI fraud detection (Y2 W9+)

## Open questions resolved by Stefan (V2)

All six V1 open questions are now answered. **No new open questions.**

## Why this is a good Year-1 bet (kept from V1)

1. Compounds Year-1 work — household memory, pairing engine V2, recipe authoring, attention pointers were built for individual users. Pods are the multi-user surface that makes those investments visible to the user's friends.
2. Social structure is the moat. Recipe content isn't owned; user's pod relationships are.
3. "Join my Sous pod, here's the code" is share-able in a way "try this app" isn't.

## What would kill this feature

- If we rebuilt the streak mechanic by accident (anxiety > joy)
- If we let the 2/day cap leak in a way that lets carriers dominate
- If we shipped AI aesthetic scoring before validating self-rating + step-completion are sufficient signals on their own
- If pods grew beyond 8 (intimacy lost)
- If we monetised the social-good angle in V1 (legitimacy question)

## Companion docs

- `docs/RECIPE-ECOSYSTEM-V2.md` — Stefan's directives on recipe storage modernisation, source tagging, reel-to-cook integration, agentic autogen, and sharing. Sprint K W47-W51.
- `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` — 12-month plan with Sprint I (W45-W46 pod) + Sprint K (W47-W51 recipe ecosystem) slots updated.
- `docs/FOUNDER-UNLOCK-RUNBOOK.md` — backend / Stripe / R2 / Vision-API integration plan for Year-2.
