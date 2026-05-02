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

- `apps/` separates product surfaces or deployable apps.
- `features/` separates user-facing work units such as API keys, playground,
  PoC reports, review queue, and consent admin.
- `entities/` stores shared business concepts such as tenant, role, elder,
  consent, and API key.
- `shared/` stores reusable non-domain UI and utilities.

If an admin, guardian, institution, or elder-facing product is added later, decide
whether it belongs inside `apps/web` or as a new app based on auth boundary,
deployment boundary, and product audience.
