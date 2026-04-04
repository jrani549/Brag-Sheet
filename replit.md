# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Bragsheet (react-vite, `/`)
A personal achievement tracker. Users can log wins, accomplishments, and career highlights.
- Pages: Dashboard (`/`), Journal/Entries (`/entries`), New Entry (`/entries/new`), Entry Detail (`/entries/:id`), Categories (`/categories`)
- Theme: Leather journal aesthetic — parchment background, cordovan leather primary, gold foil accent
- Fonts: Fraunces (serif), Plus Jakarta Sans (sans)

### API Server (`/api`)
Express 5 backend serving Bragsheet data.
- Routes: `/api/entries`, `/api/categories`, `/api/summary`, `/api/healthz`

## DB Schema

- `categories` — id, name, color, created_at
- `entries` — id, title, description, impact (low/medium/high), category_id, date, created_at, updated_at

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
