# NOURISH — Product Requirements Document

> **Version:** 1.0 · **Last updated:** February 2026
> **Author:** Dev Asiathottunkal · **Design Partner:** IDEO-method synthesis

---

## 1. Problem Statement

Newly diagnosed diabetes and pre-diabetes patients face an overwhelming challenge: learning to eat well without abandoning the foods and cultural cuisines they love. Current tools — generic calorie-counting apps, sterile meal-plan PDFs, and one-size-fits-all diet guides — fail because they are:

- **Culturally disconnected.** A patient from a South Indian household receives the same DASH-diet pamphlet as everyone else. The disconnect breeds disengagement.
- **Cognitively heavy.** Glycemic index tables, macronutrient ratios, and portion math require expertise patients don't yet have.
- **Emotionally cold.** Diagnosis is scary. Tools should feel encouraging, not clinical.

The result: patients leave their first appointment with a printout they never look at again, and arrive at their first dietitian follow-up without meaningful dietary change.

**NOURISH solves this** by meeting patients where they are — inside their own cuisine — and teaching the ADA Plate Method through discovery, not instruction.

---

## 2. Product Vision

> *"Making a change to more healthy diabetes eating feels simple, achievable, and realistic."*

NOURISH is a **clinical adjunct learning tool** — not a meal tracker, not a diet app. It sits in the space between a patient's diagnosis and their first real dietary shift, making the ADA Plate Method intuitive by showing, not telling.

**The core loop:** Type a meal you already eat → See three side dishes that complete a balanced plate → Understand *why* they work together → Feel confident that change is possible.

---

## 3. Target Users

### Primary: Newly Diagnosed Diabetes / Pre-Diabetes Patients

| Attribute | Detail |
|-----------|--------|
| **Demographics** | Adults (25–70), diverse ethnic backgrounds, varying health literacy |
| **Trigger moment** | First 1–4 weeks post-diagnosis; the "now what?" window |
| **Emotional state** | Anxious, overwhelmed, often grieving familiar foods |
| **Current behavior** | Googling "can I still eat rice with diabetes" at midnight |
| **Desired outcome** | A realistic plate they can make tomorrow, not a 30-day plan |

### Secondary: Clinical Partners (Stanford Endocrinology)

| Attribute | Detail |
|-----------|--------|
| **Role** | Endocrinologists, diabetes educators, registered dietitians |
| **Need** | A tool to prescribe alongside medication — "Try this before your next visit" |
| **Success signal** | Patient arrives at follow-up having explored culturally relevant balanced meals |

### Tertiary: Health-Curious Public

| Attribute | Detail |
|-----------|--------|
| **Profile** | Anyone curious about balanced eating via the Plate Method |
| **Entry point** | Word of mouth, social sharing of plates, search |
| **Value** | Culturally authentic meal pairing without diabetes framing |

---

## 4. Goals & Success Metrics

### North Star Metric

**Active plate explorations per patient per week** — a patient who types 3+ meals in a week is learning through discovery.

### Primary Goals

| Goal | Metric | Target (6-month) |
|------|--------|-------------------|
| **Spark dietary curiosity post-diagnosis** | % of referred patients who explore ≥5 meals in first 2 weeks | 60% |
| **Improve dietitian follow-up quality** | Pre/post survey: "I tried a new balanced meal this week" | 40% ↑ from baseline |
| **Represent cultural diversity** | Cuisines with ≥80 recipes | 15 ethnicity-cuisine categories |
| **Clinical partner adoption** | Clinics actively recommending NOURISH | 3 Stanford-affiliated clinics |

### Secondary Goals

| Goal | Metric | Target |
|------|--------|--------|
| **Build a viable startup foundation** | Seed-stage readiness (product, data, traction) | By month 12 |
| **Weekly retention** | Patients returning week-over-week | 35% W1→W4 |
| **Shareability** | Plates shared (download, clipboard, native) | 500/month organic |
| **Accessibility** | WCAG 2.1 AA compliance | 100% core flows |

---

