import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAdminRole } from "@/domain/auth/AdminAccessPolicy";
import { useSession } from "@/framework/session/SessionContext";

/**
 * Route guard: renders children only for an authenticated ADMIN session; otherwise
 * redirects to /login. The admin decision uses the domain policy (single source of truth).
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session } = useSession();
  if (session === null || !isAdminRole(session.role)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
