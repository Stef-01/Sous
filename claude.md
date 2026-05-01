# CLAUDE.md — Sous

## ⚡ BULLETPROOF — BOIL THE OCEAN ⚡

**The marginal cost of completeness is near zero with AI. Do the whole thing.**

Do it right. Do it with tests. Do it with documentation. Do it so well that Stefan is genuinely impressed — not politely satisfied, actually impressed. Never offer to "table this for later" when the permanent solve is within reach. Never leave a dangling thread when tying it off takes five more minutes. Never present a workaround when the real fix exists. The standard isn't "good enough" — it's "holy shit, that's done." Search before building. Test before shipping. Ship the complete thing. When Stefan asks for something, the answer is the finished product, not a plan to build it. Time is not an excuse. Fatigue is not an excuse. Complexity is not an excuse. **Boil the ocean.**

---

## ⚡ BULLETPROOF — ALWAYS COMMIT TO MAIN ⚡

**Always commit directly to main and push. Always. When in doubt, commit.**

- Commit after every meaningful edit. Never leave work uncommitted.
- Never create worktree branches. Never use feature branches.
- Every code task ends with: `git add -A && git commit -m "<msg>" && git push origin main`
- GitHub reversion (`git revert`, `git reset`, PR history) handles any mistakes — there is ZERO downside to committing.
- The only real risk is work stranded in worktrees or uncommitted changes. Always commit > uncommitted.
- Partial work still gets committed with a WIP message. Don't save it for later.
- This rule OVERRIDES any pattern suggesting "wait until complete" or "save for later."

---

## What is Sous

Sous is a cooking fluency platform. Users type a craving or photograph a dish, and the app returns intelligently paired side dishes with step-by-step guided cooking. The product philosophy is radical simplicity: one screen, one action, one win. Think Duolingo for cooking confidence, not another recipe database.

## Tech stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **UI**: React 19, Tailwind CSS 4, shadcn/ui, Framer Motion
- **State**: Zustand for client state, TanStack Query for server state
- **Backend**: Next.js API routes + tRPC, Drizzle ORM, PostgreSQL (Neon)
- **AI/ML**: Vercel AI SDK, OpenAI Vision API (food recognition), Anthropic Claude (craving parsing + coach)
- **Auth**: Clerk
- **Storage**: Cloudflare R2 (images), Upstash Redis (cache + rate limiting)
- **Testing**: Vitest, Playwright, React Testing Library
- **Deploy**: Vercel

## Commands

```bash
pnpm dev          # local dev server at localhost:3000
pnpm build        # production build
pnpm test         # run vitest unit tests
pnpm test:e2e     # run playwright end-to-end tests
pnpm lint         # eslint + prettier check
pnpm lint:fix     # auto-fix lint issues
pnpm db:push      # push drizzle schema to database
pnpm db:studio    # open drizzle studio
pnpm db:seed      # seed side-dish database
```

## Project structure

```
src/
  app/              # Next.js App Router pages and layouts
    (today)/        # Today page (home — the core experience)
    (path)/         # Path tab (progression, journey, challenges)
    (community)/    # Community tab (later stage, stubbed)
    api/            # API routes and tRPC router
  components/
    ui/             # shadcn/ui primitives (do not modify directly)
    today/          # Today page components (QuestCard, ResultStack, FriendsStrip)
    guided-cook/    # Guided Cook flow (StepCard, Timer, MistakeChip, HackChip)
    path/           # Path tab (SkillMap, JourneyScrapbook, WeeklyChallenge)
    shared/         # Cross-cutting components (CameraInput, TextPrompt, CoachAvatar)
  lib/
    ai/             # AI integrations: food recognition, craving parser, coach
    db/             # Drizzle schema, queries, and migrations
    engine/         # Recommendation engine: pairing logic, ranking, scoring
    hooks/          # Custom React hooks
    utils/          # Pure utility functions
  types/            # Shared TypeScript types and Zod schemas
```

## Code conventions

