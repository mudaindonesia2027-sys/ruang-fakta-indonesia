# RUANG FAKTA — Supabase + Google Auth + Vercel Setup

## 1. Supabase
Create or select a Supabase project.

Copy these values into `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose in client code)

For Prisma, copy the PostgreSQL connection string into:
- `DATABASE_URL`

## 2. Google OAuth
In Google Cloud Console:
1. Create OAuth credentials for a Web Application.
2. Add the authorized redirect URI shown by Supabase Auth.
3. Add your production application URL as an authorized JavaScript origin if required.

In Supabase:
1. Open Authentication > Providers.
2. Enable Google.
3. Enter Google Client ID and Client Secret.
4. Configure Site URL.
5. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR-VERCEL-DOMAIN/auth/callback`

## 3. Database
Run:
```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

## 4. Vercel
Push this project to GitHub, then import the repository in Vercel.

Add environment variables in Vercel:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- DATABASE_URL
- NEXT_PUBLIC_APP_URL

Deploy.

## 5. Important before public launch
The existing legacy development authorization helper using `x-user-role` must be replaced
inside editorial APIs with session-derived roles from Supabase before public launch.
This package establishes Supabase authentication and admin route session protection;
the next implementation step is syncing Supabase users to the application User table
and enforcing database-backed roles for every protected API mutation.
