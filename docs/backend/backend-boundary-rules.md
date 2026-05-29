# Backend Boundary Rules

This document defines what the SilverCare backend owns, what it must never leak
to the frontend, and how to keep the initial TypeScript backend replaceable by a
future Python backend.

Related documents:

- [`partner-access-auth.md`](partner-access-auth.md)
- [`../DB/partner-access-schema.md`](../DB/partner-access-schema.md)
- [`../design/frontend-backend-boundaries.md`](../design/frontend-backend-boundaries.md)

## Backend Language Rule

- The first backend may be TypeScript on Node.js.
- Backend code must be treated as an implementation of the HTTP contract, not as
  the contract itself.
- A future Python backend must be able to implement the same endpoint, request,
  response, error, auth, tenant, and audit contracts.

## Backend Must Own

- HTTP API routes and request/response contracts.
- Authentication and session lifecycle.
- Tenant resolution and tenant isolation.
- Role and permission decisions.
- Server-side request validation.
- API key issuance, one-time reveal, hashing, listing, and revocation.
- Invite token hashing, expiry, acceptance, and revocation.
- Database reads and writes through repositories or data-access modules.
- Audit event creation for sensitive actions.
- Rate limits, abuse protection, and public endpoint throttling.
- External side effects such as email, CRM, webhooks, payment, storage, and LLM
  provider calls.
- Server-side redaction before any sensitive payload reaches the frontend.

## Backend Must Not Delegate To Frontend

The frontend must not be the source of truth for:

- `tenant_id`
- user role
- environment
- authenticated session state
- invite validity
- API key status
- audit event creation
- consent, deletion, retention, or data lifecycle state

The frontend may display these values, but the backend must determine and return
them.

## Route Layer Rules

Route handlers should be thin. They should:

- Parse the request.
- Resolve authentication/session context.
- Call application services.
- Return the documented response or error envelope.

Route handlers should not directly own complex tenant, role, API key, consent,
or audit logic. That logic belongs in service modules so it can be tested and
ported to Python later.

## Service Layer Rules

Services own business decisions. They should:

- Enforce tenant and role boundaries.
- Validate action-level permissions.
- Coordinate repository writes and audit events.
- Coordinate external side effects.
- Return implementation-agnostic domain results to route handlers.

Services must not depend on frontend component state, UI route names, or mock
browser behavior.

## Repository And Database Rules

Repositories own database access. They should:

- Hide the database driver or ORM from route handlers and UI code.
- Express tenant filters explicitly on every tenant-scoped read or write.
- Store only hashes for session tokens and invite tokens.
- Never store raw API keys after one-time reveal.
- Write audit records with backend-generated `request_id` values.

Database schema ownership remains in `docs/DB/`. Backend documents should link
to the DB document they depend on instead of redefining tables inline.

## Auth And Session Rules

- Login must authenticate approved partner users only.
- Console routes must require a valid backend session.
- Role and tenant scope must come from the resolved session, not client input.
- Session tokens must be stored as hashes.
- Public errors must not reveal whether an email exists.
- Logout must revoke the active session and create an audit event.

## API Key Rules

- Public partner access requests must never create API keys.
- API keys may be issued only after tenant and role checks pass.
- Raw API keys may be returned only in the one-time issuance response.
- Lists, detail responses, logs, fixtures, and audit payloads must not expose raw
  keys or key hashes to the frontend.
- Revocation must be server-side and auditable.

## Invite And Partner Access Rules

- SilverCare does not use open B2C-style self-signup for the Partner Console.
- Public partner applications create reviewable application records only.
- Approval creates or links a tenant before an invite is issued.
- Invite email and tenant scope come from the backend record, not client input.
- Expired, accepted, or revoked invites must not create users or sessions.

## Error And Privacy Rules

Backend errors should use a documented shape and safe public messages.

Never return:

- raw transcripts
- direct PII
- raw API keys
- key hashes
- raw invite tokens after the issuance/delivery boundary
- session tokens
- production tenant payloads in demo or default UI responses

Public endpoints must use rate limiting and privacy-preserving messages before
deployment.

## Migration-Safe Contract Rules

To keep a Python backend migration possible:

- Keep endpoint paths stable.
- Keep request, response, and error shapes documented.
- Prefer additive enum and field changes over renames.
- Generate `request_id`, timestamps, actor, tenant, and scope fields server-side.
- Do not let frontend code import backend service, repository, auth, or DB
  modules directly.
- Do not make Next.js Server Actions the only implementation of core backend
  rules. Treat them as adapters that call backend contracts or backend services.

## Required Tests Before Backend Implementation Is Considered Ready

- Request validation and error-shape contract tests.
- Auth/session success and failure tests.
- Tenant guard and role guard tests.
- Public endpoint rate-limit and privacy-message tests.
- Invite token expiry, revocation, and one-time acceptance tests.
- API key one-time reveal, listing, and revocation tests.
- Audit event assertions for application submission, approval, invite creation,
  invite acceptance, login, and logout.
- DB write mapping tests for each sensitive action.

## Current Prototype Rule

The current UI may keep mock login, request access, session, API key, and policy
behavior in the frontend prototype. Before replacing those mocks with backend
behavior, update the relevant backend and DB documents and keep this boundary
document as the implementation guardrail.
