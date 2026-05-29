# Backend Documentation

Backend documents live here when a feature needs API routes, service ownership,
authentication, authorization, validation, jobs, external integrations, or audit
events.

## Required Content

Each backend document should include:

- Public or protected API routes
- Request and response contracts
- Service responsibilities
- Auth and role requirements
- Tenant boundary rules
- Validation and error states
- Audit events
- Database documents it depends on
- Mock behavior that must be replaced later

## Current Documents

- [`backend-boundary-rules.md`](backend-boundary-rules.md): backend ownership,
  auth/session, tenant, API key, audit, and migration-safe contract rules.
- [`partner-access-auth.md`](partner-access-auth.md): backend flow plan for
  partner request access, invite-based onboarding, login, sessions, and logout.
