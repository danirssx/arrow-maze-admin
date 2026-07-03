# Spec - AD-07 Archive + recreate preserving scores (MAZ-208)

Date: 2026-07-03
Ticket: `MAZ-208` (plan id `AD-07`)
Source: `../Vertiente1-AdminDashboard-Tickets.md` (M11 - Admin Dashboard), Linear `MAZ-208`,
and dependency contracts `MAZ-204`, `MAZ-207`, `MAZ-200`.
Status: Proposed contract. Linear is still `Backlog`; the `@s` scenarios in
`specs/archive-recreate-preserve-scores-MAZ-208.feature` need human approval before TDD.

## Purpose

Make the admin archive-and-replace workflow explicit: an admin can archive a published level,
see that score history is preserved, and immediately start creating a replacement through the
existing JSON create -> publish flow. The archived level remains visible in the admin catalog,
while the public game catalog stops offering it.

## In scope / Out of scope

- In scope: admin UI copy and affordances around archiving a PUBLISHED level, replacement entry
  point that reuses `/levels/new`, post-archive refresh that keeps the ARCHIVED level visible in
  the admin list, and a clear preservation message explaining leaderboard/score history remains
  readable.
- In scope: tests proving the admin UI does not present archive as deletion and preserves the
  replacement path after a successful archive.
- Out of scope: backend archive semantics, hard deletion, score deletion, changing
  `GET /leaderboard/:levelId`, full leaderboard table UI (planned as AD-08), and changing the
  JSON create/publish behavior delivered by AD-06.

## Behavior

When a PUBLISHED level is shown in the admin levels table, the archive action must communicate
that archive is a soft state transition: the level leaves the game catalog, but historical scores
remain readable. After the archive succeeds, the admin list refreshes and still shows the level as
ARCHIVED because `GET /admin/levels` includes every status. The UI must offer a direct path to
create a replacement level using the existing `/levels/new` route.

The game catalog exclusion and score preservation are backend guarantees from MAZ-200:

- `GET /levels` lists only PUBLISHED levels, so archived levels are no longer offered to players.
- `GET /leaderboard/:levelId` remains readable for archived levels.
- Archive must not imply deletion in UI wording.

## Backend/API contract consumed

- `POST /levels/:levelId/archive` (auth + admin) archives only PUBLISHED levels.
- `GET /admin/levels?status=` returns DRAFT, PUBLISHED and ARCHIVED levels to the admin list.
- `GET /levels` excludes ARCHIVED levels.
- `GET /leaderboard/:levelId` remains readable for archived levels; AD-07 references this
  guarantee in the UI, while the full table viewer remains AD-08.
- `POST /levels` + `POST /levels/:id/publish` are reused by the existing `/levels/new` route
  from MAZ-207 to create and publish a replacement.

## Architecture placement (domain -> application -> presentation; inward-only deps)

AD-07 should be a presentation/framework workflow over already-approved application use cases.
No new domain invariant is expected: "archive preserves score history" is guaranteed by backend
state and persistence tests in MAZ-200, not by admin web domain logic.

## Clean Architecture contract

Applicable rules from `docs/reglas_clean_arch.md`:

- [x] Regla de dependencia (dependencies point inward only)
- [x] Application solo orquesta (existing use cases remain the boundary)
- [x] DTOs simples en fronteras (no raw domain entities exposed to presentation)
- [x] MVVM: View dumb, ViewModel solo presentación, streams/view state, composition root en framework

Layer impact:

- Domain: no previsto.
- Application: no new domain/application rule expected; reuse `ArchiveLevelUseCase`,
  `ListAdminLevelsUseCase`, and `CreateAndPublishLevelUseCase`. A small DTO/view-state flag is
  allowed only if it remains a simple application/presentation contract, not a business invariant.
- Infrastructure/Adapters: no previsto; reuse `HttpAdminLevelApi.archive` and existing create/publish
  API methods.
