# Spec - AD-08 Read-only leaderboard viewer (MAZ-209)

Date: 2026-07-04
Ticket: `MAZ-209` (plan id `AD-08`)
Source: `../Vertiente1-AdminDashboard-Tickets.md` (M11 - Admin Dashboard), Linear `MAZ-209`,
backend leaderboard contract, and archive-preservation contract `MAZ-200`.
Status: Proposed contract. Linear is still `Backlog`; the `@s` scenarios in
`specs/admin-leaderboard-viewer-MAZ-209.feature` need human approval before TDD.

## Purpose

Add a read-only admin leaderboard section where an authenticated admin selects a level and sees the
top entries for that level, including archived levels whose score history must remain readable.

## In scope / Out of scope

- In scope: level selection for leaderboard viewing, `GET /leaderboard/:levelId` read path,
  leaderboard table with rank, username, score, time, moves and submitted date, empty/loading/error
  states, and support for ARCHIVED levels.
- In scope: reuse existing admin level listing data for selector labels and statuses when available,
  so archived levels are selectable.
- Out of scope: submitting scores, editing/deleting leaderboard entries, ranking recalculation,
  changing backend leaderboard behavior, adding a new admin leaderboard endpoint, exporting data,
  pagination beyond the backend's current top entries, or changing level archive behavior.

## Behavior

The admin `Leaderboard` section starts in a neutral state until a level is selected. The level
selector must include known levels with their status, including ARCHIVED, because MAZ-200 guarantees
archived levels keep readable score history. When the admin selects a level, the UI calls
`GET /leaderboard/:levelId` and renders a read-only table.

The table shows one row per entry:

- rank
- username from `usernameSnapshot`
- score
- time from `timeSeconds`
- moves from `movesCount`
- submitted date from `submittedAt`

If the backend returns `entries: []`, the view shows an empty-state message instead of a table. If
the backend returns a non-success error, the view shows the backend error and keeps the selector
usable. The view must not expose any mutation action for entries.

## Backend/API contract consumed

- `GET /leaderboard/:levelId` returns:

```ts
{
  status: "success";
  data: {
    levelId: string;
    leaderboardId?: string;
    updatedAt?: string;
    entries: Array<{
      entryId: string;
      userId: string;
      usernameSnapshot: string;
      score: number;
      timeSeconds: number;
      movesCount: number;
      rank: number;
      submittedAt: string;
    }>;
  };
}
```

- Known levels with no leaderboard return `200` and `entries: []`.
- Unknown levels return an error envelope, usually `404 NOT_FOUND`.
- Archived known levels are readable through the same endpoint (`MAZ-200`); no level status filter is
  applied by the backend leaderboard read.
- `GET /admin/levels?status=` may be reused for the selector because it includes DRAFT, PUBLISHED
  and ARCHIVED levels. The leaderboard read itself remains the existing public endpoint.

## Architecture placement (domain -> application -> presentation; inward-only deps)

No new domain invariant is expected. The feature is a read model: application defines a simple
leaderboard DTO and use case over a port, infrastructure adapts the HTTP endpoint, presentation
renders view state and intents, and framework wires React Query/navigation/composition.

## Clean Architecture contract

Applicable rules from `docs/reglas_clean_arch.md`:

- [x] Regla de dependencia (dependencies point inward only)
- [x] Application solo orquesta (no business rules, no infra/framework/presentation imports)
- [x] Repositorios: interfaz adentro (port), implementación afuera (infrastructure)
- [x] DTOs simples en fronteras (primitives/records, no raw domain entities/types)
- [x] MVVM: View dumb, ViewModel solo presentación, streams/view state, composition root en framework

Layer impact:

- Domain: no previsto.
- Application: add leaderboard DTOs, `ILeaderboardApi` port, and `GetLeaderboardUseCase` that
  delegates to the port; optionally compose selector data from existing `AdminLevelRow` records
  without introducing domain rules.
- Infrastructure/Adapters: add leaderboard HTTP DTO mapper and `HttpLeaderboardApi` adapter over
  the existing `IHttpClient`; preserve backend error messages through `HttpError`.
