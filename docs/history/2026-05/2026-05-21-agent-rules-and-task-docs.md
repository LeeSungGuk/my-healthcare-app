# 2026-05-21 Agent Rules And Task Docs

## Context

Detailed implementation task documents were moved under `docs/tasks` so task
specs live with the rest of the durable project documentation instead of being a
separate root-level task folder.

The project also needed clearer implementation rules for the planned production
architecture:

- Next.js App Router frontend implementation.
- Modular-monolith backend implementation.
- Future MSA extraction without coupling contracts to Next.js-only types.

## Decision

- Treat `docs/tasks` as the source of truth for detailed implementation tasks.
- Use `.agents/rules/` for agent-facing implementation rules.
- Keep human-facing frontend/design structure in `docs/design/README.md`.
- Build backend as a modular monolith first, but keep it MSA-ready.
- Build frontend with Next.js App Router and feature-centered UI boundaries.

## Changes

- Added `.agents/rules/modular-monolith-msa-ready.md`.
- Added `.agents/rules/frontend-architecture.md`.
- Updated `docs/design/README.md` with Next.js frontend architecture guidance.
- Moved detailed task specs under `docs/tasks`.

## Why

This separates durable project knowledge by purpose:

- `docs/tasks`: what to build.
- `docs/design`: frontend, design, and UI structure source of truth.
- `.agents/rules`: how agents should implement future work.
- `docs/history`: why the structure changed.

The split should prevent agents from relying on stale root-level `tasks/` files
and should make future backend/frontend implementation work follow the same
architecture boundaries.

## Remaining

- Update `AGENTS.md` so agents use `docs/tasks` as the task document source of
  truth.
- Update `docs/README.md` folder ownership to include `docs/tasks`.
- Decide whether `.agents/rules` should stay local-only under the current
  `.gitignore` rule or be tracked in git.
- When backend work starts, create or update module boundary, API ownership, DB
  ownership, and audit/event contract docs before implementation.

## Verification

- Confirmed `docs/tasks` contains the detailed task specs and task-list index.
- Confirmed `.agents/rules/frontend-architecture.md` exists locally.
- Confirmed `.agents/rules/modular-monolith-msa-ready.md` exists locally.
- Confirmed `docs/design/README.md` contains the new frontend architecture rules.
