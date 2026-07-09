import { describe, expect, it, vi } from "vitest";
import type { HttpResponse, IHttpClient } from "@/application/ports/IHttpClient";
import { HttpAdminUserApi } from "@/infrastructure/user/HttpAdminUserApi";

function makeHttp(response: HttpResponse): { http: IHttpClient; get: ReturnType<typeof vi.fn> } {
  const get = vi.fn(async () => response);
  const http = { get, post: vi.fn(), put: vi.fn(), delete: vi.fn() } as unknown as IHttpClient;
  return { http, get };
}

const listResponse: HttpResponse = {
  status: 200,
  data: {
    status: "success",
    data: {
      users: [
        {
          userId: "u1",
          email: "admin@arrowmaze.test",
          username: "admin_arrow",
          role: "ADMIN",
          status: "ACTIVE",
          createdAt: "2026-07-01T10:00:00.000Z",
          // an unexpected sensitive field the mapper must drop:
          passwordHash: "$2b$12$shouldneverleak",
        },
      ],
      page: 2,
      limit: 20,
      total: 41,
    },
  },
};

describe("HttpAdminUserApi", () => {
  it("requests /admin/users with page & limit and maps the pagination metadata", async () => {
    const { http, get } = makeHttp(listResponse);

    const result = await new HttpAdminUserApi(http).list(2, 20);

    expect(get).toHaveBeenCalledWith("/admin/users", { params: { page: 2, limit: 20 } });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(20);
    expect(result.total).toBe(41);
  });

  it("maps only the read-safe user fields and drops passwordHash", async () => {
    const { http } = makeHttp(listResponse);

    const result = await new HttpAdminUserApi(http).list(2, 20);

    expect(result.users[0]).toEqual({
      userId: "u1",
      email: "admin@arrowmaze.test",
      username: "admin_arrow",
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: "2026-07-01T10:00:00.000Z",
    });
    expect(result.users[0]).not.toHaveProperty("passwordHash");
  });

  it("maps an empty page", async () => {
    const { http } = makeHttp({
      status: 200,
      data: { status: "success", data: { users: [], page: 3, limit: 20, total: 41 } },
    });

    const result = await new HttpAdminUserApi(http).list(3, 20);

    expect(result.users).toEqual([]);
    expect(result.total).toBe(41);
  });
});
