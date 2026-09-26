# Book Club

Mobile-first web app for a three-person yearly reading challenge. Each year everyone
suggests books, some are picked for the year's list, and everyone ticks off what they
have read. No accounts: anyone can tick any box, like in the spreadsheet it replaces.

Stack: Next.js (App Router, server actions), MUI, Prisma, Postgres.

## Local development

```bash
cp .env.template .env        # DATABASE_URL points at the docker Postgres below
docker compose up -d         # Postgres on localhost:5434
npm install
npm run db:migrate           # apply migrations
npm run db:seed              # load history from prisma/seed-data.json
npm run dev                  # http://localhost:3002
```

Other scripts:

| Script                | What it does                                              |
| --------------------- | --------------------------------------------------------- |
| `npm run typecheck`   | `tsc --noEmit`                                            |
| `npm run lint`        | ESLint                                                    |
| `npm run db:reset`    | drop, migrate and seed the local database                 |
| `npm run seed:from-excel [path]` | regenerate `prisma/seed-data.json` from the original xlsx |

## Routes

| Route                  | Page                                                    |
| ---------------------- | ------------------------------------------------------- |
| `/`                    | redirects to the current year                           |
| `/[year]`              | the year's list with read toggles and page totals       |
| `/[year]/suggestions`  | suggestions per person: veto, add to list, delete, add  |
| `/stats`               | books and pages per year                                |

## Deploying to Vercel + Neon

1. Push the repo to GitHub.
2. In Vercel: **Add New → Project → Import** this repository. Framework preset: Next.js.
3. In the project's **Storage** tab add **Neon** (Marketplace). It creates the database and
   sets `DATABASE_URL` for the project.
4. Deploy. The build script runs `prisma generate && prisma migrate deploy && next build`,
   so the schema is applied on every deploy.
5. Seed production once from your machine:

   ```bash
   DATABASE_URL="<neon connection string>" npm run db:seed
   ```

   The seed wipes and reloads all tables, so run it only on an empty database.
