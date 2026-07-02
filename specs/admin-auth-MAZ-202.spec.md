# Spec — Admin auth: login + session + ADMIN gate + refresh-on-401 (Web)

Date: 2026-07-02
Ticket: `MAZ-202` (plan id `AD-01`)
Source: `../Vertiente1-AdminDashboard-Tickets.md` (M11 — Admin Dashboard)
Status: Backlog. The `@s` scenarios in `specs/admin-auth-MAZ-202.feature` are the
executable contract. Depends on `MAZ-201` (scaffold — stacked) and, at runtime, BE-04
(CORS) + BE-05 (admin seed).

## Purpose

Let an administrator sign into the admin dashboard: log in via `POST /auth/login`, persist
the access + refresh tokens, gate protected routes to role `ADMIN` (deny `USER`), refresh
the access token on a 401 and retry once (mirroring client MAZ-187), and log out. Also
establish the shared **design system** (client palette tokens + the **Outfit** font) so
the admin looks consistent with the mobile client.

## In scope / Out of scope

- In scope: the auth vertical (domain role policy, application use cases + ports, fetch
  HTTP client with refresh-retry, session storage, login MVVM, session context + ADMIN
  route guard, wiring) + the Tailwind palette + Outfit font.
- Out of scope: level/leaderboard/user features (AD-03+); registration (admins are seeded,
  BE-05/A6).

## Behavior

- **Login:** `LoginScreen` collects email + password; `LoginViewModel.submit()` calls
  `LoginUseCase` → `IAuthApi.login` (`POST /auth/login` `{ email, rawPassword }`) →
  `AuthSession { userId, username, role, accessToken, refreshToken }`. If the role is
  `ADMIN` the session is persisted and the app navigates to the dashboard; if not, the
  session is **not** persisted and a "not an administrator" message is shown.
- **Refresh-on-401:** the HTTP client injects `Authorization: Bearer <access>` on authed
  requests; on a 401 for a request that carried an `Authorization` header it calls
  `tryRefresh` once (`POST /auth/refresh`), retries with the new token, and if refresh
  fails it invalidates the session (→ back to login). Anonymous 401s and `/auth/refresh`
  itself never loop.
- **Logout:** best-effort `POST /auth/logout`, then the local session is cleared.
- **Guard:** protected routes render only for a persisted ADMIN session; otherwise they
  redirect to `/login`.

## HTTP contract (consumed)

- `POST /auth/login` `{ email, rawPassword }` → `{ accessToken, refreshToken, userId, username, role }`.
- `POST /auth/refresh` `{ refreshToken }` → `{ accessToken, refreshToken }`.
- `POST /auth/logout` `{ refreshToken }` → 200.

## Clean Architecture contract

Applicable rules from `docs/reglas_clean_arch.md`:

- [x] Dependency rule inward only (ESLint `import/no-restricted-paths`).
- [x] Domain independence (role policy is pure; no React/HTTP/storage).
- [x] Application depends on ports (`IAuthApi`, `ISessionStorage`, `IHttpClient`), never
      infrastructure/framework.
- [x] Presentation is MVVM and consumes application DTOs, not domain types. The ADMIN
      decision reaches the VM as `LoginUseCase`'s `isAdmin` boolean (application computes
      it via the domain policy), so presentation never imports `domain`.
- [x] Composition root in `src/framework`.
- [x] Domain/application errors carry no HTTP semantics; HTTP status → error mapping lives
      in the infrastructure HTTP client.

Layer impact:

- Domain: `UserRole`, `AdminAccessPolicy.isAdminRole`.
- Application: `AuthSession` type; ports `IHttpClient`, `IAuthApi`, `ISessionStorage`;
  use cases `LoginUseCase` (returns `{ session, isAdmin }`, persists only admin),
  `LogoutUseCase`, `RefreshSessionUseCase`.
- Infrastructure: `FetchHttpClient` (Bearer + refresh-retry-on-401, `HttpError`),
  `HttpAuthApi` (+ DTO mapper), `LocalSessionStorage`.
- Presentation: `LoginViewModel` (+ `LoginUiState`), dumb `LoginScreen`.
- Framework: `SessionProvider`/`useSession`, `RequireAdmin` guard, composition container,
  router (`/login` public + protected under the guard); `main.tsx` imports the Outfit
  font; Tailwind palette + `fontFamily.sans = Outfit`.

Forbidden moves (must stay unchecked): domain importing outward layers; application
importing infrastructure/framework; React/UI libs in domain/application; presentation
importing `domain`; business rules in views/router; secrets in code.

Required tests: domain policy; `LoginUseCase`/`LogoutUseCase`/`RefreshSessionUseCase`;
`FetchHttpClient` 401 refresh-retry; `LoginViewModel`; `LoginScreen` + `RequireAdmin`
(RTL).

Architecture acceptance criteria: imports point inward only; presentation holds no auth
rule beyond dispatching intents; the ADMIN gate rule lives in domain/application.

## Edge cases

- Empty email/password → submit disabled (VM), no request.
- Wrong credentials → API 401 → "invalid email or password".
- Non-admin login → no persisted session + "not an administrator".
- 401 after login (expired access) → refresh + retry; refresh fails → session cleared → login.
- No stored session on load → guard redirects to `/login`.

## Acceptance criteria (Given/When/Then)

- S1: Given valid ADMIN credentials, When the admin submits login, Then the session is
  persisted and the app is authenticated (navigates to the dashboard).
- S2: Given valid USER credentials, When they submit login, Then no session is persisted
  and a "not an administrator" message is shown.
- S3: Given an authed request returns 401, When the HTTP client handles it, Then it
  refreshes the token and retries once; if refresh fails it invalidates the session.
- S4: Given a signed-in admin, When they log out, Then the local tokens are cleared.
- S5: Given no ADMIN session, When a protected route loads, Then it redirects to `/login`.

## Decisions

- **`LoginUseCase` returns `{ session, isAdmin }` and persists only admin sessions** — the
  ADMIN authorization decision stays in application/domain, so presentation never imports
  `domain` (respects the eslint zone; mirrors the client MAZ-191 seam).
- **Fetch-based HTTP client** (no axios dep) implements the same 401-refresh-retry-once
  guard as the client's Axios adapter (MAZ-187).
- **Design system:** Tailwind tokens copied from `arrow-maze-client/design/README.md`;
  **Outfit** font via `@fontsource/outfit` (self-hosted, offline-capable).

## Risks / OPEN QUESTIONS

- End-to-end login against a live backend needs BE-04 (CORS for the admin origin) + BE-05
  (a seeded ADMIN user); code + tests here use fake APIs. Runtime E2E is gated on those.
