import { describe, expect, it, vi } from "vitest";
import type { HttpResponse, IHttpClient } from "@/application/ports/IHttpClient";
import { HttpAuthApi } from "@/infrastructure/auth/HttpAuthApi";

function makeHttp(response: HttpResponse): { http: IHttpClient; post: ReturnType<typeof vi.fn> } {
  const post = vi.fn(async () => response);
  const http = { get: vi.fn(), post, put: vi.fn(), delete: vi.fn() } as unknown as IHttpClient;
  return { http, post };
}

describe("HttpAuthApi", () => {
  it("maps the login envelope into an AuthSession", async () => {
    const { http, post } = makeHttp({
      status: 200,
      data: {
        status: "success",
        data: {
          accessToken: "a",
          refreshToken: "r",
          userId: "u1",
          username: "admin",
          role: "ADMIN",
        },
      },
    });
    const api = new HttpAuthApi(http);

    const session = await api.login({ email: "a@b.com", rawPassword: "pw" });

    expect(post).toHaveBeenCalledWith("/auth/login", { email: "a@b.com", rawPassword: "pw" });
    expect(session).toEqual({
      userId: "u1",
      username: "admin",
      role: "ADMIN",
      accessToken: "a",
      refreshToken: "r",
    });
  });

  it("maps the refresh envelope into rotated tokens", async () => {
    const { http, post } = makeHttp({
      status: 200,
      data: { status: "success", data: { accessToken: "a2", refreshToken: "r2" } },
    });

    const tokens = await new HttpAuthApi(http).refresh("r1");

    expect(post).toHaveBeenCalledWith("/auth/refresh", { refreshToken: "r1" });
    expect(tokens).toEqual({ accessToken: "a2", refreshToken: "r2" });
  });

  it("posts the refresh token on logout", async () => {
    const { http, post } = makeHttp({ status: 200, data: null });

    await new HttpAuthApi(http).logout("r1");

    expect(post).toHaveBeenCalledWith("/auth/logout", { refreshToken: "r1" });
  });
});
