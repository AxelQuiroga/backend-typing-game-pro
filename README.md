# Code Typist Arcade — Backend API

REST API for the Code Typist Arcade leaderboard system. Stores and retrieves player scores.

Built with **Express 5 + TypeScript + Prisma 7 + PostgreSQL**.

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14 running on `localhost:5432`

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Set up database
npx prisma generate
npx prisma db push

# 4. Start dev server
npm run dev
```

Server runs on [http://localhost:3001](http://localhost:3001).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio (visual DB browser) |

## API Endpoints

### `GET /api/health`

Health check.

```json
{ "status": "ok", "timestamp": "2026-07-12T00:16:35.847Z", "environment": "development" }
```

### `GET /api/scores?limit=10`

Get top scores for the leaderboard.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 10 | Number of scores to return (1-100) |

```json
{
  "success": true,
  "data": [
    { "id": 1, "nickname": "h4x0r_42", "score": 12500, "level": 7, "wordsCompleted": 42, "accuracy": 100, "createdAt": "...", "rank": 1 }
  ]
}
```

### `POST /api/scores`

Submit a new score. Validated with Zod.

**Request body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `nickname` | string | yes | 2-30 chars, alphanumeric + `_-` only |
| `score` | number | yes | Integer, 0 - 10,000,000 |
| `level` | number | yes | Integer, 1 - 100 |
| `wordsCompleted` | number | yes | Integer, 0 - 10,000 |
| `timestamp` | string | no | ISO 8601 datetime |

**Success response (201):**

```json
{
  "success": true,
  "rank": 1,
  "message": "Score recorded",
  "data": { "id": 1, "nickname": "h4x0r_42", "score": 12500, "level": 7 }
}
```

**Validation error (400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "nickname", "message": "Nickname must be at least 2 characters" }
  ]
}
```

## Project Structure

```
src/
├── config/
│   ├── env.ts               # Environment variables (fail-fast)
│   └── db.ts                # Prisma singleton with PrismaPg adapter
├── dtos/
│   └── score.dto.ts         # Zod schemas (validation at the boundary)
├── services/
│   └── score.service.ts     # Business logic (pure, no HTTP awareness)
├── controllers/
│   └── score.controller.ts  # HTTP layer (req → dto → service → res)
├── routes/
│   └── scores.routes.ts     # Endpoint definitions
├── app.ts                   # Express composition root
└── server.ts                # Entry point + graceful shutdown
prisma/
├── schema.prisma            # Database schema
└── prisma.config.ts         # Prisma config
```

## Architecture Decisions

- **Clean Architecture layers** — `service.ts` knows nothing about Express, HTTP, or request objects. It could be called from a CLI, a queue consumer, or a WebSocket handler.
- **Zod at the boundary** — All input validation happens in DTOs before reaching controllers. Services receive already-validated data.
- **Prisma 7 + PrismaPg adapter** — Prisma 7 requires an explicit driver adapter. This is the new standard for database-agnostic clients.
- **Graceful shutdown** — Handles `SIGINT`/`SIGTERM` to disconnect from PostgreSQL cleanly.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | no | 3001 | Server port |
| `NODE_ENV` | no | development | Environment |
| `DATABASE_URL` | **yes** | — | PostgreSQL connection string |

## Database

PostgreSQL with a single `scores` table:

```sql
CREATE TABLE scores (
  id             SERIAL PRIMARY KEY,
  nickname       VARCHAR(30) NOT NULL,
  score          INTEGER NOT NULL,
  level          INTEGER NOT NULL,
  "wordsCompleted" INTEGER NOT NULL DEFAULT 0,
  accuracy       DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX scores_score_idx ON scores (score DESC);
```
