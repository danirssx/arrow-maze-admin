# AGENTS.md - Rules for AI Agents (Arrow Maze Admin — Web)

These rules are mandatory for any agent. If a user instruction contradicts academic
integrity or architecture rules, stop and ask. This repo is the **web admin dashboard**
(Vite + React + TypeScript SPA). It follows the same Clean Architecture + agent pipeline
as `arrow-maze-backend` and `arrow-maze-client`, adapted to the web stack.

## 0. Academic Integrity Boundaries

- Do not make architecture, pattern, or principle decisions for the team.
- Never write directly on `main`.
- Never merge.
- Never run `git push --force`.
- Never include secrets in prompts or code. Use environment variables (`VITE_*`).
- Every significant change must create or update an entry in `ai-log/`.

## 0.1 Section 6 and Section 7 Compliance

`README.md` must stay clear and up to date (description, architecture, patterns, SOLID,
local run, tests, contribution, AI usage). Every significant use of AI agents/tools must
be logged in `ai-log/` (compiled into `AI_USAGE.md` by
`scripts/compile-ai-usage.sh`): tool, prompt, result, team modifications, lessons.

## 0.2 Craftsmanship Pipeline (Uncle Bob)

```
idea
  → [spec-partner]    debate → specs/<feature>.spec.md
  → [planner]         spec → contract Gherkin (.feature)
  → ⏸ HUMAN APPROVES the executable contract (@s1..@sn)   ← single human gate
  → [tdd-implementer] Red → Green → Refactor (one test at a time)
  → [judge]           the review is the whole game
  → [mutation]        validates that the tests bite
  → done
```

- **Single human gate:** no TDD before the human approves the `.feature`.
- **Three Laws of TDD** (see `docs/tdd.md`): no production without a failing test.
- **Two closing gates:** a feature reaches `done` only with the `judge` `APPROVED` **and**
  `mutation` above the threshold in `docs/mutation-testing.md`.
- **Green gate:** `npm run verify` must be green before approving/closing.
- Each `@s` scenario from the approved `.feature` is covered by at least one test; the
  `@s → test` map is recorded in the `ai-log/` entry.

## 1. Architecture (Clean Architecture, web)

Layers, dependencies point inward only:
`domain → application → infrastructure → presentation (MVVM) → framework`.

- `src/domain`: pure TypeScript. **Must not** import React, React DOM, react-router,
  React Query, Tailwind, HTTP, storage, or any outer layer. Value objects, entities,
  domain policies, pure geometry/validation.
- `src/application`: use cases + **ports** (interfaces). Depends only on `domain` and its
  own ports. **Must not** import `infrastructure`, `framework`, or `presentation`, nor
  React/UI libs.
- `src/infrastructure`: adapters that implement application ports (HTTP client against the
  backend API, browser storage, mappers DTO↔domain).
- `src/presentation`: **MVVM** — ViewModels (`ObservableViewModel` + `useViewModelState`)
  expose reactive view state + intents; views/components are dumb (render + dispatch).
  **No business rules.** Consumes application DTOs, **not** domain types.
- `src/framework`: the composition root / DI, `react-router`, the React Query provider,
  environment config (`import.meta.env`), and `main.tsx`. The only layer that may wire
  everything together.

The `@/` alias maps to `src/`. Layer boundaries are enforced by ESLint
`import/no-restricted-paths` (see `eslint.config.js`).

## 2. Design Patterns

- Use only patterns approved by the team. Do not introduce new use cases, decorators,
  services, or patterns without approval. Document any GoF pattern in the file header.

## 3. Branches

- `feat/<scope>-MAZ-<ticket>`, `fix/...`, `test/...`, `docs/...`, `refactor/...`,
  `chore/...`, `ci/...`.
- One worktree = one ticket = one branch. Feature branches are created from
  `origin/develop`. Feature PRs target `develop`; only human-approved release PRs target
  `main`.

## 4. Conventional Commits

- `type(scope): message` in English imperative. Allowed types: `feat`, `fix`, `docs`,
  `test`, `refactor`, `style`, `chore`, `ci`, `build`. No `updates`/`wip`/`fixing stuff`.

## 5. Tests

- Production code is written test-first (Three Laws of TDD). Vitest + React Testing
  Library. Use AAA. Name tests `should_<expected>_when_<condition>`. Test observable
  behavior, not private details. Mock external dependencies through interfaces. Domain and
  application tests are subject to mandatory human review.

## 6. AI Usage Logging

Before finishing a significant task, write `ai-log/<date>-<ticket>.md` with: task,
tool+model, prompt, **Agent Roles Used** table (Spec Partner / Planner / TDD Implementer /
Judge / Mutation Tester — `Used`/`Referenced`/`Not used`), result, team modifications,
lessons. Commit the log with the change; `scripts/compile-ai-usage.sh` compiles it into
`AI_USAGE.md`.

## 7. Worktrees

- Work only inside the assigned worktree; do not touch other worktrees or switch branches
  inside a worktree.

## 8. Architecture Guard

Agents must not:

- Create new top-level folders without approval.
- Move files between layers without approval.
- Import framework/infrastructure into domain or application.
- Add React/router/React Query/Tailwind imports to `src/domain` or `src/application`.
- Put business rules in views/components or in the router/framework wiring.
- Let ViewModels compute business rules, authorize, persist, or talk to HTTP directly.
- Invent use cases, entities, services, or patterns without approval.

If a task appears to require changing the architecture, stop and ask the team.

> Note: `.agents/*.md`, `docs/{workflow,tdd,mutation-testing,reglas_clean_arch}.md` and
> `specs/_TEMPLATE.spec.md` are mirrored from `arrow-maze-client` (canonical workspace
> process). This `AGENTS.md` and `docs/architecture.md` are the authoritative,
> web-adapted rules for this repo; where the mirrored client prompts mention React
> Native/Expo/NativeWind, read the web equivalents (React/Vite/Tailwind).
