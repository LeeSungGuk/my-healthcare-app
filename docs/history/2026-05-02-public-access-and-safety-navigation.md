# 2026-05-02 Public Access And Safety Navigation

## Context

The landing page originally sent qualified visitors directly into the Partner
Console prototype. That was useful for a fast demo, but it did not match the
product direction.

SilverCare is a B2B2C API/SaaS product for approved partners. Console access
should feel invite-based, not like open B2C self-signup.

The landing navigation also used broad labels such as `진행 흐름` and `검증 근거`.
Those labels were directionally correct, but did not clearly explain which
console surfaces users would open.

## Decision

Add public access screens before the protected console:

- `#/login`: partner login entry.
- `#/request-access`: partner application entry.

Update landing navigation so each top-level item maps to a distinct destination:

- `API 흐름` -> `#/console/playground`
- `검증 결과` -> `#/console/route-inventory`
- `안전성` -> `#/console/safety`

Keep `login` and `request-access` outside the protected Partner Console route
inventory.

## Changes

- Added `publicRoutes` for landing, login, and request access routes.
- Added a partner login page with a mock login action that routes to
  `#/console`.
- Added a partner request access page with a mock submitted state.
- Changed landing CTA copy from direct console entry to login/request access
  actions.
- Added a placeholder `Privacy & Safety` console route for the future Safety
  Overview page.
- Updated route tests so public access routes stay outside `allowedRoutes`.
- Updated B2B developer module visibility expectations to include the safety
  placeholder route.

## Why

This keeps the prototype aligned with the product strategy:

- B2B partners should request or receive access before using the console.
- API key issuance and Playground use should not appear openly available to
  anonymous visitors.
- Safety evidence should have a future dedicated destination instead of staying
  only as a landing section.
- Route inventory remains a scope guard for Partner Console routes only.

## Verification

- `node --check apps/web/src/app.mjs`
- `node --check apps/web/src/policies.mjs`
- `npm test`
- Browser check at `http://localhost:4173/#/login`
- Browser check at `http://localhost:4173/#/request-access`
- Mock login routes to `#/console`.
- Request access form shows a submitted state.
- Browser check at `http://localhost:4173/#/console/safety`
- Desktop and mobile screenshots reviewed.
- No browser console errors.
- No horizontal overflow on mobile.

## Remaining

- Replace mock login with real authentication when backend scope is defined.
- Decide whether partner request access should become a real backend workflow or
  a CRM/contact integration.
- Expand `#/console/safety` from a placeholder into a full Safety Overview page
  using the SRS privacy, consent, masking, RBAC, review, and route guard
  requirements.
