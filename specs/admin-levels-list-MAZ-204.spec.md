# Spec — AD-03 Admin levels list with status + row actions (MAZ-204)

## Problem

The `/levels` section is a placeholder. Admins need a table of every level (any status)
from `GET /admin/levels`, filterable by status, with per-row actions: view (inline detail),
publish (DRAFT → PUBLISHED) and archive (PUBLISHED → ARCHIVED), wired to
`POST /levels/:id/publish` and `POST /levels/:id/archive`. Backend errors (e.g. publishing a
non-solvable level) must be shown clearly.

## Backend contract (consumed, not changed)

- `GET /admin/levels?status=` (auth + admin) →
  `{ status:"success", data:{ levels: [{ levelId, name, difficulty, status, arrowCount,
  attempts, timeLimitSeconds?, createdAt }] } }`. `status` ∈ DRAFT|PUBLISHED|ARCHIVED,
  `difficulty` ∈ EASY|MEDIUM|HARD.
- `POST /levels/:levelId/publish` (auth + admin) → `{ status:"success", data:{ levelId } }`;
  errors 422 `BUSINESS_RULE_VIOLATION` ("Only draft levels can be published" / non-solvable),
  404, 403, 401.
- `POST /levels/:levelId/archive` (auth + admin) → same shape; 422 "Only published levels
  can be archived", 404/403/401.
- Error body: `{ status:"error", error:{ code, message, details? } }`.

## Scope / Clean Architecture contract

| Layer | Impact |
| --- | --- |
| domain | `level/LevelStatus.ts`, `level/LevelDifficulty.ts`, `level/LevelStatusPolicy.ts` (pure: `canPublish` = DRAFT only, `canArchive` = PUBLISHED only) |
| application | `level/AdminLevelSummary.ts`, `level/AdminLevelRow.ts` (summary + `canPublish`/`canArchive` flags), `ports/IAdminLevelApi.ts`, use cases `ListAdminLevelsUseCase` (maps summaries → rows via policy), `PublishLevelUseCase`, `ArchiveLevelUseCase` |
| infrastructure | `level/AdminLevelDtos.ts`, `level/HttpAdminLevelApi.ts` (GET/POST over `IHttpClient`); **enhance** `http/FetchHttpClient.ts` + `http/HttpError.ts` to surface the backend `error.message`/`code` on failures |
| presentation | `level/LevelsView.tsx` (dumb: filter + table + actions + loading/error/empty + inline detail), `level/formatCreatedAt.ts` (pure) |
| framework | `level/adminLevelServices.ts` (compose api + use cases from session httpClient) + `useAdminLevelServices` hook, `level/useAdminLevels.ts` (React Query view-model: query + publish/archive mutations + filter/expanded/pending state), `level/AdminLevelsRoute.tsx`; expose `httpClient` on `SessionContext`; wire `/levels` route to `AdminLevelsRoute` |

**Forbidden moves:** presentation must not import domain (row flags computed in application);
no business rules in the view; router/query libs never in domain/application; no new
top-level folders; the publish/archive server call is authoritative (client policy only
gates which buttons show).

**Architectural acceptance (judge gate):** dependency rule inward-only (eslint green);
`LevelStatusPolicy` pure; `ListAdminLevelsUseCase` computes flags (presentation stays dumb);
`HttpAdminLevelApi` behind the `IAdminLevelApi` port; `npm run verify` green; Stryker on
domain+application ≥ 80 (target 100).

## Acceptance criteria (from the ticket)

- Lists levels incl. DRAFT/ARCHIVED; filters by status.
- Publish DRAFT→PUBLISHED; archive PUBLISHED→ARCHIVED; the UI reflects the new status.
- Backend errors (e.g. publishing a non-solvable level) are shown clearly.
