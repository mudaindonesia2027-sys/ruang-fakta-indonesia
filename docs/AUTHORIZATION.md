# Authorization Model

Roles:
- USER
- CONTRIBUTOR
- EDITOR
- FACT_CHECKER
- MODERATOR
- ADVERTISER
- ADMIN

The current implementation contains a central permission map in `lib/auth.ts`.

Production rule:
- Authentication identifies the user.
- Authorization checks role and permission server-side.
- UI visibility must never be the only security mechanism.
- Sensitive actions must be recorded in AuditLog.
