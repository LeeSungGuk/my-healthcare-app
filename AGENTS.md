# Codex Project Notes

This project registers gstack through `.agents/skills/gstack`, which points to each
developer's local gstack installation.

## Skill Routing

When the user's request matches an available gstack skill, prefer that skill's
workflow before ad-hoc implementation.

Key routing rules:
- Product ideas, "is this worth building", brainstorming -> use office-hours
- Bugs, errors, "why is this broken", 500 errors -> use investigate
- Ship, deploy, push, create PR -> use ship
- QA, test the site, find bugs -> use qa
- Code review, check my diff -> use review
- Update docs after shipping -> use document-release
- Weekly retro -> use retro
- Design system, brand -> use design-consultation
- Visual audit, design polish -> use design-review
- Architecture review -> use plan-eng-review
- Save progress, checkpoint, resume -> use checkpoint
- Code quality, health check -> use health

## SilverCare Core Guardrails

`.agents/` is local tool configuration and is ignored by Git. The tracked
guardrails below are the portable source of truth for future agents and
collaborators.

- Preserve the current dependency-free `apps/web` prototype unless the user
  explicitly asks to change app behavior.
- Keep frontend/backend boundaries contract-first: frontend code may call HTTP
  API clients, but must not import backend services, repositories, DB clients,
  provider adapters, API secrets, session verification, or API-key verification
  logic.
- Product frontend direction: TypeScript + Next.js App Router.
- Initial backend direction: TypeScript/Node.js modular monolith with
  language-independent HTTP/API contracts so a future Python backend migration
  remains possible.
- Backend-owned concerns: tenant authorization, session verification, API key
  generation/verification, audit persistence, data retention/deletion,
  provider adapters, and DB access.
- Never add real PII, raw transcripts, raw API keys, key hashes, secrets,
  credentials, `.env` contents, production tenant payloads, or sensitive raw
  provider prompts/responses to docs, fixtures, logs, or tests.
- Tests should use synthetic fixtures, fakes, mocks, and contract fixtures by
  default. Do not call real DB/auth providers, external LLM/provider APIs,
  email/CRM/payment services, or schedulers in default tests.
- Current test roots are `apps/web/tests/*.test.mjs` and
  `apps/wireframe-cards/tests/*.test.mjs`; future backend packages own their
  own package-level tests.
