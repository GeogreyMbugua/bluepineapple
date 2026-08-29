# Blue Pineapple

Investment Platform

## Architecture

- Next.js
- NestJS
- PostgreSQL
- Prisma
- Redis
- BullMQ
- Turborepo

## Local development

Start the local PostgreSQL and Redis services:

```bash
docker compose up -d
docker compose ps
```

Copy the web environment template and keep the local values in the ignored file:

```bash
cp apps/web/.env.example apps/web/.env.local
```

The template is configured for the Compose ports (`PostgreSQL` on `5434` and `Redis` on
`6380`). The repository's existing migration history starts with an incremental
migration and does not contain a fresh-database baseline, so bootstrap a new local
database from the Prisma schema, then seed development data:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/blue_pineapple \
  pnpm --filter @blue-pineapple/database exec prisma db push --accept-data-loss
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/blue_pineapple \
  pnpm --filter @blue-pineapple/database seed
pnpm --filter @blue-pineapple/web dev
```

Stop the services without deleting their data:

```bash
docker compose down
```
