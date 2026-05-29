# Database Documentation

Database documents live here when a feature needs persistence, tenant ownership,
auditability, consent, deletion, retention, or reporting data.

## Required Content

Each DB document should include:

- Purpose and owning feature
- Tables or collections
- Required fields
- Relationships
- Indexes and uniqueness
- Data lifecycle and retention
- Privacy constraints
- Audit log requirements
- Open questions before migration

## Current Documents

- [`partner-access-schema.md`](partner-access-schema.md): DB model plan for
  partner applications, invites, login sessions, tenant users, and audit logs.
