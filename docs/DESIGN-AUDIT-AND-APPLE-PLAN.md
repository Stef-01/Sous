# Sous — Design Audit + Apple-Level Quality Plan

> **Date:** 2026-05-31 · **Method:** live audit of the running app at mobile
> viewport (390×844, the product's target), gstack `design-review` skill.
> Screens reviewed: Today (first-run + real), Path, Content, Games, Guided
> Cook. Design system extracted from the rendered DOM, not the source.
> Evidence: `~/.gstack/projects/Stef-01-Sous/designs/design-audit-20260531/`.
>
> **Verdict up front:** the core surfaces are genuinely good. The cook flow
> and the real Today page are close to Apple-level already. What holds the
> app back from that bar is not the canvas, it's three things: first-run
> interstitials that hide the product, a type scale that isn't a system,
> and one screen (Games) that looks AI-generated. Fix those plus a real
> token layer and motion pass and this is an Apple-grade app.

---

## Part 1 — Design Audit (current state)

### Scores

| Category            | Weight | Grade  | One-line reason                                                                                                         |
| ------------------- | :----: | :----: | ----------------------------------------------------------------------------------------------------------------------- |
| Visual hierarchy    |  15%   | **B**  | Strong on cook/Today (one focal image), but heading _semantics_ are inverted and Games has no focal point               |
| Typography          |  15%   | **B−** | Good pairing (DM Serif Display + Inter), but the scale isn't systematic and a third font (Geist) leaks in               |
| Spacing & layout    |  15%   | **B+** | Calm, paper-white, generous. Some screens float content in dead center with large empty margins                         |
| Color & contrast    |  10%   | **B**  | Coherent sage-green + warm paper + grays. Secondary text sits just under AA. Games breaks the palette                   |
| Interaction states  |  10%   | **B−** | Toggles/chips present; filter chips are 27px tall (under the 44px touch minimum)                                        |
| Responsive          |  10%   | **B+** | Mobile-first and it shows; renders cleanly at 390                                                                       |
| Content / microcopy |  10%   | **B−** | "What are you craving?", "Let's gather", flavor tags are great. "Welcome to Sous / Answer 5 quick questions" is generic |
| AI-slop             |   5%   | **B**  | Mostly clean: real food photography, restrained palette, no purple gradients. Games is the exception                    |
| Motion              |   5%   | **B**  | Framer Motion is wired (confetti, transitions); no systematic motion language yet                                       |
| Performance feel    |   5%   | **B+** | Console clean (zero errors), fast paint                                                                                 |

**Design Score: B (≈ 3.3/4).** **AI-Slop Score: B** — "Tasteful almost everywhere; one screen wandered into the template zone."

This is a real product with taste, not a vibe-coded shell. The grade ceiling is being set by a small number of high-leverage problems, which is the good kind of problem.

### Inferred design system (as rendered)

- **Fonts:** `DM Serif Display` (display/headings), `Inter` (body/UI). A deliberate, characterful pairing. A third family, `Geist` (the Next.js default), leaks into some nodes — unintentional.
- **Color:** warm paper `#FAFAF8` canvas, near-black `#0D0D0D` ink, one accent `rgb(45,90,61)` "nourish green", a gray ramp (`#6B6B6B`, `#757575`). Coherent and warm. The Games screen introduces unrelated pastels (purple, pink, teal, tan) that belong to no system.
- **Type scale (the problem):** rendered headings are `H1 "Sous" 18px/600`, `H2 "Meal queue" 12px/600`, `H3 "Masoor Dal" 30px/400`, `H2 "Community this week" 11px/700`. The visually-largest text is an H3; the H1 is small; sizes jump 18 → 12 → 30 → 11 with no ratio. Hierarchy is being done by hand per screen, not by a scale.
- **Radius/elevation:** soft rounded cards and pills, light shadows. Consistent enough, not yet tokenized.

### First impressions, per screen (opinionated)

**Today (first run) — the literal first thing a new user sees.**
A full-screen modal: a chef-hat glyph in a sage circle, "Welcome to Sous", "Cook confidently tonight", "Answer 5 quick questions so we can personalise every suggestion to your taste", and a green "Let's get started". It is centered, airy, and competent. It is also an interstitial standing between the user and the product, and "Welcome to [X]" is the single most generic hero line there is. The value prop line ("Cook confidently tonight") is good and is buried under the quiz ask.

**Today (real) — the product.**
This is the app at its best. Wordmark top-left, owl/profile top-right, one calm "What are you craving?" search with a "Go →", a "MEAL QUEUE" with two filter chips, then a large, beautiful photograph of Masoor Dal, "DINNER IDEA / Masoor Dal". The food photography is the hero and it earns the screen. Deference to content, exactly the Apple instinct. Two nits: the dish title is clipped at the fold, and the photo has a lot of white margin around the bowl instead of going full-bleed.

**Path — second interstitial.**
Opening Path triggers an 8-step orientation tour ("Path Orientation · Step 1 of 8 / Welcome to your culinary campus / ... about two minutes"), a dark sheet dimming the real screen behind it. So the two primary tabs each greet a new user with a different forced tour. The underlying Path (Level 1, streak/trophy/XP rail, "Your kitchen story starts tonight", a journey row of 0/0/0) looks promising but you have to dismiss two minutes of onboarding to reach it. The "Skip intro" escape is low-contrast and easy to miss.

**Content — the strongest tab.**
Renders straight to product. "Community / Watch, learn, and ask better cooking questions", a Watch·Learn·Experts·Ask strip, a reels rail of real food videos with play overlays and duration chips, a Learn section. Clean hierarchy, real imagery, a recognizable pattern (TikTok-style rail) used correctly. This is the template for the rest of the app.

**Games / Kitchen Arcade — the weak link.**
A 2×2 grid of cards, each an emoji inside a pastel circle (crystal-ball/purple, puzzle/tan, knife/pink, map/teal) + bold title + two-line description + "Tap to try" + a "NEW" pill. This trips five AI-slop patterns at once: emoji-as-design, icons-in-colored-circles, the symmetric card grid, centered text, and a palette that belongs to no system. It is the one screen that looks generated rather than designed, and it drags the whole app's perceived quality down because users don't average, they anchor on the worst thing they see.

**Guided Cook (Mission) — near Apple-level.**
Back arrow, "Mission", a four-dot quest stepper (Mission→Grab→Cook→Win), a gorgeous garlic-bread photo, "13 MIN", "Garlic Bread" in DM Serif, three flavor pills (Savory/Rich/Warm), a one-line description, a full-width "Let's gather", a "When do you want to eat?" chip, and a "Bigger controls" accessibility toggle. One job, one action, content-forward, with a thoughtful a11y affordance built in. This screen is the proof the team can hit the bar.

### Findings by severity

**HIGH (hurt first impression and trust)**

1. **Double onboarding interstitials.** Today (quiz modal) and Path (8-step tour) each block the product on first run. Goodwill drain, and the first screen a user sees is a form, not a meal. _Evidence: 01, 03._
2. **Inverted, unsystematic type scale.** The H1 is 18px and an H3 is 30px; section labels are 11–12px. Hierarchy is hand-tuned per screen. This is the difference between "looks nice" and "feels engineered". _Evidence: design-system extract._
3. **Games screen reads AI-generated.** Emoji-in-pastel-circles + card grid + centered + off-palette. _Evidence: 05._

**MEDIUM (felt subconsciously)** 4. **Third font leak (Geist).** Default Next font appears alongside the intended Inter/DM Serif pairing. 5. **Touch targets under 44px.** Filter chips ("Any time", "Cuisine") render ~27px tall. 6. **Secondary-text contrast just under AA.** Gray `#6B6B6B`/`#757575` on paper is ≈4.3:1 (the quiz subcopy especially). Body/secondary should clear 4.5:1. 7. **Hero images not full-bleed.** The Today and cook photos sit inside generous white margins; the food would hit harder edge-to-edge. 8. **Generic onboarding copy.** "Welcome to Sous" / "Answer 5 quick questions" undersells "Cook confidently tonight".

**POLISH (good → great)** 9. No tokenized radius/elevation/spacing scale (values are consistent by discipline, not by system). 10. No systematic motion language (durations/easings/haptics) beyond ad-hoc Framer transitions. 11. Mixed iconography weights; "Skip intro" and "Go →" are low-affordance. 12. Empty vertical space on the quiz and Games screens reads as unfinished rather than calm.

### The core insight

Sous already has the two things you cannot retrofit cheaply: **restraint** and **real food photography**. The palette is warm and coherent, the cook flow respects the content, and the team has demonstrably hit the bar (the Mission screen). The gap to Apple-level is not a redesign. It is **systematization** (turn hand-tuned type/space/color into tokens), **subtraction** (kill the interstitials, de-slop Games), and **finish** (motion, haptics, full-bleed imagery, touch targets). That is a polish program, not a rebuild, which is the best possible starting position.

---

## Part 2 — The Apple-Level Plan

### What "Apple-level" means for Sous (the rubric we build to)

1. **Deference.** The food is the content. Chrome shrinks, photography goes full-bleed, the UI gets out of the way during cooking.
2. **Clarity through a system.** One type scale, one spacing scale, one color system, one motion language. Nothing hand-placed.
3. **Depth and feedback.** Motion conveys hierarchy and spatial relationships; every touch answers with haptics and state.
4. **Subtraction.** If deleting it improves the screen, delete it. No interstitials, no decoration standing in for content.
5. **Finish.** 44px targets, AA+ contrast, optical type sizing, reduced-motion paths, dark mode that uses elevation. The details that read as "expensive".

### Stage 1 — Design token foundation (the spine everything hangs on)

🟢 highest leverage, do first.

- Author `DESIGN.md` + a `tokens.css` (CSS variables) for: color (paper, ink, accent + tints, semantic, full gray ramp), a **type scale** on a fixed ratio (1.25 major-third: 12 / 15 / 19 / 23 / 29 / 37 / 46), spacing on an 8px base (4/8/12/16/24/32/48/64), radius (sm/md/lg/pill), elevation (e0–e3), and a motion table (durations 120/200/320ms, easings: ease-out enter, ease-in exit).
- Wire Tailwind 4 `@theme` to the tokens so every component reads from one source.
- Acceptance: the rendered design-system extract shows ≤2 font families, a clean size ramp, and ≤12 non-gray colors app-wide.

### Stage 2 — Typography system (fix the hierarchy)

- Map semantic roles to the scale: `display` (DM Serif, dish names), `title`, `headline`, `body` (Inter 16/1.5), `label` (uppercase tracking, ≥12px), `caption`. Largest visual element = highest heading level on each screen.
- Add `text-wrap: balance` on headings, `font-variant-numeric: tabular-nums` on timers/streaks/XP, curly quotes and real ellipses, optical line-length caps (≤66 chars).
- Kill the Geist leak (set the font stack explicitly on `:root` and `body`).
- Acceptance: heading levels match visual size order on every audited screen; no third font in the extract.

### Stage 3 — Onboarding redesign (subtract the interstitials)

- Replace the Today quiz modal with **progressive personalization**: land users directly on a real Today (a strong default pick), and learn taste from behavior + one inline, dismissible "tune your taste" affordance. The 5 questions become optional, not a gate (this also honors the product's own "no settings, learn from behavior" rule).
- Replace the Path 8-step tour with **just-in-time coachmarks** (one tip the first time a surface is actually used) or a single optional "How Path works" entry point.
- Rewrite the value line: lead with "Cook confidently tonight", drop "Welcome to Sous".
- Acceptance: a brand-new user reaches a real, cookable Today in zero taps; goodwill reservoir walk shows no interstitial drains.

### Stage 4 — Imagery & the hero system (lean into the asset)

- Define a hero treatment: full-bleed, edge-to-edge food photography with a bottom gradient scrim for legible overlaid text. Apply to Today and the cook Mission screen.
- Standardize aspect ratios (4:5 portrait hero, 1:1 thumbs), `loading`/`decoding` hints, and a consistent rounded-corner-vs-full-bleed rule.
- For the ~50% of dishes still on gradient+emoji fallback, design a _branded_ fallback (paper texture + serif monogram), not an emoji.
- Acceptance: hero images touch the screen edges; no white-margin-around-bowl framing.

### Stage 5 — Iconography & core components

- Adopt one icon set at one weight (the app currently mixes weights). Build the component kit on tokens: `Button` (primary/secondary/ghost, all ≥44px), `Chip` (≥44px tap, even if visually compact via padding), `Card` (only where the card _is_ the interaction), `SegmentedControl` (Content tabs), `Stepper` (the quest dots), `Toggle`, `Sheet`.
- Fix affordances: "Go →" becomes an obvious submit; "Skip intro" gets real contrast.
- Acceptance: zero interactive element under 44px; one icon family in the DOM.

### Stage 6 — Games redesign (de-slop)

- Drop emoji-in-pastel-circles. Re-skin each game tile with the app palette (paper/ink/sage), real or illustrated food imagery, and asymmetric editorial layout instead of the 2×2 symmetric grid. Cards only if the card is the play surface.
- Acceptance: Games passes the AI-slop blacklist; palette matches the rest of the app; standalone AI-slop grade ≥ A−.

### Stage 7 — Motion & haptics (the "expensive" feel)

- Implement the Stage-1 motion table everywhere: shared-element transition from the Today hero into the cook Mission (the photo should _move_, not cut), spring on primary taps, the quest stepper advancing with the dots, a real celebratory beat on Win (the confetti exists; add scale/haptic and a settle).
- Add Web Vibration haptics on key wins (cook complete, streak up). Respect `prefers-reduced-motion` with non-motion equivalents.
- Acceptance: navigation between Today→Cook→Win reads as one continuous space; reduced-motion path verified.

### Stage 8 — Accessibility & contrast finish

- Lift secondary text to ≥4.5:1 (darken the gray ramp one step on paper). Verify large-text 3:1, UI 3:1.
- 44px targets (Stage 5), `focus-visible` rings on every interactive element, semantic landmarks, alt text on food images, dynamic-type friendliness (the "Bigger controls" toggle is a great start — make it global).
- Acceptance: automated a11y pass clean; manual keyboard + screen-reader walk of the cook flow.

### Stage 9 — Per-surface polish pass (apply the system)

- Re-run the audit screen-by-screen with the tokens + components in place: Today, Path (post-onboarding), Content, Games, Cook (Mission→Grab→Cook→Win), Win, Pods, Eat-out, Profile sheet. One commit per surface.
- Acceptance: every surface scores ≥ A− on the checklist; cross-page consistency (nav, chips, cards, type) holds.

### Stage 10 — Design QA loop + measurement (lock the bar)

- Add a visual-regression baseline (screenshot diffing of the key surfaces) so polish doesn't rot.
- Re-score: target **Design Score A / A−**, **AI-Slop Score A**.
- Wire one perceptual metric (e.g., a "felt fast / felt polished" beta question) into the Stage-I telemetry when it lands.

### Sequencing & effort

```
Foundation:   1 (tokens) → 2 (type)                  [unblocks everything]
Subtract:     3 (onboarding)                          [biggest first-impression win]
Asset:        4 (imagery)                             [biggest "wow" per hour]
System:       5 (components) → 6 (games) → 8 (a11y)   [parallelizable]
Finish:       7 (motion/haptics)                      [the Apple feel]
Lock:         9 (surface pass) → 10 (QA loop)
```

- **Critical path to a visible jump:** Stages 1 → 3 → 4. Tokens + kill the interstitials + full-bleed food. That alone moves first impression from "nice" to "premium".
- **Effort:** this is a polish program on a strong base, not a rebuild. CC + the design tooling can land Stages 1–2 and 5–6 fast; Stages 3, 7, 9 want human taste calls in the loop.
- **What not to do:** do not redesign the palette, the DM Serif + Inter pairing, the cook flow, or the Content tab. They are right. Apple-level here is reached by systematizing and subtracting, not by reinventing.

---

_Screenshots and the raw design-system extract are archived under
`~/.gstack/projects/Stef-01-Sous/designs/design-audit-20260531/`. This is an
audit-and-plan deliverable; no source was changed. The `design-review` skill's
fix loop can execute Stages 1–2 and 5–6 on approval._