- Presentation (MVVM): add a dumb `LeaderboardView` (or section component) that renders selector,
  loading/error/empty states and a read-only table from view state.
- Framework (composition root): add leaderboard services/use hook/route wiring under `/leaderboard`;
  React Query and session HTTP client stay in framework.

Forbidden moves:

- [ ] `src/domain` importing React/router/HTTP/storage/Tailwind or any outer layer
- [ ] `src/application` importing `infrastructure`/`framework`/`presentation`
- [ ] Views/screens performing HTTP calls, composing dependencies, or calculating leaderboard rules
- [ ] ViewModels submitting, deleting, editing or recalculating leaderboard entries
- [ ] Adding a new backend admin leaderboard endpoint for this slice
- [ ] Hiding ARCHIVED levels from the selector when they are returned by the admin levels endpoint

Required tests:

- Application: `GetLeaderboardUseCase` delegates to the port and returns a simple read DTO.
- Infrastructure: `HttpLeaderboardApi` maps `GET /leaderboard/:levelId` success, empty and error
  envelopes.
- Presentation/UI: selected level with entries renders rank, username, score, time, moves and
  submitted date.
- Presentation/UI: selected level with empty entries shows the empty state.
- Framework/ViewModel: selecting a PUBLISHED or ARCHIVED level triggers the read query and keeps
  the UI read-only.
- Presentation/UI: backend errors are visible and do not remove the selector.

Architecture acceptance criteria:

- Given leaderboard data crosses layer boundaries, When DTOs are inspected, Then they are plain
  records with primitives/strings and no domain entities.
- Given leaderboard viewing is read-only, When the UI renders, Then no submit/edit/delete actions
  are present.
- Given archived levels have preserved scores, When an ARCHIVED level is selected, Then the same
  `GET /leaderboard/:levelId` read path is used and entries or empty state are displayed.

## Edge cases

- No level selected yet: render neutral copy, not an error.
- Level list loading: selector/section shows loading state.
- Selected known level has no leaderboard: show `entries: []` empty state.
- Selected archived level has entries: show them normally with archived-status context.
- Backend returns 404/NOT_FOUND or network error: show the error and keep level selection usable.
- Entries may have missing optional `leaderboardId`/`updatedAt` when empty; table must not depend on
  those optional fields.
- Time/date formatting must be presentation-only and deterministic in tests.

## Acceptance criteria (Given/When/Then)

- S1: Given the admin opens the Leaderboard section, When levels are loaded, Then the selector shows
  known levels with their status, including ARCHIVED levels.
- S2: Given a level with leaderboard entries is selected, When `GET /leaderboard/:levelId` succeeds,
  Then the table shows rank, username, score, time, moves and submitted date for each entry.
- S3: Given a known level has no leaderboard entries, When its leaderboard is requested, Then the
  section shows an empty-state message instead of entry rows.
- S4: Given an ARCHIVED level is selected, When its leaderboard is requested, Then the same read path
  is used and the archived level's entries or empty state are shown.
- S5: Given the backend returns an error, When the leaderboard request fails, Then the backend error
  message is displayed and the level selector remains usable.
- S6: Given leaderboard entries are displayed, When the admin inspects the table, Then no edit,
  delete or submit-score action is available.
- S7: Given no level is selected yet, When the section renders, Then it prompts the admin to choose a
  level without calling the leaderboard endpoint.

## Decisions

- Use the existing `GET /leaderboard/:levelId` endpoint instead of adding `/admin/leaderboard`.
  Reason: MAZ-200 explicitly keeps the public leaderboard read valid for archived levels; a new
  endpoint would duplicate backend behavior.
- Use admin levels data for selection instead of free-form UUID input. Reason: it is safer for
  operators and is the only way to make archived levels discoverable in the admin UI.
- Keep this slice read-only. Reason: the plan decision A4 says leaderboard/users are visualization
  only; score submission belongs to the game/client flow.

## Risks / OPEN QUESTIONS

- Human approval needed: confirm the selector may reuse `GET /admin/levels` even though the original
  AD-08 dependency list only names AD-02. This is consistent with the current admin codebase and
  needed to expose archived levels cleanly.
