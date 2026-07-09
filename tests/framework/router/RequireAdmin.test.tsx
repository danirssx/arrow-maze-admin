import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import type { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";
import type { IHttpClient } from "@/application/ports/IHttpClient";
import { SessionContext, type SessionContextValue } from "@/framework/session/SessionContext";
import { RequireAdmin } from "@/framework/router/RequireAdmin";

function renderWithSession(session: AuthSession | null) {
  const value: SessionContextValue = {
    session,
    signIn: vi.fn(),
    signOut: vi.fn(),
    loginUseCase: {} as unknown as LoginUseCase,
    httpClient: {} as unknown as IHttpClient,
  };
  return render(
    <SessionContext.Provider value={value}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAdmin>
                <div>secret dashboard</div>
              </RequireAdmin>
            }
          />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>
    </SessionContext.Provider>,
  );
}

function session(role: AuthSession["role"]): AuthSession {
  return { userId: "u1", username: "admin", role, accessToken: "a", refreshToken: "r" };
}

describe("RequireAdmin", () => {
  it("renders the protected content for an ADMIN session", () => {
    renderWithSession(session("ADMIN"));
    expect(screen.getByText("secret dashboard")).toBeInTheDocument();
  });

  it("redirects to /login when there is no session", () => {
    renderWithSession(null);
    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("redirects to /login for a non-admin session", () => {
    renderWithSession(session("USER"));
    expect(screen.getByText("login page")).toBeInTheDocument();
  });
});
