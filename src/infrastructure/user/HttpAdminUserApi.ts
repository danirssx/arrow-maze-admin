// Pattern: Adapter
import type { AdminUser, AdminUserRole, AdminUserStatus, AdminUsersPage } from "@/application/user/AdminUser";
import type { IAdminUserApi } from "@/application/ports/IAdminUserApi";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import type { AdminUserDto, AdminUsersListData, ApiEnvelope } from "./AdminUserDtos";

/** Adapts the backend `GET /admin/users` read endpoint to the `IAdminUserApi` port. */
export class HttpAdminUserApi implements IAdminUserApi {
  constructor(private readonly http: IHttpClient) {}

  async list(page: number, limit: number): Promise<AdminUsersPage> {
    const res = await this.http.get<ApiEnvelope<AdminUsersListData>>("/admin/users", {
      params: { page, limit },
    });
    const data = res.data.data;
    return {
      users: data.users.map(HttpAdminUserApi.toUser),
      page: data.page,
      limit: data.limit,
      total: data.total,
    };
  }

  /** Maps only the read-safe fields — `passwordHash` and any unknown field is never carried. */
  private static toUser(dto: AdminUserDto): AdminUser {
    return {
      userId: dto.userId,
      email: dto.email,
      username: dto.username,
      role: dto.role as AdminUserRole,
      status: dto.status as AdminUserStatus,
      createdAt: dto.createdAt,
    };
  }
}
