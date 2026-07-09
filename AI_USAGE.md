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

# AI Usage Log: MAZ-202 (AD-01) Admin authentication (login + admin gate + session)

## Task / Problem

Add the auth vertical to `arrow-maze-admin`: an admin-only login that talks to the
existing backend `/auth/*` endpoints, gates the dashboard behind an `ADMIN` role, persists
the session, refreshes the access token on a 401 (retry once), and logs out. Design must
follow the client's design system (shared palette) and use the **Outfit** font for visual
concordance between client and admin. Second ticket of the admin repo (M11), stacked on
AD-00 (MAZ-201).

## Tool and Model

Claude Code / Claude Opus 4.8 (1M context).

## Prompt Used

Implement `MAZ-202` doing the full branch process and mirroring the config from
`arrow-maze-client` / `arrow-maze-backend`, following both `AGENTS.md` files, root
`MEMORY.md`, `Linear_MCP_Guideline.md`, AI usage logging, `npm run verify`, commit/push/PR,
and Linear updates. Additionally: reuse the client `design/README.md` palette for
concordance and use the **Outfit** font.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Wrote `specs/admin-auth-MAZ-202.spec.md` with the Clean Architecture contract + the boundary decision `LoginUseCase` returns `{session, isAdmin}` so presentation never imports domain. | `specs/admin-auth-MAZ-202.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Wrote executable Gherkin `@s1..@s5` (admin login, non-admin gate, refresh-retry, logout, protected routes). | `specs/admin-auth-MAZ-202.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Test-first auth vertical across all 5 layers; iterated until `npm run verify` green. | `tests/**/*.test.{ts,tsx}` + `src/**` |
| Judge (`.agents/judge.md`) | Referenced | Applied the checklist: boundary lint effective (presentation ⇏ domain), dependency rule inward-only, CA contract honoured, `@s`→test map, verify green. | this log + spec CA contract |
| Mutation Tester (`.agents/mutation.md`) | Used | Ran Stryker on domain+application; killed 3 try/catch-swallowed null-guard survivors by reading the refresh token outside the try → **100%**. | `LogoutUseCase.ts`, `RefreshSessionUseCase.ts` |

## Scenario Coverage (@s -> test/evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` valid admin signs in | `tests/presentation/auth/LoginViewModel.test.ts`, `tests/presentation/auth/LoginScreen.test.tsx`, `tests/application/auth/use-cases/LoginUseCase.test.ts` |
| `@s2` non-admin rejected (not persisted) | `LoginViewModel.test.ts` (non-admin → error, no `onAuthenticated`), `LoginUseCase.test.ts` (`isAdmin=false`), `RequireAdmin.test.tsx` |
| `@s3` expired token refreshed + retried once | `tests/infrastructure/http/FetchHttpClient.test.ts` (401 → refresh → retry with new Bearer; anonymous 401 no-loop), `RefreshSessionUseCase.test.ts` |
| `@s4` logout clears the session | `tests/application/auth/use-cases/LogoutUseCase.test.ts` (clears even when server revoke fails; no server call without a session) |
| `@s5` protected routes require admin session | `tests/framework/router/RequireAdmin.test.tsx` (admin renders; null/non-admin redirect to `/login`) |

## Result Obtained

