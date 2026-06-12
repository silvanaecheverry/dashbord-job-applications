# Job Application Tracker

A full-featured, mobile-first job application tracker built with Next.js, TypeScript, Tailwind CSS, and Supabase. Track applications, interviews, recruiter contacts, and company research, and get a live dashboard with KPIs and charts — no user account or login required.

## Features

- **Dashboard** — 10 KPIs (total applications, applications this month, interviews scheduled/completed, active applications, offers, acceptances, rejections, high-interest roles, companies researched) plus pipeline funnel, monthly trend, job type, and interest level charts.
- **Applications** — full CRUD with all tracked fields, sortable/filterable/paginated table, search, CSV export.
- **Interviews** — manage multiple interviews per application, plus a global interviews view across all applications.
- **Company Research** — notes on companies you're targeting (industry, size, recruiters, etc.).
- **Recruiters** — a contact list of recruiters you've worked with.
- **Analytics & Reports** — applications by location/source, interview completion rate, offer conversion rate, full KPI grid, CSV export.
- **No authentication** — open the dashboard directly and manage shared tracker data without signing in.
- **Dark / light mode**, responsive layout (desktop, tablet, mobile), toast notifications, delete confirmations, empty/loading states.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Postgres, via `@supabase/supabase-js`)
- [react-hook-form](https://react-hook-form.com/) + [zod](https://zod.dev/) for form validation
- [@tanstack/react-table](https://tanstack.com/table) for sortable/filterable tables
- [Recharts](https://recharts.org/) for dashboard/analytics charts
- [next-themes](https://github.com/pacocoursey/next-themes) for dark/light mode
- [sonner](https://sonner.emilkowal.ski/) for toast notifications

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com/) and create a new project.
2. Once it's ready, open **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql). This creates:
   - `job_applications`, `interviews`, `company_research`, and `recruiters` tables
   - Public read/write access for the anon key
   - A migration path that removes the previous auth-owned `profiles` table, `user_id` columns, and per-user RLS policies if you already ran the old schema
3. Go to **Settings → API** and copy:
   - **Project URL**
   - **anon / public API key**

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from step 1:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app opens directly to `/dashboard`; there is no sign-in or sign-up flow.

If the app shows `Failed to fetch`, check `.env.local` first:

- `NEXT_PUBLIC_SUPABASE_URL` must be the exact **Project URL** from Supabase **Settings → API**.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be the matching **anon / public** key from the same project.
- Restart `npm run dev` after changing `.env.local`; browser-exposed `NEXT_PUBLIC_` values are bundled by Next.js during development.
- If the hostname does not resolve (`ENOTFOUND`), the project URL is mistyped, from a deleted/paused project, or not the real Supabase project URL.

> This schema is intentionally public. Do not store sensitive personal data unless you add authentication and Row Level Security back.

## 4. Deploy to Vercel

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In [Vercel](https://vercel.com/), create a new project from the repo.
3. Add the same two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in **Project Settings → Environment Variables**.
4. Deploy. Vercel will build and host the Next.js app; Supabase continues to store the tracker data.

## Project Structure

```
app/
  (app)/                  App shell (sidebar + topbar)
    dashboard/            KPIs + charts
    applications/         List, add, edit (with interviews)
    interviews/           All interviews across applications
    research/             Company research
    recruiters/           Recruiter contacts
    analytics/            Extended charts + KPI grid + CSV export
components/
  ui/                      Shared UI primitives (Button, Input, Modal, etc.)
  layout/                  Sidebar, Topbar, mobile nav, theme toggle
  applications/, interviews/, research/, recruiters/, charts/, analytics/
lib/
  supabase/                Browser/server Supabase clients
  types.ts, constants.ts   Domain types and dropdown options
  validations.ts           Zod schemas
  analytics.ts             KPI and chart data calculations
  csv.ts                   CSV export helper
supabase/schema.sql         Public database schema
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — run ESLint
