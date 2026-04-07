# CLAUDE.md — Sous

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
5. **Progressive interface**: New users see only the Today tab. Path reveals after 3 completed cooks. Community after 30 days. This is enforced in the layout, not optional.
6. **Simplicity-first UI**: When in doubt, remove it. Badges, labels, metadata, and decorative elements should be stripped unless they directly drive the user to cook. The home screen should feel clean and inviting, not information-dense. Every element must earn its pixel space.
7. **No invented recipes or images**: Never generate new dish entries or images that don't already exist in the dataset (`sides.json`, `meals.json`). When adding guided cook instructions, only add step-by-step cook flows to existing meals and sides already present in the data layer. New recipes must come from real, reputable online sources and be added to the existing side/meal catalog first.
8. **Consult STRATEGY.md before planning new features**: Before designing or implementing any new feature, read STRATEGY.md to ensure the feature aligns with the strategic thesis, strengthens a compounding moat, and passes the feature prioritization criteria. Update STRATEGY.md's decision log when making significant feature decisions.

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
