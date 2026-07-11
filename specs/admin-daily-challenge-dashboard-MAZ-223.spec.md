# Spec - Admin Daily Challenge dashboard and iteration controls (MAZ-223)

Date: 2026-07-11
Ticket: `MAZ-223`
Source: Linear `MAZ-223`
Status: Approved by human on 2026-07-11. The executable contract lives in
`specs/admin-daily-challenge-dashboard-MAZ-223.feature`.

## Purpose

Add a Daily Challenge section to the admin dashboard so admins can inspect the current
challenge visually, request a manual backend iteration through the approved `MAZ-224`
contract, and watch a sanitized creation/replacement log while preserving Clean
Architecture and MVVM boundaries.

## In scope / Out of scope

- In scope: admin navigation entry, current Daily Challenge fetch, board preview, metadata,
  iteration button, live/polled operation log, success/failure/loading/unavailable states,
  and read-only unavailable state for gameplay analytics until a backend analytics contract
  exists.
- Out of scope: implementing backend endpoints, storing Gemini secrets in admin, editing arrows
  or prompts, manual JSON changes, gameplay analytics backend, and mobile changes.

## Behavior

The section fetches the public `GET /daily-challenge` response and displays:

- board preview using existing `BoardPreview`;
- date, seed, target difficulty, source, generated/expiry timestamps;
- validation flags: solvable, difficulty matched, fallback used;
- a read-only activity panel showing unavailable state until backend analytics exist.

The section exposes an iteration action. When clicked, admin calls
`POST /admin/daily-challenge/iterations` from the approved MAZ-224 backend contract.
The returned `operationId` is used to poll
`GET /admin/daily-challenge/iterations/:operationId`. Ordered events are rendered as a
live creation/replacement log. While the operation is `RUNNING`, duplicate clicks are
disabled. When an operation reaches `SUCCEEDED`, the current challenge query is refreshed
so the replaced board is shown. When the operation fails or the endpoint is unavailable,
the current challenge preview remains visible and the error is recoverable.

## HTTP contract consumed

- `GET /daily-challenge`: existing MAZ-218 public endpoint.
- `POST /admin/daily-challenge/iterations`: approved MAZ-224 admin command endpoint.
- `GET /admin/daily-challenge/iterations/:operationId`: approved MAZ-224 admin polling endpoint.

No Gemini API key, prompt, provider payload, or provider exception detail is sent from admin.

## Clean Architecture contract

Applicable rules from `docs/reglas_clean_arch.md`:

- [x] Regla de dependencia (dependencies point inward only)
- [x] Independencia del dominio (no React/router/React Query/Tailwind/HTTP in `src/domain`)
- [x] Application solo orquesta (use cases depend on ports only)
- [x] Repositorios/API: interfaz adentro (port), implementación afuera (infrastructure)
- [x] DTOs simples en fronteras (primitives/records, no runtime objects)
- [x] Presentation MVVM (views dumb; framework hook owns React Query)

Layer impact:

- Domain: no change expected.
- Application: daily challenge DTOs, API port, and simple use cases for current challenge,
  starting an iteration, and reading an operation.
- Infrastructure: HTTP adapter and DTO mapper for the consumed backend contracts.
- Presentation: dumb Daily Challenge view using existing `BoardPreview`.
- Framework: route, service composition, React Query hook/view-model, router/nav wiring.

Forbidden moves:

- [ ] `src/domain` importing React, router, React Query, Tailwind, HTTP, storage, or outer layers
- [ ] `src/application` importing infrastructure, framework, presentation, React, router, React Query, or Tailwind
- [ ] Views/components calling HTTP directly or owning backend orchestration
- [ ] Framework code adding business rules beyond query/mutation orchestration
- [ ] Admin code storing or exposing Gemini secrets, prompts, raw provider payloads, or stack traces

Required tests:

- Application: use cases delegate to the API port and return DTOs.
- Infrastructure: HTTP adapter calls the exact endpoints and maps envelopes into application DTOs.
- Presentation: Daily Challenge view renders board, metadata, fallback/source, iteration log,
  unavailable analytics, loading/error states, and disables duplicate iteration.
- Framework/API: route loads current challenge, starts iteration, polls operation, refreshes
  challenge after success, and wires navigation.

## Acceptance criteria

- S1: Given an admin opens Daily Challenge, When current challenge loads, Then board preview,
  date, difficulty, source and validation metadata are displayed.
- S2: Given the source is `gemini` or `fallback`, When metadata is rendered, Then the admin can
  distinguish source and fallback usage.
- S3: Given generated/expiry timestamps exist, When rendered, Then UTC cache/expiry information
  is visible.
- S4: Given backend accepts an iteration, When the admin clicks iterate, Then ordered live log
  events are rendered until terminal status.
- S5: Given iteration succeeds and replaces an existing challenge, When the operation reaches
  success, Then the displayed challenge is refreshed.
- S6: Given an iteration is running, When the admin views the action, Then duplicate iteration
  requests are disabled.
- S7: Given backend analytics are unavailable, When the page renders, Then a clear unavailable
  activity state is shown without blocking preview or iteration.
- S8: Given backend returns an error, When the page loads or iterates, Then a recoverable error
  state is shown and the page does not crash.
- S9: Given the admin Daily Challenge HTTP adapter is used, When current challenge, iteration
  start, and operation polling are requested, Then the approved backend endpoints are called and
  operation ids are URL encoded.
- S10: Given MAZ-223 is implemented, When the admin shell and router render, Then the Daily
  Challenge nav entry is visible and selecting it marks the section active.

## Decisions

- Use React Query in framework hook, not presentation.
  Reason: matches existing admin route pattern and keeps views dumb.
  Alternative discarded: making `DailyChallengeView` fetch directly.
- Use polling operation endpoint from MAZ-224.
  Reason: backend contract approved polling, not streaming.
  Alternative discarded: SSE/WebSocket client in this slice.
- Show analytics unavailable panel.
  Reason: no backend analytics/log endpoint exists today.
  Alternative discarded: inventing client-side fake users played data.

## Risks / Open Questions

- The iteration action depends on backend MAZ-224. Until that endpoint is deployed, the admin
  UI must surface the backend error while keeping the current preview usable.
