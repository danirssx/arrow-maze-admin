import type { UserRole } from "./UserRole";

/**
 * Domain rule for admin authorization: only the ADMIN role may access the admin
 * dashboard. Pure — no HTTP, storage, or React.
 */
export function isAdminRole(role: UserRole): boolean {
  return role === "ADMIN";
}
