import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "@/application/auth/AuthSession";
import { LoginUseCase } from "@/application/auth/use-cases/LoginUseCase";
import type { IAuthApi } from "@/application/ports/IAuthApi";
import {
  INVALID_CREDENTIALS_MESSAGE,
  LoginViewModel,
  NON_ADMIN_MESSAGE,
} from "@/presentation/auth/LoginViewModel";

function session(role: AuthSession["role"]): AuthSession {
  return { userId: "u1", username: "admin", role, accessToken: "a", refreshToken: "r" };
}

function useCaseReturning(role: AuthSession["role"]): LoginUseCase {
  const authApi: IAuthApi = { login: vi.fn(async () => session(role)), refresh: vi.fn(), logout: vi.fn() };
  return new LoginUseCase(authApi);
}

function failingUseCase(): LoginUseCase {
  const authApi: IAuthApi = {
    login: vi.fn(async () => {
      throw new Error("401");
    }),
    refresh: vi.fn(),
    logout: vi.fn(),
  };
  return new LoginUseCase(authApi);
}

describe("LoginViewModel", () => {
  it("tracks field edits and clears any prior error", () => {
    const vm = new LoginViewModel(useCaseReturning("ADMIN"), vi.fn());
    vm.setEmail("a@b.com");
    vm.setPassword("pw");
    expect(vm.getState()).toMatchObject({ email: "a@b.com", password: "pw", errorMessage: null });
  });

  it("cannot submit until both fields are filled", () => {
    const vm = new LoginViewModel(useCaseReturning("ADMIN"), vi.fn());
    expect(vm.canSubmit()).toBe(false);
    vm.setEmail("a@b.com");
    expect(vm.canSubmit()).toBe(false);
    vm.setPassword("pw");
    expect(vm.canSubmit()).toBe(true);
  });

  it("authenticates on a successful admin login", async () => {
    const onAuthenticated = vi.fn();
    const vm = new LoginViewModel(useCaseReturning("ADMIN"), onAuthenticated);
    vm.setEmail("a@b.com");
    vm.setPassword("pw");

    await vm.submit();

    expect(onAuthenticated).toHaveBeenCalledWith(session("ADMIN"));
    expect(vm.getState().errorMessage).toBeNull();
  });

  it("rejects a non-admin account without authenticating", async () => {
    const onAuthenticated = vi.fn();
    const vm = new LoginViewModel(useCaseReturning("USER"), onAuthenticated);
    vm.setEmail("a@b.com");
    vm.setPassword("pw");

    await vm.submit();

    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(vm.getState()).toMatchObject({ status: "error", errorMessage: NON_ADMIN_MESSAGE });
  });

  it("surfaces a generic error when the login call fails", async () => {
    const vm = new LoginViewModel(failingUseCase(), vi.fn());
    vm.setEmail("a@b.com");
    vm.setPassword("pw");

    await vm.submit();

    expect(vm.getState()).toMatchObject({ status: "error", errorMessage: INVALID_CREDENTIALS_MESSAGE });
  });

  it("does nothing when submit is called with an incomplete form", async () => {
    const onAuthenticated = vi.fn();
    const vm = new LoginViewModel(useCaseReturning("ADMIN"), onAuthenticated);

    await vm.submit();

    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(vm.getState().status).toBe("idle");
  });
});
