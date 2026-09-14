# RUANG FAKTA — Go Live Checklist

## Supabase
- Configure Google OAuth.
- Add localhost and production callback URLs.
- Copy Supabase URL and publishable key.
- Set the PostgreSQL connection string as DATABASE_URL.

## Local verification
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev

Test Google login, logout, /api/auth/me, admin protection, article creation, issue creation, and moderation.

## Administrator bootstrap
Login once with Google, then run prisma/production-role.sql with the real administrator email.

## GitHub and Vercel
Push the repository to GitHub, import it in Vercel, add environment variables, deploy, then add the final Vercel URL to Supabase redirect URLs.

Never commit .env.local or secrets.
