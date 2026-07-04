import type { AdminUsersPage } from "@/application/user/AdminUser";
import type { IAdminUserApi } from "@/application/ports/IAdminUserApi";

/** Lists platform users for a given page/limit (read-only; no user mutation is offered). */
export class ListAdminUsersUseCase {
  constructor(private readonly api: IAdminUserApi) {}

  async execute(page: number, limit: number): Promise<AdminUsersPage> {
    return this.api.list(page, limit);
  }
}
