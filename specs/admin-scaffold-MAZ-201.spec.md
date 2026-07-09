# Spec — Scaffold the Arrow Maze Admin web repo (Clean Architecture)

Date: 2026-07-02
Ticket: `MAZ-201` (plan id `AD-00`)
Source: `../Vertiente1-AdminDashboard-Tickets.md` (M11 — Admin Dashboard)
Status: Backlog. The `@s` scenarios in `specs/admin-scaffold-MAZ-201.feature` are the
executable contract.

## Purpose

Bootstrap the new `arrow-maze-admin` web repo with a working Vite + React + TypeScript +
Tailwind + React Query + react-router SPA, a Clean Architecture 5-layer skeleton with
ESLint-enforced boundaries, the agent governance mirrored from the workspace, and a real
test-first vertical slice — so `npm run verify` is green and future AD-* tickets have a
solid, boundary-guarded foundation.

## In scope / Out of scope

- In scope: tooling + config, the 5-layer skeleton, boundary lint, one test-first domain
  slice (`PageQuery`), MVVM base, framework wiring (providers/router/env), governance
  (AGENTS, `.agents/*`, docs, specs, AI_USAGE + ai-log + compile script), README, mutation
  config.
- Out of scope: any feature UI (levels/leaderboard/users), auth, and the HTTP client to
  the backend (AD-01+).

## Behavior

`npm run verify` runs lint + typecheck + test (coverage) + build, all green. ESLint fails
on layer-boundary violations (`import/no-restricted-paths`) and on React/UI imports inside
`domain`/`application`. The domain `PageQuery` value object validates page/limit and
derives an offset, covered test-first with 100% mutation.

## Clean Architecture contract

Applicable rules from `docs/reglas_clean_arch.md`:

- [x] Dependency rule (inward only), enforced by ESLint `import/no-restricted-paths`.
- [x] Domain independence (no React/router/query/Tailwind/HTTP in `src/domain`).
- [x] Application depends on ports, not infrastructure/framework.
- [x] Presentation is MVVM (dumb views + `ObservableViewModel`), no business rules.
- [x] Composition root lives in `src/framework`.
- [x] Domain errors carry no HTTP semantics.

Layer impact:

- Domain: `PageQuery` value object + `DomainError`/`InvalidPageQueryError`.
- Application: `Clock` port.
- Infrastructure: `SystemClock` adapter.
- Presentation: `ObservableViewModel`, `useViewModelState`, dumb `DashboardScreen`.
- Framework: `env`, `AppProviders` (React Query), `AppRouter`, `main.tsx`, composition.

Forbidden moves (must stay unchecked): domain importing outward layers; application
importing infrastructure/framework; React/UI libs in domain/application; business rules in
views/router.

Required tests: domain `PageQuery` (defaults, offset, cap, invalid page/limit) test-first.

Architecture acceptance criteria: ESLint boundary rules present and effective; `npm run
verify` green; the slice is pure-domain and tested.

## Acceptance criteria (Given/When/Then)

- S1: Given the repo, When `npm run verify` runs, Then lint + typecheck + test + build are
  all green.
- S2: Given the ESLint config, When boundaries are inspected, Then `import/no-restricted-
  paths` enforces the 5-layer dependency rule and forbids React/UI libs in domain/
  application.
- S3: Given the domain `PageQuery`, When created/validated, Then defaults, offset, limit
  cap, and invalid page/limit behave per the tests (covered test-first).
- S4: Given the repo, When governance is inspected, Then `AGENTS.md`, `.agents/*` (incl.
  `judge`), `docs/` (workflow/architecture/tdd/reglas_clean_arch/mutation-testing),
  `specs/_TEMPLATE.spec.md`, `AI_USAGE.md` + `ai-log/` + `scripts/compile-ai-usage.sh`,
  and `README.md` are present.
- S5: Given the mutation config, When `npm run mutation` runs on the slice, Then it is at
  or above the threshold.

## Decisions

- **Full Clean Architecture** (per the human decision for the admin repo), not a light
  arch. Governance mirrored from `arrow-maze-client`; `AGENTS.md`/`docs/architecture.md`
  are the web-authoritative rules.
- **No shared game engine** (M11 decision); the future preview is a web-native renderer.
- Minimal but real slice (`PageQuery`) exercises domain + test and keeps `verify` green.

## Risks / OPEN QUESTIONS

- The `.agents/*` role prompts are mirrored from the client and still mention RN/Expo in
  places; the web rules in `AGENTS.md`/`docs/architecture.md` are authoritative. A later
  ticket may refine the role prompts for web.
