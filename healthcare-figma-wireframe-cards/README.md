# SilverCare Figma Wireframe Cards

This is a local, dependency-free card-board project that reorganizes the running SilverCare Partner Console homepage into Figma-style wireframe image cards.

## Preview

You can inspect the full board from this README without running the dev server.

![SilverCare Figma wireframe card board](assets/wireframe-card-board-preview.png)

## Run

```bash
npm run dev
```

Open `http://localhost:4174`.

## Verify

```bash
npm test
```

## Contents

- `assets/silvercare-console-home.png`: source screenshot captured from the running prototype homepage.
- `assets/wireframe-card-board-preview.png`: full-board preview for README viewing without running the server.
- `src/board-data.mjs`: board columns and card metadata.
- `src/app.mjs`: card board renderer and selection/filter interactions.
- `src/styles.css`: Figma-board/card-game visual styling.

## Scope

The board covers only Partner Console screens:

- Console Home
- API Key Manager
- API Docs
- Web API Playground
- PoC Report
- Ops Monitoring
- Review Queue
- Consent Admin
- Route Inventory

Guardian, institution, and elder-facing app screens are intentionally excluded.
