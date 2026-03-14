# Ink & Soul — Tattoo Art Studio

A mobile-first web app for a tattoo artist to showcase their portfolio, manage appointments, sell art, offer courses, and chat with clients. Built with React + TypeScript + Vite + TailwindCSS + Supabase.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Copy your **Project URL** and **anon public key** from Settings > API

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

### 4. Set up the database

In your Supabase dashboard, go to **SQL Editor** and run these files in order:

1. `supabase-schema.sql` — creates all tables, RLS policies, triggers, and indexes
2. `supabase-seed.sql` — populates initial data (portfolio, shop items, courses, reminders)

### 5. Create the artist account

In the Supabase dashboard, go to **Authentication > Users** and create a user. Then in the SQL Editor, update their profile role:

```sql
UPDATE public.profiles SET role = 'artist' WHERE id = 'THE_USER_UUID';
```

### 6. Run the dev server

```bash
npm run dev
```

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — the `vercel.json` handles SPA routing

## Project Structure

```
src/
  lib/supabase.ts          Supabase client singleton
  types/index.ts           TypeScript interfaces
  types/database.ts        Supabase database types
  data/constants.ts        Static reference data (styles, body parts, etc.)
  contexts/AuthContext.tsx  Auth state provider
  hooks/                   Data hooks (useAppointments, useChat, etc.)
  pages/                   Client-facing pages
  studio/                  Artist admin pages (protected)
  components/              Shared UI components
supabase-schema.sql        Database schema & RLS policies
supabase-seed.sql          Seed data
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, RLS)
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Icons**: Lucide React
