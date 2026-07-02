# AI Usage — Arrow Maze Admin

Section 7 compliance. Every significant AI-assisted change is logged in `ai-log/` and
compiled into this file by `scripts/compile-ai-usage.sh` (run it after adding an entry).

## Tools Used

- Claude Code / Claude Opus 4.8 (1M context).

<!-- AI_LOG_ENTRIES_START -->


---

# AI Usage Log: MAZ-201 (AD-00) Scaffold the Arrow Maze Admin web repo

## Task / Problem

Bootstrap the **new** `arrow-maze-admin` web repo (Vite + React + TS + Tailwind + React
Query + react-router) with a Clean Architecture 5-layer skeleton, ESLint-enforced layer
boundaries, the agent governance mirrored from the workspace, and a real test-first
domain slice — so `npm run verify` is green. First ticket of the admin repo (M11 — Admin
Dashboard).

## Tool and Model

Claude Code / Claude Opus 4.8 (1M context).

## Prompt Used

The user pre-created the empty `arrow-maze-admin` GitHub repo and asked to implement
`MAZ-201`, doing the full branch process and mirroring the config we implemented in
`arrow-maze-client` / `arrow-maze-backend`, following both `AGENTS.md` files, root
`MEMORY.md`, `Linear_MCP_Guideline.md`, AI usage logging, checks, commit/push/PR, and
Linear updates.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Wrote `specs/admin-scaffold-MAZ-201.spec.md` with the `Clean Architecture contract` + the full-clean-arch + no-shared-engine decisions. | `specs/admin-scaffold-MAZ-201.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Wrote the executable Gherkin `@s1..@s5`. | `specs/admin-scaffold-MAZ-201.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Test-first domain slice: `PageQuery` test → VO; iterated until `npm run verify` green. | `tests/domain/pagination/PageQuery.test.ts`, `src/domain/pagination/PageQuery.ts` |
| Judge (`.agents/judge.md`) | Referenced | Applied the checklist (boundary lint effective, dependency rule inward-only, CA contract, `@s`→test map, verify green). | this log + spec CA contract |
| Mutation Tester (`.agents/mutation.md`) | Used | Configured Stryker (`stryker.conf.json`) + ran it on the slice: 88% → added message/limit=1 tests → **100%**. | `stryker.conf.json`, scoped run |

## Scenario Coverage (@s -> test/evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` verify green | `npm run verify` GREEN (lint + typecheck + test coverage + build) |
| `@s2` boundaries enforced | `eslint.config.js` `import/no-restricted-paths` (8 zones) + `no-restricted-imports` for React/UI in domain/application |
| `@s3` PageQuery slice | `tests/domain/pagination/PageQuery.test.ts` (defaults, offset, cap, limit=1, invalid page/limit + messages) |
| `@s4` governance present | `AGENTS.md`, `.agents/*`, `docs/*`, `specs/_TEMPLATE.spec.md`, `AI_USAGE.md`, `ai-log/`, `scripts/compile-ai-usage.sh` |
| `@s5` mutation configured + passes | `npm run mutation` → **100%** (≥ break 80) |

## Result Obtained