- Presentation (MVVM): update `LevelsView` or adjacent presentation component to render preservation
  copy, ARCHIVED visibility language, and a replacement action/affordance without data fetching or
  routing composition in the view.
- Framework (composition root): `AdminLevelsRoute` / `useAdminLevels` may wire navigation to
  `/levels/new` and post-archive view state; React Query remains framework-level glue.

Forbidden moves:

- [ ] `src/domain` importing React/router/HTTP/storage/Tailwind or any outer layer
- [ ] `src/application` importing `infrastructure`/`framework`/`presentation`
- [ ] Views/screens containing archive business rules, backend calls, router composition, or
  dependency composition
- [ ] ViewModels deleting scores/progress, calculating score preservation, or talking to
  infrastructure directly
- [ ] Reimplementing backend archive/public-catalog/leaderboard rules in the admin UI
- [ ] Adding a full leaderboard viewer under AD-07 scope

Required tests:

- Presentation/UI: PUBLISHED rows show archive wording that archive preserves score history and
  removes the level from the game catalog.
- Framework/ViewModel: successful archive refreshes the admin levels query and exposes a replacement
  path to `/levels/new`.
- Presentation/UI: ARCHIVED rows remain visible in the admin table and do not offer archive again.
- Presentation/UI: backend archive errors remain visible and do not display success/replacement copy.

Architecture acceptance criteria:

- Given AD-07 touches presentation/framework, When imports are inspected, Then dependencies still
  point inward and presentation does not import infrastructure/framework/domain.
- Given archive preservation is a backend invariant, When admin code is inspected, Then it only
  communicates the guarantee and does not delete, fetch, or mutate score history.
- Given replacement reuses AD-06, When the replacement action is triggered, Then it navigates to the
  existing `/levels/new` route instead of duplicating create/publish logic in the levels table.

## Edge cases

- Archive succeeds while the current status filter is `PUBLISHED`: the archived level may disappear
  from that filtered view, but the UI must still make the replacement path clear.
- Archive succeeds under `ALL`: the row remains visible as ARCHIVED after refresh.
- Archive fails with a backend business error: the error is shown and no preservation-success or
  replacement-success state is implied.
- ARCHIVED levels must not offer archive again.
- The full leaderboard table may not exist yet; the UI copy must avoid claiming AD-08 is implemented
  while still stating the backend guarantee that score history remains readable.

## Acceptance criteria (Given/When/Then)

- S1: Given a PUBLISHED level in the admin table, When the row renders, Then the archive action
  communicates that archiving hides the level from the game catalog but preserves leaderboard/score
  history.
- S2: Given a PUBLISHED level is archived successfully, When the admin levels list refreshes, Then
  the workflow exposes a direct action to create a replacement through the existing level creator.
- S3: Given the admin is viewing all levels, When a level has been archived, Then the level remains
  visible in the admin table as ARCHIVED and archive is not offered again.
- S4: Given the admin is viewing published levels, When a level is archived successfully, Then the
  level is no longer shown in the published-filtered table and the UI explains this matches the game
  catalog behavior.
- S5: Given archiving fails with a backend error, When the admin archives the level, Then the
  backend error is displayed and no replacement/success message is shown.
- S6: Given the replacement action is used after archive, When navigation occurs, Then it reuses the
  existing `/levels/new` create -> publish flow.

## Decisions

- Reuse AD-03 archive action and AD-06 `/levels/new` instead of adding a new "replacement" use case.
  Reason: replacement is an operator workflow, not a new domain rule.
- Do not build the full leaderboard viewer in AD-07. Reason: AD-08 owns read-only leaderboard tables;
  AD-07 only must make score preservation explicit and avoid deletion semantics.
- Keep score preservation as a backend guarantee, not an admin web calculation. Reason: MAZ-200
  already validates archive as a soft state change and prevents score/progress history deletion.

## Risks / OPEN QUESTIONS

- Human approval needed: confirm that AD-07 may communicate leaderboard preservation without
  implementing the full AD-08 leaderboard table in this slice.
