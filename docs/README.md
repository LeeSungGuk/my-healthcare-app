# SilverCare Documentation Rules

This folder is the source of truth for product, design, backend, database, and
implementation decisions that should survive beyond a single commit.

## Rule

When a new UI feature implies backend, database, authentication, external
service, scheduled job, audit, permission, or data lifecycle work, create or
update the matching document under `docs/` before implementing the backend.

Do not connect frontend mocks to backend behavior only from memory or ad-hoc
code. The document should define the contract first.

## Folder Ownership

```text
docs/
├── DB/          Database models, schema decisions, relationships, retention
├── backend/     API routes, services, auth flows, jobs, integrations
├── design/      Product UI structure, brand, visual system, screen principles
├── history/     Why a decision/change happened during development
├── tasks/       SRS-derived tasks and implementation task lists
└── assets/      Documentation-only images and previews
```

## Required Before Backend Work

Create or update a document when a change introduces any of these:

- New persisted data
- New API endpoint
- Login, signup, invite, or session behavior
- Tenant, role, or permission behavior
- Audit log requirement
- File export/import
- External integration such as email, CRM, payment, or webhook
- Background job or scheduled task
- Data retention, deletion, or consent behavior

## Document Checklist

Each backend or DB document should answer:

- What user or system action creates this data?
- Which API endpoint or service owns the action?
- Which tables or records are created, updated, or read?
- Which role or tenant boundary applies?
- What is stored and what must never be stored?
- What audit event is required?
- What validation and error states exist?
- What remains mock-only in the current prototype?

## Current Example

The public login and partner request access screens are UI mocks today. Their
future backend and database contracts are documented in:

- [`docs/backend/partner-access-auth.md`](backend/partner-access-auth.md)
- [`docs/DB/partner-access-schema.md`](DB/partner-access-schema.md)

Backend ownership and migration-safe API rules are documented in
[`docs/backend/backend-boundary-rules.md`](backend/backend-boundary-rules.md).

Frontend/backend implementation boundaries are documented in
[`docs/design/frontend-backend-boundaries.md`](design/frontend-backend-boundaries.md).
Use that rule to keep the frontend independent from the backend implementation
language, so the initial TypeScript backend can be replaced by Python later.