- **Files**: kebab-case for files (`quest-card.tsx`), PascalCase for components (`QuestCard`)
- **Exports**: Named exports for components and utilities. Default exports only for pages.
- **Types**: Zod schemas as source of truth, infer TypeScript types from them. Schemas live in `src/types/`.
- **Components**: Function components only. Props interface defined inline unless shared. Use `cn()` for conditional classes.
- **Data fetching**: Server Components fetch data by default. Client Components use TanStack Query via tRPC hooks.
- **Error handling**: Use Result pattern (`{ success: true, data } | { success: false, error }`) for engine functions. Try/catch only at API boundaries.
- **Tests**: Co-locate unit tests as `*.test.ts`. E2E tests in `/tests/e2e/`. Test behavior, not implementation.

## Critical rules

1. **The Sous Test**: Every component on the Today page must pass: "If this is the only thing the user sees, does it make them cook?" If no, it belongs in Path or Community.
2. **One primary action per screen**: Never show two equally-weighted CTAs. One button dominates; alternatives are visually subordinate.
3. **No settings pages**: Preferences are learned from behavior or captured through playful coach interactions. Never expose filter panels, preference checklists, or configuration screens.
4. **Quest shell consistency**: Every recipe — internal, user-created, or externally retrieved — renders through the same Mission → Grab → Cook → Win flow. No exceptions.
5. **Progressive interface (superseded by Stage 3)**: Originally Today → Path (3 cooks) → Community (30 days). As of Stage 3, all three tabs are always visible: **Today · Path · Content**. The third tab is now a Flo-style content magazine, not a social-graph product, so the unlock gate no longer applies.
6. **Simplicity-first UI**: When in doubt, remove it. Badges, labels, metadata, and decorative elements should be stripped unless they directly drive the user to cook. The home screen should feel clean and inviting, not information-dense. Every element must earn its pixel space.
7. **No invented recipes or images**: Never generate new dish entries or images that don't already exist in the dataset (`sides.json`, `meals.json`). When adding guided cook instructions, only add step-by-step cook flows to existing meals and sides already present in the data layer. New recipes must come from real, reputable online sources and be added to the existing side/meal catalog first.
8. **Consult STRATEGY.md before planning new features**: Before designing or implementing any new feature, read STRATEGY.md to ensure the feature aligns with the strategic thesis, strengthens a compounding moat, and passes the feature prioritization criteria. Update STRATEGY.md's decision log when making significant feature decisions.
9. **Consult ROADMAP.md for build sequencing**: Before starting development work, read ROADMAP.md to understand what's been built, what's in progress, and what's next. Don't duplicate work that's already done.
10. **No-scroll navigation**: The primary CTA and all navigation elements on every screen must be visible without scrolling on a 375px × 667px viewport (iPhone SE). If content pushes the CTA below the fold, use flex layout with `mt-auto` to pin it to the bottom. This is non-negotiable.
11. **Current feature state (do not revert)**: The following features are intentional design decisions and must not be removed or changed without explicit user approval:
    - Path tab is ALWAYS visible in the tab bar (no progressive unlock gate)
    - **Content tab (route id `community`, label `Content`) is ALWAYS visible** — Stage 3 dropped the 30-day unlock gate. Three permanent tabs: Today · Path · Content.
    - Friends social meals section is on the Today page, BELOW the fold (scroll to see)
    - Coach quiz runs on first visit only
    - Cuisine mastery paths (8 cuisines) are in the skill tree as a separate grid section
    - Kitchen Sanitation is NOT in the skill tree (removed intentionally)
    - Meals: 35/76 have heroImageUrl (food_images/\*.png), rest use gradient+emoji fallback
    - Sides: 98/205 have imageUrl (food_images/\*.png), rest use gradient+emoji fallback
    - Do NOT generate new images — that is handled by a separate AI pipeline
    - Clerk auth is bypassed with mock user (re-enable for production only)
    - **Content tab editorial copy is sample/placeholder** with `isPlaceholder: true` flags and clearly fictional author names + `(sample)` affiliation suffixes. Do NOT swap in real clinician names or real lab affiliations without an editorial workstream — that is a Stage-2 effort. See `docs/STAGE-3-LEAN-CONTENT.md` for the full Content tab spec and lean-vibe inventory.

