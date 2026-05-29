# Frontend And Backend Boundary Rules

This document defines the implementation boundary between the SilverCare frontend
and backend. The goal is to start with TypeScript for both sides while keeping a
future full Python backend migration possible.

## Language Decision

- Frontend: TypeScript with the planned Next.js App Router structure.
- Initial backend: TypeScript on Node.js.
- Future backend option: Python may replace the TypeScript backend if AI, data,
  or operational needs make Python the better long-term backend language.

The frontend must not depend on the backend implementation language. It should
depend only on documented HTTP contracts.

## Core Boundary Rule

```text
Frontend
  -> API client
    -> HTTP API contract
      -> Backend implementation
```

The backend implementation may be TypeScript today and Python later. The
frontend should not need structural changes when that replacement happens.

## Frontend Must Own

- Route composition and page layout.
- UI state such as selected filters, open dialogs, form drafts, and optimistic
  display state.
- UI-only validation that improves feedback before submission.
- API client calls to documented endpoints.
- Rendering of server-provided role, tenant, consent, report, and audit data.
- Mock/demo fixtures that are clearly marked and never mixed with production
  data.

## Frontend Must Not Own

- Database access.
- Tenant authorization decisions.
- Session token creation, verification, hashing, or revocation.
- API key generation, hashing, storage, or verification.
- Audit log persistence.
- Provider adapters for LLMs, email, CRM, payment, or storage.
- Backend secrets, salts, private keys, or production credentials.

UI modules and Client Components must not import backend services,
repositories, database clients, Prisma models, provider adapters, or secret
configuration.

## Backend Must Own

- Authentication and session boundaries.
- Tenant and role authorization.
- API key issuance, one-time reveal, hashing, listing, and revocation.
- Request validation at the trusted system boundary.
- Database reads and writes.
- Audit log creation for sensitive actions.
- Consent, deletion, retention, and data lifecycle rules.
- External provider calls and retry/error handling.
- Server-side redaction before sensitive data leaves the backend.

## Shared Contract Must Own

The stable contract between frontend and backend should be documented before
implementation. Prefer OpenAPI or JSON Schema when the project moves beyond the
current prototype.

Each contract should define:

- Endpoint path and HTTP method.
- Request shape.
- Response shape.
- Error shape.
- Authentication and role requirements.
- Tenant boundary behavior.
- Audit event requirements.
- Data that must never be returned to the frontend.

## Next.js Boundary Rules

- `page.tsx` and `layout.tsx` should stay thin and compose feature modules.
- Server Components may fetch backend data through documented API/service
  boundaries, but must not become the permanent home of business logic that
  would block a Python backend migration.
- Server Actions are UI mutation adapters. They may call backend endpoints or
  server-side services, but should not become the only implementation of core
  business rules.
- Route Handlers are real HTTP boundaries for external APIs, webhooks,
  integration callbacks, health checks, and JSON responses.

## Migration-Safe Backend Rule

If the backend starts in TypeScript, treat it as one implementation of the API
contract, not as the contract itself.

Migration-safe code:

```text
Frontend -> /api/auth/session -> backend returns documented session shape
```

Migration-hostile code:

```text
Frontend -> imports backend auth/session helper directly
```

When a Python backend replaces the TypeScript backend, the frontend should only
need an API base URL or deployment routing change if the HTTP contract remains
compatible.

## Testing Rules

- Frontend tests should assert user-visible behavior and API client handling.
- Backend tests should assert authorization, validation, persistence, audit, and
  redaction behavior.
- Contract tests should be reusable against both a TypeScript backend and a
  future Python backend.
- Privacy negative assertions must confirm that raw transcripts, direct PII,
  raw API keys, key hashes, and production tenant payloads are not exposed.

## Current Prototype Rule

The current dependency-free prototype may keep mock behavior in
`apps/web/src/mock-data.mjs` and policy checks in `apps/web/src/policies.mjs`.
Before connecting real backend behavior, update the matching documents under
`docs/backend/` and `docs/DB/` first.
