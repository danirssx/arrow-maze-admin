import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import { AdminLevelsRoute } from "@/framework/level/AdminLevelsRoute";
import { SessionContext, type SessionContextValue } from "@/framework/session/SessionContext";

const adminSession: AuthSession = {
  userId: "u1",
  username: "admin",
  role: "ADMIN",
  accessToken: "a",
  refreshToken: "r",
};

/** Fake transport: serves one level whose status flips to PUBLISHED after a publish POST. */
function makeFakeHttp() {
  const state = { published: false, posts: [] as string[] };
  const get = vi.fn(async () => ({
    status: 200,
    data: {
      status: "success",
      data: {
        levels: [
          {
            levelId: "l1",
            name: "Alpha",
            difficulty: "EASY",
            status: state.published ? "PUBLISHED" : "DRAFT",
            arrowCount: 3,
            attempts: 5,
            createdAt: "2026-07-02T10:00:00.000Z",
          },
        ],
      },
    },
  }));
  const post = vi.fn(async (url: string) => {
    state.posts.push(url);
    state.published = true;
    return { status: 200, data: { status: "success", data: { levelId: "l1" } } };
  });
  const http = { get, post, put: vi.fn(), delete: vi.fn() } as unknown as IHttpClient;
  return { http, get, post, state };
}

function renderRoute(http: IHttpClient) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
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
        <AdminLevelsRoute />
      </SessionContext.Provider>
    </QueryClientProvider>,
  );
}

describe("AdminLevelsRoute", () => {
  it("lists levels from the admin endpoint", async () => {
    const { http } = makeFakeHttp();
    renderRoute(http);
    expect(await screen.findByText("Alpha")).toBeInTheDocument();
    expect(screen.getByTestId("level-status-l1")).toHaveTextContent("DRAFT");
  });

  it("publishes a draft and reflects the refreshed status", async () => {
    const { http, state } = makeFakeHttp();
    renderRoute(http);

    await userEvent.click(await screen.findByTestId("publish-l1"));

    await waitFor(() => expect(state.posts).toContain("/levels/l1/publish"));
    await waitFor(() => expect(screen.getByTestId("level-status-l1")).toHaveTextContent("PUBLISHED"));
  });
});
