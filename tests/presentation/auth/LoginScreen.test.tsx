import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";
import type { IAuthApi } from "@/application/ports/IAuthApi";
import { LoginScreen } from "@/presentation/auth/LoginScreen";
import { LoginViewModel } from "@/presentation/auth/LoginViewModel";

function useCaseReturning(role: AuthSession["role"]): LoginUseCase {
  const authApi: IAuthApi = {
    login: vi.fn(async () => ({ userId: "u1", username: "admin", role, accessToken: "a", refreshToken: "r" })),
    refresh: vi.fn(),
    logout: vi.fn(),
  };
  return new LoginUseCase(authApi);
}

describe("LoginScreen", () => {
  it("submits credentials and authenticates an admin", async () => {
    const onAuthenticated = vi.fn();
    const vm = new LoginViewModel(useCaseReturning("ADMIN"), onAuthenticated);
    render(<LoginScreen viewModel={vm} />);

    await userEvent.type(screen.getByTestId("login-email"), "a@b.com");
    await userEvent.type(screen.getByTestId("login-password"), "pw");
    await userEvent.click(screen.getByTestId("login-submit"));

    expect(onAuthenticated).toHaveBeenCalledTimes(1);
  });

  it("shows an error message for a non-admin login", async () => {
    const vm = new LoginViewModel(useCaseReturning("USER"), vi.fn());
    render(<LoginScreen viewModel={vm} />);

    await userEvent.type(screen.getByTestId("login-email"), "a@b.com");
    await userEvent.type(screen.getByTestId("login-password"), "pw");
    await userEvent.click(screen.getByTestId("login-submit"));

    expect(await screen.findByTestId("login-error")).toHaveTextContent("not an administrator");
  });
});
