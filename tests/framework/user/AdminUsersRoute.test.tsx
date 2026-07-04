import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import { AdminUsersRoute } from "@/framework/user/AdminUsersRoute";
import { SessionContext, type SessionContextValue } from "@/framework/session/SessionContext";

const adminSession: AuthSession = {
  userId: "u1",
  username: "admin",
  role: "ADMIN",
  accessToken: "a",
  refreshToken: "r",
};

/** Fake transport: 41 users across pages of 20; returns the requested page. */
function makeUsersHttp() {
  const calls: { page: number; limit: number }[] = [];
  const get = vi.fn(async (_url: string, config?: { params?: { page: number; limit: number } }) => {
    const page = config?.params?.page ?? 1;
    const limit = config?.params?.limit ?? 20;
    calls.push({ page, limit });
    return {
      status: 200,
      data: {
        status: "success",
        data: {
          users: [
            {
              userId: `p${page}`,
              email: `p${page}@x.com`,
              username: `user_page_${page}`,
              role: "USER",
              status: "ACTIVE",
              createdAt: "2026-07-01T10:00:00.000Z",
            },
          ],
          page,
          limit,
          total: 41,
        },
      },
    };
  });
  const http = { get, post: vi.fn(), put: vi.fn(), delete: vi.fn() } as unknown as IHttpClient;
  return { http, calls };
}

function renderRoute(http: IHttpClient) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const value: SessionContextValue = {
    session: adminSession,
    signIn: vi.fn(),
    signOut: vi.fn(),
    loginUseCase: {} as unknown as LoginUseCase,
    httpClient: http,
  };
  render(
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={value}>
        <AdminUsersRoute />
      </SessionContext.Provider>
    </QueryClientProvider>,
  );
}

describe("AdminUsersRoute", () => {
  it("loads page 1 and paginates to the next page", async () => {
    const { http, calls } = makeUsersHttp();
    renderRoute(http);

    expect(await screen.findByText("user_page_1")).toBeInTheDocument();
    expect(calls[0]).toEqual({ page: 1, limit: 20 });

    await userEvent.click(screen.getByTestId("users-next"));

    expect(await screen.findByText("user_page_2")).toBeInTheDocument();
    await waitFor(() => expect(calls).toContainEqual({ page: 2, limit: 20 }));
  });
});
