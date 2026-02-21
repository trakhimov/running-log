# Running Log

Personal running fitness tracker powered by Strava. Deep analytics not available in stock Strava: cardiac efficiency trends, TRIMP training load, VDOT estimates, pace decoupling, and a route heatmap.

## Features

- **Cardiac Efficiency** — pace per HR, trended over easy runs
- **TRIMP Load** — weekly training load bar chart (last 12 weeks)
- **VDOT** — VO2max proxy from best efforts at 1k / 1mi / 5k / 10k
- **Pace Decoupling** — second-half vs first-half aerobic drift
- **Run type auto-tagging** — Easy / Long / Tempo / Interval / Race
- **Route heatmap** — all your runs on one Leaflet map
- **Personal Records** — best effort progression + race predictions
- **Mobile PWA** — add to home screen on iPhone Safari

## Tech Stack

- Next.js 16 (App Router)
- Drizzle ORM + Neon Postgres (serverless HTTP driver)
- Strava OAuth 2.0
- iron-session (Edge-compatible cookies)
- Recharts for analytics charts
- Leaflet + OpenStreetMap for route maps
- Neumorphic design system (custom Tailwind CSS)

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd running-log
npm install
```

### 2. Create a Strava App

1. Go to https://www.strava.com/settings/api
2. Create an app — set **Authorization Callback Domain** to your domain (or `localhost`)
3. Copy Client ID and Client Secret

### 3. Create a Neon database

1. Go to https://neon.tech and create a free project
2. Copy the connection string from the dashboard

### 4. Configure environment

```bash
cp .env.local.example .env.local
# Fill in STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, DATABASE_URL, SESSION_SECRET
```

Generate SESSION_SECRET:
```bash
openssl rand -hex 32
```

### 5. Run migrations

```bash
npm run db:push    # push schema directly (dev)
# or
npm run db:generate && npm run db:migrate  # migration files
```

### 6. Run locally

```bash
npm run dev
```

Visit http://localhost:3000 → Connect with Strava → Sync → done.

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel, set all env vars
3. Vercel cron job (in `vercel.json`) runs daily sync at 06:00 UTC

## Database commands

```bash
npm run db:studio    # Drizzle Studio — visual DB explorer
npm run db:generate  # Generate migration files
npm run db:migrate   # Apply migrations
npm run db:push      # Push schema (skips migration files, good for dev)
```
