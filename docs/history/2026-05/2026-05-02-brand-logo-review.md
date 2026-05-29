# 2026-05-02 Brand Logo Review

## Context

A new logo image was added under `apps/web/assets/brand/silvercare-main-logo.png`.

The current landing page still uses the text-based `SC` brand mark. The new image
was reviewed as a candidate before applying it to the UI.

## Observations

- The house shape fits eldercare, home care, and remote monitoring.
- The signal arcs fit AI, sensor, and status monitoring concepts.
- The check mark fits the landing page's validation and proof message.
- The green palette is close to the current SilverCare visual system.

## Concerns

- The PNG does not have an alpha channel, so it has a fixed light background.
- At 40px, the house, signal arcs, leaf, and check mark become too dense.
- The mark feels closer to a consumer smart-home or caregiver app icon than a B2B
  Partner Console identity.

## Recommendation

Do not use the current image directly as the top navigation logo.

Use it as a direction reference, then produce a simplified transparent version:

- Transparent PNG or SVG.
- Fewer details at small sizes.
- Keep the house plus validation/check concept.
- Reduce or remove the leaf if it competes at small sizes.
- Match the current deep green and mint palette.

## Remaining

- Generate 2-3 simplified brand mark variants.
- Test each variant in the actual landing header at desktop and mobile sizes.
- Keep the selected direction in a future design system document.
