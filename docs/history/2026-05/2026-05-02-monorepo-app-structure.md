# 2026-05-02 Monorepo App Structure

## Context

The prototype started as a single web app at the repository root. That was
acceptable while only the landing page and Partner Console existed, but the
project is expected to grow with backend API, admin, and other surfaces.

Keeping everything at the root would make ownership unclear once more apps are
added.

## Decision

Use a monorepo-style `apps/` layout.

## Changes

- Moved the primary landing page and Partner Console into `apps/web`.
- Moved the supporting Figma-style wireframe board into `apps/wireframe-cards`.
- Added `apps/api` as a backend placeholder.
- Added a root `package.json` that delegates scripts to each app.
- Updated README and docs to use the new app paths.
- Moved shared documentation preview assets under `docs/assets`.

## Why

This keeps future surfaces explicit:

- `apps/web`: public landing page and Partner Console UI.
- `apps/api`: future backend service boundary.
- `apps/wireframe-cards`: supporting design artifact app, separate from the
  production-facing web surface.

The structure is still simple enough for the current prototype, but avoids a
large root directory once admin, backend, or additional tools are introduced.

## Verification

- `node --check apps/web/src/app.mjs`
- `node --check apps/web/server.mjs`
- `node --check apps/wireframe-cards/src/app.mjs`
- `node --check apps/wireframe-cards/server.mjs`
- `npm test`
- `npm run check`
- Browser check at `http://localhost:4173/#/`
- Desktop render checked at 1440px.
- Mobile render checked at 390px.
- No browser console errors.
- No horizontal overflow at 390px.

## Remaining

- Implement `apps/api` when backend scope is defined.
- Decide whether future `admin` should live as `apps/admin` or be a route inside
  `apps/web` based on auth boundary and deployment needs.
- Split `apps/web/src/app.mjs` into smaller renderer/state/action modules before
  productization.
