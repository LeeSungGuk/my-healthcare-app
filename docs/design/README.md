# SilverCare Design Structure

This document is the project-level source of truth for design-related folders and
ownership.

## Current Decision

Treat `apps/web` as the real product UI surface.

Treat `apps/wireframe-cards` as a supporting design-review app only. It is useful
for visual inspection, IA comparison, and review boards, but it should not drive
the production frontend folder structure.

## Design Folder Responsibilities

```text
docs/design
├── README.md
├── brand.md
├── design-system.md
├── landing-page.md
└── console-ui.md

apps/web
├── assets
│   └── brand
└── src
    ├── app
    ├── landing
    ├── console
    ├── features
    ├── entities
    ├── shared
    │   ├── design
    │   └── ui
    ├── server
    │   ├── actions
    │   ├── services
    │   └── repositories
    └── fixtures
```

## Rules

- `docs/design` stores design decisions, design system notes, brand direction,
  landing page rationale, and console UI principles.
- `apps/web/assets/brand` stores actual brand image assets such as logos.
- `apps/web/src/shared/design` should own design tokens and global style
  foundations such as color, typography, spacing, radius, shadows, and motion.
- `apps/web/src/shared/ui` should own reusable UI components with no direct
  product-domain responsibility.
- `apps/web/src/landing`, `apps/web/src/console`, and `apps/web/src/features/*`
  should own screen-specific or feature-specific styles and rendering.
- `apps/wireframe-cards` is a design review artifact app. Keep it separate from
  production UI architecture decisions.

## Frontend Structure Principle

Use product and domain names for the product frontend.

Frontend/backend implementation boundaries are defined in
[`frontend-backend-boundaries.md`](frontend-backend-boundaries.md). Follow those
rules so the initial TypeScript backend can be replaced by a Python backend later
without rewriting the frontend.

- `apps/` separates product surfaces or deployable apps.
- `app/` owns Next.js App Router route files, layouts, route groups, and Route
  Handlers. It should compose feature modules rather than own business logic.
- `features/` separates user-facing work units such as API keys, playground,
  PoC reports, review queue, and consent admin.
- `entities/` stores shared business concepts such as tenant, role, elder,
  consent, and API key.
- `shared/` stores reusable non-domain UI and utilities.
- `server/` stores server-only actions, domain services, repositories, and
  provider adapters when the production Next.js implementation begins.

## Next.js Frontend Architecture Rules

- Prefer Server Components by default. Use Client Components only for local UI
  state, event handlers, browser APIs, copy buttons, tabs, filters, dialogs, or
  optimistic UI.
- Keep `page.tsx`, `layout.tsx`, Route Handlers, and Server Actions thin. Route
  files compose features, enforce route-level access, and delegate business
  rules to domain services.
- Use route groups such as `(public)` and `(console)` to separate public landing,
  auth/request-access, and protected Partner Console surfaces without changing
  URLs.
- `src/shared/ui` components must be reusable and domain-free.
- `src/features/*` owns feature-specific UI, state adapters, and screen
  composition.
- `src/entities/*` owns reusable domain concepts shared by multiple features.
- UI and Client Components must not import Prisma, DB clients, LLM provider
  adapters, API secrets, API key verification logic, or tenant authorization
  logic directly.
- Server Actions are for UI mutations. Route Handlers are for real HTTP
  boundaries such as external API endpoints, webhooks, integration callbacks,
  health checks, and non-UI JSON responses.
- Keep mock/demo fixtures clearly separated from production data. Never place
  real PII, raw transcripts, raw API keys, key hashes, or production tenant
  payloads in frontend fixtures.
- Add route guard, role visibility, privacy negative assertions, and Playwright
  smoke coverage when the production Next.js frontend is implemented.

If an admin, guardian, institution, or elder-facing product is added later, decide
whether it belongs inside `apps/web` or as a new app based on auth boundary,
deployment boundary, and product audience.

Shared agent guardrails live in [`../../AGENTS.md`](../../AGENTS.md). Local
`.agents/` rule files may mirror those guardrails, but they are local tool
configuration and are ignored by Git.
