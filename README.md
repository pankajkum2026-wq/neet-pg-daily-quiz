# NEET PG Daily Quiz

A monorepo for the **Daily Quiz for NEET PG** product — helping students build daily revision habits through curated MCQs, streaks, and analytics.

## Architecture

| App | Tech | Port |
|---|---|---|
| `apps/mobile` | React Native (Expo) | 8081 |
| `apps/admin` | Next.js 15 | 3000 |
| `apps/api` | NestJS | 3001 |
| `packages/database` | Prisma + PostgreSQL | 5432 |
| `packages/shared` | Shared types & validators | — |

## Prerequisites

- Node.js 20+
- pnpm 10+
- Docker (for PostgreSQL & Redis)

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start database services
docker compose -f infrastructure/docker-compose.yml up -d

# 3. Set up environment files
cp packages/database/.env.example packages/database/.env
cp apps/api/.env.example apps/api/.env

# 4. Generate Prisma client, run migrations, and seed
pnpm db:generate
cd packages/database && pnpm db:push && pnpm db:seed && cd ../..

# 5. Start all apps in development
pnpm dev
```

## Development URLs

- **API**: http://localhost:3001/api/v1/health
- **Admin CMS**: http://localhost:3000
- **Mobile**: Expo dev server on http://localhost:8081

## API Endpoints (MVP)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/home` | Home screen data (streak, today's quiz) |
| GET | `/daily-quiz/today` | Today's 10-question quiz |
| POST | `/attempts` | Start a quiz attempt |
| PATCH | `/attempts/:id` | Save progress / answers |
| POST | `/attempts/:id/submit` | Submit completed quiz |
| GET | `/attempts/:id/results` | Score, weak/strong topics, feedback |
| GET | `/attempts/history` | Past quiz attempts |
| GET | `/streaks/me` | Current streak data |
| GET | `/analytics/me` | Weekly accuracy, weak/strong subjects |
| GET/POST/DELETE | `/bookmarks` | Bookmark questions |
| GET | `/attempts/:id/incorrect` | Retry incorrect questions |

## Dev Authentication

In development, the API accepts `X-Dev-Firebase-Uid` header:
- `seed-student-uid` — student (Sameer)
- `seed-faculty-uid` — faculty (Dr. Faculty)

## Project Structure

```
apps/
  mobile/     # Student app (Expo)
  admin/      # Faculty CMS (Next.js)
  api/        # Backend API (NestJS)
packages/
  database/   # Prisma schema & migrations
  shared/     # Shared types & Zod validators
docs/         # PRD, wireframes, user flows
infrastructure/
  docker-compose.yml
```

## Product Docs

See the [`docs/`](docs/) folder for the full product specification:
- [PRD](docs/PRD.md)
- [User Flow](docs/UserFlow.md)
- [Wireframes](docs/Wireframes.md)
- [Roadmap](docs/Roadmap.md)
