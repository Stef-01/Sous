# Sous — Cook Confidently Tonight

Sous is a cooking fluency platform. Type a craving or photograph a dish, and the app returns intelligently paired side dishes with step-by-step guided cooking. Think Duolingo for cooking confidence, not another recipe database.

## Quick Start (5 minutes)

```bash
# 1. Clone and install
git clone https://github.com/your-org/sous.git
cd sous
pnpm install

# 2. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables are needed for V1 — the app runs entirely on static data with mock AI responses.

### Optional: Environment Variables

Copy `.env.example` to `.env.local` for optional features:

```bash
cp .env.example .env.local
```

| Variable                            | Required for V1? | Purpose                               |
| ----------------------------------- | ---------------- | ------------------------------------- |
| `DATABASE_URL`                      | No               | PostgreSQL (Neon) for persistent data |
| `ANTHROPIC_API_KEY`                 | No               | AI-powered craving parsing + coach    |
| `OPENAI_API_KEY`                    | No               | Camera-based food recognition         |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | No               | Auth (disabled in V1)                 |
| `CLERK_SECRET_KEY`                  | No               | Auth (disabled in V1)                 |
| `NEXT_PUBLIC_APP_URL`               | No               | Defaults to `http://localhost:3000`   |
| `NEXT_PUBLIC_SITE_URL`              | No               | Defaults to `https://sous.vercel.app` |

## Commands

```bash
pnpm dev          # Dev server at localhost:3000
pnpm build        # Production build (runs data validation first)
pnpm test         # Unit tests (Vitest)
pnpm test:e2e     # E2E tests (Playwright)
pnpm lint         # ESLint + Prettier check
pnpm lint:fix     # Auto-fix lint issues
pnpm validate:data # Verify guided cook data integrity
```

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript (strict)
- **Styling**: Tailwind CSS 4, Framer Motion
- **State**: Zustand (client), TanStack Query (server)
- **Data**: Static JSON (sides.json, meals.json) + guided-cook-steps.ts
- **Testing**: Vitest (73 unit tests), Playwright (6 E2E tests)
- **Deploy**: Vercel

## Project Structure

```
src/
  app/              # Next.js App Router pages
    (today)/        # Today page (home — core experience)
    (path)/         # Path tab (progression, skill tree)
    cook/           # Guided cook flow
    api/            # tRPC + API routes
  components/
    today/          # QuestCard, ResultStack, TextPrompt
    guided-cook/    # StepCard, Timer, MissionScreen, WinScreen
    path/           # SkillTree, JourneySummary
    shared/         # TabBar, CoachQuiz, ErrorBoundary
  lib/
    engine/         # Pairing engine, ranking, scoring
    ai/             # AI integrations (with mock fallbacks)
    hooks/          # Custom React hooks
    db/             # Database schema + validation
  data/             # Static data (sides, meals, skill tree)
  types/            # Zod schemas + TypeScript types
```

## Data

- **203 sides** across 10+ cuisine families
- **76 meals** with cuisine and pairing metadata
- **126 guided cook entries** (59% side coverage, 9% meal coverage)
- All image URLs are null — gradient + emoji fallback renders everywhere

## Deploy to Vercel

```bash
vercel
```

No environment variables are required for the static-data V1. For AI features, set `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` in the Vercel dashboard.
