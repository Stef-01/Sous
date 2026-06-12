# Onboarding & Survey Design Kit — mockup analysis + measured tokens

> Source of truth for the mockup-driven onboarding/survey/icon overhaul
> (planning.md §6.2). 28 reference screenshots live in `docs/PLANS/IMG_*.PNG`
> (1290×2796 px iPhone Pro Max, 3× scale → 430×932 logical pt). Every
> measurement below was sampled programmatically with Pillow (px ÷ 3 = pt);
> hex values are measured, not guessed. Re-sampling scripts: `/tmp/pixan/`
> (regenerate if needed — they're throwaway).

---

## 1. Mockup inventory — three design families

### Family A — "MOB" light onboarding (IMG_4541–4551)

| File | Screen                                                                                                                                                                                                           | Pattern                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 4541 | "What are you trying to achieve?" — 7 emoji+label rows, single-select                                                                                                                                            | P2 option-card grammar |
| 4542 | "What prevents you from doing that?" — checkbox rows, "Pick as many as you want"                                                                                                                                 | P2 multi variant       |
| 4544 | Statement card "I spend too much money on my dinners"                                                                                                                                                            | P3 swipe cards         |
| 4545 | "I waste time looking for the perfect recipe online"                                                                                                                                                             | P3                     |
| 4546 | "Cooking for myself and my kids is a constant struggle"                                                                                                                                                          | P3                     |
| 4547 | "I want to cut down on processed food"                                                                                                                                                                           | P3                     |
| 4548 | "I buy my ingredients last minute"                                                                                                                                                                               | P3                     |
| 4549 | "Welcome to a smarter way to cook and eat" — each accepted statement echoed back as a benefit stat card with a soft-3D illustration (piggy bank, clock, kid, salad); dark pill CTA "Let's pick my first recipes" | P4 mirror summary      |
| 4550 | "What do you like?" — 2-col photo-tile multi-select (Packed Lunches, High Protein, Veggie, Family-Friendly, Quick Healthy Dinner, Healthy Breakfasts, Comfort, Italian)                                          | P5 photo tiles         |
| 4551 | "Any dietary requirements?" — photo tiles (None / Veggie / Vegan / Pescatarian), subtitle "We'll only show recipes that match your preferences."                                                                 | P5                     |

Statement-card mechanics: white card (margin 64 → 302 pt wide, radius ~12,
soft shadow) with oversized quote glyph, stacked-card peek beneath
(next card offset ~12 pt, slightly scaled); two white circle buttons below
(⌀ ~72–76 pt, ~92 pt apart): ✗ `#AF341C`, ✓ `#48884A`.

### Family B — dark, orange accent (IMG_4557–4566, "4567 2", "4568 2")

| File   | Screen                                                                                                                                                                                                                                               | Pattern                     |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 4557   | "Dislikes — Any dislikes?" 3-col grid of **line-art ingredient icons in dark circles** (almonds, asparagus, avocado, banana, beans, beets, bell peppers, blue cheese, broccoli…). Selected = orange ring + slash overlay + struck-through gray label | P14 glyphs, P2 grid variant |
| 4558   | "Energy needs" interstitial — orange heart, "The next questions will help us calculate your daily energy needs"                                                                                                                                      | P13 interstitial            |
| 4559   | Current weight — wheel picker + unit segmented control (Pounds/Kg/Stone) + "🔒 Used to calculate your calories. Stored privately."                                                                                                                   | P6 wheels, P7 privacy line  |
| 4560   | Age — wheel picker + same privacy line                                                                                                                                                                                                               | P6, P7                      |
| 4561   | Current height — wheel + Centimeters/Feet&Inches toggle                                                                                                                                                                                              | P6, P7                      |
| 4562   | Goal — 4 rows, selected shows orange check disc                                                                                                                                                                                                      | P2                          |
| 4563   | Daily Calorie Goal — computed result "2,350 kCal" + small-plate→big-plate visual + "✏️ Edit your calories" row                                                                                                                                       | P8 computed result + edit   |
| 4565   | Cuisine — list rows with 👍/👎 toggle pair per row (like+dislike both capturable)                                                                                                                                                                    | P9 thumbs                   |
| 4566   | Cooking skills — rows with witty subtitles ("Novice — I think I know where the microwave is", "Advanced — I should be on MasterChef")                                                                                                                | P10                         |
| 4567 2 | Paywall carousel slide: "Get your healthy meal plan" — embedded mini week-plan product mock                                                                                                                                                          | P15 feature promise         |
| 4568 2 | "Save time with automated grocery lists" — mock list with consolidated quantities ("3 bell peppers"), Instacart/Amazon Fresh chips, realistic mini food icons                                                                                        | P15                         |

### Family C — navy, blue accent (IMG_4612–4618)

| File      | Screen                                                                                                                                                                                          | Pattern                      |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 4612/4613 | "In the past, what were barriers to achieving weight loss?" — checkbox rows incl. an explicit none-option ("I did not experience barriers")                                                     | P2 multi, past-tense framing |
| 4614      | "Which healthy habits are most important to you?" — chip cloud with **"Recommended for you"** pre-highlighted group + "More healthy habits" + escape hatches ("Something else", "I'm not sure") | P11 chips + recommended      |
| 4615      | "How often do you plan your meals in advance?" — 5-point frequency Likert (Never→Always)                                                                                                        | P2 Likert                    |
| 4616      | Empathy interstitial: "We get it. **Your kitchen, your rules.**" on blue gradient, soft-3D chef hat in rounded tile, white CTA                                                                  | P13                          |
| 4617      | "Do you want us to help you build weekly meal plans?" — Yes definitely / Open to trying / No thanks                                                                                             | P2 consent-style             |
| 4618      | "What is your weekly goal?" — first row carries **"(Recommended)"** as inline gray subtext and arrives pre-selected                                                                             | P12 recommended default      |

---

## 2. Measured color tokens

### Family A (light)

| Token                     | Hex                                                               |
| ------------------------- | ----------------------------------------------------------------- |
| Background (lists)        | `#FFFFFF`; card screens use `#F4F4F5 → #FDFDFD` vertical gradient |
| Option row / tile surface | `#F4F4F5`                                                         |
| Statement card            | `#FFFFFF` + soft shadow                                           |
| Heading                   | `#000000` (heavy geometric display face)                          |
| Body/labels/subtitle      | `#52525B`                                                         |
| Ink CTA / quote glyph     | `#26262A`, label `#FFFFFF`                                        |
| Progress fill / track     | `#ED8F38` / `#E5E5E5`                                             |
| Checkbox border/fill      | `#D4D3D8` / `#FAFAFA`                                             |
| ✗ / ✓                     | `#AF341C` / `#48884A`                                             |

### Family B (dark, orange)

| Token                             | Hex                   |
| --------------------------------- | --------------------- |
| Background / surface              | `#1C2126` / `#283137` |
| Accent (CTA, check, thumbs, ring) | `#EE7E33`             |
| Progress fill (green)             | `#5BC482`             |
| Text / muted-struck label         | `#FFFFFF` / `#7F7F7F` |
| Back-button circle                | `#191C20`             |

### Family C (navy, blue)

| Token                         | Hex                                                          |
| ----------------------------- | ------------------------------------------------------------ |
| Background / surface / chip   | `#151824` / `#1C1F29` / `#252833`                            |
| Accent (CTA, selected border) | `#4F9AFF`; check disc `#0566EB`; selected chip `#114589`     |
| Progress fill / track         | `#36C682` / `#3B3D46`                                        |
| Text / hint                   | `#E0E0E0` / `#9B9DA0`; radio border `#8E8E93` (2 pt)         |
| Gradient interstitial         | `#4F9AFF → #6692FE`, tile `#60A3FE`, white CTA w/ blue label |

---

## 3. Measured geometry (logical pt)

| Element                 | A (light)                                            | B (dark)                                       | C (navy)                                                |
| ----------------------- | ---------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| Screen H-margin         | 16                                                   | 20                                             | 16                                                      |
| Option row              | 398×66, gap 12, r16                                  | 390×52, gap 20, r~9                            | 398×64, gap 8, r~8                                      |
| Label inset             | 38 from edge (after emoji)                           | 17                                             | 17                                                      |
| Control                 | checkbox 24×24 r5, inset-left 13                     | check disc ⌀22, right inset 9                  | radio ⌀22 2pt stroke, right inset 17                    |
| Selected state          | filled checkbox                                      | orange disc + check                            | 2pt accent border ring + blue disc                      |
| Progress                | 124×8 rounded bar, centered, fill %                  | 120×7.5 bar, ~53%                              | **7 segments 55.3×4, gap 2**                            |
| CTA pill                | h44, margin 16, r22, bottom inset 50                 | h56, margin 20, r13                            | h48, full round, back disc ⌀48 + 16 gap, CTA spans rest |
| Statement card          | margin 64, 302 w, r12; ✗/✓ circles ⌀72–76, 92 apart  | —                                              | —                                                       |
| Photo tiles             | 2-col, gutter 12, 193×166, r9–10, label strip ON TOP | —                                              | —                                                       |
| Glyph circles           | —                                                    | ⌀95, 3-col, c-to-c 130; dislike ring ⌀108 ~4pt | —                                                       |
| Chips                   | —                                                    | —                                              | h32 full-round, wrap gap ~7                             |
| Title                   | ~23pt display, centered                              | ~28pt bold, centered                           | ~20pt bold, left + 17pt nav header                      |
| Subtitle / option label | ~14 / ~16                                            | ~13 / ~17                                      | ~13 / ~17–18                                            |

---

## 4. Adaptation to Sous tokens (decision, not measurement)

Sous keeps its identity: light cream theme, `--nourish-green` accent, DM
Serif Display titles, Inter body. The mockups contribute **grammar and
geometry**, not their palettes:

| Mockup token              | Sous mapping                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Row surface `#F4F4F5`     | white card on `--nourish-cream` with `--nourish-border-soft`, or `#f4f4f5` fill — match grocery row treatment |
| Accent orange/blue        | `--nourish-green` (progress fill, selected ring, check disc)                                                  |
| ✗ `#AF341C` / ✓ `#48884A` | `--nourish-evaluate` / `--tier-strong`                                                                        |
| Row geometry              | min-h 64px, `--radius-md` 16px, gap `--row-gap` 12px, margin `--gutter` 20px                                  |
| Progress segments         | h 4px, gap 4px, `--radius-pill`, fill `--nourish-green`, track `--nourish-border`                             |
| CTA                       | h 48px `--radius-pill`, `--shadow-cta`, pinned via flex `mt-auto` (rule 10)                                   |
| Statement card            | white, `--radius-lg` 22px, `--shadow-raised`; ✗/✓ circles 64px                                                |
| Privacy line              | `--sous-text-caption` + lock glyph, under sensitive steps                                                     |
| Witty subtitles           | `--sous-text-caption` `--nourish-subtext` second line                                                         |
| "(Recommended)"           | inline subtext, never a badge (rule 13)                                                                       |
| Titles                    | serif `clamp(1.625rem,6vw,1.875rem)`; subtitle 15px `--nourish-subtext`                                       |

Honesty constraints (these mockups fabricate social proof — we must not):
MOB's mirror screen claims "MOB users save > 25% on food costs". Sous has
no cohort stats. Mirror copy is **forward-promise framing only** ("Pantry-first
picks to keep dinner cheap"), enforced by test (planning.md §6.2 W6).
