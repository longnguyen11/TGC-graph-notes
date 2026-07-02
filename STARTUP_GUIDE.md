# Startup Guide

## What was built
- `/graph` renders the provided `testData` as an interactive fps-over-time line chart.
- `/notes` renders a create/read/delete feed for posts with `author` and `body`.
- `/api/notes` exposes REST endpoints for listing and creating notes.
- `/api/notes/[id]` deletes a note by id.

The original scaffold included `app/notes/api/route.ts`, which maps to `/notes/api`.
This implementation uses `/api/notes` instead because it is the conventional REST
surface for a Next.js app.

## Local setup
1. Use Node 24 LTS. If you use `nvm`, run:

   ```bash
   nvm use
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` from `.env.example` and set both database URLs to your Prisma
   Postgres standard TCP connection string:

   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
   DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
   ```

   This project uses `@prisma/adapter-pg`, so use the `postgres://...` URL.
   Do not use the `prisma+postgres://...` API-key URL here.

4. Apply the database migration:

   ```bash
   npm run prisma:migrate
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

6. Open the app:

   ```text
   http://localhost:3000
   ```

## Verification
Run the checks before submitting:

```bash
npm run test
npm run lint
npm run build
```

## Deployment
Deploy with Vercel and set both `DATABASE_URL` and `DIRECT_URL` in the project
environment variables. Use the same Prisma Postgres standard `postgres://...`
connection string.

Before release, apply migrations against the deployed database:

```bash
npm run prisma:migrate:deploy
```

`postinstall` runs `prisma generate`, so Vercel will generate Prisma Client during
install before `next build`.

After deployment, verify:
- `/graph` renders the chart and tooltip data.
- `/notes` loads the feed.
- Creating and deleting notes works against the deployed database.