## 5. Core Features

### 5.1 Meal Search & Discovery ✅ Built

The entry point. A patient types a meal from their own kitchen — "chicken biryani," "arroz con pollo," "pad thai" — and instantly sees three complementary side dishes.

**Mechanics:**
- Fuzzy search with alias support (e.g., "biryani" finds "Chicken Biryani")
- Suggestion chips on empty state (culturally diverse quick-starts)
- Error state offers related meals (never a dead end)
- Verified-only toggle for clinician-curated subset

**Design principle:** The search bar is the entire interface at rest. One input, one button. Zero cognitive overhead.

### 5.2 Intelligent Side Pairing ✅ Built

The engine behind the magic. Two modes:

**Ranked Mode** (14 cuisines today → all cuisines at scale):
- Pre-computed scores (0–100) from a Python scoring engine
- Considers: flavor complementarity, texture contrast, cultural authenticity, nutritional balance, spice compatibility
- Tier classification: Excellent / Strong / Good / Experimental / Low

**Curated Mode** (fallback for unscored meals):
- Hand-curated side pools with randomized selection
- Fisher-Yates shuffle ensures variety across rerolls

**Reroll & Swap:**
- "Swap" a single side to explore alternatives
- Session tracking prevents repeats until pool is exhausted
- Graceful wrap-around when all options shown

### 5.3 ADA Plate Method Visualization ✅ Built

When a patient clicks "Evaluate," the search bar morphs into a clinical one-liner appraisal ("Balanced plate with strong pairings.") and the food cards scatter into a scrapbook cluster while an interactive plate diagram appears.

**Plate anatomy:**
- Three sections: 50% Vegetables, 25% Protein, 25% Carbs (ADA standard)
- Food images from the current pairing populate each section
- Stacked angled-card presentation when multiple items share a category
- Color-coded labels: green (vegetables), rose (protein), amber (carbs)
- Ghost text for empty sections ("Vegetables" / "Protein" / "Carbs")
- ✓/✗ indicators in external labels for balance status

**Appraisal sentence** (displayed in search bar during evaluation):
- Synthesizes a doctor's note + coach + traffic light into 5–8 words
- Tone-mapped colors: nourish-green (balanced), amber (needs work), stone (neutral)
- Typography: sans-serif, muted, clinical — never preachy

**Design principle:** The plate teaches without lecturing. A patient sees their own food arranged on the plate and intuitively grasps what's missing.

### 5.4 Save & Share ✅ Built

- Save pairings locally (max 20, localStorage)
- Export plate as high-quality PNG
- Native share API with clipboard fallback
- Saved pairings modal for quick recall

### 5.5 Pairing Heatmap ✅ Built

Interactive matrix visualization (35 mains × 148 sides) color-coded by compatibility score. Distinguishes engine-scored from curated data. Useful for power users and clinical partners exploring the data.

---

## 6. Planned Features (Roadmap)

### Phase 1: Data Expansion (Months 1–3)

| Feature | Description | Priority |
|---------|-------------|----------|
| **15 Ethnicity-Cuisine Categories** | South Indian, North Indian, Mexican, Japanese, Korean, Thai, Mediterranean, Middle Eastern, West African, Ethiopian, Caribbean, Southern US, Italian, Chinese, Filipino | P0 |
| **80 Recipes Per Culture** | 80 main dishes per ethnicity category → 1,200+ total meals | P0 |
| **Full Engine Scoring** | Extend Python engine to score all 1,200+ mains | P0 |
| **Side Dish Expansion** | Proportional growth of culturally authentic sides | P0 |

### Phase 2: Clinical Integration (Months 3–6)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Clinician Referral Flow** | QR code or short-link a clinician can hand to patients | P1 |
| **Curated "Starter Packs"** | Per-ethnicity meal sets a clinician can prescribe ("Try these 5 Indian meals this week") | P1 |
| **Progress Journaling** | Lightweight: "I tried this plate" check-in (not full food logging) | P2 |
| **Dietitian Dashboard** | View which meals a referred patient explored (anonymized, opt-in) | P2 |