## AI integration notes

- Food recognition uses a two-step pipeline: Vision API identifies the dish, then a correction chip UI lets the user fix misidentification. Never trust vision output alone.
- Craving parsing uses Claude with structured output (Zod schema) to extract: dish intent, cuisine signals, effort tolerance, and health orientation from freeform text.
- The coach persona is bounded — it responds to specific UI triggers (quiz, vibe prompt, win screen), never as an open-ended chatbot.
- All AI calls go through `src/lib/ai/` with retry logic, fallback responses, and cost tracking.

## Side-dish engine

The pairing engine in `src/lib/engine/` scores candidates on: cuisine fit, flavor contrast, nutritional balance, prep burden, temperature complement, and user preference vector. Scores are weighted and the top 3 are returned with plain-language explanations. The engine is deterministic given the same inputs — no randomness in ranking. Novelty is introduced through daily rotation of tie-breaking logic.

## Database seeding

The V1 internal database targets 80-100 side dishes across 8-10 cuisine families. Each dish record includes: name, cuisine family, prep time, skill level, flavor profile tags, nutritional metadata, full Guided Cook steps, timer triggers, mistake warnings, and hack chips. Seed data lives in `src/lib/db/seed/` as typed JSON files.

## When working on this project

- Always check the white paper + PRD (`docs/Sous_whitepaper_PRD_v1.docx`) for product context before making UX decisions.
- Run `pnpm lint && pnpm test` before committing.
- Prefer small, focused PRs. One feature or fix per PR.
- When adding a new screen or flow, sketch the component tree in a comment before writing code.
- **Before answering questions about the codebase**, use `qmd search "query"` to find relevant docs across the sous collection, Stefan-Brain wiki, and strategy documents.
- **When planning new features**, search strategy and planning docs via QMD first: `qmd search "feature topic"` for keyword matches, `qmd vsearch "feature topic"` for semantic matches.
- QMD collections available: `sous` (all Sous markdown), `stefan-brain` (wiki), `optimus` (Optimus docs).

## Operational guardrails

1. **Minimize worktree sprawl**: Never run more than 3 code tasks in parallel. Each worktree requires a full pnpm install — keep the count low to avoid bottlenecking on dependency installation.
2. **Direct file edits over code tasks**: For simple file changes (settings, markdown, config, JSON), edit files directly rather than spawning a code task. Code tasks are for multi-step development work that requires build/test cycles.
3. **Follow up, don't fork**: When a task needs a correction or additional work, send a follow-up message to the existing task instead of starting a new one. New tasks lose context and create merge conflicts.
4. **Always merge and push**: After any code task completes, immediately merge its worktree branch to main and push. Never leave work stranded in worktrees.
5. **Large file edits**: When appending more than 50 lines to a file, write the content to a temporary file first, then use a simple bash append command. Never try to pass 200+ lines of content through an Edit tool call in a code task prompt.
6. **Permission settings**: The project has a comprehensive allow list in .claude/settings.json and ~/.claude/settings.json. If a new tool triggers a permission prompt, add it to the allow list immediately rather than asking the user.
7. **Build verification**: Every code task must end with pnpm build passing. If the build fails, fix it before completing. Never push broken code to main.
8. **Commit and push atomically**: After fixing bugs or completing features, commit and push to main in the same task. Don't leave this as a separate step.

## Karpathy Coding Principles

> Source: https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes.

### 1. Think Before Coding

Before implementing: state assumptions explicitly, surface tradeoffs, push back on complexity, stop and ask when unclear. Don't pick silently between interpretations.

### 2. Simplicity First

Minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. No speculative flexibility. If you write 200 lines and it could be 50, rewrite it.

### 3. Surgical Changes

Touch only what you must. Don't improve adjacent code, refactor things that aren't broken, or clean up pre-existing dead code. Every changed line should trace directly to the user's request. Remove only imports/variables/functions that YOUR changes made unused.

### 4. Goal-Driven Execution

Transform tasks into verifiable goals. For multi-step tasks, state a brief plan with verify steps. Define success criteria before starting so you can loop independently without constant clarification.
