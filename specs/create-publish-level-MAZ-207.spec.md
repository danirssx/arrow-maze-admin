# Spec — AD-06 Create→validate(server)→publish: JSON mounted in the game (MAZ-207)

## Problem

The AD-05 creator validates JSON shape and previews it, but nothing is persisted. AD-06 wires
it to the backend authoring flow so a valid level is created, published, and appears in the
game — with the backend as the source of truth for validation.

## Backend contract (consumed)

- `POST /levels` (auth + admin, body = `{ name, description, difficulty, arrows, attempts?,
  timeLimit?, boardShape? }`) → `{ status:"success", data:{ levelId } }`; validates ArrowSpec +
  board-shape containment; `422 BUSINESS_RULE_VIOLATION` on invalid.
- `POST /levels/:id/publish` (auth + admin) → `{ status:"success", data:{ levelId } }`; validates
  DAG solvability; `422` on non-solvable / non-draft.
- Error body: `{ status:"error", error:{ code, message } }` (surfaced via `HttpError`, AD-03).

## Scope / Clean Architecture contract

| Layer | Impact |
| --- | --- |
| domain | none |
| application | `IAdminLevelApi.create(level): Promise<string>` (new port method); `level/use-cases/CreateAndPublishLevelUseCase` (create → publish → id) |
| infrastructure | `HttpAdminLevelApi.create` (`POST /levels`); `CreateLevelData` DTO |
| presentation | extend `LevelCreatorScreen` with optional `serverError` + `isSubmitting`; extend `LevelsView` with an optional `onCreate` action |
| framework | `adminLevelServices` builds `createAndPublishUseCase`; `AdminLevelCreatorRoute` (React Query mutation → invalidate `admin-levels` + navigate to `/levels`); `/levels/new` route; `AdminLevelsRoute` wires `onCreate` |

**Forbidden moves:** the client never re-implements server validation (backend authoritative);
presentation stays dumb (server errors + submitting flags are props); no new top-level folders.
Reuses AD-05 creator + AD-03 admin services.

**Architectural acceptance (judge gate):** dependency rule inward-only (eslint green);
`CreateAndPublishLevelUseCase` orchestrates only the port; backend errors surface verbatim;
`npm run verify` green; Stryker on the new use case = 100%.

## Acceptance criteria (from the ticket)

- Creates a DRAFT via the API; a backend rejection (invalid / non-solvable) is shown clearly.
- Publishing makes the level appear in the game (`GET /levels`) — JSON→mounted end-to-end.