### Phase 3: Personalization & Intelligence (Months 6–12)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Glycemic Impact Indicators** | Traffic-light overlay: green/yellow/red per side based on GI + fiber | P1 |
| **Portion Guidance** | Gentle visual cues ("a fist-sized serving") without calorie counting | P1 |
| **Meal History Intelligence** | "You've been exploring mostly Indian meals — try these Mediterranean plates" | P2 |
| **Ingredient Substitutions** | "Swap white rice for brown rice" inline suggestions | P2 |
| **Accessibility Audit** | Full WCAG 2.1 AA certification | P1 |

### Phase 4: Platform & Growth (Months 9–18)

| Feature | Description | Priority |
|---------|-------------|----------|
| **User Accounts (Optional)** | Cloud sync for saved pairings, cross-device | P2 |
| **PWA / Mobile App** | Installable app experience, offline capable | P1 |
| **Embeddable Widget** | Clinic websites can embed the search bar | P2 |
| **Multi-language** | Spanish, Hindi, Tagalog (top 3 patient languages at Stanford) | P1 |
| **Analytics Infrastructure** | Funnel tracking, A/B testing, outcome correlation | P1 |

---

## 7. User Flows

### Flow 1: First Visit (Newly Diagnosed Patient)

```
Clinician hands patient a card:
  "Try nourish.app — search for a meal you love."
          │
          ▼
┌─────────────────────────┐
│  Landing Page            │
│  "Find the perfect sides │
│   for your favourite     │
│   meal."                 │
│                          │
│  [Pizza Margherita... ]  │
│  [Pair my meal]          │
│                          │
│  💡 Try: Chicken Biryani │
│     Pad Thai · Fish Tacos│
└─────────────────────────┘
          │
    Patient types "dal"
          │
          ▼
┌─────────────────────────┐
│  Results                 │
│  🍛 Masoor Dal (hero)    │
│  + Jeera Rice            │
│  + Cucumber Raita        │
│  + Aloo Gobi             │
│                          │
│  [Evaluate] [Share]      │
└─────────────────────────┘
          │
    Taps "Evaluate"
          │
          ▼
┌──────────────────────────────┐
│  Evaluate Mode               │
│                              │
│  "Balanced plate with        │
│   strong pairings."          │
│                              │
│  ┌──────────┐  🍛🍚🥒       │
│  │  ADA     │   (scrapbook   │
│  │  PLATE   │    cluster)    │
│  │  ✓ Veg   │                │
│  │  ✓ Protein│               │
│  │  ✓ Carbs │                │
│  └──────────┘                │
│                              │
│  [Hide Plate]                │
└──────────────────────────────┘
          │
    Patient thinks:
    "I already eat dal with rice and raita.
     That's actually balanced? I can do this."
          │
          ▼
    ✅ Core learning moment achieved
```

### Flow 2: Exploration (Return Visit)

```
Patient opens NOURISH → types "fish tacos"
          │
          ▼
   Sees 3 sides → taps "Swap" on one
          │
          ▼
   Gets a new side → taps "Evaluate"
          │
          ▼
   "Good start — consider adding vegetables."
          │
   Swaps the carb side for a salad
          │
          ▼
   "Balanced plate — all three food groups covered."
          │
          ▼
   Saves the plate → shares PNG to family group chat
          │
          ▼
   ✅ Patient teaching family through sharing
```

### Flow 3: Clinician Referral

```
Endocrinologist sees patient A1C at 7.2
          │
          ▼
   "Before your dietitian visit next month,
    try nourish.app. Search for meals you
    already cook. See if you can build
    3 balanced plates this week."
          │
          ▼
   Patient explores 8 meals over 2 weeks
          │
          ▼
   Arrives at dietitian with specific questions:
   "The app said my plate needs vegetables.
    What vegetables work with biryani?"
          │
          ▼
   ✅ Follow-up quality dramatically improved
```

---

## 8. Design Principles

