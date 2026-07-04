import type { AdminUsersPage } from "@/application/user/AdminUser";

/** Application port for the read-only admin users endpoint. Adapter lives in infrastructure. */
export interface IAdminUserApi {
  list(page: number, limit: number): Promise<AdminUsersPage>;
}
