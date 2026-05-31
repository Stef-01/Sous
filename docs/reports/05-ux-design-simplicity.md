# 05 — UX, Visual Design & Simplicity-Discipline Review

> **Reviewer role:** Design/UX Lead (critical appraisal).
> **Date:** 2026-05-31.
> **Scope:** Today page + Today components, Guided-Cook flow (mission/grab/cook/win),
> result stack, tab bar, profile sheet, design tokens, motion/accessibility.
> **Method:** Static read of UI code + layout classes + token files. The dev
> server is held by another process, so nothing was rendered visually — every
> "below the fold" / contrast / density claim is **reasoned from layout
> classes and component structure**, and is flagged where inference replaces
> observation. Build/test/dev were not run (per instructions).

---

## TL;DR verdict

The **Guided-Cook flow is the strongest part of the product** and is close to
exemplary: a clean four-phase state machine (Mission → Grab → Cook → Win), one
unmistakable primary action per phase, `mt-auto` CTA pinning on the Mission
screen, and a subordinate/dominant button hierarchy that nails rule 2. Rule 4
(quest-shell consistency) holds — internal, user-authored, and combined cooks
all route through the same `/cook/[slug]` shell + `DeadEndShell` fallback.

The **Today page is where discipline is eroding**, but **not on cold-start**.
A brand-new user sees a clean hero (header + search bar + swipe card + a
whisper-quiet "More options" link). The problem is **accretion for engaged
users**: the page renders **up to 13 stacked sections above and around the hero
swipe card**, ~9 of which are conditional chips that progressively light up as a
user accumulates cooks, a pantry, a household, a meal plan, and Eco Mode. A
loaded-up power user can have 6–8 chips stacked **above** the QuestCard,
pushing the actual swipe interaction far down the scroll. The Sous Test ("does
this make the user cook?") is passed individually by most chips but the
**aggregate** drifts toward an information feed, which is the rule-6 failure
mode the doc explicitly warns about.

Two cross-cutting issues are notable:

1. **Reduced-motion is partially fake-clean.** `REDUCED-MOTION-GATE-TODO.md`
   claims "284 → 0, 100% cleared," but **47 files import `useReducedMotion()`
   and then immediately `void` it** while still running unconditional Framer JS
   entrance/spring animations. The global CSS `prefers-reduced-motion` block
   catches CSS animations/transitions but **does not** touch Framer's
   Web-Animations-API-driven motion. So those 47 files genuinely do not honor
   the user's OS setting for their JS motion. (High)
2. **The one sanctioned settings surface has scope-crept.** The owl→Profile
   sheet now holds **8 sections / 7 toggles** (Parent Mode, Eco Mode, learned-
   Preferences editor, Voice cook, Visual mode, Demo reset, About, Profile
   placeholder). Rule 3 sanctioned only "Parent Mode toggle + age band picker,
   a profile/auth placeholder, and the about/disclaimer." The rest was added
   without the "written rule-3 amendment" the rule requires. (High)

---

## Does Today still pass the Sous Test?

**Cold-start: YES.** **Engaged-user steady state: MARGINALLY, trending NO.**

`src/app/(today)/today/page.tsx:515-597` — the `<main>` is `space-y-5` with
`pb-24` and renders, in order:

| #   | Surface                            | Cold-start?              | File                           |
| --- | ---------------------------------- | ------------------------ | ------------------------------ |
| 1   | CravingSearchBar (primary trigger) | shows                    | `bird-mascot.tsx`              |
| 2   | CookRhythmLine                     | **null** (no rhythm)     | `cook-rhythm-line.tsx:18`      |
| 3   | TonightChip (banner-only)          | null unless committed    | `tonight-chip.tsx`             |
| 4   | RepeatCookChip                     | **null**                 | `repeat-cook-chip.tsx:67,87`   |
| 5   | TodayPlannedSlot                   | **null**                 | `today-planned-slot.tsx:66-67` |
| 6   | CookAgainChip                      | **null**                 | `cook-again-chip.tsx:35`       |
| 7   | DailyNoveltyChip                   | **null** below threshold | `daily-novelty-chip.tsx:96`    |
| 8   | WhosAtTable                        | **null** (no members)    | `whos-at-table.tsx:49`         |
| 9   | WeeklyRhythmWidget                 | **null** (<2 cooks/wk)   | `weekly-rhythm-widget.tsx:44`  |
| 10  | EcoProgressChip                    | **null** (eco off)       | `eco-progress-chip.tsx:46-47`  |
| 11  | **QuestCard** (the hero)           | shows                    | `quest-card.tsx`               |
| 12  | "More options" link                | shows (quiet)            | inline                         |
| 13  | FriendsStrip                       | shows seeded friends     | `friends-strip.tsx:105,137`    |

The progressive-null design is **good rule-6 engineering** — the chips are
silent until earned. But all nine chips render **before** `<QuestCard>` in the
DOM (lines 521–563 precede line 566), so every chip that lights up pushes the
hero swipe card further down. There is no cap on how many can stack. This is a
**rule-1 / rule-6 violation by accretion** that only manifests for engaged
users — exactly the population the screenshots of a fresh install won't reveal.

---

## Severity-ranked findings

### CRITICAL

**C1 — QuestCard primary actions fall below the fold at 375×667 (rule 10).**
`src/components/today/quest-card.tsx:811-812`. The card-stack container is
`style={{ minHeight: 460 }}` and the code's **own comment admits it**:

```
{/* Card stack container - minHeight 460 pushes action chips below fold at 375×667 */}
<div className="relative" style={{ minHeight: 460 }}>
```

The card's "Start cooking" / "Find sides" CTA + heart-save row live at the
**bottom of a 460px+ card** (`quest-card.tsx:1264-1317`), which itself sits
**below** the header (~64px), search bar (~56px), and any lit chips. On a
375×667 viewport the visible area below the header is ~600px; a 460px card that
starts even ~130px down means the CTA row sits at ~590–640px — at or past the
fold before any chip is added. Rule 10 says the primary CTA "must be visible
without scrolling… This is non-negotiable." Swipe-right is an alternative path
to the same action, but the _button_ — the discoverable, accessible,
keyboard-reachable CTA — is below the fold. **Fix:** cap the hero card so its
action row clears the fold (reduce image aspect, tighten meta rows, or pin the
action row with `position: sticky`/flex `mt-auto` inside a height-bounded card),
and/or move the lit chips below the QuestCard so the hero is the first thing
under the search bar. _(Inference: exact pixel position depends on rendered font
metrics + how many chips are lit; the code comment itself asserts the below-fold
outcome, so confidence is high.)_

---

### HIGH

**H1 — Reduced-motion gate is satisfied by `void`, not honored (accessibility).**
47 files (`grep "void reducedMotion"`) import `useReducedMotion()` and discard
it. Concretely, `src/components/today/cook-again-chip.tsx:30-31` calls the hook,
`void`s it (line 31), then line 51-52 runs `initial={{ opacity: 0, y: 4 }}
animate={{ opacity: 1, y: 0 }}` unconditionally. `result-stack.tsx:67-68` and
`tab-bar.tsx:15-16` do the same. The global CSS block
(`globals.css:379-413`) zeroes CSS `animation`/`transition` durations under
`prefers-reduced-motion` — that correctly kills shimmer, cta-glow, streak-flame
— **but Framer Motion's `animate`/spring transforms run via the Web Animations
API and are not CSS transitions**, so the media query does not stop them. Net:
the entrance slides/fades, the win-screen icon wobble (`win-screen.tsx:536-538`
rotates `[0,-12,12,-12,12,0]`), and the swipe-card springs still play for
reduced-motion users in those 47 files. `REDUCED-MOTION-GATE-TODO.md` declaring
"100% cleared" and flipping the lint rule to `error` is **misleading** — the
lint rule checks for the _import's presence_, which `void` satisfies without a
behavioral gate. **Fix:** the files that should actually gate (entrance motion,
the win-screen wobble, card springs) need `initial={reducedMotion ? false :
…}`. The lint rule should detect `void <hook>` as a non-use, or require the
value flow into a `transition`/`initial`. The pages/components that genuinely
have no JS motion to gate (e.g. the snap-scroll carousels in `content/`) can
keep `void` but should carry a one-line comment saying so.

**H2 — Owl→Profile sheet has scope-crept past the rule-3 amendment.**
`src/components/shared/profile-settings-sheet.tsx` renders **8 sections**:
Profile placeholder (103), Parent Mode + age band (123), **Eco Mode (239)**,
**learned-Preferences editor (245)**, **Voice cook toggle (250)**, **Visual
mode toggle (301)**, **Demo reset (348)**, About (379). Rule 3 sanctioned only
"Parent Mode toggle + age band picker, a placeholder for future profile/auth,
and the about/disclaimer," and explicitly says: "Never expose filter panels,
preference checklists, multiple settings screens, or push other configuration
into this sheet **without a written rule-3 amendment**." The PreferencesSection
is literally a preference checklist/editor; Eco/Voice/Visual are three more
config toggles. Each was individually rationalized in-comment as "lives in the
single Settings sheet per rule 3," but collectively this is now a 7-control
settings page — the exact thing rule 3 guards against. **Fix:** either (a) file
the written rule-3 amendment in CLAUDE.md enumerating the now-permitted controls
and the principle that bounds future additions, or (b) relocate the learned-
Preferences editor (it's behavior-derived and arguably belongs nowhere per the
"preferences are learned, not configured" doctrine) and fold Voice/Visual into a
single "Cooking mode" sub-group. As-is it's an undocumented rule-3 breach.

**H3 — Design-system token layer is documented but not adopted (consistency
debt).** `DESIGN-SYSTEM.md §1.1` states colors are "consumed via the typed map
in `src/styles/tokens.ts`" with a `color('brandPrimary')` accessor. The files
exist (`src/styles/tokens.ts`, `src/styles/motion.ts`, `withReducedMotion`
helper) **but have 0 consumers** in `.tsx` (`grep 'from "@/styles/tokens"'` →
0). Every component instead hardcodes `bg-[var(--nourish-green)]` Tailwind
arbitrary values inline. Same for motion: `motion.ts` exports `SNAPPY/SHEET/
GLIDE/RM` presets and `withReducedMotion`, but components inline `{ type:
"spring", stiffness: 400, damping: 15 }` everywhere (e.g. `quest-card.tsx:1273,
1302`; `win-screen.tsx` repeats `stiffness:260,damping:25` ~8 times). The
abstraction layer the design system claims is canonical is **dead code**;
the real system is ad-hoc-Tailwind-with-CSS-vars. This is survivable (the CSS
vars do give one source of truth for color) but it means: (1) the dark-mode
swap the doc promises is untested in practice, (2) motion tuning is copy-pasted
and drifts, (3) the doc oversells the system's maturity. **Fix:** either delete/
demote the unused accessor docs to "proposed," or do a mechanical pass routing
spring configs through the `motion.ts` presets so the reduced-motion gate is
enforced _by construction_ (this also fixes a chunk of H1).

---

### MEDIUM

**M1 — Micro-copy contrast fails AA at reduced opacity.** `--nourish-subtext`
(#6b6b6b) on `--nourish-cream` (#fafaf8) computes to ~5.2:1 — passes AA for
body. But the app routinely renders it at **10–11px with `/80` and `/70`
opacity**: e.g. the header welcome line `today/page.tsx:502`
(`text-[10px] text-[var(--nourish-subtext)]/80 italic`), the gift-sender hints
and About sub-line (`profile-settings-sheet.tsx:388` `/70`), `win-screen.tsx:734`
(`/70`). At `/70`, the effective color over cream is ≈ #9a9a9a ≈ **2.9:1**,
which **fails** AA (4.5:1 for <18px). This is small ambient copy, but it's
pervasive. **Fix:** stop layering opacity on the subtext token for readable
copy; if a softer tone is wanted, define a dedicated token at a contrast-checked
value. _(Inference: computed from token hex + Tailwind opacity semantics; not
measured on-screen.)_

**M2 — Today hero ordering puts conditional chips above the hero.** Independent
of C1's height issue: even when only 2–3 chips are lit, they render _above_ the
QuestCard. The hero of the screen (per the inline comment "the hero of this
surface", `today/page.tsx:565`) should be first under the search bar. **Fix:**
move the chip cluster (lines 521–563) to render **below** the QuestCard, or
collapse them into a single rotating "smart chip" slot (the app already has the
machinery — DailyNoveltyChip/CookAgainChip/RepeatCookChip are mutually
exclusive-ish and could share one slot). This directly de-risks C1 too.

**M3 — Win screen is a long scroll despite the "above fold" docstring.**
`win-screen.tsx:344-350` claims the layout shows all key elements above fold,
and the _celebration + stars + primary "Back to Today"_ genuinely do (primary
CTA is first in the CTA group, line 756, dominant green — good rule-2). But the
surface then continues for ~600+ px: save link, send-to-friend, invite prompt,
photo/note/again row, pod-submit card, Parent-Mode block (3 components), note
textarea, reflection accordion. That's fine _because_ the primary action is high
and everything below is genuinely secondary/optional — but the docstring
overstates it, and the sheer count of post-win surfaces is a rule-6 watch-item
(the win screen is doing celebration + rating + 3 share paths + parent nutrition

- pod + reflection). **Fix:** no urgent change; trim the docstring claim and
  consider gating the share-cluster behind a single "Share" affordance so the win
  moment breathes.

**M4 — Two equally-weighted CTAs in the search "results: none" / error blocks.**
Minor, but the engine-error block (`today/page.tsx:774-794`) and the camera
recognition-error states present a "Try something else"/"Try again" text button
as the only action — fine. The genuinely good news: ResultStack
(`result-stack.tsx:288-348`) is **textbook rule 2** — "Cook selected" is the one
solid CTA, "Reroll all" is a demoted text link, "Evaluate plate" is a bordered
secondary. No violation here; flagging only that the multiple error-state copies
are slightly inconsistent in tone ("Try something else" vs "Try again" vs the
amber recognition copy).

---

### LOW

**L1 — Focus-visible ring coverage is partial.** 48 of 116 button-bearing files
use `focus-visible:` rings (`grep`). Core flows are covered (step-card nav
`step-card.tsx:256,505,622`; search popout; carousel links). But many Today
chips and the win-screen action buttons rely only on `whileTap` + default
`:focus`, so keyboard users get inconsistent focus indication. **Fix:** add the
standard `focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40`
token class to the shared button patterns (or, per H3, route buttons through a
shared primitive that bakes it in).

**L2 — Radius scale is loosely held but not chaotic.** Across today + guided-
cook: `rounded-full` ×92, `rounded-xl` ×55, `rounded-lg` ×33, `rounded-2xl` ×30,
plus stray `rounded-md`/`-sm`/`-3xl`. Cards are mostly `2xl`, buttons mostly
`xl`, pills `full` — a coherent-enough system, but the `lg`/`md`/`sm` strays
(33+6+3) suggest no enforced scale. Primary-CTA vertical padding also varies
(`py-3.5` mission/win, `py-3` result-stack, `h-[42px]` quest-card) so the main
button is ~2–4px different in height across surfaces. **Fix:** one `<Button
variant="primary">` primitive would collapse this; low priority.

**L3 — `quest-card.tsx` is a 1,321-line / 50KB single file.** It mixes pure
ranking helpers (`buildQuestDishes`, `decideSwipe`, `exitDistanceFor`), the
stack controller, and the `SwipeCard` renderer. It's well-commented and the pure
helpers are exported for test, but it's a maintainability smell and makes the
rule-6 "every element earns its pixels" audit hard to do at a glance (the card
renders: image, skip button, title, verified badge, description, time+
ingredients+Popular row, pantry-fit chip, flavor-tags row, rationale line,
ingredient-reuse line, kid-friendly hint, kid-swap chip, nutrient spotlight,
heart, CTA — **up to 15 elements on one card**, most conditional). The card
itself is at risk of the same accretion as the page. **Fix:** none urgent;
consider extracting `SwipeCard` and the helpers, and audit whether all 15
possible card elements truly drive cooking (the rationale + ingredient-reuse +
pantry-fit lines are three separate "why" signals competing for the same glance).

---

## What is genuinely good (keep / defend)

- **Guided-Cook phase machine** (`cook/[slug]/page.tsx`): one primary action per
  phase, clean back-stack, `DeadEndShell` guarantees no dead-ends (rule honored).
- **MissionScreen no-scroll discipline** (`mission-screen.tsx:53,199-219`):
  `min-h-[calc(100dvh-160px)]` + `mt-auto` on the CTA is the _exact_ rule-10
  pattern. `line-clamp-2`/`line-clamp-3` on title/description keep the CTA up.
  This is the template the QuestCard should follow.
- **StepCard nav** (`step-card.tsx:548-605`): subordinate "Back" (outline,
  shrink-0) vs dominant "Next/Done!" (flex-1, solid green) — model rule-2.
- **ResultStack** — model rule-2 + rule-6 (single CTA, demoted reroll, single
  metadata line, removed the old four-percentage "dashboard").
- **MoreOptionsSheet** (`more-options-sheet.tsx`): correctly pulls Tonight-
  commit, Cook-for-two, Rescue-fridge, Games, Personalize, Eat-out _off_ the
  hero into a one-tap drawer — real rule-6 work, and the docstring shows the
  reasoning.
- **Sheet infrastructure** (search-popout, profile-sheet) migrated to `vaul`
  (RCA commit dcced3e) — keyboard-aware, proper `Drawer.Title/Description`,
  sticky close, consistent `z-[60]`/`z-[59]` stacking. Good.
- **Cold-start progressive-null chips** — the right instinct; the chips earn
  their way onto the screen rather than shipping empty.
- **Color tokens via CSS vars + dark-mode override scaffold** (`globals.css`):
  one source of truth for color, even if the typed accessor is unused.
- **Big-hands + cook-prose tokens** (`globals.css:95-119`) and the edge-tap
  nudge (`step-card.tsx:573-581`) — thoughtful senior/accessibility affordance.

---

## Rule-by-rule scorecard

| Rule                                      | Status      | Note                                                                                                    |
| ----------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| 1 — Sous Test (Today)                     | ⚠️ Marginal | Pass cold-start; chip accretion erodes it for engaged users (M2, L3).                                   |
| 2 — One primary action                    | ✅ Pass     | Cook flow, ResultStack, Win screen all model it. No two-equal-CTA screens found.                        |
| 3 — No settings except owl sheet          | ❌ Breach   | Sheet scope-crept to 7 toggles w/o written amendment (H2).                                              |
| 4 — Quest-shell consistency               | ✅ Pass     | Internal/user/combined all route through `/cook/[slug]` + DeadEndShell.                                 |
| 6 — Simplicity-first                      | ⚠️ Mixed    | Strong removals (MoreOptions, ResultStack); weakened by Today chip stacking + 15-element card (M2, L3). |
| 10 — No-scroll CTA                        | ❌ Breach   | QuestCard CTA below fold by the code's own admission (C1). Mission/Step screens pass.                   |
| 11 — Current feature state                | ✅ Honored  | FriendsStrip below fold w/ seed data; Path/Content tabs always visible; quiz first-visit only.          |
| Reduced-motion (design-system commitment) | ⚠️ Partial  | 47 files `void` the gate; global CSS catches only CSS motion (H1).                                      |

---

## Recommended fix order

1. **C1 + M2 (one change):** move the conditional chip cluster below the
   QuestCard _and_ cap the card height so its CTA clears the 375×667 fold. This
   resolves the only hard rule-10 breach and the worst rule-6 accretion in one
   edit. _(Verify by rendering at 375×667 with a power-user fixture once the dev
   server is free.)_
2. **H2:** decide — amend CLAUDE.md rule 3 to enumerate the permitted sheet
   controls, or relocate the Preferences editor. Don't leave it undocumented.
3. **H1 + H3 (paired):** route spring configs through `motion.ts` presets +
   `withReducedMotion`, which gates motion by construction and kills the `void`
   anti-pattern; tighten the lint rule to reject `void <hook>`.
4. **M1, L1:** contrast-safe subtext token + shared focus-visible ring.
5. **L3:** extract `SwipeCard` + helpers; audit the 15 card elements against the
   Sous Test.

---

_Inference caveats: C1 fold position, M1 contrast ratios, and "engaged-user
density" are computed from layout classes, token hex values, and conditional-
render logic — not from a rendered screen. The dev server was unavailable for
visual confirmation. Everything else is direct from source._
