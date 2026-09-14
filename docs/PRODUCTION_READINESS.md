# Production Readiness

This repository combines the earlier RUANG FAKTA foundations into one project.

## Already present
- Public application foundation
- CMS/Admin UI
- Prisma data model
- Article and issue API foundations
- Moderation API
- Audit helper
- Role/permission foundation
- Seed data

## Required before public launch
1. Replace temporary `x-user-role` development authorization with real authentication.
2. Add password hashing and secure credential storage.
3. Add server-side session validation and admin route guards.
4. Validate all API input with a schema validator.
5. Add rate limiting and abuse protection.
6. Add production database credentials.
7. Configure media/object storage.
8. Add email provider for account flows.
9. Add monitoring, backups, error tracking and logging.
10. Configure domain, HTTPS, privacy policy and terms.

## Suggested production architecture
Browser
  -> Next.js application
  -> Authentication/session layer
  -> PostgreSQL
  -> Object storage for media
  -> Email provider
  -> Monitoring/error tracking

The application must not be publicly deployed with the temporary development role resolver enabled.
