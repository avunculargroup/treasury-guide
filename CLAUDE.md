# Bitcoin Treasury Platform — Australian MVP

A Next.js web app that guides Australian company executives (CFOs, boards) through evaluating, planning, and implementing a bitcoin treasury strategy. Think "smart guided wizard" — educational, contextual, and output-oriented.

## Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript — strict mode, no `any`
- **Auth:** Single authenticated user per account (e.g. NextAuth)
- **Styling:** Tailwind CSS utility classes only
- **State:** React hooks + server state via fetch/SWR
- **DB:** (TBD — likely Postgres via Prisma or Supabase)

## Architecture

```
/app                  Next.js App Router pages and layouts
/app/api              API routes
/components/ui        Reusable, stateless UI primitives
/components/modules   Feature-specific components (wizard steps, assessments)
/lib                  Shared utilities, helpers, constants
/lib/content          Static educational content (markdown or JSON)
/lib/prompts          AI prompt templates
/types                Shared TypeScript types
```

## Platform Phases

The product is structured around four user-facing phases:

1. **Learn** — Bitcoin treasury fundamentals + Australian regulatory context (ATO, ASIC)
2. **Decide** — Company fit assessment and risk evaluation
3. **Plan** — Allocation strategy, custody structure, implementation roadmap
4. **Track** — Progress monitoring against the implementation plan

## Commands

- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript typecheck (no emit)
- `npm run test` — run Jest tests

## Code Conventions

- ES modules (`import/export`), not CommonJS
- Named exports preferred over default exports (except page/layout components)
- Functional components with hooks only — no class components
- Co-locate component tests with components (`Component.test.tsx`)
- API routes validate input before processing
- No hardcoded secrets — use `process.env.*` with validation at startup

## Key Product Constraints (MVP Scope)

- **Single authenticated user** — no multi-user collaboration in MVP
- **No live financial data** — no price feeds, exchange integrations, or real-time portfolio tracking
- **No operational workflows** — platform is for guidance and decision-making, not execution
- **Australia-specific** — regulatory content must reference ATO tax treatment and ASIC obligations
- **Session persistence** — users can save and resume progress across phases

## Output Artefacts

The platform should produce tangible deliverables:
- Board presentation deck (exportable)
- Implementation checklist
- Strategy summary document

## Important Notes

- NEVER commit `.env` or `.env.local` files
- AI-assisted guidance is contextual (inline), not a standalone chatbot
- Educational content and regulatory info must be clearly sourced/dated — this is not financial advice
- When generating content about Australian regulations, flag if information may be outdated
