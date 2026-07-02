# Arrow Maze Admin (Web)

Web admin dashboard for **Arrow Maze** — a Vite + React + TypeScript SPA that consumes the
Arrow Maze backend REST API to manage levels (CRUD + JSON creator), and view the
leaderboard and platform users (read-only). Built with **Clean Architecture** and the same
agent pipeline as `arrow-maze-backend` / `arrow-maze-client`.

## Stack

- **Vite** + **React 18** + **TypeScript** (SPA)
- **react-router-dom** (routing), **@tanstack/react-query** (server state)
- **Tailwind CSS** (styling)
- **Vitest** + **React Testing Library** (tests), **Stryker** (mutation)
- **ESLint** with `import/no-restricted-paths` (Clean Architecture boundaries)

## Architecture

Clean Architecture, dependencies point inward only:
`domain → application → infrastructure → presentation (MVVM) → framework`. See
[`docs/architecture.md`](docs/architecture.md) and [`AGENTS.md`](AGENTS.md). Layer
boundaries are enforced by ESLint (`eslint.config.js`). The `@/` alias maps to `src/`.

```
src/
├── domain/          # pure TS: value objects, policies (e.g. PageQuery)
├── application/     # use cases + ports (e.g. Clock)
├── infrastructure/  # adapters implementing ports (e.g. SystemClock, HTTP)
├── presentation/    # MVVM: ObservableViewModel + useViewModelState + dumb views
└── framework/       # composition root, router, React Query provider, env, main.tsx
```

## Local run

```bash
cp .env.example .env         # set VITE_API_BASE_URL (default http://localhost:3000)
npm install
npm run dev                  # start the dev server
```

## Checks

```bash
npm run verify               # lint + typecheck + test (coverage) + build
npm run test                 # unit tests
npm run mutation             # Stryker mutation (domain + application)
```

`npm run verify` must be green before opening/approving a PR.

## Contribution & AI usage

- Branch `feat/<scope>-MAZ-<ticket>` off `origin/develop`; PRs target `develop`.
- Follow the pipeline in [`AGENTS.md`](AGENTS.md): spec → `.feature` → **human approves** →
  TDD → judge → mutation.
- Every significant AI-assisted change is logged in [`ai-log/`](ai-log/) and compiled into
  [`AI_USAGE.md`](AI_USAGE.md) via `scripts/compile-ai-usage.sh`.

## Environment

| Var | Purpose | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Arrow Maze backend base URL | `http://localhost:3000` |
