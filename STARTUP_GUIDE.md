# Implementation Notes

## What Was Built
- `/graph` renders the provided `testData` as an interactive fps-over-time line chart.
- `/notes` renders a create/read/delete feed for posts with `author` and `body`.
- `/api/notes` exposes REST endpoints for listing and creating notes.
- `/api/notes/[id]` deletes a note by id.

The original scaffold included `app/notes/api/route.ts`, which maps to `/notes/api`.
This implementation uses `/api/notes` instead because it is the conventional REST
surface for a Next.js app.

## Local Setup
1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and set `DATABASE_URL` to a Postgres database.

3. Apply the database migration:

   ```bash
   npm run prisma:migrate
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

## Verification
Run the checks before submitting:

```bash
npm run test
npm run lint
npm run build
```

## Deployment
Deploy with Vercel and set `DATABASE_URL` in the project environment variables.
Before or during release, apply migrations against the deployed database:

```bash
npm run prisma:migrate:deploy
```

`postinstall` runs `prisma generate`, so Vercel will generate Prisma Client during
install before `next build`.
