# 2026-05-02 Landing Trust Proof

## Context

The landing page communicated that SilverCare is a safe Partner Console for
eldercare AI workflow validation, but the proof area used broad capability labels
such as sandbox, role guard, and consent management.

That was directionally correct, but weak for a healthcare AI product. Users need
to see evidence before they trust safety claims.

## Decision

Replace the generic proof labels with concrete, verifiable proof cards.

## Changes

- Replaced the five-label proof strip with a proof panel.
- Added policy test status: `6/6 통과`.
- Added default PII exposure proof: `0`.
- Added Partner Console route scope proof: `9/9`.
- Added one-time raw API key display proof: `1회`.
- Simplified the mobile first viewport so the primary action is clearer.
- Hid secondary mobile navigation links below 520px.
- Hid the secondary hero CTA and hero trust chips on mobile.

## Why

For this product, trust is the conversion mechanism. The landing page should not
only say that the console is safe. It should show what has been checked.

The proof cards map directly to existing prototype policies and tests:

- Route scope stays inside Partner Console routes.
- Role access controls module visibility.
- Sensitive text and raw API keys are redacted from default display surfaces.
- Raw sandbox API keys are only revealed in the one-time issue result.

## Verification

- `node --check apps/web/src/app.mjs`
- `npm test`
- Browser check at `http://localhost:4173/#/`
- Desktop render checked at 1440px.
- Mobile render checked at 390px and 320px.
- No browser console errors.
- No horizontal overflow at 390px or 320px after the mobile density adjustment.

## Commit

`0c46bd7 feat: strengthen landing page trust proof`

## Remaining

- Decide whether the Partner Console UI should be Korean, English, or explicitly bilingual.
- Decide whether the new logo asset should be adapted into a transparent, simplified brand mark.
- Continue reducing card repetition so the page feels less like a generic SaaS template.
