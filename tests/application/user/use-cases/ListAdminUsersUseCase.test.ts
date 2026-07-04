import { describe, expect, it, vi } from "vitest";
import type { AdminUsersPage } from "@/application/user/AdminUser";
import type { IAdminUserApi } from "@/application/ports/IAdminUserApi";
import { ListAdminUsersUseCase } from "@/application/user/use-cases/ListAdminUsersUseCase";

const pageResult: AdminUsersPage = {
  users: [
    { userId: "u1", email: "a@b.com", username: "admin", role: "ADMIN", status: "ACTIVE", createdAt: "2026-07-01T00:00:00.000Z" },
  ],
  page: 2,
  limit: 20,
  total: 42,
};

describe("ListAdminUsersUseCase", () => {
  it("delegates the requested page/limit to the api and returns the page", async () => {
    const api: IAdminUserApi = { list: vi.fn(async () => pageResult) };

    const result = await new ListAdminUsersUseCase(api).execute(2, 20);

    expect(api.list).toHaveBeenCalledWith(2, 20);
    expect(result).toBe(pageResult);
  });

  it("never surfaces a passwordHash on the returned users", async () => {
    const api: IAdminUserApi = { list: vi.fn(async () => pageResult) };

    const result = await new ListAdminUsersUseCase(api).execute(1, 20);

    expect(result.users[0]).not.toHaveProperty("passwordHash");
  });
});