- **Auth vertical (Clean Architecture):**
  - domain: `UserRole`, `AdminAccessPolicy.isAdminRole` (pure).
  - application: `AuthSession`, ports `IHttpClient` / `IAuthApi` / `ISessionStorage`, use
    cases `LoginUseCase` (→ `{session, isAdmin}`), `RefreshSessionUseCase`, `LogoutUseCase`.
  - infrastructure: `FetchHttpClient` (native fetch, Bearer interceptor, 401
    refresh-and-retry-once guard mirroring the client's Axios adapter), `HttpError`,
    `HttpAuthApi` + envelope DTOs (backend wraps `{ status, data }`), `LocalSessionStorage`.
  - presentation (MVVM): `LoginViewModel` + `LoginUiState` + dumb `LoginScreen`.
  - framework: `SessionContext` / `SessionProvider` (bootstrap from storage, `signIn`
    persists, `signOut` = `LogoutUseCase`, `onUnauthorized` clears storage+state), auth
    `composition/authContainer` (breaks the client↔refresh cycle via a lazy holder),
    `RequireAdmin` guard, and login/protected routes in `AppRouter`.
- **Design system:** `tailwind.config.js` now carries the client palette tokens
  (primary/background/text/border/reward) + `fontFamily.sans = Outfit`; `@fontsource/outfit`
  weights imported in `main.tsx`; `index.css` base body uses `bg-background font-sans`.
  `vite build` bundles the Outfit woff2 assets.
- **Boundary decision:** presentation never imports domain — `LoginUseCase` computes the
  admin decision (via `AdminAccessPolicy`) and returns `{session, isAdmin}`; only admin
  sessions are persisted (framework `signIn`).

## Verification

- `npm run verify` → **GREEN** (lint + typecheck + `test:coverage` [39 tests] + build).
- `npm run mutation` (Stryker, domain+application scope) → **100%** (≥ break 80).

## Notes / Gotchas

- **Tests live in `tests/` (mirror), never colocated in `src/`.** Stryker's `mutate` glob
  is `src/domain|application/**` with no `*.test.ts` exclusion, so a colocated test file is
  itself mutated and tanks the score (seen at 63%). Moving them to `tests/` (matching AD-00)
  restored a true 100%.
- **jsdom has no usable `localStorage`** here (opaque origin) — inject an in-memory
  `Storage` into `LocalSessionStorage` in tests instead of touching `window.localStorage`.
- **Killing try/catch-swallowed null-guard mutants:** read `session.refreshToken` *outside*
  the `try` so a missing session surfaces (keeps the `if (session === null)` guard
  observable) instead of being indistinguishable from a swallowed refresh failure.
- **eslint `prefer-const`** misfires on a forward-declared `let x; ...; x = ...` used in a
  closure — used a `const` holder object (`lazyRefresh.run`) to break the client↔refresh
  construction cycle instead.


---

# AI Usage Log: MAZ-203 (AD-02) Authenticated layout + protected navigation

## Task / Problem

Add the authenticated application shell to `arrow-maze-admin`: a persistent layout with
navigation between the three sections (Levels, Leaderboard, Users), the admin identity +
a header logout, an active-section highlight, and nested protected routing. Third ticket
of the admin repo (M11), stacked on AD-01 (MAZ-202).

## Tool and Model

Claude Code / Claude Opus 4.8 (1M context).

## Prompt Used

Implement `MAZ-203` with the full branch process, following both repo `AGENTS.md` files,
the admin repo `AGENTS.md`/`docs/architecture.md`, root `MEMORY.md`,
`Linear_MCP_Guideline.md`, AI usage logging + `compile-ai-usage.sh`, `npm run verify`,
commit/push/PR, and Linear updates. Keep design concordance with the client (shared palette
+ Outfit).

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Wrote `specs/admin-layout-MAZ-203.spec.md` with the Clean Architecture contract (per-layer impact + forbidden moves) and the mutation-N/A rationale. | `specs/admin-layout-MAZ-203.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Wrote executable Gherkin `@s1..@s6`. | `specs/admin-layout-MAZ-203.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Test-first shell: pure `resolveActiveSection` + `AppShellViewModel` + dumb `AppShell` + framework `AdminLayout`; iterated to `npm run verify` green. | `tests/**` + `src/**` |
| Judge (`.agents/judge.md`) | Referenced | Checklist: dependency rule inward-only (eslint green), AppShell holds no auth/business logic (identity + actions are props), active-section is pure, `@s`→test map, verify green. | this log + spec CA contract |
| Mutation Tester (`.agents/mutation.md`) | Referenced | No domain/application change → gate **N/A**; ran Stryker to confirm the untouched domain/application stays **100%**. | `npm run mutation` 100% |

## Scenario Coverage (@s -> test/evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` brand + identity + 3 sections | `tests/presentation/layout/AppShell.test.tsx`, `tests/framework/layout/AdminLayout.test.tsx` |
| `@s2` selecting a section navigates | `AppShell.test.tsx` (onNavigate `/users`), `AdminLayout.test.tsx` (nav → Leaderboard Outlet) |
| `@s3` active section by longest-path match | `tests/presentation/navigation/resolveActiveSection.test.ts` (exact, nested, prefix-not-segment, longest wins) |
| `@s4` header logout ends the session | `AppShell.test.tsx` (onLogout), `AdminLayout.test.tsx` (`signOut` called) |
| `@s5` unauthenticated → /login | covered by `RequireAdmin` (AD-01) wrapping `AdminLayout` in `AppRouter`; `tests/framework/router/RequireAdmin.test.tsx` |
| `@s6` responsive nav toggle | `tests/presentation/layout/AppShellViewModel.test.ts`, `AppShell.test.tsx` (toggle + close-on-select) |

## Result Obtained

- **presentation** — `navigation/adminSections.ts` (`ADMIN_SECTIONS` data),
  `navigation/resolveActiveSection.ts` (pure longest-path match), `layout/AppShellUiState`
  + `layout/AppShellViewModel` (MVVM; owns only the responsive nav open/closed state),
  `layout/AppShell.tsx` (dumb view: brand, nav, identity + logout, `children`),
  `screens/SectionPlaceholderScreen.tsx`. **Removed** `screens/DashboardScreen.tsx` (dead
  after the shell refactor).
- **framework** — `layout/AdminLayout.tsx` binds session (username + `signOut`) and router
  (`useLocation` → active section, `useNavigate`, `<Outlet/>`) into the AppShell; nested
  protected routes in `router/AppRouter.tsx` (`/` → `RequireAdmin` → `AdminLayout`, children
  `index → /levels`, `/levels`, `/leaderboard`, `/users`). Removed `DashboardRoute`.
- **Design concordance:** shell uses the shared palette tokens + Outfit (from AD-01).
- `npm run verify` **GREEN** (lint + typecheck + coverage [55 tests / 15 files] + build);
  `npm run mutation` **100%** (domain/application untouched — gate N/A this ticket).

## Team modifications pending human review

- None beyond the diff. Placeholder section screens (`SectionPlaceholderScreen`) are
  intentional stand-ins that AD-03 / AD-08 / AD-09 replace at their route element.

## Lessons / Limitations

- A layout ticket legitimately has **no domain/application code**; the mutation gate is
  N/A (precedent MAZ-198). MVVM is still honoured: the responsive nav drawer is real,
  testable view state on `AppShellViewModel`, while route-derived active state is a pure
  function passed as a prop — the view stays dumb.
- Fresh worktrees need their own `npm install` (node_modules is not shared across git
  worktrees).
- Active-section match guards against string-prefix false positives (`/levelsx` must not
  match `/levels`) by requiring an exact match or a `/`-delimited segment boundary.


---

# AI Usage Log: MAZ-204 (AD-03) Admin levels list with status + row actions

## Task / Problem

Turn the `/levels` placeholder into a real table from `GET /admin/levels`: name, difficulty,
status, arrow count, created date; a status filter; and per-row actions — view (inline
detail), publish (DRAFT→PUBLISHED) and archive (PUBLISHED→ARCHIVED) wired to
`POST /levels/:id/publish` and `/archive`. Backend errors (e.g. publishing a non-solvable
level) must be shown clearly. Fourth ticket of the admin repo (M11), stacked on AD-02
(MAZ-203); consumes BE-02 (`GET /admin/levels`, MAZ-196) + MAZ-177 publish/archive.

## Tool and Model

Claude Code / Claude Opus 4.8 (1M context).

## Prompt Used

Implement `MAZ-204` with the full branch process, following both repo `AGENTS.md`, the admin
repo `AGENTS.md`/`docs/architecture.md`, root `MEMORY.md`, `Linear_MCP_Guideline.md`, AI
usage logging + `compile-ai-usage.sh`, `npm run verify`, commit/push/PR, Linear updates,
keeping design concordance with the client.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Wrote `specs/admin-levels-list-MAZ-204.spec.md` with the backend contract (verified against the BE-02 branch + publish/archive) + the per-layer CA impact + the presentation-never-imports-domain flag decision. | `specs/admin-levels-list-MAZ-204.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Wrote executable Gherkin `@s1..@s7`. | `specs/admin-levels-list-MAZ-204.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Built the vertical across 5 layers test-first; iterated to `npm run verify` green. | `tests/**` + `src/**` |
| Judge (`.agents/judge.md`) | Referenced | Checklist: dependency rule inward-only (eslint green), row flags computed in application (presentation dumb), `HttpAdminLevelApi` behind the port, `@s`→test map, verify green, mutation 100%. | this log + spec CA contract |
| Mutation Tester (`.agents/mutation.md`) | Used | Ran Stryker on domain+application: `LevelStatusPolicy`, list/publish/archive use cases, `LevelStatusFilter` → **100%**. | `npm run mutation` 100% |

## Scenario Coverage (@s -> test/evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` lists every status | `tests/presentation/level/LevelsView.test.tsx`, `tests/framework/level/AdminLevelsRoute.test.tsx`, `tests/infrastructure/level/HttpAdminLevelApi.test.ts` |
| `@s2` filter queries backend | `HttpAdminLevelApi.test.ts` (`?status=`), `tests/application/level/LevelStatusFilter.test.ts` (`toStatusQuery`) |
| `@s3` actions follow lifecycle | `tests/domain/level/LevelStatusPolicy.test.ts`, `tests/application/level/use-cases/ListAdminLevelsUseCase.test.ts` (flags), `LevelsView.test.tsx` (publish/archive visibility) |
| `@s4` publish → refresh | `AdminLevelsRoute.test.tsx` (publish POST + status flips to PUBLISHED after refetch), `PublishLevelUseCase.test.ts` |
| `@s5` archive → refresh | `ArchiveLevelUseCase.test.ts`, `HttpAdminLevelApi.test.ts` (archive endpoint) |
| `@s6` backend error shown | `tests/infrastructure/http/HttpError.test.ts` (`fromResponse` lifts `error.message`), `LevelsView.test.tsx` (error state) |
| `@s7` inline detail on view | `LevelsView.test.tsx` (expanded detail row) |

## Result Obtained

- **domain** — `level/LevelStatus`, `level/LevelDifficulty`, `level/LevelStatusPolicy`
  (`canPublish`=DRAFT only, `canArchive`=PUBLISHED only).
- **application** — `level/AdminLevelSummary`, `level/AdminLevelRow` (summary + flags),
  `level/LevelStatusFilter` (`toStatusQuery` + options), `ports/IAdminLevelApi`, use cases
  `ListAdminLevelsUseCase` (maps summaries → rows via policy), `PublishLevelUseCase`,
  `ArchiveLevelUseCase`.
- **infrastructure** — `level/AdminLevelDtos`, `level/HttpAdminLevelApi` (GET `/admin/levels`
  + `?status`, POST publish/archive with `encodeURIComponent`); **enhanced**
  `http/HttpError` (`fromResponse` lifts backend `{error:{code,message}}` → `serverCode` +
  message) and `http/FetchHttpClient` (parses the error body on failure).
- **presentation** — `level/formatCreatedAt` (pure), `level/LevelsView` (dumb: filter +
  table + actions gated by row flags + loading/error/empty + inline detail).
- **framework** — `level/adminLevelServices` (+ `useAdminLevelServices`), `level/useAdminLevels`
  (React Query view-model: query + publish/archive mutations invalidating the list + filter/
  expanded/pending state), `level/AdminLevelsRoute`; exposed `httpClient` on `SessionContext`;
  wired the `/levels` route to `AdminLevelsRoute`.
- `npm run verify` **GREEN** (lint + typecheck + coverage [81 tests / 25 files] + build);
  `npm run mutation` **100%** on domain+application.

## Team modifications pending human review

- `HttpError`/`FetchHttpClient` now surface the backend error message. This touches AD-01
  files (on this stacked branch); the AD-01 tests still pass unchanged. Flagged for review.
- `httpClient` is now exposed on `SessionContext` so feature verticals can build data
  services from the one authenticated (Bearer + 401-refresh) transport.

## Lessons / Limitations

- **Reconciling React Query with the repo's MVVM:** server state (list + publish/archive)
  lives in a React Query hook (`useAdminLevels`, the functional view-model), the screen is a
  thin framework route container, and the table is a dumb presentation view — same
  framework-wires-dumb-view split as AD-02's `AdminLayout`/`AppShell`.
- **Presentation never imports domain:** the row `canPublish`/`canArchive` flags and the
  `LevelStatusFilter` type/options live in application (which may import domain), so the view
  consumes DTO flags only — same boundary decision as AD-01's `{session, isAdmin}`.
- The `GET /admin/levels` contract lives on the un-merged BE-02 branch
  (`feat/backend-admin-levels-MAZ-196`); read it there via `git show` to match the wire DTO.
- Backend admin routes need `#65`/BE-02 merged before this screen has a live endpoint; the
  screen is fully tested against the contract via a fake `IHttpClient`.


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


---

# AI Usage Log: MAZ-206 (AD-05) Level creator — paste/upload JSON + shape validation + preview

## Task / Problem

A creator form where an admin pastes or uploads level JSON, gets **client-side shape
validation** (required fields, ArrowSpec, boardShape) with inline errors before submitting, a
**live board preview** (AD-04), and sees the expected JSON schema. Submit is enabled only for
valid JSON. The actual server create→validate→publish is AD-06. Admin repo ticket (M11),
stacked on AD-04 (MAZ-205, board preview).

## Tool and Model

Claude Code / Claude Opus 4.8 (1M context).

## Prompt Used

Implement `MAZ-206` with the full branch process, following both repo `AGENTS.md`, the admin
repo `AGENTS.md`/`docs/architecture.md`, root `MEMORY.md`, `Linear_MCP_Guideline.md`, AI usage
logging + `compile-ai-usage.sh`, `npm run verify`, commit/push/PR, Linear updates.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | `specs/level-creator-MAZ-206.spec.md`: aligned the validated shape to the backend `CreateLevelInput` contract; per-layer CA impact; presentation-never-imports-domain decision. | `specs/level-creator-MAZ-206.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Gherkin `@s1..@s7`. | `specs/level-creator-MAZ-206.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Pure validator + review orchestration + MVVM VM + dumb screen, test-first. | `tests/**` + `src/**` |
| Judge (`.agents/judge.md`) | Referenced | Checklist: dependency rule inward-only (eslint green), validator pure + exhaustive, VM delegates validation, submit gated on `valid`, reuses AD-04 `BoardPreview`, `@s`→test map, verify green, mutation 97%. | this log + spec |
| Mutation Tester (`.agents/mutation.md`) | Used | Stryker on domain+application: 96%→**96.98%**; killed the killable arithmetic/`.every`/color mutants; remaining are equivalent typeof-drop guards + a dead JSON.parse fallback. | `npm run mutation` |

## Scenario Coverage (@s -> test/evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` valid → preview + submit | `tests/application/board/reviewLevelJson.test.ts`, `tests/presentation/board/LevelCreatorViewModel.test.ts`, `LevelCreatorScreen.test.tsx` |
| `@s2` syntax error blocks submit | `reviewLevelJson.test.ts`, `LevelCreatorScreen.test.tsx` (malformed) |
| `@s3` missing required fields → inline errors | `tests/domain/board/validateLevelDraft.test.ts` (name/difficulty/arrows), `LevelCreatorScreen.test.tsx` |
| `@s4` invalid arrows/boardShape → shape errors | `validateLevelDraft.test.ts` (per-arrow, boardShape, mixed path) |
| `@s5` empty is neither valid nor error | `reviewLevelJson.test.ts`, `LevelCreatorViewModel.test.ts` |
| `@s6` schema shown + preview + submit enabled | `LevelCreatorScreen.test.tsx` (schema-example, board-preview, enabled) |
| `@s7` submit emits parsed value once | `LevelCreatorViewModel.test.ts`, `LevelCreatorScreen.test.tsx` |

## Result Obtained

- **domain** — `board/validateLevelDraft` (pure, accumulates a per-field message per
  violation; mirrors the backend `CreateLevelInput` shape: name/difficulty/arrows(ArrowSpec)/
  optional boardShape/attempts/timeLimit; empty result = valid).
- **application** — `board/reviewLevelJson(text)` → `{ status: empty|syntax-error|invalid|valid,
  errors, value }` (JSON.parse + shape validation).
- **presentation** — `board/LevelCreatorViewModel` (MVVM: text + review state, `setJsonText`,
  `canSubmit`, `previewSource`, `submit` emits the value only when valid), `board/LevelCreatorScreen`
  (dumb: textarea + file upload + inline errors + expected-schema `<details>` + AD-04
  `BoardPreview` live preview + gated submit), `board/levelJsonSchemaExample` (help text).
- Reuses AD-04 `BoardPreview` for the live render; no server call (AD-06).
- `npm run verify` **GREEN** (lint + typecheck + coverage [78 tests / 10 files] + build);
  `npm run mutation` **96.98%** on domain+application.

## Team modifications pending human review

- Route wiring (`/levels/new` inside the admin layout) is intentionally deferred to **AD-06**,
  which sits on the full auth+layout chain; AD-05 (off AD-04, off AD-00) delivers the reusable
  creator component + logic so the router isn't diverged here.

## Lessons / Limitations

- **Scope split with AD-06:** AD-05 does client shape validation + preview + a "submit-ready"
  affordance (`onSubmit(value)` callback); the actual create/publish + server validation is AD-06.
- **Boundary:** presentation reaches validation via the application `reviewLevelJson` and the
  preview via AD-04's `toBoardPreview` — it never imports domain (same rule as AD-01/03/04).
- **Mutation — remaining survivors are equivalent for JSON inputs:** typeof-guard drops
  (`isRecord`/`isPositiveInteger`/`isPositiveNumber`/direction/difficulty) are redundant with
  the following `Number.is*`/`includes` checks (a non-number/non-string is rejected either way),
  and the `JSON.parse` non-`Error` catch fallback is unreachable (it always throws `SyntaxError`).
  Killed the genuine ones: `>0`→`>=0` (via `timeLimit: 0`), `.every`→`.some` (mixed-cell path),
  and the independent `color` check (bad-colour-only arrow).


---

# AI Usage Log: MAZ-207 (AD-06) Create→validate(server)→publish: JSON mounted in the game

## Task / Problem

Wire the AD-05 creator to the backend authoring flow: `POST /levels` (create DRAFT) → show
backend validation errors (ArrowSpec, containment) → `POST /levels/:id/publish` (validates DAG
solvability) → success, so the level appears in the game (`GET /levels`). The backend is the
source of truth for validation. Integration ticket of the admin repo (M11); depends on AD-05
(creator) **and** AD-03 (levels list + admin services), so it converges both branch chains.

## Tool and Model

Claude Code / Claude Opus 4.8 (1M context).

## Prompt Used

Implement `MAZ-207` with the full branch process, following both repo `AGENTS.md`, the admin
repo `AGENTS.md`/`docs/architecture.md`, root `MEMORY.md`, `Linear_MCP_Guideline.md`, AI usage
logging + `compile-ai-usage.sh`, `npm run verify`, commit/push/PR, Linear updates.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | `specs/create-publish-level-MAZ-207.spec.md`: verified the backend `POST /levels` + publish contract; per-layer CA impact; create→publish flow decision (DRAFT remains on publish failure). | `specs/create-publish-level-MAZ-207.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Gherkin `@s1..@s5`. | `specs/create-publish-level-MAZ-207.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Use case + api.create + route wiring + screen server-error props, test-first. | `tests/**` + `src/**` |
| Judge (`.agents/judge.md`) | Referenced | Checklist: dependency rule inward-only (eslint green), backend is authoritative (client only shape-validates), server errors surfaced, `@s`→test map, verify green, mutation 100% on the new use case. | this log + spec |
| Mutation Tester (`.agents/mutation.md`) | Used | Stryker on domain+application: `CreateAndPublishLevelUseCase` **100%**; overall **97.30%** (rest are the equivalent typeof-guard survivors from AD-04/05). | `npm run mutation` |

## Scenario Coverage (@s -> test/evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` create DRAFT then publish, in order | `tests/application/level/use-cases/CreateAndPublishLevelUseCase.test.ts`, `tests/framework/level/AdminLevelCreatorRoute.test.tsx` (POST order `/levels` → `/levels/new-1/publish`) |
| `@s2` create rejection shown, publish skipped | `AdminLevelCreatorRoute.test.tsx` (server-error + only `/levels` posted), `CreateAndPublishLevelUseCase.test.ts` (create failure → no publish) |
| `@s3` publish rejection shown (draft kept) | `CreateAndPublishLevelUseCase.test.ts` (publish failure propagates after create) |
| `@s4` success → back to list (appears in game) | `AdminLevelCreatorRoute.test.tsx` (navigates to `/levels`; list query invalidated) |
| `@s5` create posts the value to /levels | `tests/infrastructure/level/HttpAdminLevelApi.test.ts` (`create` → `POST /levels`, returns id) |

## Result Obtained

- **application** — `IAdminLevelApi.create(level) : Promise<string>` (new port method);
  `CreateAndPublishLevelUseCase` (create → publish; returns the id; either backend failure
  propagates with its message).
- **infrastructure** — `HttpAdminLevelApi.create` (`POST /levels` with the value → `levelId`);
  `CreateLevelData` DTO.
- **framework** — `adminLevelServices` builds `createAndPublishUseCase`;
  `AdminLevelCreatorRoute` (React Query mutation: create→publish, invalidate `admin-levels`,
  navigate to `/levels` on success, surface backend error); `/levels/new` route; `AdminLevelsRoute`
  passes `onCreate` → navigate to the creator.
- **presentation** — `LevelCreatorScreen` extended with optional `serverError` + `isSubmitting`
  (submit gated + "Creating & publishing…"; preview stays visible while submitting); `LevelsView`
  gained an optional `New level` action.
- **Branch convergence:** this branch merged AD-05 (creator+board, off AD-00) into AD-03
  (layout+levels, off the auth chain); only `AI_USAGE.md` conflicted (regenerated from `ai-log/`).
- `npm run verify` **GREEN** (lint + typecheck + coverage [161 tests / 36 files] + build);
  `npm run mutation` **97.30%** on domain+application (`CreateAndPublishLevelUseCase` 100%).

## Team modifications pending human review

- Flow choice: on a publish failure the DRAFT stays (visible in the admin list, where it can be
  published or archived). No client-side rollback, since the backend offers no delete in scope
  and a persisted DRAFT is recoverable.

## Lessons / Limitations

- **Backend is the source of truth:** the client does shape validation (AD-05) for fast
  feedback, but ArrowSpec/containment (create) and DAG solvability (publish) are validated
  server-side; the route shows whichever step's backend message returns.
- **Convergence point:** AD-06 needed both chains (AD-03 data + AD-05 creator). Merging the two
  was clean (disjoint files); the only shared touch was the compiled `AI_USAGE.md`, regenerated
  via `compile-ai-usage.sh`.
- Extended tests that build `IAdminLevelApi` fakes to include the new `create` method, and wrapped
  `AdminLevelsRoute.test` in a `MemoryRouter` (the route now uses `useNavigate`).


---

# AI Usage Log: MAZ-211 (AD-10, Phase 2) Visual level editor + figure picker

## Task / Problem

A visual authoring alternative to pasting JSON: pick a board figure (mask = `boardShape`), paint
arrows on a grid (direction + colour), get live containment/ArrowSpec feedback, preview (AD-04),
and publish — exporting the **same Phase-1 `LevelDefinition` JSON** so it reuses AD-06's
create→publish. The backend validates the same. Phase-2 admin ticket (M11); depends on AD-06.

## Tool and Model

Claude Code / Claude Opus 4.8 (1M context).

## Prompt Used

Implement `MAZ-211` with the full branch process, following both repo `AGENTS.md`, the admin repo
`AGENTS.md`/`docs/architecture.md`, root `MEMORY.md`, `Linear_MCP_Guideline.md`, AI usage logging
+ `compile-ai-usage.sh`, `npm run verify`, commit/push/PR, Linear updates.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | `specs/visual-level-editor-MAZ-211.spec.md`: made the Phase-2 scoping call (MVP in scope; undo/redo, drag-paint, in-place move, live solvability, extended figure library **deferred** and documented); per-layer CA impact; the application-facade boundary decision. | `specs/visual-level-editor-MAZ-211.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Gherkin `@s1..@s7`. | `specs/visual-level-editor-MAZ-211.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Pure figures/paint-rule/validation/export + application review + MVVM VM + dumb grid screen + route, test-first. | `tests/**` + `src/**` |
| Judge (`.agents/judge.md`) | Referenced | Checklist: dependency rule inward-only (eslint green), ALL validation in domain/application (view dumb), export = Phase-1 JSON, reuses AD-06 publish + AD-04 preview, `@s`→test map, verify green, mutation ≥ gate. | this log + spec |
| Mutation Tester (`.agents/mutation.md`) | Used | Stryker on domain+application: **96.56%** (application 100%; editor domain 94.84%). Remaining survivors are boundary/equivalent mutants in the adjacency/guard helpers. | `npm run mutation` |

## Scenario Coverage (@s -> test/evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` figure catalog | `tests/domain/editor/boardFigures.test.ts` |
| `@s2` paint appends only valid cells | `tests/domain/editor/arrowEditing.test.ts` (`canAppendCell`), `tests/presentation/editor/LevelEditorViewModel.test.ts` |
| `@s3` containment + ArrowSpec violations | `tests/domain/editor/validateEditorLevel.test.ts` (mask/connected/self-cross/head-into-body) |
| `@s4` missing figure/name/difficulty/arrows | `validateEditorLevel.test.ts`, `tests/application/editor/reviewEditorLevel.test.ts` |
| `@s5` export = Phase-1 JSON | `tests/domain/editor/exportLevelDefinition.test.ts` |
| `@s6` review validates then exports | `reviewEditorLevel.test.ts` |
| `@s7` screen paints/previews/publishes | `tests/presentation/editor/LevelEditorScreen.test.tsx`, `tests/framework/level/AdminLevelEditorRoute.test.tsx` (paint → create + publish POSTs → navigate) |

## Result Obtained

- **domain** — `editor/boardFigures` (SQUARE/DIAMOND/CROSS/HEART mask catalog on a 5×5 grid +
  `figureById`), `editor/EditorArrow` (types + `ARROW_COLORS`/`ARROW_DIRECTIONS`/`cellKey`),
  `editor/arrowEditing` (`canAppendCell` paint rule), `editor/EditorLevelModel`,
  `editor/validateEditorLevel` (pure: required meta + unique ids + per-arrow containment +
  connectivity + self-cross + head-not-into-body), `editor/exportLevelDefinition` (model →
  Phase-1 JSON with the figure as the CELL_MASK).
- **application** — `editor/reviewEditorLevel` (validate + export) and `editor/editorCatalog`
  (facade re-exporting the domain editor primitives the presentation needs, so the view/VM
  never import domain).
- **presentation** — `editor/LevelEditorViewModel` (MVVM: model + draft path + selected
  dir/colour; paint/undo-head/commit/remove; `canPublish`/`previewSource`/`publish`),
  `editor/LevelEditorScreen` (dumb: figure picker, click-to-paint grid, dir/colour pickers,
  arrow list, inline domain errors, AD-04 live preview, publish).
- **framework** — `editor/AdminLevelEditorRoute` (reuses AD-06 `createAndPublishUseCase`),
  `/levels/new/visual` route, `LevelsView` + `onCreateVisual` action, `AdminLevelsRoute` wires it.
- `npm run verify` **GREEN** (lint + typecheck + coverage [202 tests / 44 files] + build);
  `npm run mutation` **96.56%** on domain+application.

## Team modifications pending human review

- **Phase-2 scope call (documented in the spec):** delivered a complete MVP; deferred undo/redo,
  drag-paint, in-place arrow *move* (satisfied by delete + repaint), **live solvability** (the
  server validates the DAG at publish — the source of truth), and an extended figure library.

## Lessons / Limitations

- **All rules in domain/application:** figures, the paint rule, validation (incl. live
  containment) and export are pure and unit-tested; the view is dumb and reaches them through
  the application facade (`editorCatalog` + `reviewEditorLevel`) — presentation never imports
  domain (same boundary as AD-01/03/04/05/06).
- **Reuse over rebuild:** the editor exports the exact Phase-1 JSON, so it reuses AD-06's
  create→publish and AD-04's preview unchanged — no second publish path, no shared engine.
- Branched off AD-06 (`feat/create-publish-level-MAZ-207`) since AD-10 depends on AD-06, which is
  not yet on `develop`.


---

# AI Log - MAZ-208 Archive + recreate preserving scores (planning)

Date: 2026-07-03
Ticket: MAZ-208
Repo: `arrow-maze-admin`

## Task / Problem

Prepare the executable contract for AD-07: admin workflow to archive a published level, make score
preservation explicit, and create a replacement through the existing JSON creator. Linear still has
MAZ-208 in `Backlog`, so implementation was intentionally not started.

## Tool and Model

- OpenAI Codex CLI / GPT-5 coding agent.
- Local shell, Git, Linear GraphQL read-only scripts using local `LINEAR_API_KEY`.

## Prompt Used

User asked to work on MAZ-208 following the repository AGENTS rules, reading `MEMORY.md`,
`Linear_MCP_Guideline.md`, client/backend/admin context, creating a new worktree, recording AI
usage, validating checks, committing, pushing, opening a PR, and updating Linear. The mandatory
pipeline required stopping before TDD because no approved `.feature` existed and Linear state was
`Backlog`.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Read and applied the spec structure, Clean Architecture contract requirement, and open-question rule. | `specs/archive-recreate-preserve-scores-MAZ-208.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Read and applied stable `@s` Gherkin scenario tags and the no-production-before-approval rule. | `specs/archive-recreate-preserve-scores-MAZ-208.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Read to confirm TDD preconditions; no TDD was run because contract approval is pending. | N/A |
| Judge (`.agents/judge.md`) | Referenced | Read to shape the Clean Architecture contract the future judge will enforce. | `specs/archive-recreate-preserve-scores-MAZ-208.spec.md` |
| Mutation Tester (`.agents/mutation.md`) | Referenced | Read to confirm mutation applies after judge approval and implementation; no mutation run for planning-only work. | N/A |

## Result Obtained

- Created `specs/archive-recreate-preserve-scores-MAZ-208.spec.md`.
- Created `specs/archive-recreate-preserve-scores-MAZ-208.feature` with scenarios `@s1` through
  `@s6`.
- Confirmed dependencies:
  - MAZ-200 / BE-06 is merged in backend `origin/develop` and Linear `In Review`.
  - MAZ-204 / AD-03, MAZ-206 / AD-05, and MAZ-207 / AD-06 are available in admin `origin/develop`.
- No `src` or `tests` files were changed because the executable contract is not yet human-approved.

## Scenario to Test Map

Pending implementation. The future TDD pass must map:

- `@s1` -> presentation/UI test for preservation copy before archive.
- `@s2` -> framework/view-model test for successful archive replacement path.
- `@s3` -> presentation/UI test for ARCHIVED row visibility and no archive action.
- `@s4` -> framework/UI test for PUBLISHED filter archive result copy.
- `@s5` -> framework/UI test for backend error with no success/replacement state.
- `@s6` -> route/navigation test for `/levels/new` reuse.

## Team Modifications Pending Human Review

- Human must approve `specs/archive-recreate-preserve-scores-MAZ-208.feature` before production TDD.
- Human should move MAZ-208 from `Backlog` to the approved implementation state according to the
  Linear guideline.
- Confirm the open question: AD-07 communicates leaderboard preservation but does not implement the
  full AD-08 leaderboard table.

## Lessons / Limitations

- `docs/design-patterns.md` and `docs/ai-log-template.md` are referenced by prompts but are not
  present in the admin repo.
- Because this is planning-only, `npm run verify` validates repository health and contract files,
  but no mutation gate is applicable yet.


---

# AI Usage Log: MAZ-208 (AD-07) Archive + recreate preserving scores

## Task / Problem

Make the admin archive-and-replace workflow explicit: archiving a PUBLISHED level is a **soft**
transition — it leaves the game catalog but **keeps score/leaderboard history readable** (backend
guarantee, MAZ-200) — and is **not a deletion**. After archive the admin list still shows the
level as ARCHIVED, and there is a direct path to create a replacement via the existing `/levels/new`
(AD-06). Presentation/framework only; no new domain/application rule. The contract
(`specs/archive-recreate-preserve-scores-MAZ-208.*`) already existed on develop; this adds the
implementation. Depends on AD-03 (levels list) + AD-06 (create/publish) + backend MAZ-200.

## Tool and Model

Claude Code / Claude Opus 4.8 (1M context).

## Prompt Used

Implement `MAZ-208` (the real feature, not just the contract) with the full branch process,
following the repo `AGENTS.md`, root `MEMORY.md`, `Linear_MCP_Guideline.md`, AI usage logging +
`compile-ai-usage.sh`, `npm run verify`, commit/push/PR, Linear updates.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Followed the pre-approved contract (presentation/framework workflow over existing use cases; archive-preservation is a backend invariant, only communicated in the UI). | `specs/archive-recreate-preserve-scores-MAZ-208.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Mapped the existing scenarios to tests. | `specs/archive-recreate-preserve-scores-MAZ-208.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Added preservation copy + a score-preserving archive affordance + replacement path, reusing the existing archive/create flows; test-first. | `tests/presentation/level/LevelsViewArchive.test.tsx` |
| Judge (`.agents/judge.md`) | Referenced | Checklist: no new domain/application rule, archive not presented as deletion, ARCHIVED rows stay visible + not re-archivable, replacement reuses `/levels/new`, errors imply no success, verify green. | this log + spec |
| Mutation Tester (`.agents/mutation.md`) | Not used | No domain/application change → mutation gate **N/A** (precedent MAZ-198/203/212). | N/A |

## Scenario Coverage (@s -> test/evidence)

| Scenario | Evidence |
| --- | --- |
| PUBLISHED archive wording (preserves scores, removes from game) | `LevelsViewArchive.test.tsx` (archive note + archive button `title`) |
| Successful archive refreshes list + exposes replacement path | reuses AD-03 `useAdminLevels` (invalidates on archive) + the `New level` action → `/levels/new` (AD-06); `LevelsViewArchive.test.tsx` (replacement action) + existing `AdminLevelsRoute` archive-refresh test |
| ARCHIVED rows stay visible + no re-archive | `LevelsViewArchive.test.tsx` (ARCHIVED row present, no archive button) |
| Backend archive error visible, no success implied | `LevelsViewArchive.test.tsx` (error shown, no "success" copy) |

## Result Obtained

- **presentation** — `LevelsView` (AD-03) gains: an `archive-note` legend explaining archiving keeps
  leaderboard/score history and is **not a deletion**, and points to `New level` for a replacement;
  each PUBLISHED-row archive button gains a `title` describing the soft, score-preserving semantics.
- **Reuse (no new code paths):** archive uses AD-03 `ArchiveLevelUseCase` + `useAdminLevels`
  (already invalidates the list so the ARCHIVED row stays visible); the replacement path is the
  existing `New level` → `/levels/new` (AD-06). No new use case, endpoint, or domain rule.
- `npm run verify` **GREEN** (lint + typecheck + coverage [211 tests / 46 files] + build).
  **Mutation gate N/A** (no domain/application change).

## Team modifications pending human review

- The Linear ticket was already prematurely in "In Review" (only the docs/contract PR had landed);
  this PR is the actual implementation.

## Lessons / Limitations

- **Archive ≠ delete:** the preservation guarantee is a backend invariant (MAZ-200); the admin UI
  only *communicates* it (copy + affordance), never deletes/fetches/mutates score history.
- **Replacement without duplication:** "recreate" reuses AD-06's `/levels/new` create→publish
  rather than adding a parallel flow — the levels table just exposes the path.
- No full leaderboard table here (that is AD-08); the copy states the backend guarantee without
  claiming AD-08 is implemented.


---

# AI Log - MAZ-209 Read-only leaderboard viewer (planning)

Date: 2026-07-04
Ticket: MAZ-209
Repo: `arrow-maze-admin`

## Task / Problem

Prepare the executable contract for AD-08: a read-only admin leaderboard viewer that selects a
level, reads `GET /leaderboard/:levelId`, shows top entries, handles empty/error states, and works
for archived levels. Linear still has MAZ-209 in `Backlog`, so implementation was intentionally not
started.

## Tool and Model

- OpenAI Codex CLI / GPT-5 coding agent.
- Local shell, Git, Linear GraphQL read-only script using local `LINEAR_API_KEY`.

## Prompt Used

User asked to work on MAZ-209 following the repository AGENTS rules, reading `MEMORY.md`,
`Linear_MCP_Guideline.md`, client/backend/admin context, creating a new worktree, recording AI
usage, validating checks, committing, pushing, opening a PR, and updating Linear. The mandatory
pipeline required stopping before TDD because no approved `.feature` existed and Linear state was
`Backlog`.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Read and applied the spec structure, Clean Architecture contract requirement, and open-question rule. | `specs/admin-leaderboard-viewer-MAZ-209.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Read and applied stable `@s` Gherkin scenario tags and the no-production-before-approval rule. | `specs/admin-leaderboard-viewer-MAZ-209.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Read to confirm TDD preconditions; no TDD was run because contract approval is pending. | N/A |
| Judge (`.agents/judge.md`) | Referenced | Read to shape the Clean Architecture contract the future judge will enforce. | `specs/admin-leaderboard-viewer-MAZ-209.spec.md` |
| Mutation Tester (`.agents/mutation.md`) | Referenced | Read to confirm mutation applies after judge approval and implementation; no mutation run for planning-only work. | N/A |

## Result Obtained

- Created `specs/admin-leaderboard-viewer-MAZ-209.spec.md`.
- Created `specs/admin-leaderboard-viewer-MAZ-209.feature` with scenarios `@s1` through `@s7`.
- Confirmed backend contract:
  - `GET /leaderboard/:levelId` returns `levelId`, optional `leaderboardId`/`updatedAt`, and
    `entries[]` with rank, username snapshot, score, time, moves and submitted date.
  - Known empty levels return `200 entries: []`.
  - MAZ-200 guarantees archived known levels remain readable through the same endpoint.
- No `src` or `tests` files were changed because the executable contract is not yet human-approved.

## Scenario to Test Map

Pending implementation. The future TDD pass must map:

- `@s1` -> framework/UI test for selector options including ARCHIVED levels.
- `@s2` -> presentation/UI + infrastructure mapping tests for populated leaderboard entries.
- `@s3` -> presentation/UI + infrastructure mapping tests for `entries: []`.
- `@s4` -> framework/view-model test proving ARCHIVED uses the same leaderboard read path.
- `@s5` -> framework/UI test for backend error visibility and usable selector.
- `@s6` -> presentation/UI test proving no edit/delete/submit actions render.
- `@s7` -> framework/view-model test proving no request happens until a level is selected.

## Team Modifications Pending Human Review

- Human must approve `specs/admin-leaderboard-viewer-MAZ-209.feature` before production TDD.
- Human should move MAZ-209 from `Backlog` to the approved implementation state according to the
  Linear guideline.
- Confirm the open question: AD-08 may reuse `GET /admin/levels` for the selector even though the
  original ticket dependency list only names AD-02.

## Lessons / Limitations

- `docs/design-patterns.md` and `docs/ai-log-template.md` are referenced by prompts but are not
  present in the admin repo.
- Because this is planning-only, `npm run verify` validates repository health and contract files,
  but no mutation gate is applicable yet.


---

# AI Usage Log: MAZ-209 (AD-08) Read-only leaderboard viewer

## Task / Problem

Replace the `/leaderboard` placeholder with a real read-only leaderboard section: pick a level
(incl. ARCHIVED — MAZ-200 keeps their score history readable) and see its top entries from
`GET /leaderboard/:levelId` (rank, player, score, time, moves, submitted date), with
neutral/loading/empty/error states and no score mutation. The contract
(`specs/admin-leaderboard-viewer-MAZ-209.*`) already existed on develop; this adds the
implementation. Depends on AD-02 (layout) + reuses AD-03 admin levels for the selector.

## Tool and Model

Claude Code / Claude Opus 4.8 (1M context).

## Prompt Used

Implement `MAZ-209` (the real feature, not just the contract) with the full branch process,
following the repo `AGENTS.md`, root `MEMORY.md`, `Linear_MCP_Guideline.md`, AI usage logging +
`compile-ai-usage.sh`, `npm run verify`, commit/push/PR, Linear updates.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Followed the pre-approved contract (read-only, reuse `GET /admin/levels` for the selector incl. ARCHIVED, use the public `GET /leaderboard/:id`). | `specs/admin-leaderboard-viewer-MAZ-209.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Mapped the existing `@s1..@s7` to tests. | `specs/admin-leaderboard-viewer-MAZ-209.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Built the read vertical (port → use case → HTTP adapter → dumb view → route) mirroring AD-03/AD-09. | `tests/**` + `src/**` |
| Judge (`.agents/judge.md`) | Referenced | Checklist: dependency rule inward-only, read-only (no buttons), ARCHIVED selectable, neutral state before selection, `@s`→test map, verify green. | this log + spec |
| Mutation Tester (`.agents/mutation.md`) | Used | Stryker on domain+application (`GetLeaderboardUseCase`). | `npm run mutation` |

## Scenario Coverage (@s -> test/evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` selector shows levels incl. ARCHIVED | `tests/presentation/leaderboard/LeaderboardView.test.tsx`, `tests/framework/leaderboard/AdminLeaderboardRoute.test.tsx` |
| `@s2` entries render rank/player/score/time/moves/date | `LeaderboardView.test.tsx`, `HttpLeaderboardApi.test.ts` |
| `@s3` empty state for a level with no scores | `LeaderboardView.test.tsx`, `HttpLeaderboardApi.test.ts` (empty) |
| `@s4` ARCHIVED level uses the same read path | `AdminLeaderboardRoute.test.tsx` (select `l2` ARCHIVED → entries) |
| `@s5` backend error shown, selector stays usable | `LeaderboardView.test.tsx` (error + select enabled) |
| `@s6` no submit/edit/delete action | `LeaderboardView.test.tsx` (no buttons) |
| `@s7` neutral before selection (no fetch) | `LeaderboardView.test.tsx` (neutral), `useLeaderboard` (`enabled: selectedLevelId !== null`) |

## Result Obtained

- **application** — `leaderboard/Leaderboard` (`LeaderboardEntry`/`LeaderboardData`),
  `ports/ILeaderboardApi`, `leaderboard/use-cases/GetLeaderboardUseCase`.
- **infrastructure** — `leaderboard/LeaderboardDtos`, `leaderboard/HttpLeaderboardApi`
  (`GET /leaderboard/:levelId`, encoded; maps entries; optional `leaderboardId`/`updatedAt` ignored).
- **presentation** — `leaderboard/LeaderboardView` (dumb: level selector + read-only table +
  neutral/loading/empty/error; **no mutation actions**).
- **framework** — `leaderboard/leaderboardServices` (+ `useLeaderboardServices`),
  `leaderboard/useLeaderboard` (React Query VM: levels via AD-03 `ListAdminLevelsUseCase` for the
  selector; leaderboard query **enabled only when a level is selected**), `leaderboard/AdminLeaderboardRoute`;
  `/leaderboard` route wired (placeholder removed).
- `npm run verify` **GREEN** (lint + typecheck + coverage [215 tests / 49 files] + build).

## Team modifications pending human review

- The Linear ticket was already prematurely in "In Review" (only the docs/contract PR had landed);
  this PR is the actual implementation.

## Lessons / Limitations

- **Archived levels readable:** the selector reuses `GET /admin/levels` (all statuses) so ARCHIVED
  levels are discoverable, and the read path is the public `GET /leaderboard/:levelId` — same for
  every status (MAZ-200 guarantee). No new backend endpoint.
- **Read-only + no premature fetch:** the leaderboard query is `enabled` only once a level is
  selected (S7), and the view exposes no buttons at all (S6).
- Mirrors the AD-03/AD-09 pattern (React Query VM + dumb view + services over the session
  httpClient); branched off `origin/develop` (has AD-00..12).


---

# AI Usage Log: MAZ-210 (AD-09) read-only users viewer planning

## Task / Problem

Prepare the executable planning contract for `MAZ-210`, the admin web read-only Users viewer.
Linear shows the ticket in `Backlog`, so implementation and TDD are intentionally blocked until a
human approves `specs/admin-users-viewer-MAZ-210.feature` and moves the ticket to an implementation
state.

## Tool and Model

- Tool: OpenAI Codex CLI in the local workspace.
- Model: GPT-5.

## Prompt Used

User requested work on `MAZ-210`, including reviewing both backend/client `AGENTS.md`, root
`MEMORY.md`, `Linear_MCP_Guideline.md`, AI usage requirements, checks, a new worktree, commit, push,
PR, Linear update, and a review of affected ticket context because this is part of a refactor.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Used the spec checklist to define purpose, scope, API contract, Clean Architecture contract, decisions, edge cases, and open questions. | `specs/admin-users-viewer-MAZ-210.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Produced the executable Gherkin contract with stable `@s1..@s7` tags and stopped before TDD because Linear is still `Backlog`. | `specs/admin-users-viewer-MAZ-210.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Applied the precondition rule: no production or test changes before human approval of the `.feature`. | No `src/` or `tests/` changes |
| Judge (`.agents/judge.md`) | Referenced | Included the required Clean Architecture contract and layer impact so a future judge can review implementation against it. | `specs/admin-users-viewer-MAZ-210.spec.md` |
| Mutation Tester (`.agents/mutation.md`) | Not used | No implementation was performed; mutation testing is not applicable to planning-only work. | N/A |

## Affected Ticket Context Reviewed

- `MAZ-197` / `BE-03`: backend `GET /admin/users`, currently `In Review`, provides the read-only
  paginated API and guarantees no `passwordHash`.
- `MAZ-203` / `AD-02`: admin layout and protected `/users` route placeholder, currently `In Review`.
- `MAZ-209` / `AD-08`: merged into admin `origin/develop` before this worktree; confirms the same
  planning-only gate pattern for read-only admin views.

## Result Obtained

- Added `specs/admin-users-viewer-MAZ-210.spec.md`.
- Added `specs/admin-users-viewer-MAZ-210.feature` with scenarios `@s1..@s7`.
- Did not edit `src/` or `tests/` because the executable contract is not human-approved yet.

## Scenario to Future Test Map

Implementation is blocked, so this is the intended map for the future TDD pass:

| Scenario | Future concrete tests |
| --- | --- |
| `@s1` users table renders backend fields | Application/infrastructure mapping test + Users view render test |
| `@s2` password hashes never exposed | Mapper test with unexpected `passwordHash` + UI negative assertion |
| `@s3` changing page requests next page | Framework/view-model pagination test |
| `@s4` empty users response shows empty state | Users view empty-state test |
| `@s5` backend users errors visible and recoverable | Infrastructure error mapping + UI error/retry test |
| `@s6` users table is read-only | UI negative assertions for edit/suspend/delete/role/password actions |
| `@s7` pagination controls reflect metadata | Pagination controls state test |

## Validation

- `npm run verify` GREEN after `npm ci` in the new worktree:
  - lint PASS
  - typecheck PASS
  - coverage PASS (`36` test files / `161` tests)
  - build PASS
- Mutation: N/A for planning-only work; no `src/domain` or `src/application` changes.

## Team Modifications Pending Human Review

- Review and approve or amend `specs/admin-users-viewer-MAZ-210.feature`.
- Move `MAZ-210` out of `Backlog` only after approving the executable contract.
- Confirm the MVP intentionally excludes search/filtering and user mutations.

## Lessons / Limitations

- `docs/design-patterns.md` and `docs/ai-log-template.md` are referenced by prompts but are not
  present in the admin repo; `AGENTS.md`, `docs/architecture.md`, `docs/workflow.md`,
  `docs/tdd.md`, `docs/reglas_clean_arch.md`, and prior admin contracts were used instead.
- Local GitHub CLI remains unauthenticated/invalid; PR creation should use the GitHub connector
  after pushing the branch.


---

# AI Usage Log: MAZ-210 (AD-09) Read-only users viewer

## Task / Problem

Replace the `/users` placeholder with a real read-only admin Users section: a paginated table
from `GET /admin/users` (BE-03/MAZ-197) showing username/email/role/status/createdAt, with
pagination + loading/empty/error states, no user mutation, and **no `passwordHash`** ever mapped
or rendered. The contract (`specs/admin-users-viewer-MAZ-210.*`) already existed on develop; this
adds the implementation. Depends on AD-01 (auth/httpClient) + AD-02 (layout).

## Tool and Model

Claude Code / Claude Opus 4.8 (1M context).

## Prompt Used

Implement `MAZ-210` (the real feature, not just the contract) with the full branch process,
following the repo `AGENTS.md`, root `MEMORY.md`, `Linear_MCP_Guideline.md`, AI usage logging +
`compile-ai-usage.sh`, `npm run verify`, commit/push/PR, Linear updates.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Followed the pre-approved contract `specs/admin-users-viewer-MAZ-210.spec.md` (read-only, page/limit, no passwordHash). | `specs/admin-users-viewer-MAZ-210.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Mapped the existing `@s1..@s7` to tests. | `specs/admin-users-viewer-MAZ-210.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Built the read vertical (port → use case → HTTP adapter → dumb view → route) mirroring AD-03. | `tests/**` + `src/**` |
| Judge (`.agents/judge.md`) | Referenced | Checklist: dependency rule inward-only (eslint green), read-only (no mutation buttons), passwordHash never mapped, `@s`→test map, verify green, mutation 100% on the use case. | this log + spec |
| Mutation Tester (`.agents/mutation.md`) | Used | Stryker on domain+application: overall **96.71%** (`ListAdminUsersUseCase` 100%). | `npm run mutation` |

## Scenario Coverage (@s -> test/evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` rows show username/email/role/status/created | `tests/presentation/user/UsersView.test.tsx`, `tests/framework/user/AdminUsersRoute.test.tsx` |
| `@s2` no passwordHash mapped/visible | `tests/infrastructure/user/HttpAdminUserApi.test.ts` (drops passwordHash), `ListAdminUsersUseCase.test.ts` |
| `@s3` page change requests new page/limit | `AdminUsersRoute.test.tsx` (`page:2` after Next), `HttpAdminUserApi.test.ts` (`?page&limit`) |
| `@s4` empty state | `UsersView.test.tsx`, `HttpAdminUserApi.test.ts` (empty page) |
| `@s5` backend error shown | `UsersView.test.tsx` (error state) |
| `@s6` no edit/suspend/delete/role/reset action | `UsersView.test.tsx` (only pagination buttons exist) |
| `@s7` prev/next disabled per pagination metadata | `UsersView.test.tsx`, `useAdminUsers` (`canPrev`/`canNext`) |

## Result Obtained

- **application** — `user/AdminUser` (+ `AdminUsersPage`), `ports/IAdminUserApi`,
  `user/use-cases/ListAdminUsersUseCase` (delegates `{page, limit}`).
- **infrastructure** — `user/AdminUserDtos`, `user/HttpAdminUserApi` (`GET /admin/users?page&limit`;
  maps only the 6 read-safe fields → `passwordHash`/unknown fields dropped at the boundary).
- **presentation** — `user/UsersView` (dumb table + pagination + loading/empty/error; **no
  mutation actions**; reuses AD-03 `formatCreatedAt`).
- **framework** — `user/adminUserServices` (+ `useAdminUserServices`), `user/useAdminUsers`
  (React Query VM: page state + backend-driven pagination), `user/AdminUsersRoute`; `/users`
  route wired (placeholder removed).
- `npm run verify` **GREEN** (lint + typecheck + coverage [216 tests / 49 files] + build);
  `npm run mutation` **96.71%** (`ListAdminUsersUseCase` 100%).

## Team modifications pending human review

- The Linear ticket was already prematurely in "In Review" (only the docs/contract PR had landed);
  this PR is the actual implementation. Left it In Review with a comment; humans close.

## Lessons / Limitations

- **`passwordHash` never leaves the boundary:** the HTTP adapter maps field-by-field, so a
  sensitive/unknown field in the payload is dropped at infrastructure (asserted with a payload
  that includes `passwordHash`). Presentation only ever sees the read DTO.
- Read-only guarantee is tested structurally: the view renders only pagination buttons (no
  edit/suspend/delete/role/reset), so no mutation affordance can regress in unnoticed.
- Mirrors the AD-03 levels-list pattern (React Query VM + dumb view + services over the session
  httpClient); branched off `origin/develop` (has AD-00..12).


---

# AI Usage Log: MAZ-212 (AD-11, Phase 2) Build + hosting of the admin SPA

## Task / Problem

Ship the production build + static-hosting configuration for the admin SPA: a static-host config
with an SPA fallback (client-side routes must serve `index.html`), a documented production
`VITE_API_BASE_URL`, and the step to add the deployed admin origin to the backend CORS (BE-04).
Ops/config ticket (M11, Phase 2); depends on AD-01 (env) + BE-04 (CORS). The actual deploy is a
human action.

## Tool and Model

Claude Code / Claude Opus 4.8 (1M context).

## Prompt Used

Implement `MAZ-212` with the full branch process, following both repo `AGENTS.md`, the admin repo
`AGENTS.md`/`docs/architecture.md`, root `MEMORY.md`, `Linear_MCP_Guideline.md`, AI usage logging
+ `compile-ai-usage.sh`, `npm run verify`, commit/push/PR, Linear updates.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | `specs/build-hosting-MAZ-212.spec.md`: framed this as an ops/config ticket (no `src/` behaviour), the deploy-is-a-human-step boundary, and the config-integrity test decision. | `specs/build-hosting-MAZ-212.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Gherkin `@s1..@s4`. | `specs/build-hosting-MAZ-212.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Referenced | Added host configs + a config-integrity test asserting the SPA fallback / build/output dir / env doc. | `tests/deploy/hostingConfig.test.ts` + config files |
| Judge (`.agents/judge.md`) | Referenced | Checklist: no `src/` change, host configs encode the SPA rewrite, docs cover prod env + CORS (BE-04), `npm run verify` green, no secrets/URLs committed. | this log + spec |
| Mutation Tester (`.agents/mutation.md`) | Not used | No domain/application change → mutation gate **N/A** (precedent MAZ-198/203). | N/A |

## Scenario Coverage (@s -> test/evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` build emits static assets | `npm run build` → `dist/` (verified: `dist/index.html` + `dist/_redirects`) |
| `@s2` SPA fallback to index.html | `tests/deploy/hostingConfig.test.ts` (netlify.toml redirect, vercel.json rewrites, `public/_redirects`) |
| `@s3` prod API base URL documented as build-time var | `tests/deploy/hostingConfig.test.ts` (`.env.example` has `VITE_API_BASE_URL`), `docs/deploy.md`, README |
| `@s4` deployed origin added to backend CORS | `docs/deploy.md` §3 + README + `.env.example` (BE-04, comma-separated `CORS_ORIGIN`) |

## Result Obtained

- **Host config (committed):** `netlify.toml` (build command, `publish = "dist"`, Node 20, SPA
  redirect, baseline security headers), `vercel.json` (build/output + SPA `rewrites` + headers),
  `public/_redirects` (Netlify SPA fallback → copied into `dist/` at build).
- **Env + docs:** extended `.env.example` (prod `VITE_API_BASE_URL` is a host build-env var,
  inlined by Vite; add the admin origin to backend `CORS_ORIGIN`), new `docs/deploy.md` runbook
  (build, Netlify/Vercel/S3+CloudFront, SPA routing, CORS/BE-04, post-deploy checks), README
  "Deployment (AD-11)" section.
- **Test:** `tests/deploy/hostingConfig.test.ts` guards the SPA fallback + build/output dir + env
  doc against regressions.
- `npm run verify` **GREEN** (lint + typecheck + coverage [206 tests / 45 files] + `vite build`);
  `dist/` contains `index.html` + `_redirects`. **Mutation gate N/A** (no `src/` change).

## Team modifications pending human review

- **The deploy itself is a human step** (agents don't deploy): connect the repo to Netlify/Vercel
  (or upload `dist/` to S3+CloudFront), set `VITE_API_BASE_URL` in the host build env, and add the
  admin's origin to the backend `CORS_ORIGIN`. Everything needed to do so is committed/documented.
- **CORS (BE-04) is a backend deploy-env change** (`CORS_ORIGIN` value), not a code change — the
  backend already parses a comma-separated list (MAZ-198); documented in `docs/deploy.md`.

## Lessons / Limitations

- The prod API URL is **not committed** — Vite inlines `VITE_API_BASE_URL` at build time, so it
  belongs in the host build environment (and `.gitignore` ignores `.env.*` anyway, keeping the
  prod value out of the repo).
- SPA routing (`createBrowserRouter`) requires a host rewrite so deep links / hard refreshes on
  `/levels`, `/levels/new`, … serve `index.html` (200); all three host configs encode it.
- Config/docs ticket: no domain/application logic, so the mutation gate is N/A; the
  config-integrity test provides a green regression guard instead.


---

# AI Usage Log: MAZ-216 flexible rectangular board definitions (admin planning)

## Task / Problem

Prepare the admin-side executable contract for `MAZ-216` / M12-04: allow non-preset
rectangular board definitions in admin level creation while enforcing M12 limits
(`12 x 12`, `60` arrows), preserving existing MAZ-205/206/207 behavior, and keeping
MAZ-211 irregular visual-editor masks out of this slice.

This is a planning/human-gate change only. No production code was written because no
approved MAZ-216 `.feature` contract existed before this session.

## Tool and Model

Codex CLI / GPT-5.

## Prompt Used

The user asked to start `MAZ-216`, following both repo `AGENTS.md` files, root
`MEMORY.md`, `Linear_MCP_Guideline.md`, new worktrees, AI usage logging,
`compile-ai-usage.sh`, checks, commit/push/PR/Linear, and to review affected tickets
because this is a refactor/factorization.

## Agent Roles Used

| Agent | Status | How it was used | Evidence |
| --- | --- | --- | --- |
| Spec Partner (`.agents/spec-partner.md`) | Referenced | Distilled the Linear ticket and existing MAZ-205/206/207/211 contracts into a draft admin spec; no separate agent session was run. | `specs/flexible-rectangular-boards-MAZ-216.spec.md` |
| Planner / Gherkin Author (`.agents/planner.md`) | Referenced | Wrote the executable admin Gherkin scenarios `@s1..@s7` for the human gate. | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| TDD Implementer (`.agents/tdd-implementer.md`) | Not used | No TDD implementation was started because the MAZ-216 contract still needs human approval. | N/A |
| Judge (`.agents/judge.md`) | Referenced | Applied the Clean Architecture checklist to the proposed layer impact and forbidden moves. | this log + spec |
| Mutation Tester (`.agents/mutation.md`) | Not used | Mutation testing is not applicable to a contract-only planning change. | N/A |

## Scenario Coverage (@s -> evidence)

| Scenario | Evidence |
| --- | --- |
| `@s1` valid non-preset rectangle validates and previews | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| `@s2` legacy JSON without `boardSize` keeps existing behavior | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| `@s3` oversize dimensions rejected locally | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| `@s4` more than 60 arrows rejected locally | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| `@s5` arrow cells outside rectangle rejected locally | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| `@s6` creator documents rectangular schema | `specs/flexible-rectangular-boards-MAZ-216.feature` |
| `@s7` backend rectangular validation errors surfaced | `specs/flexible-rectangular-boards-MAZ-216.feature` |

## Result Obtained

- Added `specs/flexible-rectangular-boards-MAZ-216.spec.md` with admin behavior,
  affected-ticket review, Clean Architecture placement, edge cases, and decisions.
- Added `specs/flexible-rectangular-boards-MAZ-216.feature` with `@s1..@s7`.
- Proposed `boardSize` as the admin rectangular authoring input and backend normalization
  to a full `CELL_MASK` `boardShape` for mobile compatibility.
- `npm run verify` green: lint, typecheck, coverage (`54` files / `230` tests), and build.

## Team Modifications Pending Human Review

- Human approval is required for the `@s1..@s7` contract before any TDD implementation.
- The team must confirm the `boardSize` request field name and the decision to normalize
  rectangular boards to `boardShape` for persistence/read.

## Lessons / Limitations

- Existing admin preview and validation are mask/arrow-bound based; rectangular empty cells
  require explicit dimensions in the contract.
- Existing mobile already renders `boardShape`, so normalized full rectangles avoid mobile
  work if the backend contract is approved as written.


<!-- AI_LOG_ENTRIES_END -->
