export type AdminUserRole = "USER" | "ADMIN";
export type AdminUserStatus = "ACTIVE" | "INACTIVE";

/** A read-only admin view of a platform user. Never carries `passwordHash`. */
export interface AdminUser {
  userId: string;
  email: string;
  username: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
}

export interface AdminUsersPage {
  users: AdminUser[];
  page: number;
  limit: number;
  total: number;
}
