import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import { AdminLevelCreatorRoute } from "@/framework/level/AdminLevelCreatorRoute";
import { SessionContext, type SessionContextValue } from "@/framework/session/SessionContext";

const adminSession: AuthSession = {
  userId: "u1",
  username: "admin",
  role: "ADMIN",
  accessToken: "a",
  refreshToken: "r",
};

const validJson = JSON.stringify({
  name: "My Level",
  description: "desc",
  difficulty: "EASY",
  arrows: [{ id: "a", color: "cyan", direction: "UP", path: [{ row: 1, col: 0 }, { row: 0, col: 0 }] }],
});

function makeCreatorHttp(opts?: { failCreateWith?: string }) {
  const posts: { url: string; body: unknown }[] = [];
  const post = vi.fn(async (url: string, body?: unknown) => {
    posts.push({ url, body });
    if (url === "/levels") {
      if (opts?.failCreateWith !== undefined) throw new Error(opts.failCreateWith);
      return { status: 201, data: { status: "success", data: { levelId: "new-1" } } };
    }
    return { status: 200, data: { status: "success", data: { levelId: "new-1" } } };
  });
  const http = { get: vi.fn(), post, put: vi.fn(), delete: vi.fn() } as unknown as IHttpClient;
  return { http, post, posts };
}

function renderCreator(http: IHttpClient) {
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
        <MemoryRouter initialEntries={["/levels/new"]}>
          <Routes>
            <Route path="/levels/new" element={<AdminLevelCreatorRoute />} />
            <Route path="/levels" element={<div>Levels list</div>} />
          </Routes>
        </MemoryRouter>
      </SessionContext.Provider>
    </QueryClientProvider>,
  );
}

describe("AdminLevelCreatorRoute", () => {
  it("creates a draft, publishes it, and returns to the levels list", async () => {
    const { http, posts } = makeCreatorHttp();
    renderCreator(http);

    fireEvent.change(screen.getByTestId("json-input"), { target: { value: validJson } });
    await userEvent.click(screen.getByTestId("submit-level"));

    await waitFor(() => {
      expect(posts.map((p) => p.url)).toEqual(["/levels", "/levels/new-1/publish"]);
    });
    expect(await screen.findByText("Levels list")).toBeInTheDocument();
  });

  it("shows the backend error and does not publish when create is rejected", async () => {
    const { http, posts } = makeCreatorHttp({ failCreateWith: "arrow path self-intersects" });
    renderCreator(http);

    fireEvent.change(screen.getByTestId("json-input"), { target: { value: validJson } });
    await userEvent.click(screen.getByTestId("submit-level"));

    expect(await screen.findByTestId("server-error")).toHaveTextContent("arrow path self-intersects");
    expect(posts.map((p) => p.url)).toEqual(["/levels"]);
  });
});
