import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "@/presentation/layout/AppShell";
import { AppShellViewModel } from "@/presentation/layout/AppShellViewModel";
import { ADMIN_SECTIONS } from "@/presentation/navigation/adminSections";
import { resolveActiveSection } from "@/presentation/navigation/resolveActiveSection";
import { useSession } from "@/framework/session/SessionContext";

/**
 * Framework wiring for the authenticated shell: binds the session (identity + sign-out)
 * and the router (active section from the path, navigation, `<Outlet/>`) into the dumb
 * AppShell. Rendered only inside `RequireAdmin`.
 */
export function AdminLayout() {
  const { session, signOut } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [viewModel] = useState(() => new AppShellViewModel());
  const activeSectionId = resolveActiveSection(location.pathname, ADMIN_SECTIONS);

  return (
    <AppShell
      brandName="Arrow Maze Admin"
      username={session?.username ?? ""}
      sections={ADMIN_SECTIONS}
      activeSectionId={activeSectionId}
      onNavigate={(path) => navigate(path)}
      onLogout={() => void signOut()}
      viewModel={viewModel}
    >
      <Outlet />
    </AppShell>
  );
}
