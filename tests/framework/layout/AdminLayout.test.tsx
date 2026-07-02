import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import { AdminLayout } from "@/framework/layout/AdminLayout";
import { SessionContext, type SessionContextValue } from "@/framework/session/SessionContext";
import { SectionPlaceholderScreen } from "@/presentation/screens/SectionPlaceholderScreen";

const session: AuthSession = {
  userId: "u1",
  username: "admin",
  role: "ADMIN",
  accessToken: "a",
  refreshToken: "r",
};

function renderLayout(signOut = vi.fn(async () => {})) {
  const value: SessionContextValue = {
    session,
    signIn: vi.fn(),
    signOut,
    loginUseCase: {} as unknown as LoginUseCase,
    httpClient: {} as unknown as IHttpClient,
  };
  render(
    <SessionContext.Provider value={value}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/levels" replace />} />
            <Route path="levels" element={<SectionPlaceholderScreen title="Levels" />} />
            <Route path="leaderboard" element={<SectionPlaceholderScreen title="Leaderboard" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </SessionContext.Provider>,
  );
  return { signOut };
}

describe("AdminLayout", () => {
  it("renders the shell with the admin identity and the routed section via Outlet", () => {
    renderLayout();
    expect(screen.getByTestId("admin-username")).toHaveTextContent("admin");
    // index redirected to /levels
    expect(screen.getByTestId("section-title")).toHaveTextContent("Levels");
    expect(screen.getByTestId("nav-levels")).toHaveAttribute("aria-current", "page");
  });

  it("navigates between sections through the nav", async () => {
    renderLayout();
    await userEvent.click(screen.getByTestId("nav-leaderboard"));
    expect(screen.getByTestId("section-title")).toHaveTextContent("Leaderboard");
    expect(screen.getByTestId("nav-leaderboard")).toHaveAttribute("aria-current", "page");
  });

  it("signs out from the header", async () => {
    const { signOut } = renderLayout();
    await userEvent.click(screen.getByTestId("logout-button"));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
