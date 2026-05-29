# Partner Access Database Schema

## Context

The current UI includes:

- `#/login`: partner login mock.
- `#/request-access`: partner access request mock.

These screens are frontend-only today. Before connecting them to a backend, the
database contract must be defined so authentication, tenant ownership, invite
flow, and audit requirements do not drift.

## Tables

### `partner_application`

Stores a public partner request before an account or tenant exists.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `application_id` | string | Yes | Primary key. |
| `company_name` | string | Yes | Submitted partner company name. |
| `contact_email` | string | Yes | Work email. Normalize lowercase. |
| `use_case` | string | Yes | Example: `senior_chat_api_poc`. |
| `review_note` | text | No | Submitted memo. Do not store sensitive elder data. |
| `status` | enum | Yes | `submitted`, `reviewing`, `approved`, `rejected`. |
| `created_at` | datetime | Yes | Submission time. |
| `reviewed_at` | datetime | No | Internal review time. |
| `reviewed_by_user_id` | string | No | Internal reviewer reference. |

Constraints:

- Rate limit submissions by email and IP at the backend layer.
- Do not create API keys from this table directly.
- Approval should create or link a `tenant` before invite issuance.

### `tenant`

Represents an approved B2B partner boundary.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `tenant_id` | string | Yes | Primary key. |
| `name` | string | Yes | Partner company or PoC tenant name. |
| `environment` | enum | Yes | `sandbox`, `poc`, `production`. |
| `status` | enum | Yes | `active`, `suspended`, `closed`. |
| `created_at` | datetime | Yes | Tenant creation time. |

### `partner_user`

Represents a user who can log in to the Partner Console.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `user_id` | string | Yes | Primary key. |
| `tenant_id` | string | Yes | FK to `tenant`. |
| `email` | string | Yes | Unique per tenant. |
| `display_name` | string | No | Console display name. |
| `role` | enum | Yes | Maps to console roles such as `B2B_DEV`, `B2B_PM`. |
| `status` | enum | Yes | `invited`, `active`, `disabled`. |
| `created_at` | datetime | Yes | User creation time. |
| `last_login_at` | datetime | No | Last successful login. |

Constraints:

- Unique index: `(tenant_id, email)`.
- A user must never access data outside its `tenant_id`.
- Role changes must create audit events.

### `partner_invite`

Tracks invite-based onboarding after application approval.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `invite_id` | string | Yes | Primary key. |
| `tenant_id` | string | Yes | FK to `tenant`. |
| `email` | string | Yes | Invited work email. |
| `role` | enum | Yes | Initial role. |
| `token_hash` | string | Yes | Store hash only, never raw invite token. |
| `status` | enum | Yes | `pending`, `accepted`, `expired`, `revoked`. |
| `expires_at` | datetime | Yes | Expiration time. |
| `created_by_user_id` | string | No | Internal operator or tenant admin. |
| `accepted_at` | datetime | No | Acceptance time. |
| `created_at` | datetime | Yes | Invite creation time. |

Constraints:

- Raw invite token is shown or emailed once.
- Expired or revoked invites cannot create sessions.

### `auth_session`

Tracks active login sessions.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `session_id` | string | Yes | Primary key. |
| `user_id` | string | Yes | FK to `partner_user`. |
| `tenant_id` | string | Yes | Denormalized tenant scope for guard checks. |
| `session_hash` | string | Yes | Store hashed session token only. |
| `created_at` | datetime | Yes | Session creation time. |
| `expires_at` | datetime | Yes | Session expiration. |
| `revoked_at` | datetime | No | Logout or admin revocation. |

Constraints:

- Store session token hash only.
- Console requests must resolve session, user status, role, and tenant scope.

### `audit_log`

Records sensitive access and administrative actions.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `audit_log_id` | string | Yes | Primary key. |
| `tenant_id` | string | No | Null allowed for pre-tenant application review. |
| `actor_user_id` | string | No | Null for anonymous application submission. |
| `actor_role` | string | No | Role at action time. |
| `action` | string | Yes | Example: `partner_application.submitted`. |
| `resource_type` | string | Yes | Example: `partner_application`, `partner_invite`. |
| `resource_id` | string | Yes | Target record ID. |
| `request_id` | string | Yes | Backend-generated request ID. |
| `created_at` | datetime | Yes | Event time. |

## Initial Action Mapping

| UI Action | DB Write | Audit Event |
|---|---|---|
| Submit partner request | `partner_application` | `partner_application.submitted` |
| Approve partner request | `tenant`, `partner_invite` | `partner_application.approved`, `partner_invite.created` |
| Accept invite | `partner_user`, optional `auth_session` | `partner_invite.accepted`, `partner_user.activated` |
| Login | `auth_session` | `auth.login.succeeded` |
| Logout | update `auth_session.revoked_at` | `auth.logout` |

## Open Questions

- Should login be password-based, magic-link based, or delegated to an auth
  provider?
- Who reviews partner applications in the first PoC: internal operator,
  repository admin, or external CRM?
- Should `partner_application` live in the product DB or a separate CRM first?
- What is the first production-grade session storage strategy?
