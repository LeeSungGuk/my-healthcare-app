# Partner Access And Auth Backend Plan

## Context

The frontend now has two public access screens:

- `#/login`
- `#/request-access`

They are mock-only in the prototype. Backend implementation must not be inferred
only from the UI. This document defines the first backend contract to connect
these screens later.

Related DB document:

- [`../DB/partner-access-schema.md`](../DB/partner-access-schema.md)

## Product Rule

SilverCare Partner Console should not use open B2C-style self-signup.

The intended flow is:

```text
Visitor
-> Request partner access
-> Internal review
-> Tenant created or selected
-> Invite issued
-> Partner user accepts invite
-> Login
-> Partner Console
```

## API Routes

### `POST /api/partner-applications`

Public endpoint for partner access requests.

Request:

```json
{
  "company_name": "Demo Robotics",
  "contact_email": "partnership@example.com",
  "use_case": "senior_chat_api_poc",
  "review_note": "We want to test the character chat API in a partner device."
}
```

Response:

```json
{
  "application_id": "app_123",
  "status": "submitted",
  "request_id": "req_123"
}
```

Validation:

- `company_name` required.
- `contact_email` required and must be a valid email.
- `use_case` required and must map to a known enum.
- `review_note` must not contain production elder data or raw transcripts.

Security:

- Rate limit by IP and email.
- Add bot/spam protection before public deployment.
- Do not create tenant, user, session, or API key from this endpoint.

Audit:

- `partner_application.submitted`

### `POST /api/admin/partner-applications/:id/approve`

Protected internal/admin endpoint for approval.

Behavior:

- Marks application as `approved`.
- Creates or links a `tenant`.
- Creates a `partner_invite`.
- Sends or exposes invite delivery through the configured onboarding channel.

Authorization:

- Internal operator/admin only.

Audit:

- `partner_application.approved`
- `partner_invite.created`

### `POST /api/invites/accept`

Accepts an invite token and activates a partner user.

Request:

```json
{
  "invite_token": "raw-token-from-email",
  "display_name": "Partner Developer",
  "password": "optional-if-password-auth-is-used"
}
```

Response:

```json
{
  "user_id": "usr_123",
  "tenant_id": "tenant_123",
  "status": "active",
  "request_id": "req_456"
}
```

Validation:

- Invite token must exist by hash.
- Invite must be `pending`.
- Invite must not be expired or revoked.
- Email and tenant scope come from the invite, not client input.

Audit:

- `partner_invite.accepted`
- `partner_user.activated`

### `POST /api/auth/login`

Authenticates an approved partner user.

Request:

```json
{
  "email": "developer@partner.example",
  "password": "provided-secret"
}
```

Response:

```json
{
  "user": {
    "user_id": "usr_123",
    "tenant_id": "tenant_123",
    "role": "B2B_DEV"
  },
  "session": {
    "expires_at": "2026-05-03T00:00:00.000Z"
  },
  "request_id": "req_789"
}
```

Security:

- Use secure, httpOnly, sameSite cookie session storage.
- Store only hashed session tokens.
- Throttle failed login attempts.
- Do not expose whether an email exists in public error messages.

Audit:

- `auth.login.succeeded`
- `auth.login.failed`

### `POST /api/auth/logout`

Revokes the active session.

Audit:

- `auth.logout`

### `GET /api/auth/session`

Returns the current authenticated session for the frontend shell.

Response:

```json
{
  "authenticated": true,
  "tenant_id": "tenant_123",
  "role": "B2B_DEV",
  "environment": "sandbox"
}
```

Behavior:

- Console routes must require a valid session.
- Role and tenant scope must come from the server, not from client state.

## Frontend Replacement Plan

Current mock behavior:

- `#/login` uses `data-action="mock-login"` and routes directly to `#/console`.
- `#/request-access` only toggles an in-memory submitted state.

Backend-connected behavior:

- Login form calls `POST /api/auth/login`.
- Request access form calls `POST /api/partner-applications`.
- Console boot calls `GET /api/auth/session`.
- API key issuance, Playground execution, reports, ops logs, and consent views
  all use server-provided session role and tenant scope.

## Out Of Scope For First Backend Pass

- Public B2C self-signup.
- Guardian, institution, or elder-facing login.
- Production API key issuance from partner application submission.
- Payment or billing account setup.

## Open Questions

- Should authentication be built in-house for prototype speed or delegated to an
  auth provider?
- Should partner request access create a local DB record first, or push into a
  CRM/contact workflow?
- Should the first PoC use password login, magic links, or manually issued demo
  sessions?
- Which internal role can approve partner applications?
