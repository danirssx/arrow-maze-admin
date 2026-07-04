import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import { AdminLevelEditorRoute } from "@/framework/level/AdminLevelEditorRoute";
import { SessionContext, type SessionContextValue } from "@/framework/session/SessionContext";

const adminSession: AuthSession = {
  userId: "u1",
  username: "admin",
  role: "ADMIN",
  accessToken: "a",
  refreshToken: "r",
};

function makeHttp() {
  const posts: { url: string; body: unknown }[] = [];
  const post = vi.fn(async (url: string, body?: unknown) => {
    posts.push({ url, body });
    return { status: 200, data: { status: "success", data: { levelId: "new-1" } } };
  });
  const http = { get: vi.fn(), post, put: vi.fn(), delete: vi.fn() } as unknown as IHttpClient;
  return { http, posts };
}

function renderEditor(http: IHttpClient) {
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
        <MemoryRouter initialEntries={["/levels/new/visual"]}>
          <Routes>
            <Route path="/levels/new/visual" element={<AdminLevelEditorRoute />} />
            <Route path="/levels" element={<div>Levels list</div>} />
          </Routes>
        </MemoryRouter>
      </SessionContext.Provider>
    </QueryClientProvider>,
  );
}

describe("AdminLevelEditorRoute", () => {
  it("builds a level visually, then creates + publishes it and returns to the list", async () => {
    const { http, posts } = makeHttp();
    renderEditor(http);

    await userEvent.click(screen.getByTestId("figure-SQUARE"));
    await userEvent.click(screen.getByTestId("cell-0-0"));
    await userEvent.click(screen.getByTestId("cell-0-1"));
    await userEvent.click(screen.getByTestId("dir-RIGHT"));
    await userEvent.click(screen.getByTestId("add-arrow"));
    await userEvent.type(screen.getByTestId("name-input"), "Visual Level");

    await userEvent.click(screen.getByTestId("publish-level"));

    await waitFor(() => {
      expect(posts.map((p) => p.url)).toEqual(["/levels", "/levels/new-1/publish"]);
    });
    // the created level carries the visually-authored shape
    expect(posts[0]!.body).toMatchObject({
      name: "Visual Level",
      boardShape: { type: "CELL_MASK" },
      arrows: [{ direction: "RIGHT" }],
    });
    expect(await screen.findByText("Levels list")).toBeInTheDocument();
  });
});
