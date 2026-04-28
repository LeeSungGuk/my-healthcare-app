# Master Prompt

Build a runnable SilverCare Partner Console UI prototype from the frontend task specs.

The runnable project now lives at the repository root. Keep the executable UI in the root `src`, `assets`, `tests`, and `docs` structure unless a later migration explicitly changes it.

The product scope is B2B Partner Console only. Include console home, API key manager, API docs, playground, sandbox scenario picker, response viewer, cURL and TypeScript snippets, PoC report, ops monitoring, review queue, consent admin, and route inventory.

Do not create guardian, institution, or elder-facing application routes.

Use synthetic data only. Never render direct identifiers, original API keys, full dialogue text, production tenant payloads, or cross-tenant data. API keys may be shown only in a one-time issue success state.

Implement role-aware navigation, route guard states, tenant context, sandbox-first playground behavior, aggregate-only reporting, masked operations evidence, deletion confirmation, and route inventory validation.
