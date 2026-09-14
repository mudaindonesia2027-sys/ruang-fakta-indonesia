# Backend Implementation V4

## API routes
- `GET/POST /api/articles`
- `GET/PATCH /api/articles/:id`
- `GET/POST /api/issues`
- `GET/PATCH /api/issues/:id`
- `POST /api/issues/:id/updates`
- `PATCH /api/comments/:id/moderate`
- `GET /api/admin/overview`

## Security boundary
The current build includes role/permission middleware helpers and a temporary
development role header (`x-user-role`). This is NOT production authentication.

Production must replace this with:
- authenticated sessions
- server-side user lookup
- CSRF strategy where applicable
- rate limiting
- input validation
- audit actor identity
- protected admin routes

## Database setup
1. Configure `DATABASE_URL`
2. `npm install`
3. `npm run db:generate`
4. `npm run db:push`
5. `npm run db:seed`
6. `npm run dev`
