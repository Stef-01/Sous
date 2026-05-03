# Cooking Pod Challenge — Design Brief

> Status: design brief, not yet built. Brainstormed via the
> Karpathy "think before coding" process at the request of
> Stefan, 2026-05-02.
>
> This doc captures the design hypothesis, the addiction-loop
> analysis, the fraud-detection thinking, the social-good angle,
> and the proposed build sequence in the 12-month plan. The
> implementation lives in Sprint K (proposed addition); see
> §"Build sequence" below.

## TL;DR

Friends or workplaces form a 2-8 person **pod**. Every Monday a
**single weekly challenge recipe** drops, filtered through the
pod's combined dietary constraints. Each member cooks it on their
own time and submits a photo. **The pod's collective completion
rate is the streak** — your friends are waiting on you, not
some abstract gamification number. End of week → all photos drop
simultaneously as a **pod gallery**. Optional opt-in
**"Donate-a-Cook"** layer lets pods track meals shared with
neighbours, charity bake-sale proceeds, etc.

The mechanic is structurally novel: every fitness/learning app
has personal streaks. Almost none have **group streaks where a
specific person you know is the chain link**. That asymmetry is
the bet.

## Karpathy assumptions stated up front

1. **Multi-device is non-negotiable.** A pod can't live on one
   device — by definition every member is on a different phone.
   This means the V1 user-facing launch is **founder-gated**:
   needs auth (Clerk) + DB (Neon Postgres) + photo storage (R2).
   Vibecode work is substrate + mock single-device demo only.

2. **Friend trust beats fraud detection.** People don't fake
   workout photos in their close-friend running clubs. They
   might in an anonymous global leaderboard. Pod size cap 8 +
   self-curated invite list keeps social trust in play. V1
   ships with timestamp-only verification; AI dish recognition
   is a V2 polish.

3. **The challenge is OPT-IN at every layer.** Users who don't
   join a pod see nothing. Users in a pod can skip a week
   without breaking their friendship. Pods can disable the
   leaderboard entirely if it stresses them out (just use the
   gallery).

4. **No accounts inside the app for V1.** Pod identity = user's
   Clerk identity (whenever Clerk lands). No separate login.

5. **The 12-month plan currently has no entry for this.** Sprint
   I (W42-W46) is "cook-along community moments" — adjacent,
   but the simpler/older version. Sprint K (W47-W52) is
   currently "2nd-pass polish on H2 surfaces"; we propose
   replacing some of that with the pod challenge build (and
   pushing polish into Year-2).

## The addiction loop — what makes pods STICKY

Five levers, ranked by load-bearing-ness:

### 1. Group streak loss aversion (LOAD-BEARING)

Personal streaks: "I broke my 12-day streak" — abstract pain.

Group streaks: "Maya and Ben cooked it Tuesday. I'm the one who
hasn't. They're going to notice." Concrete pain. The streak isn't
yours alone — it's a chain where you're a link, and the rest of
the chain has names you actually care about.

Implementation:

- Pod has a "weeks completed" counter. A week is "complete" when
  ≥ N% of members submitted (default N=70, configurable per pod
  to accommodate vacation / sick / etc.).
- Streak resets to 0 if completion drops below threshold.
- Each member's individual streak ALSO tracks within the pod —
  but the salient number is the pod's, not theirs.

### 2. Dropped-simultaneously photo gallery

Sunday 9pm pod-local time: all submitted photos drop together.
Before then, members see "Maya cooked it" but no photo. The
moment of simultaneous reveal turns a week of solo cooking into a
single shared event.

Why this works: it's the same dramaturgy as a Friday-night group
text catching up on the week. Manufactured, but effective.

Implementation:

- Submissions stored privately until end-of-week
- All released at once at a pod-set "reveal time"
- Push notification fires: "Your pod's gallery just dropped"
- Three reaction emoji per photo (👏 ❤️ 🔥) + nothing else (no
  comments in V1 — keeps the surface gentle)

### 3. Variable creative reward

Same recipe, but each pod member plates their own. The
constraint (the recipe) plus the latitude (your kitchen, your
plating, your photo angle) is the structure that creates novelty
without choice paralysis. This is the same shape as Wordle: same
puzzle, different individual experience.

Implementation:

- Recipe has a base spec, but the pod can vote each week on a
  "twist" (vegetarian / spicy / leftover-mode / kids-cook /
  budget). Top-voted twist becomes the constraint.
- No required caption. Optional 1-line "what I'd do differently"
  field surfaces in the gallery.

### 4. Lightweight social proof during the week