- **Repo bootstrap:** created `develop` from `main`; scaffold on `feat/scaffold-clean-arch-MAZ-201` (worktree `worktrees/am-MAZ-201-admin`); PR → `develop`.
- **Stack/tooling:** Vite 5 + React 18 + TS (strict, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`) + Tailwind + React Query + react-router + Vitest/RTL/jsdom
  + ESLint flat config with the `@/` alias resolver + Stryker (Vitest runner).
- **Clean Architecture 5 layers** with `import/no-restricted-paths` (mirrors the client)
  and a real vertical slice: domain `PageQuery` (+ `DomainError`), application `Clock`
  port, infrastructure `SystemClock`, presentation `ObservableViewModel` +
  `useViewModelState` + dumb `DashboardScreen`, framework `env` + `AppProviders` +
  `AppRouter` + `main.tsx`.
- **Governance mirrored** from `arrow-maze-client`: `.agents/*` (5 roles),
  `docs/{workflow,tdd,mutation-testing,reglas_clean_arch}.md`, `specs/_TEMPLATE.spec.md`,
  `scripts/compile-ai-usage.sh`; plus a web-authoritative `AGENTS.md` + `docs/architecture.md`
  + `README.md` (Section 6) + `AI_USAGE.md` + this `ai-log/`.

## Verification

- `npm install` GREEN.
- `npm run verify` GREEN: lint + typecheck + test:coverage (`PageQuery` 100%) + build.
- `npm run mutation` → **100%** on `src/domain`/`src/application` slice.

## Team Modifications Pending Human Review

- Confirm the stack pins (React 18 vs 19, Vite 5) and the Tailwind/router choices.
- The `.agents/*` role prompts are mirrored from the client and still mention RN/Expo; a
  later ticket may adapt them to web. `AGENTS.md`/`docs/architecture.md` are authoritative.

## Lessons / Limitations

- Vite needs `src/vite-env.d.ts` (`/// <reference types="vite/client" />`) for
  `import.meta.env` to typecheck.
- npm 11 gates package postinstall scripts (`allow-scripts`), but `vite build` (esbuild)
  still succeeded here.
- No feature UI/HTTP yet (AD-01+). The scaffold is the boundary-guarded foundation.


---

# AI Usage Log: MAZ-205 (AD-04) Read-only web board preview

## Task / Problem

A pure React SVG component that renders a level's `LevelDefinition` (arrows + board mask)
read-only, with no game engine — reusable by the JSON creator (AD-05) and level detail.
Geometry is pure and in domain (equivalent to the client's `arrowSvgGeometry`); invalid JSON
must degrade without crashing. Admin repo ticket (M11); depends only on AD-00 (scaffold), so
it branches off AD-00 independently of the auth chain.

## Tool and Model

Claude Code / Claude Opus 4.8 (1M context).

## Prompt Used

Implement `MAZ-205` with the full branch process, following both repo `AGENTS.md`, the admin
repo `AGENTS.md`/`docs/architecture.md`, root `MEMORY.md`, `Linear_MCP_Guideline.md`, AI
usage logging + `compile-ai-usage.sh`, `npm run verify`, commit/push/PR, Linear updates.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | `specs/board-preview-MAZ-205.spec.md`: mirrored the backend data shape (verified against `prisma/seed-data/level-json/*.json`), per-layer CA impact, presentation-never-imports-domain decision. | `specs/board-preview-MAZ-205.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Gherkin `@s1..@s7`. | `specs/board-preview-MAZ-205.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Pure parse + geometry + dumb SVG view, test-first with exact-coordinate assertions. | `tests/**` + `src/**` |
| Judge (`.agents/judge.md`) | Referenced | Checklist: dependency rule inward-only (eslint green), geometry pure, preview never throws, `@s`→test map, verify green, mutation 97.5% (only equivalent survivors). | this log + spec |
| Mutation Tester (`.agents/mutation.md`) | Used | Stryker on domain+application: raised 63%→85%→92%→**97.5%**; remaining 5 are equivalent type-guard mutants. | `npm run mutation` |

## Scenario Coverage (@s -> test/evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` valid definition parsed | `tests/domain/board/parseBoardDefinition.test.ts` |
| `@s2` invalid JSON → null, no throw | `parseBoardDefinition.test.ts` (non-object / bad arrows / bad shape), `tests/application/board/toBoardPreview.test.ts` |
| `@s3` geometry places cells + arrow polylines | `tests/domain/board/boardGeometry.test.ts` (normalize, span, exact coords) |
| `@s4` head points in direction | `boardGeometry.test.ts` (full head triangle per direction) |
| `@s5` colours resolved safely | `tests/domain/board/resolveArrowColor.test.ts` (all 10 palette hexes + default) |
| `@s6` preview renders SVG | `tests/presentation/board/BoardPreview.test.tsx` (rects + polylines + polygons) |
| `@s7` preview degrades on invalid JSON | `BoardPreview.test.tsx` (fallback shown, no board) |

## Result Obtained

- **domain** — `board/BoardDefinition` (types), `board/parseBoardDefinition` (pure defensive
  guard → `BoardDefinition | null`), `board/resolveArrowColor` (named→hex mirroring the
  client palette, slate fallback), `board/boardGeometry` (`buildBoardGeometry` → normalized
  mask rects + arrow polylines of cell centers + head triangles + viewBox; head sizing +
  `directionUnit` mirror the client's `NeonArrow`).
- **application** — `board/toBoardPreview(raw, cellSize)` → `BoardGeometry | null` (parse +
  geometry), re-exports the geometry type so presentation needn't import domain.
- **presentation** — `board/BoardPreview` (dumb SVG; renders geometry or a graceful fallback,
  never throws). Reusable by AD-05.
- `npm run verify` **GREEN** (lint + typecheck + coverage [43 tests / 6 files] + build);
  `npm run mutation` **97.51%** on domain+application (≥ 80 gate).

## Team modifications pending human review

- None beyond the diff. The preview is intentionally self-contained (no shared engine), per
  the ticket's "port ligero" note.

## Lessons / Limitations

- **Design concordance:** the arrow colour hexes and head geometry are ported from the mobile
  client (`BoardView` COLOR_HEX + `NeonArrow` HEAD_LEN/HEAD_HALF + `arrowSvgGeometry`) so the
  admin preview matches the game.
- **Mutation — killing arithmetic/geometry mutants:** min/max bounds were refactored to
  `Math.min`/`Math.max` (removes the `<`/`>` equal-value equivalent mutants and the
  always-assign conditional), and geometry is asserted with exact coordinates at a fixed cell
  size (34) plus a non-zero-origin, out-of-order fixture to pin the `row - minRow` subtraction.
- **Remaining 5 survivors are equivalent mutants:** defensive `isRecord`/`typeof` guards in
  `parseBoardDefinition` whose "failure" is redundantly caught downstream (destructuring a
  primitive yields `undefined`, rejected by `Number.isInteger`/`typeof`; `DIRECTIONS.includes`
  never matches a non-string). Removing them would drop real defensiveness, so they are kept.
- Branched off AD-00 (not the auth chain) since AD-04 depends only on the scaffold.


<!-- AI_LOG_ENTRIES_END -->
