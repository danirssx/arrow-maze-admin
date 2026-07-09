# Spec - AD-09 Read-only users viewer (MAZ-210)

Date: 2026-07-04
Ticket: `MAZ-210` (plan id `AD-09`)
Source: `../Vertiente1-AdminDashboard-Tickets.md` (M11 - Admin Dashboard), Linear
`MAZ-210`, backend users contract `MAZ-197`, and admin layout contract `MAZ-203`.
Status: Proposed contract. Linear is still `Backlog`; the `@s` scenarios in
`specs/admin-users-viewer-MAZ-210.feature` need human approval before TDD.

## Purpose

Add a read-only admin Users section where an authenticated admin can inspect a paginated table of
platform users from `GET /admin/users` without exposing password hashes or offering any user
mutation.

## In scope / Out of scope

- In scope: `/users` section replacement, `GET /admin/users?page&limit` read path, users table,
  pagination controls, loading/empty/error states, and explicit read-only UI behavior.
- In scope: rendering `username`, `email`, `role`, `status`, and `createdAt` from the backend
  response.
- Out of scope: editing users, suspending users, deleting users, changing roles, resetting
  passwords, adding filters/search, changing backend pagination rules, adding a new backend
  endpoint, or exposing `passwordHash` anywhere.

## Behavior

The admin `Users` section loads page 1 with the backend default page size unless the framework
view-model sets an explicit `limit`. It calls `GET /admin/users?page=<page>&limit=<limit>` through
the authenticated HTTP client from AD-01. The view renders one row per user:

- username
- email
- role
- status
- created date

The backend contract from MAZ-197 returns:

```ts
{
  status: "success";
  data: {
    users: Array<{
      userId: string;
      email: string;
      username: string;
      role: "USER" | "ADMIN";
      status: "ACTIVE" | "INACTIVE";
      createdAt: string;
    }>;
    page: number;
    limit: number;
    total: number;
  };
}
```

The UI must not render `passwordHash` even if an unexpected extra property appears in a mocked or
future backend payload. Unknown response properties are ignored by the mapper/view state.

Pagination is read-only navigation over pages. Moving to another page requests the same endpoint
with the next `page` and current `limit`; the returned pagination metadata drives disabled states
for first/previous/next controls. Empty pages show an empty state. Non-success responses show the
backend error while keeping pagination retry/navigation controls understandable.

## Architecture placement (domain -> application -> presentation; inward-only deps)

No new domain invariant is expected. This is a read model over a backend DTO. Application owns the
users read port and use case. Infrastructure adapts the backend HTTP envelope. Presentation renders
view state and dispatches pagination intents. Framework wires the authenticated client, React Query
or equivalent server-state orchestration, and the `/users` route.

## Clean Architecture contract

Applicable rules from `docs/reglas_clean_arch.md`:

- [x] Regla de dependencia (dependencies point inward only)
- [x] Application solo orquesta (no business rules, no infra/framework/presentation imports)
- [x] Repositorios: interfaz adentro (port), implementacion afuera (infrastructure)
- [x] DTOs simples en fronteras (primitives/records, no raw domain entities/types)
- [x] MVVM: View dumb, ViewModel solo presentacion, streams/view state, composition root en framework

Layer impact:

- Domain: no previsto.
- Application: add an admin-user read DTO, `IAdminUserApi` port, and `ListAdminUsersUseCase`
  delegating to the port with `{ page, limit }`.
- Infrastructure/Adapters: add `HttpAdminUserApi` over the existing authenticated `IHttpClient`;
  map the backend success envelope to the application DTO and ignore any `passwordHash` or unknown
  fields.
- Presentation (MVVM): add a dumb Users view/table that renders loading, empty, error and paginated
  states from view state; no mutation buttons.
- Framework (composition root): add users services/use hook/route wiring under `/users`; keep React
  Query, session HTTP client and dependency construction outside presentation.

Forbidden moves:

- [ ] `src/domain` importing React/router/HTTP/storage/Tailwind or any outer layer
- [ ] `src/application` importing `infrastructure`/`framework`/`presentation`
- [ ] Views/screens performing HTTP calls, composing dependencies, or deciding authorization
- [ ] ViewModels editing, suspending, deleting, changing roles, resetting passwords, or persisting users
- [ ] Rendering or storing `passwordHash` in application DTOs, view state, table columns, tests, or logs
- [ ] Adding user mutation endpoints/actions to this slice

Required tests:

- Application: `ListAdminUsersUseCase` delegates `{ page, limit }` to the port and returns plain user
  list DTOs without `passwordHash`.
- Infrastructure: `HttpAdminUserApi` maps `GET /admin/users?page&limit` success envelopes, empty
  pages, pagination metadata, backend errors, and ignores unexpected `passwordHash`.
- Presentation/UI: users with rows render username, email, role, status and created date.
- Presentation/UI: no edit/suspend/delete/change-role/reset-password action is visible.
- Framework/ViewModel: changing page requests the expected `page`/`limit` and updates pagination
  state.
- Presentation/UI: empty and backend error states are visible and recoverable.

Architecture acceptance criteria:

- Given users data crosses layer boundaries, When DTOs/view state are inspected, Then they are simple
  records with primitive values and no raw domain entities.
- Given the feature is read-only, When the UI renders any users page, Then no mutation action is
  available.
- Given an unexpected backend payload contains `passwordHash`, When the mapper/view renders rows,
  Then the property is not mapped, rendered, logged, or exposed.

## Edge cases

- First load pending: show loading state without stale rows.
- No users returned: show an empty-state message instead of an empty table body.
- Page beyond last page: show empty state with pagination metadata from the backend.
- Backend or network error: show the backend error and allow retry/navigation without signing the
  admin out unless the shared auth client reports an unrecoverable session.
- `total <= page * limit`: next-page control disabled.
- `page === 1`: previous-page control disabled.
- Date formatting is presentation-only and deterministic in tests.

## Acceptance criteria (Given/When/Then)

- S1: Given the admin opens the Users section, When `GET /admin/users` succeeds with users, Then the
  table shows username, email, role, status and created date for each row.
- S2: Given the backend response contains user records, When the UI maps and renders them, Then no
  `passwordHash` field is mapped or visible.
- S3: Given the admin moves to another page, When the page intent is dispatched, Then the section
  requests `GET /admin/users` with the new `page` and current `limit`, and renders the returned
  pagination metadata.
- S4: Given the users response is empty, When the section renders, Then an empty-state message is
  shown instead of mutation actions or blank rows.
- S5: Given the backend returns an error, When the users request fails, Then the backend error message
  is displayed and the admin can retry or navigate without the view crashing.
- S6: Given user rows are displayed, When the admin inspects the Users section, Then no edit,
  suspend, delete, role-change or password-reset action is available.
- S7: Given pagination metadata indicates the first or last available page, When controls render,
  Then previous/next controls are disabled according to that metadata.

## Decisions

- Use `GET /admin/users` directly instead of a new frontend-specific endpoint. Reason: MAZ-197
  already provides the exact read-only paginated contract; duplicating it would add no behavior.
- Keep pagination as `page/limit` only. Reason: the plan explicitly fixes simple `page/limit`
  pagination for the MVP; search/filtering is out of scope.
- Ignore unknown backend fields instead of forwarding raw DTOs to presentation. Reason: this makes
  the no-`passwordHash` rule observable at the mapper/view-state boundary and keeps the UI contract
  minimal.

## Risks / OPEN QUESTIONS

- Human approval needed before TDD: confirm this MVP should ship without search/filtering and with
  only backend-provided pagination metadata.