Mid-week mid-app glance: "3 of 6 cooked. You and Casey haven't
yet." Not nagging. Not push-notification-spammy. Just visible
when the user opens /community/pod.

Implementation:

- Pod-home page shows a small "this week" tile with the
  challenge recipe + member completion list (avatars + checkmark).
- ZERO outbound notifications until the Sunday reveal.

### 5. Identity reinforcement

"I'm someone who cooks for my friends every week" is a stronger
identity than "I'm someone who logs my meals". The pod surfaces
the identity claim back to the user (badge/title in /path:
"Pod-cook for 14 weeks").

Implementation:

- /path gains a small "Pod" sub-tile in the Your Kitchen grid
  showing pod streak + photo count
- New XP_AWARDS entry: pod_completion += 30 (vs. 10 for solo cook)

## Friction analysis — what makes pods FAIL

### Failure mode 1: invite-friction kills adoption

Pod creator: "Cool, I'll send the code to 5 people." 4 of them
forget. 1 joins, can't see anyone else, loses interest.

**Mitigation:** invite via deeplink (one tap on iOS Messages →
opens Sous → joins pod → done). Falls back to 6-digit code for
non-Sous users (they install + redeem on first open).

### Failure mode 2: dietary mismatch kills the recipe

Pod has a vegan member. Week's recipe is shrimp scampi. Vegan
member can't participate.

**Mitigation:** Pod creation captures dietary constraints (auto-
populated from each member's household-memory profile from
Sprint G/H). Weekly challenge picker filters via the **union**
of all dietary flags. Worst case: the pod has overlapping
constraints so tight that the recipe pool empties — pod admin
sees this and can manually override.

### Failure mode 3: schedule mismatch creates anxiety

Pod sees Maya cooked Monday. Now everyone feels like they should
have cooked Monday. By Friday those who haven't started are
stressed.

**Mitigation:** Don't show day-of-cook publicly. Just show "did
or didn't" — binary. Member-private "I cooked it Tuesday" detail
isn't surfaced until the Sunday gallery drops.

### Failure mode 4: end-of-week reveal needs real-time feel

A real-time reveal needs a backend timer that nudges all clients
simultaneously. Vibecode-doable but adds complexity.

**Mitigation:** Each client polls for the pod's reveal_at
timestamp (set by the server when the challenge week ends).
Client-side comparison-to-now triggers the reveal UI. No
WebSocket. Cheap.

### Failure mode 5: a member drops out

Person leaves the pod or stops engaging. Pod size shrinks, harder
to maintain threshold completion rate.

**Mitigation:** Auto-pause: if a member misses 3 weeks straight,
they're moved to "vacation mode" (don't count toward the
denominator). They can re-engage anytime.

### Failure mode 6: it becomes a chore

The whole thing dies if cooking-for-friends starts feeling like
a job.

**Mitigation:** Pod admin can pause the pod for a week.
"Vacation week: no challenge — see you next Monday." Single tap.
This is the most important affordance — opt-out without leaving.

## Fraud detection — Karpathy "don't over-engineer"

The user surfaced this as a concern: photo timestamping + fraud
detection. Worth thinking through but **not the load-bearing
piece**.

### What we ship in V1

Cheap, real, pragmatic:

1. **Server-side timestamp on submit.** The photo's
   `submittedAt` is set by the server, not the client. Can't
   backdate.
2. **Single submission per member per week.** Resubmissions
   replace the old photo and bump submittedAt. Pod members can
   see if you resubmitted multiple times.
3. **No reuse across pods or weeks.** Image hash check (perceptual
   hash, not cryptographic) — same photo submitted twice gets
   flagged.