### 1. Cultural Authenticity First
Every cuisine must feel *respected*, not translated. "Raita" stays "Raita" — never "Indian Yogurt Dip." Food images should look like what a patient's grandmother would recognize.

### 2. Show, Don't Tell
No paragraphs explaining the Plate Method. The interactive plate, populated with the patient's own food choices, teaches through visual recognition. The appraisal sentence is 5–8 words, not a lecture.

### 3. Warm Clinical, Not Cold Medical
The design language walks a line: trustworthy enough for a clinician to recommend, warm enough for a scared patient to use at 11pm. Stone-warm color palette, serif headlines, clean sans-serif body text.

### 4. Zero Guilt
The tool never says "bad plate" or "unhealthy." The worst feedback is "Needs vegetables and whole grains for balance" — constructive, not judgmental. Traffic-light-style indicators point toward improvement, not away from failure.

### 5. Progressive Disclosure
First visit: just search and see results. Second visit: try Evaluate. Third visit: start swapping sides. The UI doesn't overwhelm — features reveal themselves as the patient gains confidence.

### 6. One Input, One Screen
The entire core experience lives on a single page. No navigation, no onboarding flow, no tutorial. Type → see → learn. Everything else is secondary.

---

## 9. Data Architecture

### Current State (v1.0)

```
┌─────────────────────────────────────┐
│          Static JSON Bundle          │
│                                      │
│  meals.json ─── 35 meals             │
│  sides.json ─── 148 side dishes      │
│  pairings.json ─ 14 scored mains     │
│                                      │
│  Loaded at build time                │
│  No external dependencies            │
└─────────────────────────────────────┘
```

### Target State (v2.0)

```
┌─────────────────────────────────────┐
│          Structured Database          │
│                                       │
│  15 ethnicity-cuisine categories      │
│  × 80 main dishes each               │
│  = 1,200+ meals                       │
│                                       │
│  ~3,000+ side dishes                  │
│  Full engine scoring for all mains    │
│                                       │
│  Nutritional data per dish:           │
│  - Glycemic index range               │
│  - Macronutrient profile              │
│  - Fiber content                      │
│  - Portion baseline                   │
│                                       │
│  Image pipeline:                      │
│  - Curated Unsplash → custom photos   │
│  - Cultural authenticity review       │
└───────────────────────────────────────┘
```

### Ethnicity-Cuisine Categories (15 Planned)

| # | Category | Example Mains | Status |
|---|----------|---------------|--------|
| 1 | South Indian | Dosa, Idli Sambar, Chettinad Chicken | Partial (in v1) |
| 2 | North Indian | Biryani, Dal Makhani, Chole | Partial (in v1) |
| 3 | Mexican | Tacos, Enchiladas, Pozole | Partial (in v1) |
| 4 | Japanese | Ramen, Teriyaki, Onigiri | Partial (in v1) |
| 5 | Korean | Bibimbap, Bulgogi, Kimchi Jjigae | Not started |
| 6 | Thai | Pad Thai, Green Curry, Tom Yum | Partial (in v1) |
| 7 | Mediterranean | Falafel, Moussaka, Shakshuka | Partial (in v1) |
| 8 | Middle Eastern | Kebab, Mansaf, Kibbeh | Not started |
| 9 | West African | Jollof Rice, Egusi Soup, Suya | Not started |
| 10 | Ethiopian | Injera Combos, Doro Wat, Kitfo | Not started |
| 11 | Caribbean | Jerk Chicken, Roti, Ackee & Saltfish | Not started |
| 12 | Southern US | Gumbo, Fried Chicken, Collard Greens | Not started |
| 13 | Italian | Pasta, Risotto, Ossobuco | Partial (in v1) |
| 14 | Chinese | Dim Sum, Mapo Tofu, Kung Pao | Not started |
| 15 | Filipino | Adobo, Sinigang, Lumpia | Not started |

---

## 10. Technical Architecture

