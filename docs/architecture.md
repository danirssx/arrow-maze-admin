# Architecture — Arrow Maze Admin (Web)

A Vite + React + TypeScript SPA following Clean Architecture. It consumes the existing
Arrow Maze backend REST API (levels CRUD, leaderboard, users). No shared game engine is
pulled in (decided for M11); the level preview is a small web-native SVG renderer.

## Layers (dependencies point inward only)

```
framework → presentation → application → domain
             (infrastructure implements application ports)
```

| Layer | Folder | Responsibility | May import |
| --- | --- | --- | --- |
| Domain | `src/domain` | Pure value objects, entities, policies, geometry/validation. No I/O, no React. | (nothing outward) |
| Application | `src/application` | Use cases + ports (interfaces). Orchestrates domain. | `domain` |
| Infrastructure | `src/infrastructure` | Adapters implementing ports: HTTP client, storage, DTO mappers. | `application`, `domain` |
| Presentation | `src/presentation` | MVVM: `ObservableViewModel` + `useViewModelState`; dumb views/components. Tailwind here only. | `application` (DTOs) |
| Framework | `src/framework` | Composition root/DI, `react-router`, React Query provider, env, `main.tsx`. | all |

- **Alias:** `@/*` → `src/*` (tsconfig + Vite + ESLint resolver).
- **Boundaries enforced** by ESLint `import/no-restricted-paths` (`eslint.config.js`),
  mirroring `arrow-maze-client`: e.g. `presentation` must not import `domain`;
  `application` must not import `infrastructure`/`framework`; `domain` imports nothing
  outward. `domain`/`application` may not import React/router/React Query/Tailwind.

## MVVM

- **ViewModel:** extends `ObservableViewModel<TState>` — holds a presentation state
  snapshot, exposes `getState`/`subscribe` (bound in views via `useViewModelState`). No
  business rules, HTTP, or persistence.
- **View:** a dumb React component that renders view state and dispatches intents.
- **Composition root:** lives in `src/framework` (never in presentation). It builds
  infrastructure adapters, injects them into application use cases, and hands facades/VMs
  to the presentation.

## Data / API

- The backend base URL comes from `VITE_API_BASE_URL` (see `.env.example`), read only in
  `src/framework/config/env.ts`.
- React Query is framework/presentation glue for server-state caching; it never lives in
  `domain`/`application`.

## Testing & gates

- Vitest + React Testing Library; `npm run verify` = lint + typecheck + coverage + build.
- Mutation testing via Stryker (`npm run mutation`), scoped to `src/domain` +
  `src/application` (threshold in `docs/mutation-testing.md`).

## Scaffold status (AD-00 / MAZ-201)

The initial skeleton ships a real vertical example: the pure domain `PageQuery` value
object (with tests + 100% mutation), a `Clock` port + `SystemClock` adapter, the MVVM
base, and the framework wiring (providers + router + env). Feature sections (levels CRUD,
JSON creator + preview, leaderboard, users) arrive in later AD-* tickets.
