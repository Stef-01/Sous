# Sous — Critical Moat Appraisal (2026-06-18)

A skeptical-investor read of _defensibility_, grounded in both the strategy docs
(`STRATEGY.md`, `ROADMAP.md`, `docs/20-WEEK-AUTONOMOUS-MOAT-PLAN.md`) and the
actual code. The uncomfortable thesis: **Sous confuses quality with
defensibility.** It is a beautifully engineered, genuinely complete product — and
almost everything labelled "moat" is either copyable in under a month, or a real
moat that _doesn't exist yet_ because it sits behind a founder gate nobody has
cleared.

## The purported moat (STRATEGY.md)

> §1.1 "Intelligence over inventory… The engine's understanding of flavor
> contrast, nutritional balance, and prep burden is the moat, not the catalog
> size."

Five claimed, compounding moats (§2): **Data** (preference memory), **Content**
(guided-cook flows), **Behavioral** (habit loop), **Engine** (deterministic
pairing), **Network** (cook-together / shared recipes).

## Moat-by-moat, brutally

| Moat                                         | Verdict                                   | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Engine** ("intelligence over inventory")   | **WEAK — days to copy**                   | `scorers/flavor-contrast.ts` is a 96-line hand-coded lookup + `name.includes("curry")` keyword matching. Good, legible engineering — but no proprietary data, no learned model. A funded competitor calls an LLM and skips the tables. A deterministic ruleset is the _opposite_ of a moat: fully inspectable, zero data dependency.                                                                                                                     |
| **Data** (preference memory)                 | **REAL thesis, EMPTY today**              | Could genuinely compound — but it's all `localStorage` under a random per-browser device-id. No accounts ⇒ nothing durable to switch away from. And the V3 trainer that would sharpen it was measured and **cut** (W4: underperforms V2 by 3.6–5.3pp, overfits sparse histories). A credible flywheel with zero accumulated data.                                                                                                                        |
| **Content** (guided-cook library)            | **WEAK–MODERATE, small**                  | 97 meals / 223 sides, ~35% meal coverage. "500 cook flows" is a weekend of LLM generation for a competitor; rule 7 (no invented recipes) actively slows _our_ velocity. Editorial quality is real; editorial _volume_ is not a moat in the LLM era.                                                                                                                                                                                                      |
| **Behavioral** (habit loop)                  | **REAL but UN-OWNED**                     | Streak/quest/win/scrapbook is sticky in principle — but §11 lifts every primitive from named apps (Duolingo/Headspace/Noom/Centr). You can't moat with patterns you're copying from the same source a competitor copies from.                                                                                                                                                                                                                            |
| **Network** (cook-together / shared recipes) | **DIDN'T EXIST — now partly switched on** | Cook-Together is a stub. Gifting is an `sms:` link. The one true network candidate, cross-clinician shared recipes, was **dead until 2026-06-18** (see below).                                                                                                                                                                                                                                                                                           |
| **Clinician / therapeutic credibility**      | **THE REAL WEDGE — dormant**              | The therapeutics registry (`src/data/therapeutics/interventions.ts`, GRADE levels + effect sizes + CIs) is the most _original_ asset in the repo and a wedge no consumer recipe app has. But every record is `unreviewed`, DOIs are deliberately omitted, and re-ranking is gated behind `registryIsClinicianApproved()` (hard-`false`). The credibility moat's entire value — _a real clinician vouching_ — is exactly the part that doesn't exist yet. |

## The core gap

All five moats share one hidden dependency the strategy never confronts: **they
only compound with real, retained, identified users on a real backend** — and
Sous has none. No accounts (Clerk bypassed, random device-ids ⇒ no switching
cost). No clinician sign-off (the wedge is disclaimed away). Until 2026-06-18, no
working cross-user write path. The 20-week "moat plan" is honest that these are
founder-gated — then spends its actual weeks on the _opposite_ of the moat (a
10-round Doberman/animation polish sprint). **The work flows to commodity craft
while every load-bearing moat dependency sits behind a gate nobody has cleared.**

## What would ACTUALLY make Sous defensible (ranked: defensibility × AI-feasibility)

1. **Proprietary pairing-outcome data flywheel.** The engine is commodity; _what
   users cooked + rated after each suggestion_ is not. Log every
   (suggestion → accept/reject → cook → rating) tuple as a first-class,
   exportable dataset, and train on _aggregate cross-user_ acceptance (the fix
   for V3's overfit). A competitor can copy your rules but not your accept-rate
   data. Fully AI-buildable now. This turns "intelligence over inventory" from a
   slogan into an asset.
2. **The clinician/therapeutic wedge, made real.** A clinician-vouched,
   condition-aware food recommender is defensible because credibility is
   relationship- and liability-bound, not code. Autonomous prep: attach real DOIs
   to the registry NOW (don't wait for the gate), build the review-stamp UI so a
   real RD sign-off is one flip. Stefan's Stanford affiliation is the unfair
   advantage the whole repo is quietly built around — **treat clearing this gate
   as priority #1, not a footnote.**
3. **Household / multi-user lock-in.** A shared kitchen with two taste profiles
   is a _social_ switching cost (re-onboard your whole household elsewhere). The
   blending engine already exists (the "Cook for two" knob); it needs accounts.

Everything else — streaks, games, the pet, animation polish, gifting — is
retention craft. Necessary. Not a moat.

## Does the recent work strengthen the moat?

- **The Doberman + animation sprints:** high-quality polish on a commodity core.
  Helps _retention_ (which feeds the data moat _if_ data is captured durably) —
  but a competitor adds it in two weeks. Retention features dressed as strategy.
- **Cross-clinician sharing (fixed 2026-06-18):** This one _does_ point at a real
  moat (network + credibility). It was 80% built and 100% dormant — silently
  broken by an un-applied `source_tags` migration (every write threw `42703` and
  was swallowed; `user_recipes` sat at 0 rows). **Now fixed + hardened.**
  Finishing the founder side of the clinician wedge is worth more than ten more
  weeks of pet polish.

## Bottom line

One genuine potential wedge (clinician-graded therapeutic cooking via a Stanford
affiliation) and one genuine potential flywheel (cross-user pairing-outcome data).
**Neither was switched on.** The team is demonstrably capable of shipping — but it
is _out-engineering its own moat._ The defensibility risk isn't that the moat is
shallow; it's that **the moat has never been turned on, and the roadmap keeps
choosing the parts that don't require turning it on.** The two highest-leverage
moves are both available now: (1) instrument the pairing-outcome data flywheel,
(2) clear the clinician gate (real DOIs + review UI + a real RD sign-off).
