import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import { AdminDailyChallengeRoute } from "@/framework/daily-challenge/AdminDailyChallengeRoute";
import { SessionContext, type SessionContextValue } from "@/framework/session/SessionContext";
import {
  dailyChallengeFixture,
  operationFixture,
  replacementChallengeFixture,
} from "../../application/fixtures/dailyChallengeFixtures";

const adminSession: AuthSession = {
  userId: "u1",
  username: "admin",
  role: "ADMIN",
  accessToken: "a",
  refreshToken: "r",
};

function makeHttp() {
  let dailyReads = 0;
  const get = vi.fn(async (url: string) => {
    if (url === "/daily-challenge") {
      dailyReads += 1;
      const challenge = dailyReads === 1 ? dailyChallengeFixture : replacementChallengeFixture;
      return { status: 200, data: { status: "success", data: { challenge } } };
    }
    return { status: 200, data: { status: "success", data: { operation: operationFixture } } };
  });
  const post = vi.fn(async () => ({
    status: 202,
    data: {
      status: "success",
      data: {
        operation: {
          ...operationFixture,
          status: "RUNNING",
          completedAt: null,
          challenge: null,
        },
      },
    },
  }));
  return { http: { get, post, put: vi.fn(), delete: vi.fn() } as unknown as IHttpClient, get, post };
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
        <AdminDailyChallengeRoute />
      </SessionContext.Provider>
    </QueryClientProvider>,
  );
}

describe("AdminDailyChallengeRoute", () => {
  it("should_load_iterate_poll_and_refresh_daily_challenge_when_operation_succeeds", async () => {
    const { http, get, post } = makeHttp();
    renderRoute(http);

    expect(await screen.findByText("Daily Spiral")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Iterate daily challenge" }));

    expect(post).toHaveBeenCalledWith("/admin/daily-challenge/iterations", undefined);
    expect(await screen.findByText(/CACHE_REPLACED/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Replacement Daily")).toBeInTheDocument());
    expect(get).toHaveBeenCalledWith("/admin/daily-challenge/iterations/op-1");
  });
});
