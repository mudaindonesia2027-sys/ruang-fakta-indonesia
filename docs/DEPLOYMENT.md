# Deployment Guide

## Local development
1. Install Node.js and PostgreSQL, or run PostgreSQL with Docker.
2. Copy `.env.example` to `.env`.
3. Set a real `DATABASE_URL`.
4. Run:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Online deployment
A production deployment requires:
- a hosting account for the Next.js app
- a managed PostgreSQL database
- environment variables
- a domain (optional at first, recommended for launch)

Typical deployment flow:
1. Push this repository to a private Git repository.
2. Create a PostgreSQL database.
3. Add `DATABASE_URL` to hosting environment variables.
4. Run Prisma generation/migrations during deployment.
5. Deploy the Next.js app.
6. Attach a domain and HTTPS.
7. Replace the development authentication placeholder before public launch.

## Do not launch yet if
- admin authorization still uses `x-user-role`
- production secrets are missing
- database backups are not configured
- input validation/rate limits are absent
