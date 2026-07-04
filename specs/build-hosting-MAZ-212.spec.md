# Spec — AD-11 [Phase 2] Build + hosting of the admin SPA (MAZ-212)

## Problem

The admin is a static Vite SPA but has no production build/hosting configuration: no static-host
config (SPA fallback for client-side routes), no documented production `VITE_API_BASE_URL`, and
no note that the deployed origin must be added to the backend CORS (BE-04). This ticket ships
that configuration + runbook so the human can deploy.

## Scope decision

This is an **ops/config/docs** ticket — no `src/` behaviour. The actual deploy (connecting the
repo / uploading `dist/`, DNS) is a **human action** (academic-integrity boundary: agents don't
deploy). Deliverable: the committed host configuration + docs + a config-integrity test.

## Scope / Clean Architecture contract

| Layer | Impact |
| --- | --- |
| domain / application / infrastructure / presentation / framework | none (no `src/` change) |
| repo config | `netlify.toml`, `vercel.json`, `public/_redirects` (SPA fallback → `dist/`), extended `.env.example`, `docs/deploy.md`, README "Deployment" section |
| tests | `tests/deploy/hostingConfig.test.ts` (config integrity: SPA fallback + build/output dir + env doc) |

**Forbidden moves:** no `src/` production logic; no real deploy performed; no secrets/URLs
committed (prod `VITE_API_BASE_URL` is a host build-env var). `VITE_API_BASE_URL` stays the only
place `import.meta.env` is read (`src/framework/config/env.ts`, AD-01) — unchanged.

**Architectural acceptance (judge gate):** `npm run verify` green (incl. `vite build`); the host
configs encode the SPA rewrite; docs cover prod env + CORS (BE-04). **Mutation gate N/A** (no
domain/application change — precedent MAZ-198/203).

## Acceptance criteria (from the ticket)

- Admin deployed accessible; points to the prod API; CORS ok.
  (Delivered as: production build + committed static-host config with SPA fallback, documented
  prod `VITE_API_BASE_URL`, and the CORS-origin (BE-04) step — the deploy itself is the human step.)