4. **EXIF date-taken comparison.** If the photo's EXIF
   `DateTimeOriginal` is more than 7 days before submittedAt,
   flag it for the pod admin (don't block; just surface).
5. **Photo carries the cook-session timestamp from the app.** If
   the user used the in-app photo affordance during a cook
   session, the photo carries that session's start time as
   metadata. This is the strongest signal for non-fraudulent
   submissions.

That's it. No AI. No blockchain. Friend trust does the heavy
lifting.

### What lands in V2 (post-launch)

- **OpenAI Vision dish recognition** — at submit time, vision
  model checks "does this look like ${challengeRecipe.name}?".
  Outputs a confidence score; pod admin sees flagged-low. Doesn't
  block submission.
- **Cross-pod hash check** — photo hash compared against ALL
  prior submissions to ANY pod for that recipe. Catches "borrowed
  photo from Instagram" attacks.
- **Time-correlation with the cook session log** — submission
  must align with a recent cook session for the challenge recipe
  in the user's local cook history.

### What we don't ship

- Cryptographic timestamping (overkill)
- Public-key photo signing (overkill)
- Zero-knowledge proofs (insane overkill)
- Anti-spoof liveness checks (this isn't TikTok)

If the social-trust layer holds, fraud detection above V1
isn't needed.

## Social-good angle — opt-in layer

The user mentioned charity / bake-sale. Don't force it; offer it.

### Donate-a-Cook (V1 — soft)

When submitting a photo, the user can tag:

- 🥡 **"Shared a portion"** — cooked extra for a neighbour /
  coworker / homeless shelter / etc.
- 🍰 **"For the bake-sale"** — pod is doing a real-world
  bake-sale; this cook is a contribution.
- 🤝 **"Cooked together"** — pod members cooked simultaneously
  in person or on a video call.

These tags aggregate to a pod-level counter visible in the
gallery. No payment integration. Self-reported. The honour
system works in friend groups.

### Pod-Pledge-Cook (V2 — financial)

Pod commits to donating $X per completed-week to a chosen
nonprofit. Charged to the pod admin's card monthly. Receipts
surface in the gallery. Founder-gated: needs Stripe + nonprofit
list curation.

### Recipe-from-Charity weeks (V2 — content)

Sous curates recipes from refugee kitchens / community-supported
farms / nonprofit cookbooks. Pod cooks them; portion of platform
revenue flows to the source. Founder-gated: needs editorial
workstream + revenue share agreements.

### Bake-sale tooling (V3 — civic infrastructure)

For pods running real bake-sales: shared shopping list, role
assignment, table-staffing schedule, a "we raised $X for Y"
post-mortem card the pod can share. Not a payment processor —
just coordination. Founder-gated: real surface area, real users
needed first.

## Where it lives in the app

User said "content/community section somewhere minimal." Right.

### The home

`/community/pod` — pod home. Three states:

1. **No pod yet (most users)** — small "Cook with friends"
   tile inviting pod creation or invite-code redemption. One tap.
2. **In a pod, mid-week** — challenge recipe card + member
   completion list (binary, no day-of-cook info) + a "Cook this
   week's challenge" button that deeplinks to /cook/<slug> with
   the pod context attached.
3. **In a pod, gallery week** — photo grid of all submissions +
   reaction emoji per photo + the optional "what I'd do
   differently" line + pod stats (streak, total cooks, meals
   shared).

### Entry point in the existing nav

The Content tab gains one tile in its home grid. Stays minimal
per CLAUDE.md rule 6. The pod challenge is NOT a separate
top-level tab; it sits inside Content.

### Cook-flow integration

The Win screen on `/cook/[slug]` gets a single new affordance:
when the user is in a pod and the dish matches the week's
challenge, the photo upload shows a "Submit to pod challenge"
toggle. One tap. Inherits from existing handleAddPhoto.

That's it. **No new flow to learn for the user who's already
cooking.**

### What's NOT in the surface

- No public city leaderboard in V1 (adds anxiety, requires
  moderation)
- No comments (just emoji reactions)
- No DMs between pod members
- No notifications until the Sunday reveal
- No real-time chat
- No public profile pages

## Build sequence — proposed Sprint K (W47-W52)

The current 12-month plan has W47-W51 as "2nd-pass polish on
H2 surfaces" and W52 as Year-1 close. We propose:

- Push polish to early Year-2 (most surfaces are already at 4.0+
  per the Sprint H IDEO)
- Sprint K = Cooking Pod Challenge build
- W52 stays Year-1 close

### W47 — Schema + pure helpers

`ChallengePod`, `PodMember`, `PodChallengeWeek`, `PodSubmission`
zod schemas. localStorage-hook substrate (single-pod-per-device
V1). Pure helpers: `weekKey(date)`, `aggregateDietaryFromMembers`,
`computePodCompletion(submissions, members, threshold)`,
`shouldRevealGallery(weekStartedAt, now)`. Tests for everything.

**Acceptance:** all helpers unit-tested; types compile; no UI.

### W48 — `/community/pod` home (mock single-device)

Pod home page. Pre-hydration skeleton, no-pod CTA, in-pod
mid-week view, in-pod gallery view. Reads from a single localStorage
pod fixture — multi-device wiring is W51 founder-unlock.
Win-screen integration: "Submit to pod challenge" toggle when the
fixture indicates an active challenge.

**Acceptance:** all three states render correctly with mock
fixtures; toggle on win screen writes to the local pod state;
gallery shows a 4-photo grid.

### W49 — Pod creation + invite-code flow (mock)

Pod creation form (name, member roster, dietary intersection
display). Invite code generation (6-digit, localStorage-only).
Redemption page at `/community/pod/join` accepts a code and
mock-joins. Photo dedupe via perceptual hash.

**Acceptance:** localStorage round-trip of a 4-member pod creation

- 4 mock submissions; reveal-time computation lands at Sunday
  9pm pod-local; perceptual hash dedupes the same photo.

### W50 — Donate-a-Cook tagging + dietary-aware challenge picker

Photo submission gains the three opt-in tags (shared / bake-sale
/ cooked-together). Pod-home gallery aggregates the counts.
Weekly challenge picker (deterministic, week-key-seeded) filters
the seed catalog by the pod's dietary union and picks a recipe.

**Acceptance:** pod with any dietary constraint surfaces only
compatible recipes; tags surface in the gallery sub-line.

### W51 — Founder-unlock prep + IDEO Sprint-K close

Schema-on-Postgres prep stub. R2 photo upload contract stub.
Stripe + nonprofit list research note (Donate-a-Cook V2 prep).
IDEO review.

**Acceptance:** founder-unlock-runbook gets a new entry; all
mock-multi-device wires have explicit "→ Postgres" comments at
the swap points; IDEO close doc shipped.

### W52 — Year-1 close (unchanged from existing plan)

`docs/YEAR-1-RETROSPECTIVE.md` + Year-2 kickoff. The pod challenge
infrastructure ships behind a flag; surfaces visible to the
founder + flagged users only. Public launch is a Year-2 W1-W4
beat (auth + DB + R2 + Stripe).

## Year-2 follow-on (post-W52)

### Y2 Sprint A: Pod backend + auth + R2 (founder-gated)

Real multi-device pods. Postgres tables, Clerk-tied membership,
R2 photo storage, server-side reveal scheduling, push notifications.

### Y2 Sprint B: Workplace pods

Email-domain auto-grouping. Workplaces ≥ 8 members get optional
sub-pods (departments). Anonymous-mode for shy participants.

### Y2 Sprint C: City-level aggregate

Opt-in "your city cooked X meals this week" feel-good number.
NOT a leaderboard between pods (anxiety / moderation surface).

### Y2 Sprint D: AI verification + Pod-Pledge-Cook

OpenAI Vision dish recognition. Stripe + curated nonprofit list.
Pod-Pledge-Cook financial donation flow.

### Y2+: Bake-sale tooling, charity recipe weeks, pod marketplace

Long-tail features that depend on real-user signal.

## Why this is a good Year-1 bet

Three reasons it should land in Year-1 rather than Year-2:

1. **It compounds the Year-1 work.** Household memory (Sprint G+H),
   pairing engine V2, recipe authoring, attention pointers — all
   were built for individual users. Pods are the multi-user
   surface that makes those investments visible to the user's
   friends.

2. **It's the "what's the moat" answer.** A recipe app's moat is
   either content (which we don't own) or social structure
   (which we can build). Pods are social structure with cooking
   as the substrate. A user who's in a 6-week pod streak with
   their college friends doesn't churn.

3. **It's the most plausible viral loop in the product.** "Join
   my Sous pod, here's the code" is share-able in a way that
   "try this app I like" isn't. The invite is functional, not
   promotional.

## What would kill this feature

- If we ship V1 with a real backend before validating that
  friend groups will actually form pods
- If we ship the leaderboard before the gallery (anxiety > joy)
- If we let pods grow beyond 8 (intimacy lost)
- If we enable city/global leaderboards in V1 (moderation
  problem)
- If we monetise the social-good angle in V1 (legitimacy
  question)

## Open questions for Stefan

1. **Sprint K scope:** is replacing W47-W51 polish with pod-
   challenge build the right call, or should we squeeze a
   smaller pod MVP into Sprint I (cook-along) and keep the
   polish week?
2. **Vibecode-only V1 acceptable?** Single-device mock with
   "Pod backend lands Year-2" caveat — vs. delaying the design
   ship until auth/DB are unlocked.
3. **Reveal cadence:** weekly Sunday 9pm pod-local. Is that
   right? Some pods may want Friday or Saturday.
4. **Pod admin model:** single creator-as-admin, or shared
   admin?
5. **Recipe pool for the weekly pick:** seed catalog only, or
   include user-authored fork recipes?
6. **Donate-a-Cook V1 honour-system OK?** Or wait for Stripe.
