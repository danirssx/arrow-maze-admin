# Spec — AD-02 Authenticated layout + protected navigation (MAZ-203)

## Problem

After AD-01 an admin can sign in, but there is no application shell: no persistent
navigation between the three dashboard sections (Levels, Leaderboard, Users), no visible
admin identity, and no header logout. The protected area needs a layout that wraps the
section routes and is only reachable by an authenticated admin.

## Scope

- A presentation **AppShell** (dumb, MVVM view): brand, admin identity + logout, a nav with
  the three sections, an active-section highlight, and a responsive nav toggle. Renders
  routed section content as its children.
- A presentation **AppShellViewModel** (MVVM): owns the responsive nav open/closed state
  (the only view state the route does not own).
- A pure presentation helper **resolveActiveSection(pathname, sections)**: longest-path
  match so `/levels/123` still highlights *Levels*.
- A framework **AdminLayout**: wires session (username + `signOut`), router
  (`useLocation` → active section, `useNavigate`, `<Outlet/>`) into the AppShell.
- Nested protected routes: `/` → `RequireAdmin` → `AdminLayout` with children
  `index → /levels`, `/levels`, `/leaderboard`, `/users` (placeholder screens that AD-03 /
  AD-08 / AD-09 replace). The old single dashboard route is removed.

## Clean Architecture contract

| Layer | Impact |
| --- | --- |
| domain | none |
| application | none |
| infrastructure | none |
| presentation | `navigation/adminSections.ts` (data), `navigation/resolveActiveSection.ts` (pure), `layout/AppShellUiState.ts` + `layout/AppShellViewModel.ts` (MVVM), `layout/AppShell.tsx` (dumb view), `screens/SectionPlaceholderScreen.tsx`; **remove** `screens/DashboardScreen.tsx` |
| framework | `layout/AdminLayout.tsx`; nested routes in `router/AppRouter.tsx` (remove `DashboardRoute`) |

**Forbidden moves:** no business rules in the layout/view; presentation must not import
domain (nav config + active resolution are UI concerns); router/navigation stays in
framework + presentation only (never domain/application); no new top-level folders.

**Architectural acceptance (judge gate):** dependency rule inward-only (eslint
`import/no-restricted-paths` green); AppShell holds no auth/business logic (identity +
callbacks are props); active-section is a pure function; `npm run verify` green.

**Mutation:** no domain/application change → mutation gate **N/A** for this ticket
(precedent: MAZ-198 framework-only). `npm run mutation` still run and stays 100% on the
untouched domain/application.

## Acceptance criteria (from the ticket)

- Navigation between sections; unauthenticated → login.
- Admin brand + logout button.
