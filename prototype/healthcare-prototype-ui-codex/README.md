# SilverCare Partner Console Prototype

Dependency-free UI prototype generated from the frontend task specs in `tasks/tasks-list`.

## Run

```bash
npm run dev
```

Open `http://localhost:4173`.

## Verify

```bash
npm test
```

The tests cover:

- Partner Console route scope
- Role-based module visibility
- Sensitive display redaction
- API key one-time reveal behavior

## Scope

This prototype intentionally includes only B2B Partner Console surfaces:

- Console Home
- API Key Manager
- API Docs
- Web API Playground
- PoC Report
- Ops Monitoring
- Review Queue
- User and Consent Admin
- Route Inventory

It does not create guardian, institution, or elder-facing app routes.

## Notes

- Auth is represented by a mock session and role switcher.
- Data is synthetic and stored in `src/mock-data.mjs`.
- Shared UI guard logic lives in `src/policies.mjs`.
- No real API, database, tenant, or production environment call is performed.
