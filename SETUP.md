# Inventory Tracker — Setup Guide

A mobile-friendly web app for your team to track inventory with photos, labels,
search, sorting, and filtering. Built with Next.js + Supabase.

## Running it on your computer

```powershell
cd $env:USERPROFILE\Projects\inventory-tracker
npm run dev
```

Then open http://localhost:3000. Until Supabase is connected you'll see a
**setup screen** — that's expected.

## Connecting Supabase (one-time, ~5 minutes)

1. Go to **https://supabase.com**, sign up (free), and create a new project.
   Pick any name and a database password (save it somewhere).
2. Wait ~2 minutes for the project to finish provisioning.
3. In the project, open **SQL Editor → New query**, paste the entire contents of
   [`supabase-schema.sql`](./supabase-schema.sql), and click **Run**. This creates
   the items table, security rules, and the photo storage bucket.
4. Open **Settings → API**. Copy:
   - **Project URL**
   - **anon public** key (under "Project API keys")
5. Paste both into the **`.env.local`** file in this folder:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```
6. Stop the dev server (Ctrl+C) and run `npm run dev` again.

You'll now see a sign-in screen. Enter your email, click the magic link sent to
your inbox, and you're in.

## Adding your team

Each teammate just visits the site and signs in with their own email — they all
share the same inventory. (In Supabase, **Authentication → Providers → Email**
is on by default. To restrict who can join, you can disable open sign-ups there.)

## Putting it online (so phones can use it)

Deploy free to Vercel:

1. Push this folder to a GitHub repo.
2. Go to **https://vercel.com**, import the repo.
3. Add the same two environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy. You'll get a URL like `https://your-inventory.vercel.app`.
5. On your phone, open that URL and use the browser's **"Add to Home Screen"** —
   it now behaves like an installed app, with camera upload.

## Data model

Each item has: photo, name, category, quantity, location, notes, date added,
and who added it. Edit any of this anytime from the app.
