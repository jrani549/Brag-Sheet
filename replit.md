# BragSheet — AI Career Page Builder

## Project Overview
BragSheet is an AI-powered career page builder built for the Replit buildathon. Users paste or upload their resume text, and Claude AI generates a complete personal career page in seconds — including animated skill bars, tech tag cloud, experience timeline, project showcase, certifications, LinkedIn-style contact card, and an AI recruiter chatbot that answers questions as the candidate.

## Architecture

### Monorepo structure (pnpm workspaces)
- `artifacts/bragsheet/` — React + Vite frontend (main user-facing app)
- `artifacts/api-server/` — Express API server (Claude AI integration)
- `lib/api-spec/` — OpenAPI spec (source of truth for endpoints)
- `lib/api-client-react/` — Generated React Query hooks (from OpenAPI codegen)
- `lib/api-zod/` — Generated Zod schemas for request validation
- `lib/db/` — Drizzle ORM + PostgreSQL schema
- `lib/integrations-anthropic-ai/` — Anthropic SDK client (Replit AI Integrations)

### Frontend (artifacts/bragsheet)
3-screen single-page app managed via React state:
1. **Upload Screen** — paste resume or drag/drop PDF, load sample button
2. **Loading Screen** — animated progress steps while Claude processes the resume
3. **Career Page** — full generated career page with all sections

Key components:
- `src/components/UploadScreen.tsx` — upload interface
- `src/components/LoadingScreen.tsx` — animated loader
- `src/components/CareerPage.tsx` — complete career page display
- `src/pages/dashboard.tsx` — screen state manager

### Backend (artifacts/api-server)
Two AI endpoints:
- `POST /api/generate` — parses resume text via Claude, returns structured CareerProfile JSON
- `POST /api/chat` — stateless recruiter chatbot (full message history sent each request)

### Database
PostgreSQL with Drizzle ORM. Tables:
- `conversations` — chat conversation metadata
- `messages` — chat message history

### AI Integration
Uses `@workspace/integrations-anthropic-ai` which wraps the Anthropic SDK with Replit AI Integrations credentials (no user API key needed). Model: `claude-sonnet-4-6`, max_tokens: 8192.

## Key Files
- `lib/api-spec/openapi.yaml` — API definition (edit here, run codegen to update types)
- `artifacts/api-server/src/routes/generate.ts` — resume parsing route
- `artifacts/api-server/src/routes/chat.ts` — chatbot route
- `artifacts/bragsheet/src/index.css` — CSS custom properties / theme

## Development Workflow
1. Edit OpenAPI spec: `lib/api-spec/openapi.yaml`
2. Run codegen: `pnpm --filter @workspace/api-spec run codegen`
3. Frontend hooks auto-update in `lib/api-client-react/src/generated/`
4. Backend Zod schemas auto-update in `lib/api-zod/src/generated/`

## Environment Variables / Secrets
- `DATABASE_URL` — PostgreSQL connection string (Replit managed)
- `SESSION_SECRET` — Express session secret
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — Anthropic API proxy URL (auto-set by Replit)
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Anthropic API key (auto-set by Replit)

## Design Decisions
- Indigo accent (#4f46e5) on white/off-white — premium but not flashy
- Inter for UI text, JetBrains Mono for resume textarea
- Skill bars animate on mount using CSS transitions (0 → pct% width)
- Chat history kept in React state client-side (stateless API calls)
- HTML export is fully client-side JS (no server call needed)
