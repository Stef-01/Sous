**Today's Feature Ideas — April 13, 2026**

---

**1. Inline Ingredient Substitution on Grab Screen** (Section 11 — 11.4)
- **What:** Long-press an ingredient on the Grab screen to reveal a one-line substitution inline (no modal). Replaces the current "I don't have this" tap-to-call flow with a faster, gesture-native interaction.
- **Why now:** Fuudle + HoloWorld UK launched on April 7, 2026 with "Ask Fuudle" — an AI substitution assistant positioned as the marquee feature. The category is signaling that substitution *is* the AI wedge for home cooks. Sous already ships `ai.suggestSubstitution` via tRPC; the moat-widening move is friction reduction, not a new capability. Long-press beats modal on mid-cook UX.
- **Effort:** Low — backend exists. Pure interaction redesign on `ingredient-list.tsx` + inline popover.
- **Impact on cooks-per-week:** Medium-high. The #2 abandonment moment (after "wet hands") is discovering a missing ingredient. Every second shaved off the recovery loop converts a would-be abandon into a completed cook.
- **Recommendation:** **Build** — existing infra, existing data, gate-passing minimalism (zero new screens, one gesture added). Weekend ship.

---

**2. Win Screen Celebration Variants by Milestone** (Section 11 — 11.3)
- **What:** Vary the win screen celebration copy + animation by milestone: first cook in a new cuisine, 10th cook, first 5-star, streak milestone, etc. Same screen, different headline + confetti palette.
- **Why now:** Every AI recipe app launching in 2026 (Fuudle, Magic Chef, Cook AI, ChefGPT) competes on generation capability. None build behavioral stickiness. Headspace's reward-variability playbook is the unclaimed moat in cooking. Sous's cook-session store already tracks cuisines, cook count, ratings, and streaks — the data is sitting there unused at the win moment.
- **Effort:** Low — pure content layer. Detection logic on `use-cook-sessions.ts`, swap headline + animation variant in `win-screen.tsx`.
- **Impact on cooks-per-week:** Medium. Reward variability is the single highest-ROI retention lever per the Duolingo/Headspace literature. Users who feel *recognized* for specific achievements cook the next day at materially higher rates than those who see the same win screen every time.
- **Recommendation:** **Build** — cheapest behavioral-moat upgrade on the board. Start with 5 variants; expand based on which ones correlate with next-day return.

---

**3. Earnable Streak Freeze** (Section 11 — 11.2)
- **What:** Award one streak freeze when a user completes a weekly challenge or an extra cook beyond their baseline. Small shield icon next to the streak counter; tap for a one-line explanation.
- **Why now:** Fuudle and the new crop of AI recipe apps have zero habit architecture — they are utility apps, not behavior products. Sous's contrarian bet (cooking as a Duolingo-style practice) only compounds if the streak carries real emotional weight. The current streak counter breaks on a single missed day, which punishes the exact users Sous is trying to keep (anxious cooks who occasionally lose a weeknight). Earned-not-bought freezes flip the incentive: to protect a future skip, cook more *now*.
- **Effort:** Low — streak counter and weekly challenge scaffolding both exist. Add a `freezeCount` field to the session store + shield icon on `streak-counter.tsx`.
- **Impact on cooks-per-week:** High over a 90-day window. Duolingo attributes ~15% of retention gains to the freeze mechanic. Sous's streak is currently a stress vector, not a safety net — this inverts it.
- **Recommendation:** **Build** — existing infra, passes all three Section 11 gates, directly increases cook frequency via the "bank a freeze" incentive.

---

*Sources: [Fuudle AI Recipe App Launch — Prolific North](https://www.prolificnorth.co.uk/news/new-ai-recipe-app-promises-real-meals-from-kitchen-shrapnel/), [Duolingo Streak Habit Research — Duolingo Blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit/), [Best AI Recipe Apps 2026 — FoodiePrep](https://www.foodieprep.ai/blog/best-recipe-apps-2026)*
