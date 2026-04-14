**Today's Feature Ideas — April 12, 2026**

---

**1. Hands-Free Step Read-Aloud** (Section 11 — 11.1)
- **What:** Add a speaker icon to the guided cook StepCard that reads the current instruction aloud via the browser Speech Synthesis API.
- **Why now:** CES 2026 showcased the Emerson SmartVoice Air Fryer (voice-activated, no app required) and the Wan AIChef Ultra with voice-guided cooking. Voice-first cooking UX is entering mainstream consumer expectations. Sous can capture this with zero hardware dependency — browser Speech API is free and works offline.
- **Effort:** Low — single icon on existing component, browser API, no backend changes.
- **Impact on cooks-per-week:** Medium-high. Removes the #1 friction point mid-cook: touching your phone with dirty/wet hands. Users who currently abandon guided cook mid-flow due to hand-washing interruptions will complete more sessions.
- **Recommendation:** **Build** — this is already spec'd in STRATEGY.md 11.1 and the guided cook StepCard is fully built. Ship as a quiet toggle; no new screen, no new dependency.

---

**2. Serving Size Scaler on Grab Screen** (Section 11 — 11.6)
- **What:** A small 1–4 serving stepper on the ingredient Grab screen. Tap to scale quantities proportionally.
- **Why now:** AR-driven cooking guidance and hyper-personalized recipe feeds are reshaping competitor UX (per StartUs Insights 2026 food tech report). But the simpler, higher-ROI play is portion accuracy — Mela and Pestle both ship this as table-stakes. Sous's Grab screen already has the ingredient list with quantities; scaling is pure math on existing data.
- **Effort:** Medium — needs quantity parsing from ingredient strings and a stepper UI component.
- **Impact on cooks-per-week:** Medium. Removes the mental math barrier for couples or families. A user cooking for 2 currently has to eyeball halving — friction that discourages weeknight cooking.
- **Recommendation:** **Evaluate** — validate that ingredient strings in `sides.json` have parseable quantities first. If they do, this is a weekend build. If not, requires a data cleanup sprint.

---

**3. Progressive Difficulty Bias in Quest Suggestions** (Section 11 — 11.7)
- **What:** After 10+ completed cooks, silently bias the daily quest card toward dishes one skill level above the user's comfort zone. Zero UI change — pure engine scoring weight adjustment.
- **Why now:** The Nosh autonomous kitchen (CES 2026) and AI meal planners are optimizing for convenience — making cooking *easier*. Sous's contrarian bet is cooking *confidence*, which means growth. Duolingo's adaptive difficulty is proven to increase long-term retention by 15-20%. Sous's skill tree and cuisine mastery data already exist; this just wires them into the recommendation ranker.
- **Effort:** Low — add a difficulty scorer to the pairing engine (skill tree data already tracks user level per cuisine).
- **Impact on cooks-per-week:** High over time. Users who feel progression cook more frequently (Duolingo's core insight). Stagnation at the same skill level is the silent killer of cooking habits.
- **Recommendation:** **Build** — invisible to users, strengthens both the data moat and engine moat, and the skill tree infrastructure is already in place. Ship it, measure recommendation acceptance rate before/after.

---

*Sources: [CES 2026 Kitchen Products — Food Network](https://www.foodnetwork.com/how-to/packages/shopping/best-ces-2026-kitchen-products), [Food Technology Trends 2026 — StartUs Insights](https://www.startus-insights.com/innovators-guide/food-technology-trends/), [Smart Kitchen Devices 2026 — Developex](https://developex.com/blog/smart-kitchen-devices-software-2026/)*