### Current Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) | Turbopack for dev |
| UI | React 19 + Tailwind CSS v4 | Custom design tokens |
| Animation | Framer Motion 12 | Spring physics, reduced motion support |
| Search | Fuse.js | Client-side fuzzy matching |
| Data | Static JSON | Bundled at build time |
| Export | html-to-image | DOM → PNG conversion |
| Hosting | Vercel | Edge deployment |
| Scoring | Python (offline) | Pre-computed, output to JSON |

### Scaling Considerations

| Challenge | Current | Future |
|-----------|---------|--------|
| Data size | 35 meals (JSON bundled) | 1,200+ meals → edge database (Turso/PlanetScale) |
| Search | Client-side Fuse.js | Server-side with cuisine filtering + pagination |
| Scoring | Offline Python → JSON | Real-time scoring API or pre-computed in DB |
| Images | Unsplash URLs | CDN-hosted curated photography |
| Analytics | Console.log stub | PostHog / Mixpanel with clinical dashboards |
| Auth | None | Optional accounts for cloud sync + clinician linking |

---

## 11. Competitive Landscape

| Tool | Approach | NOURISH Differentiation |
|------|----------|------------------------|
| **MyFitnessPal** | Calorie/macro tracking | NOURISH is *learning*, not logging |
| **Fooducate** | Grade system (A–D) | NOURISH shows balanced *plates*, not isolated foods |
| **mySugr** | Blood sugar logging | NOURISH operates upstream — before the glucose spike |
| **ADA Plate Planner** | Static PDF guide | NOURISH is interactive, culturally diverse, beautiful |
| **Noom** | Behavioral coaching ($$$) | NOURISH is free, focused, no subscription |

**Unique position:** The only tool that combines **cultural food intelligence** + **ADA Plate Method visualization** + **discovery-based learning** in a single, free, zero-friction interface.

---

## 12. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Cultural insensitivity in food pairings | Medium | High | Community review panels per cuisine; cultural consultant per ethnicity category |
| Nutritional inaccuracy | Medium | High | Registered dietitian review of all pairings; disclaimers; "Not medical advice" |
| Low patient engagement | Medium | Medium | Clinician integration as primary distribution; social sharing virality |
| Data scaling complexity | Medium | Medium | Incremental: 3 cuisines/quarter; templated data pipeline |
| Over-reliance on Stanford affiliation | Low | Medium | Expand to community health centers; FQHC partnerships |
| Image quality inconsistency | High | Low | Build custom photography pipeline; community-sourced images |

---

## 13. Open Questions

1. **Regulatory:** Does NOURISH require FDA classification as a digital health tool, or does "educational content" exemption apply?
2. **Clinical validation:** What study design would demonstrate NOURISH improves dietary outcomes? (Pre/post A1C? Diet quality index?)
3. **Data sourcing:** For 1,200+ meals, what's the pipeline? Nutritionist curation? Community submission with review? AI-generated with human verification?
4. **Monetization:** Free for patients always. Revenue from clinic licensing? Health system integration fees? Grant funding?
5. **Localization priority:** Which 3 languages after English? (Spanish, Hindi, Tagalog are candidates based on Stanford patient demographics)

---

## 14. Success Story (What "Done" Looks Like)

> **Maria, 54, diagnosed with Type 2 diabetes three weeks ago.**
>
> Her endocrinologist at Stanford hands her a card: *"Before your dietitian appointment, try nourish.app."*
>
> That evening, Maria types "arroz con pollo." She sees three sides appear — black beans, plantains, and a cabbage slaw. She taps "Evaluate" and sees: *"Balanced plate with strong pairings."* For the first time since her diagnosis, she smiles. This is food she already knows.
>
> Over the next two weeks, she searches for 12 more meals. She discovers that her pozole needs a vegetable side. She starts making ensalada de nopales.
>
> At her dietitian visit, she says: *"I've been using this app. I think I understand the plate thing. Can we talk about portion sizes now?"*
>
> The dietitian, for the first time in years, starts a follow-up at Step 2 instead of Step 0.

---

*NOURISH — Because healthy eating should feel like coming home, not leaving it.*
