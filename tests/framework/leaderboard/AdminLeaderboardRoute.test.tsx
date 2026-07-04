import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import { AdminLeaderboardRoute } from "@/framework/leaderboard/AdminLeaderboardRoute";
import { SessionContext, type SessionContextValue } from "@/framework/session/SessionContext";

const adminSession: AuthSession = {
  userId: "u1",
  username: "admin",
  role: "ADMIN",
  accessToken: "a",
  refreshToken: "r",
};

/** Fake transport: serves the admin levels selector + a leaderboard per level. */
function makeHttp() {
  const get = vi.fn(async (url: string) => {
    if (url === "/admin/levels") {
      return {
        status: 200,
        data: {
          status: "success",
          data: {
            levels: [
              { levelId: "l1", name: "Alpha", difficulty: "EASY", status: "PUBLISHED", arrowCount: 3, attempts: 5, createdAt: "2026-07-01T10:00:00.000Z" },
              { levelId: "l2", name: "Beta", difficulty: "HARD", status: "ARCHIVED", arrowCount: 5, attempts: 3, createdAt: "2026-07-01T10:00:00.000Z" },
            ],
          },
        },
      };
    }
    // /leaderboard/:id
    const levelId = url.split("/").pop() as string;
    return {
      status: 200,
      data: {
        status: "success",
        data: {
          levelId,
          entries: [
            { entryId: `e-${levelId}`, userId: "u1", usernameSnapshot: `player_${levelId}`, score: 900, timeSeconds: 12, movesCount: 8, rank: 1, submittedAt: "2026-07-01T10:00:00.000Z" },
          ],
        },
      },
    };
  });
  const http = { get, post: vi.fn(), put: vi.fn(), delete: vi.fn() } as unknown as IHttpClient;
  return { http, get };
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
        <AdminLeaderboardRoute />
      </SessionContext.Provider>
    </QueryClientProvider>,
  );
}

describe("AdminLeaderboardRoute", () => {
  it("loads the level selector and shows the leaderboard for a selected ARCHIVED level", async () => {
    const { http } = makeHttp();
    renderRoute(http);

    // selector populated (incl. archived), nothing fetched yet
    expect(await screen.findByText("Beta (ARCHIVED)")).toBeInTheDocument();
    expect(screen.getByTestId("leaderboard-neutral")).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByTestId("leaderboard-level-select"), "l2");

    expect(await screen.findByText("player_l2")).toBeInTheDocument();
  });
});
